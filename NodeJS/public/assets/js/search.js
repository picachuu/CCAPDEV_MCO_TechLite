let currentPageSearch = 1;
let totalPagesSearch = 0;
let pageSizeSearch = 5;

if (window.location.pathname === '/search') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Search page loaded');

        //modify the search options based on the user type
        // - user: search seats
        // - manager: search seats, search members
        //when selecting search Available seats display the following filters:
        // - tier
        // - preferred time_starts (or a window)
        // - duration (optional maybe)
        // - seat (??)
        // - date (ofc) - year, month, day

        loadtierSelection();
        loadTimeStartSelection();
        loadSeatSelection();
        loadDateSelection();

    });
}

function showSearchForm(selection) {
    if (selection === 'accounts') {
        document.getElementById('searchAccountForm').style.display = 'block';
        document.getElementById('searchSlotsForm').style.display = 'none';
        document.getElementById('searchResult-container').innerHTML = '';
        document.getElementById('searchResultsDiv').style.display = 'none';
    }
    else if (selection === 'slots') {
        document.getElementById('searchAccountForm').style.display = 'none';
        document.getElementById('searchSlotsForm').style.display = 'block';
        document.getElementById('searchResult-container').innerHTML = '';
        document.getElementById('searchResultsDiv').style.display = 'none';
    }
    else {
        document.getElementById('searchAccountForm').style.display = 'none';
        document.getElementById('searchSlotsForm').style.display = 'none';
        document.getElementById('searchResult-container').innerHTML = '';
        document.getElementById('searchResultsDiv').style.display = 'none';
    }
}

function loadtierSelection() {

    const tierFilterSelect = document.getElementById('tierFilter');
    const option = new Option('None', 'none');
    tierFilterSelect.add(option);

    for (let i = 1; i < 4; i++) {
        const option = new Option('Tier '+i, i);
        tierFilterSelect.add(option);
    }
}

