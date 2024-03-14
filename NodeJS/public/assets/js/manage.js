//This file is here for future reference if needed. Remnants of LV's stupidity e_e

// //to avoid conflict with reserve.js 
if (window.location.pathname === '/manage') {
    document.addEventListener('DOMContentLoaded', function() {
        //document.forms["reservationForm"]["tierSelect"].value = 'tier0';
        //document.forms["reservationForm"]["tierSelect"].disabled = false;
        //document.forms["reservationForm"]["daySelect"].disabled = false;
        //document.getElementById('tierSelect').value = 'tier0';
        //document.forms["reservationForm"]["userName"].value = getUsername();
        //document.forms["reservationForm"]["userEmail"].value = getEmail();
        displayManageablecontent();
    });
}

function displayManageablecontent() {
    // Get the current URL
    const url = new URL(window.location.href);

    // Get the search parameters from the URL
    const searchParams = url.searchParams;

    // Access individual parameters by name
    const tier = searchParams.get('tier'); 
    const seats = searchParams.get('seats');
    const username = searchParams.get('username'); 
    const email = searchParams.get('email'); 
    const reservations = Number(searchParams.get('reservations'));
    // In new db implementation, just obtain the iso 8601 date format
    
    const month = searchParams.get('month'); 
    const day = searchParams.get('day');
    const year = searchParams.get('year'); 

    
    switch (Number(tier)) {
        case 1: document.forms["reservationForm"]["tierSelect"].value = "tier1"; break;
        case 2: document.forms["reservationForm"]["tierSelect"].value = "tier2"; break;
        case 3: document.forms["reservationForm"]["tierSelect"].value = "tier3"; break;
    }

    document.forms["reservationForm"]["userName"].value = username;
    document.forms["reservationForm"]["userEmail"].value = email;

    //modify the date
    const daySelect = document.getElementById('daySelect');
    daySelect.innerHTML = `<option value = "${year}-${month}-${day}">${year}-${month}-${day}</option>`; // Reset
    document.forms["reservationForm"]["daySelect"].value = `${year}-${month}-${day}`;

    //add the seat
    const seat = document.createElement('button');
    seat.classList.add('seat');
    seat.textContent = `Seat ${seats}`;
    seat.classList.add('unavailable');
    const seatsContainer = document.getElementById('seatsContainer');
    seatsContainer.appendChild(seat);

    //clear the timeblocks container
    const container = document.getElementById('timeBlocksContainer');
    container.innerHTML = ''; // Clear previous blocks
    container.style.display = 'block';

    for (let i = 1; i <= reservations; i++) {
        const time_start = searchParams.get('time_start' + i);
        addTimeblock(seats, tier, day, time_start, username);
    }
   
}

function addTimeblock(seatNumber, tierNumber, daySelected, time_start, assigned_to) {

    $.ajax({
        url: 'manageable-check',
        type: 'POST',
        data: { 
            tier_num: tierNumber, 
            seat_num: Number(seatNumber), 
            user_name: assigned_to,
            time_start: time_start,
            day_num: daySelected, 
            mode: "find_timeslot"
        },
        
        async: false,  // Make the request synchronous
        success: function(reserved, status) {
            if (status === 'success') {
                const timeBlocksContainer = document.getElementById('timeBlocksContainer');
                const block = document.createElement('button');
                block.classList.add('time-slot');
                block.textContent = `${Math.floor((reserved.seat.time_start)/100).toString().padStart(2, '0')}:${((reserved.seat.time_start)%100).toString().padStart(2, '0')}`;

                block.onclick = () =>  {
                    block.classList.toggle('selected');
                }
                
                timeBlocksContainer.appendChild(block);
            }
        },
        error: function() {
            //no errors :)
        }
    });
    
}
// //added 2 to every function name to avoid conflict with the reserve.js functions
// // Why? Cause element 'reservationForm' should not be hidden in manage.hbs
// function attachEventListeners2() {
//     const tierSelect = document.getElementById('tierSelect');
//     const daySelect = document.getElementById('daySelect');
//     tierSelect.addEventListener('change', () => checkSelectionAndPopulateTimeBlocks2());
//     daySelect.addEventListener('change', () => checkSelectionAndPopulateTimeBlocks3());
// }

