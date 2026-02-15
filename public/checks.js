// --- CHECK DETAILS SECTION ---

// Render Checks Table
function renderChecks() {
    const tbody = document.getElementById('checks-table-body');
    if (!tbody) return;

    if (!checksData || checksData.length === 0) {
        tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: #999; padding: 30px;">
          📝 No checks added yet. Click "Add Check" to get started.
        </td>
      </tr>
    `;
        return;
    }

    // Sort by due date (earliest first)
    const sortedChecks = [...checksData].sort((a, b) => {
        const dateA = a.dueDate?.toDate?.() || new Date(a.dueDate);
        const dateB = b.dueDate?.toDate?.() || new Date(b.dueDate);
        return dateA - dateB;
    });

    tbody.innerHTML = sortedChecks.map(check => {
        const dueDate = check.dueDate?.toDate?.() || new Date(check.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-GB');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = dueDate < today;

        return `
      <tr style="${isOverdue ? 'background-color: #ffebee;' : ''}">
        <td style="font-weight: 500;">${escapeHtml(check.name || 'N/A')}</td>
        <td style="font-weight: 600; color: #2c3e50;">LKR ${formatNumber(check.price || 0)}</td>
        <td style="${isOverdue ? 'color: #e74c3c; font-weight: 600;' : ''}">${formattedDate}${isOverdue ? ' ⚠️' : ''}</td>
        <td>
          <button class="btn btn-delete" onclick="deleteCheck('${check.id}')" 
                  style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
    }).join('');
}

// Open Add Check Modal
function openAddCheckModal() {
    const modal = document.getElementById('addCheckModal');
    if (!modal) return;

    // Reset form
    document.getElementById('check-name').value = '';
    document.getElementById('check-price').value = '';
    document.getElementById('check-due-date').value = '';

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('check-due-date').value = today;

    modal.style.display = 'flex';
}

// Close Check Modal
function closeCheckModal() {
    const modal = document.getElementById('addCheckModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save Check
function saveCheck() {
    const name = document.getElementById('check-name').value.trim();
    const price = parseFloat(document.getElementById('check-price').value);
    const dueDate = document.getElementById('check-due-date').value;

    // Validation
    if (!name) {
        alert('Please enter a check name.');
        return;
    }

    if (!price || price <= 0) {
        alert('Please enter a valid price.');
        return;
    }

    if (!dueDate) {
        alert('Please select a due date.');
        return;
    }

    const checkData = {
        name: name,
        price: price,
        dueDate: firebase.firestore.Timestamp.fromDate(new Date(dueDate)),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('checks').add(checkData)
        .then(() => {
            console.log('Check added successfully');
            closeCheckModal();
        })
        .catch(error => {
            console.error('Error adding check:', error);
            alert('Failed to add check. Please try again.');
        });
}

// Delete Check
function deleteCheck(id) {
    if (!confirm('Are you sure you want to delete this check?')) {
        return;
    }

    db.collection('checks').doc(id).delete()
        .then(() => {
            console.log('Check deleted successfully');
        })
        .catch(error => {
            console.error('Error deleting check:', error);
            alert('Failed to delete check. Please try again.');
        });
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Helper function to format numbers
function formatNumber(num) {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
