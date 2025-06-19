// Middleware to check if user has required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Access denied. No user found.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
            });
        }

        next();
    };
};

// Specific role middleware functions
const isAdmin = authorize('admin');
const isFaculty = authorize('admin', 'faculty');
const isStudent = authorize('admin', 'faculty', 'student');
const isAdminOrFaculty = authorize('admin', 'faculty');

module.exports = {
    authorize,
    isAdmin,
    isFaculty,
    isStudent,
    isAdminOrFaculty
}; 