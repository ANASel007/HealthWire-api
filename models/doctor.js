const db = require('../config/db');

/**
 * Doctor model with database operations
 */
const Doctor = {
    /**
     * Find all doctors
     * @param {Function} callback - Callback function (err, doctors)
     */
    findAll(callback) {
        const sql = `SELECT id_doc, nom, ville, email, imageurl, telephone, specialite 
                FROM doctors`;
        db.all(sql, [], callback);
    },

    /**
     * Find doctor by ID
     * @param {Number} id - Doctor ID
     * @param {Function} callback - Callback function (err, doctor)
     */
    findById(id, callback) {
        const sql = `SELECT id_doc, nom, ville, email, imageurl, telephone, specialite 
                FROM doctors 
                WHERE id_doc = ?`;
        db.get(sql, [id], callback);
    },

    /**
     * Find doctor by email
     * @param {String} email - Doctor email
     * @param {Function} callback - Callback function (err, doctor)
     */
    findByEmail(email, callback) {
        const sql = 'SELECT * FROM doctors WHERE email = ?';
        db.get(sql, [email], callback);
    },

    /**
     * Create a new doctor
     * @param {Object} doctor - Doctor object
     * @param {Function} callback - Callback function (err, result)
     */
    create(doctor, callback) {
        const sql = `INSERT INTO doctors (nom, ville, email, imageurl, telephone, specialite, password) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.run(
            sql,
            [
                doctor.nom,
                doctor.ville,
                doctor.email,
                doctor.imageurl,
                doctor.telephone,
                doctor.specialite,
                doctor.password
            ],
            function(err) {
                if (err) return callback(err);
                callback(null, { id: this.lastID, ...doctor });
            }
        );
    },

    /**
     * Update a doctor
     * @param {Number} id - Doctor ID
     * @param {Object} doctor - Doctor data to update
     * @param {Function} callback - Callback function (err, result)
     */
    update(id, doctor, callback) {
        const sql = `UPDATE doctors 
                SET nom = ?, ville = ?, email = ?, imageurl = ?, telephone = ?, specialite = ? 
                WHERE id_doc = ?`;

        db.run(
            sql,
            [
                doctor.nom,
                doctor.ville,
                doctor.email,
                doctor.imageurl,
                doctor.telephone,
                doctor.specialite,
                id
            ],
            function(err) {
                if (err) return callback(err);
                callback(null, { changes: this.changes });
            }
        );
    },

    /**
     * Delete a doctor
     * @param {Number} id - Doctor ID
     * @param {Function} callback - Callback function (err, result)
     */
    delete(id, callback) {
        const sql = 'DELETE FROM doctors WHERE id_doc = ?';
        db.run(sql, [id], function(err) {
            if (err) return callback(err);
            callback(null, { changes: this.changes });
        });
    },

    /**
     * Update doctor password
     * @param {Number} id - Doctor ID
     * @param {String} password - New password (hashed)
     * @param {Function} callback - Callback function (err, result)
     */
    updatePassword(id, password, callback) {
        const sql = 'UPDATE doctors SET password = ? WHERE id_doc = ?';
        db.run(sql, [password, id], function(err) {
            if (err) return callback(err);
            callback(null, { changes: this.changes });
        });
    }
};

module.exports = Doctor;