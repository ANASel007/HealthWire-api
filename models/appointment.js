const db = require('../config/db');

/**
 * Appointment model with database operations
 */
const Appointment = {
    /**
     * Find all appointments
     * @param {Function} callback - Callback function (err, appointments)
     */
    findAll(callback) {
        const sql = `
            SELECT r.id_rdv, r.status, r.date, r.description_rdv,
                   r.id_doc, d.nom as doctor_name, d.specialite,
                   r.id_clt, c.nom as client_name
            FROM rendez_vous r
                     JOIN doctors d ON r.id_doc = d.id_doc
                     JOIN clients c ON r.id_clt = c.id_clt
        `;
        db.all(sql, [], callback);
    },

    /**
     * Find appointment by ID
     * @param {Number} id - Appointment ID
     * @param {Function} callback - Callback function (err, appointment)
     */
    findById(id, callback) {
        const sql = `
            SELECT r.id_rdv, r.status, r.date, r.description_rdv,
                   r.id_doc, d.nom as doctor_name, d.specialite,
                   r.id_clt, c.nom as client_name
            FROM rendez_vous r
                     JOIN doctors d ON r.id_doc = d.id_doc
                     JOIN clients c ON r.id_clt = c.id_clt
            WHERE r.id_rdv = ?
        `;
        db.get(sql, [id], callback);
    },

    /**
     * Find appointments by doctor ID
     * @param {Number} id - Doctor ID
     * @param {Function} callback - Callback function (err, appointments)
     */
    findByDoctorId(id, callback) {
        const sql = `
            SELECT r.id_rdv, r.status, r.date, r.description_rdv,
                   r.id_doc, d.nom as doctor_name, d.specialite,
                   r.id_clt, c.nom as client_name
            FROM rendez_vous r
                     JOIN doctors d ON r.id_doc = d.id_doc
                     JOIN clients c ON r.id_clt = c.id_clt
            WHERE r.id_doc = ?
        `;
        db.all(sql, [id], callback);
    },

    /**
     * Find appointments by client ID
     * @param {Number} id - Client ID
     * @param {Function} callback - Callback function (err, appointments)
     */
    findByClientId(id, callback) {
        const sql = `
            SELECT r.id_rdv, r.status, r.date, r.description_rdv,
                   r.id_doc, d.nom as doctor_name, d.specialite,
                   r.id_clt, c.nom as client_name
            FROM rendez_vous r
                     JOIN doctors d ON r.id_doc = d.id_doc
                     JOIN clients c ON r.id_clt = c.id_clt
            WHERE r.id_clt = ?
        `;
        db.all(sql, [id], callback);
    },

    /**
     * Find appointments by doctor ID and date
     * @param {Number} doctorId - Doctor ID
     * @param {String} date - Date string (YYYY-MM-DD)
     * @param {Function} callback - Callback function (err, appointments)
     */
    findByDoctorAndDate(doctorId, date, callback) {
        // Create date range for the specified day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const sql = `
      SELECT r.id_rdv, r.status, r.date, r.description_rdv, 
             r.id_doc, d.nom as doctor_name, d.specialite,
             r.id_clt, c.nom as client_name
      FROM rendez_vous r
      JOIN doctors d ON r.id_doc = d.id_doc
      JOIN clients c ON r.id_clt = c.id_clt
      WHERE r.id_doc = ? AND r.date BETWEEN ? AND ?
    `;

        db.all(sql, [
            doctorId,
            startDate.toISOString(),
            endDate.toISOString()
        ], callback);
    },

    /**
     * Create a new appointment
     * @param {Object} appointment - Appointment object
     * @param {Function} callback - Callback function (err, result)
     */
    create(appointment, callback) {
        const sql = `
            INSERT INTO rendez_vous (status, date, description_rdv, id_doc, id_clt)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(
            sql,
            [
                appointment.status || 'pending',
                appointment.date,
                appointment.description_rdv,
                appointment.id_doc,
                appointment.id_clt
            ],
            function(err) {
                if (err) return callback(err);

                // Get the created appointment to return with all details
                Appointment.findById(this.lastID, (err, newAppointment) => {
                    if (err) return callback(err);
                    callback(null, newAppointment);
                });
            }
        );
    },

    /**
     * Update an appointment
     * @param {Number} id - Appointment ID
     * @param {Object} appointment - Appointment data to update
     * @param {Function} callback - Callback function (err, result)
     */
    update(id, appointment, callback) {
        const sql = `
      UPDATE rendez_vous 
      SET status = ?, date = ?, description_rdv = ?
      WHERE id_rdv = ?
    `;

        db.run(
            sql,
            [
                appointment.status,
                appointment.date,
                appointment.description_rdv,
                id
            ],
            function(err) {
                if (err) return callback(err);
                callback(null, { changes: this.changes });
            }
        );
    },

    /**
     * Update appointment status
     * @param {Number} id - Appointment ID
     * @param {String} status - New status
     * @param {Function} callback - Callback function (err, result)
     */
    updateStatus(id, status, callback) {
        const sql = 'UPDATE rendez_vous SET status = ? WHERE id_rdv = ?';
        db.run(sql, [status, id], function(err) {
            if (err) return callback(err);
            callback(null, { changes: this.changes });
        });
    },

    /**
     * Delete an appointment
     * @param {Number} id - Appointment ID
     * @param {Function} callback - Callback function (err, result)
     */
    delete(id, callback) {
        const sql = 'DELETE FROM rendez_vous WHERE id_rdv = ?';
        db.run(sql, [id], function(err) {
            if (err) return callback(err);
            callback(null, { changes: this.changes });
        });
    }
};

module.exports = Appointment;