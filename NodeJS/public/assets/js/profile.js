if (window.location.pathname === '/profile') {
    document.addEventListener('DOMContentLoaded', function() {
        loadReservations();
    });
}

function addReservationsPerTier(tier, page) {

    let hadReservation_thisTier = false;
    const reservations_container = document.getElementById('items-container');
    pageSize = 3;
    if (page === 1) {
        reservations_container.innerHTML = '';
    }

    $.ajax({
        url: 'profile-reservations',
        type: 'POST', 
        data: { tier_num: tier, 
            user_name: getUsername(),
            mode: "reservations",
            page: page,             
            pageSize: pageSize  
        },
        async: false,  // Make the request synchronous
        success: function(own, status) {
            if (status === 'success') {
                for (let i = 0; i < own.reservations.length; i++) {

                    var reservation = document.createElement('div');
                    reservation.classList.add('item');

                    var reservation_ul = document.createElement("ul");

                    //l1: image
                    var reservation_li1 = document.createElement("li");

                    var image = document.createElement('img');
                    image.alt = "";
                    switch(Number(tier)) {
                        case 1:
                            image.src = 'assets/images/tier1.jpg';
                            break;
                        case 2:
                            image.src = 'assets/images/tier2.jpg';
                            break;
                        case 3:
                            image.src = 'assets/images/tier3.jpg';
                            break;
                    }

                    reservation_li1.appendChild(image);
                    reservation_ul.appendChild(reservation_li1);

                    for (let j = 2; j < 6; j++) {
                        let reservation_li = document.createElement("li");
                        let headeri = document.createElement('h4');
                        let spani = document.createElement('span');

                        switch (j) {
                            case 2:  //l2: header and text <li><h4>Room</h4><span>Tier 1 Seat 15</span></li>
                                headeri.textContent = 'Room';
                                spani.textContent = 'Tier ' + tier + ' Seat ' + own.reservations[i].seats;
                                break;
                            case 3: //l3: header and date 31/12/2023
                                headeri.textContent = 'Date Reserved';
                                //For MCO3, convert this in respect to new db date format
                                spani.textContent = own.reservations[i].day + '/' + own.reservations[i].month + '/' + own.reservations[i].year;
                                break;
                            case 4:
                                headeri.textContent = 'Status';
                                // insert here logic if date has surpassed the current date (expired), or if ongoing
                                /*
                                    if (current date > date for reservation) {
                                        spani.textContent = 'Expired';
                                    }
                                    else {
                                        spani.textContent = 'Ongoing';
                                    }
                                */
                                // for now, ongoing
                                spani.textContent = 'Ongoing';
                                break;
                                
                                //TO DO FOR MCO3: Display Time Left
                            case 5:
                                headeri.textContent = 'Time Start';
                                spani.textContent = `${Math.floor((own.reservations[i].time_start)/100).toString().padStart(2, '0')}:${((own.reservations[i].time_start)%100).toString().padStart(2, '0')}` + ' (30 minutes)';
                                break;
                            // case 6:
                            //     headeri.textContent = 'Time Left';
                            //     spani.textContent = '30 minutes';
                            //     // for now no math involved, just display the time left (30 minutes)
                            //     break;
                            
                        }
                        reservation_li.appendChild(headeri);
                        reservation_li.appendChild(spani);
                        reservation_ul.appendChild(reservation_li);
                    }

                    var reservation_li6 = document.createElement("li");
                    var div6 = document.createElement('div');
                    div6.classList.add('main-border-button');

                    /* if today's date has surpassed the current date, then expired
                        if (current date > date for reservation) {
                                        div6.classList.add('border-no-active');
                                    }
                    */

                    var link6 = document.createElement("a");
                    var url = "/manage" + 
                    
                        "?tier=" + encodeURIComponent(tier) + 
                        "&seats=" + encodeURIComponent(own.reservations[i].seats) + 
                        "&username=" + encodeURIComponent(own.reservations[i].assigned_to) +
                        "&email=" + encodeURIComponent(own.reservations[i].email) + 
                        //include here the number of reserved timeblocks of the seat. For now just one
                        "&reservations=" + encodeURIComponent(1) + 

                        //this should depend on number of reservations, for now just one, just improvise on the new db
                        //imagine this should be a for loop based on number of time_starts in the reservation
                        "&time_start1=" + encodeURIComponent(own.reservations[i].time_start) + 

                        "&month=" + encodeURIComponent(own.reservations[i].month) + 
                        "&day=" + encodeURIComponent(own.reservations[i].day) + 
                        "&year=" + encodeURIComponent(own.reservations[i].year);

                    link6.href = url;
                    link6.textContent = 'Manage';

                    div6.appendChild(link6);
                    reservation_li6.appendChild(div6);
                    reservation_ul.appendChild(reservation_li6);

                    reservation.appendChild(reservation_ul);
                    reservations_container.appendChild(reservation);
                }
                
            }
            hadReservation_thisTier = true;
        },
        error: function() {
            //no errors :)
        }
    });

    return hadReservation_thisTier ? 1 : 0;
}

function loadReservations(page) {
    
    //determine if there were any reservations made by the user, if none then display "No reservations made, go add one!"
    document.getElementById('items-container').innerHTML = '';
    for (let i = 1; i < 4; i++) {
        addReservationsPerTier(i, page);
    }
    // In the loadReservations function in profile.js
console.log(`Requesting page ${page} with page size ${pageSize}`); // Debug log

}

document.addEventListener('DOMContentLoaded', function() {
    // Initial load of reservations
    loadReservations(1);

    // Set up pagination event listeners
    document.getElementById('nextButton').addEventListener('click', function() {
        currentPage++; // Increment the current page
        loadReservations(currentPage); // Load the new page of reservations
    });

    document.getElementById('prevButton').addEventListener('click', function() {
        if (currentPage > 1) { // Check to avoid going below page 1
            currentPage--; // Decrement the current page
            loadReservations(currentPage); // Load the new page of reservations
        }
    });

    // More code to set up your page...
});

let currentPage = 1; // This variable should be accessible to both event listeners and the loadReservations function
