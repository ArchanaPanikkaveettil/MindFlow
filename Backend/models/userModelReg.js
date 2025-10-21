// models/userModelReg.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userRegSchema = new Schema({
    loginId: {
        type: Schema.Types.ObjectId,
        ref: 'Login',
        required: true,
        unique: true // Ensures 1:1 profile
    },
    name: { type: String, required: true },
    // email is intentionally removed from this profile schema
    phone: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    // --- ADD THIS LINE ---
    classOrGroup: { type: String },
    // --- END OF ADDITION ---
}, { timestamps: true });

module.exports = mongoose.model('UserReg', userRegSchema);