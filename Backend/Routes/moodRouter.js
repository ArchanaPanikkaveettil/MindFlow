// routes/moodRouter.js
const express = require('express');
const moodRouter = express.Router();
const mongoose = require('mongoose'); // <--- FIX: Added missing Mongoose import

// Corrected Path: '../../' (Assuming your project structure is 'routes' -> 'models')
const MoodLogModel = require('../models/MoodLogModel');
const UserRegModel = require('../models/userModelReg');
const AssessmentModel = require('../models/AssessmentModel');
// Corrected Path: '../../'
const { authenticate, authorize, ROLES } = require('../middlewares/auth');

// Helper function to calculate a normalized mood score (1=lowest, 10=highest)
const calculateMoodScore = (emotion, intensity) => {
    // This logic ensures that low intensity of sadness results in a low score, 
    // and high intensity of happiness results in a high score.
    let score = intensity;
    if (['Sad', 'Angry', 'Anxious', 'Low'].includes(emotion)) {
        // Invert the intensity for negative emotions (e.g., intensity 10 = score 1)
        score = 11 - intensity;
    }
    return Math.max(1, Math.min(10, score));
};

// =========================================================
// 1. POST /log (User/Student Only)
// Use Case 2: Log your Mood
// =========================================================
moodRouter.post('/log', authenticate, authorize([ROLES.USER]), async (req, res) => {
    try {
        const { emotion, intensity, notes, logDate, activities, triggers } = req.body; // Added activities & triggers
        // Validate that emotion and intensity are provided
        if (!emotion || !intensity) {
            return res.status(400).json({ success: false, error: true, message: "Emotion and intensity are required." });
        }

        // Determine the date to log
        // Use the provided logDate if it's a valid date string, otherwise default to now
        const dateToLog = logDate && !isNaN(new Date(logDate)) ? new Date(logDate) : new Date();

        const moodScore = calculateMoodScore(emotion, intensity);

        const newLog = new MoodLogModel({
            userId: req.user.id,
            emotion,
            intensity,
            notes,
            moodScore,
            loggedAt: dateToLog,
            activities: activities || [],
            triggers: triggers || []
        });

        const savedLog = await newLog.save();
        res.status(201).json({ success: true, error: false, message: "Mood logged successfully", data: savedLog });
    } catch (error) {
        console.error("Mood Log Backend Error:", error); // Log the actual error
        res.status(500).json({ success: false, error: true, message: "Error logging mood" });
    }
});

// =========================================================
// 2. GET /report/weekly (User/Student Only)
// Use Case 6: View Weekly Report
// =========================================================
moodRouter.get('/report/weekly', authenticate, authorize([ROLES.USER]), async (req, res) => {
    try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        // Convert the string ID from the token into a MongoDB ObjectId
        // THIS LINE NOW WORKS because Mongoose is imported at the top
        const userIdAsObjectId = new mongoose.Types.ObjectId(req.user.id); 

        const report = await MoodLogModel.aggregate([
            // FIX: Use the converted ObjectId for matching
            { $match: { userId: userIdAsObjectId, loggedAt: { $gte: oneWeekAgo } } }, 
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$loggedAt" } }, 
                    averageScore: { $avg: "$moodScore" } 
                } 
            },
            { $sort: { "_id": 1 } }
        ]);
        
        res.status(200).json({ success: true, error: false, message: "Weekly report fetched", data: report });
    } catch (error) {
        // Log the full error to the console for debugging
        console.error("Weekly Report Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error fetching report" });
    }
});

// =========================================================
// 3. GET /alerts/low-mood (Counselor Only)
// Feature: Counselor Alert (2-week sustained low mood)
// =========================================================
moodRouter.get('/alerts/low-mood', authenticate, authorize([ROLES.COUNSELOR]), async (req, res) => {
    try {
        // --- CHANGE HERE: Calculate date range for the last 2 weeks (14 days) ---
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        const lowMoodStudents = await MoodLogModel.aggregate([
            // 1. Match: Filter logs for the last 2 weeks
            { $match: { loggedAt: { $gte: twoWeeksAgo } } },
            // 2. Group: Calculate average score and total logs per student
            { $group: { _id: "$userId", averageMood: { $avg: "$moodScore" }, logCount: { $sum: 1 } } },
            // 3. Filter: Apply alert criteria (Avg score <= 4 AND at least 5 logs)
            { $match: { averageMood: { $lte: 4 }, logCount: { $gte: 5 } } },
            // 4. Verify user role is Student (role = 2)
            {
                $lookup: {
                    from: 'logins',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'loginInfo'
                }
            },
            { $unwind: '$loginInfo' },
            { $match: { 'loginInfo.role': 2 } }, // Only select students
            // 5. Lookup: Join with User Profile to get student name/contact details
            {
                $lookup: {
                    from: 'userregs', // Target collection name (Mongoose pluralizes the model name 'UserReg')
                    localField: '_id', // userId from MoodLog
                    foreignField: 'loginId', // Corresponds to loginId in UserRegModel
                    as: 'studentProfile'
                }
            },
            // 6. Unwind: Flatten the array created by lookup
            { $unwind: '$studentProfile' }
        ]);

        res.status(200).json({ success: true, error: false, message: "Low mood alerts fetched", data: lowMoodStudents });
    } catch (error) {
        console.error("Alerts Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error fetching alerts" });
    }
});

// =========================================================
// 4. GET /latest (User/Student Only)
// =========================================================
moodRouter.get('/latest', authenticate, authorize([ROLES.USER]), async (req, res) => {
    try {
        const latestLog = await MoodLogModel.findOne({ userId: req.user.id })
            .sort({ loggedAt: -1 });
        res.status(200).json({ success: true, error: false, data: latestLog });
    } catch (error) {
        console.error("Latest Mood Fetch Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error fetching latest mood" });
    }
});

// =========================================================
// 5. POST /assessment (User/Student Only)
// =========================================================
moodRouter.post('/assessment', authenticate, authorize([ROLES.USER]), async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ success: false, error: true, message: "Answers are required." });
        }

        const score = answers.reduce((sum, val) => sum + Number(val), 0);
        let level = 'Mild';
        if (score > 9) {
            level = 'Severe';
        } else if (score > 4) {
            level = 'Moderate';
        }

        const newAssessment = new AssessmentModel({
            userId: req.user.id,
            score,
            level,
            answers
        });

        const saved = await newAssessment.save();
        res.status(201).json({ success: true, error: false, message: "Stress assessment saved successfully", data: saved });
    } catch (error) {
        console.error("Save Assessment Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error saving stress assessment" });
    }
});

// =========================================================
// 6. GET /assessment/history (User/Student Only)
// =========================================================
moodRouter.get('/assessment/history', authenticate, authorize([ROLES.USER]), async (req, res) => {
    try {
        const history = await AssessmentModel.find({ userId: req.user.id }).sort({ takenAt: -1 });
        res.status(200).json({ success: true, error: false, data: history });
    } catch (error) {
        console.error("Fetch Assessment History Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error fetching assessment history" });
    }
});

// =========================================================
// 7. GET /assessment/history/:studentId (Counselor Only)
// =========================================================
moodRouter.get('/assessment/history/:studentId', authenticate, authorize([ROLES.COUNSELOR]), async (req, res) => {
    try {
        const history = await AssessmentModel.find({ userId: req.params.studentId }).sort({ takenAt: -1 });
        res.status(200).json({ success: true, error: false, data: history });
    } catch (error) {
        console.error("Fetch Student Assessment History Error:", error);
        res.status(500).json({ success: false, error: true, message: "Error fetching student assessment history" });
    }
});

module.exports = moodRouter;