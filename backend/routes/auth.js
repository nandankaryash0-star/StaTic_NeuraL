const express = require('express');
const router = express.Router();
const supabase = require('../db');
const Profile = require('../models/Profile');

// POST /auth/send-otp (MOCK)
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required.' });
    }

    // MOCK: Don't actually call Supabase/Twilio
    console.log(`[MOCK] Sending OTP to ${phone}`);

    res.json({ message: 'OTP sent successfully (Mock mode)' });
});

// POST /auth/verify-otp (MOCK + Mongo Upsert)
router.post('/verify-otp', async (req, res) => {
    const { phone, token } = req.body;

    if (!phone || !token) {
        return res.status(400).json({ error: 'Phone number and Token are required.' });
    }

    // FIXED OTP CHECK
    if (token !== '123456') {
        return res.status(401).json({ error: 'Invalid OTP. Use 123456.' });
    }

    try {
        // Ensure profile exists in Mongo (Create if not exists)
        // This satisfies "make sure no is also stored in db"
        const profile = await Profile.findOneAndUpdate(
            { phone },
            { phone }, // Ensure phone is set
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Return mock session structure
        res.json({
            message: 'Login successful',
            session: { access_token: 'mock-jwt-token' },
            user: { phone: phone, id: profile._id },
            profile: profile
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /auth/profile (MongoDB)
router.post('/profile', async (req, res) => {
    const { phone, name, age, tone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required to save profile.' });
    }

    try {
        const profile = await Profile.findOneAndUpdate(
            { phone },
            { name, age, tone },
            { new: true, upsert: true }
        );

        res.json({ message: 'Profile updated', profile });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
