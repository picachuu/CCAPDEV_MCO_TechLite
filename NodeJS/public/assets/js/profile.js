if (window.location.pathname === '/profile') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Profile page loaded');
        loadPastReservations(1);
        loadActiveReservations(1);
    });
}

let currentPagePast = 1;
let totalPagesPast = 0;
let currentPageActive = 1;
let totalPagesActive = 0;
let selectedTiersActive = [1, 2, 3]; 
let selectedTiersInactive = [1, 2, 3]; 
let currentPageWalkIn = 1;
let totalPagesWalkIn = 0;
let selectedTiersWalkIn = [1, 2, 3];

let pageSize = 3;

function loadPastReservations(page) {
    page = Math.max(1, Number(page));
    let data = {
        logged: getLogged(),
        user_name: getUsername(),
        tier_nums: selectedTiersInactive 
    };

    $.ajax({
        url: 'profile-reservations',
        type: 'POST',
        data: data,
        async: true,
        success: function(own, status) {
            if (status === 'success') {
                currentPagePast = page; 
                const reservationsContainer = document.getElementById('inactive-container');
                reservationsContainer.innerHTML = '';
                {
                    let inactiveCount = 0;
                    const startIndex = (page - 1) * pageSize;
                    let paginatedReservations = [];
                    let combinedReservations = [];

                    own.reservations.forEach(reservation => {
                        const reservationElement = createReservationElement(reservation);
                        if (!reservationElement) { // only add if null
                            combinedReservations.push(reservation);
                            inactiveCount++;
                        }
                    });
                    
                    if (inactiveCount === 0) {
                        const noReservationsMsg = document.createElement('div');
                        noReservationsMsg.textContent = 'No inactive reservations to show';
                        noReservationsMsg.classList.add('no-reservations');
                        reservationsContainer.appendChild(noReservationsMsg);
                    } else {
                        console.log('inactive: ' + inactiveCount);
                        paginatedReservations = combinedReservations.slice(startIndex, startIndex + pageSize);
                        for (let i = 0; i < paginatedReservations.length; i++) {
                            const reservationElement = createInactiveReservationElement(paginatedReservations[i]);
                            reservationsContainer.appendChild(reservationElement);
                        }
                        totalPagesPast = Math.ceil(inactiveCount / pageSize);
                    }
                }

                document.getElementById('currentPageP').textContent = page;
                updatePaginationControls(page, totalPagesPast);
                console.log(`Inactive: Requesting page ${currentPagePast} out of ${totalPagesPast} with page size ${pageSize} and tiers ${selectedTiersInactive}`);
            }
        },
        error: function() {
            console.error('Failed to load reservations');
        }
    });
}

function loadActiveReservations(page) {
    page = Math.max(1, Number(page));
    let data = {
        logged: getLogged(),
        user_name: getUsername(),
        tier_nums: selectedTiersActive 
    };

    $.ajax({
        url: 'profile-reservations',
        type: 'POST',
        data: data,
        async: true,
        success: function(own, status) {
            if (status === 'success') {
                currentPageActive = page; 
                const reservationsContainer = document.getElementById('active-container');
                reservationsContainer.innerHTML = '';
                {
                    let activeCount = 0;
                    const startIndex = (page - 1) * pageSize;
                    let paginatedReservations = [];
                    let combinedReservations = [];

                    own.reservations.forEach(reservation => {
                        const reservationElement = createReservationElement(reservation);
                        if (reservationElement) { // only add if not null
                            combinedReservations.push(reservation);
                            activeCount++;
                        }
                    });
                    
                    if (activeCount === 0) {
                        const noReservationsMsg = document.createElement('div');
                        noReservationsMsg.textContent = 'No active reservations to show';
                        noReservationsMsg.classList.add('no-reservations');
                        reservationsContainer.appendChild(noReservationsMsg);
                    } else {
                        console.log('active: ' + activeCount);
                        paginatedReservations = combinedReservations.slice(startIndex, startIndex + pageSize);
                        for (let i = 0; i < paginatedReservations.length; i++) {
                            const reservationElement = createReservationElement(paginatedReservations[i]);
                            reservationsContainer.appendChild(reservationElement);
                        }
                        totalPagesActive = Math.ceil(activeCount / pageSize);
                    }
                }

                document.getElementById('currentPage').textContent = page;
                updatePaginationControls(page, totalPagesActive);
                console.log(`Active: Requesting page ${currentPageActive} out of ${totalPagesActive} with page size ${pageSize} and tiers ${selectedTiersActive}`);
            }
        },
        error: function() {
            console.error('Failed to load reservations');
        }
    });
}

