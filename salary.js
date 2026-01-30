// --- SALARY SECTION ---

function renderSalary() {
    const tbody = document.getElementById('salary-table-body');
    tbody.innerHTML = '';
    salaryData.forEach(emp => {
        const total = emp.base + (emp.ot * 500); // Assuming 500 LKR per OT hour
        tbody.innerHTML += `
            <tr>
                <td>${emp.name}</td>
                <td>${emp.role}</td>
                <td>${emp.base}</td>
                <td>${emp.ot}</td>
                <td><b>${total}</b></td>
            </tr>
        `;
    });
}
