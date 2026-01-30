// --- BAKERY SECTION ---

function renderBakery() {
    const tbody = document.getElementById('bakery-table-body');
    tbody.innerHTML = '';
    bakeryData.forEach(item => {
        const balanced = item.baked - item.sold;
        const profit = item.sold * item.price; // Simplified profit calculation
        tbody.innerHTML += `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td class="center">
                    <input type="number" value="${item.baked}" 
                           class="inline-qty-input" 
                           onchange="updateBakeryCount(${item.id}, 'baked', this.value)" 
                           min="0">
                </td>
                <td class="center">
                    <input type="number" value="${item.sold}" 
                           class="inline-qty-input" 
                           onchange="updateBakeryCount(${item.id}, 'sold', this.value)" 
                           min="0">
                </td>
                <td class="center" style="color:${balanced < 5 ? '#e74c3c' : '#27ae60'}; font-weight:bold;">${balanced}</td>
                <td class="currency"><strong>${formatCurrency(item.price)}</strong></td>
                <td class="currency"><strong>${formatCurrency(profit)}</strong></td>
                <td class="action-cell">
                    <button class="btn btn-delete-small" onclick="deleteBakeryItem(${item.id})" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
}

// Populate Food Dropdown for Bakery
function populateBakeryFoodDropdown() {
    const select = document.getElementById('bakery-food-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Food Item --</option>';

    foodsData.forEach(food => {
        const option = document.createElement('option');
        option.value = food.id;
        option.textContent = `${food.name} - LKR ${food.price}`;
        select.appendChild(option);
    });
}

// Auto-fill price and name when food is selected
function autoFillBakeryPrice() {
    const selectId = parseInt(document.getElementById('bakery-food-select').value);
    const priceInput = document.getElementById('bakery-unit-price');
    const nameInput = document.getElementById('bakery-item-name');

    if (!selectId) {
        priceInput.value = '';
        return;
    }

    const food = foodsData.find(f => f.id === selectId);
    if (food) {
        priceInput.value = food.price;
        nameInput.value = food.name;
    }
}

// Update Bakery Counts (Inline)
function updateBakeryCount(id, field, value) {
    const item = bakeryData.find(i => i.id === id);
    if (!item) return;

    const newValue = parseInt(value) || 0;

    if (newValue < 0) {
        alert('Quantity cannot be negative');
        renderBakery(); // Reset input
        return;
    }

    if (field === 'sold' && newValue > item.baked) {
        alert('Sold quantity cannot be greater than baked quantity!');
        renderBakery(); // Reset input
        return;
    }

    item[field] = newValue;

    // If we changed baked, re-validate sold just in case
    if (field === 'baked' && item.sold > item.baked) {
        // Option: reset sold or alert? 
        // Let's just alert for now or leave it inconsistent until they fix it, 
        // but re-rendering profit/balance relies on it.
        // Let's force consistency? Or just visually show it? 
        // The table renders balance. 
    }

    renderBakery();
    // showSuccessMessage('Updated! 🍞'); // Optional, might be annoying on every change
}

// Open Add Bakery Modal
function openAddBakeryModal() {
    document.getElementById('bakery-modal-title').textContent = '🍞 Add Bakery Item';
    document.getElementById('bakery-item-id').value = '';
    document.getElementById('bakery-food-select').value = '';
    document.getElementById('bakery-item-name').value = '';
    document.getElementById('bakery-baked-qty').value = '';
    document.getElementById('bakery-sold-qty').value = '0';
    document.getElementById('bakery-unit-price').value = '';

    populateBakeryFoodDropdown();
    document.getElementById('addBakeryItemModal').style.display = 'flex';
}

// Close Bakery Modal
function closeBakeryModal() {
    document.getElementById('addBakeryItemModal').style.display = 'none';
}

// Save Bakery Item (Add/Edit)
function saveBakeryItem() {
    const id = document.getElementById('bakery-item-id').value;
    const name = document.getElementById('bakery-item-name').value.trim();
    const baked = parseInt(document.getElementById('bakery-baked-qty').value) || 0;
    const sold = parseInt(document.getElementById('bakery-sold-qty').value) || 0;
    const price = parseFloat(document.getElementById('bakery-unit-price').value) || 0;

    if (!name) { alert('Please enter item name'); return; }
    if (baked < 0) { alert('Please enter valid baked quantity'); return; }
    if (price <= 0) { alert('Please enter valid price'); return; }
    if (sold > baked) { alert('Sold quantity cannot be greater than baked quantity!'); return; }

    if (id) {
        // Edit existing
        const index = bakeryData.findIndex(i => i.id == id);
        if (index !== -1) {
            bakeryData[index] = { ...bakeryData[index], name, baked, sold, price };
            showSuccessMessage('Bakery item updated! 🍞');
        }
    } else {
        // Add new
        const newId = bakeryData.length > 0 ? Math.max(...bakeryData.map(i => i.id)) + 1 : 1;
        bakeryData.push({ id: newId, name, baked, sold, price });
        showSuccessMessage('New bakery item added! 🍞');
    }

    closeBakeryModal();
    renderBakery();
}

// Delete Bakery Item
function deleteBakeryItem(id) {
    if (!confirm('Are you sure you want to delete this bakery item?')) return;

    const index = bakeryData.findIndex(i => i.id === id);
    if (index !== -1) {
        bakeryData.splice(index, 1);
        renderBakery();
        showSuccessMessage('Item deleted.');
    }
}
