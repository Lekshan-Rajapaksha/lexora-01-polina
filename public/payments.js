// --- OTHER PAYMENTS SECTION ---

// Render Payments Table (Client-side filtering for daily view)
function renderOtherPayments() {
    const tbody = document.getElementById('payments-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const todayStr = new Date().toISOString().split('T')[0];

    // Filter for today's data ONLY for display
    const todaysPayments = otherPaymentsData.filter(item => {
        // Handle various date formats just in case
        let itemDateStr = '';
        if (item.date && item.date.toDate) {
            itemDateStr = item.date.toDate().toISOString().split('T')[0];
        } else if (typeof item.date === 'string') {
            itemDateStr = item.date;
        }
        return itemDateStr === todayStr;
    });

    if (todaysPayments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="center">No payments recorded for today.</td></tr>';
        return;
    }

    todaysPayments.forEach(item => {
        const typeLabel = item.type === 'income' ? '<span style="color: #27ae60;">🟢 Income</span>' : '<span style="color: #c0392b;">🔴 Expense</span>';

        let displayDate = 'N/A';
        if (item.date && item.date.toDate) {
            displayDate = item.date.toDate().toLocaleDateString();
        } else if (typeof item.date === 'string') {
            displayDate = item.date;
        }

        tbody.innerHTML += `
            <tr>
                <td>${displayDate}</td>
                <td>${item.description}</td>
                <td>${typeLabel}</td>
                <td class="currency"><strong>${formatCurrency(item.amount)}</strong></td>
                <td class="action-cell">
                    <button class="btn btn-delete-small" onclick="deletePayment('${item.id}')" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
}

// Open Add Payment Modal
function openAddPaymentModal() {
    document.getElementById('payment-description').value = '';
    document.getElementById('payment-amount').value = '';

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('payment-date').value = today;

    // Reset radio to expense
    const radios = document.getElementsByName('payment-type');
    for (const r of radios) {
        if (r.value === 'expense') r.checked = true;
    }

    document.getElementById('addPaymentModal').style.display = 'flex';
}

// Close Payment Modal
function closePaymentModal() {
    document.getElementById('addPaymentModal').style.display = 'none';
}

// Save Payment
function savePayment() {
    const description = document.getElementById('payment-description').value.trim();
    const amount = parseFloat(document.getElementById('payment-amount').value) || 0;
    const dateStr = document.getElementById('payment-date').value;

    let type = 'expense';
    const radios = document.getElementsByName('payment-type');
    for (const r of radios) { if (r.checked) type = r.value; }

    if (!description) { alert('Please enter a description'); return; }
    if (amount <= 0) { alert('Please enter a valid amount'); return; }
    if (!dateStr) { alert('Please select a date'); return; }

    const paymentData = {
        description,
        amount,
        type,
        date: firebase.firestore.Timestamp.fromDate(new Date(dateStr)),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('otherPayments').add(paymentData)
        .then(() => {
            showSuccessMessage('Payment saved successfully! 💸');
            closePaymentModal();
        })
        .catch(error => {
            console.error("Error saving payment:", error);
            alert("Failed to save payment.");
        });
}

// Delete Payment
function deletePayment(id) {
    if (!confirm("Are you sure you want to delete this payment record?")) return;

    db.collection('otherPayments').doc(id).delete()
        .then(() => {
            showSuccessMessage('Payment deleted.');
        })
        .catch(error => {
            console.error("Error deleting payment:", error);
            alert("Failed to delete payment.");
        });
}
