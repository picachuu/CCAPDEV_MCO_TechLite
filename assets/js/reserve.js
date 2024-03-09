document.addEventListener('DOMContentLoaded', function() {
    populateDays();
    attachEventListeners();
});

function populateDays() {
    const daySelect = document.getElementById('daySelect');
    daySelect.innerHTML = '<option value="">Select a Day</option>'; // Reset
    const today = new Date();
    for (let i = 0; i < 3; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        const option = new Option(futureDate.toLocaleDateString(), futureDate.toISOString().split('T')[0]);
        daySelect.add(option);
    }
}

function attachEventListeners() {
    const tierSelect = document.getElementById('tierSelect');
    const daySelect = document.getElementById('daySelect');
    tierSelect.addEventListener('change', () => checkSelectionAndPopulateTimeBlocks());
    daySelect.addEventListener('change', () => checkSelectionAndPopulateTimeBlocks());
}

function checkSelectionAndPopulateTimeBlocks() {
    const tierSelect = document.getElementById('tierSelect');
    const daySelect = document.getElementById('daySelect');
    if (tierSelect.value && daySelect.value) {
        populateTimeBlocks(); // Populate if both selections are made
    } else {
        document.getElementById('timeBlocksContainer').style.display = 'none';
    }
}

const unavailableTimeSlots = {
    '12:00': { name: 'John Doe', email: 'john@example.com' },
    '12:30': { name: 'Jane Doe', email: 'jane@example.com' }
};

function showSeats(tier) {
    const seatsContainer = document.getElementById('seatsContainer');
    seatsContainer.innerHTML = ''; // Clear previous seats

    const columns = [];
    for (let i = 0; i < 3; i++) {
        const column = document.createElement('div');
        column.classList.add('seat-column');
        seatsContainer.appendChild(column);
        columns.push(column);
    }

    for (let i = 1; i <= 15; i++) {
        const seat = document.createElement('button');
        seat.classList.add('seat');
        const columnIndex = Math.floor((i - 1) / 5);
        seat.textContent = `Seat ${i}`;
        seat.addEventListener('click', function() {
            // Handle seat selection here
            if (!this.classList.contains('selected')) {
                // Optional: Clear previously selected seat if your logic requires single selection
                document.querySelectorAll('.seat.selected').forEach(selectedSeat => {
                    selectedSeat.classList.remove('selected');
                });
                this.classList.add('selected');
                populateTimeBlocks(); // Populate time blocks after seat is selected
            }
        });
        columns[columnIndex].appendChild(seat);
    }
}

function populateTimeBlocks() {
    const container = document.getElementById('timeBlocksContainer');
    container.innerHTML = ''; // Clear previous blocks
    container.style.display = 'block';

    let selectedBlocks = 0;

    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const block = document.createElement('button');
            block.classList.add('time-block');
            block.textContent = time;

            if (unavailableTimeSlots.hasOwnProperty(time)) {
                block.classList.add('unavailable');
                block.onclick = () => showDetails(time);
            } else {
                block.onclick = () => toggleSelection(block, selectedBlocks++);
            }

            container.appendChild(block);
        }
    }
}


function showDetails(time) {
    const details = unavailableTimeSlots[time];
    document.getElementById('name').value = details.name;
    document.getElementById('email').value = details.email;
    document.getElementById('reservationForm').style.display = 'block';
    document.getElementById('deleteButton').style.display = 'inline-block';
    document.getElementById('editButton').style.display = 'inline-block';
}

function toggleSelection(block, selectedBlocks) {
    block.classList.toggle('selected');
    const isSelected = block.classList.contains('selected');
    selectedBlocks = isSelected ? selectedBlocks + 1 : selectedBlocks - 1;

    const form = document.getElementById('reservationForm');
    form.style.display = selectedBlocks > 0 ? 'block' : 'none';
    if (form.style.display === 'none') {
        document.getElementById('deleteButton').style.display = 'none';
        document.getElementById('editButton').style.display = 'none';
    }
}

function deleteReservation() {
    // Implement deletion logic
    console.log('Delete reservation functionality to be implemented.');
}

function editReservation() {
    // Implement edit logic
    console.log('Edit reservation functionality to be implemented.');
}

document.getElementById('deleteButton').addEventListener('click', deleteReservation);
document.getElementById('editButton').addEventListener('click', editReservation);

function toggleFormVisibility(show) {
    const reservationForm = document.getElementById('reservationForm');
    if (show) {
        reservationForm.style.display = 'block'; // Show the form
    } else {
        reservationForm.style.display = 'none'; // Hide the form
        // Optionally reset the form fields here if desired
    }
}