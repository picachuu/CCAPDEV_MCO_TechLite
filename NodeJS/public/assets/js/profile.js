if (window.location.pathname === '/profile') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Profile page loaded');
        loadReservations(1);
    });
}

let currentPage = 1;
let totalPages = 0;

/*
function addReservationsPerTier(tier, page) {

    let hadReservation_thisTier = false;
    const reservations_container = document.getElementById('items-container');
    pageSize = 1; // Number of reservations per tier per page

    $.ajax({
        url: 'profile-reservations',
        type: 'POST', 
        data: { tier_num: tier, 
            user_name: getUsername(),
            mode: "reservations",
            page: page,             
            pageSize: pageSize  
        },
        async: true,  // Make the request synchronous
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
                            image.src = 'assets/images/tier1.png';
                            break;
                        case 2:
                            image.src = 'assets/images/tier2.png';
                            break;
                        case 3:
                            image.src = 'assets/images/tier3.png';
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
                                // for now, ongoing*/
                                /*spani.textContent = 'Ongoing';
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
                    div6.classList.add('main-border-button');*/

                    /* if today's date has surpassed the current date, then expired
                        if (current date > date for reservation) {
                                        div6.classList.add('border-no-active');
                                    }
                    */
/*
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
*/
function loadReservations(page) {
    let data = {
        user_name: getUsername(),
        page: page,
        pageSize: 3, // Assuming this is your desired page size
        tier_nums: selectedTiers // Send the array of selected tiers
    };

    $.ajax({
        url: 'profile-reservations',
        type: 'POST',
        data: data,
        async: true,
        success: function(own, status) {
            if (status === 'success') {
                totalPages = own.totalPages;
                currentPage = own.page; // Update current page based on server response
                const reservationsContainer = document.getElementById('items-container');
                reservationsContainer.innerHTML = ''; // Clear existing reservations

                if (own.reservations.length === 0) {
                    // No reservations to show
                    const noReservationsMsg = document.createElement('div');
                    noReservationsMsg.textContent = 'No reservations to show';
                    noReservationsMsg.classList.add('no-reservations'); // Add some class for styling if needed
                    reservationsContainer.appendChild(noReservationsMsg);
                } else {
                    own.reservations.forEach(reservation => {
                        const reservationElement = createReservationElement(reservation);
                        reservationsContainer.appendChild(reservationElement);
                    });
                }

                document.getElementById('currentPage').textContent = own.page;
                updatePaginationControls(own.page, own.totalPages);
                console.log(`Requesting page ${page} with page size ${data.pageSize} and tiers ${selectedTiers}`);
            }
        },
        error: function() {
            console.error('Failed to load reservations');
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    //pagination event listeners
    document.getElementById('nextButton').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++; 
            loadReservations(currentPage);
        }
    });
    
    document.getElementById('prevButton').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--; 
            loadReservations(currentPage);
        }
    });

    document.getElementById('firstButton').addEventListener('click', function() {
        currentPage = 1; 
        loadReservations(currentPage); 
    });

    document.getElementById('lastButton').addEventListener('click', function() {
        currentPage = totalPages; 
        loadReservations(currentPage);
    });
    
});

function updatePaginationControls(currentPage, totalPages) {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}

let selectedTiers = [1, 2, 3]; 

function toggleTierSelection(tier) {
    const index = selectedTiers.indexOf(tier);
    if (index > -1) {
        selectedTiers.splice(index, 1);
    } else {
        selectedTiers.push(tier);
    }
    updateTierButtons(); 
    loadReservations(1);
}


function updateTierButtons() {
    for (let tier = 1; tier <= 3; tier++) {
        const button = document.getElementById(`filterTier${tier}`);
        if (selectedTiers.includes(tier)) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateTierButtons();
    loadReservations(1);

    for (let tier = 1; tier <= 3; tier++) {
        document.getElementById(`filterTier${tier}`).addEventListener('click', function() {
            toggleTierSelection(tier);
        });
    }
});


