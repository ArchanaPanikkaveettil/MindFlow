// models/BookingModel.js (FINAL CORRECTED)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        // MUST reference UserReg to fetch name/profile data
        ref: 'UserReg', 
        required: true
    },
    counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserReg',
    required: true
},
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['booked', 'completed', 'cancelled', 'rescheduled'], 
        default: 'booked'
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);