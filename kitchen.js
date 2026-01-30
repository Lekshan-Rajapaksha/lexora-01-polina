// --- KITCHEN SECTION ---

function updateKitchen(index, field, value) {
    kitchenData[index][field] = Number(value);
    // Re-render handled by the button or auto-refresh if preferred
}

function updateKitchenUnit(index, field, value) {
    kitchenData[index][field] = value;
}

function renderKitchen() {
    const tbody = document.getElementById('kitchen-table-body');
    tbody.innerHTML = '';
    kitchenData.forEach((item, index) => {
        // Parse arrived quantity
        const arrivedMatch = String(item.arrived || '0').match(/^([\d.]+)\s*(.*)$/);
        const arrivedValue = arrivedMatch ? arrivedMatch[1] : item.arrived || 0;
        const arrivedUnit = arrivedMatch && arrivedMatch[2] ? arrivedMatch[2] : (item.arrivedUnit || 'KG');

        // Parse used quantity
        const usedMatch = String(item.used || '0').match(/^([\d.]+)\s*(.*)$/);
        const usedValue = usedMatch ? usedMatch[1] : item.used || 0;
        const usedUnit = usedMatch && usedMatch[2] ? usedMatch[2] : (item.usedUnit || 'KG');

        const available = parseFloat(arrivedValue || 0) - parseFloat(usedValue || 0);

        const units = ['g', 'KG', 'Liter', 'Pcs'];
        let arrivedUnitOptions = '';
        let usedUnitOptions = '';
        units.forEach(unit => {
            arrivedUnitOptions += `<option value="${unit}" ${unit === arrivedUnit ? 'selected' : ''}>${unit}</option>`;
            usedUnitOptions += `<option value="${unit}" ${unit === usedUnit ? 'selected' : ''}>${unit}</option>`;
        });

        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" value="${arrivedValue}" onchange="updateKitchen(${index}, 'arrived', this.value)" style="flex: 1;">
                        <select onchange="updateKitchenUnit(${index}, 'arrivedUnit', this.value)" style="flex: 1;">
                            ${arrivedUnitOptions}
                        </select>
                    </div>
                </td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" value="${usedValue}" onchange="updateKitchen(${index}, 'used', this.value)" style="flex: 1;">
                        <select onchange="updateKitchenUnit(${index}, 'usedUnit', this.value)" style="flex: 1;">
                            ${usedUnitOptions}
                        </select>
                    </div>
                </td>
                <td style="font-weight:bold;">${available} ${arrivedUnit}</td>
                <td><button class="btn btn-save" onclick="renderKitchen()">Update</button></td>
            </tr>
        `;
    });
}
