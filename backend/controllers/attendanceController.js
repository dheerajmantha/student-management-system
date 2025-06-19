const { validationResult } = require('express-validator');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Course = require('../models/Course');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Admin/Faculty)
const getAllAttendance = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const attendance = await Attendance.find()
            .populate('student', 'name rollNo email')
            .populate('course', 'name code')
            .populate('recordedBy', 'username email')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Attendance.countDocuments();

        res.json({
            attendance,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all attendance error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getAttendanceByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { courseId } = req.query;

        let query = { student: studentId };
        if (courseId) {
            query.course = courseId;
        }

        const attendance = await Attendance.find(query)
            .populate('course', 'name code')
            .populate('recordedBy', 'username email')
            .sort({ date: -1 });

        // Calculate attendance statistics
        const totalClasses = attendance.length;
        const presentCount = attendance.filter(a => a.status === 'Present').length;
        const absentCount = attendance.filter(a => a.status === 'Absent').length;
        const excusedCount = attendance.filter(a => a.status === 'Excused').length;
        
        const attendancePercentage = totalClasses > 0 ? 
            ((presentCount + excusedCount) / totalClasses * 100).toFixed(2) : 0;

        res.json({
            attendance,
            statistics: {
                totalClasses,
                present: presentCount,
                absent: absentCount,
                excused: excusedCount,
                attendancePercentage: parseFloat(attendancePercentage)
            }
        });
    } catch (error) {
        console.error('Get attendance by student error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get attendance by course
// @route   GET /api/attendance/course/:courseId
// @access  Private (Faculty/Admin)
const getAttendanceByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { date } = req.query;

        let query = { course: courseId };
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const attendance = await Attendance.find(query)
            .populate('student', 'name rollNo email')
            .populate('recordedBy', 'username email')
            .sort({ date: -1, 'student.rollNo': 1 });

        res.json(attendance);
    } catch (error) {
        console.error('Get attendance by course error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get attendance by date
// @route   GET /api/attendance/date/:date
// @access  Private (Faculty/Admin)
const getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;
        
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        const attendance = await Attendance.find({
            date: { $gte: startDate, $lt: endDate }
        })
            .populate('student', 'name rollNo email')
            .populate('course', 'name code')
            .populate('recordedBy', 'username email')
            .sort({ 'course.code': 1, 'student.rollNo': 1 });

        res.json(attendance);
    } catch (error) {
        console.error('Get attendance by date error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Faculty/Admin)
const markAttendance = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const { student, course, date, status } = req.body;
        const recordedBy = req.user._id;

        // Verify student and course exist
        const studentDoc = await Student.findById(student);
        const courseDoc = await Course.findById(course);

        if (!studentDoc) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (!courseDoc) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if faculty is authorized to mark attendance for this course
        if (req.user.role === 'faculty' && courseDoc.assignedFaculty.toString() !== recordedBy.toString()) {
            return res.status(403).json({ message: 'You are not authorized to mark attendance for this course' });
        }

        // Check if student is enrolled in the course
        if (!studentDoc.enrolledCourses.includes(course)) {
            return res.status(400).json({ message: 'Student is not enrolled in this course' });
        }

        // Check if attendance already exists for this student, course, and date
        const attendanceDate = new Date(date);
        const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

        const existingAttendance = await Attendance.findOne({
            student,
            course,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existingAttendance) {
            // Update existing attendance
            existingAttendance.status = status;
            existingAttendance.recordedBy = recordedBy;
            await existingAttendance.save();

            const populatedAttendance = await Attendance.findById(existingAttendance._id)
                .populate('student', 'name rollNo email')
                .populate('course', 'name code')
                .populate('recordedBy', 'username email');

            return res.json({
                message: 'Attendance updated successfully',
                attendance: populatedAttendance
            });
        }

        // Create new attendance record
        const attendance = new Attendance({
            student,
            course,
            date: new Date(date),
            status,
            recordedBy
        });

        await attendance.save();

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate('student', 'name rollNo email')
            .populate('course', 'name code')
            .populate('recordedBy', 'username email');

        res.status(201).json({
            message: 'Attendance marked successfully',
            attendance: populatedAttendance
        });
    } catch (error) {
        console.error('Mark attendance error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Faculty/Admin)
const updateAttendance = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        const { status } = req.body;

        // Check if faculty is authorized to update this attendance record
        const course = await Course.findById(attendance.course);
        if (req.user.role === 'faculty' && course.assignedFaculty.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this attendance record' });
        }

        attendance.status = status;
        attendance.recordedBy = req.user._id;
        await attendance.save();

        const populatedAttendance = await Attendance.findById(attendance._id)
            .populate('student', 'name rollNo email')
            .populate('course', 'name code')
            .populate('recordedBy', 'username email');

        res.json({
            message: 'Attendance updated successfully',
            attendance: populatedAttendance
        });
    } catch (error) {
        console.error('Update attendance error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        await Attendance.findByIdAndDelete(req.params.id);

        res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error('Delete attendance error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllAttendance,
    getAttendanceByStudent,
    getAttendanceByCourse,
    getAttendanceByDate,
    markAttendance,
    updateAttendance,
    deleteAttendance
}; 