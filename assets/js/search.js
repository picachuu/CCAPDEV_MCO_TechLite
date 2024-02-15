function showSearchForm(option) {
    document.getElementById('searchMemberForm').style.display = 'none';
    document.getElementById('searchSeatsForm').style.display = 'none';
    document.getElementById('availableSeats').style.display = 'none'; // Add this line

    if (option === 'member') {
        document.getElementById('searchMemberForm').style.display = 'block';
    } else if (option === 'seats') {
        document.getElementById('searchSeatsForm').style.display = 'block';
        document.getElementById('availableSeats').style.display = 'block'; // Display available seats for this option
    }
}

function showForm() {
    document.getElementById('reservationForm').style.display = 'block';
}

function submitMemberSearch() {
    // Implement the logic to search for a member by name or ID.
    // This is a placeholder function. You might need to connect to a server or perform some action to search for members.
    alert('Searching for member...');
}

function submitSeatSearch() {
    // Implement the logic to search for available seats by time slot.
    // This is a placeholder function. You might need to connect to a server or perform some action to search for seats.
    alert('Searching for available seats...');
}
function filterSeatsByTime() {
    const time = document.getElementById('timeInput').value;
    if (!time) {
        alert("Please select a time to search for available seats.");
        return;
    }

    // Placeholder: Logic to fetch available seats based on time
    // This could involve fetching data from a server
    // For demonstration, we'll simulate with static data

    // Simulate fetching available seats for all tiers
    showAvailableSeats();
}

function showAvailableSeats() {
    const seatsContainer = document.getElementById('availableSeats');
    seatsContainer.innerHTML = ''; // Clear previous results

    // Simulate displaying seats for Tier 1 to Tier 3
    ['tier1', 'tier2', 'tier3'].forEach(tier => {
        const tierDiv = document.createElement('div');
        tierDiv.classList.add('tier');
        const title = document.createElement('h3');
        title.textContent = `Available Seats (${tier.toUpperCase()})`;
        tierDiv.appendChild(title);

        // Populate tier with example seats (modify as needed)
        for (let i = 1; i <= 5; i++) { // Example: 5 seats per tier
            const seat = document.createElement('button');
            seat.textContent = `Seat ${i}`;
            seat.classList.add('seat', 'available');
            seat.onclick = function() {
                showForm(); // Function to show the reservation form
            };
            tierDiv.appendChild(seat);
        }

        seatsContainer.appendChild(tierDiv);
    });
}

function showForm() {
    // Show the reservation form similar to the reserve.html functionality
    document.getElementById('reservationForm').style.display = 'block';
}


