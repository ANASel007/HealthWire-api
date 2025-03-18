const db = require('../config/db');

/**
 * Message model with database operations
 */
const Message = {
    /**
     * Find all messages in a conversation between a doctor and client
     * @param {Number} doctorId - Doctor ID
     * @param {Number} clientId - Client ID
     * @param {Function} callback - Callback function (err, messages)
     */
    findConversation(doctorId, clientId, callback) {
        const sql = `
      SELECT m.*, 
             d.nom as doctor_name, 
             c.nom as client_name
      FROM messages m
      JOIN doctors d ON m.sender_id = d.id_doc AND m.sender_type = 'doctor' OR m.receiver_id = d.id_doc AND m.receiver_type = 'doctor'
      JOIN clients c ON m.sender_id = c.id_clt AND m.sender_type = 'client' OR m.receiver_id = c.id_clt AND m.receiver_type = 'client'
      WHERE (m.sender_id = ? AND m.sender_type = 'doctor' AND m.receiver_id = ? AND m.receiver_type = 'client')
         OR (m.sender_id = ? AND m.sender_type = 'client' AND m.receiver_id = ? AND m.receiver_type = 'doctor')
      ORDER BY m.created_at ASC
    `;
        db.all(sql, [doctorId, clientId, clientId, doctorId], callback);
    },

    /**
     * Get all conversations for a doctor
     * @param {Number} doctorId - Doctor ID
     * @param {Function} callback - Callback function (err, conversations)
     */
    getDoctorConversations(doctorId, callback) {
        const sql = `
      SELECT 
        c.id_clt, 
        c.nom, 
        c.imageurl, 
        m.message_content, 
        m.created_at,
        m.is_read,
        (SELECT COUNT(*) FROM messages 
         WHERE receiver_id = ? AND receiver_type = 'doctor' AND sender_id = m.sender_id AND sender_type = 'client' AND is_read = 0) as unread_count
      FROM messages m
      JOIN clients c ON (m.sender_id = c.id_clt AND m.sender_type = 'client') OR (m.receiver_id = c.id_clt AND m.receiver_type = 'client')
      WHERE (m.sender_id = ? AND m.sender_type = 'doctor') OR (m.receiver_id = ? AND m.receiver_type = 'doctor')
      GROUP BY c.id_clt
      ORDER BY m.created_at DESC
    `;
        db.all(sql, [doctorId, doctorId, doctorId], callback);
    },

    /**
     * Get all conversations for a client
     * @param {Number} clientId - Client ID
     * @param {Function} callback - Callback function (err, conversations)
     */
    getClientConversations(clientId, callback) {
        const sql = `
      SELECT 
        d.id_doc, 
        d.nom, 
        d.specialite,
        d.imageurl, 
        m.message_content, 
        m.created_at,
        m.is_read,
        (SELECT COUNT(*) FROM messages 
         WHERE receiver_id = ? AND receiver_type = 'client' AND sender_id = m.sender_id AND sender_type = 'doctor' AND is_read = 0) as unread_count
      FROM messages m
      JOIN doctors d ON (m.sender_id = d.id_doc AND m.sender_type = 'doctor') OR (m.receiver_id = d.id_doc AND m.receiver_type = 'doctor')
      WHERE (m.sender_id = ? AND m.sender_type = 'client') OR (m.receiver_id = ? AND m.receiver_type = 'client')
      GROUP BY d.id_doc
      ORDER BY m.created_at DESC
    `;
        db.all(sql, [clientId, clientId, clientId], callback);
    },

    /**
     * Get unread message count for a user
     * @param {Number} userId - User ID
     * @param {String} userType - User type ('doctor' or 'client')
     * @param {Function} callback - Callback function (err, count)
     */
    getUnreadCount(userId, userType, callback) {
        const sql = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE receiver_id = ? AND receiver_type = ? AND is_read = 0
    `;
        db.get(sql, [userId, userType], callback);
    },

    /**
     * Create a new message
     * @param {Object} message - Message object
     * @param {Function} callback - Callback function (err, result)
     */
    create(message, callback) {
        const sql = `
      INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, message_content, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;

        db.run(
            sql,
            [
                message.sender_id,
                message.sender_type,
                message.receiver_id,
                message.receiver_type,
                message.message_content,
                0 // not read by default
            ],
            function(err) {
                if (err) return callback(err);
                callback(null, { id: this.lastID, ...message });
            }
        );
    },

    /**
     * Mark messages as read
     * @param {Number} senderId - Sender ID
     * @param {String} senderType - Sender type ('doctor' or 'client')
     * @param {Number} receiverId - Receiver ID
     * @param {String} receiverType - Receiver type ('doctor' or 'client')
     * @param {Function} callback - Callback function (err, result)
     */
    markAsRead(senderId, senderType, receiverId, receiverType, callback) {
        const sql = `
      UPDATE messages
      SET is_read = 1
      WHERE sender_id = ? AND sender_type = ? AND receiver_id = ? AND receiver_type = ?
    `;

        db.run(sql, [senderId, senderType, receiverId, receiverType], function(err) {
            if (err) return callback(err);
            callback(null, { changes: this.changes });
        });
    }
};

module.exports = Message;