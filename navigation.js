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
        if(btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
        }
    });

    // Update Header Title
    document.getElementById('page-title').innerText = sectionId.charAt(0).toUpperCase() + sectionId.slice(1) + " Overview";

    // Trigger Render
    if(sectionId === 'bakery') renderBakery();
    if(sectionId === 'shop') renderShop();
    if(sectionId === 'kitchen') renderKitchen();
    if(sectionId === 'salary') renderSalary();
    if(sectionId === 'foods') renderFoods();
}

// Initial Load
document.addEventListener('DOMContentLoaded', function() {
    renderBakery();
});

// Close modal if clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeModal();
    }
}
