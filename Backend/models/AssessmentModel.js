const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Login',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    level: {
        type: String,
        required: true,
        enum: ['Mild', 'Moderate', 'Severe']
    },
    answers: [{
        type: Number
    }],
    takenAt: {
        type: Date,
        default: Date.now,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
