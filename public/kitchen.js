// --- KITCHEN SECTION ---

function renderKitchen() {
    const tbody = document.getElementById('kitchen-table-body');
    tbody.innerHTML = '';

    const filterCat = document.getElementById('kitchen-category-filter') ? document.getElementById('kitchen-category-filter').value : 'all';

    kitchenData.forEach((item, index) => {
        // Filter logic: Default to 'food' if category is missing
        const itemCat = item.category || 'food';
        if (filterCat !== 'all' && itemCat !== filterCat) return;

        const arrivedValue = parseFloat(item.arrived) || 0;
        const usedValue = parseFloat(item.used) || 0;
        const available = arrivedValue - usedValue;
        const pricePerUnit = parseFloat(item.pricePerUnit) || 0;
        const fullPrice = arrivedValue * pricePerUnit;

        const arrivedUnit = item.arrivedUnit || 'KG';
        const usedUnit = item.usedUnit || 'KG';

        // Payment tracking (default to paid for old data)
        const totalPaid = parseFloat(item.totalPaid) || fullPrice;
        const unpaidPrice = fullPrice - totalPaid;
        const arrivedDate = item.arrivedDate ? new Date(item.arrivedDate.seconds * 1000).toLocaleDateString() : 'N/A';
        const lastUsedDate = item.lastUsedDate ? new Date(item.lastUsedDate.seconds * 1000).toLocaleDateString() : 'N/A';

        tbody.innerHTML += `
            <tr>
                <td class="center"><strong>${index + 1}</strong></td>
                <td><strong>${item.name}</strong></td>
                <td class="center">
                    <span class="qty-display">${arrivedValue} ${arrivedUnit}</span>
                    <br><small style="color: #7f8c8d;">${arrivedDate}</small>
                </td>
                <td class="center">
                    <div class="qty-control-inline">
                        <button class="btn-qty-dec" onclick="updateKitchenUsage('${item.id}', -1)" title="Decrease">−</button>
                        <span class="qty-value-inline">${usedValue} ${usedUnit}</span>
                        <button class="btn-qty-inc" onclick="updateKitchenUsage('${item.id}', 1)" title="Increase">+</button>
                    </div>
                    <br><small style="color: #7f8c8d;">${lastUsedDate}</small>
                </td>
                <td class="center">
                    <strong class="available-qty">${available.toFixed(2)} ${arrivedUnit}</strong>
                </td>
                <td class="currency"><strong>${formatCurrency(fullPrice)}</strong></td>
                <td class="currency" style="color: #27ae60;"><strong>${formatCurrency(totalPaid)}</strong></td>
                <td class="currency" style="color: ${unpaidPrice > 0 ? '#e74c3c' : '#7f8c8d'};"><strong>${formatCurrency(unpaidPrice)}</strong></td>
                <td class="action-cell">
                    <button class="btn btn-delete-small" onclick="deleteDocument('kitchen', '${item.id}')" title="Delete">
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
    const selectId = document.getElementById('kitchen-ingredient-select').value;
    if (!selectId) {
        document.getElementById('kitchen-arrived-unit-existing').value = '';
        return;
    }

    const item = kitchenData.find(i => i.id == selectId);
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
    if (document.getElementById('kitchen-modal-category')) {
        document.getElementById('kitchen-modal-category').value = 'food';
    }
}

// Save NEW ingredient type (from modal)
function saveNewIngredient() {
    const name = document.getElementById('kitchen-ingredient-name-new').value.trim();
    const arrived = parseFloat(document.getElementById('kitchen-arrived-qty-new').value) || 0;
    const arrivedUnit = document.getElementById('kitchen-arrived-unit-new').value;
    const fullPrice = parseFloat(document.getElementById('kitchen-price-new').value) || 0;
    const paymentStatus = document.querySelector('input[name="payment-status-new"]:checked').value;

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

    // Calculate totalPaid based on payment status
    const totalPaid = paymentStatus === 'paid' ? fullPrice : 0;

    // Get Category
    const category = document.getElementById('kitchen-modal-category').value || 'food';

    // Add new item to Firestore
    db.collection('kitchen').add({
        name,
        category,
        arrived,
        arrivedUnit,
        used: 0,
        usedUnit: arrivedUnit,
        pricePerUnit,
        totalPaid: totalPaid,
        arrivedDate: firebase.firestore.FieldValue.serverTimestamp(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then((docRef) => {
        // LOG TO STOCK COLLECTION
        const stockLog = {
            ingredientId: docRef.id,
            name: name,
            qtyAdded: arrived,
            unit: arrivedUnit,
            price: fullPrice,
            paymentStatus: paymentStatus,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            readableDate: new Date().toLocaleDateString()
        };
        db.collection('stock').add(stockLog).catch(err => console.error("Error logging stock:", err));

        closeNewIngredientModal();
        showSuccessMessage(`New ingredient "${name}" added successfully!`);
    });
}



// Add stock to EXISTING ingredient
function addExistingIngredientStock() {
    const selectId = document.getElementById('kitchen-ingredient-select').value;
    const qtyToAdd = parseFloat(document.getElementById('kitchen-arrived-qty-existing').value) || 0;
    const fullPrice = parseFloat(document.getElementById('kitchen-price-existing').value) || 0;
    const paymentStatus = document.querySelector('input[name="payment-status-existing"]:checked').value;

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

    console.log("Adding stock to ID:", selectId);

    // Find the item
    const item = kitchenData.find(i => i.id == selectId);
    if (!item) {
        console.error("Item not found in kitchenData for ID:", selectId);
        return;
    }

    // Calculate new price per unit (weighted average)
    const oldTotal = item.arrived * item.pricePerUnit;
    const newTotal = oldTotal + fullPrice;
    const newArrived = item.arrived + qtyToAdd;
    const newPricePerUnit = newTotal / newArrived;

    // Calculate new totalPaid
    const currentPaid = parseFloat(item.totalPaid) || (item.arrived * item.pricePerUnit); // Default old items as fully paid
    const additionalPaid = paymentStatus === 'paid' ? fullPrice : 0;
    const newTotalPaid = currentPaid + additionalPaid;

    // Update item in Firestore
    db.collection('kitchen').doc(String(selectId)).update({
        arrived: newArrived,
        pricePerUnit: newPricePerUnit,
        totalPaid: newTotalPaid
    }).then(() => {
        // LOG TO STOCK COLLECTION
        const stockLog = {
            ingredientId: String(selectId),
            name: item.name,
            qtyAdded: qtyToAdd,
            unit: item.arrivedUnit || 'KG',
            price: fullPrice,
            paymentStatus: paymentStatus,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            readableDate: new Date().toLocaleDateString()
        };
        db.collection('stock').add(stockLog).catch(err => console.error("Error logging stock:", err));

        // Clear form
        document.getElementById('kitchen-ingredient-select').value = '';
        document.getElementById('kitchen-arrived-qty-existing').value = '';
        document.getElementById('kitchen-price-existing').value = '';
        document.getElementById('kitchen-arrived-unit-existing').value = '';
        // Reset payment status to paid (default)
        document.querySelector('input[name="payment-status-existing"][value="paid"]').checked = true;

        showSuccessMessage(`Added ${qtyToAdd} ${item.arrivedUnit} to ${item.name}!`);
    });
}

// Adjust used quantity with +/- buttons
function updateKitchenUsage(id, change) {
    const item = kitchenData.find(i => i.id === id);
    if (!item) return;

    const newUsed = (parseFloat(item.used) || 0) + change;
    const arrived = parseFloat(item.arrived) || 0;

    // Ensure used doesn't go below 0 or above arrived
    if (newUsed < 0 || newUsed > arrived) return;

    const updateData = { used: newUsed };

    // Add timestamp when incrementing usage
    if (change > 0) {
        updateData.lastUsedDate = firebase.firestore.FieldValue.serverTimestamp();
    }

    db.collection('kitchen').doc(id).update(updateData);
}

// Delete ingredient (removed, use global deleteDocument)

// Deduct ingredients from inventory when a food limit is sold
function deductIngredientsFromInventory(foodId, quantitySold) {
    if (quantitySold === 0) return; // Allow negative values for restoring stock

    const food = foodsData.find(f => f.id == foodId);
    if (!food || !food.ingredients || food.ingredients.length === 0) return;

    const action = quantitySold > 0 ? "Deducting" : "Restoring";
    console.log(`${action} ingredients for ${Math.abs(quantitySold)}x ${food.name}`);

    food.ingredients.forEach(ing => {
        // Parse ingredient quantity (e.g., "200g" -> 200, "g")
        const match = ing.qty.match(/^([\d.]+)\s*(.*)$/);
        if (!match) return;

        const reqQtyPerItem = parseFloat(match[1]);
        const reqUnit = match[2] || 'g';

        // Find matching kitchen item(s) by name
        // Use lowercase comparison for robustness
        const kitchenItem = kitchenData.find(k => k.name.toLowerCase() === ing.name.toLowerCase());

        if (kitchenItem) {
            // Calculate total required amount
            const totalReqQty = reqQtyPerItem * quantitySold;

            // Convert to Kitchen Item's unit
            const convertedQty = convertUnit(totalReqQty, reqUnit, kitchenItem.arrivedUnit || 'KG');

            console.log(`- ${ing.name}: Change ${totalReqQty}${reqUnit} -> ${action} ${Math.abs(convertedQty).toFixed(4)} ${kitchenItem.arrivedUnit} from inventory`);

            // Update Kitchen Inventory (Increase Used amount)
            // If quantitySold is negative, convertedQty is negative, so Used amount decreases (stock increases)
            const newUsed = (parseFloat(kitchenItem.used) || 0) + convertedQty;

            // Check if we have enough stock? (Optional: warn if newUsed > arrived)
            // For now, just update.

            db.collection('kitchen').doc(kitchenItem.id).update({
                used: newUsed,
                lastUsedDate: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(err => console.error(`Error updating stock for ${ing.name}:`, err));
        } else {
            console.warn(`Ingredient not found in kitchen: ${ing.name}`);
        }
    });
}

// Deduct directly from kitchen stock (for linked grocery items)
function deductKitchenStock(kitchenId, quantity) {
    if (quantity === 0) return; // Allow negative values

    const item = kitchenData.find(i => i.id === kitchenId);
    if (!item) {
        console.warn(`Kitchen item not found for ID: ${kitchenId}`);
        return;
    }

    const action = quantity > 0 ? "Deducting" : "Restoring";
    console.log(`${action} ${Math.abs(quantity)} from ${item.name} (Grocery Sale)`);

    const newUsed = (parseFloat(item.used) || 0) + quantity;

    db.collection('kitchen').doc(kitchenId).update({
        used: newUsed,
        lastUsedDate: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.error(`Error updating kitchen stock for ${item.name}:`, err));
}
