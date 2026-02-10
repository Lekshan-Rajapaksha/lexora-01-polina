// --- SHOP SECTION ---


let currentShopTab = 'foods'; // Track current tab
let currentShopCategory = ''; // Track which category modal is for

// Daily reset is handled by Client-Side Logic (via checkAndPerformShopReset)



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
        const lastSoldDate = item.lastSoldDate ? new Date(item.lastSoldDate.seconds * 1000).toLocaleDateString() : 'N/A';

        tbody.innerHTML += `
            <tr>
                <td class="center"><strong>${index + 1}</strong></td>
                <td><strong>${currentName}${priceWarning}</strong></td>
                <td class="center"><span class="sold-badge">${item.sold}</span></td>
                <td class="center"><small style="color: #7f8c8d;">${lastSoldDate}</small></td>
                <td class="currency"><strong>${formatCurrency(revenue)}</strong></td>
                <td class="action-cell">
                    <button class="btn-sold-decrement" onclick="updateShopSold('foodsShop', '${item.id}', -1)" title="Sold -1">
                        -
                    </button>
                    <button class="btn-sold-increment" onclick="updateShopSold('foodsShop', '${item.id}', 1)" title="Sold +1">
                        +
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
        // Calculate Actual Available from Kitchen
        let actualAvailable = 'N/A';
        let stockColor = '#7f8c8d'; // gray default

        // 1. Try to find by explicit ID link
        let kitchenItem = null;
        if (item.kitchenId) {
            kitchenItem = kitchenData.find(k => k.id === item.kitchenId);
        }

        // 2. Fallback: Try to find by Name Matching (if no ID link)
        if (!kitchenItem) {
            kitchenItem = kitchenData.find(k => k.name.trim().toLowerCase() === item.name.trim().toLowerCase() && k.category === 'grocery');
        }

        if (kitchenItem) {
            const availableQty = parseFloat(kitchenItem.arrived) - parseFloat(kitchenItem.used);
            const unit = kitchenItem.arrivedUnit || '';
            actualAvailable = `${availableQty.toFixed(2)} ${unit}`;

            if (availableQty <= 5) stockColor = '#e74c3c'; // Red low stock
            else if (availableQty <= 20) stockColor = '#f39c12'; // Orange med stock
            else stockColor = '#27ae60'; // Green ok
        }

        const revenue = item.sold * item.pricePerUnit;
        const lastSoldDate = item.lastSoldDate ? new Date(item.lastSoldDate.seconds * 1000).toLocaleDateString() : 'N/A';

        tbody.innerHTML += `
            <tr>
                <td class="center"><strong>${index + 1}</strong></td>
                <td><strong>${item.name}</strong></td>
                <td class="center" style="color: ${stockColor}; font-weight: bold;">
                    ${actualAvailable}
                </td>
                <td class="center"><span class="sold-badge">${item.sold}</span></td>
                <td class="center"><small style="color: #7f8c8d;">${lastSoldDate}</small></td>
                <td class="currency"><strong>${formatCurrency(revenue)}</strong></td>
                <td class="action-cell">
                    <button class="btn-sold-decrement" onclick="updateShopSold('groceryShop', '${item.id}', -1)" title="Sold -1">
                        -
                    </button>
                    <button class="btn-sold-increment" onclick="updateShopSold('groceryShop', '${item.id}', 1)" title="Sold +1">
                        +
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
    checkAndPerformShopReset();
}

// --- AUTO-RESET LOGIC (Client-Side) ---

let hasCheckedShopReset = false;

