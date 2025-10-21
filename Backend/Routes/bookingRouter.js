const express = require('express');
const bookingRouter = express.Router(); 
const mongoose = require('mongoose');

const BookingModel = require('../models/BookingModel'); 
const ScheduleModel = require('../models/ScheduleModel'); 
const { authenticate, authorize, ROLES } = require('../middlewares/auth');

// =========================================================
// 1. POST /book (User/Student Only) - Booking Logic
// =========================================================
bookingRouter.post('/book', authenticate, authorize([ROLES.USER]), async (req, res) => {
    try {
        const { counselorId, startTime, endTime } = req.body; 
        const studentId = req.user.id; 

        // --- Prepare Date/Time for Matching (CRITICAL REVISION) ---
        
        // 1. Convert the incoming ISO string to a Date object.
        const incomingDate = new Date(startTime);

        // 2. Get the date part (YYYY-MM-DD) from the local time of the incoming date for exact database match.
        const year = incomingDate.getFullYear();
        const month = String(incomingDate.getMonth() + 1).padStart(2, '0');
        const day = String(incomingDate.getDate()).padStart(2, '0');
        const datePart = `${year}-${month}-${day}`;
        
        // 3. Create the Date object set to midnight UTC for the DB query 
        const dateToMatch = new Date(datePart); 

        // 4. Extract HH:MM strings using the date object's local time components
        const startTimeStr = incomingDate.getHours().toString().padStart(2, '0') + ':' + incomingDate.getMinutes().toString().padStart(2, '0');
        const endTimeStr = new Date(endTime).getHours().toString().padStart(2, '0') + ':' + new Date(endTime).getMinutes().toString().padStart(2, '0');     
        
        // --- 2. Find an AVAILABLE schedule slot ---
        const scheduleSlot = await ScheduleModel.findOne({
            counselorId: counselorId,
            date: dateToMatch, 
            startTime: startTimeStr, 
            endTime: endTimeStr,     
            isBooked: false,
            isAvailable: true
        });

        if (!scheduleSlot) {
            return res.status(404).json({ success: false, error: true, message: "Available slot not found or already booked." });
        }

        // 3. Create the Booking entry
        const newBooking = new BookingModel({
            userId: studentId,
            counselorId: counselorId,
            startTime: incomingDate, // Use the original incoming Date object
            endTime: new Date(endTime),
            status: 'booked'
        });
        await newBooking.save();

        // 4. Update the Schedule slot
        await ScheduleModel.updateOne(
            { _id: scheduleSlot._id },
            { $set: { isBooked: true, userId: studentId } } 
        );
        
        res.status(201).json({ success: true, error: false, message: "Session booked successfully", data: newBooking });


    } catch (error) {
        console.error("Booking API Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error processing booking" });
    }
});

// =========================================================
// 2. GET /my-sessions (User/Student Only) - View Bookings
// ... (No change)
// =========================================================
bookingRouter.get('/my-sessions', authenticate, authorize([ROLES.USER]), async (req, res) => {
    try {
        const studentId = req.user.id; 

        const bookings = await BookingModel.find({ userId: studentId })
            .sort({ startTime: 1 }) 
            .populate({
                path: 'counselorId', 
                model: 'UserReg', 
                foreignField: 'loginId', 
                select: 'name gender' 
            });

        res.status(200).json({ 
            success: true, 
            error: false, 
            message: "My bookings fetched successfully", 
            data: bookings 
        });

    } catch (error) {
        console.error("My Bookings Fetch Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error fetching user bookings" });
    }
});

// =========================================================
// 3. PUT /cancel/:bookingId (User/Student Only) - Cancel Booking
// =========================================================
bookingRouter.put('/cancel/:bookingId', authenticate, authorize([ROLES.USER]), async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const studentId = req.user.id;
        
        // 1. Find the booking
        const booking = await BookingModel.findOne({
            _id: bookingId,
            userId: studentId,
            status: 'booked'
        });

        if (!booking) {
            return res.status(404).json({ success: false, error: true, message: "Booking not found or already completed/cancelled." });
        }

        // 2. Update the booking status
        booking.status = 'cancelled';
        await booking.save();

        // 3. Find and update the Schedule slot (Unlocks the slot)
        
        // --- CRITICAL FIX START: Match exactly what was stored during booking ---
        const startTimeLocal = new Date(booking.startTime);

        // Adjust for the timezone shift by taking the local date components
        const year = startTimeLocal.getFullYear();
        const month = String(startTimeLocal.getMonth() + 1).padStart(2, '0');
        const day = String(startTimeLocal.getDate()).padStart(2, '0');
        const datePart = `${year}-${month}-${day}`;
        const date = new Date(datePart);
        
        // Extract HH:MM strings using the time component of the stored date object
        const startTimeStr = startTimeLocal.getHours().toString().padStart(2, '0') + ':' + startTimeLocal.getMinutes().toString().padStart(2, '0');
        const endTimeStr = new Date(booking.endTime).getHours().toString().padStart(2, '0') + ':' + new Date(booking.endTime).getMinutes().toString().padStart(2, '0');
        
        const counselorLoginId = booking.counselorId.toString();

        // Perform the update
        const scheduleUpdateResult = await ScheduleModel.findOneAndUpdate(
            { 
                counselorId: counselorLoginId, 
                date: date,                    
                startTime: startTimeStr,       
                endTime: endTimeStr,           
                isBooked: true,                
            },
            { 
                $set: { isBooked: false, userId: null } // Free the slot and clear user ID
            },
            { new: true }
        );
        // --- CRITICAL FIX END ---
        
        if (!scheduleUpdateResult) {
             console.warn(`Schedule slot not found for cancellation matching: ${counselorLoginId}, ${datePart}, ${startTimeStr}`);
        }


        return res.status(200).json({ 
            success: true, 
            error: false, 
            message: "Session cancelled successfully and slot made available.", 
            data: booking 
        });

    } catch (error) {
        console.error("Cancellation Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error processing cancellation." });
    }
});


module.exports = bookingRouter;