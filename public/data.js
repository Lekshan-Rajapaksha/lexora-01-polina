// --- DATA MANAGEMENT & FIRESTORE LISTENERS ---

let bakeryData = [];
let foodsShopData = [];
let groceryShopData = [];
let kitchenData = [];
let otherPaymentsData = [];

let foodsData = [];
let bakeryDataLoadedOnce = false; // Track if bakery data has loaded at least once
let foodsShopDataLoadedOnce = false;
let groceryShopDataLoadedOnce = false;


// 1. Bakery Data Listener
db.collection('bakery').onSnapshot((snapshot) => {
    bakeryData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Removed client-side daily reset logic - handled by Cloud Function

    if (typeof renderBakery === 'function') renderBakery();
}, (error) => {
    console.error("Error syncing bakery data:", error);
});

// 2. Shop - Foods Data Listener
db.collection('foodsShop').onSnapshot((snapshot) => {
    foodsShopData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Removed client-side daily reset logic - handled by Cloud Function

    if (typeof renderShop === 'function') renderShop();
}, (error) => { console.error("Error syncing shop foods:", error); });

// 3. Shop - Grocery Data Listener
db.collection('groceryShop').onSnapshot((snapshot) => {
    groceryShopData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Removed client-side daily reset logic - handled by Cloud Function

    if (typeof renderShop === 'function') renderShop();
}, (error) => { console.error("Error syncing grocery shop:", error); });

let otherPaymentsUnsubscribe = db.collection('otherPayments').onSnapshot((snapshot) => {
    otherPaymentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (typeof renderOtherPayments === 'function') renderOtherPayments();
}, (error) => { console.error("Error syncing other payments:", error); });

// 4. Kitchen Data Listener
db.collection('kitchen').onSnapshot((snapshot) => {
    kitchenData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (typeof renderKitchen === 'function') renderKitchen();
}, (error) => { console.error("Error syncing kitchen data:", error); });



// 6. Foods Menu Data Listener
db.collection('foods').onSnapshot((snapshot) => {
    foodsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (typeof renderFoods === 'function') renderFoods();
    // Also update dropdowns that depend on this
    if (typeof populateBakeryFoodDropdown === 'function') populateBakeryFoodDropdown();
    if (typeof populateFoodDropdown === 'function') populateFoodDropdown();
    // Re-render sections that reference food items
    if (typeof renderBakery === 'function') renderBakery();
    if (typeof renderShop === 'function') renderShop();
}, (error) => { console.error("Error syncing foods menu:", error); });

console.log("Firestore listeners attached.");
