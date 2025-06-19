const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization');

        // Check if no token
        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Extract token from "Bearer <token>"
        const actualToken = token.split(' ')[1];

        try {
            // Verify token
            const decoded = jwt.verify(actualToken, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');

            // Get user from the token
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });
            
            if (!user) {
                return res.status(401).json({ message: 'Token is not valid' });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = auth; 