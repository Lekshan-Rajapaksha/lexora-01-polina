// --- UTILITIES & STORAGE ---

// Currency Formatter
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Show Success Message
function showSuccessMessage(message) {
    // Remove existing messages
    const existing = document.querySelectorAll('.success-message');
    existing.forEach(el => el.remove());

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


// (LocalStorage functions removed as we migrated to Firestore)
