// Populate dropdowns for due dates
function populateDueDateDropdowns() {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const dueDates = [
        `${currentYear}-04-15`,
        `${currentYear}-06-15`,
        `${currentYear}-09-15`,
        `${nextYear}-01-15`
    ];

    const dropdowns = [document.getElementById('due_date'), document.getElementById('edit_due_date'), document.getElementById('filter_due_date')];
    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = `
            <option value="" disabled selected>Select a due date</option>
            ${dueDates.map(date => `<option value="${date}">${date}</option>`).join('')}
        `;
    });
}

// Fetch all payments
async function fetchPayments() {
    const response = await fetch('/payments');
    const payments = await response.json();
    const tableBody = document.getElementById('paymentsTable');
    tableBody.innerHTML = ''; // Clear the table

    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${payment[0]}</td> <!-- ID -->
            <td>${payment[1]}</td> <!-- Company -->
            <td>${payment[2]}</td> <!-- Amount -->
            <td>${payment[3]}</td> <!-- Payment Date -->
            <td>${payment[4]}</td> <!-- Status -->
            <td>${payment[5]}</td> <!-- Due Date -->
            <td>
                <button onclick="openEditPopup(${payment[0]}, '${payment[1]}', ${payment[2]}, '${payment[3]}', '${payment[4]}', '${payment[5]}')">Edit</button>
                <button onclick="deletePayment(${payment[0]})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Fetch and display summary by due date
async function fetchFilteredPayments() {
    const dueDate = document.getElementById('filter_due_date').value;
    const taxRate = parseFloat(document.getElementById('tax_rate').value || 0);

    const response = await fetch(`/payments/summary?due_date=${encodeURIComponent(dueDate)}&tax_rate=${taxRate}`);
    const { records, total_amount, tax_due } = await response.json();

    const tableBody = document.getElementById('summaryTable');
    tableBody.innerHTML = ''; // Clear the table

    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record[0]}</td>
            <td>${record[1]}</td>
            <td>${record[2]}</td>
            <td>${record[3]}</td>
            <td>${record[4]}</td>
            <td>${record[5]}</td>
        `;
        tableBody.appendChild(row);
    });

    // Update totals
    document.getElementById('totalAmount').textContent = `Total Amount: $${total_amount.toFixed(2)}`;
    document.getElementById('taxRate').textContent = `Tax Rate: ${(taxRate * 100).toFixed(2)}%`;
    document.getElementById('taxDue').textContent = `Tax Due: $${tax_due.toFixed(2)}`;
}

// Event listener for filtering
document.getElementById('filter_due_date').addEventListener('change', fetchFilteredPayments);
document.getElementById('tax_rate').addEventListener('input', fetchFilteredPayments);

// Open the Edit Popup
function openEditPopup(id, company, amount, paymentDate, status, dueDate) {
    document.getElementById('edit_id').value = id;
    document.getElementById('edit_company').value = company;
    document.getElementById('edit_amount').value = amount;
    document.getElementById('edit_payment_date').value = paymentDate;
    document.getElementById('edit_status').value = status;
    document.getElementById('edit_due_date').value = dueDate;
    document.getElementById('editPopup').style.display = 'block';
}

// Close the Edit Popup
function closePopup() {
    document.getElementById('editPopup').style.display = 'none';
}

// Delete a payment
async function deletePayment(id) {
    const response = await fetch(`/payments/${id}`, { method: 'DELETE' });
    if (response.ok) {
        alert('Payment deleted successfully!');
        fetchPayments();
    } else {
        alert('Error deleting payment.');
    }
}

// Update payment dynamically
document.getElementById('editForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const id = document.getElementById('edit_id').value;
    const data = {
        company: document.getElementById('edit_company').value,
        amount: parseFloat(document.getElementById('edit_amount').value),
        payment_date: document.getElementById('edit_payment_date').value,
        status: document.getElementById('edit_status').value,
        due_date: document.getElementById('edit_due_date').value,
    };

    if (!data.due_date) {
        alert('Please select a due date!');
        return;
    }

    const response = await fetch(`/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        alert('Transaction updated successfully!');
        closePopup();
        fetchPayments(); // Refresh the transactions table
        fetchFilteredPayments(); // Refresh the summary by due date
    } else {
        alert('Error updating transaction.');
    }
});

document.getElementById('paymentForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Ensure due_date is provided
    if (!data.due_date) {
        alert('Please select a due date!');
        return;
    }

    const response = await fetch('/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        alert('Payment added successfully!');
        fetchPayments(); // Refresh the transactions table
        fetchFilteredPayments(); // Refresh the summary table
        e.target.reset();
    } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
    }
});


// Initialize dropdowns and fetch initial data
populateDueDateDropdowns();
fetchPayments();
document.getElementById('filter_due_date').addEventListener('change', fetchFilteredPayments);
document.getElementById('filter_tax_rate').addEventListener('input', fetchFilteredPayments);
