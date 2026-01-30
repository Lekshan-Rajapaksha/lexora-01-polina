// --- SHOP SECTION ---

let currentShopTab = 'foods'; // Track current tab
let currentShopCategory = ''; // Track which category modal is for


// Switch between tabs
function switchShopTab(tab) {
    currentShopTab = tab;

    // Update tab buttons
    document.getElementById('tab-foods').classList.toggle('active', tab === 'foods');
    document.getElementById('tab-grocery').classList.toggle('active', tab === 'grocery');

    // Update content visibility
    document.getElementById('content-foods').classList.toggle('active', tab === 'foods');
    document.getElementById('content-grocery').classList.toggle('active', tab === 'grocery');
}

// Render Foods Table
function renderFoodsShop() {
    const tbody = document.getElementById('foods-table-body');
    tbody.innerHTML = '';

    foodsShopData.forEach((item, index) => {
        // Look up current name and price from Foods if foodId exists
        let currentName = item.name; // Default to stored name
        let currentPrice = item.pricePerUnit; // Default to stored price
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

        const revenue = item.sold * currentPrice;

        tbody.innerHTML += `
            <tr>
                <td class="center"><strong>${index + 1}</strong></td>
                <td><strong>${currentName}${priceWarning}</strong></td>
                <td class="center"><span class="sold-badge">${item.sold}</span></td>
                <td class="currency"><strong>${formatCurrency(revenue)}</strong></td>
                <td class="action-cell">
                    <button class="btn-sold-decrement" onclick="updateShopSold('foodsShop', '${item.id}', -1)" title="Sold -1">
                        ➖
                    </button>
                    <button class="btn-sold-increment" onclick="updateShopSold('foodsShop', '${item.id}', 1)" title="Sold +1">
                        ➕
                    </button>
                    <button class="btn btn-delete-small" onclick="deleteDocument('foodsShop', '${item.id}')" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
}

// Render Grocery Table
function renderGroceryShop() {
    const tbody = document.getElementById('grocery-table-body');
    tbody.innerHTML = '';

    groceryShopData.forEach((item, index) => {
        const remaining = item.stock - item.sold;
        const revenue = item.sold * item.pricePerUnit;

        tbody.innerHTML += `
            <tr>
                <td class="center"><strong>${index + 1}</strong></td>
                <td><strong>${item.name}</strong></td>
                <td class="center"><span class="stock-badge">${item.stock}</span></td>
                <td class="center"><span class="sold-badge">${item.sold}</span></td>
                <td class="center"><strong class="remaining-qty">${remaining}</strong></td>
                <td class="currency"><strong>${formatCurrency(revenue)}</strong></td>
                <td class="action-cell">
                    <button class="btn-sold-decrement" onclick="updateShopSold('groceryShop', '${item.id}', -1)" title="Sold -1">
                        ➖
                    </button>
                    <button class="btn-sold-increment" onclick="updateShopSold('groceryShop', '${item.id}', 1)" title="Sold +1">
                        ➕
                    </button>
                    <button class="btn btn-delete-small" onclick="deleteDocument('groceryShop', '${item.id}')" title="Delete">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });
}

// Render all shop tables
function renderShop() {
    renderFoodsShop();
    renderGroceryShop();
}

// Populate Food Dropdown from foodsData
function populateFoodDropdown() {
    const select = document.getElementById('shop-food-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Food Item --</option>';

    foodsData.forEach(food => {
        const option = document.createElement('option');
        option.value = food.id;
        option.textContent = `${food.name} - LKR ${food.price}`;
        select.appendChild(option);
    });
}

// Auto-fill food price when selected
function autoFillFoodPrice() {
    const selectId = document.getElementById('shop-food-select').value;
    const priceInput = document.getElementById('shop-food-price');

    if (!selectId) {
        priceInput.value = '';
        return;
    }

    const food = foodsData.find(f => f.id == selectId);
    if (food) {
        priceInput.value = food.price;
    }
}

// Open Add Item Modal
function openAddShopItemModal(category) {
    currentShopCategory = category;
    const modalTitle = category === 'foods' ? '🍽️ Add Food Item' : '🛍️ Add Grocery Item';
    document.getElementById('shop-modal-title').textContent = modalTitle;

    // Show appropriate form
    document.getElementById('food-item-form').style.display = category === 'foods' ? 'block' : 'none';
    document.getElementById('grocery-item-form').style.display = category === 'grocery' ? 'block' : 'none';

    // Populate food dropdown if it's foods tab
    if (category === 'foods') {
        populateFoodDropdown();
    }

    document.getElementById('addShopItemModal').style.display = 'flex';
}

// Close Add Item Modal
function closeAddShopItemModal() {
    document.getElementById('addShopItemModal').style.display = 'none';

    // Clear food form
    document.getElementById('shop-food-select').value = '';
    document.getElementById('shop-food-price').value = '';

    // Clear grocery form
    document.getElementById('shop-grocery-name').value = '';
    document.getElementById('shop-grocery-stock').value = '';
    document.getElementById('shop-grocery-price').value = '';
    document.getElementById('shop-grocery-margin').value = '20';
}

// Save New Shop Item
function saveShopItem() {
    let name, stock, pricePerUnit, foodId = null;

    if (currentShopCategory === 'foods') {
        // Get food item data
        foodId = document.getElementById('shop-food-select').value;
        const food = foodsData.find(f => f.id == foodId);

        if (!food || !foodId) {
            alert('Please select a food item');
            return;
        }

        name = food.name;
        pricePerUnit = parseFloat(document.getElementById('shop-food-price').value) || 0;
        stock = 0; // Food items start with 0 stock, track only sales
        profitMargin = 0; // No profit margin for food items (full revenue tracked)
    } else {
        // Get grocery item data
        name = document.getElementById('shop-grocery-name').value.trim();
        stock = parseInt(document.getElementById('shop-grocery-stock').value) || 0;
        pricePerUnit = parseFloat(document.getElementById('shop-grocery-price').value) || 0;

        if (!name) {
            alert('Please enter product name');
            return;
        }

        if (stock <= 0) {
            alert('Please enter a valid stock count');
            return;
        }
    }

    // Common validation
    if (pricePerUnit <= 0) {
        alert('Please enter a valid price');
        return;
    }

    // Get correct data array
    const dataArray = currentShopCategory === 'foods' ? foodsShopData : groceryShopData;

    // Check if product already exists
    const exists = dataArray.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert('This product already exists in the shop!');
        return;
    }

    // Add new item to Firestore
    const collectionName = currentShopCategory === 'foods' ? 'foodsShop' : 'groceryShop';

    db.collection(collectionName).add({
        name,
        stock,
        sold: 0,
        pricePerUnit,
        foodId: foodId || null, // Store food reference for dynamic pricing
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        closeAddShopItemModal();
        showSuccessMessage(`${name} added successfully!`);
    }).catch(err => {
        console.error("Error adding item:", err);
        alert("Failed to add item to database: " + err.message);
    });
}

// Update Sold Count (Increment/Decrement)
function updateShopSold(collection, id, change) {
    const dataArray = collection === 'foodsShop' ? foodsShopData : groceryShopData;
    const item = dataArray.find(i => i.id === id);
    if (!item) return;

    // Check constraints
    if (collection === 'groceryShop' && change > 0 && item.sold >= item.stock) {
        alert('No stock remaining!');
        return;
    }
    if (change < 0 && item.sold <= 0) {
        return; // Cannot go below 0
    }

    // Update in Firestore
    db.collection(collection).doc(id).update({
        sold: firebase.firestore.FieldValue.increment(change)
    }).catch(err => console.error("Error updating sold count:", err));
}

