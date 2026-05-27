// routes/counselorRouter.js
const express = require('express');
const counselorRouter = express.Router();
const mongoose = require('mongoose'); 

const UserRegModel = require('../models/userModelReg');
const ScheduleModel = require('../models/ScheduleModel'); 
const MoodLogModel = require('../models/MoodLogModel'); 
const loginModel = require('../models/loginModel');
const BookingModel = require('../models/BookingModel');

const { authenticate, authorize, ROLES } = require('../middlewares/auth');

// =============================================
// PUBLIC LIST OF COUNSELORS
// =============================================
counselorRouter.get('/list-public', authenticate, authorize([ROLES.USER]), async (req, res) => {
  try {
    const counselorLoginIds = await loginModel.find({ role: ROLES.COUNSELOR }).select('_id');
    const counselorIdArray = counselorLoginIds.map(login => login._id);

    const counselorList = await UserRegModel.find({ 
      loginId: { $in: counselorIdArray } 
    }).select('loginId name phone gender'); 

    res.status(200).json({ success: true, error: false, message: "Counselor list fetched successfully", data: counselorList });
  } catch (error) {
    console.error("Public Counselor List Fetch Error:", error);
    res.status(500).json({ success: false, error: true, message: "Error fetching counselor list" });
  }
});

// =============================================
// PUBLIC AVAILABILITY ENDPOINT (Student Booking)
// =============================================
counselorRouter.get('/availability/public', authenticate, authorize([ROLES.USER]), async (req, res) => {
    try {
        const { gender } = req.query; 
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // 1. Find the LoginIds of counselors matching the requested gender
        const counselorProfiles = await UserRegModel.find({ gender: gender }, 'loginId');
        const counselorLoginIds = counselorProfiles.map(p => p.loginId.toString());

        if (counselorLoginIds.length === 0) {
            return res.status(200).json({ success: true, error: false, message: "No counselors found with this gender.", data: [] });
        }
        
        // 2. Find available, unbooked schedules for those counselors and future dates
        const availableSlots = await ScheduleModel.find({
            counselorId: { $in: counselorLoginIds },
            date: { $gte: startOfToday },
            isBooked: false,
            isAvailable: true
        })
        .select('counselorId date startTime endTime')
        .sort({ date: 1, startTime: 1 });

        // 3. Group by date for easier frontend consumption
        const groupedAvailability = availableSlots.reduce((acc, slot) => {
            const dateStr = slot.date.toISOString().split('T')[0];
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push({ 
                counselorId: slot.counselorId, 
                startTime: slot.startTime, 
                endTime: slot.endTime 
            });
            return acc;
        }, {});
        
        res.status(200).json({ 
            success: true, 
            error: false, 
            message: `Availability for ${gender} counselors fetched.`, 
            data: groupedAvailability 
        });

    } catch (error) {
        console.error("Public Availability Fetch Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error fetching counselor availability" });
    }
});


// COUNSELOR PROTECTED ROUTES START HERE (All routes below this line require Role 1)
counselorRouter.use(authenticate, authorize([ROLES.COUNSELOR]));

// =============================================
// GET /availability (Counselor Only)
// Fetch all availability slots for the logged-in counselor
// =============================================
counselorRouter.get('/availability', async (req, res) => {
    try {
        const slots = await ScheduleModel.find({
            counselorId: req.user.id
        })
        .sort({ date: 1, startTime: 1 })
        .populate({
            path: 'userId',
            model: 'UserReg',
            select: 'name phone'
        })
        .lean();

        res.status(200).json({ success: true, error: false, message: "Availability slots fetched", data: slots });
    } catch (error) {
        console.error("Availability Fetch Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error fetching availability slots" });
    }
});

