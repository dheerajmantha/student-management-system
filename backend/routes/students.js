const express = require('express');
const { body } = require('express-validator');
const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} = require('../controllers/studentController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Validation rules
const studentValidation = [
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    body('last_name')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('roll_number')
        .trim()
        .notEmpty()
        .withMessage('Roll number is required'),
    body('phone')
        .optional()
        .matches(/^\d{10}$/)
        .withMessage('Phone number must be 10 digits'),
    body('date_of_birth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth')
];

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin, Faculty)
router.get('/', auth, authorize(['admin', 'faculty']), getAllStudents);

// @route   GET /api/students/:id
// @desc    Get student by ID
// @access  Private (Admin, Faculty)
router.get('/:id', auth, authorize(['admin', 'faculty']), getStudentById);

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Admin)
router.post('/', auth, authorize(['admin']), studentValidation, createStudent);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin)
router.put('/:id', auth, authorize(['admin']), studentValidation, updateStudent);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete('/:id', auth, authorize(['admin']), deleteStudent);

module.exports = router; 