// --- KITCHEN SECTION ---

function updateKitchen(index, field, value) {
    kitchenData[index][field] = Number(value);
    // Re-render handled by the button or auto-refresh if preferred
}

function renderKitchen() {
    const tbody = document.getElementById('kitchen-table-body');
    tbody.innerHTML = '';
    kitchenData.forEach((item, index) => {
        const available = item.arrived - item.used;
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td><input type="number" value="${item.arrived}" onchange="updateKitchen(${index}, 'arrived', this.value)"></td>
                <td>${item.used}</td>
                <td style="font-weight:bold;">${available}</td>
                <td><button class="btn btn-save" onclick="renderKitchen()">Update</button></td>
            </tr>
        `;
    });
}
