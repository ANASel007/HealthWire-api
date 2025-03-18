const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/messages/doctor/:doctorId/client/:clientId
 * @desc    Get conversation between doctor and client
 * @access  Private (Doctor or Client involved in conversation)
 */
router.get('/doctor/:doctorId/client/:clientId', auth, messageController.getConversation);

/**
 * @route   GET /api/messages/doctor/:doctorId/conversations
 * @desc    Get all conversations for a doctor
 * @access  Private (Doctor only)
 */
router.get('/doctor/:doctorId/conversations', auth, messageController.getDoctorConversations);

/**
 * @route   GET /api/messages/client/:clientId/conversations
 * @desc    Get all conversations for a client
 * @access  Private (Client only)
 */
router.get('/client/:clientId/conversations', auth, messageController.getClientConversations);

/**
 * @route   POST /api/messages/send
 * @desc    Send a message
 * @access  Private (Auth)
 */
router.post('/send', auth, messageController.sendMessage);

/**
 * @route   GET /api/messages/unread
 * @desc    Get unread message count
 * @access  Private (Auth)
 */
router.get('/unread', auth, messageController.getUnreadCount);

/**
 * @route   PUT /api/messages/read
 * @desc    Mark messages as read
 * @access  Private (Auth)
 */
router.put('/read', auth, messageController.markMessagesAsRead);

module.exports = router;