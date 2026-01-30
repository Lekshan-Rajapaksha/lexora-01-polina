// --- BAKERY SECTION ---

function renderBakery() {
    const tbody = document.getElementById('bakery-table-body');
    tbody.innerHTML = '';
    bakeryData.forEach(item => {
        const balanced = item.baked - item.sold;
        const profit = item.sold * item.price; // Simplified profit calculation
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.baked}</td>
                <td>${item.sold}</td>
                <td style="color:${balanced < 5 ? 'red' : 'green'}">${balanced}</td>
                <td>${item.price}</td>
                <td>${profit}</td>
            </tr>
        `;
    });
}
