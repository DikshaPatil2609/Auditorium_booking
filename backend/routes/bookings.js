const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get all bookings (Admins see all, Users see only their own if filtered in controller, but for now we'll allow users to see all approved to avoid overlaps, and see their own pending)
router.get('/', verifyToken, bookingController.getAllBookings);
router.get('/my-bookings', verifyToken, bookingController.getMyBookings);

// Submit a new booking request
router.post('/', verifyToken, bookingController.createBooking);

// Admin endpoints
router.put('/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);

module.exports = router;
