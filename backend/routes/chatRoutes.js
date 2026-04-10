const express    = require('express');
const router     = express.Router();
const { protect } = require('../middleware/auth');
const chatCtrl   = require('../controllers/chatController');

// All chat routes require authentication (any role)
router.use(protect);

// Get / create a conversation (pass applicationId in body)
router.post('/conversations',                          chatCtrl.getOrCreateConversation);

// List all my conversations
router.get('/conversations',                           chatCtrl.getMyConversations);

// Get paginated messages for a conversation
router.get('/conversations/:id/messages',              chatCtrl.getMessages);

// Send a message via REST (Socket.IO is the primary path; this is a fallback)
router.post('/conversations/:id/messages',             chatCtrl.sendMessage);

module.exports = router;