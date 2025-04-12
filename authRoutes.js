const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/userModel');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// POST /api/auth/register
router.post('/register', upload.single('govt_id'), (req, res) => {
    const { name, email, phone, password } = req.body;
    const govIDPath = req.file ? req.file.path : null;

    User.findByEmail(email, (err, existingUser) => {
        if (err) return res.status(500).send({ message: 'Error checking existing user' });
        if (existingUser) return res.status(400).send({ message: 'User already exists' });

        const hashedPassword = bcrypt.hashSync(password, 8);

        User.create({ name, email, phone, password: hashedPassword, govIDPath }, (err, result) => {
            if (err) return res.status(500).send({ message: 'Error registering user' });
            res.status(201).send({ id: result.insertId, name, email });
        });
    });
});

module.exports = router;

