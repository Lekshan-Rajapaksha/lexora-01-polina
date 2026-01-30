// --- FOODS SECTION ---

let currentEditingFoodId = null;

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

// Modal Logic for Foods
function openEditModal(id) {
    const food = foodsData.find(f => f.id === id);
    currentEditingFoodId = id;
    
    document.getElementById('modal-food-name').value = food.name;
    document.getElementById('modal-food-price').value = food.price;
    document.getElementById('modal-food-ingredients').value = JSON.stringify(food.ingredients, null, 2);
    
    document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function saveFoodChanges() {
    const price = document.getElementById('modal-food-price').value;
    const ingredientsRaw = document.getElementById('modal-food-ingredients').value;
    
    try {
        const ingredients = JSON.parse(ingredientsRaw);
        
        // Update Data
        const foodIndex = foodsData.findIndex(f => f.id === currentEditingFoodId);
        foodsData[foodIndex].price = price;
        foodsData[foodIndex].ingredients = ingredients;
        
        closeModal();
        renderFoods();
    } catch (e) {
        alert("Invalid Ingredient JSON format. Please check syntax.");
    }
}
