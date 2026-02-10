// --- EMPLOYEES SECTION ---

function renderEmployees() {
    const tbody = document.getElementById('employees-table-body');
    if (!tbody) return;

    // Get today's date YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];

    // Fetch Employees AND Attendance for today
    Promise.all([
        db.collection('employees').orderBy('name', 'asc').get(),
        db.collection('attendance').where('date', '==', todayStr).get()
    ]).then(([employeesSnapshot, attendanceSnapshot]) => {
        tbody.innerHTML = '';

        // Create Set of Employee IDs present today
        const presentEmployeeIds = new Set();
        attendanceSnapshot.forEach(doc => {
            presentEmployeeIds.add(doc.data().employeeId);
        });

        if (employeesSnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No employees found. Add one to get started!</td></tr>`;
            return;
        }

        employeesSnapshot.forEach(doc => {
            const employee = doc.data();
            const id = doc.id;
            const isPresent = presentEmployeeIds.has(id);

            tbody.innerHTML += `
                <tr>
                    <td>${employee.name}</td>
                    <td>${employee.position}</td>
                    <td>
                        <span class="badge ${employee.salaryType === 'monthly' ? 'badge-blue' : 'badge-green'}">
                            ${employee.salaryType === 'monthly' ? 'Monthly' : 'Daily'}
                        </span>
                    </td>
                    <td class="currency">${formatCurrency(employee.amount)}</td>
                    <td class="center">
                        <label class="switch">
                            <input type="checkbox" 
                                   ${isPresent ? 'checked' : ''} 
                                   onchange="toggleAttendance('${id}', '${employee.name}', this)">
                            <span class="slider round"></span>
                        </label>
                    </td>
                    <td class="action-cell">
                        <button class="btn btn-delete-small" onclick="deleteDocument('employees', '${id}')" title="Remove Employee">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        });

        // Populate Payment Dropdown as well
        populateEmployeePaymentDropdown(employeesSnapshot);

    }).catch(error => {
        console.error("Error rendering employees:", error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">Error loading data.</td></tr>`;
    });
}

// Function to populate the payment dropdown
function populateEmployeePaymentDropdown(employeesSnapshot) {
    const select = document.getElementById('payment-employee-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Employee --</option>';

    employeesSnapshot.forEach(doc => {
        const employee = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = employee.name;
        option.dataset.name = employee.name; // Store name for easy access
        select.appendChild(option);
    });
}

// Save Employee Payment
function saveEmployeePayment() {
    const select = document.getElementById('payment-employee-select');
    const employeeId = select.value;
    const employeeName = select.options[select.selectedIndex]?.dataset.name;
    const amount = parseFloat(document.getElementById('payment-employee-amount').value) || 0;
    const date = document.getElementById('payment-employee-date').value;

    if (!employeeId) { alert('Please select an employee'); return; }
    if (amount <= 0) { alert('Please enter a valid amount'); return; }
    if (!date) { alert('Please select a date'); return; }

    db.collection('employee_money').add({
        employeeId: employeeId,
        employeeName: employeeName,
        amount: amount,
        date: date,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showSuccessMessage(`Payment of ${formatCurrency(amount)} recorded for ${employeeName}! 💰`);
        // Reset form
        select.value = '';
        document.getElementById('payment-employee-amount').value = '';
        document.getElementById('payment-employee-date').value = '';
    }).catch(err => {
        console.error("Error adding payment:", err);
        alert("Failed to record payment.");
    });
}

// Toggle Attendance Status
function toggleAttendance(employeeId, employeeName, checkbox) {
    const todayStr = new Date().toISOString().split('T')[0];
    const docId = `${employeeId}_${todayStr}`; // Unique ID per employee per day
    const attendanceRef = db.collection('attendance').doc(docId);

    if (checkbox.checked) {
        // Mark Present
        attendanceRef.set({
            employeeId: employeeId,
            name: employeeName,
            date: todayStr,
            status: 'present',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log(`Marked ${employeeName} as present.`);
            // No alert needed for smooth UX, toggle is enough feedback
        }).catch(err => {
            console.error("Error marking attendance:", err);
            checkbox.checked = false; // Revert if failed
            alert("Failed to save attendance.");
        });
    } else {
        // Mark Absent (Remove record)
        attendanceRef.delete().then(() => {
            console.log(`Removed attendance for ${employeeName}.`);
        }).catch(err => {
            console.error("Error removing attendance:", err);
            checkbox.checked = true; // Revert if failed
            alert("Failed to update attendance.");
        });
    }
}

// Open Add Employee Modal
function openAddEmployeeModal() {
    document.getElementById('employee-modal-title').textContent = '👨‍🍳 Add New Employee';
    document.getElementById('employee-id').value = '';
    document.getElementById('employee-name').value = '';
    document.getElementById('employee-position').value = '';
    document.getElementById('employee-salary-type').value = 'monthly';
    document.getElementById('employee-amount').value = '';

    document.getElementById('addEmployeeModal').style.display = 'flex';
}

// Close Employee Modal
function closeAddEmployeeModal() {
    document.getElementById('addEmployeeModal').style.display = 'none';
}

// Save Employee (Add only, editing can be done by deleting and re-adding for simplicity primarily)
function saveEmployee() {
    const name = document.getElementById('employee-name').value.trim();
    const position = document.getElementById('employee-position').value.trim();
    const salaryType = document.getElementById('employee-salary-type').value;
    const amount = parseFloat(document.getElementById('employee-amount').value) || 0;

    if (!name) { alert('Please enter employee name'); return; }
    if (!position) { alert('Please enter position'); return; }
    if (amount <= 0) { alert('Please enter a valid salary amount'); return; }

    const newDocRef = db.collection('employees').doc();
    newDocRef.set({
        name,
        position,
        salaryType,
        amount,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showSuccessMessage('Employee added successfully! 👨‍🍳');
        closeAddEmployeeModal();
    }).catch(error => {
        console.error("Error adding employee:", error);
        alert("Failed to add employee.");
    });
}
