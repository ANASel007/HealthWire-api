const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { auth, clientAuth } = require('../middleware/auth');

/**
 * @route   GET /api/clients
 * @desc    Get all clients
 * @access  Private (Admin or Doctor)
 */
router.get('/', auth, clientController.getAllClients);

/**
 * @route   GET /api/clients/:id
 * @desc    Get client by ID
 * @access  Private (Client or Doctor)
 */
router.get('/:id', auth, clientController.getClientById);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  Private (Client only)
 */
router.put('/:id', auth, clientController.updateClient);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete client
 * @access  Private (Client only)
 */
router.delete('/:id', auth, clientController.deleteClient);

/**
 * @route   PUT /api/clients/:id/password
 * @desc    Change client password
 * @access  Private (Client only)
 */
router.put('/:id/password', auth, clientController.changePassword);

/**
 * @route   GET /api/clients/:id/appointments
 * @desc    Get client's appointments
 * @access  Private (Client only)
 */
router.get('/:id/appointments', auth, clientController.getClientAppointments);

module.exports = router;