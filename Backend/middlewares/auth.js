// middlewares/auth.js
const jwt = require('jsonwebtoken');

// Define roles
const ROLES = {
    ADMIN: 0,
    COUNSELOR: 1,
    USER: 2
};

// Middleware 1: Checks for a valid JWT token
const authenticate = (req, res, next) => {
    // Get token from header (e.g., 'Bearer <token>')
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('DEBUG: Received Token:', token); // Log the received token
    // Log the secret being used (BE CAREFUL not to log this in production)
    console.log('DEBUG: JWT_SECRET used:', process.env.JWT_SECRET ? 'Exists' : 'MISSING!');
    console.log("JWT_SECRET loaded?", process.env.JWT_SECRET ? "✅ Yes" : "❌ No");





    if (!token) {
        return res.status(401).json({ success: false, error: true, message: "Access Denied: No token provided" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`DEBUG: Auth - Token Verified. User ID: ${verified.id}, Role: ${verified.role} (Type: ${typeof verified.role})`);
        req.user = verified;
        next();
    } catch (err) {
        console.error('DEBUG: Auth - Token Verification Error:', err.message);
        res.status(400).json({ success: false, error: true, message: "Invalid Token" });
    }
};


// Middleware 2: Checks if the authenticated user has one of the allowed roles
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        // req.user is set by the 'authenticate' middleware
        
        // --- CRITICAL LOGGING ---
        console.log(`DEBUG: Authorize - Required Roles: [${allowedRoles}], User Role: ${req.user.role}`);
        
        if (!req.user) {
             return res.status(401).json({ success: false, error: true, message: "Forbidden: Not authenticated." });
        }
        
        // Check if the user's role (which should be a number) is included in the array of allowed roles
        // We ensure the role is treated as a number just in case JWT decoded it as a string.
        if (!allowedRoles.includes(Number(req.user.role))) {
            console.error(`DEBUG: Authorize - Role check FAILED. User role (${req.user.role}) not in allowed roles [${allowedRoles}]`);
            return res.status(403).json({ success: false, error: true, message: "Forbidden: Insufficient permissions." });
        }
        next();
    };
};

module.exports = { authenticate, authorize, ROLES };
