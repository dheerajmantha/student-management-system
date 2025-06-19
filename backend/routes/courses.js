const express = require('express');
const { body, param } = require('express-validator');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByFaculty
} = require('../controllers/courseController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Validation rules
const courseValidation = [
    body('course_name')
        .notEmpty()
        .withMessage('Course name is required')
        .isLength({ max: 100 })
        .withMessage('Course name must be less than 100 characters'),
    body('course_code')
        .notEmpty()
        .withMessage('Course code is required')
        .isLength({ min: 2, max: 10 })
        .withMessage('Course code must be between 2 and 10 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('credits')
        .isInt({ min: 1, max: 6 })
        .withMessage('Credits must be between 1 and 6'),
    body('faculty_id')
        .optional()
        .isInt()
        .withMessage('Faculty ID must be a valid integer'),
    body('department')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Department must be less than 100 characters'),
    body('semester')
        .optional()
        .isIn(['Fall', 'Spring', 'Summer'])
        .withMessage('Semester must be Fall, Spring, or Summer'),
    body('year')
        .optional()
        .isInt({ min: 2020, max: 2030 })
        .withMessage('Year must be between 2020 and 2030')
];

const updateCourseValidation = [
    body('course_name')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Course name must be less than 100 characters'),
    body('course_code')
        .optional()
        .isLength({ min: 2, max: 10 })
        .withMessage('Course code must be between 2 and 10 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('credits')
        .optional()
        .isInt({ min: 1, max: 6 })
        .withMessage('Credits must be between 1 and 6'),
    body('faculty_id')
        .optional()
        .isInt()
        .withMessage('Faculty ID must be a valid integer'),
    body('department')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Department must be less than 100 characters'),
    body('semester')
        .optional()
        .isIn(['Fall', 'Spring', 'Summer'])
        .withMessage('Semester must be Fall, Spring, or Summer'),
    body('year')
        .optional()
        .isInt({ min: 2020, max: 2030 })
        .withMessage('Year must be between 2020 and 2030')
];

const idValidation = [
    param('id')
        .isInt()
        .withMessage('Invalid course ID'),
    param('facultyId')
        .optional()
        .isInt()
        .withMessage('Invalid faculty ID')
];

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', auth, authorize(['admin', 'faculty']), getAllCourses);

// @route   GET /api/courses/faculty/:facultyId
// @desc    Get courses by faculty
// @access  Private
router.get('/faculty/:facultyId', auth, authorize(['admin', 'faculty']), idValidation, getCoursesByFaculty);

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', auth, authorize(['admin', 'faculty']), idValidation, getCourseById);

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Admin)
router.post('/', auth, authorize(['admin']), courseValidation, createCourse);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Admin)
router.put('/:id', auth, authorize(['admin']), idValidation, updateCourseValidation, updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Admin)
router.delete('/:id', auth, authorize(['admin']), idValidation, deleteCourse);

module.exports = router; 