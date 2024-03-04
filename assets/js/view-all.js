document.getElementById('tierSelect').addEventListener('change', function() {
    // Clear existing seats display
    const seatsContainer = document.getElementById('seatsContainer');
    seatsContainer.innerHTML = '';

    // Fetch and display seats based on selected tier
    const tier = this.value;
    fetchSeatsForTier(tier).then(seats => {
        seats.forEach(seat => {
            const seatElement = document.createElement('div');
            seatElement.className = `seat ${seat.isReserved ? 'unavailable' : ''}`;
            seatElement.textContent = `Seat ${seat.number}`;
            seatElement.onclick = () => {
                if (seat.isReserved) {
                    // Display reserved seat details
                } else {
                    // Show reservation form
                }
            };
            seatsContainer.appendChild(seatElement);
        });
    });
});

function fetchSeatsForTier(tier) {
    // Placeholder: Replace with actual fetch call to your backend/API
    return Promise.resolve([]);
}