// function checkSelectionAndPopulateTimeBlocks2() {
//     const tierSelect = document.getElementById('tierSelect');
//     if (tierSelect.value != "tier0") {
//         populateDays2();
//         showSeats2(tierSelect.value); // Populate if both selections are made
//         //even if no date was selected, no seat will be displayed
//     } else {
//         populateDays2();
//         document.getElementById('seatsContainer').innerHTML = ''; // Clear seats
//         document.getElementById('timeBlocksContainer').style.display = 'none';
//         //document.getElementById('reservationForm').style.display = 'none';
//         //to hide the buttons below, siguro just add a class "locked" then the buttons will be unselectable and change color to gray
//         // hide the delete button
//         // hide the update button
//     }
// }

// function checkSelectionAndPopulateTimeBlocks3() {
//     const tierSelect = document.getElementById('tierSelect');
//     const daySelect = document.getElementById('daySelect');
//     if (tierSelect.value != "tier0" && daySelect.value != "000000000") {
//         // only change the seats when the date is being changed
//         showSeats2(tierSelect.value); // Populate if both selections are made
//     } else {
//         document.getElementById('seatsContainer').innerHTML = ''; // Clear seats
//         document.getElementById('timeBlocksContainer').style.display = 'none';
//         //document.getElementById('reservationForm').style.display = 'none';
//         // hide the delete button
//         // hide the update button
//     }
// }

// //to be called in populateDays2()
// //used also in populateTiers()
// function hasReservations_atDayX(day, tier) { 
//     //return true if there are reservations at the day selected given the tier
//     var hasReservations = false;
    
//     $.ajax({
//         url: 'manageable-check',
//         type: 'POST', 
//         data: { tier_num: tier, 
//             user_name: getUsername(),
//             day_num: day, //refers to actual day in db, not index from today
//             mode: "days"
//         },
//         async: false,  // Make the request synchronous
//         success: function(available, status) {
//             if (status === 'success') {
//                 hasReservations = available.isAvail;
//             }
//         },
//         error: function() {
//             //no errors :)
//         }
//     });
    
//     return hasReservations;
//     //return isUnavailable;
// }

// function populateTiers() {
//     const tierSelect = document.getElementById('tierSelect');
//     tierSelect.innerHTML = '<option value="tier0">Select a Tier</option>';

    
//     const today = new Date('2024-03-09');
//     const futureDate = new Date(today);

//     for (let i = 1; i < 4; i++) { // iterate through each tier 

//         let hasReservations = false;

//         for (let j = 0; j < 3 && !hasReservations; j++) { // iterate through each day
//             futureDate.setDate(today.getDate() + j);
//             hasReservations = hasReservations_atDayX(futureDate.getDate(), i);
//         }

//         if (hasReservations) {
//             const option = new Option('Tier ' + i, 'tier' + i);
//             tierSelect.add(option);
//         }
//     }
// }

// function populateDays2() {
//     // modify to only display the days where user has selected a tier

//     const daySelect = document.getElementById('daySelect');
//     daySelect.innerHTML = '<option value = "000000000">Select a Day</option>';
//     const today = new Date('2024-03-09');
//     for (let i = 0; i < 3; i++) { //iterate through each day
//         // 
//         const futureDate = new Date(today);
//         futureDate.setDate(today.getDate() + i);

//         let selected_tier = Number(document.getElementById('tierSelect').value.slice(4));
//         let hasReservations = hasReservations_atDayX(futureDate.getDate(), selected_tier);

//         if (hasReservations) {
//             const option = new Option(futureDate.toLocaleDateString(), futureDate.toISOString().split('T')[0]);
//             daySelect.add(option);
//         }
//     }
// }

// function validateSelection2() {
//     const tierSelect = document.getElementById('tierSelect').value;
//     const daySelect = document.getElementById('daySelect').value;
    
//     // Check if both selections are valid
//     if (tierSelect && daySelect != "0") {
//         showSeats2(tierSelect); // Now we only show seats if both selections are valid
//     } else {
//         document.getElementById('seatsContainer').innerHTML = ''; // Clear seats
//         document.getElementById('timeBlocksContainer').style.display = 'none';

//         // hide the delete button
//     }
// }

// function isSeatUnavailable_Manage(seat, tier, day) {
//     //returning true will mean that the seat has no reservation of current user at the day selected
//     var isUnavailable;
    
//     $.ajax({
//         url: 'manageable-check',
//         type: 'POST', 
//         data: { tier_num: tier, 
//             seat_num: seat,
//             user_name: getUsername(),
//             day_num: day, //refers to actual day in db, not index from today
//             mode: "seats_reserved"
//         },
//         async: false,  // Make the request synchronous
//         success: function(available, status) {
//             if (status === 'success') {
//                 isUnavailable = !(available.isAvail);
//             }
//         },
//         error: function() {
//             //no errors :)
//         }
//     });
    
