document.addEventListener("DOMContentLoaded", function() {
    const serviceContent = document.getElementById("serviceContent");

    document.getElementById("printFile").addEventListener("click", function() {
        serviceContent.innerHTML = `
            <h2>Print a File</h2>
            <p>Select your file to print:</p>
            <input type="file">
            <button onclick="alert('File submitted for printing')">Submit</button>
        `;
    });

    document.getElementById("orderFood").addEventListener("click", function() {
        serviceContent.innerHTML = `
            <h2>Order Food</h2>
            <p>Select items to order:</p>
            <div class="food-menu">
                <div class="food-item">
                    <img src="path/to/pancit-canton-image.jpg" alt="Pancit Canton">
                    <label><input type="checkbox" name="food" value="Pancit Canton - P50"> Pancit Canton - P50</label>
                </div>
                <div class="food-item">
                    <img src="path/to/shin-ramyun-image.jpg" alt="Shin Ramyun">
                    <label><input type="checkbox" name="food" value="Shin Ramyun - P100"> Shin Ramyun - P100</label>
                </div>
                <div class="food-item">
                    <img src="path/to/pepperoni-pizza-image.jpg" alt="Pepperoni Pizza">
                    <label><input type="checkbox" name="food" value="Pepperoni Pizza - P120"> Pepperoni Pizza - P120</label>
                </div>
                <div class="food-item">
                    <img src="path/to/coke-image.jpg" alt="Coke">
                    <label><input type="checkbox" name="food" value="Coke - P70"> Coke - P70</label>
                </div>
                <div class="food-item">
                    <img src="path/to/water-image.jpg" alt="Water">
                    <label><input type="checkbox" name="food" value="Water - P50"> Water - P50</label>
                </div>
            </div>
            <button type="button" onclick="submitOrder()">Order</button>
        `;
    });
    

    document.getElementById("litecoinShop").addEventListener("click", function() {
        serviceContent.innerHTML = `
            <h2>Litecoin Shop</h2>
            <p>Use your litecoins to purchase rewards:</p>
            <form id="litecoinShopForm">
                <label><input type="radio" name="reward" value="100 Litecoins for $10 Credit"> 100 Litecoins for $10 Credit</label><br>
                <label><input type="radio" name="reward" value="200 Litecoins for $25 Credit"> 200 Litecoins for $25 Credit</label><br>
                <label><input type="radio" name="reward" value="500 Litecoins for $70 Credit"> 500 Litecoins for $70 Credit</label><br>
                <button type="button" onclick="purchaseReward()">Purchase</button>
            </form>
        `;
    });
});

function submitOrder() {
    const selectedItems = document.querySelectorAll('#foodOrderForm input[name="food"]:checked');
    const selectedValues = Array.from(selectedItems).map(item => item.value);
    if (selectedValues.length > 0) {
        alert('Order successfully placed for: ' + selectedValues.join(', '));
    } else {
        alert('No items selected. Please select at least one item to order.');
    }
}

function purchaseReward() {
    const selectedReward = document.querySelector('#litecoinShopForm input[name="reward"]:checked');
    if (selectedReward) {
        alert(`Reward successfully purchased: ${selectedReward.value}`);
    } else {
        alert('No reward selected. Please select a reward to purchase.');
    }
}
