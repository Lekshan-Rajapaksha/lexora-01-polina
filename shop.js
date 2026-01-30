// --- SHOP SECTION ---

function renderShop() {
    const tbody = document.getElementById('shop-table-body');
    tbody.innerHTML = '';
    shopData.forEach(item => {
        const remaining = item.stock - item.sold;
        const profit = item.sold * (item.price * 0.2); // Assuming 20% margin
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.stock}</td>
                <td>${item.sold}</td>
                <td>${remaining}</td>
                <td>${profit.toFixed(2)}</td>
            </tr>
        `;
    });
}
