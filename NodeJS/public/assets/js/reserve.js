if (window.location.pathname === '/reserve') {
    document.addEventListener('DOMContentLoaded', function() {
        populateDays();
        attachEventListeners();
        
        if (document.getElementById("isPreselect")) {
            // post request for preselected data
            $.ajax({
                url: 'reserve',
                type: 'POST',
                data: {
                    mode: "preselect"
                },
                async: false,  // Make the request synchronous
                success: function(preselect, status) {
                    if (status === 'success') {
                        const reservationStr = preselect.reservation;
                        //decoding the string into reservation json object
                        // combine YYYY-MM-DD/time_start/Tier/Seat to string so easy to split() with / and -
                        // const reservation = `${year}-${month}-${day}/${time_start}/${tier}/${seats}`;
                        let yyyymmdd = reservationStr.split('/')[0];
                        // prepend 0 to month and day if less than 10
                        let strmonth = yyyymmdd.split('-')[1];
                        let strday = yyyymmdd.split('-')[2].split('/')[0];
                        if (strmonth.length == 1) {
                            strmonth = strmonth;
                        }
                        if (strday.length == 1) {
                            strday = strday;
                        }
                        yyyymmdd = yyyymmdd.split('-')[0] + "-" + strmonth + "-" + strday;
                        console.log("Reservation (Preselect): "+reservationStr);
                        const reservation = {
                            year: Number(reservationStr.split('-')[0]),
                            month: Number(reservationStr.split('-')[1]),
                            day: Number(reservationStr.split('-')[2].split('/')[0]),
                            time_start: reservationStr.split('-')[2].split('/')[1],
                            tier: reservationStr.split('/')[2],
                            seat: reservationStr.split('/')[3],
                            yyyymmdd: yyyymmdd
                        };
                        loadPreselected(reservation);
                    }
                }
            });
        }
    });
}

function loadPreselected(reservation) {
    /* reservation = {
        year: reservationStr.split('-')[0],
        month: reservationStr.split('-')[1],
        day: reservationStr.split('-')[2].split('/')[0],
        time_start: reservationStr.split('-')[2].split('/')[1],
        tier: reservationStr.split('-')[3],
        seat: reservationStr.split('-')[4],
        yyyymmdd: reservationStr.split('/')[0]
    }; */

    console.log(reservation);

    const daySelect = document.getElementById('daySelect');
    daySelect.value = reservation.yyyymmdd;
    const tierSelect = document.getElementById('tierSelect');
    tierSelect.value = `tier${reservation.tier}`;

    // after day and tier selection, populate the seats
    checkSelectionAndPopulateTimeBlocks();

    // select the seat
    const seat = Array.from(document.querySelectorAll('.seat')).find(el => el.textContent === `Seat ${reservation.seat}`);
    seat.click();

    // select the time block according to time_start

    // prepending 0 to hour if less than 10
    let hour = Math.floor(reservation.time_start / 100);
    if (hour < 10) {
        hour = `0${hour}`;
    }
    let minute = reservation.time_start % 100;
    if (minute < 10) {
        minute = `0${minute}`;
    }

    let time_startStr = `${hour}:${minute}`;
    const timeBlock = Array.from(document.querySelectorAll('.time-slot')).find(el => el.textContent === time_startStr);
    timeBlock.click();
    
}

function populateDays() {
    const daySelect = document.getElementById('daySelect');
    daySelect.innerHTML = '<option value = "0">Select a Day</option>'; // Reset
    
    const today = getCurrentDateTime();
    for (let i = 0; i < 3; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);

        const datedate = futureDate.toLocaleDateString('en-US', { timeZone: 'Asia/Singapore' });
        const day = datedate.split('/')[1];
        const month = datedate.split('/')[0];
        const year = datedate.split('/')[2];

        const yyyymmdd = `${year}-${month}-${day}`;
        const option = new Option(datedate, yyyymmdd);
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
        // no idea what this meant ---> / BRO THIS WAS ONLY populateTimeBlocks() XDDDDDDD
        showSeats(tierSelect.value); // Populate if both selections are made
    } else {
        document.getElementById('seatsContainer').innerHTML = ''; // Clear seats
        document.getElementById('timeBlocksContainer').style.display = 'none';
        document.getElementById('reservationForm').style.display = 'none';
    }
}

