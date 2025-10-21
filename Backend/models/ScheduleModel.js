// models/ScheduleModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ScheduleSchema = new Schema({
    // Identifier for the Counselor who owns this slot
    counselorId: {
        type: String,
        required: true,
    },
    
    // CRITICAL FIX: The type must be ObjectId, and ref must be to 'UserReg' 
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserReg', // <-- Set reference to UserReg where the name lives
        default: null, 
    },
    
    date: {
        type: Date,
        required: true,
    },
    
    startTime: {
        type: String,
        required: true,
    },
    
    endTime: {
        type: String,
        required: true,
    },
    
    isAvailable: {
        type: Boolean,
        default: true,
    },
    
    isBooked: {
        type: Boolean,
        default: false,
    }

}, { 
    timestamps: true 
});

// Prevent duplicate slot entries
ScheduleSchema.index({ counselorId: 1, date: 1, startTime: 1 }, { unique: true });

const ScheduleModel = mongoose.model('Schedule', ScheduleSchema);

module.exports = ScheduleModel;