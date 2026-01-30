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
    { id: 1, name: "Rice", arrived: 50, arrivedUnit: "KG", used: 10, usedUnit: "KG" },
    { id: 2, name: "Chicken", arrived: 20, arrivedUnit: "KG", used: 5, usedUnit: "KG" },
    { id: 3, name: "Dhal", arrived: 10, arrivedUnit: "KG", used: 2, usedUnit: "KG" }
];

let salaryData = [
    { id: 1, name: "Kamal Perera", role: "Head Chef", dailySalary: 3000, workedDays: 22, totalPaid: 50000 },
    { id: 2, name: "Nimal Silva", role: "Waiter", dailySalary: 1800, workedDays: 25, totalPaid: 40000 },
    { id: 3, name: "Saman Fernando", role: "Sous Chef", dailySalary: 2500, workedDays: 20, totalPaid: 50000 },
    { id: 4, name: "Chamari Wickrama", role: "Cashier", dailySalary: 2000, workedDays: 24, totalPaid: 30000 },
    { id: 5, name: "Ruwan Kumara", role: "Kitchen Helper", dailySalary: 1500, workedDays: 26, totalPaid: 35000 }
];

let foodsData = [
    {
        id: 1,
        name: "Fried Rice (Chicken)",
        price: 650,
        ingredients: [
            { name: "Rice", qty: "300g" },
            { name: "Chicken", qty: "100g" }
        ]
    },
    {
        id: 2,
        name: "Kottu (Cheese)",
        price: 800,
        ingredients: [
            { name: "Roti", qty: "2 pcs" },
            { name: "Cheese", qty: "50g" }
        ]
    }
];
