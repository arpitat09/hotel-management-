CREATE DATABASE hotel_db;
USE hotel_db;

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    second_guest_name VARCHAR(100),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

INSERT INTO rooms (room_number, type, price) VALUES
('101', 'Single', 50.00),
('102', 'Double', 80.00),
('201', 'Suite', 150.00);