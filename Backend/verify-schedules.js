const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mindflowDB';

const Schedule = require('./models/ScheduleModel');

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        const countSarah = await Schedule.countDocuments({ counselorId: '6a16ec5dbaae762cabef9507' });
        const countDavid = await Schedule.countDocuments({ counselorId: '6a16ec5dbaae762cabef950c' });
        console.log(`Sarah Jenkins slots: ${countSarah}`);
        console.log(`David Miller slots: ${countDavid}`);

        const sarahSlots = await Schedule.find({ counselorId: '6a16ec5dbaae762cabef9507' }).sort({ date: 1, startTime: 1 });
        console.log("Sarah Jenkins first 5 slots:");
        sarahSlots.slice(0, 5).forEach((slot, i) => {
            console.log(`- Date: ${slot.date.toISOString()}, startTime: ${slot.startTime}, endTime: ${slot.endTime}, isBooked: ${slot.isBooked}, isAvailable: ${slot.isAvailable}`);
        });

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

run();
