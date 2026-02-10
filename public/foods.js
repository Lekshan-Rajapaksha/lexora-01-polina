// --- FOODS SECTION ---

let currentEditingFoodId = null;
let isAddMode = false;

function renderFoods() {
    const grid = document.getElementById('food-grid');
    grid.innerHTML = '';
    foodsData.forEach(food => {
        let ingredientsHtml = '';
        food.ingredients.forEach(ing => {
            ingredientsHtml += `<li><span>${ing.name}</span> <span>${ing.qty}</span></li>`;
        });

        grid.innerHTML += `
            <div class="food-card">
                <div class="food-header">
                    <h3>${food.name}</h3>
                    <span class="food-price">Rs. ${food.price}</span>
                </div>
                <ul class="ingredient-list">
                    ${ingredientsHtml}
                </ul>
                <button class="btn btn-edit" onclick="openEditModal('${food.id}')">Edit Item</button>
            </div>
        `;
    });
}

// Open modal for adding new food
function openAddModal() {
    isAddMode = true;
    currentEditingFoodId = null;

    document.getElementById('modal-title').textContent = 'Add New Food';
    document.getElementById('modal-food-name').value = '';
    document.getElementById('modal-food-name').disabled = false;
    document.getElementById('modal-food-price').value = '';

    // Clear and add one empty ingredient row
    renderIngredientInputs([]);
    addIngredientRow();

    document.getElementById('editModal').style.display = 'flex';
}

// Open modal for editing existing food
function openEditModal(id) {
    console.log("Opening edit modal for ID:", id);
    isAddMode = false;
    const food = foodsData.find(f => f.id == id);

    if (!food) {
        console.error("Food item not found for ID:", id);
        return;
    }

    currentEditingFoodId = id;

    document.getElementById('modal-title').textContent = 'Edit Food Item';
    document.getElementById('modal-food-name').value = food.name;
    document.getElementById('modal-food-name').disabled = false;
    document.getElementById('modal-food-price').value = food.price;

    renderIngredientInputs(food.ingredients);

    document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Render ingredient input fields dynamically
function renderIngredientInputs(ingredients) {
    const container = document.getElementById('ingredients-container');
    container.innerHTML = '';

    ingredients.forEach((ing, index) => {
        addIngredientRow(ing.name, ing.qty);
    });
}

// Add a new ingredient input row
function addIngredientRow(name = '', qty = '') {
    const container = document.getElementById('ingredients-container');
    const rowId = Date.now() + Math.random();

    // Parse quantity to extract value and unit
    let qtyValue = '';
    let qtyUnit = 'g';
    if (qty) {
        const match = qty.match(/^([\d.]+)\s*(.*)$/);
        if (match) {
            qtyValue = match[1];
            qtyUnit = match[2] || 'g';
        }
    }

    const rowDiv = document.createElement('div');
    rowDiv.className = 'ingredient-row';
    rowDiv.id = `ingredient-row-${rowId}`;
    rowDiv.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';

    // Build options for ingredient dropdown from kitchenData
    let ingredientOptions = '<option value="">-- Select Ingredient --</option>';
    kitchenData.forEach(item => {
        // Filter: Only show items categorized as 'Food' (or default/missing for legacy compatibility)
        if (!item.category || item.category === 'food') {
            const selected = item.name === name ? 'selected' : '';
            ingredientOptions += `<option value="${item.name}" ${selected}>${item.name}</option>`;
        }
    });

    // Unit options
    const units = ['g', 'KG', 'Liter', 'Pcs'];
    let unitOptions = '';
    units.forEach(unit => {
        const selected = unit === qtyUnit ? 'selected' : '';
        unitOptions += `<option value="${unit}" ${selected}>${unit}</option>`;
    });

    rowDiv.innerHTML = `
        <select style="flex: 2; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            ${ingredientOptions}
        </select>
        <input type="number" placeholder="Qty" value="${qtyValue}" 
               style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <select style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            ${unitOptions}
        </select>
        <button type="button" onclick="removeIngredientRow('${rowId}')" 
                style="background: #f56565; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: 600;">
            ×
        </button>
    `;

    container.appendChild(rowDiv);
}

// Remove an ingredient row
function removeIngredientRow(rowId) {
    const row = document.getElementById(`ingredient-row-${rowId}`);
    if (row) {
        row.remove();
    }
}

// Collect ingredient data from input fields
function collectIngredientData() {
    const rows = document.querySelectorAll('.ingredient-row');
    const ingredients = [];

    rows.forEach(row => {
        const selects = row.querySelectorAll('select');
        const input = row.querySelector('input');
        const name = selects[0].value.trim();
        const qtyValue = input.value.trim();
        const qtyUnit = selects[1].value.trim();

        if (name && qtyValue && qtyUnit) {
            const qty = `${qtyValue}${qtyUnit}`;
            ingredients.push({ name, qty });
        }
    });

    return ingredients;
}

// Save food changes (add or edit)
function saveFoodChanges() {
    const name = document.getElementById('modal-food-name').value.trim();
    const price = document.getElementById('modal-food-price').value.trim();
    const ingredients = collectIngredientData();

    // Validation
    if (!name) {
        alert('Please enter a food name.');
        return;
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        alert('Please enter a valid price.');
        return;
    }

    // Ingredients are now optional

    if (isAddMode) {
        // Add new food item to Firestore
        db.collection('foods').add({
            name,
            price: parseFloat(price),
            ingredients: ingredients,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            showSuccessMessage('New food item added! 🍽️');
            closeModal();
        });
    } else {
        // Update existing food item in Firestore
        const oldFood = foodsData.find(f => f.id == currentEditingFoodId);
        const oldName = oldFood ? oldFood.name : name;

        db.collection('foods').doc(currentEditingFoodId).update({
            name,
            price: parseFloat(price),
            ingredients: ingredients
        }).then(() => {
            // Update all bakery and shop items that reference this food
            updateRelatedItems(currentEditingFoodId, oldName, name, parseFloat(price));
            showSuccessMessage('Food item updated! 🍽️');
            closeModal();
        });
    }
}

// Update bakery and shop items when a food item changes
function updateRelatedItems(foodId, oldName, newName, newPrice) {
    // Update bakery items
    bakeryData.forEach(item => {
        // Match by foodId (for new items) or by name (for old items)
        if (item.foodId == foodId || item.name === oldName) {
            db.collection('bakery').doc(item.id).update({
                name: newName,
                price: newPrice,
                foodId: foodId // Add foodId to old items
            }).catch(err => console.error("Error updating bakery item:", err));
        }
    });

    // Update shop items
    foodsShopData.forEach(item => {
        // Match by foodId (for new items) or by name (for old items)
        if (item.foodId == foodId || item.name === oldName) {
            db.collection('foodsShop').doc(item.id).update({
                name: newName,
                pricePerUnit: newPrice,
                foodId: foodId // Add foodId to old items
            }).catch(err => console.error("Error updating shop item:", err));
        }
    });
}
// Delete food item from modal
function deleteCurrentFood() {
    if (!currentEditingFoodId) return;
    deleteDocument('foods', currentEditingFoodId);
}
