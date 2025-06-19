const express = require('express');
const { body, param } = require('express-validator');
const {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// Validation rules
const announcementValidation = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 200 })
        .withMessage('Title must be less than 200 characters'),
    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ max: 2000 })
        .withMessage('Content must be less than 2000 characters'),
    body('target_audience')
        .isIn(['all', 'students', 'faculty', 'staff'])
        .withMessage('Target audience must be all, students, faculty, or staff'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be low, medium, high, or urgent'),
    body('valid_from')
        .optional()
        .isISO8601()
        .withMessage('Valid from must be a valid date'),
    body('valid_until')
        .optional()
        .isISO8601()
        .withMessage('Valid until must be a valid date')
];

const updateAnnouncementValidation = [
    body('title')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Title must be less than 200 characters'),
    body('content')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Content must be less than 2000 characters'),
    body('target_audience')
        .optional()
        .isIn(['all', 'students', 'faculty', 'staff'])
        .withMessage('Target audience must be all, students, faculty, or staff'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be low, medium, high, or urgent'),
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean'),
    body('valid_from')
        .optional()
        .isISO8601()
        .withMessage('Valid from must be a valid date'),
    body('valid_until')
        .optional()
        .isISO8601()
        .withMessage('Valid until must be a valid date')
];

const idValidation = [
    param('id')
        .isInt()
        .withMessage('Invalid announcement ID')
];

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Private
router.get('/', auth, authorize(['admin', 'faculty', 'student']), getAllAnnouncements);

// @route   GET /api/announcements/:id
// @desc    Get announcement by ID
// @access  Private
router.get('/:id', auth, authorize(['admin', 'faculty', 'student']), idValidation, getAnnouncementById);

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private (Admin/Faculty)
router.post('/', auth, authorize(['admin', 'faculty']), announcementValidation, createAnnouncement);

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Admin/Faculty)
router.put('/:id', auth, authorize(['admin', 'faculty']), idValidation, updateAnnouncementValidation, updateAnnouncement);

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Admin)
router.delete('/:id', auth, authorize(['admin']), idValidation, deleteAnnouncement);

module.exports = router; 