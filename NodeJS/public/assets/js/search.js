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

function loadtierSelection() {

    const tierFilterSelect = document.getElementById('tierFilter');
    const option = new Option('None', 'none');
    tierFilterSelect.add(option);

    for (let i = 1; i < 4; i++) {
        const option = new Option('Tier '+i, 'tier'+i);
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
        const option = new Option('Seat '+i, 'seat'+i);
        seatFilterSelect.add(option);
    }
}

function loadDateSelection() {
    const dayFilterSelect = document.getElementById('dateFilter');
    const today = getCurrentDateTime();
    const option = new Option('None', 'none');
    dayFilterSelect.add(option);

    for (let i = 0; i < 3; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        const option = new Option(futureDate.toLocaleDateString(), futureDate.toISOString().split('T')[0]);
        dayFilterSelect.add(option);
    }
}

function PopulateResultContainer() {
    var searchOption = document.getElementById('searchOptions').value;
    switch (searchOption) {
        case 'member':
                PopulateMemberResults(); //same for manager and user
            break;
        case 'seats':
                PopulateSeatResults(); //manager: all, user: available
            break;
    }
}

function PopulateSeatResults() {
    
    data_send = {
        tier: document.getElementById('tierFilter').value,
        seats: document.getElementById('seatFilter').value,
        date: document.getElementById('dateFilter').value,
        time_start: document.getElementById('time_startFilter').value,
        isManager: getIsManager()
    };
    
    $.ajax({
            url: 'search-seats-request',
            type: 'POST',
            data: data_send,
            async: true,
            success: function(server_resp, status) {
                //fill up with results yung container
                

            },
            error: function() {
                console.error('Failed to load reservations');
            }
    });
    
}


