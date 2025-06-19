// Utility functions for the Student Management System

// Show alert messages
function showAlert(message, type = 'info', container = 'alert-container') {
    const alertContainer = document.getElementById(container);
    if (!alertContainer) return;

    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    // Clear previous alerts
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertElement);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove();
        }
    }, 5000);
}

// Show success message
function showSuccess(message, container = 'alert-container') {
    showAlert(message, 'success', container);
}

// Show error message
function showError(message, container = 'alert-container') {
    showAlert(message, 'danger', container);
}

// Show warning message
function showWarning(message, container = 'alert-container') {
    showAlert(message, 'warning', container);
}

// Show info message
function showInfo(message, container = 'alert-container') {
    showAlert(message, 'info', container);
}

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date and time to readable string
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date for HTML input
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Show loading spinner
function showLoading(button) {
    if (!button) return;
    
    const spinner = button.querySelector('.spinner-border');
    if (spinner) {
        spinner.classList.remove('d-none');
    }
    button.disabled = true;
}

// Hide loading spinner
function hideLoading(button) {
    if (!button) return;
    
    const spinner = button.querySelector('.spinner-border');
    if (spinner) {
        spinner.classList.add('d-none');
    }
    button.disabled = false;
}

// Show loading overlay
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Capitalize first letter of each word
function capitalizeWords(str) {
    return str.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

// Get badge class for attendance status
function getAttendanceBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'present': return 'bg-success';
        case 'absent': return 'bg-danger';
        case 'excused': return 'bg-warning';
        default: return 'bg-secondary';
    }
}

// Get badge class for grade
function getGradeBadgeClass(grade) {
    switch (grade) {
        case 'A+':
        case 'A': return 'bg-success';
        case 'A-':
        case 'B+':
        case 'B': return 'bg-primary';
        case 'B-':
        case 'C+':
        case 'C': return 'bg-warning';
        case 'C-':
        case 'D+':
        case 'D': return 'bg-danger';
        case 'F': return 'bg-dark';
        default: return 'bg-secondary';
    }
}

// Get priority badge class
function getPriorityBadgeClass(priority) {
    switch (priority.toLowerCase()) {
        case 'urgent': return 'bg-danger';
        case 'high': return 'bg-warning';
        case 'medium': return 'bg-info';
        case 'low': return 'bg-success';
        default: return 'bg-secondary';
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (10 digits)
function isValidPhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}

// Validate course code format
function isValidCourseCode(code) {
    const codeRegex = /^[A-Z]{2,4}\d{3,4}$/;
    return codeRegex.test(code);
}

// Generate random ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Scroll to top of page
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Clear form inputs
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

// Populate form with data
function populateForm(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;

    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = data[key];
            } else if (input.type === 'date' && data[key]) {
                input.value = formatDateForInput(data[key]);
            } else {
                input.value = data[key] || '';
            }
        }
    });
}

// Get form data as object
function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input && input.type === 'checkbox') {
            data[key] = input.checked;
        } else {
            data[key] = value;
        }
    }

    return data;
}

// Create pagination element
function createPagination(container, currentPage, totalPages, onPageChange) {
    const paginationContainer = document.getElementById(container);
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    const pagination = document.createElement('nav');
    pagination.innerHTML = `
        <ul class="pagination justify-content-center">
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo; Previous</a>
            </li>
        </ul>
    `;

    const pageList = pagination.querySelector('.pagination');

    // Add page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        pageList.appendChild(li);
    }

    // Add next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">Next &raquo;</a>`;
    pageList.appendChild(nextLi);

    // Add event listeners
    pagination.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.classList.contains('page-link') && !e.target.parentElement.classList.contains('disabled')) {
            const page = parseInt(e.target.dataset.page);
            if (page && page !== currentPage) {
                onPageChange(page);
            }
        }
    });

    paginationContainer.appendChild(pagination);
}

// Confirm dialog
function confirmDialog(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Local storage helpers
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

// Export utilities to global scope
window.Utils = {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    formatDate,
    formatDateTime,
    formatDateForInput,
    getCurrentDate,
    debounce,
    showLoading,
    hideLoading,
    showLoadingOverlay,
    hideLoadingOverlay,
    capitalizeWords,
    getAttendanceBadgeClass,
    getGradeBadgeClass,
    getPriorityBadgeClass,
    isValidEmail,
    isValidPhone,
    isValidCourseCode,
    generateId,
    scrollToTop,
    clearForm,
    populateForm,
    getFormData,
    createPagination,
    confirmDialog,
    Storage
}; 