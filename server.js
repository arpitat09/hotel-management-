const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Replace with your MySQL username
    password: 'Arpita@123', // Replace with your MySQL password
    database: 'hotel_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected');
});

// API Endpoints
// Get all rooms
app.get('/api/rooms', (req, res) => {
    db.query('SELECT * FROM rooms', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
    db.query('SELECT b.id, b.guest_name, b.second_guest_name, b.check_in, b.check_out, r.room_number, r.type, r.price FROM bookings b JOIN rooms r ON b.room_id = r.id', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Create a booking
app.post('/api/bookings', (req, res) => {
    const { room_id, guest_name, second_guest_name, check_in, check_out } = req.body;
    const booking = { room_id, guest_name, second_guest_name, check_in, check_out };
    db.query('INSERT INTO bookings SET ?', booking, (err, result) => {
        if (err) throw err;
        db.query('UPDATE rooms SET is_available = FALSE WHERE id = ?', [room_id], err => {
            if (err) throw err;
            res.json({ message: 'Booking created', id: result.insertId });
        });
    });
});

// Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
    const bookingId = req.params.id;
    db.query('SELECT room_id FROM bookings WHERE id = ?', [bookingId], (err, results) => {
        if (err) throw err;
        const roomId = results[0].room_id;
        db.query('DELETE FROM bookings WHERE id = ?', [bookingId], (err) => {
            if (err) throw err;
            db.query('UPDATE rooms SET is_available = TRUE WHERE id = ?', [roomId], err => {
                if (err) throw err;
                res.json({ message: 'Booking deleted' });
            });
        });
    });
});

// Download receipt
app.get('/api/bookings/:id/receipt', (req, res) => {
    const bookingId = req.params.id;
    db.query('SELECT b.id, b.guest_name, b.second_guest_name, b.check_in, b.check_out, r.room_number, r.type, r.price FROM bookings b JOIN rooms r ON b.room_id = r.id WHERE b.id = ?', [bookingId], (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.status(404).send('Booking not found');

        const booking = results[0];
        const doc = new PDFDocument();
        const filename = `receipt_${bookingId}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Hotel Booking Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Booking ID: ${booking.id}`);
        doc.text(`Room Number: ${booking.room_number}`);
        doc.text(`Room Type: ${booking.type}`);
        doc.text(`Guest Name: ${booking.guest_name}`);
        if (booking.second_guest_name) {
            doc.text(`Second Guest Name: ${booking.second_guest_name}`);
        }
        doc.text(`Check-in: ${booking.check_in}`);
        doc.text(`Check-out: ${booking.check_out}`);
        doc.text(`Price per Night: $${booking.price}`);
        doc.moveDown();
        doc.text('Thank you for your stay!', { align: 'center' });

        doc.end();
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});