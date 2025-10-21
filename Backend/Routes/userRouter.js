const express = require('express');
const userRouter = express.Router();
const bcrypt = require('bcrypt');

// Corrected path: Go up two levels (routes -> Backend) then back down (Backend -> models)
const userRegModel = require('../models/userModelReg');
const loginModel = require('../models/loginModel');

// Corrected path: Go up two levels (routes -> Backend) then back down (Backend -> middlewares)
const { authenticate, authorize, ROLES } = require('../middlewares/auth'); 

// =========================================================
// 1. PUBLIC ROUTE: Register API (User/Student Role)
// =========================================================
userRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, gender, classOrGroup } = req.body;

        if (!name || !email || !password || !phone || !gender || !classOrGroup) {
            return res.status(400).json({ success: false, error: true, message: "All fields are required" });
        }
        
        // FIX: Ensure email is stored in lowercase for reliable lookup
        const lowerCaseEmail = email.toLowerCase(); 

        const existingLogin = await loginModel.findOne({ username: lowerCaseEmail });
        if (existingLogin) {
            return res.status(409).json({ success: false, error: true, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const loginData = new loginModel({
            username: lowerCaseEmail, // Use lowercase email
            password: hashedPassword,
            role: ROLES.USER // Default role for registration
        });
        const savedLogin = await loginData.save();

        const userData = new userRegModel({
            loginId: savedLogin._id, // Link to the login entry
            name,
            phone,
            // email is not stored in the profile model
            gender,
            classOrGroup: classOrGroup || null
        });
        const savedUser = await userData.save();

        // --- MODIFIED RESPONSE ---
        return res.status(201).json({
            success: true,
            error: false,
            message: "User registered successfully",
            profileData: {
                _id: savedUser._id,
                loginId: savedUser.loginId,
                name: savedUser.name,
                phone: savedUser.phone,
                gender: savedUser.gender,
                classOrGroup: savedUser.classOrGroup,
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt
            },
            loginData: {
                 _id: savedLogin._id,
                 username: savedLogin.username, // This is the email
                 role: savedLogin.role,
                 createdAt: savedLogin.createdAt,
                 updatedAt: savedLogin.updatedAt
            }
        });

    } catch (error) {
        console.error("Registration Backend Error:", error);
        return res.status(500).json({ success: false, error: true, message: "Something went wrong in registration backend" });
    }
});

// =========================================================
// 2. PROTECTED ROUTE: Get My Own Profile (User/Counselor)
// =========================================================
userRouter.get('/profile', authenticate, authorize([ROLES.USER, ROLES.COUNSELOR]), async (req, res) => {
    try {
        // Use ID from the authenticated token (req.user.id)
        const userId = req.user.id; 
        
        const user = await userRegModel.findOne({ loginId: userId }).populate('loginId');

        if (!user) {
            return res.status(404).json({ success: false, error: true, message: "User profile not found" });
        }

        return res.status(200).json({
            success: true,
            error: false,
            message: "User profile fetched successfully",
            data: user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: true, message: "Error fetching user profile" });
    }
});


// =========================================================
// 3. PROTECTED ROUTE: Update My Own Profile (User/Counselor)
// =========================================================

userRouter.put('/profile', authenticate, authorize([ROLES.USER, ROLES.COUNSELOR]), async (req, res) => {
    try {
        // Destructure fields that apply to both profiles and fields that are login-specific
        const { name, phone, gender, classOrGroup, newPassword } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role; // Role from the token (Login data)

        // 1. Prepare Updates for userRegModel (Profile Data)
        const profileUpdates = { name, phone, gender };
        
    
        if (userRole === ROLES.USER && classOrGroup !== undefined) {
            profileUpdates.classOrGroup = classOrGroup;
        }

        // Remove undefined fields to prevent Mongoose setting them to null
        Object.keys(profileUpdates).forEach(key => 
            profileUpdates[key] === undefined && delete profileUpdates[key]
        );

        // 2. Perform Update on userRegModel
        const updatedUser = await userRegModel.findOneAndUpdate(
            { loginId: userId }, 
            profileUpdates,
            { new: true, runValidators: true } // runValidators ensures Mongoose validations (like enums) are checked
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, error: true, message: "User profile not found" });
        }

        // 3. Handle Password Update (Optional)
        let loginUpdateSuccess = false;
        if (newPassword) {
            if (newPassword.length < 6) { // Basic password policy check
                return res.status(400).json({ success: false, error: true, message: "New password must be at least 6 characters long." });
            }
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await loginModel.updateOne(
                { _id: userId },
                { password: hashedPassword }
            );
            loginUpdateSuccess = true;
        }

        return res.status(200).json({
            success: true,
            error: false,
            message: `Profile updated successfully${loginUpdateSuccess ? ' and password changed' : ''}`,
            data: updatedUser
        });
        
    } catch (error) {
        console.error(error);
        // Better handling for Mongoose validation errors during update
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: true, message: error.message });
        }
        return res.status(500).json({ success: false, error: true, message: "Error updating profile" });
    }
});


module.exports = userRouter;
