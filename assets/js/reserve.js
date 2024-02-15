function showSeats(tier) {
    const seatsContainer = document.getElementById('seatsContainer');
    seatsContainer.innerHTML = ''; // Clear previous seats
    let selectedSeat = null; // Keep track of the selected seat

    // Create a container for each column to hold the seats
    const columns = [];
    for (let i = 0; i < 3; i++) {
        const column = document.createElement('div');
        column.classList.add('seat-column');
        seatsContainer.appendChild(column);
        columns.push(column);
    }

    // Populate each column with 5 seats
    for (let i = 1; i <= 15; i++) {
        const seat = document.createElement('button');
        seat.classList.add('seat');
        
        // Determine the column index (0, 1, or 2) based on the seat number
        const columnIndex = Math.floor((i - 1) / 5);

        if (Math.random() < 0.3) { // 30% chance a seat is unavailable
            seat.classList.add('unavailable');
        } else {
            // Add click event to available seats
            seat.addEventListener('click', function() {
                // Highlight the selected seat and unhighlight the previous one
                if (selectedSeat) {
                    selectedSeat.classList.remove('selected');
                }
                this.classList.add('selected');
                selectedSeat = this;

                // Display the reservation form
                document.getElementById('reservationForm').style.display = 'block';
                document.getElementById('name').value = ''; // Reset form values
                document.getElementById('timeFrom').value = '';
                document.getElementById('timeTo').value = '';
            });
        }

        seat.textContent = `Seat ${i}`;
        columns[columnIndex].appendChild(seat);
    }
}



function submitReservation() {
    // Example validation: check if name is entered
    const name = document.getElementById('name').value;
    if (name.trim() === '') {
        alert('Please enter your name.');
        return;
    }

    // Simulate a successful reservation
    document.getElementById('confirmationPopup').style.display = 'block';
}

function closePopup() {
    document.getElementById('confirmationPopup').style.display = 'none';
}
