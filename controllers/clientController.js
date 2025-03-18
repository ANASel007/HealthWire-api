const Client = require('../models/client');
const Appointment = require('../models/appointment');
const bcrypt = require('bcryptjs');

/**
 * Client controller for operations related to clients/patients
 */
const clientController = {
    /**
     * Get all clients (admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getAllClients: (req, res) => {
        Client.findAll((err, clients) => {
            if (err) return res.status(500).json({ message: err.message });
            res.json(clients);
        });
    },

    /**
     * Get client by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getClientById: (req, res) => {
        const { id } = req.params;

        Client.findById(id, (err, client) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!client) return res.status(404).json({ message: 'Client not found' });

            // Only allow the client themselves or doctors to view client info
            if (req.user.role === 'client' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ message: 'Not authorized to view this client' });
            }

            res.json(client);
        });
    },

    /**
     * Update client profile
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    updateClient: (req, res) => {
        const { id } = req.params;
        const { nom, ville, email, imageurl, telephone } = req.body;

        // Check if client exists
        Client.findById(id, (err, client) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!client) return res.status(404).json({ message: 'Client not found' });

            // Only allow the client themselves to update their profile
            if (req.user.role === 'client' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ message: 'Not authorized to update this client' });
            }

            const updatedClient = {
                nom: nom || client.nom,
                ville: ville || client.ville,
                email: email || client.email,
                imageurl: imageurl || client.imageurl,
                telephone: telephone || client.telephone
            };

            Client.update(id, updatedClient, (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                if (result.changes === 0) return res.status(404).json({ message: 'Client not found or no changes made' });

                res.json({
                    message: 'Client updated successfully',
                    id: id,
                    ...updatedClient
                });
            });
        });
    },

    /**
     * Delete client
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    deleteClient: (req, res) => {
        const { id } = req.params;

        // Check if client exists
        Client.findById(id, (err, client) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!client) return res.status(404).json({ message: 'Client not found' });

            // Only allow the client themselves to delete their account
            if (req.user.role === 'client' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ message: 'Not authorized to delete this client' });
            }

            Client.delete(id, (err, result) => {
                if (err) return res.status(500).json({ message: err.message });
                if (result.changes === 0) return res.status(404).json({ message: 'Client not found' });

                res.json({ message: 'Client deleted successfully' });
            });
        });
    },

    /**
     * Change client password
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    changePassword: async (req, res) => {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new password are required' });
        }

        // Check if client exists
        Client.findById(id, async (err, client) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!client) return res.status(404).json({ message: 'Client not found' });

            // Only allow the client themselves to change password
            if (req.user.role === 'client' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ message: 'Not authorized to change this client\'s password' });
            }

            try {
                // Get full client info including password
                Client.findByEmail(client.email, async (err, fullClient) => {
                    if (err) return res.status(500).json({ message: err.message });

                    // Verify current password
                    const isMatch = await bcrypt.compare(currentPassword, fullClient.password);
                    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

                    // Hash new password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(newPassword, salt);

                    // Update password
                    Client.updatePassword(id, hashedPassword, (err, result) => {
                        if (err) return res.status(500).json({ message: err.message });
                        if (result.changes === 0) return res.status(404).json({ message: 'Client not found or no changes made' });

                        res.json({ message: 'Password updated successfully' });
                    });
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    },

    /**
     * Get all appointments for a client
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getClientAppointments: (req, res) => {
        const { id } = req.params;

        // Check if client exists
        Client.findById(id, (err, client) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!client) return res.status(404).json({ message: 'Client not found' });

            // Only allow the client themselves to see their appointments
            if (req.user.role === 'client' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ message: 'Not authorized to view these appointments' });
            }

            Appointment.findByClientId(id, (err, appointments) => {
                if (err) return res.status(500).json({ message: err.message });
                res.json(appointments);
            });
        });
    }
};

module.exports = clientController;