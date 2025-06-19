const { validationResult } = require('express-validator');
const Student = require('../models/Student');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Faculty/Admin)
const getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const students = await Student.find()
            .populate('enrolledCourses', 'name code credits')
            .populate('userId', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Student.countDocuments();

        res.json({
            students,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all students error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('enrolledCourses', 'name code credits description assignedFaculty')
            .populate('userId', 'username email');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Get student by ID error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin/Faculty)
const createStudent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const { name, rollNo, dateOfBirth, gender, contactNumber, email, userId } = req.body;

        // Check if student with same roll number or email exists
        const existingStudent = await Student.findOne({
            $or: [{ rollNo }, { email }]
        });

        if (existingStudent) {
            return res.status(400).json({ 
                message: 'Student with this roll number or email already exists' 
            });
        }

        // If userId is provided, verify it exists and is a student
        if (userId) {
            const user = await User.findById(userId);
            if (!user || user.role !== 'student') {
                return res.status(400).json({ 
                    message: 'Invalid user ID or user is not a student' 
                });
            }
        }

        const student = new Student({
            name,
            rollNo: rollNo.toUpperCase(),
            dateOfBirth,
            gender,
            contactNumber,
            email: email.toLowerCase(),
            userId
        });

        await student.save();

        const populatedStudent = await Student.findById(student._id)
            .populate('userId', 'username email');

        res.status(201).json({
            message: 'Student created successfully',
            student: populatedStudent
        });
    } catch (error) {
        console.error('Create student error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin/Faculty)
const updateStudent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { name, rollNo, dateOfBirth, gender, contactNumber, email, userId } = req.body;

        // Check if another student has the same roll number or email
        if (rollNo || email) {
            const existingStudent = await Student.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    ...(rollNo ? [{ rollNo: rollNo.toUpperCase() }] : []),
                    ...(email ? [{ email: email.toLowerCase() }] : [])
                ]
            });

            if (existingStudent) {
                return res.status(400).json({ 
                    message: 'Another student with this roll number or email already exists' 
                });
            }
        }

        // Update fields
        student.name = name || student.name;
        student.rollNo = rollNo ? rollNo.toUpperCase() : student.rollNo;
        student.dateOfBirth = dateOfBirth || student.dateOfBirth;
        student.gender = gender || student.gender;
        student.contactNumber = contactNumber || student.contactNumber;
        student.email = email ? email.toLowerCase() : student.email;
        student.userId = userId !== undefined ? userId : student.userId;

        await student.save();

        const populatedStudent = await Student.findById(student._id)
            .populate('enrolledCourses', 'name code credits')
            .populate('userId', 'username email');

        res.json({
            message: 'Student updated successfully',
            student: populatedStudent
        });
    } catch (error) {
        console.error('Update student error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Remove student from all enrolled courses
        await Course.updateMany(
            { studentsEnrolled: student._id },
            { $pull: { studentsEnrolled: student._id } }
        );

        await Student.findByIdAndDelete(req.params.id);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Delete student error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Enroll student in course
// @route   POST /api/students/:id/enroll/:courseId
// @access  Private (Admin/Faculty)
const enrollInCourse = async (req, res) => {
    try {
        const { id: studentId, courseId } = req.params;

        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        if (student.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: 'Student already enrolled in this course' });
        }

        // Add course to student's enrolled courses
        student.enrolledCourses.push(courseId);
        await student.save();

        // Add student to course's enrolled students
        course.studentsEnrolled.push(studentId);
        await course.save();

        res.json({ message: 'Student enrolled in course successfully' });
    } catch (error) {
        console.error('Enroll in course error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Unenroll student from course
// @route   DELETE /api/students/:id/unenroll/:courseId
// @access  Private (Admin/Faculty)
const unenrollFromCourse = async (req, res) => {
    try {
        const { id: studentId, courseId } = req.params;

        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Remove course from student's enrolled courses
        student.enrolledCourses = student.enrolledCourses.filter(
            (course) => course.toString() !== courseId
        );
        await student.save();

        // Remove student from course's enrolled students
        course.studentsEnrolled = course.studentsEnrolled.filter(
            (student) => student.toString() !== studentId
        );
        await course.save();

        res.json({ message: 'Student unenrolled from course successfully' });
    } catch (error) {
        console.error('Unenroll from course error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    enrollInCourse,
    unenrollFromCourse
}; 