function createReservationElement(reservation) {
    let reservationLength = Object.keys(reservation).length - 1;
    var reservationDiv = document.createElement('div');
    reservationDiv.classList.add('item');
    var reservationUl = document.createElement("ul");

    // Tier image based on reservation.tier
    var reservationLi1 = document.createElement("li");
    var image = document.createElement('img');
    image.alt = "Tier Image";
    switch(Number(reservation.tier)) {
        case 1:
            image.src = 'assets/images/tier1.png';
            break;
        case 2:
            image.src = 'assets/images/tier2.png';
            break;
        case 3:
            image.src = 'assets/images/tier3.png';
            break;
        default:
            image.alt = 'No image available';
    }
    reservationLi1.appendChild(image);
    reservationUl.appendChild(reservationLi1);

    // Room and Seat
    const seatNum = reservation[0].seats;
    var roomAndSeatLi = document.createElement("li");
    var roomHeader = document.createElement('h4');
    var roomSpan = document.createElement('span');
    roomHeader.textContent = 'Room';
    roomSpan.textContent = 'Tier ' + reservation.tier + ' Seat ' + seatNum;
    roomAndSeatLi.appendChild(roomHeader);
    roomAndSeatLi.appendChild(roomSpan);
    reservationUl.appendChild(roomAndSeatLi);

    // Date Reserved
    const dateReserved = reservation[0].day + '/' + reservation[0].month + '/' + reservation[0].year;
    var dateLi = document.createElement("li");
    var dateHeader = document.createElement('h4');
    var dateSpan = document.createElement('span');
    dateHeader.textContent = 'Date Reserved';
    dateSpan.textContent = dateReserved;
    dateLi.appendChild(dateHeader);
    dateLi.appendChild(dateSpan);
    reservationUl.appendChild(dateLi);

    // Status
    var statusLi = document.createElement("li");
    var statusHeader = document.createElement('h4');
    var statusSpan = document.createElement('span');
    statusHeader.textContent = 'Status';
    // Assume logic for determining if expired or ongoing is implemented elsewhere
    statusSpan.textContent = 'Ongoing'; // placeholder
    statusLi.appendChild(statusHeader);
    statusLi.appendChild(statusSpan);
    reservationUl.appendChild(statusLi);

    // Time Start
    
    var timeLi = document.createElement("li");
    var timeHeader = document.createElement('h4');
    timeHeader.textContent = 'Time Start';
    timeLi.appendChild(timeHeader);
    var timeSpan = document.createElement('span');

    let timeStart_ = reservation[0].time_start; //earliest time start
    let remainingSlots_ = Object.keys(reservation).length - 2;
    if (remainingSlots_ > 1) {
        timeSpan.textContent = `${Math.floor((timeStart_)/100).toString().padStart(2, '0')}:${((timeStart_)%100).toString().padStart(2, '0')}` + ' (30m + '+ remainingSlots_ +' more) ';
    } else {
        timeSpan.textContent = `${Math.floor((timeStart_)/100).toString().padStart(2, '0')}:${((timeStart_)%100).toString().padStart(2, '0')}` + ' (30 minutes)';
    }
    timeLi.appendChild(timeSpan);
    /* for (let i = 0; i < Object.keys(reservation).length - 1; i++) {
        
        var timeSpan = document.createElement('span');
        //timeSpan.textContent = `${Math.floor((reservation.time_start)/100).toString().padStart(2, '0')}:${((reservation.time_start)%100).toString().padStart(2, '0')}` + ' (30 minutes)';
        timeSpan.textContent = `${Math.floor((reservation[i].time_start)/100).toString().padStart(2, '0')}:${((reservation[i].time_start)%100).toString().padStart(2, '0')}` + ' (30 minutes)';
        timeLi.appendChild(timeSpan);
        if (i !== reservation.length - 1) {
            timeLi.appendChild(document.createElement('br'));
        }
    } */
    
    reservationUl.appendChild(timeLi);

    // Manage Link
    var manageLi = document.createElement("li");
    var manageDiv = document.createElement('div');
    manageDiv.classList.add('main-border-button');
    // var manageLink = document.createElement("a");
    // manageLink.href = "/manage" + 
    //     //old
    //     /* "?tier=" + encodeURIComponent(reservation.tier) + 
    //     "&seats=" + encodeURIComponent(seatNum) + 
    //     "&username=" + encodeURIComponent(reservation.assigned_to) +
    //     "&email=" + encodeURIComponent(reservation.email) + 
    //     "&reservations=" + encodeURIComponent(1) + 
    //     "&time_start1=" + encodeURIComponent(reservation.time_start) + 
    //     "&month=" + encodeURIComponent(reservation.month) + 
    //     "&day=" + encodeURIComponent(reservation.day) + 
    //     "&year=" + encodeURIComponent(reservation.year); */
    //     // new
    //     "?tier=" + encodeURIComponent(reservation[0].tier) +
    //     "&seats=" + encodeURIComponent(seatNum) +
    //     "&username=" + encodeURIComponent(reservation[0].assigned_to) +
    //     "&email=" + encodeURIComponent(reservation[0].email) +
    //     "&reservations=" + encodeURIComponent(reservation.length) +
    //     reservation.map((r, i) => `&time_start${i + 1}=${encodeURIComponent(r.time_start)}`).join('') +
    //     "&month=" + encodeURIComponent(reservation[0].month) +
    //     "&day=" + encodeURIComponent(reservation[0].day) +
    //     "&year=" + encodeURIComponent(reservation[0].year);
    // manageLink.textContent = 'Manage';
    // manageDiv.appendChild(manageLink);
    
    addManageBtnForm(manageDiv, reservation[0].reservation_id);
    
    
    manageLi.appendChild(manageDiv);
    reservationUl.appendChild(manageLi);

    reservationDiv.appendChild(reservationUl);

    return reservationDiv;
}

function addManageBtnForm(manageDiv,reservation_id) {
    let manageForm = document.createElement("form");
    
    manageForm.method = "POST";
    manageForm.action = "/manage-reservation";
    
    let hiddenField = document.createElement("input");
    hiddenField.type = "hidden";
    hiddenField.name = "reservation_id";
    hiddenField.value = reservation_id;
    manageForm.appendChild(hiddenField);
    

    var manageButton = document.createElement("button");
    manageButton.type = "submit";
    manageButton.textContent = "Manage";
    manageForm.appendChild(manageButton);

    manageDiv.appendChild(manageForm);
}

