const { Server }   = require('socket.io');
const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');

// Track online users:  userId (string) → Set of socket IDs
const onlineUsers = new Map();

const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

const removeOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) return;
  onlineUsers.get(userId).delete(socketId);
  if (onlineUsers.get(userId).size === 0) onlineUsers.delete(userId);
};

const isOnline = (userId) => onlineUsers.has(String(userId));

// ─── Main initialiser — call once from server.js ──────────────────────────────
const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    // Reconnection settings
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  // ── Authentication middleware ────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie;
      console.log("COOKIE:", socket.handshake.headers.cookie);

      if (!cookie) return next(new Error('No cookie found'));

      const token = cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

      if (!token) return next(new Error('Token missing'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.userId).select('fullName role profilePicture isActive');
      if (!user || !user.isActive) return next(new Error('User not found or inactive.'));

      socket.user = { userId: String(decoded.userId), role: decoded.role, fullName: user.fullName };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token.'));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { userId, role, fullName } = socket.user;
    console.log(`🔌 Socket connected: ${fullName} (${role}) [${socket.id}]`);

    // Register as online
    addOnlineUser(userId, socket.id);
    socket.join(`user:${userId}`);

    // Notify contacts that this user is now online
    socket.broadcast.emit('user:online', { userId });

    // ── JOIN a conversation room ─────────────────────────────────────────────
    socket.on('conversation:join', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return socket.emit('error', { message: 'Conversation not found.' });

        const isParticipant =
          String(conversation.organizerId) === userId ||
          String(conversation.workerId)    === userId;

        if (!isParticipant) return socket.emit('error', { message: 'Access denied.' });

        socket.join(conversationId);
        socket.emit('conversation:joined', { conversationId });

        // Send online status of the OTHER participant
        const otherId =
          String(conversation.organizerId) === userId
            ? String(conversation.workerId)
            : String(conversation.organizerId);

        socket.emit('user:status', { userId: otherId, online: isOnline(otherId) });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── LEAVE a conversation room ────────────────────────────────────────────
    socket.on('conversation:leave', ({ conversationId }) => {
      socket.leave(conversationId);
    });

    // ── SEND MESSAGE (primary real-time path) ────────────────────────────────
    socket.on('message:send', async ({ conversationId, text }) => {
      try {
        if (!text?.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return socket.emit('error', { message: 'Conversation not found.' });

        const isParticipant =
          String(conversation.organizerId) === userId ||
          String(conversation.workerId)    === userId;
        if (!isParticipant) return socket.emit('error', { message: 'Access denied.' });

        // Persist message
        const message = await Message.create({
          conversationId,
          senderId:   userId,
          senderRole: role,
          text:       text.trim(),
          readBy:     [userId],
        });

        await message.populate('senderId', 'fullName profilePicture');

        // Update conversation metadata
        const otherUnreadField =
          role === 'organizer' ? 'unreadCount.worker' : 'unreadCount.organizer';

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: { text: text.trim(), senderId: userId, sentAt: new Date() },
          $inc: { [otherUnreadField]: 1 },
        });

        const payload = message.toObject();

        // Broadcast to everyone in the room (including sender for confirmation)
        io.to(conversationId).emit('message:receive', payload);

        // If recipient is NOT in this room (app open elsewhere), push a notification
        const otherId = String(conversation.organizerId) === userId
          ? String(conversation.workerId)
          : String(conversation.organizerId);

        if (isOnline(otherId)) {
          // Emit to all sockets of the other user
          onlineUsers.get(otherId)?.forEach(sid => {
            const s = io.sockets.sockets.get(sid);
            if (s && !s.rooms.has(conversationId)) {
              s.emit('notification:message', {
                conversationId,
                senderId:     userId,
                senderName:   fullName,
                text:         text.trim(),
                sentAt:       new Date(),
              });
            }
          });
        }
      } catch (err) {
        console.error('message:send error:', err.message);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    // ── TYPING indicator ─────────────────────────────────────────────────────
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:start', { userId, fullName });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(conversationId).emit('typing:stop', { userId });
    });

    // ── MARK MESSAGES READ ───────────────────────────────────────────────────
    socket.on('messages:read', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          {
            conversationId,
            senderId: { $ne: userId },
            readBy:   { $nin: [userId] },
          },
          { $addToSet: { readBy: userId } }
        );

        const unreadField =
          role === 'organizer' ? 'unreadCount.organizer' : 'unreadCount.worker';
        await Conversation.findByIdAndUpdate(conversationId, { [unreadField]: 0 });

        // Tell the sender their messages were read
        socket.to(conversationId).emit('messages:read', { conversationId, readBy: userId });
      } catch (err) {
        console.error('messages:read error:', err.message);
      }
    });

    // ── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      removeOnlineUser(userId, socket.id);
      console.log(`❌ Socket disconnected: ${fullName} [${socket.id}]`);

      // Notify contacts if ALL sockets for this user are gone
      if (!isOnline(userId)) {
        socket.broadcast.emit('user:offline', { userId });
      }
    });
  });

  return io;
};

module.exports = { initSocket, isOnline };
