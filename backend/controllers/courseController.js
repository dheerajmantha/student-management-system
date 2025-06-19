const { validationResult } = require('express-validator');
const Course = require('../models/Course');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getAllCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const courses = await Course.find()
            .populate('assignedFaculty', 'username email')
            .populate('studentsEnrolled', 'name rollNo email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Course.countDocuments();

        res.json({
            courses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all courses error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('assignedFaculty', 'username email')
            .populate('studentsEnrolled', 'name rollNo email contactNumber');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        console.error('Get course by ID error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin)
const createCourse = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const { name, code, description, credits, assignedFaculty } = req.body;

        // Check if course with same name or code exists
        const existingCourse = await Course.findOne({
            $or: [{ name }, { code: code.toUpperCase() }]
        });

        if (existingCourse) {
            return res.status(400).json({ 
                message: 'Course with this name or code already exists' 
            });
        }

        // Verify assigned faculty exists and is a faculty member
        const faculty = await User.findById(assignedFaculty);
        if (!faculty || faculty.role !== 'faculty') {
            return res.status(400).json({ 
                message: 'Invalid faculty ID or user is not a faculty member' 
            });
        }

        const course = new Course({
            name,
            code: code.toUpperCase(),
            description,
            credits,
            assignedFaculty
        });

        await course.save();

        const populatedCourse = await Course.findById(course._id)
            .populate('assignedFaculty', 'username email');

        res.status(201).json({
            message: 'Course created successfully',
            course: populatedCourse
        });
    } catch (error) {
        console.error('Create course error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
const updateCourse = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const { name, code, description, credits, assignedFaculty } = req.body;

        // Check if another course has the same name or code
        if (name || code) {
            const existingCourse = await Course.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    ...(name ? [{ name }] : []),
                    ...(code ? [{ code: code.toUpperCase() }] : [])
                ]
            });

            if (existingCourse) {
                return res.status(400).json({ 
                    message: 'Another course with this name or code already exists' 
                });
            }
        }

        // Verify assigned faculty if provided
        if (assignedFaculty) {
            const faculty = await User.findById(assignedFaculty);
            if (!faculty || faculty.role !== 'faculty') {
                return res.status(400).json({ 
                    message: 'Invalid faculty ID or user is not a faculty member' 
                });
            }
        }

        // Update fields
        course.name = name || course.name;
        course.code = code ? code.toUpperCase() : course.code;
        course.description = description !== undefined ? description : course.description;
        course.credits = credits || course.credits;
        course.assignedFaculty = assignedFaculty || course.assignedFaculty;

        await course.save();

        const populatedCourse = await Course.findById(course._id)
            .populate('assignedFaculty', 'username email')
            .populate('studentsEnrolled', 'name rollNo email');

        res.json({
            message: 'Course updated successfully',
            course: populatedCourse
        });
    } catch (error) {
        console.error('Update course error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Remove course from all enrolled students
        await Student.updateMany(
            { enrolledCourses: course._id },
            { $pull: { enrolledCourses: course._id } }
        );

        await Course.findByIdAndDelete(req.params.id);

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get courses by faculty
// @route   GET /api/courses/faculty/:facultyId
// @access  Private
const getCoursesByFaculty = async (req, res) => {
    try {
        const courses = await Course.find({ assignedFaculty: req.params.facultyId })
            .populate('studentsEnrolled', 'name rollNo email')
            .sort({ createdAt: -1 });

        res.json(courses);
    } catch (error) {
        console.error('Get courses by faculty error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCoursesByFaculty
}; 