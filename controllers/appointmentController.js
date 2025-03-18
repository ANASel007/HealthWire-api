const Appointment = require('../models/appointment');
const Doctor = require('../models/doctor');
const Client = require('../models/client');

/**
 * Appointment controller for operations related to appointments
 */
const appointmentController = {
    /**
     * Get all appointments (admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getAllAppointments: (req, res) => {
        Appointment.findAll((err, appointments) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(appointments);
        });
    },

    /**
     * Get appointment by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getAppointmentById: (req, res) => {
        const { id } = req.params;

        Appointment.findById(id, (err, appointment) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

            // Only allow the doctor or client of this appointment to view it
            if (
                (req.user.role === 'doctor' && req.user.id !== appointment.id_doc) &&
                (req.user.role === 'client' && req.user.id !== appointment.id_clt)
            ) {
                return res.status(403).json({ message: 'Not authorized to view this appointment' });
            }

            res.json(appointment);
        });
    },

    /**
     * Create a new appointment
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    createAppointment: (req, res) => {
        const { date, description_rdv, id_doc } = req.body;

        // If creating as a client, get client ID from token
        const id_clt = req.user.role === 'client' ? req.user.id : req.body.id_clt;

        if (!date || !id_doc || !id_clt) {
            return res.status(400).json({ message: 'Please provide date, doctor ID, and client ID' });
        }

        // Check if doctor exists
        Doctor.findById(id_doc, (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            // Check if client exists
            Client.findById(id_clt, (err, client) => {
                if (err) return res.status(500).json({ message: err.message });
                if (!client) return res.status(404).json({ message: 'Client not found' });

                // Check if time slot is available
                Appointment.findByDoctorAndDate(id_doc, date, (err, existingAppointments) => {
                    if (err) return res.status(500).json({ message: err.message });

                    if (existingAppointments && existingAppointments.length > 0) {
                        return res.status(400).json({ message: 'This time slot is already booked' });
                    }

                    // Create new appointment
                    const newAppointment = {
                        status: 'pending',
                        date,
                        description_rdv,
                        id_doc,
                        id_clt
                    };

                    Appointment.create(newAppointment, (err, result) => {
                        if (err) return res.status(500).json({ message: err.message });

                        res.status(201).json({
                            message: 'Appointment created successfully',
                            appointment: result
                        });
                    });
                });
            });
        });
    },

    /**
     * Update an appointment
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    updateAppointment: (req, res) => {
        const { id } = req.params;
        const { status, date, description_rdv } = req.body;

        Appointment.findById(id, (err, appointment) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

            // Authorization check based on role
            if (
                (req.user.role === 'doctor' && req.user.id !== appointment.id_doc) &&
                (req.user.role === 'client' && req.user.id !== appointment.id_clt)
            ) {
                return res.status(403).json({ message: 'Not authorized to update this appointment' });
            }

            // Prepare update data
            const updatedAppointment = {
                status: status || appointment.status,
                date: date || appointment.date,
                description_rdv: description_rdv || appointment.description_rdv
            };

            Appointment.update(id, updatedAppointment, (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                if (result.changes === 0) return res.status(404).json({ message: 'Appointment not found or no changes made' });

                res.json({
                    message: 'Appointment updated successfully',
                    id: id,
                    ...updatedAppointment
                });
            });
        });
    },

    /**
     * Update appointment status
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    updateStatus: (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        // Valid status values
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        Appointment.findById(id, (err, appointment) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

            // Authorization check
            // Only doctors can confirm/complete
            // Both doctors and clients can cancel
            // Clients can only cancel their own appointments
            if (
                ((status === 'confirmed' || status === 'completed') && req.user.role !== 'doctor') ||
                (req.user.role === 'doctor' && req.user.id !== appointment.id_doc) ||
                (req.user.role === 'client' && req.user.id !== appointment.id_clt)
            ) {
                return res.status(403).json({ message: 'Not authorized to update this appointment status' });
            }

            Appointment.updateStatus(id, status, (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                if (result.changes === 0) return res.status(404).json({ message: 'Appointment not found or no changes made' });

                res.json({
                    message: 'Appointment status updated successfully',
                    id: id,
                    status: status
                });
            });
        });
    },

    /**
     * Delete an appointment
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    deleteAppointment: (req, res) => {
        const { id } = req.params;

        Appointment.findById(id, (err, appointment) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

            // Authorization check based on role
            if (
                (req.user.role === 'doctor' && req.user.id !== appointment.id_doc) &&
                (req.user.role === 'client' && req.user.id !== appointment.id_clt)
            ) {
                return res.status(403).json({ message: 'Not authorized to delete this appointment' });
            }

            Appointment.delete(id, (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                if (result.changes === 0) return res.status(404).json({ message: 'Appointment not found' });

                res.json({ message: 'Appointment deleted successfully' });
            });
        });
    },

    /**
     * Get available time slots for a doctor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getAvailableTimeSlots: (req, res) => {
        const { doctorId } = req.params;
        const { date } = req.query;

        // Default to today if no date provided
        const targetDate = date || new Date().toISOString().split('T')[0];

        // Check if doctor exists
        Doctor.findById(doctorId, (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            // Get doctor's appointments for the specified date
            Appointment.findByDoctorAndDate(doctorId, targetDate, (err, appointments) => {
                if (err) return res.status(500).json({ message: err.message });

                // Define business hours (9 AM to 5 PM)
                const businessHours = [
                    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
                    '15:00', '15:30', '16:00', '16:30', '17:00'
                ];

                // Filter out booked slots
                const bookedSlots = appointments.map(appointment => {
                    const appointmentTime = new Date(appointment.date);
                    return appointmentTime.getHours().toString().padStart(2, '0') + ':' +
                        appointmentTime.getMinutes().toString().padStart(2, '0');
                });

                const availableSlots = businessHours.filter(slot => !bookedSlots.includes(slot));

                res.json({
                    doctorId,
                    date: targetDate,
                    availableSlots
                });
            });
        });
    }
};

module.exports = appointmentController;