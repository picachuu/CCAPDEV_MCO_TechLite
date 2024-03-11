document.addEventListener('DOMContentLoaded', function() {
    populateDays();
    attachEventListeners();
});

function populateDays() {
    const daySelect = document.getElementById('daySelect');
    daySelect.innerHTML = '<option value = "0">Select a Day</option>'; // Reset
    const today = new Date('2024-03-09');
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
    if (tierSelect.value && daySelect.value != "0") {
        // BRO THIS WAS ONLY populateTimeBlocks() XDDDDDDD
        showSeats(tierSelect.value); // Populate if both selections are made
    } else {
        document.getElementById('seatsContainer').innerHTML = ''; // Clear seats
        document.getElementById('timeBlocksContainer').style.display = 'none';
        document.getElementById('reservationForm').style.display = 'none';
    }
}

let unavailableTimeSlots = {
    '12:00': { name: 'John Doe', email: 'john@example.com' },
    '12:30': { name: 'Jane Doe', email: 'jane@example.com' }
};

function validateSelection() {
    const tierSelect = document.getElementById('tierSelect').value;
    const daySelect = document.getElementById('daySelect').value;
    
    // Check if both selections are valid
    if (tierSelect && daySelect != "0") {
        showSeats(tierSelect); // Now we only show seats if both selections are valid
    } else {
        document.getElementById('seatsContainer').innerHTML = ''; // Clear seats
        document.getElementById('timeBlocksContainer').style.display = 'none';
        document.getElementById('reservationForm').style.display = 'none';
    }
}

// function to determine if the current seat is unavailable or not based on number of taken_false seats
function isSeatUnavailable(seatNumber, tierNumber, daySelected) {
    var isUnavailable = false;
    
    //if you're worried about 30, 31, and then 1 (of next month), dw. Month doesn't really matter, only the days ;)
    
    $.ajax({
        url: 'reserve',
        type: 'POST',
        data: { seat_num: Number(seatNumber), tier_num: tierNumber, day_num: daySelected, mode: "taken_false"},
        async: false,  // Make the request synchronous
        success: function(available, status) {
            if (status === 'success') {
                let size = Number(available.seats.length);
                isUnavailable = size == 0;
            }
        },
        error: function() {
            //no errors :)
        }
    });
    
    return isUnavailable;
    //return isUnavailable;
}

