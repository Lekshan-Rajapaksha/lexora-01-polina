// --- AUTHENTICATION LOGIC ---

// User credentials mapping REMOVED for security.
// Users now login directly with email and roles are fetched from Firestore.


// Check if user is already logged in - optimized for instant redirect
firebase.auth().onAuthStateChanged((user) => {
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('login.html') || path === '/login';
    // Dashboard is index.html OR root path '/' OR /dashboard
    const isDashboard = path.endsWith('index.html') || path === '/' || path.endsWith('/') || path === '/dashboard';

    if (user) {
        if (isLoginPage) {
            // User is signed in but on login page, redirect to dashboard
            window.location.replace('index.html');
        } else {
            // User is signed in and on dashboard, show content
            // Use flex or block depending on your layout, but block is safe for body usually
            // However, the original body display was likely block (default).
            // But wait, the login page uses flex in its CSS.
            // The dashboard uses default (block).
            // Let's check styling. login.html body has display: flex.
            // index.html body likely has default (block).

            if (isDashboard) {
                document.body.style.display = 'flex';
            } else {
                // Fallback for other pages if any
                document.body.style.display = 'block';
            }
        }
    } else {
        if (isDashboard) {
            // User is not signed in but trying to access dashboard, redirect to login
            window.location.replace('login.html');
        } else {
            // User is not signed in and on login page, show content
            // Login page uses flexbox for centering
            document.body.style.display = 'flex';
        }
    }
});

// Login form handler (only on login page)
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('error-message');
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('btn-text');

        // Disable button and show loading
        btn.disabled = true;
        btnText.innerHTML = '<span class="loading"></span>';
        errorDiv.classList.remove('show');

        try {
            // Sign in with Firebase Auth
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Fetch user details from Firestore
            const userDoc = await db.collection('users').doc(user.email).get();

            let role = 'staff';
            let displayName = user.email.split('@')[0];

            if (userDoc.exists) {
                const userData = userDoc.data();
                role = userData.role || 'staff';
                displayName = userData.displayName || displayName;

                // Update last login
                await db.collection('users').doc(user.email).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // First time login or missing doc? 
                // We create a basic doc.
                // SECURITY NOTE: We default to 'staff'. Admin must manually promote users in DB.
                await db.collection('users').doc(user.email).set({
                    email: user.email,
                    role: 'staff',
                    displayName: displayName,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Store user role and info in sessionStorage
            sessionStorage.setItem('userRole', role);
            sessionStorage.setItem('userName', displayName);
            sessionStorage.setItem('userEmail', user.email);

            // Redirect to dashboard (instant redirect)
            window.location.replace('index.html');

        } catch (error) {
            console.error('Login error:', error);
            btn.disabled = false;
            btnText.textContent = 'Login';

            // Show user-friendly error message
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                showError('Invalid email or password');
            } else if (error.code === 'auth/too-many-requests') {
                showError('Too many failed attempts. Please try again later.');
            } else {
                showError(`Login failed: ${error.message}`);
            }
        }
    });
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');

        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        firebase.auth().signOut().then(() => {
            sessionStorage.clear();
            window.location.replace('login.html');
        }).catch((error) => {
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
        });
    }
}

// Get current user role
function getUserRole() {
    return sessionStorage.getItem('userRole') || 'guest';
}

// Get current user name
function getUserName() {
    return sessionStorage.getItem('userName') || 'User';
}

// Check if user is admin
function isAdmin() {
    return getUserRole() === 'admin';
}

// Check if user has access to a section
function hasAccess(section) {
    const role = getUserRole();

    // Admin has access to everything
    if (role === 'admin') return true;

    // Staff cannot access admin dashboard
    if (section === 'admin' && role === 'staff') return false;

    // Staff has access to all other sections
    return true;
}
