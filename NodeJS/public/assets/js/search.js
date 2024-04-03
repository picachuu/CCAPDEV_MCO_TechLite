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
        //loadDurationSelection();
        loadSeatSelection();
        loadDateSelection();
    });
}

function showSearchForm(selection) {
    if (selection === 'accounts') {
        document.getElementById('searchMemberForm').style.display = 'block';
        document.getElementById('searchSlotsForm').style.display = 'none';
    }
    else if (selection === 'slots') {
        document.getElementById('searchMemberForm').style.display = 'none';
        document.getElementById('searchSlotsForm').style.display = 'block';
    }
    else {
        document.getElementById('searchMemberForm').style.display = 'none';
        document.getElementById('searchSlotsForm').style.display = 'none';
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
            const option = new Option(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`, hour+minutes);
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

    for (let i = 1; i < 4; i++) {
        const futureDate = new Date(today);
        // console.log(futureDate.toISOString().split('T')[0]);
        futureDate.setDate(today.getDate() + i);
        const option = new Option(futureDate.toLocaleDateString('en-US', { timeZone: 'UTC' }), futureDate.toISOString().split('T')[0]);
        dayFilterSelect.add(option);
    }
}

function PopulateResultContainer() {

    document.getElementById('searchResult-container').innerHTML = '';
    var searchOption = document.getElementById('searchOptions').value;
    switch (searchOption) {
        case 'accounts':
            PopulateMemberResults(); //same for manager and user
            break;
        case 'slots':
            PopulateSlotsResults(); //manager: all, user: available
            break;
    }
}

function PopulateSlotsResults() {
    
    data_send = {
        tier: document.getElementById('tierFilter').value,
        seats: document.getElementById('seatFilter').value,
        date: document.getElementById('dateFilter').value,
        time_start: document.getElementById('time_startFilter').value,
        isManager: getIsManager()
    };
    
    $.ajax({
            url: 'search-slots-request',
            type: 'POST',
            data: data_send,
            async: true,
            success: function(server_resp, status) {

                console.log("data received: " + server_resp.slots.length);
                //iterate through the length of the seats array and create a div (to be added to results container for each seat
                server_resp.slots.forEach(slot => {
                    console.log("slot seat number: " + slot.seats);
                    AddSlotToContainer(slot);
                });
            },
            error: function() {
                console.error('Failed to load reservations');
            }
    });
}

function AddSlotToContainer(slot) {
    //if taken (is available, meaning this was used for manager search of slots parameter)

   
    if (slot.taken) {

    }

    else {//if available
        const resultContainer = document.getElementById('searchResult-container');
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
        const dateReserved = slot.day + '/' + slot.month + '/' + slot.year;
        var dateLi = document.createElement("li");
        var dateHeader = document.createElement('h4');
        var dateSpan = document.createElement('span');
        dateHeader.textContent = 'Date Reserved';
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
        statusSpan.textContent = 'Ongoing'; // placeholder
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
        
        //addReserveBtn();
        // use in adding taken slots
        //addManageBtnForm(manageDiv, reservation[0].reservation_id);
        
        
        reserveLi.appendChild(reserveDiv);
        slotUl.appendChild(reserveLi);

        slotDiv.appendChild(slotUl);

        resultContainer.appendChild(slotDiv);
    }
}

function addReserveBtn(reserveDiv, slot_tier, slot_id) {
    let manageForm = document.createElement("form");
    
    manageForm.method = "POST";
    manageForm.action = "/add-reservation";
    
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

    reserveDiv.appendChild(manageForm);
}