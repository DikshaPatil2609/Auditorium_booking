const db = require('../config/db');

exports.getAllBookings = async (req, res) => {
    try {
        const query = `
            SELECT b.*, u.name as user_name, u.department, a.name as auditorium_name 
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN auditoriums a ON b.auditorium_id = a.id
            ORDER BY b.start_time DESC
        `;
        const [bookings] = await db.query(query);
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const query = `
            SELECT b.*, a.name as auditorium_name 
            FROM bookings b
            JOIN auditoriums a ON b.auditorium_id = a.id
            WHERE b.user_id = :1
            ORDER BY b.start_time DESC
        `;
        const [bookings] = await db.query(query, [req.userId]);
        res.status(200).json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch your bookings' });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { auditorium_id, event_name, start_time, end_time } = req.body;
        const user_id = req.userId;

        // Basic validation
        if (new Date(start_time) >= new Date(end_time)) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Overlap Validation Feature:
        // Oracle requires dates to be parsed as dates. We convert strings to JS Dates before passing.
        const startDate = new Date(start_time);
        const endDate = new Date(end_time);

        const overlapQuery = `
            SELECT * FROM bookings 
            WHERE auditorium_id = :1 AND status = 'approved'
            AND (
                (start_time <= :2 AND end_time > :3) OR
                (start_time < :4 AND end_time >= :5) OR
                (start_time >= :6 AND end_time <= :7)
            )
        `;
        const [overlaps] = await db.query(overlapQuery, [
            auditorium_id, 
            startDate, startDate, 
            endDate, endDate,   
            startDate, endDate
        ]);

        if (overlaps.length > 0) {
            return res.status(409).json({ message: 'Time slot overlaps with an existing approved booking!' });
        }

        // Create booking as 'pending'
        const insertQuery = `
            INSERT INTO bookings (user_id, auditorium_id, event_name, start_time, end_time, status)
            VALUES (:1, :2, :3, :4, :5, 'pending')
        `;
        const [result] = await db.query(insertQuery, [user_id, auditorium_id, event_name, startDate, endDate]);
        
        // Fetch User name for the email
        const [userQuery] = await db.query('SELECT name FROM users WHERE id = :1', [user_id]);
        const userName = userQuery.length > 0 ? userQuery[0].name : "A Student";

        // Dispatch Email Notification in background
        const emailService = require('../services/emailService');
        emailService.sendAdminNotification(req.body, userName);

        // We aren't capturing the Oracle specific OUT bind for insertId, instead we provide a success response
        res.status(201).json({ message: 'Booking requested successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create booking' });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [result] = await db.query('UPDATE bookings SET status = :1 WHERE id = :2', [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: `Booking ${status} successfully` });

        // Dispatch Email Notification to User in background
        try {
            const [bookingQuery] = await db.query('SELECT b.*, u.email, u.name as user_name FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.id = :1', [id]);
            if (bookingQuery.length > 0) {
                const bDetails = bookingQuery[0];
                const emailService = require('../services/emailService');
                emailService.sendUserNotification(bDetails.email, bDetails.user_name, bDetails, status);
            }
        } catch (emailErr) {
            console.error('Failed to trigger email notification:', emailErr);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update booking status' });
    }
};
