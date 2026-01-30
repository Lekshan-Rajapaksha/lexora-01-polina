// --- KITCHEN SECTION ---

// Currency Formatter
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function renderKitchen() {
    const tbody = document.getElementById('kitchen-table-body');
    tbody.innerHTML = '';

    kitchenData.forEach((item, index) => {
        const arrivedValue = parseFloat(item.arrived) || 0;
        const usedValue = parseFloat(item.used) || 0;
        const available = arrivedValue - usedValue;
        const pricePerUnit = parseFloat(item.pricePerUnit) || 0;
        const fullPrice = arrivedValue * pricePerUnit;

        const arrivedUnit = item.arrivedUnit || 'KG';
        const usedUnit = item.usedUnit || 'KG';

        tbody.innerHTML += `
            <tr>
                <td class="center"><strong>${index + 1}</strong></td>
                <td><strong>${item.name}</strong></td>
                <td class="center">
                    <span class="qty-display">${arrivedValue} ${arrivedUnit}</span>
                </td>
                <td class="center">
                    <div class="qty-control-inline">
                        <button class="btn-arrow-small" onclick="adjustUsed(${item.id}, -1)" title="Decrease">−</button>
                        <span class="qty-value-inline">${usedValue} ${usedUnit}</span>
                        <button class="btn-arrow-small" onclick="adjustUsed(${item.id}, 1)" title="Increase">+</button>
                    </div>
                </td>
                <td class="center">
                    <strong class="available-qty">${available.toFixed(2)} ${arrivedUnit}</strong>
                </td>
                <td class="currency total-value"><strong>${formatCurrency(fullPrice)}</strong></td>
                <td class="action-cell">
                    <button class="btn btn-delete-small" onclick="deleteKitchenItem(${item.id})" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });

    // Update the dropdown for existing ingredients
    updateIngredientDropdown();
}

// Update dropdown with existing ingredients
function updateIngredientDropdown() {
    const select = document.getElementById('kitchen-ingredient-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Ingredient --</option>';

    kitchenData.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.name} (Available: ${(parseFloat(item.arrived) - parseFloat(item.used)).toFixed(2)} ${item.arrivedUnit})`;
        select.appendChild(option);
    });
}

// Update info when selecting existing ingredient
function updateExistingIngredientInfo() {
    const selectId = parseInt(document.getElementById('kitchen-ingredient-select').value);
    if (!selectId) {
        document.getElementById('kitchen-arrived-unit-existing').value = '';
        return;
    }

    const item = kitchenData.find(i => i.id === selectId);
    if (item) {
        document.getElementById('kitchen-arrived-unit-existing').value = item.arrivedUnit;
    }
}

// Open modal for new ingredient type
function openNewIngredientModal() {
    document.getElementById('newIngredientModal').style.display = 'flex';
}

// Close modal for new ingredient type
function closeNewIngredientModal() {
    document.getElementById('newIngredientModal').style.display = 'none';
    // Clear form
    document.getElementById('kitchen-ingredient-name-new').value = '';
    document.getElementById('kitchen-arrived-qty-new').value = '';
    document.getElementById('kitchen-price-new').value = '';
    document.getElementById('kitchen-arrived-unit-new').value = 'KG';
}

// Save NEW ingredient type (from modal)
function saveNewIngredient() {
    const name = document.getElementById('kitchen-ingredient-name-new').value.trim();
    const arrived = parseFloat(document.getElementById('kitchen-arrived-qty-new').value) || 0;
    const arrivedUnit = document.getElementById('kitchen-arrived-unit-new').value;
    const fullPrice = parseFloat(document.getElementById('kitchen-price-new').value) || 0;

    // Validation
    if (!name) {
        alert('Please enter ingredient name');
        return;
    }

    // Check if ingredient already exists
    const exists = kitchenData.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert('This ingredient already exists! Use the main form to add stock.');
        return;
    }

    if (arrived <= 0) {
        alert('Please enter a valid quantity');
        return;
    }

    if (fullPrice <= 0) {
        alert('Please enter a valid price');
        return;
    }

    // Calculate price per unit
    const pricePerUnit = fullPrice / arrived;

    // Add new item
    const newId = kitchenData.length > 0 ? Math.max(...kitchenData.map(i => i.id)) + 1 : 1;
    kitchenData.push({
        id: newId,
        name: name,
        arrived: arrived,
        arrivedUnit: arrivedUnit,
        used: 0,
        usedUnit: arrivedUnit,
        pricePerUnit: pricePerUnit
    });

    // Close modal and clear form
    closeNewIngredientModal();

    // Re-render table
    renderKitchen();

    // Show success message
    showSuccessMessage(`New ingredient "${name}" added successfully!`);
}

// Add stock to EXISTING ingredient
function addExistingIngredientStock() {
    const selectId = parseInt(document.getElementById('kitchen-ingredient-select').value);
    const qtyToAdd = parseFloat(document.getElementById('kitchen-arrived-qty-existing').value) || 0;
    const fullPrice = parseFloat(document.getElementById('kitchen-price-existing').value) || 0;

    // Validation
    if (!selectId) {
        alert('Please select an ingredient');
        return;
    }

    if (qtyToAdd <= 0) {
        alert('Please enter a valid quantity to add');
        return;
    }

    if (fullPrice <= 0) {
        alert('Please enter a valid price');
        return;
    }

    // Find the item
    const item = kitchenData.find(i => i.id === selectId);
    if (!item) return;

    // Calculate new price per unit (weighted average)
    const oldTotal = item.arrived * item.pricePerUnit;
    const newTotal = oldTotal + fullPrice;
    const newArrived = item.arrived + qtyToAdd;
    const newPricePerUnit = newTotal / newArrived;

    // Update item
    item.arrived = newArrived;
    item.pricePerUnit = newPricePerUnit;

    // Clear form
    document.getElementById('kitchen-ingredient-select').value = '';
    document.getElementById('kitchen-arrived-qty-existing').value = '';
    document.getElementById('kitchen-price-existing').value = '';
    document.getElementById('kitchen-arrived-unit-existing').value = '';

    // Re-render table
    renderKitchen();

    // Show success message
    showSuccessMessage(`Added ${qtyToAdd} ${item.arrivedUnit} to ${item.name}!`);
}

// Adjust used quantity with +/- buttons
function adjustUsed(itemId, change) {
    const item = kitchenData.find(i => i.id === itemId);
    if (!item) return;

    const newUsed = (parseFloat(item.used) || 0) + change;
    const arrived = parseFloat(item.arrived) || 0;

    // Ensure used doesn't go below 0 or above arrived
    if (newUsed < 0 || newUsed > arrived) return;

    item.used = newUsed;
    renderKitchen();
}

// Delete ingredient
function deleteKitchenItem(itemId) {
    if (confirm('Are you sure you want to delete this ingredient?')) {
        const index = kitchenData.findIndex(i => i.id === itemId);
        if (index > -1) {
            kitchenData.splice(index, 1);
            renderKitchen();
            showSuccessMessage('Ingredient deleted!');
        }
    }
}

// Show success message
function showSuccessMessage(message) {
    // Create temporary message element
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
    `;
    document.body.appendChild(msgDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        msgDiv.remove();
    }, 3000);
}