function loadWalkInReservations(page) {
    page = Math.max(1, Number(page));
    let data = {
        logged: getLogged(),
        tier_nums: selectedTiersWalkIn 
    };

    $.ajax({
        url: 'profile-walkin-reservations',
        type: 'POST',
        data: data,
        async: true,
        success: function(own, status) {
            if (status === 'success') {
                currentPageWalkIn = page; 
                const reservationsContainer = document.getElementById('walkin-container');
                reservationsContainer.innerHTML = '';
                {
                    let activeCount = 0;
                    const startIndex = (page - 1) * pageSize;
                    let paginatedReservations = [];
                    let combinedReservations = [];

                    own.reservations.forEach(reservation => {
                        const reservationElement = createWalkinReservationElement(reservation);
                        if (reservationElement) { // only add if not null
                            combinedReservations.push(reservation);
                            activeCount++;
                        }
                    });
                    
                    if (activeCount === 0) {
                        const noReservationsMsg = document.createElement('div');
                        noReservationsMsg.textContent = 'No active walk-in reservations to show';
                        noReservationsMsg.classList.add('no-reservations');
                        reservationsContainer.appendChild(noReservationsMsg);
                    } else {
                        console.log('walkin: ' + activeCount);
                        paginatedReservations = combinedReservations.slice(startIndex, startIndex + pageSize);
                        for (let i = 0; i < paginatedReservations.length; i++) {
                            const reservationElement = createWalkinReservationElement(paginatedReservations[i]);
                            reservationsContainer.appendChild(reservationElement);
                        }
                        totalPagesWalkIn = Math.ceil(activeCount / pageSize);
                    }
                }

                document.getElementById('currentPageW').textContent = page;
                updatePaginationControlsW(page, totalPagesWalkIn);
                console.log(`Walkin: Requesting page ${currentPageWalkIn} out of ${totalPagesWalkIn} with page size ${pageSize} and tiers ${selectedTiersWalkIn}`);
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
        if (currentPageActive < totalPagesActive) {
            currentPageActive++; 
            loadActiveReservations(currentPageActive);
        }
    });
    
    document.getElementById('prevButton').addEventListener('click', function() {
        if (currentPageActive > 1) {
            currentPageActive--; 
            loadActiveReservations(currentPageActive);
        }
    });

    document.getElementById('firstButton').addEventListener('click', function() {
        currentPageActive = 1; 
        loadActiveReservations(currentPageActive);
    });

    document.getElementById('lastButton').addEventListener('click', function() {
        currentPageActive = totalPagesActive;
        loadActiveReservations(currentPageActive);
    });

    //past reservations
    document.getElementById('nextButtonP').addEventListener('click', function() {
        if (currentPagePast < totalPagesPast) {
            currentPagePast++; 
            loadPastReservations(currentPagePast);
        }
    });

    document.getElementById('prevButtonP').addEventListener('click', function() {
        if (currentPagePast > 1) {
            currentPagePast--; 
            loadPastReservations(currentPagePast);
        }
    });

    document.getElementById('firstButtonP').addEventListener('click', function() {
        currentPagePast = 1; 
        loadPastReservations(currentPagePast);
    });

    document.getElementById('lastButtonP').addEventListener('click', function() {
        currentPagePast = totalPagesPast;
        loadPastReservations(currentPagePast);
    });

    //walkin reservations
    document.getElementById('nextButtonW').addEventListener('click', function() {
        if (currentPageWalkIn < totalPagesWalkIn) {
            currentPageWalkIn++; 
            loadWalkInReservations(currentPageWalkIn);
        }
    });

    document.getElementById('prevButtonW').addEventListener('click', function() {
        if (currentPageWalkIn > 1) {
            currentPageWalkIn--; 
            loadWalkInReservations(currentPageWalkIn);
        }
    });

    document.getElementById('firstButtonW').addEventListener('click', function() {
        currentPageWalkIn = 1;
        loadWalkInReservations(currentPageWalkIn);
    });

    document.getElementById('lastButtonW').addEventListener('click', function() {
        currentPageWalkIn = totalPagesWalkIn;
        loadWalkInReservations(currentPageWalkIn);
    });
    
});

function updatePaginationControls(currentPage, totalPages) {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}

function updatePaginationControlsP(currentPage, totalPages) {
    const prevButton = document.getElementById('prevButtonP');
    const nextButton = document.getElementById('nextButtonP');
    
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}

function updatePaginationControlsW(currentPage, totalPages) {
    const prevButton = document.getElementById('prevButtonW');
    const nextButton = document.getElementById('nextButtonW');
    
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}

function toggleTierSelection(tier) {
    const index = selectedTiersActive.indexOf(tier);
    if (index > -1) {
        selectedTiersActive.splice(index, 1);
    } else {
        selectedTiersActive.push(tier);
    }
    updateTierButtons(); 
    loadActiveReservations(1);
}

function toggleTierSelectionP(tier) {
    const index = selectedTiersInactive.indexOf(tier);
    if (index > -1) {
        selectedTiersInactive.splice(index, 1);
    } else {
        selectedTiersInactive.push(tier);
    }
    updateTierButtonsP(); 
    loadPastReservations(1);
}

function toggleTierSelectionW(tier) {
    const index = selectedTiersWalkIn.indexOf(tier);
    if (index > -1) {
        selectedTiersWalkIn.splice(index, 1);
    } else {
        selectedTiersWalkIn.push(tier);
    }
    updateTierButtonsW(); 
    loadWalkInReservations(1);
}

function updateTierButtons() {
    for (let tier = 1; tier <= 3; tier++) {
        const button = document.getElementById(`filterTier${tier}`);
        if (selectedTiersActive.includes(tier)) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }
    }
}

