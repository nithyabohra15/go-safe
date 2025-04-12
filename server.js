require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5501;

// ✅ Middleware
app.use(cors({
    origin: "http://127.0.0.1:5503", // Adjust as needed
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// ✅ Multer config for govt_id upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, "uploads");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
const upload = multer({ storage });

// ✅ MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gosafe',
    port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.stack);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// ✅ Register Route
app.post("/api/auth/register", upload.single("govt_id"), async (req, res) => {
    const { name, email, phone, password } = req.body;
    const govtIdPath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (name, email, phone, password, govt_id) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [name, email, phone, hashedPassword, govtIdPath], (err, result) => {
            if (err) {
                console.error("❌ Error registering user:", err);
                return res.status(500).send({ message: "Error registering user" });
            }
            res.status(201).send({ message: "✅ User registered successfully" });
        });
    } catch (error) {
        res.status(500).send({ message: "❌ Server error" });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1h',
        });

        // ✅ Include user ID in the response
        res.status(200).send({
            message: 'Login successful',
            token,
            user_id: user.id, // 👈 this is what your frontend needs
        });
    });
});

app.post('/api/safety-settings', (req, res) => {
    const { user_id, locationSharing, emergencyContact, alertMessage, alertType } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const settings = [
        { name: 'locationSharing', value: locationSharing ? 'true' : 'false' },
        { name: 'emergencyContact', value: emergencyContact },
        { name: 'alertMessage', value: alertMessage },
        { name: 'alertType', value: alertType }
    ];

    const sql = `
        INSERT INTO safety_settings (user_id, setting_name, setting_value)
        VALUES ?
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `;

    const values = settings.map(setting => [userId, setting.name, setting.value]);

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error("❌ Error saving safety settings:", err);
            return res.status(500).json({ message: "Server error saving safety settings" });
        }

        res.status(200).json({ message: "✅ Safety settings saved successfully" });
    });
});

const database = require('./db'); // ✅ Adjust this path to your actual DB connection file

// ✅ Static driver list
const drivers = [
    { id: 1, name: 'Amit Kumar', phone: '9876543210', vehicle: 'MH12AB3456' },
    { id: 2, name: 'Priya Sharma', phone: '9876543211', vehicle: 'DL4CAF6789' },
    { id: 3, name: 'Rahul Verma', phone: '9876543212', vehicle: 'KA03XY4567' }
];

// ✅ Book Ride Route (using static driver)
app.post('/api/book-ride', (req, res) => {
    const {
        user_id,
        pickup_location,
        dropoff_location,
        vehicle,
        payment_method,
        fare
    } = req.body;

    if (!user_id || !pickup_location || !dropoff_location || !vehicle || !payment_method || !fare) {
        return res.status(400).json({ message: '⚠️ All fields including fare are required' });
    }

    const driver = drivers[Math.floor(Math.random() * drivers.length)];

    res.status(200).json({
        message: '✅ Ride booked successfully',
        rideId: Math.floor(1000 + Math.random() * 9000),
        pickup_location,
        dropoff_location,
        vehicle,
        payment_method,
        fare,
        driver,
        status: 'Confirmed'
    });
});

const driverRoutes = require('./routes/driverRoutes');
app.use('/api/driver', driverRoutes);


// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});


 