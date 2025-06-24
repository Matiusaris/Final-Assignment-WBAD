document.addEventListener('DOMContentLoaded', () => {
    const cars = [
        { id: 'avanza', name: 'Toyota Avanza', pricePerDay: 500000, image: '/images/avanza.png' },
        { id: 'innova', name: 'Toyota Kijang Innova', pricePerDay: 700000, image: '/images/innova.png' },
        { id: 'hrv', name: 'Honda HRV', pricePerDay: 600000, image: '/images/hrv.png' },
        { id: 'sigra', name: 'Daihatsu Sigra', pricePerDay: 450000, image: '/images/sigra.png' }
    ];

    const calculateTotalButton = document.getElementById('calculate-total');
    const saveOrderButton = document.getElementById('save-order');
    const summaryDetails = document.getElementById('summary-details');
    const totalPriceSpan = document.getElementById('total-price');
    const pastOrdersList = document.getElementById('past-orders');
    const customerNameInput = document.getElementById('customer-name');

    // Initialize car inputs state
    cars.forEach(car => {
        const checkbox = document.getElementById(car.id);
        const startDateInput = document.getElementById(`${car.id}-start-date`);
        const durationInput = document.getElementById(`${car.id}-duration`);

        // Disable inputs by default
        startDateInput.disabled = true;
        durationInput.disabled = true;

        checkbox.addEventListener('change', () => {
            startDateInput.disabled = !checkbox.checked;
            durationInput.disabled = !checkbox.checked;
            if (!checkbox.checked) {
                startDateInput.value = '';
                durationInput.value = '';
            }
        });
    });

    calculateTotalButton.addEventListener('click', calculateTotal);
    saveOrderButton.addEventListener('click', saveOrder);

    loadOrders(); 

    function calculateTotal() {
        let grandTotal = 0;
        summaryDetails.innerHTML = ''; 
        const selectedCars = [];

        cars.forEach(car => {
            const checkbox = document.getElementById(car.id);
            const startDateInput = document.getElementById(`${car.id}-start-date`);
            const durationInput = document.getElementById(`${car.id}-duration`);

            if (checkbox.checked) {
                const startDate = startDateInput.value;
                const duration = parseInt(durationInput.value);

                if (!startDate || isNaN(duration) || duration <= 0) {
                    alert(`Please enter valid start date and duration for ${car.name}.`);
                    return;
                }

                const subtotal = car.pricePerDay * duration;
                grandTotal += subtotal;

                selectedCars.push({
                    name: car.name,
                    startDate: startDate,
                    duration: duration,
                    subtotal: subtotal
                });

                const carSummaryItem = document.createElement('p');
                carSummaryItem.textContent = `${car.name}: ${duration} days from ${startDate} - Rp ${subtotal.toLocaleString()}`;
                summaryDetails.appendChild(carSummaryItem);
            }
        });

        totalPriceSpan.textContent = `Rp ${grandTotal.toLocaleString()}`;

        sessionStorage.setItem('currentSelectedCars', JSON.stringify(selectedCars));
        sessionStorage.setItem('currentGrandTotal', grandTotal);
    }

    function saveOrder() {
        const customerName = customerNameInput.value.trim();
        if (!customerName) {
            alert('Please enter your name.');
            return;
        }

        const selectedCars = JSON.parse(sessionStorage.getItem('currentSelectedCars') || '[]');
        const grandTotal = parseFloat(sessionStorage.getItem('currentGrandTotal') || '0');

        if (selectedCars.length === 0) {
            alert('Please select at least one car and calculate the total before saving.');
            return;
        }

        const timestamp = new Date().toLocaleString();
        const order = {
            customerName: customerName,
            cars: selectedCars,
            total: grandTotal,
            timestamp: timestamp
        };

        let orders = JSON.parse(localStorage.getItem('carRentalOrders') || '[]');
        orders.push(order);
        localStorage.setItem('carRentalOrders', JSON.stringify(orders));

        alert('Order saved successfully!');
        loadOrders();
        resetForm();
    }

    function loadOrders() {
        pastOrdersList.innerHTML = '';
        let orders = JSON.parse(localStorage.getItem('carRentalOrders') || '[]');

        if (orders.length === 0) {
            pastOrdersList.innerHTML = '<p>No past orders found.</p>';
            return;
        }

        orders.forEach(order => {
            const listItem = document.createElement('li');
            let carSummary = order.cars.map(car => `${car.name} (${car.duration} days)`).join(', ');
            listItem.innerHTML = `
                <div>
                    <strong>${order.customerName}</strong><br>
                    ${carSummary}<br>
                    Total: Rp ${order.total.toLocaleString()}<br>
                    <small>Ordered on: ${order.timestamp}</small>
                </div>
                <button data-timestamp="${order.timestamp}">Delete</button>
            `;
            pastOrdersList.appendChild(listItem);
        });

        pastOrdersList.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (event) => {
                const timestampToDelete = event.target.dataset.timestamp;
                deleteOrder(timestampToDelete);
            });
        });
    }

    function deleteOrder(timestamp) {
        let orders = JSON.parse(localStorage.getItem('carRentalOrders') || '[]');
        const updatedOrders = orders.filter(order => order.timestamp !== timestamp);
        localStorage.setItem('carRentalOrders', JSON.stringify(updatedOrders));
        alert('Order deleted successfully!');
        loadOrders(); // Refresh the list
    }

    function resetForm() {
        // Uncheck all car checkboxes
        cars.forEach(car => {
            const checkbox = document.getElementById(car.id);
            const startDateInput = document.getElementById(`${car.id}-start-date`);
            const durationInput = document.getElementById(`${car.id}-duration`);
            checkbox.checked = false;
            startDateInput.value = '';
            startDateInput.disabled = true;
            durationInput.value = '';
            durationInput.disabled = true;
        });

        customerNameInput.value = '';
        summaryDetails.innerHTML = '';
        totalPriceSpan.textContent = 'Rp 0';
        sessionStorage.removeItem('currentSelectedCars');
        sessionStorage.removeItem('currentGrandTotal');
    }
});