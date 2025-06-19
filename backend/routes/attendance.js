const express = require('express');
const { body, param } = require('express-validator');
const {
    getAllAttendance,
    getAttendanceByStudent,
    getAttendanceByCourse,
    getAttendanceByDate,
    markAttendance,
    updateAttendance,
    deleteAttendance
} = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Validation rules
const attendanceValidation = [
    body('student_id')
        .isInt()
        .withMessage('Student ID must be a valid integer'),
    body('course_id')
        .isInt()
        .withMessage('Course ID must be a valid integer'),
    body('date')
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    body('status')
        .isIn(['present', 'absent', 'excused', 'late'])
        .withMessage('Status must be present, absent, excused, or late')
];

const updateAttendanceValidation = [
    body('status')
        .isIn(['present', 'absent', 'excused', 'late'])
        .withMessage('Status must be present, absent, excused, or late')
];

const idValidation = [
    param('id')
        .isInt()
        .withMessage('Invalid attendance ID'),
    param('studentId')
        .optional()
        .isInt()
        .withMessage('Invalid student ID'),
    param('courseId')
        .optional()
        .isInt()
        .withMessage('Invalid course ID')
];

const dateValidation = [
    param('date')
        .isISO8601()
        .withMessage('Invalid date format')
];

// @route   GET /api/attendance
// @desc    Get all attendance records
// @access  Private (Admin/Faculty)
router.get('/', auth, authorize(['admin', 'faculty']), getAllAttendance);

// @route   GET /api/attendance/student/:studentId
// @desc    Get attendance by student
// @access  Private
router.get('/student/:studentId', auth, authorize(['admin', 'faculty']), idValidation, getAttendanceByStudent);

// @route   GET /api/attendance/course/:courseId
// @desc    Get attendance by course
// @access  Private (Faculty/Admin)
router.get('/course/:courseId', auth, authorize(['admin', 'faculty']), idValidation, getAttendanceByCourse);

// @route   GET /api/attendance/date/:date
// @desc    Get attendance by date
// @access  Private (Faculty/Admin)
router.get('/date/:date', auth, authorize(['admin', 'faculty']), dateValidation, getAttendanceByDate);

// @route   POST /api/attendance
// @desc    Mark attendance
// @access  Private (Faculty/Admin)
router.post('/', auth, authorize(['admin', 'faculty']), attendanceValidation, markAttendance);

// @route   PUT /api/attendance/:id
// @desc    Update attendance
// @access  Private (Faculty/Admin)
router.put('/:id', auth, authorize(['admin', 'faculty']), idValidation, updateAttendanceValidation, updateAttendance);

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance
// @access  Private (Admin)
router.delete('/:id', auth, authorize(['admin']), idValidation, deleteAttendance);

module.exports = router; 