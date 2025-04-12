const express = require('express');
const router = express.Router();

// Dummy driver list (simulating DB)
const drivers = [
  { id: 1, name: 'Amit Kumar', phone: '9876543210', vehicle: 'MH12AB3456', status: 'available' },
  { id: 2, name: 'Priya Sharma', phone: '9876543211', vehicle: 'DL4CAF6789', status: 'available' },
  { id: 3, name: 'Rahul Verma', phone: '9876543212', vehicle: 'KA03XY4567', status: 'available' }
];

// Ride ID mock tracker
let nextRideId = 101;

router.post('/book', (req, res) => {
  const {
    user_id,
    pickup_location,
    dropoff_location,
    vehicle,
    payment_method,
    fare // 👈 Received from frontend
  } = req.body;

  // Validation
  if (!user_id || !pickup_location || !dropoff_location || !vehicle || !payment_method || !fare) {
    return res.status(400).json({ message: '⚠️ All fields including fare are required' });
  }

  // Randomly assign a driver from list
  const driver = drivers[Math.floor(Math.random() * drivers.length)];

  // Mock ride ID
  const rideId = nextRideId++;

  // Response
  return res.status(200).json({
    message: '✅ Ride booked successfully',
    rideId,
    user_id,
    pickup_location,
    dropoff_location,
    vehicle,
    payment_method,
    fare,
    driver,
    status: 'Confirmed'
  });
});

module.exports = router;