function updateTierButtonsP() {
    for (let tier = 1; tier <= 3; tier++) {
        const button = document.getElementById(`PfilterTier${tier}`);
        if (selectedTiersInactive.includes(tier)) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }
    }
}

function updateTierButtonsW() {
    for (let tier = 1; tier <= 3; tier++) {
        const button = document.getElementById(`WfilterTier${tier}`);
        if (selectedTiersWalkIn.includes(tier)) {
            button.classList.add("selected");
        } else {
            button.classList.remove("selected");
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateTierButtons();
    updateTierButtonsP();
    loadActiveReservations(1);
    loadPastReservations(1);
    updateTierButtonsW();
    loadWalkInReservations(1);

    for (let tier = 1; tier <= 3; tier++) {
        document.getElementById(`filterTier${tier}`).addEventListener('click', function() {
            toggleTierSelection(tier);
        });

        document.getElementById(`PfilterTier${tier}`).addEventListener('click', function() {
            toggleTierSelectionP(tier);
        });

        document.getElementById(`WfilterTier${tier}`).addEventListener('click', function() {
            toggleTierSelectionW(tier);
        });
    }
});

// function to check when the whole reservation is expired/cancelled
function expireCancelledRemainSlots(reservation) {
    let reservationLength = Object.keys(reservation).length - 1; //length -1 due to tier number

    // count number of remaining available slots (i.e. !cancelled_by)
    let remainingSlots = 0;
    for (let i = 0; i < reservationLength; i++) {
        if (reservation[i].cancelled_by == null || reservation[i].cancelled_by == "null") {
            remainingSlots++;
        }
    }

    // check if the reservation is expired (when all available month day year time_start is less than current datetime)
    let expired = isRealtime;    // change to true to enable CHANGE!! FOR REAL-TIME CHECKING
    for (let i = 0; i < reservationLength; i++) {
        if (reservation[i].cancelled_by == null && !isPast(new Date(reservation[i].year, reservation[i].month - 1, reservation[i].day, Math.floor(reservation[i].time_start / 100), reservation[i].time_start % 100))){
            expired = false;
            break;
        }
    }

    // precedence of status: Cancelled > Expired
    if (remainingSlots == 0) {
        return "Cancelled";
    } else if (expired) {
        return "Expired";
    }

    /* if (remainingSlots == 0 && expired) {
        return "Cancelled/Expired";
    } else if (remainingSlots == 0) {
        return "Cancelled";
    } else if (expired) {
        return "Expired";
    } */

    return remainingSlots;
}

// returns null when all reservations are expired/cancelled
function createReservationElement(reservation) {

    let reservationLength = Object.keys(reservation).length - 1; //length -1 due to tier number

    let remainingSlots = expireCancelledRemainSlots(reservation);

    if (remainingSlots == "Cancelled" || remainingSlots == "Expired" || remainingSlots == "Cancelled/Expired") {
        return null;
    }
    
    //the start of a new Prog Lang (LV and Stanley):
    //divtoadd -> reservationContainer

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
    const dateReserved = reservation[0].month + '/' + reservation[0].day + '/' + reservation[0].year;
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

    // earliest time start that is available (i.e. !cancelled_by)
    // create array of available time starts
    let timeStarts = [];
    for (let i = 0; i < reservationLength; i++) {
        if (reservation[i].cancelled_by == null || reservation[i].cancelled_by == "null") {
            timeStarts.push(reservation[i].time_start);
        }
    }

    let timeStart_ = Math.min(...timeStarts);
       
    if (remainingSlots > 1) {
        timeSpan.textContent = `${Math.floor((timeStart_)/100).toString().padStart(2, '0')}:${((timeStart_)%100).toString().padStart(2, '0')}` + ' (30m + '+ (remainingSlots - 1) +' more) ';
    } else {
        timeSpan.textContent = `${Math.floor((timeStart_)/100).toString().padStart(2, '0')}:${((timeStart_)%100).toString().padStart(2, '0')}` + ' (30 minutes)';
    }
    
    timeLi.appendChild(timeSpan);
    
    reservationUl.appendChild(timeLi);

    // Manage Link
    var manageLi = document.createElement("li");
    var manageDiv = document.createElement('div');
    manageDiv.classList.add('main-border-button');
    
    addManageBtnForm(manageDiv, reservation[0].reservation_id);
    
    
    manageLi.appendChild(manageDiv);
    reservationUl.appendChild(manageLi);

    reservationDiv.appendChild(reservationUl);

    return reservationDiv;
}   // end createReservationElement

function createInactiveReservationElement(reservation) {
    
    let reservationLength = Object.keys(reservation).length - 1; //length -1 due to tier number

    let status = expireCancelledRemainSlots(reservation);

    // check if integer type
    if (typeof status === 'number') {
        return null;
    }
    
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
    const dateReserved = reservation[0].month + '/' + reservation[0].day + '/' + reservation[0].year;
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
    statusSpan.textContent = status; // placeholder
    statusLi.appendChild(statusHeader);
    statusLi.appendChild(statusSpan);
    reservationUl.appendChild(statusLi);

    // Slots
    
    let slotLi = document.createElement("li");
    let slotHeader = document.createElement('h4');
    slotHeader.textContent = 'Slots';
    slotLi.appendChild(slotHeader);
    let slotSpan = document.createElement('span');
    let slotSpanText = reservationLength + " Reservation";// add s if more than 1
    if (reservationLength > 1) {
        slotSpanText += "s";
    } 
    slotSpan.textContent = slotSpanText;
    
    slotLi.appendChild(slotSpan);
    
    reservationUl.appendChild(slotLi);

    // Manage Link
    var manageLi = document.createElement("li");
    var manageDiv = document.createElement('div');
    manageDiv.classList.add('main-border-button');
    
    addViewBtnForm(manageDiv, reservation[0].reservation_id);
    
    
    manageLi.appendChild(manageDiv);
    reservationUl.appendChild(manageLi);

    reservationDiv.appendChild(reservationUl);

    return reservationDiv;
}  // end createInactiveReservationElement

// returns null when all reservations are expired/cancelled
function createWalkinReservationElement(reservation) {

    let reservationLength = Object.keys(reservation).length - 1; //length -1 due to tier number

    let remainingSlots = expireCancelledRemainSlots(reservation);

    if (remainingSlots == "Cancelled" || remainingSlots == "Expired" || remainingSlots == "Cancelled/Expired") {
        return null;
    }
    
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
    const dateReserved = reservation[0].month + '/' + reservation[0].day + '/' + reservation[0].year;
    var dateLi = document.createElement("li");
    var dateHeader = document.createElement('h4');
    var dateSpan = document.createElement('span');
    dateHeader.textContent = 'Date Reserved';
    dateSpan.textContent = dateReserved;
    dateLi.appendChild(dateHeader);
    dateLi.appendChild(dateSpan);
    reservationUl.appendChild(dateLi);

    // Name
    var statusLi = document.createElement("li");
    var statusHeader = document.createElement('h4');
    var statusSpan = document.createElement('span');
    statusHeader.textContent = 'Name';
    // alert(JSON.stringify(reservation[0]));
    if (reservation[0].assigned_to == '') {
        statusSpan.textContent = '-';
    } else {
        statusSpan.textContent = reservation[0].assigned_to;
    }
    statusLi.appendChild(statusHeader);
    statusLi.appendChild(statusSpan);
    reservationUl.appendChild(statusLi);

    // Time Start
    
    var timeLi = document.createElement("li");
    var timeHeader = document.createElement('h4');
    timeHeader.textContent = 'Time Start';
    timeLi.appendChild(timeHeader);
    var timeSpan = document.createElement('span');

    // earliest time start that is available (i.e. !cancelled_by)
    // create array of available time starts
    let timeStarts = [];
    for (let i = 0; i < reservationLength; i++) {
        if (reservation[i].cancelled_by == null || reservation[i].cancelled_by == "null") {
            timeStarts.push(reservation[i].time_start);
        }
    }

    let timeStart_ = Math.min(...timeStarts);
       
    if (remainingSlots > 1) {
        timeSpan.textContent = `${Math.floor((timeStart_)/100).toString().padStart(2, '0')}:${((timeStart_)%100).toString().padStart(2, '0')}` + ' (30m + '+ (remainingSlots - 1) +' more) ';
    } else {
        timeSpan.textContent = `${Math.floor((timeStart_)/100).toString().padStart(2, '0')}:${((timeStart_)%100).toString().padStart(2, '0')}` + ' (30 minutes)';
    }
    
    timeLi.appendChild(timeSpan);
    
    reservationUl.appendChild(timeLi);

    // Reserver Name
    let reserver_username = reservation[0].reserver_username;
    if (!reserver_username) {
        reserver_username = '**Deleted**';
    }
    let reserverLi = document.createElement("li");
    let reserverHeader = document.createElement('h4');
    let reserverSpan = document.createElement('span');
    reserverHeader.textContent = 'Reserver';
    reserverLi.appendChild(reserverHeader);
    reserverSpan.textContent = reserver_username;
    reserverLi.appendChild(reserverSpan);
    reservationUl.appendChild(reserverLi);

    // Manage Link
    var manageLi = document.createElement("li");
    var manageDiv = document.createElement('div');
    manageDiv.classList.add('main-border-button');
    
    addManageBtnForm(manageDiv, reservation[0].reservation_id);
    
    
    manageLi.appendChild(manageDiv);
    reservationUl.appendChild(manageLi);

    reservationDiv.appendChild(reservationUl);

    return reservationDiv;
}   // end createWalkinReservationElement

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
    manageButton.classList.add('main-border-button');

    manageDiv.appendChild(manageForm);
}

