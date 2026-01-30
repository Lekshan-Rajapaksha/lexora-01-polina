// --- SHOP SECTION ---

let currentShopTab = 'foods'; // Track current tab
let currentShopCategory = ''; // Track which category modal is for

// Currency Formatter
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

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
        // For food items, revenue is the sales revenue
        const revenue = item.sold * item.pricePerUnit;

        tbody.innerHTML += `
            <tr>
                <td class="center"><strong>${index + 1}</strong></td>
                <td><strong>${item.name}</strong></td>
                <td class="center"><span class="sold-badge">${item.sold}</span></td>
                <td class="currency"><strong>${formatCurrency(revenue)}</strong></td>
                <td class="action-cell">
                    <button class="btn-sold-decrement" onclick="decrementSold('foods', ${item.id})" title="Sold -1">
                        ➖
                    </button>
                    <button class="btn-sold-increment" onclick="incrementSold('foods', ${item.id})" title="Sold +1">
                        ➕
                    </button>
                    <button class="btn btn-delete-small" onclick="deleteShopItem('foods', ${item.id})" title="Delete">
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
        const profit = item.sold * (item.pricePerUnit * (item.profitMargin / 100));

        tbody.innerHTML += `
            <tr>
                <td class="center"><strong>${index + 1}</strong></td>
                <td><strong>${item.name}</strong></td>
                <td class="center"><span class="stock-badge">${item.stock}</span></td>
                <td class="center"><span class="sold-badge">${item.sold}</span></td>
                <td class="center"><strong class="remaining-qty">${remaining}</strong></td>
                <td class="currency"><strong>${formatCurrency(profit)}</strong></td>
                <td class="action-cell">
                    <button class="btn-sold-decrement" onclick="decrementSold('grocery', ${item.id})" title="Sold -1">
                        ➖
                    </button>
                    <button class="btn-sold-increment" onclick="incrementSold('grocery', ${item.id})" title="Sold +1">
                        ➕
                    </button>
                    <button class="btn btn-delete-small" onclick="deleteShopItem('grocery', ${item.id})" title="Delete">
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
    const selectId = parseInt(document.getElementById('shop-food-select').value);
    const priceInput = document.getElementById('shop-food-price');

    if (!selectId) {
        priceInput.value = '';
        return;
    }

    const food = foodsData.find(f => f.id === selectId);
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
    let name, stock, pricePerUnit, profitMargin;

    if (currentShopCategory === 'foods') {
        // Get food item data
        const foodId = parseInt(document.getElementById('shop-food-select').value);
        const food = foodsData.find(f => f.id === foodId);

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
        profitMargin = parseFloat(document.getElementById('shop-grocery-margin').value) || 20;

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

    // Generate new ID
    const newId = dataArray.length > 0 ? Math.max(...dataArray.map(i => i.id)) + 1 : 1;

    // Add new item
    dataArray.push({
        id: newId,
        name: name,
        stock: stock,
        sold: 0,
        pricePerUnit: pricePerUnit,
        profitMargin: profitMargin
    });

    // Close modal and re-render
    closeAddShopItemModal();
    renderShop();

    // Show success message
    showSuccessMessage(`${name} added successfully!`);
}

// Increment Sold Count
function incrementSold(category, itemId) {
    const dataArray = category === 'foods' ? foodsShopData : groceryShopData;
    const item = dataArray.find(i => i.id === itemId);

    if (!item) return;

    // For grocery items, check stock availability
    // For food items, allow unlimited sales (stock starts at 0)
    if (category === 'grocery' && item.sold >= item.stock) {
        alert('No stock remaining!');
        return;
    }

    // Increment sold count
    item.sold++;

    // Re-render
    renderShop();
}

// Delete Shop Item
function deleteShopItem(category, itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    if (category === 'foods') {
        const index = foodsShopData.findIndex(i => i.id === itemId);
        if (index !== -1) {
            foodsShopData.splice(index, 1);
        }
    } else {
        const index = groceryShopData.findIndex(i => i.id === itemId);
        if (index !== -1) {
            groceryShopData.splice(index, 1);
        }
    }

    renderShop();
}

// Show Success Message
function showSuccessMessage(message) {
    // Create message element
    const msgDiv = document.createElement('div');
    msgDiv.className = 'success-message';
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 8px 20px rgba(39, 174, 96, 0.4);
        z-index: 10000;
        font-weight: 700;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(msgDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        msgDiv.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => msgDiv.remove(), 300);
    }, 3000);
}
