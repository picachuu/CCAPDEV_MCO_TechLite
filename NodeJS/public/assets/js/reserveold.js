/* Reserve */
// function to determine if the current seat is unavailable or not based on the database
function isSeatUnavailable(seatNumber, tierNumber) {
    let isUnavailable = false;
    $.ajax({
        url: 'reserve',
        type: 'POST',
        data: { seat_num: Number(seatNumber), tier_num: tierNumber},
        async: false,  // Make the request synchronous
        success: function(data, status) {
            if (status === 'success') {
                let size = Number(data.seats.length);
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
    let selectedSeat = null; // Keep track of the selected seat

    const reserveContainer = document.getElementById('reservationForm');
    reserveContainer.style.display = 'none';


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
        seat.id = "seat" + i;
        seat.classList.add('seat');
        
        // Determine the column index (0, 1, or 2) based on the seat number
        const columnIndex = Math.floor((i - 1) / 5);

        let seatnumber = i;
        let tiernumber;

        switch(document.getElementById('tierSelect').value){
            case "tier1" : tiernumber = 1; break;
            case "tier2" : tiernumber = 2; break;
            case "tier3" : tiernumber = 3; break;
            case "tier0" : {
                seatsContainer.innerHTML = '';
                continue;}
        }

        // determines if the seat is available based on fetched data from database
        //!isSeatAvailable(i, Number(document.getElementById('tierSelect').value))
        
        if ( isSeatUnavailable(seatnumber, tiernumber) ) {
           
            seat.classList.add('unavailable'); // NOTE: since this is in reserve, no logic needed to "reverse" the unavailability of a seat.
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
                //include here logic to get the value from mongoDB
                //use seat.textContent to get the seat number
              
                $.post(
                    'reserve',
                    { seat_num: seatnumber, tier_num: tiernumber },
                    function(data, status){
                      if(status === 'success'){
                        //clear the select element first
                        var selection1 = document.getElementById("timeFrom");
                        var selection2 = document.getElementById("timeTo");

                        // Remove all options
                        while (selection1.options.length > 0) { //since sel1 is paired with sel2 it's aight to remove together.
                            selection1.remove(0); // Remove the first option (index 0) repeatedly until no options are left
                            selection2.remove(0);
                        }

                        //then populate the select element with the available timeslots
                        for (var i = 0; i < data.seats.length; i++) {
                            var option1 = document.createElement("option");
                            var option2 = document.createElement("option");
                            option1.value = Number(data.seats[i].time_start); // Set the value property of the option (in hours)
                            option2.value = Number(data.seats[i].time_end);
                            
                            switch (Number(option1.value)) {
                                case 900: option1.text = '9:00 AM'; option2.text = '10:00 AM'; break;
                                case 1000: option1.text = '10:00 AM'; option2.text = '11:00 AM'; break;
                                case 1100: option1.text = '11:00 AM'; option2.text = '12:00 PM'; break;
                                case 1200: option1.text = '12:00 PM'; option2.text = '1:00 PM'; break;
                                case 1300: option1.text = '1:00 PM'; option2.text = '2:00 PM'; break;
                                case 1400: option1.text = '2:00 PM'; option2.text = '3:00 PM'; break;
                                case 1500: option1.text = '3:00 PM'; option2.text = '4:00 PM'; break;
                                case 1600: option1.text = '4:00 PM'; option2.text = '5:00 PM'; break;
                                case 1700: option1.text = '5:00 PM'; option2.text = '6:00 PM'; break;
                                case 1800: option1.text = '6:00 PM'; option2.text = '7:00 PM'; break;
                                case 1900: option1.text = '7:00 PM'; option2.text = '8:00 PM'; break;
                                case 2000: option1.text = '8:00 PM'; option2.text = '9:00 PM'; break;
                                case 2100: option1.text = '9:00 PM'; option2.text = '10:00 PM'; break;
                            }
                            selection1.add(option1);
                            selection2.add(option2);
                        }
                        
                      }//if
                });//fn+post

            
                document.getElementById('name').value = ''; // Reset form values

                //document.getElementById('timeFrom').value = '';
                //document.getElementById('timeTo').value = '';
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