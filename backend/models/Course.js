const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 10]
        },
        set(value) {
            this.setDataValue('course_code', value.toUpperCase().trim());
        }
    },
    course_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 100]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 6
        }
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    semester: {
        type: DataTypes.ENUM('Fall', 'Spring', 'Summer'),
        allowNull: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 2020,
            max: 2030
        }
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['course_code']
        }
    ]
});

module.exports = Course; 