//     return isUnavailable;
// }

// //this function is called only when tier has value, anything that follows depends on if day has value
// function showSeats2(tier) {
//     const seatsContainer = document.getElementById('seatsContainer');
//     seatsContainer.innerHTML = ''; // Clear previous seatsContainer

//     //also get the day selected to determine which to fetch from db
//     let day = Number(document.getElementById('daySelect').value.slice(8));
//     let selected_tier = Number(document.getElementById('tierSelect').value.slice(4));

//     if (day != 0) { // if no date was yet seleceted, do not display any seat
//         const columns = [];
//         for (let i = 0; i < 3; i++) {
//             const column = document.createElement('div');
//             column.classList.add('seat-column');
//             seatsContainer.appendChild(column);
//             columns.push(column);
//         }

//         for (let i = 1; i <= 15; i++) {
//             const seat = document.createElement('button');
//             seat.classList.add('seat');
//             const columnIndex = Math.floor((i - 1) / 5);
//             seat.textContent = `Seat ${i}`;
    
//             // Check if seat is unavailable
//             if ( isSeatUnavailable_Manage(i, selected_tier, day) ) {
//                 seat.classList.add('unavailable');
//             }//else, then available
//             else {
//                 seat.addEventListener('click', function() {
//                     // Handle seat selection here
//                     if (!this.classList.contains('selected')) {
//                         // Optional: Clear previously selected seat if your logic requires single selection
//                         document.querySelectorAll('.seat.selected').forEach(selectedSeat => {
//                             selectedSeat.classList.remove('selected');
//                         });
//                         this.classList.add('selected');
//                         populateTimeBlocksRes2(i, selected_tier, day); // Populate time blocks after seat is selected
//                     }
//                 });
//             }
            
//             columns[columnIndex].appendChild(seat);
//         }
//     }
    
// }

// function populateTimeBlocksRes2(seat_number, tier_number, day_number) {
//     const container = document.getElementById('timeBlocksContainer');
//     container.innerHTML = ''; // Clear previous blocks
//     container.style.display = 'block';

//     let selectedBlocks = 0;

//     // Fetch time blocks from server based on seat number, tier number, and day number
//     $.ajax({
//         url: 'manageable-check',
//         type: 'POST',
//         data: 
//         { tier_num: tier_number, 
//             seat_num: seat_number,
//             user_name: getUsername(),
//             day_num: day_number, //refers to actual day in db, not index from today
//             mode: "timeblocks_of_seat_X"
//         },
//         async: false,  // Make the request synchronous
//         success: function(all, status) {
//             if (status === 'success') {
//                 //similar to the seat columns, but this time for the time slots it's a row
//                 const rows = [];
//                 for (let i = 0; i < 4; i++) {
//                     const row = document.createElement('div');
//                     row.classList.add('slot-row');
//                     container.appendChild(row); 
//                     rows.push(row);
//                 }

//                 //add the timeblocks
//                 for (let i = 0; i < all.seats.length; i++) {

//                     //just adding the time slots content
//                     const time = `${Math.floor((all.seats[i].time_start)/100).toString().padStart(2, '0')}:${((all.seats[i].time_start)%100).toString().padStart(2, '0')}`;
//                     const block = document.createElement('button');
//                     block.classList.add('time-slot');
//                     block.textContent = time;

//                     const rowIndex = Math.floor(i / 12);

//                     block.onclick = () =>  { 
//                         if (!block.classList.contains('selected')) {
//                             // Optional: Clear previously selected seat if your logic requires single selection
//                             document.querySelectorAll('.time-slot.selected').forEach(selectedSlot => {
//                                 selectedSlot.classList.remove('selected');
//                             });
//                             block.classList.add('selected');

//                         }
//                     }

//                     rows[rowIndex].appendChild(block);
//                 }
                
//             }
//         },
//         error: function() {
//             //no errors :)
//         }
//     });

//     // used inside the ajax but replaced
//     // for (let hour = 0; hour < 24; hour++) {
//     //     for (let minute = 0; minute < 60; minute += 30) {
//     //         const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//     //         const block = document.createElement('button');
//     //         block.classList.add('time-slot');
//     //         block.textContent = time;

//     //         if (unavailableTimeSlots.hasOwnProperty(time)) {
//     //             block.classList.add('unavailable');
//     //             block.onclick = () => showDetails(time);
//     //         } else {
//     //             block.onclick = () => toggleSelection(block, selectedBlocks++);
//     //         }

//     //         container.appendChild(block);
//     //     }
//     // }
// }