async function checkAndPerformShopReset() {
    // Only run if both data sets have loaded at least once (checked via length or reliance on render)
    // Actually, renderShop is called whenever EITHER changes.
    // We should only run this ONCE per session regardless.
    if (hasCheckedShopReset) return;

    // Wait a brief moment to ensure data might be loaded? 
    // Actually, if data is empty, forEach does nothing, which is fine, but we might mistakenly 'reset' to today without processing items if data hasn't arrived.
    // However, this function is called inside renderShop, which is called by onSnapshot.
    // So data SHOULD be there.
    // BUT we must confirm we have data before we declare "we checked today".
    // If networks is slow, data might be empty array initially?
    // Firestore onSnapshot usually returns empty or data immediately if cached, or acts async.
    // Let's rely on the first successful render call.

    hasCheckedShopReset = true;

    try {
        console.log("Checking daily reset status for Shop...");
        const settingsDoc = await db.collection('system').doc('shopSettings').get();
        const todayStr = getLocalDateString(); // YYYY-MM-DD in local timezone

        let lastResetDate = null;
        if (settingsDoc.exists) {
            lastResetDate = settingsDoc.data().lastResetDate;
        }

        if (lastResetDate === todayStr) {
            console.log("Shop is already reset for today.");
            return;
        }

        // Calculate archive date (the day the data belongs to)
        const archiveDate = lastResetDate ? new Date(lastResetDate) : new Date(todayStr);

        console.log(`Performing Shop daily reset... Last: ${lastResetDate}, Today: ${todayStr}, Arching as: ${getLocalDateString(archiveDate)}`);
        showSuccessMessage("Performing Shop Daily Reset... ⏳");

        const batch = db.batch();
        let operationCount = 0;
        // const todayDate = new Date(); // REMOVED

        // 1. Reset Foods Shop
        foodsShopData.forEach(item => {
            const itemRef = db.collection('foodsShop').doc(item.id);

            if (item.sold > 0) {
                const historyRef = db.collection('shopHistory').doc();
                // Create a clean object for history
                batch.set(historyRef, {
                    itemId: item.id,
                    name: item.name,
                    sold: item.sold,
                    price: item.pricePerUnit || 0,
                    profit: (item.sold || 0) * (item.pricePerUnit || 0),
                    category: 'foods',
                    date: archiveDate, // Corrected date
                    archivedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                batch.update(itemRef, {
                    sold: 0,
                    date: new Date() // Reset curr item date to NOW
                });
                operationCount++;
            } else {
                // Even items with 0 sales get date updated
                batch.update(itemRef, {
                    date: new Date()
                });
                operationCount++;
            }
        });

        // 2. Reset Grocery Shop
        groceryShopData.forEach(item => {
            const itemRef = db.collection('groceryShop').doc(item.id);

            if (item.sold > 0) {
                const historyRef = db.collection('shopHistory').doc();
                batch.set(historyRef, {
                    itemId: item.id,
                    name: item.name,
                    stock: item.stock,
                    sold: item.sold,
                    price: item.pricePerUnit || 0,
                    profit: (item.sold || 0) * (item.pricePerUnit || 0),
                    category: 'grocery',
                    date: archiveDate, // Corrected date
                    archivedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                batch.update(itemRef, {
                    sold: 0,
                    date: new Date() // Reset curr item date to NOW
                });
                operationCount++;
            } else {
                // Even items with 0 sales get date updated
                batch.update(itemRef, {
                    date: new Date()
                });
                operationCount++;
            }
        });

        // Update settings
        const settingsRef = db.collection('system').doc('shopSettings');
        batch.set(settingsRef, { lastResetDate: todayStr }, { merge: true });

        if (operationCount > 0) {
            await batch.commit();
            console.log(`Shop Reset complete. Reset ${operationCount} items.`);
            showSuccessMessage("Shop Reset Complete! 🛒");
        } else {
            await settingsRef.set({ lastResetDate: todayStr }, { merge: true });
            console.log("No shop items needed resetting, date updated.");
        }

    } catch (e) {
        console.error("Error in checkAndPerformShopReset:", e);
        hasCheckedShopReset = false; // Allow retry if error
    }
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

    // Populate dropdowns
    if (category === 'foods') {
        populateFoodDropdown();
    } else {
        populateGroceryIngredientDropdown();
    }

    document.getElementById('addShopItemModal').style.display = 'flex';
}

// Populate Grocery Ingredient Dropdown
function populateGroceryIngredientDropdown() {
    const select = document.getElementById('shop-grocery-kitchen-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Manual Entry --</option>';

    kitchenData.forEach(item => {
        // Filter: Only show items categorized as 'Grocery'
        if (item.category === 'grocery') {
            const option = document.createElement('option');
            option.value = item.id;
            const available = parseFloat(item.arrived) - parseFloat(item.used);
            option.textContent = `${item.name} (Avail: ${available.toFixed(2)} ${item.arrivedUnit})`;
            select.appendChild(option);
        }
    });
}

// Auto-fill Grocery Form from selected Kitchen Ingredient
function autoFillGroceryFromKitchen() {
    const selectId = document.getElementById('shop-grocery-kitchen-select').value;
    const nameInput = document.getElementById('shop-grocery-name');
    const stockInput = document.getElementById('shop-grocery-stock');

    if (!selectId) {
        // Don't clear inputs, user might want to switch to manual
        return;
    }

    const item = kitchenData.find(i => i.id == selectId);
    if (item) {
        nameInput.value = item.name;
        // Auto-fill stock with available quantity
        const available = parseFloat(item.arrived) - parseFloat(item.used);
        stockInput.value = Math.floor(available); // Stock usually integers for units, but... let's do floor
    }
}

// Close Add Item Modal
function closeAddShopItemModal() {
    document.getElementById('addShopItemModal').style.display = 'none';

    // Clear food form
    document.getElementById('shop-food-select').value = '';
    document.getElementById('shop-food-price').value = '';

    // Clear grocery form
    document.getElementById('shop-grocery-kitchen-select').value = '';
    document.getElementById('shop-grocery-name').value = '';
    document.getElementById('shop-grocery-stock').value = '';
    document.getElementById('shop-grocery-price').value = '';
}

// Save New Shop Item
function saveShopItem() {
    let name, stock, pricePerUnit, foodId = null, kitchenId = null;

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

        // Check if kitchen ingredient selected
        kitchenId = document.getElementById('shop-grocery-kitchen-select').value || null;

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
        pricePerUnit,
        foodId: foodId || null, // Store food reference for dynamic pricing
        kitchenId: kitchenId || null, // Store kitchen reference for grocery deduction
        date: new Date(),
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

    // Update in Firestore with timestamp
    const updateData = {
        sold: firebase.firestore.FieldValue.increment(change)
    };

    // Add timestamp when incrementing (selling items)
    // Add timestamp when incrementing (selling items)
    if (change > 0) {
        updateData.lastSoldDate = firebase.firestore.FieldValue.serverTimestamp();
    }

    // Update stock (Deduct if change > 0, Restore if change < 0)
    // Deduct ingredients from kitchen if this item has a linked foodId
    if (item.foodId) {
        deductIngredientsFromInventory(item.foodId, change);
    }

    // Deduct from kitchen directly if grocery item linked
    if (item.kitchenId && typeof deductKitchenStock === 'function') {
        deductKitchenStock(item.kitchenId, change);
    }

    db.collection(collection).doc(id).update(updateData).catch(err => console.error("Error updating sold count:", err));
}



