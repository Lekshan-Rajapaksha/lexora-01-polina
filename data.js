// --- DATA STORE (Mock Database) ---

let bakeryData = [
    { id: 1, name: "Fish Bun", baked: 100, sold: 80, price: 80 },
    { id: 2, name: "Chicken Roll", baked: 50, sold: 45, price: 100 },
    { id: 3, name: "Bread", baked: 40, sold: 40, price: 120 }
];

let shopData = [
    { id: 1, name: "Coca Cola 500ml", stock: 50, sold: 10, price: 150 },
    { id: 2, name: "Water Bottle 1L", stock: 100, sold: 25, price: 100 }
];

let kitchenData = [
    { id: 1, name: "Rice", arrived: 50, used: 10 },
    { id: 2, name: "Chicken", arrived: 20, used: 5 },
    { id: 3, name: "Dhal", arrived: 10, used: 2 }
];

let salaryData = [
    { id: 1, name: "Kamal Perera", role: "Chef", base: 45000, ot: 5 },
    { id: 2, name: "Nimal Silva", role: "Waiter", base: 30000, ot: 10 }
];

let foodsData = [
    { 
        id: 1, 
        name: "Fried Rice (Chicken)", 
        price: 650, 
        ingredients: [
            { category: "Base", name: "Rice", qty: "300g" },
            { category: "Meat", name: "Chicken", qty: "100g" }
        ]
    },
    { 
        id: 2, 
        name: "Kottu (Cheese)", 
        price: 800, 
        ingredients: [
            { category: "Base", name: "Roti", qty: "2 pcs" },
            { category: "Dairy", name: "Cheese", qty: "50g" }
        ]
    }
];
