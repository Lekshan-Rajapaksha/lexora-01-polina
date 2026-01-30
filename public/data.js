// --- DATA STORE (Firestore Real-time Sync) ---

// Initialize global arrays as empty
let bakeryData = [];
let foodsShopData = [];
let groceryShopData = [];
let kitchenData = [];
let salaryData = [];
let foodsData = [];

// --- FIRESTORE LISTENERS ---

// 1. Bakery Data Listener
db.collection('bakery').onSnapshot((snapshot) => {
    bakeryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Trigger render if function exists
    if (typeof renderBakery === 'function') renderBakery();
}, (error) => {
    console.error("Error syncing bakery data:", error);
});

// 2. Foods Shop Data Listener
db.collection('foodsShop').onSnapshot((snapshot) => {
    foodsShopData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (typeof renderShop === 'function' && currentShopTab === 'foods') renderShop();
}, (error) => { console.error("Error syncing foods shop:", error); });

// 3. Grocery Shop Data Listener
db.collection('groceryShop').onSnapshot((snapshot) => {
    groceryShopData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (typeof renderShop === 'function' && currentShopTab === 'grocery') renderShop();
}, (error) => { console.error("Error syncing grocery shop:", error); });

// 4. Kitchen Data Listener
db.collection('kitchen').onSnapshot((snapshot) => {
    kitchenData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (typeof renderKitchen === 'function') renderKitchen();
}, (error) => { console.error("Error syncing kitchen data:", error); });

// 5. Salary Data Listener
db.collection('salary').onSnapshot((snapshot) => {
    salaryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (typeof renderSalary === 'function') renderSalary();
}, (error) => { console.error("Error syncing salary data:", error); });

// 6. Foods Menu Data Listener
db.collection('foods').onSnapshot((snapshot) => {
    foodsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (typeof renderFoods === 'function') renderFoods();
    // Also update dropdowns that depend on this
    if (typeof populateBakeryFoodDropdown === 'function') populateBakeryFoodDropdown();
    if (typeof populateFoodDropdown === 'function') populateFoodDropdown();
}, (error) => { console.error("Error syncing foods menu:", error); });

console.log("Firestore listeners attached.");
