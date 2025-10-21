// routes/loginRouter.js
const express = require('express');
const loginRouter = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 


const loginModel = require('../models/loginModel');
const userRegModel = require('../models/userModelReg');

// Login API
loginRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: true, message: "Email and password are required" });

        // FIX: Convert the incoming email to lowercase before querying the database
        const lowerCaseEmail = email.toLowerCase();
        
        const loginUser = await loginModel.findOne({ username: lowerCaseEmail });
        if (!loginUser) return res.status(404).json({ success: false, error: true, message: "User not found" });

        const isMatch = await bcrypt.compare(password, loginUser.password);
        if (!isMatch) return res.status(401).json({ success: false, error: true, message: "Invalid credentials" });

        // JWT GENERATION
        const token = jwt.sign(
            { id: loginUser._id, role: loginUser.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        const userProfile = await userRegModel.findOne({ loginId: loginUser._id });

        return res.status(200).json({
            success: true,
            error: false,
            message: "Login successful",
            role: loginUser.role,
            profile: userProfile,
            token: token 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: true, message: "Something went wrong in login backend" });
    }
});

module.exports = loginRouter;