const Message = require('../models/message');
const Doctor = require('../models/doctor');
const Client = require('../models/client');

/**
 * Message controller for operations related to messaging
 */
const messageController = {
    /**
     * Get conversation between a doctor and client
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getConversation: (req, res) => {
        const { doctorId, clientId } = req.params;

        // Check authorization
        const isAuthorized =
            (req.user.role === 'doctor' && req.user.id.toString() === doctorId) ||
            (req.user.role === 'client' && req.user.id.toString() === clientId);

        if (!isAuthorized) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        // Verify both users exist
        Doctor.findById(doctorId, (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            Client.findById(clientId, (err, client) => {
                if (err) return res.status(500).json({ message: err.message });
                if (!client) return res.status(404).json({ message: 'Client not found' });

                // Get conversation
                Message.findConversation(doctorId, clientId, (err, messages) => {
                    if (err) return res.status(500).json({ message: err.message });

                    // If the requesting user is the receiver, mark messages as read
                    if (
                        (req.user.role === 'doctor' && req.user.id.toString() === doctorId) ||
                        (req.user.role === 'client' && req.user.id.toString() === clientId)
                    ) {
                        const senderId = req.user.role === 'doctor' ? clientId : doctorId;
                        const senderType = req.user.role === 'doctor' ? 'client' : 'doctor';
                        const receiverId = req.user.role === 'doctor' ? doctorId : clientId;
                        const receiverType = req.user.role === 'doctor' ? 'doctor' : 'client';

                        Message.markAsRead(senderId, senderType, receiverId, receiverType, (err) => {
                            if (err) console.error('Error marking messages as read:', err);
                        });
                    }

                    res.json(messages);
                });
            });
        });
    },

    /**
     * Get all conversations for a doctor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getDoctorConversations: (req, res) => {
        const { doctorId } = req.params;

        // Check authorization
        if (req.user.role !== 'doctor' || req.user.id.toString() !== doctorId) {
            return res.status(403).json({ message: 'Not authorized to view these conversations' });
        }

        Doctor.findById(doctorId, (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            Message.getDoctorConversations(doctorId, (err, conversations) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json(conversations);
            });
        });
    },

    /**
     * Get all conversations for a client
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getClientConversations: (req, res) => {
        const { clientId } = req.params;

        // Check authorization
        if (req.user.role !== 'client' || req.user.id.toString() !== clientId) {
            return res.status(403).json({ message: 'Not authorized to view these conversations' });
        }

        Client.findById(clientId, (err, client) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!client) return res.status(404).json({ message: 'Client not found' });

            Message.getClientConversations(clientId, (err, conversations) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json(conversations);
            });
        });
    },

    /**
     * Send a message
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    sendMessage: (req, res) => {
        const { receiverId, receiverType, messageContent } = req.body;

        if (!receiverId || !receiverType || !messageContent) {
            return res.status(400).json({
                message: 'Please provide receiverId, receiverType, and messageContent'
            });
        }

        // Validate receiver type
        if (receiverType !== 'doctor' && receiverType !== 'client') {
            return res.status(400).json({ message: 'Invalid receiver type' });
        }

        // Set sender info based on authenticated user
        const senderId = req.user.id;
        const senderType = req.user.role;

        // Check that receiver exists
        const ReceiverModel = receiverType === 'doctor' ? Doctor : Client;

        ReceiverModel.findById(receiverId, (err, receiver) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!receiver) return res.status(404).json({ message: `${receiverType} not found` });

            // Create message
            const message = {
                sender_id: senderId,
                sender_type: senderType,
                receiver_id: receiverId,
                receiver_type: receiverType,
                message_content: messageContent
            };

            Message.create(message, (err, result) => {
                if (err) return res.status(500).json({ message: err.message });

                res.status(201).json({
                    message: 'Message sent successfully',
                    data: result
                });
            });
        });
    },

    /**
     * Get unread message count
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getUnreadCount: (req, res) => {
        const userId = req.user.id;
        const userType = req.user.role;

        Message.getUnreadCount(userId, userType, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ unreadCount: result.count });
        });
    },

    /**
     * Mark messages as read
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    markMessagesAsRead: (req, res) => {
        const { senderId, senderType } = req.body;

        if (!senderId || !senderType) {
            return res.status(400).json({ message: 'Please provide senderId and senderType' });
        }

        // Validate sender type
        if (senderType !== 'doctor' && senderType !== 'client') {
            return res.status(400).json({ message: 'Invalid sender type' });
        }

        const receiverId = req.user.id;
        const receiverType = req.user.role;

        Message.markAsRead(senderId, senderType, receiverId, receiverType, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json({ message: 'Messages marked as read', count: result.changes });
        });
    }
};

module.exports = messageController;