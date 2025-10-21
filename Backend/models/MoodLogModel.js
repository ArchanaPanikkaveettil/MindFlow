const mongoose = require('mongoose');

// This stores student mood entries (Use Case 2, 6, Counselor Alert)
const moodLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Login', // Reference to the login entry/user
        required: true
    },
    emotion: { type: String, required: true }, // e.g., 'Happy', 'Sad', 'Calm'
    intensity: {
        type: Number, // User's input 1-10
        required: true,
        min: 1,
        max: 10 
    },
    notes: { type: String, maxlength: 500 },
    moodScore: { // Calculated score for analysis (1=lowest, 10=highest)
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    loggedAt: { type: Date, required: true }
}, { timestamps: true }); 


module.exports = mongoose.model('MoodLog', moodLogSchema);
