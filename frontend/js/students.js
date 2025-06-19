// Students management functionality

// Global variables
let studentsData = [];
let currentStudentsPage = 1;
let studentsPerPage = 10;
let totalStudents = 0;

// Initialize students section
function initializeStudents() {
    setupStudentsEventListeners();
    loadStudents();
}

// Setup event listeners for students section
function setupStudentsEventListeners() {
    const addStudentBtn = document.getElementById('addStudentBtn');
    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', showAddStudentModal);
    }
}

// Load students data
async function loadStudents(page = 1, limit = 10) {
    try {
        currentStudentsPage = page;
        studentsPerPage = limit;
        
        showTableLoading('studentsTable');
        
        const response = await StudentsAPI.getAll(page, limit);
        studentsData = response.data || [];
        totalStudents = response.total || 0;
        
        updateStudentsTable();
        updateStudentsPagination();
        
    } catch (error) {
        console.error('Failed to load students:', error);
        showError('Failed to load students data.');
        showEmptyState('studentsTable', 'students');
    }
}

// Update students table
function updateStudentsTable() {
    const tableBody = document.querySelector('#studentsTable tbody');
    if (!tableBody) return;

    if (studentsData.length === 0) {
        showEmptyState('studentsTable', 'students');
        return;
    }

    tableBody.innerHTML = studentsData.map(student => `
        <tr>
            <td><strong>${student.roll_number || 'N/A'}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                        ${(student.first_name?.[0] || 'S').toUpperCase()}
                    </div>
                    <div>
                        <div class="fw-semibold">${student.first_name} ${student.last_name}</div>
                        <small class="text-muted">${student.date_of_birth ? formatDate(student.date_of_birth) : ''}</small>
                    </div>
                </div>
            </td>
            <td>
                <div>
                    <div>${student.email}</div>
                    ${student.phone ? `<small class="text-muted">${student.phone}</small>` : ''}
                </div>
            </td>
            <td>${student.phone || 'N/A'}</td>
            <td>
                <span class="badge bg-info">${student.enrolled_courses || 0} courses</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewStudent(${student.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="editStudent(${student.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteStudent(${student.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update students pagination
function updateStudentsPagination() {
    const totalPages = Math.ceil(totalStudents / studentsPerPage);
    createPagination('studentsPagination', currentStudentsPage, totalPages, (page) => {
        loadStudents(page, studentsPerPage);
    });
}

// Show add student modal
function showAddStudentModal() {
    const modal = createStudentModal();
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Create student modal
function createStudentModal(student = null) {
    const isEdit = student !== null;
    const modalId = isEdit ? 'editStudentModal' : 'addStudentModal';
    
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
                            <i class="bi bi-person-${isEdit ? 'gear' : 'plus'}"></i>
                            ${isEdit ? 'Edit Student' : 'Add New Student'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="studentForm">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="firstName" class="form-label">First Name *</label>
                                        <input type="text" class="form-control" id="firstName" name="first_name" 
                                               value="${student?.first_name || ''}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="lastName" class="form-label">Last Name *</label>
                                        <input type="text" class="form-control" id="lastName" name="last_name" 
                                               value="${student?.last_name || ''}" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email *</label>
                                        <input type="email" class="form-control" id="email" name="email" 
                                               value="${student?.email || ''}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="phone" class="form-label">Phone</label>
                                        <input type="tel" class="form-control" id="phone" name="phone" 
                                               value="${student?.phone || ''}">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="rollNumber" class="form-label">Roll Number *</label>
                                        <input type="text" class="form-control" id="rollNumber" name="roll_number" 
                                               value="${student?.roll_number || ''}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="dateOfBirth" class="form-label">Date of Birth</label>
                                        <input type="date" class="form-control" id="dateOfBirth" name="date_of_birth" 
                                               value="${student?.date_of_birth ? formatDateForInput(student.date_of_birth) : ''}">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="address" class="form-label">Address</label>
                                <textarea class="form-control" id="address" name="address" rows="3">${student?.address || ''}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <span class="spinner-border spinner-border-sm d-none me-2"></span>
                                ${isEdit ? 'Update Student' : 'Add Student'}
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
    const form = modal.querySelector('#studentForm');
    form.addEventListener('submit', (e) => handleStudentSubmit(e, student?.id));
    
    return modal;
}

// Handle student form submission
async function handleStudentSubmit(event, studentId = null) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    const studentData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        roll_number: formData.get('roll_number'),
        date_of_birth: formData.get('date_of_birth'),
        address: formData.get('address')
    };

    // Validate
    if (!studentData.first_name || !studentData.last_name || !studentData.email || !studentData.roll_number) {
        showError('Please fill in all required fields.');
        return;
    }

    if (!isValidEmail(studentData.email)) {
        showError('Please enter a valid email address.');
        return;
    }

    try {
        showLoading(submitBtn);
        
        let response;
        if (studentId) {
            response = await StudentsAPI.update(studentId, studentData);
            showSuccess('Student updated successfully!');
        } else {
            response = await StudentsAPI.create(studentData);
            showSuccess('Student added successfully!');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
        modal.hide();
        
        // Reload students
        loadStudents(currentStudentsPage, studentsPerPage);
        
    } catch (error) {
        console.error('Failed to save student:', error);
        showError(error.message || 'Failed to save student. Please try again.');
    } finally {
        hideLoading(submitBtn);
    }
}

// View student details
async function viewStudent(studentId) {
    try {
        showLoadingOverlay();
        const response = await StudentsAPI.getById(studentId);
        const student = response.student || response;
        
        showStudentDetailsModal(student);
        hideLoadingOverlay();
    } catch (error) {
        console.error('Failed to load student details:', error);
        showError('Failed to load student details.');
        hideLoadingOverlay();
    }
}

// Show student details modal
function showStudentDetailsModal(student) {
    const modalHTML = `
        <div class="modal fade" id="studentDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-person-circle"></i>
                            Student Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h4>${student.first_name} ${student.last_name}</h4>
                                <p class="text-muted mb-3">Roll Number: ${student.roll_number}</p>
                                
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <strong>Email:</strong><br>
                                        <span class="text-muted">${student.email}</span>
                                    </div>
                                    <div class="col-sm-6">
                                        <strong>Phone:</strong><br>
                                        <span class="text-muted">${student.phone || 'N/A'}</span>
                                    </div>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <strong>Date of Birth:</strong><br>
                                        <span class="text-muted">${student.date_of_birth ? formatDate(student.date_of_birth) : 'N/A'}</span>
                                    </div>
                                    <div class="col-sm-6">
                                        <strong>Enrolled Courses:</strong><br>
                                        <span class="badge bg-info">${student.enrolled_courses || 0} courses</span>
                                    </div>
                                </div>
                                
                                ${student.address ? `
                                <div class="mb-3">
                                    <strong>Address:</strong><br>
                                    <span class="text-muted">${student.address}</span>
                                </div>
                                ` : ''}
                            </div>
                            <div class="col-md-4 text-center">
                                <div class="avatar-lg bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 120px; height: 120px; font-size: 3rem;">
                                    ${student.first_name[0].toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-warning" onclick="editStudent(${student.id})">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('studentDetailsModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
    modal.show();
}

// Edit student
async function editStudent(studentId) {
    try {
        showLoadingOverlay();
        const response = await StudentsAPI.getById(studentId);
        const student = response.student || response;
        
        // Close details modal if open
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('studentDetailsModal'));
        if (detailsModal) detailsModal.hide();
        
        const modal = createStudentModal(student);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        hideLoadingOverlay();
    } catch (error) {
        console.error('Failed to load student for editing:', error);
        showError('Failed to load student data for editing.');
        hideLoadingOverlay();
    }
}

// Delete student
async function deleteStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    const studentName = student ? `${student.first_name} ${student.last_name}` : 'this student';
    
    confirmDialog(
        `Are you sure you want to delete ${studentName}? This action cannot be undone.`,
        async () => {
            try {
                await StudentsAPI.delete(studentId);
                showSuccess('Student deleted successfully!');
                loadStudents(currentStudentsPage, studentsPerPage);
            } catch (error) {
                console.error('Failed to delete student:', error);
                showError('Failed to delete student. Please try again.');
            }
        }
    );
}

// Show table loading state
function showTableLoading(tableId) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="mt-2">Loading students...</div>
            </td>
        </tr>
    `;
}

// Show empty state
function showEmptyState(tableId, type) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) return;

    const emptyMessages = {
        students: {
            icon: 'bi-people',
            title: 'No students found',
            message: 'Start by adding your first student to the system.'
        }
    };

    const config = emptyMessages[type] || emptyMessages.students;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-5">
                <div class="text-muted">
                    <i class="${config.icon}" style="font-size: 3rem;"></i>
                    <h5 class="mt-3">${config.title}</h5>
                    <p>${config.message}</p>
                </div>
            </td>
        </tr>
    `;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        // Initialize students when dashboard loads
        setTimeout(() => {
            if (typeof initializeStudents === 'function') {
                initializeStudents();
            }
        }, 100);
    }
});

// Export functions for global access
window.loadStudents = loadStudents;
window.viewStudent = viewStudent;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent; 