function loadTimeStartSelection() {
    const timeStartSelect = document.getElementById('time_startFilter');
    const option = new Option('None', 'none');
    timeStartSelect.add(option);
    
    for (let hour = 0; hour <= 23; hour += 1) {
        for (let minutes = 0; minutes < 60; minutes += 30) {
            const option = new Option(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`, hour*100    +minutes);
            timeStartSelect.add(option);
        }
    }
}

function loadSeatSelection() {
    const seatFilterSelect = document.getElementById('seatFilter');
    const option = new Option('None', 'none');
    seatFilterSelect.add(option);

    for (let i = 1; i < 16; i++) {
        const option = new Option('Seat '+i, i);
        seatFilterSelect.add(option);
    }
}

function loadDateSelection() {
    const dayFilterSelect = document.getElementById('dateFilter');
    const today = getCurrentDateTime();
    //has to add one day to the current date
    const option = new Option('None', 'none');
    dayFilterSelect.add(option);

    for (let i = 0; i < 3; i++) {
        const futureDate = new Date(today);
        // console.log(futureDate.toISOString().split('T')[0]);
        futureDate.setDate(today.getDate() + i);
        const option = new Option(futureDate.toLocaleDateString('en-US', { timeZone: 'UTC' }), futureDate.toISOString().split('T')[0]);
        dayFilterSelect.add(option);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    //pagination event listeners
    document.getElementById('nextButtonS').addEventListener('click', function() {
        if (currentPageSearch < totalPagesSearch) {
            currentPageSearch++; 
            PopulateSlotsResults(currentPageSearch);
        }
    });
    
    document.getElementById('prevButtonS').addEventListener('click', function() {
        if (currentPageSearch > 1) {
            currentPageSearch--; 
            PopulateSlotsResults(currentPageSearch);
        }
    });

    document.getElementById('firstButtonS').addEventListener('click', function() {
        currentPageSearch = 1; 
        PopulateSlotsResults(currentPageSearch);
    });

    document.getElementById('lastButtonS').addEventListener('click', function() {
        currentPageSearch = totalPagesSearch;
        PopulateSlotsResults(currentPageSearch);
    });
});

function PopulateResultContainer() {

    document.getElementById('searchResultsDiv').style.display = 'block';

    document.getElementById('searchResult-container').innerHTML = '';
    var searchOption = document.getElementById('searchOptions').value;
    switch (searchOption) {
        case 'accounts':
            PopulateMemberResults(1); //same for manager and user
            break;
        case 'slots':
            PopulateSlotsResults(1); //manager: all, user: available
            break;
    }
}

function PopulateSlotsResults(page) {
    page = Math.max(1, Number(page));
    data_send = {
        tier: document.getElementById('tierFilter').value,
        seats: document.getElementById('seatFilter').value,
        date: document.getElementById('dateFilter').value,
        time_start: document.getElementById('time_startFilter').value,
        isManager: getIsManager()
    };

    document.getElementById('headingRedSearch').innerHTML = "Slots";

    if (getIsManager()) {
        document.getElementById('headingWhiteSearch').innerHTML = "Obtained";
    } else {
        document.getElementById('headingWhiteSearch').innerHTML = "Available";
    }
    
    $.ajax({
            url: 'search-slots-request',
            type: 'POST',
            data: data_send,
            async: true,
            success: function(server_resp, status) {
                currentPageSearch = page; 
                const searchContainer = document.getElementById('searchResult-container');
                searchContainer.innerHTML = '';
                let slotCount = 0;
                const startIndex = (page - 1) * pageSizeSearch;
                let paginatedSlots = [];
                let combinedSlots = [];

                console.log("data received: " + server_resp.slots.length);
                //iterate through the length of the seats array and create a div (to be added to results container for each seat
                server_resp.slots.forEach(slot => {
                    const slotElement = createSlotElement(slot);
                    if (slotElement) { // only add if not null
                        combinedSlots.push(slot);
                        slotCount++;
                    }
                    /* console.log("slot seat number: " + slot.seats);
                    createSlotElement(slot); */
                });

                if (slotCount === 0) {
                    const noSlotsMsg = document.createElement('div');
                    noSlotsMsg.textContent = 'No slots available';
                    noSlotsMsg.classList.add('no-reservations');
                    searchContainer.appendChild(noSlotsMsg);
                } else {
                    console.log('Slots: ' + slotCount);
                    paginatedSlots = combinedSlots.slice(startIndex, startIndex + pageSizeSearch);
                    for (let i = 0; i < paginatedSlots.length; i++) {
                        const reservationElement = createSlotElement(paginatedSlots[i]);
                        searchContainer.appendChild(reservationElement);
                    }
                    totalPagesSearch = Math.ceil(slotCount / pageSizeSearch);
                }

                document.getElementById('currentPageS').textContent = page;
                updatePaginationControlsS(page, totalPagesSearch);
                console.log(`Slot: Requesting page ${currentPageSearch} out of ${totalPagesSearch} with page size ${pageSizeSearch}`);
            },
            error: function() {
                console.error('Failed to load reservations');
            }
    });
}

function updatePaginationControlsS(currentPage, totalPages) {
    const prevButton = document.getElementById('prevButtonS');
    const nextButton = document.getElementById('nextButtonS');
    
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
}

function expiredSlots(slot) {
    // check if the reservation is expired (when all available month day year time_start is less than current datetime)
    let expired = isRealtime;

    if (!isPast(new Date(slot.year, slot.month - 1, slot.day, Math.floor(slot.time_start / 100), slot.time_start % 100))){
        expired = false;
    }

    return expired;
}

function createSlotElement(slot) {
    //if taken (is available, meaning this was used for manager search of slots parameter)
    if (slot.taken && !getIsManager() || expiredSlots(slot)) {
        return null;
    } else {//if available or if manager
        var slotDiv = document.createElement('div');
        slotDiv.classList.add('item');
        var slotUl = document.createElement("ul");

        // Tier image based on reservation.tier
        var reservationLi1 = document.createElement("li");
        var image = document.createElement('img');
        image.alt = "Tier Image";
        switch(Number(slot.tier)) {
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
        slotUl.appendChild(reservationLi1);

        // Room and Seat
        const seatNum = slot.seats;
        var roomAndSeatLi = document.createElement("li");
        var roomHeader = document.createElement('h4');
        var roomSpan = document.createElement('span');
        roomHeader.textContent = 'Room';
        roomSpan.textContent = 'Tier ' + slot.tier + ' Seat ' + seatNum;
        roomAndSeatLi.appendChild(roomHeader);
        roomAndSeatLi.appendChild(roomSpan);
        slotUl.appendChild(roomAndSeatLi);

        // Date Reserved
        const dateReserved = slot.month + '/' + slot.day + '/' + slot.year;
        var dateLi = document.createElement("li");
        var dateHeader = document.createElement('h4');
        var dateSpan = document.createElement('span');
        dateHeader.textContent = 'Date';
        dateSpan.textContent = dateReserved;
        dateLi.appendChild(dateHeader);
        dateLi.appendChild(dateSpan);
        slotUl.appendChild(dateLi);

        // Status
        var statusLi = document.createElement("li");
        var statusHeader = document.createElement('h4');
        var statusSpan = document.createElement('span');
        statusHeader.textContent = 'Status';
        // Assume logic for determining if expired or ongoing is implemented elsewhere
        const available = !slot.taken;
        const statusStr = available ? 'Available' : 'Taken';
        statusSpan.textContent = statusStr; // placeholder
        statusLi.appendChild(statusHeader);
        statusLi.appendChild(statusSpan);
        slotUl.appendChild(statusLi);

        // Time Start
        var timeLi = document.createElement("li");
        var timeHeader = document.createElement('h4');
        timeHeader.textContent = 'Time Start';
        timeLi.appendChild(timeHeader);
        var timeSpan = document.createElement('span');

        timeSpan.textContent = `${Math.floor((slot.time_start)/100).toString().padStart(2, '0')}:${((slot.time_start)%100).toString().padStart(2, '0')}`+' (30 mins)';
        
        timeLi.appendChild(timeSpan);
        
        slotUl.appendChild(timeLi);

        // Manage Link
        var reserveLi = document.createElement("li");
        var reserveDiv = document.createElement('div');
        reserveDiv.classList.add('main-border-button');


        // let slotButton;
        // slotButton = document.createElement("button");
        // slotButton.type = "submit";
        // slotButton.classList.add('main-border-button');
        if (available) {
            addReserveBtn(reserveDiv,slot);
            // slotButton.textContent = "Reserve";
            
        } else if (getIsManager()){
            addManageBtnForm(reserveDiv,slot.reservation_id);
        } // the following two supposedly should not matter since it's already checked
        // else if (expiredSlots(slot)) {    
        //     slotButton.textContent = "Expired";
        //     slotButton.disabled = true;
        //     slotButton.classList.add('.border-no-active');
        // } else {
        //     slotButton.textContent = "Taken";
        //     slotButton.disabled = true;
        //     slotButton.classList.add('.border-no-active');
        // }

        //addReserveBtn();
        // use in adding taken slots
        //addManageBtnForm(manageDiv, reservation[0].reservation_id);
        
        // reserveDiv.appendChild(slotButton);
        reserveLi.appendChild(reserveDiv);
        slotUl.appendChild(reserveLi);

        slotDiv.appendChild(slotUl);

        return slotDiv;
    }
}

function addReserveBtn(reserveDiv, slot) {
    let manageForm = document.createElement("form");
    
    manageForm.method = "POST";
    manageForm.action = "/reserve";
    // manageForm.addEventListener('submit', function(event) {
    //     event.preventDefault(); // prevent form submission
    //     return false;
    // });

    // get slot information
    const day = slot.day;
    const month = slot.month;
    const year = slot.year;
    const time_start = slot.time_start;
    const tier = slot.tier;
    const seats = slot.seats;
    // combine YYYY-MM-DD/time_start/Tier/Seat to string so easy to split() with / and -
    const reservation = `${year}-${month}-${day}/${time_start}/${tier}/${seats}`;

    
    let hiddenField = document.createElement("input");
    hiddenField.type = "hidden";
    hiddenField.name = "reservation";
    hiddenField.value = reservation;
    manageForm.appendChild(hiddenField);
    

    var manageButton = document.createElement("button");
    manageButton.type = "submit";
    manageButton.textContent = "Reserve";
    manageForm.appendChild(manageButton);
    manageButton.classList.add('main-border-button');
    
    reserveDiv.appendChild(manageForm);
}