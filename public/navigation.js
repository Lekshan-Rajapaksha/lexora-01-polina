// --- NAVIGATION & INITIALIZATION ---

// Section Switching
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Show selected
    document.getElementById(sectionId).classList.add('active');

    // Highlight Button
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
        }
    });

    // Update Header Title
    const titles = {
        'bakery': 'Bakery Overview',
        'shop': 'Shop Overview',
        'kitchen': 'Kitchen Overview',
        'foods': 'Foods Overview',

        'employees': 'Employee Management'
    };
    document.getElementById('page-title').innerText = titles[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1) + " Overview";

    // Trigger Render
    if (sectionId === 'bakery') renderBakery();
    if (sectionId === 'shop') renderShop();
    if (sectionId === 'kitchen') renderKitchen();

    if (sectionId === 'foods') renderFoods();
    if (sectionId === 'employees') renderEmployees();

    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Toggle Sidebar for Mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Toggle Sidebar Mode (Collapsed/Expanded)
function toggleSidebarMode() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');

    // Optional: Save preference
    // localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

// Initial Load
document.addEventListener('DOMContentLoaded', function () {
    // Check authentication and update UI
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Update user info display
            const userName = getUserName();
            const userRole = getUserRole();

            document.getElementById('user-name').textContent = userName;
            document.getElementById('user-role').textContent = userRole === 'admin' ? '👑 Admin' : '👨‍🍳 Staff';

            // Show bakery section by default
            showSection('bakery');
        }
    });
});

// Close modal if clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeModal();
    }
}
