const Student = require('../models/Student');

// Add new student
exports.createStudent = async (req, res) => {
  try {
    // Create student object
    const student = new Student(req.body);
    
    // Validate before saving
    const validationError = student.validateSync();
    if (validationError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationError.errors 
      });
    }
    
    // Save to database
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    // Handle MongoDB duplicate key errors (11000)
    if (err.code === 11000) {
      // Find out which field caused the duplicate error
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        error: `Duplicate ${field}. This ${field} is already in use.` 
      });
    }
    
    // Handle other errors
    console.error('Create student error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Fetch all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch single student
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json(student);
  } catch (err) {
    // Handle MongoDB duplicate key errors (11000)
    if (err.code === 11000) {
      // Find out which field caused the duplicate error
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        error: `Duplicate ${field}. This ${field} is already in use.` 
      });
    }
    
    // Handle other errors
    console.error('Update student error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
