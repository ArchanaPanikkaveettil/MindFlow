const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UserReg = require('./models/userModelReg');
const MoodLog = require('./models/MoodLogModel');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mindflowDB';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        // Find all users named "Archana" case-insensitively
        const students = await UserReg.find({ name: /Archana/i });
        if (students.length === 0) {
            console.error("Student 'Archana' not found in database! Please make sure you have registered this name.");
            process.exit(1);
        }

        for (const student of students) {
            const userId = student.loginId;
            console.log(`Found student: ${student.name}, userId (loginId): ${userId}`);

            // Clean up old mood logs for this user to start fresh
            const deleteResult = await MoodLog.deleteMany({ userId });
            console.log(`Deleted ${deleteResult.deletedCount} existing mood logs for ${student.name}.`);

            const logsToInsert = [];
            const now = new Date();

            // 1. Seed 2 weeks of GOOD mood logs (from 21 days ago to 8 days ago)
            const goodEmotions = [
                { emotion: 'Happy', intensity: 8, notes: 'Feeling great, had a productive study session!' },
                { emotion: 'Calm', intensity: 7, notes: 'Relaxing evening reading a book.' },
                { emotion: 'Energetic', intensity: 9, notes: 'Had an awesome workout, full of energy!' },
                { emotion: 'Happy', intensity: 7, notes: 'Spent time with friends and had fun.' }
            ];

            for (let i = 21; i >= 8; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                
                const template = goodEmotions[i % goodEmotions.length];
                const moodScore = template.intensity; // Positive emotions: score equals intensity

                logsToInsert.push({
                    userId,
                    emotion: template.emotion,
                    intensity: template.intensity,
                    notes: template.notes,
                    moodScore,
                    loggedAt: date
                });
            }

            // 2. Seed 1 week of BAD mood logs (from 7 days ago to today)
            const badEmotions = [
                { emotion: 'Anxious', intensity: 8, notes: 'Really stressed about upcoming exams and workload.' },
                { emotion: 'Sad', intensity: 7, notes: 'Feeling isolated and down today.' },
                { emotion: 'Low', intensity: 8, notes: 'Low energy, did not want to do anything.' },
                { emotion: 'Angry', intensity: 7, notes: 'Frustrated with study progress.' }
            ];

            for (let i = 7; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);

                const template = badEmotions[i % badEmotions.length];
                const moodScore = 11 - template.intensity; // Negative emotions: score is inverted

                logsToInsert.push({
                    userId,
                    emotion: template.emotion,
                    intensity: template.intensity,
                    notes: template.notes,
                    moodScore,
                    loggedAt: date
                });
            }

            const insertResult = await MoodLog.insertMany(logsToInsert);
            console.log(`Successfully seeded ${insertResult.length} mood logs for ${student.name}!`);
        }

        mongoose.connection.close();
        console.log("Database connection closed.");
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
