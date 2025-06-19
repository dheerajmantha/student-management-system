// Authentication functionality for the Student Management System

// Global variables
let currentUser = null;

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('token');
    return token !== null;
}

// Get current user data
function getCurrentUser() {
    return currentUser;
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('dashboard.html')) {
        // Dashboard page - require authentication
        if (!isAuthenticated()) {
            redirectToLogin();
            return;
        }
        initializeDashboard();
    } else {
        // Login page - redirect if already authenticated
        if (isAuthenticated()) {
            redirectToDashboard();
            return;
        }
        initializeLogin();
    }
});

// Redirect to login page
function redirectToLogin() {
    window.location.href = 'index.html';
}

// Redirect to dashboard
function redirectToDashboard() {
    window.location.href = 'dashboard.html';
}

// Initialize login page functionality
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const togglePassword = document.getElementById('togglePassword');

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form submission (via button since it's in a modal)
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    }
}

// Initialize dashboard functionality
async function initializeDashboard() {
    try {
        showLoadingOverlay();
        
        // Get user profile
        const response = await AuthAPI.getProfile();
        currentUser = response.user;
        
        // Update UI with user info
        updateUserDisplay();
        
        // Setup navigation based on user role
        setupNavigation();
        
        // Load dashboard data
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
        
        hideLoadingOverlay();
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        showError('Failed to load user data. Please login again.');
        logout();
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const loginBtn = document.getElementById('loginBtn');
    const formData = new FormData(event.target);
    
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    // Validate input
    if (!credentials.email || !credentials.password) {
        showError('Please fill in all fields.');
        return;
    }

    if (!isValidEmail(credentials.email)) {
        showError('Please enter a valid email address.');
        return;
    }

    try {
        showLoading(loginBtn);
        
        const response = await AuthAPI.login(credentials);
        
        // Store token and user data
        localStorage.setItem('token', response.token);
        currentUser = response.user;
        
        showSuccess('Login successful! Redirecting...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
            redirectToDashboard();
        }, 1000);
        
    } catch (error) {
        console.error('Login failed:', error);
        showError(error.message || 'Login failed. Please try again.');
    } finally {
        hideLoading(loginBtn);
    }
}

// Handle registration
async function handleRegister() {
    const registerBtn = document.getElementById('registerBtn');
    const registerForm = document.getElementById('registerForm');
    
    if (!registerForm) return;
    
    const formData = new FormData(registerForm);
    
    const userData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };

    // Validate input
    if (!userData.username || !userData.email || !userData.password || !userData.role) {
        showError('Please fill in all fields.', 'register-alert-container');
        return;
    }

    if (!isValidEmail(userData.email)) {
        showError('Please enter a valid email address.', 'register-alert-container');
        return;
    }

    // Validate username
    if (userData.username.length < 3 || userData.username.length > 50) {
        showError('Username must be between 3 and 50 characters.', 'register-alert-container');
        return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
        showError('Username can only contain letters, numbers, and underscores.', 'register-alert-container');
        return;
    }

    // Validate password
    if (userData.password.length < 6) {
        showError('Password must be at least 6 characters long.', 'register-alert-container');
        return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
        showError('Password must contain at least one uppercase letter, one lowercase letter, and one number.', 'register-alert-container');
        return;
    }

    try {
        showLoading(registerBtn);
        
        const response = await AuthAPI.register(userData);
        
        showSuccess('Registration successful! You can now login.', 'register-alert-container');
        
        // Clear form and close modal after a short delay
        setTimeout(() => {
            registerForm.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            if (modal) {
                modal.hide();
            }
        }, 1500);
        
    } catch (error) {
        console.error('Registration failed:', error);
        showError(error.message || 'Registration failed. Please try again.', 'register-alert-container');
    } finally {
        hideLoading(registerBtn);
    }
}

// Update user display in dashboard
function updateUserDisplay() {
    if (!currentUser) return;
    
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName) {
        userDisplayName.textContent = currentUser.username;
    }
    
    // Update profile form if it exists
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        populateForm('profileForm', {
            username: currentUser.username,
            email: currentUser.email,
            role: currentUser.role
        });
    }
}

// Setup navigation based on user role
function setupNavigation() {
    if (!currentUser) return;
    
    const role = currentUser.role;
    
    // Hide/show navigation items based on role
    const navItems = {
        'students-nav': ['admin', 'faculty'],
        'courses-nav': ['admin', 'faculty'],
        'grades-nav': ['admin', 'faculty'],
        'attendance-nav': ['admin', 'faculty'],
        'announcements-nav': ['admin', 'faculty', 'student']
    };
    
    Object.keys(navItems).forEach(navId => {
        const navElement = document.getElementById(navId);
        if (navElement) {
            if (navItems[navId].includes(role)) {
                navElement.classList.remove('d-none');
            } else {
                navElement.classList.add('d-none');
            }
        }
    });
}

// Show different sections based on navigation
function showSection(sectionName) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked nav link
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`${sectionName}-section`);
    if (selectedSection) {
        selectedSection.classList.remove('d-none');
        
        // Load section-specific data
        loadSectionData(sectionName);
    }
    
    // Scroll to top
    scrollToTop();
}

// Load data for specific sections
function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
            break;
        case 'students':
            if (typeof loadStudents === 'function') {
                loadStudents();
            }
            break;
        case 'courses':
            if (typeof loadCourses === 'function') {
                loadCourses();
            }
            break;
        case 'grades':
            if (typeof loadGrades === 'function') {
                loadGrades();
            }
            break;
        case 'attendance':
            if (typeof loadAttendance === 'function') {
                loadAttendance();
            }
            break;
        case 'announcements':
            if (typeof loadAnnouncements === 'function') {
                loadAnnouncements();
            }
            break;
        case 'profile':
            // Profile data is already loaded
            break;
    }
}

// Handle profile form submission
document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
});

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const profileData = {
        username: formData.get('username'),
        email: formData.get('email')
    };

    // Validate input
    if (!profileData.username || !profileData.email) {
        showError('Please fill in all fields.');
        return;
    }

    if (!isValidEmail(profileData.email)) {
        showError('Please enter a valid email address.');
        return;
    }

    try {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        showLoading(submitBtn);
        
        const response = await AuthAPI.updateProfile(profileData);
        
        // Update current user data
        currentUser = response.user;
        updateUserDisplay();
        
        showSuccess('Profile updated successfully!');
        
    } catch (error) {
        console.error('Profile update failed:', error);
        showError(error.message || 'Failed to update profile.');
    } finally {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        hideLoading(submitBtn);
    }
}

// Logout function
function logout() {
    // Clear local storage
    localStorage.removeItem('token');
    currentUser = null;
    
    // Show logout message
    showInfo('You have been logged out successfully.');
    
    // Redirect to login page after a short delay
    setTimeout(() => {
        redirectToLogin();
    }, 1000);
}

// Check token validity periodically
setInterval(async () => {
    if (isAuthenticated() && window.location.pathname.includes('dashboard.html')) {
        try {
            await AuthAPI.getProfile();
        } catch (error) {
            console.error('Token validation failed:', error);
            showError('Your session has expired. Please login again.');
            logout();
        }
    }
}, 300000); // Check every 5 minutes

// Export functions to global scope
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.showSection = showSection;
window.logout = logout; 