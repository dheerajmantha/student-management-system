const { validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const Course = require('../models/Course');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAllAnnouncements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { targetAudience, isActive } = req.query;

        let query = {};
        
        // Filter by target audience if specified
        if (targetAudience) {
            query.targetAudience = targetAudience;
        }
        
        // Filter by active status if specified
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // For students and faculty, filter based on role
        if (req.user.role === 'student') {
            query.$or = [
                { targetAudience: 'all' },
                { targetAudience: 'students' }
            ];
        } else if (req.user.role === 'faculty') {
            query.$or = [
                { targetAudience: 'all' },
                { targetAudience: 'faculty' }
            ];
        }

        const announcements = await Announcement.find(query)
            .populate('author', 'username email role')
            .populate('course', 'name code')
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Announcement.countDocuments(query);

        res.json({
            announcements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all announcements error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)
            .populate('author', 'username email role')
            .populate('course', 'name code description');

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.json(announcement);
    } catch (error) {
        console.error('Get announcement by ID error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Admin/Faculty)
const createAnnouncement = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const { title, content, targetAudience, course, priority } = req.body;
        const author = req.user._id;

        // Verify course exists if course-specific announcement
        if (targetAudience === 'course-specific') {
            if (!course) {
                return res.status(400).json({ 
                    message: 'Course is required for course-specific announcements' 
                });
            }

            const courseDoc = await Course.findById(course);
            if (!courseDoc) {
                return res.status(404).json({ message: 'Course not found' });
            }

            // Check if faculty is authorized to create announcements for this course
            if (req.user.role === 'faculty' && courseDoc.assignedFaculty.toString() !== author.toString()) {
                return res.status(403).json({ 
                    message: 'You are not authorized to create announcements for this course' 
                });
            }
        }

        const announcement = new Announcement({
            title,
            content,
            author,
            targetAudience,
            course: targetAudience === 'course-specific' ? course : undefined,
            priority: priority || 'medium'
        });

        await announcement.save();

        const populatedAnnouncement = await Announcement.findById(announcement._id)
            .populate('author', 'username email role')
            .populate('course', 'name code');

        res.status(201).json({
            message: 'Announcement created successfully',
            announcement: populatedAnnouncement
        });
    } catch (error) {
        console.error('Create announcement error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin/Faculty - own announcements)
const updateAnnouncement = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check if user is authorized to update this announcement
        if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: 'You are not authorized to update this announcement' 
            });
        }

        const { title, content, targetAudience, course, priority, isActive } = req.body;

        // Verify course if provided
        if (targetAudience === 'course-specific' && course) {
            const courseDoc = await Course.findById(course);
            if (!courseDoc) {
                return res.status(404).json({ message: 'Course not found' });
            }

            // Check if faculty is authorized for this course
            if (req.user.role === 'faculty' && courseDoc.assignedFaculty.toString() !== req.user._id.toString()) {
                return res.status(403).json({ 
                    message: 'You are not authorized to create announcements for this course' 
                });
            }
        }

        // Update fields
        announcement.title = title || announcement.title;
        announcement.content = content || announcement.content;
        announcement.targetAudience = targetAudience || announcement.targetAudience;
        announcement.course = targetAudience === 'course-specific' ? course : undefined;
        announcement.priority = priority || announcement.priority;
        announcement.isActive = isActive !== undefined ? isActive : announcement.isActive;

        await announcement.save();

        const populatedAnnouncement = await Announcement.findById(announcement._id)
            .populate('author', 'username email role')
            .populate('course', 'name code');

        res.json({
            message: 'Announcement updated successfully',
            announcement: populatedAnnouncement
        });
    } catch (error) {
        console.error('Update announcement error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin/Faculty - own announcements)
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check if user is authorized to delete this announcement
        if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ 
                message: 'You are not authorized to delete this announcement' 
            });
        }

        await Announcement.findByIdAndDelete(req.params.id);

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Delete announcement error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get announcements by course
// @route   GET /api/announcements/course/:courseId
// @access  Private
const getAnnouncementsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const announcements = await Announcement.find({
            course: courseId,
            isActive: true
        })
            .populate('author', 'username email role')
            .sort({ priority: -1, createdAt: -1 });

        res.json(announcements);
    } catch (error) {
        console.error('Get announcements by course error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncementsByCourse
}; 