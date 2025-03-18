const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const doctorController = require('../controllers/doctorController');

/**
 * @route   POST /api/auth/register/doctor
 * @desc    Register a new doctor
 * @access  Public
 */
router.post('/register/doctor', authController.registerDoctor);

/**
 * @route   POST /api/auth/register/client
 * @desc    Register a new client
 * @access  Public
 */
router.post('/register/client', authController.registerClient);

/**
 * @route   POST /api/auth/login/doctor
 * @desc    Login as doctor
 * @access  Public
 */
router.post('/login/doctor', authController.loginDoctor);

/**
 * @route   POST /api/auth/login/client
 * @desc    Login as client
 * @access  Public
 */
router.post('/login/client', authController.loginClient);

/**
 * @route   GET /api/auth/user
 * @desc    Get user data based on token
 * @access  Private
 */
router.get('/user', auth, authController.getUser);

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors - THIS ROUTE WAS MISSING
 * @access  Public
 */
router.get('/', doctorController.getAllDoctors);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 * @access  Public
 */
router.get('/:id', doctorController.getDoctorById);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update doctor
 * @access  Private (Doctor only)
 */
router.put('/:id', auth, doctorController.updateDoctor);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete doctor
 * @access  Private (Doctor only)
 */
router.delete('/:id', auth, doctorController.deleteDoctor);

/**
 * @route   PUT /api/doctors/:id/password
 * @desc    Change doctor password
 * @access  Private (Doctor only)
 */
router.put('/:id/password', auth, doctorController.changePassword);

/**
 * @route   GET /api/doctors/:id/appointments
 * @desc    Get doctor's appointments
 * @access  Private (Doctor only)
 */
router.get('/:id/appointments', auth, doctorController.getDoctorAppointments);


module.exports = router;