function showSeats(tier) {
    const seatsContainer = document.getElementById('seatsContainer');
    seatsContainer.innerHTML = ''; // Clear previous seats

    //also get the day selected to determine which to fetch from db

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

        // Check if seat is unavailable

        let selected_tier = Number(document.getElementById('tierSelect').value.slice(4));
        let day = Number(document.getElementById('daySelect').value.slice(8));

        
        if (  isSeatUnavailable(i, selected_tier, day) ) {
            seat.classList.add('unavailable');
        }//else, then available
        else {
            seat.addEventListener('click', function() {
                // Handle seat selection here
                if (!this.classList.contains('selected')) {
                    // Optional: Clear previously selected seat if your logic requires single selection
                    document.querySelectorAll('.seat.selected').forEach(selectedSeat => {
                        selectedSeat.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    populateTimeBlocksRes(i, selected_tier, day); // Populate time blocks after seat is selected
                }
            });
        }
        
        columns[columnIndex].appendChild(seat);
    }
}

var is_prev_timeBlock_taken = false;

function populateTimeBlocksRes(seat_number, tier_number, day_number) {
    const container = document.getElementById('timeBlocksContainer');
    container.innerHTML = ''; // Clear previous blocks
    container.style.display = 'block';

    let selectedBlocks = 0;

    // Fetch time blocks from server based on seat number, tier number, and day number
    $.ajax({
        url: 'reserve',
        type: 'POST',
        data: { seat_num: Number(seat_number), tier_num: tier_number, day_num: day_number, mode: "all"},
        async: false,  // Make the request synchronous
        success: function(all, status) {
            if (status === 'success') {
                unavailableTimeSlots = {};

                //similar to the seat columns, but this time for the time slots it's a row
                const rows = [];
                for (let i = 0; i < 4; i++) {
                    const row = document.createElement('div');
                    row.classList.add('slot-row');
                    container.appendChild(row); 
                    rows.push(row);
                }

                //add the timeblocks
                for (let i = 0; i < all.seats.length; i++) {

                    //just adding the time slots content
                    const time = `${Math.floor((all.seats[i].time_start)/100).toString().padStart(2, '0')}:${((all.seats[i].time_start)%100).toString().padStart(2, '0')}`;
                    const block = document.createElement('button');
                    block.classList.add('time-slot');
                    block.textContent = time;

                    const rowIndex = Math.floor(i / 12);

                    if(all.seats[i].taken == true) { 
                        block.classList.add('unavailable');
                        unavailableTimeSlots[time] = { name: all.seats[i].assigned_to, email: all.seats[i].email };
                        //better we modify na rin the unavailableTimeSlots[]
                        
                        block.onclick = () => showDetails(time);
                    } else {
                        block.onclick = () =>  {

                            if (is_prev_timeBlock_taken) {
                                // Clear the 'name' input field
                                let nameInput = document.getElementById('reservationName');
                                if (nameInput) {
                                    nameInput.value = '';
                                }

                                // Clear the 'email' input field
                                let emailInput = document.getElementById('reservationEmail');
                                if (emailInput) {
                                    emailInput.value = '';
                                }
                            }
                            is_prev_timeBlock_taken = false;

                            if (selectedBlocks < 4) { 
                                block.classList.toggle('selected');
                                const isSelected = block.classList.contains('selected');
                                selectedBlocks = isSelected ? selectedBlocks + 1 : selectedBlocks - 1;
                        
                                const form = document.getElementById('reservationForm');

                                

                                let hasSelectedBlcoks = selectedBlocks > 0;

                                if (!hasSelectedBlcoks) {
                                    // Clear the 'name' input field
                                    let nameInput = document.getElementById('reservationName');
                                    if (nameInput) {
                                        nameInput.value = '';
                                    }

                                    // Clear the 'email' input field
                                    let emailInput = document.getElementById('reservationEmail');
                                    if (emailInput) {
                                        emailInput.value = '';
                                    }
                                }

                                form.style.display = hasSelectedBlcoks ? 'block' : 'none';  // hides the reservationForm section

                                if (form.style.display === 'none') {
                                    document.getElementById('deleteButton').style.display = 'none';
                                    document.getElementById('editButton').style.display = 'none';
                                }
                            }
                            else if (selectedBlocks == 4 && block.classList.contains('selected')) {
                                block.classList.toggle('selected');
                                selectedBlocks = selectedBlocks - 1;
                            }
                        }
                    }
                    rows[rowIndex].appendChild(block);
                }
                
            }
        },
        error: function() {
            //no errors :)
        }
    });

    // used inside the ajax but replaced
    // for (let hour = 0; hour < 24; hour++) {
    //     for (let minute = 0; minute < 60; minute += 30) {
    //         const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    //         const block = document.createElement('button');
    //         block.classList.add('time-slot');
    //         block.textContent = time;

    //         if (unavailableTimeSlots.hasOwnProperty(time)) {
    //             block.classList.add('unavailable');
    //             block.onclick = () => showDetails(time);
    //         } else {
    //             block.onclick = () => toggleSelection(block, selectedBlocks++);
    //         }

    //         container.appendChild(block);
    //     }
    // }
}

function submitReservation() {
    if (!logged) {
        alert('Please log in to reserve a seat.');
        return false;
    }
    return true;
}

function showDetails(time) {
    is_prev_timeBlock_taken = true;

    const details = unavailableTimeSlots[time];
    
    const form = $('#reservationForm');
    document.getElementById('reservationName').value = details.name; 
    document.getElementById('reservationEmail').value = details.email; 
    
    document.getElementById('reservationForm').style.display = 'block';
    document.getElementById('deleteButton').style.display = 'inline-block';
    document.getElementById('editButton').style.display = 'inline-block';
}

function toggleSelection(block, selectedBlocks) {   //currenlty unused
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

function toggleFormVisibility(show) {   // currently unused
    const reservationForm = document.getElementById('reservationForm');
    if (show) {
        reservationForm.style.display = 'block'; // Show the form
    } else {
        reservationForm.style.display = 'none'; // Hide the form
        // Optionally reset the form fields here if desired
    }
}