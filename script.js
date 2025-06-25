document.addEventListener('DOMContentLoaded', () => {
    loadRooms();
    loadBookings();
    populateRoomDropdown();
    document.getElementById('booking-form').addEventListener('submit', createBooking);
    document.getElementById('room_id').addEventListener('change', toggleSecondGuestInput);
});

function loadRooms() {
    fetch('/api/rooms')
        .then(response => response.json())
        .then(rooms => {
            const tbody = document.querySelector('#rooms-table tbody');
            tbody.innerHTML = '';
            rooms.forEach(room => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${room.room_number}</td>
                    <td>${room.type}</td>
                    <td>$${room.price}</td>
                    <td>${room.is_available ? 'Available' : 'Booked'}</td>
                `;
                tbody.appendChild(row);
            });
        });
}

function loadBookings() {
    fetch('/api/bookings')
        .then(response => response.json())
        .then(bookings => {
            const tbody = document.querySelector('#bookings-table tbody');
            tbody.innerHTML = '';
            bookings.forEach(booking => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${booking.guest_name}</td>
                    <td>${booking.second_guest_name || '-'}</td>
                    <td>${booking.room_number}</td>
                    <td>${booking.check_in}</td>
                    <td>${booking.check_out}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteBooking(${booking.id})">Delete</button>
                        <button class="receipt-btn" onclick="downloadReceipt(${booking.id})">Download Receipt</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
}

function populateRoomDropdown() {
    fetch('/api/rooms')
        .then(response => response.json())
        .then(rooms => {
            const select = document.getElementById('room_id');
            select.innerHTML = '';
            rooms.filter(room => room.is_available).forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = `${room.room_number} (${room.type})`;
                option.dataset.type = room.type;
                select.appendChild(option);
            });
            toggleSecondGuestInput();
        });
}

function toggleSecondGuestInput() {
    const select = document.getElementById('room_id');
    const selectedOption = select.options[select.selectedIndex];
    const secondGuestContainer = document.getElementById('second-guest-container');
    const secondGuestInput = document.getElementById('second_guest_name');
    
    if (selectedOption && selectedOption.dataset.type === 'Double') {
        secondGuestContainer.style.display = 'block';
        secondGuestInput.required = true;
    } else {
        secondGuestContainer.style.display = 'none';
        secondGuestInput.required = false;
        secondGuestInput.value = '';
    }
}

function createBooking(event) {
    event.preventDefault();
    const select = document.getElementById('room_id');
    const selectedOption = select.options[select.selectedIndex];
    const isDoubleRoom = selectedOption.dataset.type === 'Double';

    const booking = {
        room_id: document.getElementById('room_id').value,
        guest_name: document.getElementById('guest_name').value,
        second_guest_name: isDoubleRoom ? document.getElementById('second_guest_name').value : null,
        check_in: document.getElementById('check_in').value,
        check_out: document.getElementById('check_out').value
    };

    fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
    })
    .then(response => response.json())
    .then(() => {
        document.getElementById('booking-form').reset();
        loadRooms();
        loadBookings();
        populateRoomDropdown();
    });
}

function deleteBooking(id) {
    fetch(`/api/bookings/${id}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(() => {
            loadRooms();
            loadBookings();
            populateRoomDropdown();
        });
}

function downloadReceipt(id) {
    window.location.href = `/api/bookings/${id}/receipt`;
}