function addViewBtnForm(manageDiv,reservation_id) {
    let manageForm = document.createElement("form");
    
    manageForm.method = "POST";
    manageForm.action = "/view-reservation";
    
    let hiddenField = document.createElement("input");
    hiddenField.type = "hidden";
    hiddenField.name = "reservation_id";
    hiddenField.value = reservation_id;
    manageForm.appendChild(hiddenField);
    

    var manageButton = document.createElement("button");
    manageButton.type = "submit";
    manageButton.textContent = "View";
    manageForm.appendChild(manageButton);
    manageButton.classList.add('main-border-button');

    manageDiv.appendChild(manageForm);
}

// function to checkDelete for the popup delete account form from profile
async function checkDelete() {
    let form = $('form[name="deleteAccount"]'); // Selects the form with the name 'deleteAccount'
    let username = form.find('input[name="username"]').val();
    if (username == getUsername()) {
        return await checkCredentials(form,'Deletion');
    } else {
        alert('Incorrect username');
        return false;
    }
}


$(document).ready(function() {
    // change password form
    $('#changePasswordBtn').click(function(e) {
      e.preventDefault();
      const currentPassword = $('#currentPassword').val();
      const newPassword = $('#newPassword').val();
      const confirmNewPassword = $('#confirmNewPassword').val();
  
      if (newPassword !== confirmNewPassword) {
        alert("New passwords do not match.");
        return;
      }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            alert("Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 numeric, and 1 special character.");
            return false;
        }
  
      $.ajax({
        url: '/change-password',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmNewPassword: confirmNewPassword
        }),
        success: function(response) {
          if (response.valid) {
            alert("Password changed successfully.");
            togglePopup(document.getElementById('changePassPopup'));
          } else {
            alert("Error: " + response.reason);
          }
        },
        error: function() {
          alert("An error occurred while attempting to change your password.");
        }
      });
    });
  });