// =============================================
// DELETE /availability/:slotId (Counselor Only)
// Delete an availability slot (or cancel it if booked)
// =============================================
counselorRouter.delete('/availability/:slotId', async (req, res) => {
    try {
        const slotId = req.params.slotId;
        const counselorId = req.user.id;

        const slot = await ScheduleModel.findOne({ _id: slotId, counselorId: counselorId });
        if (!slot) {
            return res.status(404).json({ success: false, error: true, message: "Slot not found" });
        }

        // If the slot is booked, we should cancel any associated Booking
        if (slot.isBooked && slot.userId) {
            // Find and cancel the booking
            const dateStr = slot.date.toISOString().split('T')[0];
            const [hours, minutes] = slot.startTime.split(':');
            const startDateTime = new Date(`${dateStr}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`);

            await BookingModel.updateMany(
                {
                    counselorId: counselorId,
                    startTime: startDateTime,
                    status: 'booked'
                },
                { $set: { status: 'cancelled' } }
            );
        }

        await ScheduleModel.deleteOne({ _id: slotId });
        res.status(200).json({ success: true, error: false, message: "Slot deleted successfully" });
    } catch (error) {
        console.error("Delete Slot Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error deleting slot" });
    }
});

// =============================================
// PUT /availability/toggle/:slotId (Counselor Only)
// Toggle availability (isAvailable) of a slot
// =============================================
counselorRouter.put('/availability/toggle/:slotId', async (req, res) => {
    try {
        const slotId = req.params.slotId;
        const counselorId = req.user.id;

        const slot = await ScheduleModel.findOne({ _id: slotId, counselorId: counselorId });
        if (!slot) {
            return res.status(404).json({ success: false, error: true, message: "Slot not found" });
        }

        slot.isAvailable = !slot.isAvailable;
        await slot.save();

        res.status(200).json({ success: true, error: false, message: "Slot availability updated", data: slot });
    } catch (error) {
        console.error("Toggle Slot Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error toggling slot availability" });
    }
});


// =============================================
// GET /students/profile/:loginId (Use Case: View Single Student Profile & History)
// =============================================
counselorRouter.get('/students/profile/:loginId', async (req, res) => {
    try {
        const studentLoginId = req.params.loginId; // This is the loginId (Login Model _id)
        
        // 1. Find the Login record to get the username (email)
        const loginRecord = await loginModel.findById(studentLoginId).select('username').lean();

        // 2. Find the student's User Profile using their loginId
        const studentProfile = await UserRegModel.findOne({ loginId: studentLoginId })
            .select('name phone gender classOrGroup counselorNotes')
            .lean();

        if (!studentProfile) {
            return res.status(404).json({ success: false, error: true, message: "Student profile not found." });
        }
        
        // Inject email (username) into the profile object
        studentProfile.email = loginRecord ? loginRecord.username : 'Email unavailable';

        // 3. Find the student's recent Mood History 
        // Convert the string loginId to a MongoDB ObjectId for the MoodLog query
        const studentObjectId = new mongoose.Types.ObjectId(studentLoginId);
        
        const moodHistory = await MoodLogModel.find({ userId: studentObjectId })
            .sort({ loggedAt: -1 }) 
            .limit(30) 
            .select('emotion intensity notes moodScore loggedAt')
            .lean();

        res.status(200).json({ 
            success: true, 
            error: false, 
            message: "Student profile and mood history fetched successfully", 
            data: {
                profile: studentProfile,
                moodHistory: moodHistory
            }
        });
    } catch (error) {
        console.error("Student Profile Fetch Error:", error);
        if (error.name === 'BSONTypeError') {
            return res.status(400).json({ success: false, error: true, message: "Invalid student ID format." });
        }
        res.status(500).json({ success: false, error: true, message: "Error fetching student details." });
    }
});

