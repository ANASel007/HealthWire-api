const db = require('../config/db');

/**
 * Client model with database operations
 */
const Client = {
    /**
     * Find all clients
     * @param {Function} callback - Callback function (err, clients)
     */
    findAll(callback) {
        const sql = `SELECT id_clt, nom, ville, email, imageurl, telephone 
                FROM clients`;
        db.all(sql, [], callback);
    },

    /**
     * Find client by ID
     * @param {Number} id - Client ID
     * @param {Function} callback - Callback function (err, client)
     */
    findById(id, callback) {
        const sql = `SELECT id_clt, nom, ville, email, imageurl, telephone 
                FROM clients 
                WHERE id_clt = ?`;
        db.get(sql, [id], callback);
    },

    /**
     * Find client by email
     * @param {String} email - Client email
     * @param {Function} callback - Callback function (err, client)
     */
    findByEmail(email, callback) {
        const sql = 'SELECT * FROM clients WHERE email = ?';
        db.get(sql, [email], callback);
    },

    /**
     * Create a new client
     * @param {Object} client - Client object
     * @param {Function} callback - Callback function (err, result)
     */
    create(client, callback) {
        const sql = `INSERT INTO clients (nom, ville, email, imageurl, telephone, password) 
                VALUES (?, ?, ?, ?, ?, ?)`;

        db.run(
            sql,
            [
                client.nom,
                client.ville,
                client.email,
                client.imageurl,
                client.telephone,
                client.password
            ],
            function(err) {
                if (err) return callback(err);
                callback(null, { id: this.lastID, ...client });
            }
        );
    },

    /**
     * Update a client
     * @param {Number} id - Client ID
     * @param {Object} client - Client data to update
     * @param {Function} callback - Callback function (err, result)
     */
    update(id, client, callback) {
        const sql = `UPDATE clients 
                SET nom = ?, ville = ?, email = ?, imageurl = ?, telephone = ? 
                WHERE id_clt = ?`;

        db.run(
            sql,
            [
                client.nom,
                client.ville,
                client.email,
                client.imageurl,
                client.telephone,
                id
            ],
            function(err) {
                if (err) return callback(err);
                callback(null, { changes: this.changes });
            }
        );
    },

    /**
     * Delete a client
     * @param {Number} id - Client ID
     * @param {Function} callback - Callback function (err, result)
     */
    delete(id, callback) {
        const sql = 'DELETE FROM clients WHERE id_clt = ?';
        db.run(sql, [id], function(err) {
            if (err) return callback(err);
            callback(null, { changes: this.changes });
        });
    },

    /**
     * Update client password
     * @param {Number} id - Client ID
     * @param {String} password - New password (hashed)
     * @param {Function} callback - Callback function (err, result)
     */
    updatePassword(id, password, callback) {
        const sql = 'UPDATE clients SET password = ? WHERE id_clt = ?';
        db.run(sql, [password, id], function(err) {
            if (err) return callback(err);
            callback(null, { changes: this.changes });
        });
    }
};

module.exports = Client;