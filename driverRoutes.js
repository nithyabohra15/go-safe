const express = require('express');
const router = express.Router();

// In-memory dummy drivers list
let drivers = [
  { id: 1, name: 'Amit Kumar', phone: '9876543210', vehicle: 'MH12AB3456', status: 'available' },
  { id: 2, name: 'Priya Sharma', phone: '9876543211', vehicle: 'DL4CAF6789', status: 'available' },
  { id: 3, name: 'Rahul Verma', phone: '9876543212', vehicle: 'KA03XY4567', status: 'available' }
];

// GET all drivers
router.get('/', (req, res) => {
  res.status(200).json(drivers);
});

// GET driver by ID
router.get('/:id', (req, res) => {
  const driver = drivers.find(d => d.id == req.params.id);
  if (!driver) {
    return res.status(404).json({ message: '❌ Driver not found' });
  }
  res.status(200).json(driver);
});

// POST a new driver
router.post('/', (req, res) => {
  const { name, phone, vehicle } = req.body;

  if (!name || !phone || !vehicle) {
    return res.status(400).json({ message: '⚠️ name, phone, and vehicle are required' });
  }

  const newDriver = {
    id: drivers.length + 1,
    name,
    phone,
    vehicle,
    status: 'available'
  };

  drivers.push(newDriver);
  res.status(201).json({ message: '✅ Driver added', driver: newDriver });
});

module.exports = router;
