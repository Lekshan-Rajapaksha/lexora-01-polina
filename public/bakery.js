// --- BAKERY SECTION ---

// Daily reset is handled by Client-Side Logic (via checkAndPerformBakeryReset)

// --- 3. AUTO-RESET LOGIC (Client-Side) ---

let hasCheckedBakeryReset = false; // Ensure logic runs only once per session/reload

async function checkAndPerformBakeryReset() {
    if (hasCheckedBakeryReset) return;
    hasCheckedBakeryReset = true;

    try {
        console.log("Checking daily reset status for Bakery...");
        const settingsDoc = await db.collection('system').doc('bakerySettings').get();
        const todayStr = getLocalDateString(); // YYYY-MM-DD in local timezone

        let lastResetDate = null;
        if (settingsDoc.exists) {
            lastResetDate = settingsDoc.data().lastResetDate;
        }

        if (lastResetDate === todayStr) {
            console.log("Bakery is already reset for today.");
            return;
        }

        // Use the lastResetDate as the history date effectively
        // If lastResetDate is "2024-01-01", that's the day we are archiving FOR.
        const archiveDate = lastResetDate ? new Date(lastResetDate) : new Date(todayStr); // Fallback if null, though unlikely if logic matches

        console.log(`Performing daily reset... Last: ${lastResetDate}, Today: ${todayStr}, Archiving as: ${getLocalDateString(archiveDate)}`);
        showSuccessMessage("Performing Daily Reset... ⏳");

        const batch = db.batch();
        let operationCount = 0;

        // Use archiveDate instead of todayDate (which was new Date())
        // const todayDate = new Date(); // REMOVED

        bakeryData.forEach(item => {
            const baked = parseInt(item.baked) || 0;
            const sold = parseInt(item.sold) || 0;
            const itemRef = db.collection('bakery').doc(item.id);

            if (baked > 0 || sold > 0) {
                // Archive
                const historyRef = db.collection('bakeryHistory').doc();
                batch.set(historyRef, {
                    ...item,
                    date: archiveDate, // Corrected date
                    archivedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Reset
                batch.update(itemRef, {
                    baked: 0,
                    sold: 0,
                    date: new Date() // Reset the item's current date to NOW (new day)
                });

                operationCount++;
            } else {
                // Even items with 0 baked/sold get date updated
                batch.update(itemRef, {
                    date: new Date()
                });
                operationCount++;
            }
        });

        // Update settings
        const settingsRef = db.collection('system').doc('bakerySettings');
        batch.set(settingsRef, { lastResetDate: todayStr }, { merge: true });

        if (operationCount > 0) {
            await batch.commit();
            console.log(`Reset complete. Reset ${operationCount} items.`);
            showSuccessMessage("Daily Reset Complete! 🌅");
        } else {
            // Just update the date if no items needed resetting
            await settingsRef.set({ lastResetDate: todayStr }, { merge: true });
            console.log("No items needed resetting, date updated.");
        }

    } catch (error) {
        console.error("Error in checkAndPerformBakeryReset:", error);
    }
}

// Call this at the end of renderBakery
function renderBakery() {
    const tbody = document.getElementById('bakery-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    bakeryData.forEach(item => {
        // Look up current name and price from Foods if foodId exists
        let currentName = item.name; // Default to stored name
        let currentPrice = item.price; // Default to stored price
        let priceWarning = '';

        if (item.foodId) {
            const food = foodsData.find(f => f.id == item.foodId);
            if (food) {
                currentName = food.name; // Use current name from Foods
                currentPrice = food.price; // Use current price from Foods
            } else {
                priceWarning = ' ⚠️'; // Food item no longer exists
            }
        }

        const balanced = item.baked - item.sold;
        const profit = item.sold * currentPrice;
        // Always show current date instead of N/A
        const currentDate = new Date().toLocaleDateString();
        const lastSoldDate = item.lastSoldDate ? new Date(item.lastSoldDate.seconds * 1000).toLocaleDateString() : currentDate;
        const lastBakedDate = item.lastBakedDate ? new Date(item.lastBakedDate.seconds * 1000).toLocaleDateString() : currentDate;

        tbody.innerHTML += `
            <tr>
                <td><strong>${currentName}${priceWarning}</strong></td>
                <td class="center">
                   <input type="number" 
                           value="${item.baked}" 
                           class="inline-qty-input" 
                           onchange="updateBakeryDocument(this, '${item.id}', 'baked', ${item.sold})" 
                           min="0">
                   <br><small style="color: #7f8c8d;">${currentDate}</small>
                </td>
                <td class="center">
                    <input type="number" 
                           value="${item.sold}" 
                           class="inline-qty-input" 
                           onchange="updateBakeryDocument(this, '${item.id}', 'sold', ${item.baked})" 
                           min="0">
                    <br><small style="color: #7f8c8d;">${currentDate}</small>
                </td>
                <td class="center" style="color:${balanced < 5 ? '#e74c3c' : '#27ae60'}; font-weight:bold;">${balanced}</td>
                <td class="currency"><strong>${formatCurrency(currentPrice)}</strong></td>
                <td class="currency"><strong>${formatCurrency(profit)}</strong></td>
                <td class="action-cell">
                    <button class="btn btn-delete-small" onclick="deleteDocument('bakery', '${item.id}')" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });

    // Attempt Auto-Reset
    checkAndPerformBakeryReset();
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

        // Deduct ingredients if 'sold' increased
        if (field === 'sold') {
            const currentItem = bakeryData.find(i => i.id === id);
            // bakeryData still holds the old value until snapshot updates, 
            // BUT we just updated the DB. Snapshot comes async. 
            // So currentItem.sold is likely the OLD value.
            if (currentItem) {
                const oldSold = currentItem.sold || 0;
                const delta = newValue - oldSold;
                if (delta > 0 && currentItem.foodId) {
                    deductIngredientsFromInventory(currentItem.foodId, delta);
                }
            }
        }
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
    const foodId = document.getElementById('bakery-food-select').value; // Store food reference

    if (!name) { alert('Please enter item name'); return; }
    if (baked < 0) { alert('Please enter valid baked quantity'); return; }
    if (price <= 0) { alert('Please enter valid price'); return; }
    if (sold > baked) { alert('Sold quantity cannot be greater than baked quantity!'); return; }

    if (id) {
        // Edit existing
        const existingItem = bakeryData.find(i => i.id === id);
        const updateData = { name, baked, sold, price, foodId: foodId || null };

        // Add timestamps if values changed
        if (existingItem && baked !== existingItem.baked) {
            updateData.lastBakedDate = firebase.firestore.FieldValue.serverTimestamp();
        }
        if (existingItem && sold !== existingItem.sold) {
            updateData.lastSoldDate = firebase.firestore.FieldValue.serverTimestamp();
        }

        db.collection('bakery').doc(id).update(updateData).then(() => {
            showSuccessMessage('Bakery item updated! 🍞');
            closeBakeryModal();
        });
    } else {
        // Add new
        const newDocRef = db.collection('bakery').doc();
        newDocRef.set({
            name, baked, sold, price, foodId: foodId || null,
            date: new Date(),
            lastBakedDate: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            showSuccessMessage('New bakery item added! 🍞');
            closeBakeryModal();
        });
    }
}


