const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/doctor');
const Client = require('../models/client');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Authentication controller for login and registration
 */
const authController = {
    /**
     * Register a new doctor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    registerDoctor: async (req, res) => {
        const { nom, ville, email, imageurl, telephone, specialite, password } = req.body;

        if (!nom || !email || !password) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        // Check if doctor already exists
        Doctor.findByEmail(email, async (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (doctor) return res.status(400).json({ message: 'Doctor already exists' });

            try {
                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Create new doctor
                const newDoctor = {
                    nom,
                    ville,
                    email,
                    imageurl,
                    telephone,
                    specialite,
                    password: hashedPassword
                };

                Doctor.create(newDoctor, (err, result) => {
                    if (err) return res.status(500).json({ message: err.message });

                    // Create JWT token
                    const token = jwt.sign(
                        { id: result.id, email: result.email, role: 'doctor' },
                        JWT_SECRET,
                        { expiresIn: '1d' }
                    );

                    res.status(201).json({
                        token,
                        doctor: {
                            id: result.id,
                            nom: result.nom,
                            email: result.email,
                            role: 'doctor'
                        }
                    });
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    },

    /**
     * Register a new client
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    registerClient: async (req, res) => {
        const { nom, ville, email, imageurl, telephone, password } = req.body;

        if (!nom || !email || !password) {
            return res.status(400).json({ message: 'Please enter all required fields' });
        }

        // Check if client already exists
        Client.findByEmail(email, async (err, client) => {
            if (err) return res.status(500).json({ message: err.message });
            if (client) return res.status(400).json({ message: 'Client already exists' });

            try {
                // Hash password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Create new client
                const newClient = {
                    nom,
                    ville,
                    email,
                    imageurl,
                    telephone,
                    password: hashedPassword
                };

                Client.create(newClient, (err, result) => {
                    if (err) return res.status(500).json({ message: err.message });

                    // Create JWT token
                    const token = jwt.sign(
                        { id: result.id, email: result.email, role: 'client' },
                        JWT_SECRET,
                        { expiresIn: '1d' }
                    );

                    res.status(201).json({
                        token,
                        client: {
                            id: result.id,
                            nom: result.nom,
                            email: result.email,
                            role: 'client'
                        }
                    });
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    },

    /**
     * Login doctor
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    loginDoctor: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // Check if doctor exists
        Doctor.findByEmail(email, async (err, doctor) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!doctor) return res.status(400).json({ message: 'Invalid credentials' });

            try {
                // Validate password
                const isMatch = await bcrypt.compare(password, doctor.password);
                if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

                // Create JWT token
                const token = jwt.sign(
                    { id: doctor.id_doc, email: doctor.email, role: 'doctor' },
                    JWT_SECRET,
                    { expiresIn: '1d' }
                );

                res.json({
                    token,
                    doctor: {
                        id: doctor.id_doc,
                        nom: doctor.nom,
                        email: doctor.email,
                        role: 'doctor'
                    }
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    },

    /**
     * Login client
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    loginClient: async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // Check if client exists
        Client.findByEmail(email, async (err, client) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!client) return res.status(400).json({ message: 'Invalid credentials' });

            try {
                // Validate password
                const isMatch = await bcrypt.compare(password, client.password);
                if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

                // Create JWT token
                const token = jwt.sign(
                    { id: client.id_clt, email: client.email, role: 'client' },
                    JWT_SECRET,
                    { expiresIn: '1d' }
                );

                res.json({
                    token,
                    client: {
                        id: client.id_clt,
                        nom: client.nom,
                        email: client.email,
                        role: 'client'
                    }
                });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    },

    /**
     * Get user data (doctor or client)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    getUser: (req, res) => {
        const { id, role } = req.user;

        if (role === 'doctor') {
            Doctor.findById(id, (err, doctor) => {
                if (err) return res.status(500).json({ message: err.message });
                if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

                res.json({
                    id: doctor.id_doc,
                    nom: doctor.nom,
                    email: doctor.email,
                    ville: doctor.ville,
                    telephone: doctor.telephone,
                    specialite: doctor.specialite,
                    imageurl: doctor.imageurl,
                    role: 'doctor'
                });
            });
        } else if (role === 'client') {
            Client.findById(id, (err, client) => {
                if (err) return res.status(500).json({ message: err.message });
                if (!client) return res.status(404).json({ message: 'Client not found' });

                res.json({
                    id: client.id_clt,
                    nom: client.nom,
                    email: client.email,
                    ville: client.ville,
                    telephone: client.telephone,
                    imageurl: client.imageurl,
                    role: 'client'
                });
            });
        } else {
            res.status(400).json({ message: 'Invalid user role' });
        }
    }
};

module.exports = authController;