// --- FOODS SECTION ---

let currentEditingFoodId = null;
let isAddMode = false;

function renderFoods() {
    const grid = document.getElementById('food-grid');
    grid.innerHTML = '';
    foodsData.forEach(food => {
        let ingredientsHtml = '';
        food.ingredients.forEach(ing => {
            ingredientsHtml += `<li><span>${ing.category}: ${ing.name}</span> <span>${ing.qty}</span></li>`;
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
                <button class="btn btn-edit" onclick="openEditModal(${food.id})">Edit Item</button>
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
    isAddMode = false;
    const food = foodsData.find(f => f.id === id);
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
        addIngredientRow(ing.category, ing.name, ing.qty);
    });
}

// Add a new ingredient input row
function addIngredientRow(category = '', name = '', qty = '') {
    const container = document.getElementById('ingredients-container');
    const rowId = Date.now() + Math.random();

    const rowDiv = document.createElement('div');
    rowDiv.className = 'ingredient-row';
    rowDiv.id = `ingredient-row-${rowId}`;
    rowDiv.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';

    // Build options for ingredient dropdown from kitchenData
    let ingredientOptions = '<option value="">-- Select Ingredient --</option>';
    kitchenData.forEach(item => {
        const selected = item.name === name ? 'selected' : '';
        ingredientOptions += `<option value="${item.name}" ${selected}>${item.name}</option>`;
    });

    rowDiv.innerHTML = `
        <input type="text" placeholder="Category (e.g., Base, Meat)" value="${category}" 
               style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        <select style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            ${ingredientOptions}
        </select>
        <input type="text" placeholder="Quantity (e.g., 200g)" value="${qty}" 
               style="flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
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
        const inputs = row.querySelectorAll('input');
        const select = row.querySelector('select');
        const category = inputs[0].value.trim();
        const name = select.value.trim();
        const qty = inputs[1].value.trim();

        if (category && name && qty) {
            ingredients.push({ category, name, qty });
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

    if (ingredients.length === 0) {
        alert('Please add at least one ingredient.');
        return;
    }

    if (isAddMode) {
        // Add new food item
        const newId = foodsData.length > 0 ? Math.max(...foodsData.map(f => f.id)) + 1 : 1;
        const newFood = {
            id: newId,
            name: name,
            price: parseFloat(price),
            ingredients: ingredients
        };
        foodsData.push(newFood);
    } else {
        // Update existing food item
        const foodIndex = foodsData.findIndex(f => f.id === currentEditingFoodId);
        if (foodIndex !== -1) {
            foodsData[foodIndex].name = name;
            foodsData[foodIndex].price = parseFloat(price);
            foodsData[foodIndex].ingredients = ingredients;
        }
    }

    closeModal();
    renderFoods();
}
