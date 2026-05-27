const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mindflowDB';

const Login = require('./models/loginModel');
const Schedule = require('./models/ScheduleModel');

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        const counselors = [
            { email: "sarah.jenkins@mindflow.com", name: "Dr. Sarah Jenkins" },
            { email: "david.miller@mindflow.com", name: "Dr. David Miller" }
        ];

        const slots = [
            { start: "10:00", end: "11:00" },
            { start: "12:00", end: "13:00" },
            { start: "14:00", end: "15:00" }
        ];

        const today = new Date();

        for (const c of counselors) {
            const login = await Login.findOne({ username: c.email.toLowerCase() });
            if (!login) {
                console.log(`Counselor ${c.name} (${c.email}) not found!`);
                continue;
            }

            const counselorId = login._id.toString();
            console.log(`Found counselor ${c.name} with ID ${counselorId}`);

            // Clear old availability slots for this counselor to start fresh
            const deleteResult = await Schedule.deleteMany({ counselorId, isBooked: false });
            console.log(`Deleted ${deleteResult.deletedCount} unbooked availability slots for ${c.name}`);

            const slotsToInsert = [];
            // Seed slots for the next 7 days
            for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
                const date = new Date(today);
                date.setDate(today.getDate() + dayOffset);
                
                // Format date as YYYY-MM-DD using local values to get the true calendar day
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const dateStr = `${yyyy}-${mm}-${dd}`;
                const utcMidnightDate = new Date(dateStr); // Parses as UTC midnight: e.g. YYYY-MM-DDT00:00:00.000Z

                for (const slot of slots) {
                    slotsToInsert.push({
                        counselorId,
                        date: utcMidnightDate,
                        startTime: slot.start,
                        endTime: slot.end,
                        isAvailable: true,
                        isBooked: false
                    });
                }
            }

            const insertResult = await Schedule.insertMany(slotsToInsert);
            console.log(`Seeded ${insertResult.length} availability slots for ${c.name}!`);
        }

        mongoose.connection.close();
        console.log("Availability seeding completed successfully.");
    } catch (err) {
        console.error("Error seeding availability:", err);
    }
}

run();
