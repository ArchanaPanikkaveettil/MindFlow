const mongoose = require('mongoose');

// Define Role mapping locally or ensure ROLES constant is imported if available
// For this model file, defining the map internally is cleaner:
const ROLE_MAP = {
    ADMIN: 0,
    COUNSELOR: 1,
    USER: 2
};

const loginSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // User's email
    password: { type: String, required: true }, // Hashed password
    role: { 
        type: Number, 
        required: true, 
        // Use the defined values for clearer reference
        enum: [ROLE_MAP.ADMIN, ROLE_MAP.COUNSELOR, ROLE_MAP.USER], 
        default: ROLE_MAP.USER // Setting a default role is helpful for public registration
    },
}, { timestamps: true });

module.exports = mongoose.model('Login', loginSchema);