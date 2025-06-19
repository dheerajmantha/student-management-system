const { validationResult } = require('express-validator');
const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');

// @desc    Get all grades
// @route   GET /api/grades
// @access  Private (Admin/Faculty)
const getAllGrades = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const grades = await Grade.find()
            .populate('student', 'name rollNo email')
            .populate('course', 'name code credits')
            .populate('faculty', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Grade.countDocuments();

        res.json({
            grades,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all grades error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get grades by student
// @route   GET /api/grades/student/:studentId
// @access  Private
const getGradesByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const grades = await Grade.find({ student: studentId })
            .populate('course', 'name code credits description')
            .populate('faculty', 'username email')
            .sort({ createdAt: -1 });

        // Calculate GPA
        let totalPoints = 0;
        let totalCredits = 0;

        for (const grade of grades) {
            const gradePoints = calculateGradePoints(grade.letterGrade);
            const courseCredits = grade.course.credits;
            totalPoints += gradePoints * courseCredits;
            totalCredits += courseCredits;
        }

        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;

        res.json({
            grades,
            gpa: parseFloat(gpa),
            totalCredits
        });
    } catch (error) {
        console.error('Get grades by student error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get grades by course
// @route   GET /api/grades/course/:courseId
// @access  Private (Faculty/Admin)
const getGradesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const grades = await Grade.find({ course: courseId })
            .populate('student', 'name rollNo email')
            .populate('faculty', 'username email')
            .sort({ 'student.rollNo': 1 });

        res.json(grades);
    } catch (error) {
        console.error('Get grades by course error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create or update grade
// @route   POST /api/grades
// @access  Private (Faculty/Admin)
const createOrUpdateGrade = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const { student, course, score, letterGrade, feedback } = req.body;
        const faculty = req.user._id;

        // Verify student and course exist
        const studentDoc = await Student.findById(student);
        const courseDoc = await Course.findById(course);

        if (!studentDoc) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (!courseDoc) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if faculty is authorized to grade this course
        if (req.user.role === 'faculty' && courseDoc.assignedFaculty.toString() !== faculty.toString()) {
            return res.status(403).json({ message: 'You are not authorized to grade this course' });
        }

        // Check if student is enrolled in the course
        if (!studentDoc.enrolledCourses.includes(course)) {
            return res.status(400).json({ message: 'Student is not enrolled in this course' });
        }

        // Try to find existing grade
        let grade = await Grade.findOne({ student, course });

        if (grade) {
            // Update existing grade
            grade.score = score;
            grade.letterGrade = letterGrade;
            grade.feedback = feedback;
            grade.faculty = faculty;
            await grade.save();
        } else {
            // Create new grade
            grade = new Grade({
                student,
                course,
                faculty,
                score,
                letterGrade,
                feedback
            });
            await grade.save();
        }

        const populatedGrade = await Grade.findById(grade._id)
            .populate('student', 'name rollNo email')
            .populate('course', 'name code credits')
            .populate('faculty', 'username email');

        res.json({
            message: grade.isNew ? 'Grade created successfully' : 'Grade updated successfully',
            grade: populatedGrade
        });
    } catch (error) {
        console.error('Create or update grade error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private (Admin)
const deleteGrade = async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);

        if (!grade) {
            return res.status(404).json({ message: 'Grade not found' });
        }

        await Grade.findByIdAndDelete(req.params.id);

        res.json({ message: 'Grade deleted successfully' });
    } catch (error) {
        console.error('Delete grade error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to calculate grade points
const calculateGradePoints = (letterGrade) => {
    const gradeScale = {
        'A+': 4.0,
        'A': 4.0,
        'A-': 3.7,
        'B+': 3.3,
        'B': 3.0,
        'B-': 2.7,
        'C+': 2.3,
        'C': 2.0,
        'C-': 1.7,
        'D+': 1.3,
        'D': 1.0,
        'F': 0.0
    };
    return gradeScale[letterGrade] || 0.0;
};

module.exports = {
    getAllGrades,
    getGradesByStudent,
    getGradesByCourse,
    createOrUpdateGrade,
    deleteGrade
}; 