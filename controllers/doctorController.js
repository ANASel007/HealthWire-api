const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const bcrypt = require('bcryptjs');

/**
 * Doctor controller for operations related to doctors
 */
const doctorController = {
    /**
     * Get all doctors
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getAllDoctors: (req, res) => {
        Doctor.findAll((err, doctors) => {
            if (err) return res.status(500).json({ message: err.message });

            // Add rating and review data for frontend display
            const doctorsWithRating = doctors.map(doctor => {
                // Generate random rating between 4.0 and 5.0 for demo purposes
                const rating = (4 + Math.random()).toFixed(1);
                const reviewCount = Math.floor(Math.random() * 20) + 1; // Random 1-20

                return {
                    ...doctor,
                    rating: parseFloat(rating),
                    reviewCount: reviewCount
                };
            });

            res.json(doctorsWithRating);
        });
    },

    /**
     * Get doctor by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getDoctorById: (req, res) => {
        const { id } = req.params;

        Doctor.findById(id, (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
            res.json(doctor);
        });
    },

    /**
     * Update doctor profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    updateDoctor: (req, res) => {
        const { id } = req.params;
        const { nom, ville, email, imageurl, telephone, specialite } = req.body;

        // Check if doctor exists
        Doctor.findById(id, (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            // Check if user has permission (if not admin)
            if (req.user.role === 'doctor' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ message: 'Not authorized to update this doctor' });
            }

            const updatedDoctor = {
                nom: nom || doctor.nom,
                ville: ville || doctor.ville,
                email: email || doctor.email,
                imageurl: imageurl || doctor.imageurl,
                telephone: telephone || doctor.telephone,
                specialite: specialite || doctor.specialite
            };

            Doctor.update(id, updatedDoctor, (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                if (result.changes === 0) return res.status(404).json({ message: 'Doctor not found or no changes made' });

                res.json({
                    message: 'Doctor updated successfully',
                    id: id,
                    ...updatedDoctor
                });
            });
        });
    },

    /**
     * Delete doctor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    deleteDoctor: (req, res) => {
        const { id } = req.params;

        // Check if doctor exists
        Doctor.findById(id, (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            // Only allow admin or the doctor themselves to delete
            if (req.user.role === 'doctor' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ message: 'Not authorized to delete this doctor' });
            }

            Doctor.delete(id, (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                if (result.changes === 0) return res.status(404).json({ message: 'Doctor not found' });

                res.json({ message: 'Doctor deleted successfully' });
            });
        });
    },

    /**
     * Change doctor password
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    changePassword: async (req, res) => {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new password are required' });
        }

        // Check if doctor exists and verify current password
        Doctor.findById(id, async (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            // Only allow the doctor themselves to change password
            if (req.user.role === 'doctor' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ message: 'Not authorized to change this doctor\'s password' });
            }

            try {
                // Get full doctor info including password
                Doctor.findByEmail(doctor.email, async (err, fullDoctor) => {
                    if (err) return res.status(500).json({ message: err.message });

                    // Verify current password
                    const isMatch = await bcrypt.compare(currentPassword, fullDoctor.password);
                    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

                    // Hash new password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(newPassword, salt);

                    // Update password
                    Doctor.updatePassword(id, hashedPassword, (err, result) => {
                        if (err) return res.status(500).json({ message: err.message });
                        if (result.changes === 0) return res.status(404).json({ message: 'Doctor not found or no changes made' });

                        res.json({ message: 'Password updated successfully' });
                    });
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    },

    /**
     * Get all appointments for a doctor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getDoctorAppointments: (req, res) => {
        const { id } = req.params;

        // Check if doctor exists
        Doctor.findById(id, (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

            // Only allow the doctor themselves to see their appointments
            if (req.user.role === 'doctor' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ message: 'Not authorized to view these appointments' });
            }

            Appointment.findByDoctorId(id, (err, appointments) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json(appointments);
            });
        });
    }
};

module.exports = doctorController;