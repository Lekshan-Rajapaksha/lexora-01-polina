// --- SALARY SECTION (Daily Wage System) ---

// Currency Formatter
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Track which row is being edited
let editingRowId = null;

function renderSalary() {
    const tbody = document.getElementById('salary-table-body');
    tbody.innerHTML = '';

    let totalEmployees = salaryData.length;
    let totalEarned = 0;
    let totalPaid = 0;
    let balanceDue = 0;

    salaryData.forEach((emp) => {
        const totalSalary = emp.dailySalary * emp.workedDays;
        const balance = totalSalary - emp.totalPaid;

        // Accumulate totals
        totalEarned += totalSalary;
        totalPaid += emp.totalPaid;
        balanceDue += balance;

        const isEditing = editingRowId === emp.id;

        tbody.innerHTML += `
            <tr id="row-${emp.id}" class="${isEditing ? 'editing-row' : ''}">
                <td><strong>EMP-${String(emp.id).padStart(3, '0')}</strong></td>
                <td>${emp.name}</td>
                <td><span class="role-badge">${emp.role}</span></td>
                <td class="currency editable-cell">
                    ${isEditing ?
                `<input type="number" id="edit-daily-${emp.id}" value="${emp.dailySalary}" min="0" step="100" class="edit-input">` :
                formatCurrency(emp.dailySalary)
            }
                </td>
                <td class="center">
                    ${isEditing ?
                `<input type="number" id="edit-days-${emp.id}" value="${emp.workedDays}" min="0" max="31" class="edit-input">` :
                `<div class="days-control">
                            <button class="btn-arrow" onclick="adjustDays(${emp.id}, -1)" title="Decrease days">
                                <span>▼</span>
                            </button>
                            <span class="days-value" id="days-${emp.id}">${emp.workedDays}</span>
                            <button class="btn-arrow" onclick="adjustDays(${emp.id}, 1)" title="Increase days">
                                <span>▲</span>
                            </button>
                        </div>`
            }
                </td>
                <td class="currency total-salary"><strong>${formatCurrency(totalSalary)}</strong></td>
                <td class="currency editable-cell">
                    ${isEditing ?
                `<input type="number" id="edit-paid-${emp.id}" value="${emp.totalPaid}" min="0" step="100" class="edit-input">` :
                formatCurrency(emp.totalPaid)
            }
                </td>
                <td class="currency ${balance > 0 ? 'balance-due' : 'balance-clear'}">
                    <strong>${formatCurrency(balance)}</strong>
                </td>
                <td class="action-cell">
                    ${isEditing ?
                `<button class="btn btn-save-small" onclick="saveSalary(${emp.id})">💾 Save</button>
                         <button class="btn btn-cancel-small" onclick="cancelEdit()">✖ Cancel</button>` :
                `<button class="btn btn-edit-small" onclick="editSalary(${emp.id})">✏️ Edit</button>`
            }
                </td>
            </tr>
        `;
    });

    // Update Summary Cards
    document.getElementById('total-employees').textContent = totalEmployees;
    document.getElementById('total-earned').textContent = 'LKR ' + formatCurrency(totalEarned);
    document.getElementById('total-paid').textContent = 'LKR ' + formatCurrency(totalPaid);
    document.getElementById('balance-due').textContent = 'LKR ' + formatCurrency(balanceDue);
}

function editSalary(empId) {
    editingRowId = empId;
    renderSalary();
}

function cancelEdit() {
    editingRowId = null;
    renderSalary();
}

function saveSalary(empId) {
    const emp = salaryData.find(e => e.id === empId);
    if (!emp) return;

    // Get new values from inputs
    const newDailySalary = parseFloat(document.getElementById(`edit-daily-${empId}`).value) || 0;
    const newWorkedDays = parseFloat(document.getElementById(`edit-days-${empId}`).value) || 0;
    const newTotalPaid = parseFloat(document.getElementById(`edit-paid-${empId}`).value) || 0;

    // Update the data
    emp.dailySalary = newDailySalary;
    emp.workedDays = newWorkedDays;
    emp.totalPaid = newTotalPaid;

    // Exit edit mode and re-render
    editingRowId = null;
    renderSalary();

    // Show success feedback (optional)
    const row = document.getElementById(`row-${empId}`);
    row.style.backgroundColor = '#d4edda';
    setTimeout(() => {
        row.style.backgroundColor = '';
    }, 1000);
}

// Adjust worked days with +/- buttons
function adjustDays(empId, change) {
    const emp = salaryData.find(e => e.id === empId);
    if (!emp) return;

    // Update worked days with validation
    const newDays = emp.workedDays + change;

    // Ensure days don't go below 0 or above 31
    if (newDays < 0 || newDays > 31) return;

    emp.workedDays = newDays;

    // Re-render to update display and totals
    renderSalary();

    // Visual feedback - highlight the row briefly
    const row = document.getElementById(`row-${empId}`);
    const daysValue = document.getElementById(`days-${empId}`);

    // Animate the days value
    daysValue.style.transform = 'scale(1.3)';
    daysValue.style.color = change > 0 ? '#27ae60' : '#c0392b';

    setTimeout(() => {
        daysValue.style.transform = 'scale(1)';
        daysValue.style.color = '';
    }, 300);
}

// Open Add Employee Modal
function openAddEmployeeModal() {
    document.getElementById('addEmployeeModal').style.display = 'flex';
    document.getElementById('emp-name').focus();
}

// Close Add Employee Modal
function closeAddEmployeeModal() {
    document.getElementById('addEmployeeModal').style.display = 'none';
    document.getElementById('emp-name').value = '';
    document.getElementById('emp-role').value = '';
    document.getElementById('emp-daily-salary').value = '';
}

// Save New Employee
function saveNewEmployee() {
    const name = document.getElementById('emp-name').value.trim();
    const role = document.getElementById('emp-role').value.trim();
    const dailySalary = parseFloat(document.getElementById('emp-daily-salary').value) || 0;

    if (!name) { alert('Please enter employee name'); return; }
    if (!role) { alert('Please enter designation/role'); return; }
    if (dailySalary <= 0) { alert('Please enter a valid daily salary'); return; }

    // Generate new ID
    const newId = salaryData.length > 0 ? Math.max(...salaryData.map(e => e.id)) + 1 : 1;

    // Add new employee object
    salaryData.push({
        id: newId,
        name: name,
        role: role,
        dailySalary: dailySalary,
        workedDays: 0, // Default to 0 days
        totalPaid: 0   // Default to 0 paid
    });

    closeAddEmployeeModal();
    renderSalary();

    // Smooth scroll to bottom to see new entry
    setTimeout(() => {
        const tableContainer = document.querySelector('#salary .table-container');
        tableContainer.scrollTop = tableContainer.scrollHeight;
    }, 100);

    // Optional success message (if we had a toaster)
    // alert('New employee added successfully!');
}
