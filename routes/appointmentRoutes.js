const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments
 * @access  Private (Admin only)
 */
router.get('/', auth, appointmentController.getAllAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private (Client or Doctor involved in appointment)
 */
router.get('/:id', auth, appointmentController.getAppointmentById);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private (Client or Doctor)
 */
router.post('/', auth, appointmentController.createAppointment);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update appointment
 * @access  Private (Client or Doctor involved in appointment)
 */
router.put('/:id', auth, appointmentController.updateAppointment);

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private (Client or Doctor involved in appointment)
 */
router.put('/:id/status', auth, appointmentController.updateStatus);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete appointment
 * @access  Private (Client or Doctor involved in appointment)
 */
router.delete('/:id', auth, appointmentController.deleteAppointment);
/**
 * @route   GET /api/appointments
 * @desc    Get all appointments
 * @access  Private (Admin only)
 */
router.get('/', auth, appointmentController.getAllAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private (Client or Doctor involved in appointment)
 */
router.get('/:id', auth, appointmentController.getAppointmentById);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private (Client or Doctor)
 */
router.post('/', auth, appointmentController.createAppointment);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update appointment
 * @access  Private (Client or Doctor involved in appointment)
 */
router.put('/:id', auth, appointmentController.updateAppointment);

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private (Client or Doctor involved in appointment)
 */
router.put('/:id/status', auth, appointmentController.updateStatus);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete appointment
 * @access  Private (Client or Doctor involved in appointment)
 */
router.delete('/:id', auth, appointmentController.deleteAppointment);

/**
 * @route   GET /api/appointments/available/:doctorId
 * @desc    Get available time slots for a doctor
 * @access  Public
 */

router.get('/available/:doctorId', appointmentController.getAvailableTimeSlots);

module.exports = router;