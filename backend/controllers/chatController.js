const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const Application  = require('../models/Application');
const Job          = require('../models/Job');

// ─── Helper: verify user is a participant ─────────────────────────────────────
const isParticipant = (conversation, userId) => {
  return (
    String(conversation.organizerId) === String(userId) ||
    String(conversation.workerId)    === String(userId)
  );
};

// ─── POST /api/chat/conversations — Create or return existing conversation ────
// Called automatically when application is Accepted, but can also be called from frontend.
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'applicationId is required.' });
    }

    // Load the application, verify it exists and is Accepted
    const application = await Application.findById(applicationId)
      .populate('jobId', 'title location date');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    if (!['Accepted', 'Completed'].includes(application.status)) {
      return res.status(403).json({
        success: false,
        message: 'Chat is only available for accepted applications.',
      });
    }

    // Caller must be one of the two participants
    const uid = String(req.user._id);
    if (
      String(application.organizerId) !== uid &&
      String(application.workerId)    !== uid
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Upsert — safe against race conditions
    let conversation = await Conversation.findOne({ applicationId });

    if (!conversation) {
      conversation = await Conversation.create({
        jobId:         application.jobId._id || application.jobId,
        applicationId: application._id,
        organizerId:   application.organizerId,
        workerId:      application.workerId,
      });
    }

    // Populate participants for the response
    await conversation.populate([
      { path: 'organizerId', select: 'fullName email profilePicture' },
      { path: 'workerId',    select: 'fullName email profilePicture' },
      { path: 'jobId',       select: 'title location date' },
    ]);

    return res.json({ success: true, data: { conversation } });
  } catch (error) {
    console.error('getOrCreateConversation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/chat/conversations — Get all conversations for logged-in user ───
exports.getMyConversations = async (req, res) => {
  try {
    // console.log(req);

    const uid   = req.user._id;
    const role  = req.user.role;

    const filter = role === 'organizer'
      ? { organizerId: uid }
      : { workerId: uid };

    const conversations = await Conversation.find(filter)
      .populate('organizerId', 'fullName email profilePicture')
      .populate('workerId',    'fullName email profilePicture')
      .populate('jobId',       'title location date')
      .sort({ updatedAt: -1 });

    // Attach unread count relevant to the calling user
    const enriched = conversations.map(c => ({
      ...c.toObject(),
      myUnread: role === 'organizer' ? c.unreadCount.organizer : c.unreadCount.worker,
    }));
    console.log("USER:", req.user);
    console.log("UID:", uid);

    res.json({ success: true, data: { conversations: enriched } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/chat/conversations/:id/messages — Load messages (paginated) ─────
exports.getMessages = async (req, res) => {
  try {
    console.log("2nd");
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }
    if (!isParticipant(conversation, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const page  = Math.max(1, parseInt(req.query.page  || '1'));
    const limit = Math.min(50, parseInt(req.query.limit || '50'));
    const skip  = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversationId: req.params.id, isDeleted: false })
        .populate('senderId', 'fullName profilePicture')
        .sort({ createdAt: 1 })   // oldest first for display
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversationId: req.params.id, isDeleted: false }),
    ]);

    // Mark messages as read by this user
    await Message.updateMany(
      {
        conversationId: req.params.id,
        senderId: { $ne: req.user._id },
        readBy:   { $nin: [req.user._id] },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // Reset unread counter for this user
    const role         = req.user.role;
    const unreadField  = role === 'organizer' ? 'unreadCount.organizer' : 'unreadCount.worker';
    await Conversation.findByIdAndUpdate(req.params.id, { [unreadField]: 0 });

    res.json({
      success: true,
      data: { messages, total, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/chat/conversations/:id/messages — Send a message (REST fallback)
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }
    if (!isParticipant(conversation, req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId:       req.user._id,
      senderRole:     req.user.role,
      text:           text.trim(),
      readBy:         [req.user._id],
    });

    await message.populate('senderId', 'fullName profilePicture');

    // Update conversation last message + increment other party's unread
    const otherUnreadField =
      req.user.role === 'organizer' ? 'unreadCount.worker' : 'unreadCount.organizer';

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: { text: text.trim(), senderId: req.user._id, sentAt: new Date() },
      $inc: { [otherUnreadField]: 1 },
    });

    res.status(201).json({ success: true, data: { message } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Internal helper — called by applicationController after Accept ───────────
// Not an HTTP handler; imported directly.
exports.createConversationForApplication = async (application) => {
  try {
    const existing = await Conversation.findOne({ applicationId: application._id });
    if (existing) return existing;

    return await Conversation.create({
      jobId:         application.jobId,
      applicationId: application._id,
      organizerId:   application.organizerId,
      workerId:      application.workerId,
    });
  } catch (error) {
    // Don't throw — conversation creation failure should not break the accept flow
    console.error('createConversationForApplication error:', error.message);
    return null;
  }
};