let unavailableTimeSlots = {};

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
function isSeatUnavailable(seatNumber, tierNumber, daySelected, monthSelected, yearSelected) {
    var isUnavailable = false;
    
    $.ajax({
        url: 'reserve',
        type: 'POST',
        data: { 
            seat_num: Number(seatNumber), 
            tier_num: tierNumber, 
            day_num: daySelected, 
            month_num: monthSelected, 
            year_num: yearSelected , 
            mode: "taken_false"
        },
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


    let seatsAvailArray = [];
    let seatsArray = [];
    for (let i = 1; i <= 15; i++) {
        const seat = document.createElement('button');
        seat.classList.add('seat');
        const columnIndex = Math.floor((i - 1) / 5);
        seat.textContent = `Seat ${i}`;

        const dateString = document.getElementById('daySelect').value;  // in the format 'YYYY-MM-DD'
        // get day month year
        const year = Number(dateString.split('-')[0]);
        const month = Number(dateString.split('-')[1]);
        const day = Number(dateString.split('-')[2]);

        // Check if seat is unavailable
        let selected_tier = Number(document.getElementById('tierSelect').value.slice(4));

        const seatAvail = !isSeatUnavailable(i, selected_tier, day, month, year);

        seatsAvailArray.push(seatAvail);
        seatsArray.push(seat);
        
        if (!seatAvail) {
            seat.classList.add('unavailable');
            // adds not allow cursor to the unavailable seats classe of not manager
            if (!getIsManager()) {
                // seat.style.pointerEvents = "none";
                seat.style.cursor = "not-allowed";
            }
        }//else, then available
        if (seatAvail || getIsManager()) {  // manager allowed to click on unavailable seats
            seat.addEventListener('click', function() {

                // Handle seat selection here
                if (!this.classList.contains('selected')) {

                    // Optional: Clear previously selected seat if your logic requires single selection
                    document.querySelectorAll('.seat.selected').forEach(selectedSeat => {
                        selectedSeat.classList.remove('selected');
                    });
                    
                    this.classList.add('selected');


                    // // manager part for initial unavailable seats
                    // if (this.classList.contains('unavailable')) { //remove unvavailable class to avoid overriding (manager part)
                    //     this.classList.remove('unavailable');
                    // } 
                    // // (make all seats that was initially unavailable to be unavailable again)
                    
                    // let match = this.innerHTML.match(/\d+/);
                    // let number = match ? Number(match[0]) : null;
                    // for (let i = 0; i < 15; i++) {
                    //     if (!seatsAvailArray[i] && i != number-1) {
                    //         seatsArray[i].classList.add('unavailable');
                    //     }
                    // }   // manager part end

                    populateTimeBlocksRes(i, selected_tier, day, month, year); // Populate time blocks after seat is selected
                }
            });
        }
        
        columns[columnIndex].appendChild(seat);
    }
}

// helper function to convert hex to rgb
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); // to parse a hexadecimal color string
    return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

// helper function to compare the background color of an element to a hex color
function compareBackgroundColorHex(element, color) {
    return window.getComputedStyle(element).backgroundColor == hexToRgb(color);
}

var is_prev_timeBlock_taken = false;

function populateTimeBlocksRes(seat_number, tier_number, day_number, month_number, year_number) {
    const container = document.getElementById('timeBlocksContainer');
    container.innerHTML = ''; // Clear previous blocks
    container.style.display = 'block';

    let selectedBlocks = 0;

    // Fetch time blocks from server based on seat number, tier number, and day number
    $.ajax({
        url: 'reserve',
        type: 'POST',
        data: { 
            seat_num: Number(seat_number), 
            tier_num: tier_number, 
            day_num: day_number, 
            month_num: month_number,
            year_num: year_number,
            mode: "all"
        },
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
                    const time_start = all.seats[i].time_start;
                    const hour = Math.floor(time_start / 100);
                    const minute = time_start % 100;

                    const blockDate = new Date(year_number, month_number - 1, day_number, hour, minute);

                    // getting booleans with given day_number, month_number, year_number, time_start
                    let past = isPast(blockDate); 
                    let oneHour = isWithinOneHour(blockDate) && !getIsManager(); 
                    if (!getIsRealtime()) { // real-time control
                        past = false;
                        oneHour = false;
                    }

                    const rowIndex = Math.floor(i / 12);

                    if(all.seats[i].taken == true || past || oneHour) { // only users/members are restricted from oneHour
                        block.title = `Time block taken.`;
                        block.classList.add('unavailable');
                        if (past) {
                            block.classList.add('expired');
                            block.title = `Time block expired.`;
                        }
                        if (oneHour) {
                            block.classList.add('expired');
                            block.title = `Within one hour restriction.`;
                        }
                        unavailableTimeSlots[time] = { name: all.seats[i].assigned_to, email: all.seats[i].email };
                        //better we modify na rin the unavailableTimeSlots[]
                        
                        // only allow managers to click on unavailable time slots given that it's not past or within one hour
                        if (getIsManager() && !past) {
                            block.onclick = () => showDetails(time,block);
                        }
                    } else {
                        block.onclick = () =>  {
                            let selectionLimit = 4;
                            const formDiv = $('#reservationForm');

                            let usernameInput = document.getElementById('reservationName');
                            let emailInput = document.getElementById('reservationEmail');
                            if (emailInput && !getIsManager()) {
                                emailInput.type = 'email';
                                emailInput.readOnly = true;
                            }
                            if (usernameInput && !getIsManager()) {
                                usernameInput.readOnly = true;
                            }
                            if (usernameInput && getIsManager()) {
                                usernameInput.readOnly = false;
                            }
                            if (emailInput && getIsManager()) {
                                emailInput.readOnly = false;
                            }

                            // manually changing instead of toggle to esnure robustness
                            if (prevUnavailBlock) {
                                prevUnavailBlock.style.backgroundColor = "#182e19";
                                prevUnavailBlock = null;
                                prevUnavailBlock_InnerHTML = null;
                            }

                            if (!getLogged()){ // guards against hardcoded values
                                $('form[name="reservationForm"] :submit').val('Login to Reserve');
                            } else if (getIsManager()) {   // manager to revert UI to reserve

                                if (!is_prev_timeBlock_taken) {
                                    previousNameField = formDiv.find('input[name="name"]').val();
                                    previousEmailField = formDiv.find('input[name="email"]').val();
                                }

                                if (previousNameField || is_prev_timeBlock_taken) {
                                    document.forms["reservationForm"].reset(); // always reset form for robustness
                                    formDiv.find('input[name="name"]').val(previousNameField);
                                    formDiv.find('input[name="email"]').val(previousEmailField);
                                }
                                
                                selectionLimit = 48; // manager gets full selection limit
                                let submitButton = document.querySelector('div.reservation-form-buttons-container input[type="submit"]');
                                submitButton.value = "Reserve"
                                submitButton.style.width = "100%";
                                let deleteButtonRes = document.getElementById('deleteButtonRes');
                                deleteButtonRes.style.display = "none";
                                deleteButtonRes.style.width = "100%";
                            } else { // if not manager, automatically fill fields with user info
                                document.querySelector('div.reservation-form-fields-container input[name="name"]').value = getUsername();
                                document.querySelector('div.reservation-form-fields-container input[name="email"]').value = getEmail();
                            }

                            

                            if (selectedBlocks < selectionLimit) { 
                                block.classList.toggle('selected');
                                const isSelected = block.classList.contains('selected');
                                selectedBlocks = isSelected ? selectedBlocks + 1 : selectedBlocks - 1;
                        
                                const form = document.getElementById('reservationForm');

                                

                                hasSelectedBlocks = selectedBlocks > 0;

                                /* if (!hasSelectedBlocks) {
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
                                } */

                                form.style.display = hasSelectedBlocks ? 'block' : 'none';  // hides the reservationForm section

                                if (form.style.display === 'none') {
                                    document.getElementById('deleteButton').style.display = 'none';
                                    document.getElementById('editButton').style.display = 'none';
                                }
                            }
                            else if (selectedBlocks == 4 && block.classList.contains('selected')) {
                                block.classList.toggle('selected');
                                selectedBlocks = selectedBlocks - 1;
                            }
                            is_prev_timeBlock_taken = false;
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
}

// used in manage.js
function populateTimeBlocksManage(seat_number, tier_number, day_number, month_number, year_number) {
    const updateBtn = document.getElementById('updateBtn');
    const delBtn = document.getElementById('delBtn');
    updateBtn.style.display = 'block';
    delBtn.style.display = 'block';
    const container = document.getElementById('timeBlocksContainer');
    container.innerHTML = ''; // Clear previous blocks
    container.style.display = 'block';

    let selectedBlocks = 0;

    // Fetch time blocks from server based on seat number, tier number, and day number
    $.ajax({
        url: 'reserve',
        type: 'POST',
        data: { 
            seat_num: Number(seat_number), 
            tier_num: tier_number, 
            day_num: day_number, 
            month_num: month_number,
            year_num: year_number,
            mode: "all"
        },
        async: false,  // Make the request synchronous
        success: function(all, status) {
            if (status === 'success') {
                unavailableTimeSlots = {};

                //similar to the seat columns, but this time for the time slots it's a row
                const rows = [];
                for (let i = 0; i < 8; i++) {
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

                    const time_start = all.seats[i].time_start;
                    const hour = Math.floor(time_start / 100);
                    const minute = time_start % 100;

                    const blockDate = new Date(year_number, month_number - 1, day_number, hour, minute);

                    // getting booleans with given day_number, month_number, year_number, time_start
                    let past = isPast(blockDate); 
                    let oneHour = isWithinOneHour(blockDate) && !getIsManager(); 
                    if (!getIsRealtime()) { // real-time control
                        past = false;
                        oneHour = false;
                    }

                    const rowIndex = Math.floor(i / 6);

                    if(all.seats[i].taken == true || past || oneHour) { // only users/members are restricted from oneHour
                        block.title = `Time block taken.`;
                        block.classList.add('unavailable');
                        if (past) {
                            block.classList.add('expired');
                            block.title = `Time block expired.`;
                        }
                        if (oneHour) {
                            block.classList.add('expired');
                            block.title = `Within one hour restriction.`;
                        }

                        unavailableTimeSlots[time] = { name: all.seats[i].assigned_to, email: all.seats[i].email };

                        block.onclick = () =>  {event.preventDefault();}
                        
                    } else {
                        block.onclick = () =>  {
                            event.preventDefault();

                            // Count selected blocks
                            // Select the #timeBlocksContainer div
                            let divElement = document.querySelector('#userTimeBlocksContainer');

                            // Select all child elements within the div
                            let childElements = divElement.querySelectorAll('*');
                            let countSelected = 0;
                            childElements.forEach(function(childElement) {
                                if (compareBackgroundColorHex(childElement, "#FFFFFF")) {
                                    countSelected++;
                                }
                            });

                            
                            
                            let selectionLimit = countSelected;

                            
                            
                            if (selectedBlocks < selectionLimit) { 
                                block.classList.toggle('selected');
                                const isSelected = block.classList.contains('selected');
                                selectedBlocks = isSelected ? selectedBlocks + 1 : selectedBlocks - 1;
                           
                        
                                let hasSelectedBlocks = selectedBlocks > 0;

                                // updateBtn.style.display = hasSelectedBlocks ? 'block' : 'none';
                                // delBtn.style.display = !hasSelectedBlocks ? 'block' : 'none';
                            }
                            else if (selectedBlocks == selectionLimit && block.classList.contains('selected')) {
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
}

function submitReservation() {
    if (!logged) {
        alert('Please log in to reserve a seat.');
        return false;
    }
    return true;
}

let prevUnavailBlock = null;
let prevUnavailBlock_InnerHTML = null;
let hasSelectedBlocks = false;

// these two are only used for the manager UI
let previousNameField = null;
let previousEmailField = null;

function showDetails(time,block) { // should only execute if it's manager
    if (!getLogged()){ // guards against hardcoded values
        $('form[name="reservationForm"] :submit').val('Login to Reserve');
        return;
    }
    
    block.style.backgroundColor = "#4CAF50";

    // manually changing instead of toggle to esnure robustness
    if (prevUnavailBlock) {
        prevUnavailBlock.style.backgroundColor = "#182e19";
    } else {
        // change this element text type <input type="email" id="reservationEmail" name="email" placeholder="Email">
        let usernameInput = document.getElementById('reservationName');
        let emailInput = document.getElementById('reservationEmail');
        if (emailInput) {
            emailInput.type = 'text';
            emailInput.readOnly = true;
        }
        if (usernameInput) {
            usernameInput.readOnly = true;
        }
        
    }
    
    let submitButton = document.querySelector('div.reservation-form-buttons-container input[type="submit"]');
    submitButton.value = "Edit"
    submitButton.style.width = "48%";
    let deleteButtonRes = document.getElementById('deleteButtonRes');
    deleteButtonRes.style.display = "block";
    deleteButtonRes.style.width = "48%";

    if (prevUnavailBlock_InnerHTML != block.innerHTML){ // toggles unavailable time block selection to be visible 
        prevUnavailBlock = block;
        prevUnavailBlock_InnerHTML = block.innerHTML;

        const formDiv = $('#reservationForm');

        if (!is_prev_timeBlock_taken) { // detect if previous selection is a open slot
            previousNameField = formDiv.find('input[name="name"]').val();
            previousEmailField = formDiv.find('input[name="email"]').val();
        }

        is_prev_timeBlock_taken = true;
        
        const details = unavailableTimeSlots[time];

        formDiv.find('input[name="name"]').val(details.name);
        formDiv.find('input[name="email"]').val(details.email);
        //document.getElementById('reservationName').value = details.name; 
        //document.getElementById('reservationEmail').value = details.email; 
        document.getElementById('reservationForm').style.display = 'block';

    } else if (hasSelectedBlocks) { // if have reservation selections, then change UI to reserve, and keeps reservation form (reverting to previous values)

        prevUnavailBlock = null;
        prevUnavailBlock_InnerHTML = null;
        is_prev_timeBlock_taken = false;
        
        submitButton.value = "Reserve"
        submitButton.style.width = "100%";
        deleteButtonRes = document.getElementById('deleteButtonRes');
        deleteButtonRes.style.display = "none";
        deleteButtonRes.style.width = "100%";

        // reverts input fields of the form
        const formDiv = $('#reservationForm');

        formDiv.find('input[name="name"]').val(previousNameField);
        formDiv.find('input[name="email"]').val(previousEmailField);
    } else {    // if no selected time blocks when toggling the same unavailable time block selection, then hide the reservation form
        
        prevUnavailBlock = null;
        prevUnavailBlock_InnerHTML = null;
        is_prev_timeBlock_taken = false;

        document.getElementById('reservationForm').style.display = 'none';
        submitButton.value = "Reserve"
        submitButton.style.width = "100%";
        deleteButtonRes = document.getElementById('deleteButtonRes');
        deleteButtonRes.style.display = "none";
        deleteButtonRes.style.width = "100%";
        
        // clears the input fields of the form and reverts
        const formDiv = $('#reservationForm');
        //reset
        document.forms["reservationForm"].reset(); // always reset form for robustness
        //revert
        formDiv.find('input[name="name"]').val(previousNameField);
        formDiv.find('input[name="email"]').val(previousEmailField);
    }
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

function testAlert(){
    alert("This is a test alert!");
}