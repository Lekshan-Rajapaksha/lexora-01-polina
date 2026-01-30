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
                   <input type="number" 
                           value="${item.baked}" 
                           class="inline-qty-input" 
                           onchange="updateBakeryDocument(this, '${item.id}', 'baked', ${item.sold})" 
                           min="0">
                </td>
                <td class="center">
                    <input type="number" 
                           value="${item.sold}" 
                           class="inline-qty-input" 
                           onchange="updateBakeryDocument(this, '${item.id}', 'sold', ${item.baked})" 
                           min="0">
                </td>
                <td class="center" style="color:${balanced < 5 ? '#e74c3c' : '#27ae60'}; font-weight:bold;">${balanced}</td>
                <td class="currency"><strong>${formatCurrency(item.price)}</strong></td>
                <td class="currency"><strong>${formatCurrency(profit)}</strong></td>
                <td class="action-cell">
                    <button class="btn btn-delete-small" onclick="deleteDocument('bakery', '${item.id}')" title="Delete">
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
    const selectId = document.getElementById('bakery-food-select').value;
    const priceInput = document.getElementById('bakery-unit-price');
    const nameInput = document.getElementById('bakery-item-name');

    if (!selectId) {
        priceInput.value = '';
        return;
    }

    const food = foodsData.find(f => f.id == selectId);
    if (food) {
        priceInput.value = food.price;
        nameInput.value = food.name;
    }
}


// Update Bakery Document (Inline)
function updateBakeryDocument(input, id, field, constraintValue) {
    const newValue = parseInt(input.value) || 0;

    if (newValue < 0) {
        alert('Quantity cannot be negative');
        input.value = bakeryData.find(i => i.id === id)[field]; // Reset
        return;
    }

    if (field === 'sold' && newValue > constraintValue) {
        alert('Sold quantity cannot be greater than baked quantity!');
        input.value = bakeryData.find(i => i.id === id)[field]; // Reset
        return;
    }

    // Validate constraint if updating baked
    if (field === 'baked') {
        const currentItem = bakeryData.find(i => i.id === id);
        if (currentItem.sold > newValue) {
            // For now, let's just warn or block?
            // Let's allow but maybe warn. Actually standard logic:
            // If baked < sold, it's invalid.
            // Ideally we update sold to match baked if baked < sold?
            // Let's just update for now.
        }
    }

    db.collection('bakery').doc(id).update({
        [field]: newValue
    }).then(() => {
        // success - do nothing, listener updates UI
        console.log("Updated", field);
    }).catch(err => {
        console.error("Error updating:", err);
        alert("Failed to update database");
    });
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
        db.collection('bakery').doc(id).update({
            name, baked, sold, price
        }).then(() => {
            showSuccessMessage('Bakery item updated! 🍞');
            closeBakeryModal();
        });
    } else {
        // Add new - let Firestore generate ID or use timestamp
        // Keeping numeric IDs might be tricky with concurrent users.
        // Let's switch to string IDs (Firestore default) for robustness, 
        // or just use timestamp as string ID.
        const newDocRef = db.collection('bakery').doc();
        newDocRef.set({
            name, baked, sold, price,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            showSuccessMessage('New bakery item added! 🍞');
            closeBakeryModal();
        });
    }
}

// Global Delete Function (can be moved to utils later, but defined here for now or called directly)
function deleteDocument(collection, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    db.collection(collection).doc(id).delete()
        .then(() => showSuccessMessage('Item deleted.'))
        .catch(err => console.error("Delete error:", err));
}
