const { sequelize } = require('../config/database');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const bcrypt = require('bcryptjs');

// Define model associations
const defineAssociations = () => {
    // User associations
    User.hasMany(Student, { foreignKey: 'created_by', as: 'students' });
    User.hasMany(Course, { foreignKey: 'faculty_id', as: 'courses' });
    User.hasMany(Grade, { foreignKey: 'recorded_by', as: 'grades' });
    User.hasMany(Attendance, { foreignKey: 'recorded_by', as: 'attendance_records' });
    User.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements' });

    // Student associations
    Student.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
    Student.hasMany(Grade, { foreignKey: 'student_id', as: 'grades' });
    Student.hasMany(Attendance, { foreignKey: 'student_id', as: 'attendance_records' });

    // Course associations
    Course.belongsTo(User, { foreignKey: 'faculty_id', as: 'faculty' });
    Course.hasMany(Grade, { foreignKey: 'course_id', as: 'grades' });
    Course.hasMany(Attendance, { foreignKey: 'course_id', as: 'attendance_records' });

    // Grade associations
    Grade.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
    Grade.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
    Grade.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

    // Attendance associations
    Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
    Attendance.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
    Attendance.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

    // Announcement associations
    Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
};

// Seed initial data
const seedData = async () => {
    try {
        console.log('🌱 Seeding initial data...');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            username: 'admin',
            email: 'admin@school.com',
            password: adminPassword,
            role: 'admin',
            first_name: 'System',
            last_name: 'Administrator'
        });

        // Create faculty user
        const facultyPassword = await bcrypt.hash('faculty123', 10);
        const faculty = await User.create({
            username: 'faculty1',
            email: 'faculty@school.com',
            password: facultyPassword,
            role: 'faculty',
            first_name: 'John',
            last_name: 'Smith'
        });

        console.log('✅ Created users');

        // Create sample courses
        const courses = await Course.bulkCreate([
            {
                course_code: 'CS101',
                course_name: 'Introduction to Computer Science',
                description: 'Basic concepts of computer science and programming',
                credits: 3,
                department: 'Computer Science',
                faculty_id: faculty.id,
                semester: 'Fall',
                year: 2024
            },
            {
                course_code: 'MATH201',
                course_name: 'Calculus I',
                description: 'Differential and integral calculus',
                credits: 4,
                department: 'Mathematics',
                faculty_id: faculty.id,
                semester: 'Fall',
                year: 2024
            },
            {
                course_code: 'ENG101',
                course_name: 'English Composition',
                description: 'Academic writing and communication skills',
                credits: 3,
                department: 'English',
                faculty_id: faculty.id,
                semester: 'Fall',
                year: 2024
            }
        ]);

        console.log('✅ Created courses');

        // Create sample students
        const students = await Student.bulkCreate([
            {
                first_name: 'Alice',
                last_name: 'Johnson',
                email: 'alice.johnson@student.school.com',
                phone: '1234567890',
                roll_number: 'STU001',
                date_of_birth: '2002-05-15',
                address: '123 Main St, City, State',
                created_by: admin.id
            },
            {
                first_name: 'Bob',
                last_name: 'Williams',
                email: 'bob.williams@student.school.com',
                phone: '1234567891',
                roll_number: 'STU002',
                date_of_birth: '2002-08-22',
                address: '456 Oak Ave, City, State',
                created_by: admin.id
            },
            {
                first_name: 'Carol',
                last_name: 'Davis',
                email: 'carol.davis@student.school.com',
                phone: '1234567892',
                roll_number: 'STU003',
                date_of_birth: '2001-12-10',
                address: '789 Pine Rd, City, State',
                created_by: admin.id
            },
            {
                first_name: 'David',
                last_name: 'Brown',
                email: 'david.brown@student.school.com',
                phone: '1234567893',
                roll_number: 'STU004',
                date_of_birth: '2002-03-18',
                address: '321 Elm St, City, State',
                created_by: admin.id
            },
            {
                first_name: 'Emma',
                last_name: 'Wilson',
                email: 'emma.wilson@student.school.com',
                phone: '1234567894',
                roll_number: 'STU005',
                date_of_birth: '2002-07-25',
                address: '654 Maple Dr, City, State',
                created_by: admin.id
            }
        ]);

        console.log('✅ Created students');

        // Create sample grades
        const grades = [];
        for (const student of students) {
            for (const course of courses) {
                const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
                let letterGrade = 'F';
                if (score >= 97) letterGrade = 'A+';
                else if (score >= 93) letterGrade = 'A';
                else if (score >= 90) letterGrade = 'A-';
                else if (score >= 87) letterGrade = 'B+';
                else if (score >= 83) letterGrade = 'B';
                else if (score >= 80) letterGrade = 'B-';
                else if (score >= 77) letterGrade = 'C+';
                else if (score >= 73) letterGrade = 'C';
                else if (score >= 70) letterGrade = 'C-';

                grades.push({
                    student_id: student.id,
                    course_id: course.id,
                    score: score,
                    letter_grade: letterGrade,
                    exam_type: ['assignment', 'quiz', 'midterm', 'final'][Math.floor(Math.random() * 4)],
                    recorded_by: faculty.id,
                    recorded_date: new Date()
                });
            }
        }

        await Grade.bulkCreate(grades);
        console.log('✅ Created grades');

        // Create sample attendance records
        const attendanceRecords = [];
        const statuses = ['present', 'absent', 'excused', 'late'];
        
        for (let i = 0; i < 30; i++) { // 30 days of attendance
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            for (const student of students) {
                for (const course of courses) {
                    attendanceRecords.push({
                        student_id: student.id,
                        course_id: course.id,
                        date: date.toISOString().split('T')[0],
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        recorded_by: faculty.id
                    });
                }
            }
        }

        await Attendance.bulkCreate(attendanceRecords);
        console.log('✅ Created attendance records');

        // Create sample announcements
        await Announcement.bulkCreate([
            {
                title: 'Welcome to the New Semester!',
                content: 'We are excited to welcome all students to the Fall 2024 semester. Please check your course schedules and make sure you have all required materials.',
                priority: 'high',
                target_audience: 'students',
                created_by: admin.id,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            },
            {
                title: 'Faculty Meeting - October 15th',
                content: 'All faculty members are requested to attend the monthly meeting on October 15th at 2:00 PM in the main conference room.',
                priority: 'medium',
                target_audience: 'faculty',
                created_by: admin.id,
                valid_from: new Date(),
                valid_until: new Date('2024-10-15')
            },
            {
                title: 'Library Hours Extended',
                content: 'Starting this week, the library will be open until 10:00 PM on weekdays to accommodate student study needs.',
                priority: 'low',
                target_audience: 'all',
                created_by: admin.id,
                valid_from: new Date(),
                valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
            }
        ]);

        console.log('✅ Created announcements');
        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('👤 Admin: admin@school.com / admin123');
        console.log('👨‍🏫 Faculty: faculty@school.com / faculty123');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    }
};

// Main initialization function
const initializeDatabase = async () => {
    try {
        console.log('🚀 Initializing database...');
        
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        
        // Define associations
        defineAssociations();
        console.log('✅ Model associations defined');
        
        // Sync database (create tables)
        await sequelize.sync({ force: true }); // force: true will drop existing tables
        console.log('✅ Database tables created');
        
        // Seed initial data
        await seedData();
        
        console.log('\n🎊 Database initialization completed successfully!');
        console.log('🌐 You can now start the server with: npm run dev');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = {
    initializeDatabase,
    defineAssociations
}; 