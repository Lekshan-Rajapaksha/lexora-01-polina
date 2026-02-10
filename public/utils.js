// --- UTILITIES & STORAGE ---

// Get local date string in YYYY-MM-DD format (Sri Lanka timezone)
function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

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


// Global Delete Document Function
function deleteDocument(collection, id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    db.collection(collection).doc(id).delete()
        .then(() => {
            showSuccessMessage('Item deleted.');
            // Allow specific callbacks if needed, but listeners update UI
            if (typeof closeModal === 'function') closeModal();
            if (typeof closeBakeryModal === 'function') closeBakeryModal();
            if (typeof closeAddShopItemModal === 'function') closeAddShopItemModal();
            if (typeof closeNewIngredientModal === 'function') closeNewIngredientModal();
        })
        .catch(err => {
            console.error("Delete error:", err);
            alert("Failed to delete item: " + err.message);
        });
}

// Helper: Convert units (e.g., g to KG)
function convertUnit(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;

    // Normalize units to lowercase for comparison
    const from = fromUnit.toLowerCase();
    const to = toUnit.toLowerCase();

    // Weight conversions
    if ((from === 'g' || from === 'gram') && (to === 'kg' || to === 'kilogram')) {
        return value / 1000;
    }
    if ((from === 'kg' || from === 'kilogram') && (to === 'g' || to === 'gram')) {
        return value * 1000;
    }

    // Volume conversions (Simple 1:1000 assumption for ml/Liter similar to g/KG)
    if ((from === 'ml') && (to === 'liter' || to === 'l')) {
        return value / 1000;
    }
    if ((from === 'liter' || from === 'l') && (to === 'ml')) {
        return value * 1000;
    }

    // Pcs (no conversion usually, unless packs)
    if (from === 'pcs' || to === 'pcs') {
        return value; // Assume 1:1 if matching, or just pass validation if mismatch
    }

    console.warn(`Unknown conversion: ${fromUnit} to ${toUnit}`);
    return value; // Fallback
}

// --- TESTING HELPER ---
function simulateYesterday() {
    if (!confirm("🚧 TEST MODE: This will set the 'Last Reset Date' to YESTERDAY.\n\nOn the next reload, the system should trigger a Daily Reset.\n\nContinue?")) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    Promise.all([
        db.collection('system').doc('bakerySettings').set({ lastResetDate: yesterdayStr }, { merge: true }),
        db.collection('system').doc('shopSettings').set({ lastResetDate: yesterdayStr }, { merge: true })
    ]).then(() => {
        alert(`✅ System date set to: ${yesterdayStr}\n\nNow RELOAD the page to see the Auto-Reset in action!`);
        location.reload();
    }).catch(err => {
        console.error(err);
        alert("Error setting date: " + err.message);
    });
}
