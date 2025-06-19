// Announcements management functionality

// Global variables
let announcementsData = [];
let currentAnnouncementsPage = 1;
let announcementsPerPage = 10;
let totalAnnouncements = 0;

// Initialize announcements section
function initializeAnnouncements() {
    setupAnnouncementsEventListeners();
    loadAnnouncements();
}

// Setup event listeners for announcements section
function setupAnnouncementsEventListeners() {
    const addAnnouncementBtn = document.getElementById('addAnnouncementBtn');
    if (addAnnouncementBtn) {
        addAnnouncementBtn.addEventListener('click', showAddAnnouncementModal);
    }
}

// Load announcements data
async function loadAnnouncements(page = 1, limit = 10) {
    try {
        currentAnnouncementsPage = page;
        announcementsPerPage = limit;
        
        showAnnouncementsLoading();
        
        const response = await AnnouncementsAPI.getAll(page, limit);
        announcementsData = response.data || [];
        totalAnnouncements = response.total || 0;
        
        updateAnnouncementsList();
        updateAnnouncementsPagination();
        
    } catch (error) {
        console.error('Failed to load announcements:', error);
        showError('Failed to load announcements data.');
        showAnnouncementsEmptyState();
    }
}

// Update announcements list
function updateAnnouncementsList() {
    const announcementsContainer = document.getElementById('announcementsList');
    if (!announcementsContainer) return;

    if (announcementsData.length === 0) {
        showAnnouncementsEmptyState();
        return;
    }

    announcementsContainer.innerHTML = announcementsData.map(announcement => `
        <div class="card mb-3 announcement-card" data-id="${announcement.id}">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <span class="badge bg-${getPriorityBadgeClass(announcement.priority || 'medium')} me-2">
                        ${capitalizeWords(announcement.priority || 'Medium')}
                    </span>
                    <h5 class="mb-0">${announcement.title}</h5>
                </div>
                <div class="dropdown">
                    <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" 
                            data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="viewAnnouncement(${announcement.id})">
                            <i class="bi bi-eye me-2"></i>View
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="editAnnouncement(${announcement.id})">
                            <i class="bi bi-pencil me-2"></i>Edit
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="deleteAnnouncement(${announcement.id})">
                            <i class="bi bi-trash me-2"></i>Delete
                        </a></li>
                    </ul>
                </div>
            </div>
            <div class="card-body">
                <p class="card-text">${announcement.content ? announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : '') : 'No content available'}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="text-muted small">
                        <i class="bi bi-person-circle me-1"></i>
                        Posted by ${announcement.created_by || 'System'}
                    </div>
                    <div class="text-muted small">
                        <i class="bi bi-calendar me-1"></i>
                        ${formatDateTime(announcement.created_at)}
                    </div>
                </div>
                ${announcement.target_audience ? `
                <div class="mt-2">
                    <span class="badge bg-secondary">Target: ${capitalizeWords(announcement.target_audience)}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Update announcements pagination
function updateAnnouncementsPagination() {
    const paginationContainer = document.getElementById('announcementsPagination');
    if (!paginationContainer) {
        // Create pagination container if it doesn't exist
        const announcementsContainer = document.getElementById('announcementsList');
        if (announcementsContainer) {
            announcementsContainer.insertAdjacentHTML('afterend', '<div id="announcementsPagination" class="mt-3"></div>');
        }
    }
    
    const totalPages = Math.ceil(totalAnnouncements / announcementsPerPage);
    createPagination('announcementsPagination', currentAnnouncementsPage, totalPages, (page) => {
        loadAnnouncements(page, announcementsPerPage);
    });
}

// Show add announcement modal
function showAddAnnouncementModal() {
    const modal = createAnnouncementModal();
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Create announcement modal
function createAnnouncementModal(announcement = null) {
    const isEdit = announcement !== null;
    const modalId = isEdit ? 'editAnnouncementModal' : 'addAnnouncementModal';
    
    // Remove existing modal if any
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-megaphone-${isEdit ? 'fill' : ''}"></i>
                            ${isEdit ? 'Edit Announcement' : 'Create New Announcement'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="announcementForm">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="title" class="form-label">Title *</label>
                                <input type="text" class="form-control" id="title" name="title" 
                                       value="${announcement?.title || ''}" required 
                                       placeholder="Enter announcement title">
                            </div>
                            
                            <div class="mb-3">
                                <label for="content" class="form-label">Content *</label>
                                <textarea class="form-control" id="content" name="content" rows="5" required
                                          placeholder="Enter announcement content">${announcement?.content || ''}</textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="priority" class="form-label">Priority</label>
                                        <select class="form-select" id="priority" name="priority">
                                            <option value="low" ${announcement?.priority === 'low' ? 'selected' : ''}>Low</option>
                                            <option value="medium" ${announcement?.priority === 'medium' || !announcement ? 'selected' : ''}>Medium</option>
                                            <option value="high" ${announcement?.priority === 'high' ? 'selected' : ''}>High</option>
                                            <option value="urgent" ${announcement?.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="targetAudience" class="form-label">Target Audience</label>
                                        <select class="form-select" id="targetAudience" name="target_audience">
                                            <option value="all" ${announcement?.target_audience === 'all' || !announcement ? 'selected' : ''}>All</option>
                                            <option value="students" ${announcement?.target_audience === 'students' ? 'selected' : ''}>Students</option>
                                            <option value="faculty" ${announcement?.target_audience === 'faculty' ? 'selected' : ''}>Faculty</option>
                                            <option value="staff" ${announcement?.target_audience === 'staff' ? 'selected' : ''}>Staff</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="validFrom" class="form-label">Valid From</label>
                                        <input type="datetime-local" class="form-control" id="validFrom" name="valid_from"
                                               value="${announcement?.valid_from ? new Date(announcement.valid_from).toISOString().slice(0, 16) : ''}">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="validUntil" class="form-label">Valid Until</label>
                                        <input type="datetime-local" class="form-control" id="validUntil" name="valid_until"
                                               value="${announcement?.valid_until ? new Date(announcement.valid_until).toISOString().slice(0, 16) : ''}">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="sendNotification" name="send_notification" 
                                           ${announcement?.send_notification !== false ? 'checked' : ''}>
                                    <label class="form-check-label" for="sendNotification">
                                        Send notification to target audience
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <span class="spinner-border spinner-border-sm d-none me-2"></span>
                                ${isEdit ? 'Update Announcement' : 'Create Announcement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById(modalId);
    
    // Setup form submission
    const form = modal.querySelector('#announcementForm');
    form.addEventListener('submit', (e) => handleAnnouncementSubmit(e, announcement?.id));
    
    return modal;
}

// Handle announcement form submission
async function handleAnnouncementSubmit(event, announcementId = null) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    const announcementData = {
        title: formData.get('title'),
        content: formData.get('content'),
        priority: formData.get('priority'),
        target_audience: formData.get('target_audience'),
        valid_from: formData.get('valid_from') || null,
        valid_until: formData.get('valid_until') || null,
        send_notification: formData.has('send_notification')
    };

    // Validate
    if (!announcementData.title || !announcementData.content) {
        showError('Please fill in all required fields.');
        return;
    }

    try {
        showLoading(submitBtn);
        
        let response;
        if (announcementId) {
            response = await AnnouncementsAPI.update(announcementId, announcementData);
            showSuccess('Announcement updated successfully!');
        } else {
            response = await AnnouncementsAPI.create(announcementData);
            showSuccess('Announcement created successfully!');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
        modal.hide();
        
        // Reload announcements
        loadAnnouncements(currentAnnouncementsPage, announcementsPerPage);
        
    } catch (error) {
        console.error('Failed to save announcement:', error);
        showError(error.message || 'Failed to save announcement. Please try again.');
    } finally {
        hideLoading(submitBtn);
    }
}

// View announcement details
async function viewAnnouncement(announcementId) {
    try {
        showLoadingOverlay();
        const response = await AnnouncementsAPI.getById(announcementId);
        const announcement = response.announcement || response;
        
        showAnnouncementDetailsModal(announcement);
        hideLoadingOverlay();
    } catch (error) {
        console.error('Failed to load announcement details:', error);
        showError('Failed to load announcement details.');
        hideLoadingOverlay();
    }
}

// Show announcement details modal
function showAnnouncementDetailsModal(announcement) {
    const modalHTML = `
        <div class="modal fade" id="announcementDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-megaphone-fill"></i>
                            Announcement Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h4>${announcement.title}</h4>
                                <span class="badge bg-${getPriorityBadgeClass(announcement.priority || 'medium')}">
                                    ${capitalizeWords(announcement.priority || 'Medium')}
                                </span>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <p class="text-muted mb-0">${announcement.content}</p>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>Target Audience:</strong><br>
                                <span class="badge bg-secondary">${capitalizeWords(announcement.target_audience || 'All')}</span>
                            </div>
                            <div class="col-md-6">
                                <strong>Created By:</strong><br>
                                <span class="text-muted">${announcement.created_by || 'System'}</span>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>Created:</strong><br>
                                <span class="text-muted">${formatDateTime(announcement.created_at)}</span>
                            </div>
                            <div class="col-md-6">
                                <strong>Last Updated:</strong><br>
                                <span class="text-muted">${announcement.updated_at ? formatDateTime(announcement.updated_at) : 'Never'}</span>
                            </div>
                        </div>
                        
                        ${announcement.valid_from || announcement.valid_until ? `
                        <div class="row mb-3">
                            ${announcement.valid_from ? `
                            <div class="col-md-6">
                                <strong>Valid From:</strong><br>
                                <span class="text-muted">${formatDateTime(announcement.valid_from)}</span>
                            </div>
                            ` : ''}
                            ${announcement.valid_until ? `
                            <div class="col-md-6">
                                <strong>Valid Until:</strong><br>
                                <span class="text-muted">${formatDateTime(announcement.valid_until)}</span>
                            </div>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-warning" onclick="editAnnouncement(${announcement.id})">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('announcementDetailsModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('announcementDetailsModal'));
    modal.show();
}

// Edit announcement
async function editAnnouncement(announcementId) {
    try {
        showLoadingOverlay();
        const response = await AnnouncementsAPI.getById(announcementId);
        const announcement = response.announcement || response;
        
        // Close details modal if open
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('announcementDetailsModal'));
        if (detailsModal) detailsModal.hide();
        
        const modal = createAnnouncementModal(announcement);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        hideLoadingOverlay();
    } catch (error) {
        console.error('Failed to load announcement for editing:', error);
        showError('Failed to load announcement data for editing.');
        hideLoadingOverlay();
    }
}

// Delete announcement
async function deleteAnnouncement(announcementId) {
    const announcement = announcementsData.find(a => a.id === announcementId);
    const announcementTitle = announcement ? announcement.title : 'this announcement';
    
    confirmDialog(
        `Are you sure you want to delete "${announcementTitle}"? This action cannot be undone.`,
        async () => {
            try {
                await AnnouncementsAPI.delete(announcementId);
                showSuccess('Announcement deleted successfully!');
                loadAnnouncements(currentAnnouncementsPage, announcementsPerPage);
            } catch (error) {
                console.error('Failed to delete announcement:', error);
                showError('Failed to delete announcement. Please try again.');
            }
        }
    );
}

// Show announcements loading state
function showAnnouncementsLoading() {
    const announcementsContainer = document.getElementById('announcementsList');
    if (!announcementsContainer) return;

    announcementsContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-2">Loading announcements...</div>
        </div>
    `;
}

// Show announcements empty state
function showAnnouncementsEmptyState() {
    const announcementsContainer = document.getElementById('announcementsList');
    if (!announcementsContainer) return;

    announcementsContainer.innerHTML = `
        <div class="text-center py-5">
            <div class="text-muted">
                <i class="bi bi-megaphone" style="font-size: 3rem;"></i>
                <h5 class="mt-3">No announcements found</h5>
                <p>Start by creating your first announcement.</p>
                <button class="btn btn-primary" onclick="showAddAnnouncementModal()">
                    <i class="bi bi-plus-circle me-1"></i>Create Announcement
                </button>
            </div>
        </div>
    `;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        // Initialize announcements when dashboard loads
        setTimeout(() => {
            if (typeof initializeAnnouncements === 'function') {
                initializeAnnouncements();
            }
        }, 100);
    }
});

// Export functions for global access
window.loadAnnouncements = loadAnnouncements;
window.viewAnnouncement = viewAnnouncement;
window.editAnnouncement = editAnnouncement;
window.deleteAnnouncement = deleteAnnouncement; 