const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); // To load process.env.JWT_SECRET
const app = express();

// Load environment variables from .env file
dotenv.config();

// --- Import all router files from the ./routes directory ---
const userRouter = require('./Routes/userRouter');
const loginRouter = require('./Routes/loginRouter');
const moodRouter = require('./Routes/moodRouter'); 
const bookingRouter = require('./Routes/bookingRouter'); 
const counselorRouter = require('./Routes/counselorRouter'); 
const adminRouter = require('./Routes/adminRouter'); // Added Admin Router


// ----- Middleware -----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    // Allow the preflight request to pass through
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ---- Define routes ----
// Login/Register routes are under /auth
app.use(loginRouter); 
app.use(userRouter);          // User profile and updates
app.use('/mood', moodRouter);           // Mood logging and reports/alerts
app.use('/bookings', bookingRouter);    // Session booking and management
app.use('/counselor', counselorRouter); // Counselor-specific actions
app.use('/admin', adminRouter);         // Admin-specific actions

// ---- Connect to the database ----
const PORT = process.env.PORT || 5000;
// Use MONGO_URI from .env or default for connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mindflowDB'; 

mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} and connected to MongoDB`);
        });
    })
    .catch((error) => {
        console.error("DB connection error:", error.message);
    });