// =============================================
// NEW: PUT /students/profile/:loginId/notes (Use Case: Save Counselor Notes)
// =============================================
counselorRouter.put('/students/profile/:loginId/notes', async (req, res) => {
    try {
        const studentLoginId = req.params.loginId;
        const { counselorNotes } = req.body;

        const updatedProfile = await UserRegModel.findOneAndUpdate(
            { loginId: studentLoginId },
            { $set: { counselorNotes } },
            { new: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ success: false, error: true, message: "Student profile not found." });
        }

        res.status(200).json({ success: true, error: false, message: "Counselor notes updated successfully", data: updatedProfile });
    } catch (error) {
        console.error("Save Counselor Notes Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error updating counselor notes." });
    }
});


// =============================================
// NEW: GET /students/list (Use Case: View Students)
// Fetches all registered users who have the role of a standard student (Role 2).
// =============================================
counselorRouter.get('/students/list', async (req, res) => {
    try {
        // 1. Find all Login IDs that belong to standard users (Role 2)
        const studentLoginIds = await loginModel.find({ role: ROLES.USER }).select('_id');
        const studentIdArray = studentLoginIds.map(login => login._id);
        
        // 2. Find the corresponding User Profile records
        const studentList = await UserRegModel.find({ 
            loginId: { $in: studentIdArray } 
        })
        .select('loginId name phone gender classOrGroup')
        .sort({ name: 1 });

        res.status(200).json({ 
            success: true, 
            error: false, 
            message: "Student list fetched successfully", 
            data: studentList 
        });
    } catch (error) {
        console.error("Student List Fetch Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error fetching student list" });
    }
});


// =============================================
// SET AVAILABILITY
// =============================================
counselorRouter.post('/availability/set', async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: true, message: "Date, start time, and end time are required." });
    }

    const existingSlot = await ScheduleModel.findOne({ 
      counselorId: req.user.id, 
      date: new Date(date),
      startTime,
      isBooked: false 
    });

    if (existingSlot) {
      return res.status(409).json({ success: false, error: true, message: "This exact availability slot already exists." });
    }

    const newSlot = new ScheduleModel({
      counselorId: req.user.id,
      date: new Date(date),
      startTime,
      endTime,
      isAvailable: true,
      isBooked: false
    });

    const savedSlot = await newSlot.save();
    res.status(201).json({ success: true, error: false, message: "Availability slot set successfully", data: savedSlot });
  } catch (error) {
    console.error("Set Availability Error:", error);
    // Add specific check for duplication error (E11000)
    if (error.code && error.code === 11000) {
       return res.status(409).json({ success: false, error: true, message: "A slot for this date/time already exists for you." });
    }
    res.status(500).json({ success: false, error: true, message: "Error setting availability" });
  }
});


// =============================================
// FIX: VIEW UPCOMING SCHEDULE (Schedule Population)
// =============================================
counselorRouter.get('/schedule', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // CRITICAL FIX: The ScheduleModel's userId references the UserRegModel via the 'ref' definition.
    // The previous implementation was overly complex and likely broken by changes to the BookingModel.
    // We simply use the correct Mongoose population method here.
    let schedule = await ScheduleModel.find({
      counselorId: req.user.id, // Counselor's loginId (string)
      date: { $gte: startOfToday },
      isBooked: true
    })
    .sort({ date: 1, startTime: 1 })
    // FIX: Populate the userId field, which contains the student's loginId (used as ref) 
    // and correctly fetches the 'name' from the UserReg collection.
    .populate({
        path: 'userId', 
        model: 'UserReg', // Ensure this matches the ref in ScheduleModel (which links to UserReg)
        select: 'name'    // Only get the name field
    })
    .lean();
    
    // The old complex logic for handling missing IDs is now unnecessary because the model population is correct.

    res.status(200).json({ 
      success: true, 
      error: false, 
      message: "Counselor booked sessions fetched",
      data: schedule 
    });

  } catch (error) {
    console.error("Schedule Fetch Error:", error);
    res.status(500).json({ success: false, error: true, message: "Error fetching schedule" });
  }
});

module.exports = counselorRouter;
