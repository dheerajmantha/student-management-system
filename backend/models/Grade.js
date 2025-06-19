const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grade = sequelize.define('Grade', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Students',
            key: 'id'
        }
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    letter_grade: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F']]
        }
    },
    exam_type: {
        type: DataTypes.ENUM('assignment', 'quiz', 'midterm', 'final', 'project', 'presentation', 'other'),
        allowNull: true,
        defaultValue: 'assignment'
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    recorded_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    recorded_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    indexes: [
        {
            fields: ['student_id', 'course_id']
        }
    ]
});

module.exports = Grade; 