const express = require('express');
const { body, param } = require('express-validator');
const {
    getAllGrades,
    getGradesByStudent,
    getGradesByCourse,
    createOrUpdateGrade,
    deleteGrade
} = require('../controllers/gradeController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Validation rules
const gradeValidation = [
    body('student_id')
        .isInt()
        .withMessage('Student ID must be a valid integer'),
    body('course_id')
        .isInt()
        .withMessage('Course ID must be a valid integer'),
    body('score')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Score must be between 0 and 100'),
    body('letter_grade')
        .optional()
        .isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'])
        .withMessage('Letter grade must be valid (A+ to F)'),
    body('exam_type')
        .optional()
        .isIn(['assignment', 'quiz', 'midterm', 'final', 'project', 'presentation', 'other'])
        .withMessage('Exam type must be valid'),
    body('comments')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Comments must be less than 500 characters')
];

const idValidation = [
    param('id')
        .isInt()
        .withMessage('Invalid grade ID'),
    param('studentId')
        .optional()
        .isInt()
        .withMessage('Invalid student ID'),
    param('courseId')
        .optional()
        .isInt()
        .withMessage('Invalid course ID')
];

// @route   GET /api/grades
// @desc    Get all grades
// @access  Private (Admin/Faculty)
router.get('/', auth, authorize(['admin', 'faculty']), getAllGrades);

// @route   GET /api/grades/student/:studentId
// @desc    Get grades by student
// @access  Private
router.get('/student/:studentId', auth, authorize(['admin', 'faculty']), idValidation, getGradesByStudent);

// @route   GET /api/grades/course/:courseId
// @desc    Get grades by course
// @access  Private (Faculty/Admin)
router.get('/course/:courseId', auth, authorize(['admin', 'faculty']), idValidation, getGradesByCourse);

// @route   POST /api/grades
// @desc    Create or update grade
// @access  Private (Faculty/Admin)
router.post('/', auth, authorize(['admin', 'faculty']), gradeValidation, createOrUpdateGrade);

// @route   DELETE /api/grades/:id
// @desc    Delete grade
// @access  Private (Admin)
router.delete('/:id', auth, authorize(['admin']), idValidation, deleteGrade);

module.exports = router; 