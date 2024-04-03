//This file is here for future reference if needed. Remnants of LV's stupidity e_e

// //to avoid conflict with reserve.js 
if (false) {
    alert("displayManageablecontent() called");
    
    document.addEventListener('DOMContentLoaded', function() {
        //document.forms["reservationForm"]["tierSelect"].value = 'tier0';
        //document.forms["reservationForm"]["tierSelect"].disabled = false;
        //document.forms["reservationForm"]["daySelect"].disabled = false;
        //document.getElementById('tierSelect').value = 'tier0';
        //document.forms["reservationForm"]["userName"].value = getUsername();
        //document.forms["reservationForm"]["userEmail"].value = getEmail();
        alert("displayManageablecontent() called");
        displayManageablecontent();
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const manageForm = document.forms["manageForm"];
    if (manageForm) {
        
        let updateBtn = document.getElementById('updateBtn');
        let delBtn = document.getElementById('delBtn');

        displayManageablecontent();
        
        document.getElementById('tierSelect').addEventListener('mousedown', function(e) {
            e.preventDefault();
            
        }, false);
        
        document.getElementById('daySelect').addEventListener('mousedown', function(e) {
            e.preventDefault();
            
        }, false);
        
        

        // button onclicks
        if (updateBtn) {
            updateBtn.addEventListener('click', function() {
                // Update the reservation
                manageForm.action = 'update-reservation';
                let userCount = manageFormUserTimeBlocks(manageForm)
                let count = manageFormTimeBlocks(manageForm);
                if (userCount != count) {
                    manageForm.elements['userSelectedTime'].value = null;
                    manageForm.elements['userNewTime'].value = null;
                    alert("Please select the same number of time blocks for the original and the new schedule.");
                } else if (userCount == 0) {
                    alert("Please select at least one time block for the new schedule.");
                } else {
                    manageFormSubmitFunction(manageForm);
                }
            });
        }
        if (delBtn) {
            delBtn.addEventListener('click', function() {
                // Update the reservation
                manageForm.action = 'delete-reservation';
                if (manageFormUserTimeBlocks(manageForm) == 0) {
                    alert("Please select at least one time block for the schedule to be deleted.");
                } else {
                    manageForm.elements['canceller'].value = getUsername();
                    manageForm.elements['cancellerEmail'].value = getEmail();
                    manageForm.elements['manager'].value = getIsManager();
                    manageFormSubmitFunction(manageForm);
                }
            });
        }

    }
});

function manageFormTimeBlocks(manageForm) {
    // Select the #timeBlocksContainer div
    let divElement = document.querySelector('#timeBlocksContainer');

    // Select all child elements within the div
    let childElements = divElement.querySelectorAll('*');
    let time = "";
    let count = 0;
    childElements.forEach(function(childElement) {
        if (compareBackgroundColorHex(childElement, "#FFFFFF")) {
            time = time + childElement.innerText + " ";
            count++;
        }
    });

    manageForm.elements['userNewTime'].value = time;

    return count;
}

function manageFormUserTimeBlocks(manageForm) {
    // Select the #timeBlocksContainer div
    let divElement = document.querySelector('#userTimeBlocksContainer');

    // Select all child elements within the div
    let childElements = divElement.querySelectorAll('*');
    let time = "";
    let count = 0;
    childElements.forEach(function(childElement) {
        if (compareBackgroundColorHex(childElement, "#FFFFFF")) {
            time = time + childElement.innerText + " ";
            count++;
        }
    });

    manageForm.elements['userSelectedTime'].value = time;
    return count;
}

function manageFormSubmitFunction(manageForm) {
    manageForm.method = 'POST';
    manageForm.submit();
}

function displayManageablecontent() {
    // Get manageForm
    let manageForm = document.forms["manageForm"];

    // Get all values
    const reservation_id = manageForm.elements["reservationId"].value;
    const isManager = getIsManager();
    let reserverName = null;
    let reserverEmail = null;
    if (isManager) {
        reserverName = manageForm.elements["reserver"].value;
        reserverEmail = manageForm.elements["reserverEmail"].value;
    }

    const username = manageForm.elements["userName"].value;
    const email = manageForm.elements["userEmail"].value;

    const tier = Number(document.getElementById('tierSelect').value);

    const date = document.getElementById('daySelect').value; // in the form of "MM/DD/YYYY"
    const year = Number(date.split('/')[2]);
    const month = Number(date.split('/')[0]);
    const day = Number(date.split('/')[1]);

    let response = $.ajax({
        url: 'obtain-reservations',
        type: 'POST',
        data: { reservation_id: reservation_id, tier: tier },
        async: false  // Make the AJAX request synchronous
    }).responseJSON;
    let reservations = response.reservations;

    // sort the reservations to where cancelleded reservations are at the start of the array (and is sort by time_start -- not needed since it's already sorted from dbquery)
    reservations.sort((a, b) => {
        if (a.cancelled_by && !b.cancelled_by) {
            return -1;
        }
        if (!a.cancelled_by && b.cancelled_by) {
            return 1;
        }
        return 0;
    });
    

    // Access individual parameters by name
    const seats = reservations[0].seats;

    manageForm.elements["seat"].value = seats;
    
    //add the seat
    const seat = document.createElement('button');
    seat.classList.add('seat');
    seat.textContent = `Seat ${seats}`;
    seat.classList.add('unavailable');
    // make seat not hoverable
    seat.style.pointerEvents = 'none';
    const seatsContainer = document.getElementById('seatsContainer');
    seatsContainer.appendChild(seat);

    //clear the timeblocks container
    const container = document.getElementById('userTimeBlocksContainer');
    container.innerHTML = ''; // Clear previous blocks
    container.style.display = 'block';
    

    for (let i = 0; i < reservations.length; i++) {
        const time_start = reservations[i].time_start;
        addTimeblock(seats, tier, year, month, day, time_start, username, reservations[i].cancelled_by);
    }
}

function addTimeblock(seatNumber, tierNumber, year, month, day, time_start, assigned_to, cancelled_by) {
    
    $.ajax({
        url: 'manageable-check',
        type: 'POST',
        data: { 
            tier_num: tierNumber, 
            seat_num: Number(seatNumber), 
            user_name: assigned_to,
            time_start: time_start,
            year_num: year,
            month_num: month,
            day_num: day, 
            mode: "find_timeslot"
        },
        
        async: false,  // Make the request synchronous
        success: function(reserved, status) {
            if (status === 'success') {
                
                
                const past = isPast(new Date(year, month - 1, day, Math.floor(time_start / 100), time_start % 100));
                const timeBlocksContainer = document.getElementById('userTimeBlocksContainer');
                const block = document.createElement('button');
                block.classList.add('time-slot');
                block.textContent = `${Math.floor((reserved.seat.time_start)/100).toString().padStart(2, '0')}:${((reserved.seat.time_start)%100).toString().padStart(2, '0')}`;
                block.onclick = null;

                //alert("timeblock: "+`${Math.floor((reserved.seat.time_start)/100).toString().padStart(2, '0')}:${((reserved.seat.time_start)%100).toString().padStart(2, '0')}`);
                
                if (cancelled_by || (past && isRealtime)) {
                    block.classList.add('unavailable');
                    block.onclick = () => {
                        event.preventDefault();
                        if (cancelled_by) {
                            block.title = `This time block was cancelled.`;
                        } else if (past && isRealtime){
                            block.title = `This time block has expired.`;
                            //block.title = `This time block was cancelled by ${cancelled_by}.`;
                        }  
                    }
                    
                } else {
                    block.onclick = () =>  {
                        event.preventDefault();
                        block.classList.toggle('selected');
                        let element = document.getElementById('userTimeBlocksContainer');

                        if (element.querySelector('.selected.time-slot')) {
                            populateTimeBlocksManage(seatNumber, tierNumber, day, month, year); // in reserve.js
                        } else {
                            document.getElementById('timeBlocksContainer').innerHTML = "";
                        }
                    }
                }
                
                timeBlocksContainer.appendChild(block);
            }
        },
        error: function() {
            //no errors :)
        }
    });
    
}

