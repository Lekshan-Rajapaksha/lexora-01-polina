// --- STAFF FOOD SECTION ---

function renderStaffFood() {
    const tbody = document.getElementById('staff-food-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (staffFoodData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No staff food records found.</td></tr>`;
        return;
    }

    staffFoodData.forEach((item, index) => {
        const date = item.date ? new Date(item.date.seconds * 1000).toLocaleString() : 'N/A';
        const foodName = item.foodName || 'Unknown Food';
        const employeeName = item.employeeName || 'Unknown Employee';
        const qty = item.qty || 0;

        tbody.innerHTML += `
            <tr>
                <td class="center">${index + 1}</td>
                <td><strong>${foodName}</strong></td>
                <td>${employeeName}</td>
                <td class="center">${qty}</td>
                <td class="center"><small style="color: #7f8c8d;">${date}</small></td>
                <td class="action-cell">
                    <button class="btn btn-delete-small" onclick="deleteStaffFood('${item.id}')" title="Delete Record">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
}

// Open Add Staff Food Modal
function openAddStaffFoodModal() {
    document.getElementById('addStaffFoodModal').style.display = 'flex';
    populateStaffFoodDropdown();
    populateStaffEmployeeDropdown();
}

// Close Add Staff Food Modal
function closeAddStaffFoodModal() {
    document.getElementById('addStaffFoodModal').style.display = 'none';
    document.getElementById('staff-food-select').value = '';
    document.getElementById('staff-employee-select').value = '';
    document.getElementById('staff-food-qty').value = '1';
}

// Populate Food Dropdown (for Staff Food)
function populateStaffFoodDropdown() {
    const select = document.getElementById('staff-food-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Food Item --</option>';

    // Sort foods alphabetically
    const sortedFoods = [...foodsData].sort((a, b) => a.name.localeCompare(b.name));

    // Add Food Items (Grouped)
    if (sortedFoods.length > 0) {
        const foodGroup = document.createElement('optgroup');
        foodGroup.label = "🍽️ Prepared Foods";
        sortedFoods.forEach(food => {
            const option = document.createElement('option');
            option.value = food.id;
            option.textContent = food.name;
            option.dataset.name = food.name;
            option.dataset.type = 'food';
            foodGroup.appendChild(option);
        });
        select.appendChild(foodGroup);
    }

    // Add Grocery/Kitchen Items (Grouped)
    // Filter kitchen items that are relevant (e.g. have 'count' or just exists)
    // Typically, staff might consume raw items like 'Cola', 'Biscuits' (Grocery type)
    // Let's filter by category 'grocery' or show all if needed. User asked for grocery.
    const groceryItems = kitchenData.filter(item => item.category === 'grocery');

    // Sort grocery items alphabetically
    const sortedGrocery = groceryItems.sort((a, b) => a.name.localeCompare(b.name));

    if (sortedGrocery.length > 0) {
        const groceryGroup = document.createElement('optgroup');
        groceryGroup.label = "🛍️ Grocery / Kitchen Items";
        sortedGrocery.forEach(item => {
            const available = parseFloat(item.arrived) - parseFloat(item.used);
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${available.toFixed(2)} ${item.arrivedUnit})`;
            option.dataset.name = item.name;
            option.dataset.type = 'grocery';
            option.dataset.unit = item.arrivedUnit;
            groceryGroup.appendChild(option);
        });
        select.appendChild(groceryGroup);
    }
}

// Populate Employee Dropdown (for Staff Food)
function populateStaffEmployeeDropdown() {
    const select = document.getElementById('staff-employee-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Employee --</option>';

    // We need employees data. It might be loaded in employees.js but not globally exposed as a variable in data.js 
    // Wait, data.js does NOT export employeesData. 
    // employees.js fetches it inside renderEmployees.
    // I should probably fetch it here or modify data.js to export it.
    // For now, let's fetch it here to be safe and consistent with how employees.js does it, 
    // OR just use a one-time fetch.

    db.collection('employees').orderBy('name', 'asc').get().then(snapshot => {
        select.innerHTML = '<option value="">-- Choose Employee --</option>';
        snapshot.forEach(doc => {
            const employee = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = employee.name;
            option.dataset.name = employee.name;
            select.appendChild(option);
        });
    });
}

// Save Staff Food Record
function saveStaffFood() {
    const foodSelect = document.getElementById('staff-food-select');
    const employeeSelect = document.getElementById('staff-employee-select');
    const qtyInput = document.getElementById('staff-food-qty');

    const foodId = foodSelect.value;
    const selectedOption = foodSelect.options[foodSelect.selectedIndex];
    const foodName = selectedOption?.dataset.name;
    const type = selectedOption?.dataset.type || 'food'; // 'food' or 'grocery'
    const unit = selectedOption?.dataset.unit || '';

    const employeeId = employeeSelect.value;
    const employeeName = employeeSelect.options[employeeSelect.selectedIndex]?.dataset.name;
    const qty = parseFloat(qtyInput.value) || 0; // Support decimals for grocery

    if (!foodId) { alert('Please select a food item'); return; }
    if (!employeeId) { alert('Please select an employee'); return; }
    if (qty <= 0) { alert('Please enter a valid quantity'); return; }

    // 1. Add to Firestore
    db.collection('staffFood').add({
        foodId,
        foodName,
        type,
        employeeId,
        employeeName,
        qty,
        unit,
        date: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        // 2. Deduct Stock
        if (type === 'food') {
            // Deduct ingredients based on recipe
            if (typeof deductIngredientsFromInventory === 'function') {
                deductIngredientsFromInventory(foodId, qty);
            } else {
                console.error("deductIngredientsFromInventory function not found!");
            }
        } else if (type === 'grocery') {
            // Deduct directly from Kitchen Inventory (increase used)
            const item = kitchenData.find(k => k.id === foodId);
            if (item) {
                const newUsed = (parseFloat(item.used) || 0) + qty;
                db.collection('kitchen').doc(foodId).update({
                    used: newUsed,
                    lastUsedDate: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => console.log(`Deducted ${qty} ${item.arrivedUnit} from ${item.name} for Staff Food`));
            }
        }

        showSuccessMessage(`Added ${qty}${unit ? ' ' + unit : ''} ${foodName} for ${employeeName}`);
        closeAddStaffFoodModal();
    }).catch(err => {
        console.error("Error saving staff food:", err);
        alert("Failed to save record.");
    });
}

// Delete Staff Food Record
function deleteStaffFood(id) {
    if (!confirm('Are you sure you want to delete this record? Stock will be restored.')) return;

    const item = staffFoodData.find(i => i.id === id);
    if (!item) return;

    db.collection('staffFood').doc(id).delete().then(() => {
        // Restore Stock (pass negative quantity)
        if (item.type === 'grocery') {
            // Restore directly to Kitchen Inventory (decrease used)
            const kitchenItem = kitchenData.find(k => k.id === item.foodId);
            if (kitchenItem) {
                const newUsed = (parseFloat(kitchenItem.used) || 0) - item.qty;
                db.collection('kitchen').doc(item.foodId).update({
                    used: newUsed
                }).then(() => console.log(`Restored ${item.qty} ${kitchenItem.arrivedUnit} to ${kitchenItem.name}`));
            }
        } else {
            // Default to 'food' logic
            if (typeof deductIngredientsFromInventory === 'function') {
                deductIngredientsFromInventory(item.foodId, -item.qty);
            }
        }

        showSuccessMessage('Record deleted and stock restored.');
    }).catch(err => {
        console.error("Error deleting staff food:", err);
        alert("Failed to delete record.");
    });
}
