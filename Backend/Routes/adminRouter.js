// routes/adminRouter.js
const express = require("express");
const adminRouter = express.Router();
const UserRegModel = require("../models/userModelReg");
const LoginModel = require("../models/loginModel");
const BookingModel = require("../models/BookingModel");
const PolicyModel = require("../models/PolicyModel"); // NEW: Import PolicyModel

const { authenticate, authorize, ROLES } = require("../middlewares/auth");

// ----------------------------------------------------------------------
// Use Case 1: List All Users (Admin Only) - (No change needed)
// ----------------------------------------------------------------------
adminRouter.get(
    "/users",
    authenticate,
    authorize([ROLES.ADMIN]),
    async (req, res) => {
        try {
            const users = await UserRegModel.find().populate("loginId", "-password"); // Exclude password from populated data
            res.status(200).json({ success: true, data: users });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: true,
                message: "Error fetching all users",
            });
        }
    }
);

// ----------------------------------------------------------------------
// NEW: View Single User (Admin Only) - (Keep existing logic)
// ----------------------------------------------------------------------
adminRouter.get(
    "/users/:id",
    authenticate,
    authorize([ROLES.ADMIN]),
    async (req, res) => {
        try {
            const profile = await UserRegModel.findById(req.params.id).populate(
                "loginId",
                "-password"
            );

            if (!profile) {
                return res
                    .status(404)
                    .json({ success: false, message: "User profile not found" });
            }
            res.status(200).json({ success: true, data: profile });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: true,
                message: "Error fetching user details",
            });
        }
    }
);

// ----------------------------------------------------------------------
// NEW: Update User Profile (Admin Only) - (Keep existing logic)
// ----------------------------------------------------------------------
adminRouter.put(
    "/users/:id",
    authenticate,
    authorize([ROLES.ADMIN]),
    async (req, res) => {
        try {
            const userId = req.params.id;
            const { name, phone, gender, classOrGroup } = req.body;

            const updatedProfile = await UserRegModel.findByIdAndUpdate(
                userId,
                { name, phone, gender, classOrGroup },
                { new: true, runValidators: true }
            );

            if (!updatedProfile) {
                return res
                    .status(404)
                    .json({ success: false, message: "User profile not found" });
            }

            res.status(200).json({
                success: true,
                message: "User profile updated successfully",
                data: updatedProfile,
            });
        } catch (error) {
            console.error(error);
            if (error.name === "ValidationError") {
                return res.status(400).json({ success: false, message: error.message });
            }
            res.status(500).json({
                success: false,
                error: true,
                message: "Error updating user profile",
            });
        }
    }
);

// ----------------------------------------------------------------------
// NEW: Update User Role (Admin Only) - (Keep existing logic)
// ----------------------------------------------------------------------
adminRouter.put(
    "/users/:loginId/role",
    authenticate,
    authorize([ROLES.ADMIN]),
    async (req, res) => {
        try {
            const loginId = req.params.loginId; // This must be the LoginModel's _id
            const { newRole } = req.body;

            const allowedRoles = [ROLES.USER, ROLES.COUNSELOR, ROLES.ADMIN]; // Only allow promotion/demotion to these roles
            if (!allowedRoles.includes(newRole)) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid role specified" });
            }

            const updatedLogin = await LoginModel.findByIdAndUpdate(
                loginId,
                { role: newRole },
                { new: true }
            );

            if (!updatedLogin) {
                return res
                    .status(404)
                    .json({ success: false, message: "Login credentials not found" });
            }

            res.status(200).json({
                success: true,
                message: `User role updated to ${newRole}`,
                data: updatedLogin,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: true,
                message: "Error updating user role",
            });
        }
    }
);

// ----------------------------------------------------------------------
// Use Case 1: Delete User (Admin Only) - (Keep existing logic)
// ----------------------------------------------------------------------
adminRouter.delete(
    "/users/:id",
    authenticate,
    authorize([ROLES.ADMIN]),
    async (req, res) => {
        try {
            const userId = req.params.id; // UserRegModel _id

            // 1. Delete the user's profile
            const profile = await UserRegModel.findByIdAndDelete(userId);

            if (!profile) {
                return res
                    .status(404)
                    .json({ success: false, message: "User profile not found" });
            }

            // 2. Delete the linked login credentials
            if (profile.loginId) {
                await LoginModel.findByIdAndDelete(profile.loginId);
                // 3. Optional: Delete associated bookings as well
                await BookingModel.deleteMany({ userId: profile.loginId });
            }

            res.status(200).json({
                success: true,
                message: "User, associated login, and bookings deleted successfully",
            });
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({ success: false, error: true, message: "Error deleting user" });
        }
    }
);

// ----------------------------------------------------------------------
// FIX: Implement GET Policies (Admin Only)
// ----------------------------------------------------------------------
adminRouter.get(
    "/policies",
    authenticate,
    authorize([ROLES.ADMIN]),
    async (req, res) => {
        try {
            const policies = await PolicyModel.find().sort({ createdAt: -1 });
            res.status(200).json({ success: true, data: policies });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: true, message: "Error fetching policies" });
        }
    }
);

// ----------------------------------------------------------------------
// Implement POST Policies (Admin Only) - Enables "Create New Policy" button
// ----------------------------------------------------------------------
adminRouter.post(
    "/policies",
    authenticate,
    authorize([ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { title, content } = req.body;
            if (!title || !content) {
                return res.status(400).json({ success: false, message: "Title and content are required." });
            }
            
            const newPolicy = new PolicyModel({ title, content });
            await newPolicy.save();
            
            res.status(201).json({ success: true, message: "New policy created successfully", data: newPolicy });
        } catch (error) {
             console.error(error);
             res.status(500).json({ success: false, error: true, message: "Error creating new policy" });
        }
    }
);

// ----------------------------------------------------------------------
// Implement PUT Policies (Admin Only) - Enables "Edit" button
// ----------------------------------------------------------------------
adminRouter.put(
    "/policies/:id",
    authenticate,
    authorize([ROLES.ADMIN]),
    async (req, res) => {
        try {
            const { title, content } = req.body;
            const updatedPolicy = await PolicyModel.findByIdAndUpdate(
                req.params.id,
                { title, content, date: new Date().toLocaleDateString('en-US') },
                { new: true, runValidators: true }
            );

            if (!updatedPolicy) {
                 return res.status(404).json({ success: false, message: "Policy not found." });
            }
            
            res.status(200).json({ success: true, message: "Policy updated successfully", data: updatedPolicy });
        } catch (error) {
             console.error(error);
             res.status(500).json({ success: false, error: true, message: "Error updating policy" });
        }
    }
);

module.exports = adminRouter;
