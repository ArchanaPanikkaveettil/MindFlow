const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mindflowDB';

const Login = require('./models/loginModel');
const MoodLog = require('./models/MoodLogModel');

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        const archanaEmail = "solitudemeh@gmail.com";
        const archanaLogin = await Login.findOne({ username: archanaEmail });

        if (!archanaLogin) {
            console.error(`ERROR: Could not find login for Archana (${archanaEmail}).`);
            process.exit(1);
        }

        const userId = archanaLogin._id;
        console.log(`Clearing all existing mood logs for Archana (loginId: ${userId})...`);
        await MoodLog.deleteMany({ userId });

        const logsToInsert = [];
        const now = new Date();

        // Seed 14 days of sustained low mood logs (all score <= 4)
        const lowEmotions = [
            { emotion: 'Sad', intensity: 8, notes: 'Feeling really down and overwhelmed with classes.' },
            { emotion: 'Anxious', intensity: 9, notes: 'Extremely anxious about my grades.' },
            { emotion: 'Low', intensity: 8, notes: 'No energy to get out of bed today.' },
            { emotion: 'Angry', intensity: 8, notes: 'Frustrated and feeling hopeless.' }
        ];

        // Seed 10 logs in 14 days
        for (let i = 14; i >= 0; i--) {
            if (i % 3 === 0) continue; // skip some days

            const date = new Date(now);
            date.setDate(now.getDate() - i);

            const template = lowEmotions[i % lowEmotions.length];
            const moodScore = 11 - template.intensity; // Inverted score for negative emotions

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
        console.log(`Successfully seeded ${insertResult.length} low mood logs for Archana!`);

        mongoose.connection.close();
    } catch (err) {
        console.error("Seeding error:", err);
    }
}

run();
