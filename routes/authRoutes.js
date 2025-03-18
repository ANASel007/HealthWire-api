const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

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

module.exports = router;