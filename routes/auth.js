const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // In a real application, you would validate against a database
    // For this example, we'll use a hardcoded admin account
    if (username === process.env.ADMIN_USERNAME && 
        password === process.env.ADMIN_PASSWORD) {
        
        const payload = {
            user: {
                id: 'admin',
                role: 'admin'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

module.exports = router; 