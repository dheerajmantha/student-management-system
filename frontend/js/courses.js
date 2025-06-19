// Courses management functionality

// Global variables
let coursesData = [];
let currentCoursesPage = 1;
let coursesPerPage = 10;
let totalCourses = 0;

// Initialize courses section
function initializeCourses() {
    setupCoursesEventListeners();
    loadCourses();
}

// Setup event listeners for courses section
function setupCoursesEventListeners() {
    const addCourseBtn = document.getElementById('addCourseBtn');
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', showAddCourseModal);
    }
}

// Load courses data
async function loadCourses(page = 1, limit = 10) {
    try {
        currentCoursesPage = page;
        coursesPerPage = limit;
        
        showTableLoading('coursesTable');
        
        const response = await CoursesAPI.getAll(page, limit);
        coursesData = response.data || [];
        totalCourses = response.total || 0;
        
        updateCoursesTable();
        updateCoursesPagination();
        
    } catch (error) {
        console.error('Failed to load courses:', error);
        showError('Failed to load courses data.');
        showEmptyState('coursesTable', 'courses');
    }
}

// Update courses table
function updateCoursesTable() {
    const tableBody = document.querySelector('#coursesTable tbody');
    if (!tableBody) return;

    if (coursesData.length === 0) {
        showEmptyState('coursesTable', 'courses');
        return;
    }

    tableBody.innerHTML = coursesData.map(course => `
        <tr>
            <td><strong>${course.course_code || 'N/A'}</strong></td>
            <td>
                <div>
                    <div class="fw-semibold">${course.course_name}</div>
                    <small class="text-muted">${course.description ? course.description.substring(0, 50) + '...' : ''}</small>
                </div>
            </td>
            <td>
                <span class="badge bg-primary">${course.credits || 0} credits</span>
            </td>
            <td>
                <div>
                    <div>${course.faculty_name || 'Not assigned'}</div>
                    <small class="text-muted">${course.department || ''}</small>
                </div>
            </td>
            <td>
                <span class="badge bg-info">${course.enrolled_students || 0} students</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewCourse(${course.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="editCourse(${course.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteCourse(${course.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update courses pagination
function updateCoursesPagination() {
    const totalPages = Math.ceil(totalCourses / coursesPerPage);
    createPagination('coursesPagination', currentCoursesPage, totalPages, (page) => {
        loadCourses(page, coursesPerPage);
    });
}

// Show add course modal
function showAddCourseModal() {
    const modal = createCourseModal();
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

// Create course modal
function createCourseModal(course = null) {
    const isEdit = course !== null;
    const modalId = isEdit ? 'editCourseModal' : 'addCourseModal';
    
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
                            <i class="bi bi-book-${isEdit ? 'gear' : 'plus'}"></i>
                            ${isEdit ? 'Edit Course' : 'Add New Course'}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="courseForm">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="courseCode" class="form-label">Course Code *</label>
                                        <input type="text" class="form-control" id="courseCode" name="course_code" 
                                               value="${course?.course_code || ''}" required placeholder="e.g., CS101">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="credits" class="form-label">Credits *</label>
                                        <input type="number" class="form-control" id="credits" name="credits" 
                                               value="${course?.credits || ''}" required min="1" max="6">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="courseName" class="form-label">Course Name *</label>
                                <input type="text" class="form-control" id="courseName" name="course_name" 
                                       value="${course?.course_name || ''}" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="description" class="form-label">Description</label>
                                <textarea class="form-control" id="description" name="description" rows="3"
                                          placeholder="Brief description of the course">${course?.description || ''}</textarea>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="department" class="form-label">Department</label>
                                        <input type="text" class="form-control" id="department" name="department" 
                                               value="${course?.department || ''}" placeholder="e.g., Computer Science">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="facultyName" class="form-label">Faculty</label>
                                        <input type="text" class="form-control" id="facultyName" name="faculty_name" 
                                               value="${course?.faculty_name || ''}" placeholder="Faculty member name">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="semester" class="form-label">Semester</label>
                                        <select class="form-control" id="semester" name="semester">
                                            <option value="">Select Semester</option>
                                            <option value="Fall" ${course?.semester === 'Fall' ? 'selected' : ''}>Fall</option>
                                            <option value="Spring" ${course?.semester === 'Spring' ? 'selected' : ''}>Spring</option>
                                            <option value="Summer" ${course?.semester === 'Summer' ? 'selected' : ''}>Summer</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="year" class="form-label">Year</label>
                                        <input type="number" class="form-control" id="year" name="year" 
                                               value="${course?.year || new Date().getFullYear()}" min="2020" max="2030">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <span class="spinner-border spinner-border-sm d-none me-2"></span>
                                ${isEdit ? 'Update Course' : 'Add Course'}
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
    const form = modal.querySelector('#courseForm');
    form.addEventListener('submit', (e) => handleCourseSubmit(e, course?.id));
    
    return modal;
}

// Handle course form submission
async function handleCourseSubmit(event, courseId = null) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    const courseData = {
        course_code: formData.get('course_code'),
        course_name: formData.get('course_name'),
        description: formData.get('description'),
        credits: parseInt(formData.get('credits')),
        department: formData.get('department'),
        faculty_name: formData.get('faculty_name'),
        semester: formData.get('semester'),
        year: parseInt(formData.get('year'))
    };

    // Validate
    if (!courseData.course_code || !courseData.course_name || !courseData.credits) {
        showError('Please fill in all required fields.');
        return;
    }

    if (!isValidCourseCode(courseData.course_code)) {
        showError('Please enter a valid course code (e.g., CS101).');
        return;
    }

    try {
        showLoading(submitBtn);
        
        let response;
        if (courseId) {
            response = await CoursesAPI.update(courseId, courseData);
            showSuccess('Course updated successfully!');
        } else {
            response = await CoursesAPI.create(courseData);
            showSuccess('Course added successfully!');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
        modal.hide();
        
        // Reload courses
        loadCourses(currentCoursesPage, coursesPerPage);
        
    } catch (error) {
        console.error('Failed to save course:', error);
        showError(error.message || 'Failed to save course. Please try again.');
    } finally {
        hideLoading(submitBtn);
    }
}

// View course details
async function viewCourse(courseId) {
    try {
        showLoadingOverlay();
        const response = await CoursesAPI.getById(courseId);
        const course = response.course || response;
        
        showCourseDetailsModal(course);
        hideLoadingOverlay();
    } catch (error) {
        console.error('Failed to load course details:', error);
        showError('Failed to load course details.');
        hideLoadingOverlay();
    }
}

// Show course details modal
function showCourseDetailsModal(course) {
    const modalHTML = `
        <div class="modal fade" id="courseDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-book"></i>
                            Course Details
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h4>${course.course_name}</h4>
                                <p class="text-muted mb-3">Course Code: ${course.course_code}</p>
                                
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <strong>Credits:</strong><br>
                                        <span class="badge bg-primary">${course.credits} credits</span>
                                    </div>
                                    <div class="col-sm-6">
                                        <strong>Department:</strong><br>
                                        <span class="text-muted">${course.department || 'Not specified'}</span>
                                    </div>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <strong>Faculty:</strong><br>
                                        <span class="text-muted">${course.faculty_name || 'Not assigned'}</span>
                                    </div>
                                    <div class="col-sm-6">
                                        <strong>Enrolled Students:</strong><br>
                                        <span class="badge bg-info">${course.enrolled_students || 0} students</span>
                                    </div>
                                </div>
                                
                                ${course.semester || course.year ? `
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <strong>Semester:</strong><br>
                                        <span class="text-muted">${course.semester || 'Not specified'}</span>
                                    </div>
                                    <div class="col-sm-6">
                                        <strong>Year:</strong><br>
                                        <span class="text-muted">${course.year || 'Not specified'}</span>
                                    </div>
                                </div>
                                ` : ''}
                                
                                ${course.description ? `
                                <div class="mb-3">
                                    <strong>Description:</strong><br>
                                    <span class="text-muted">${course.description}</span>
                                </div>
                                ` : ''}
                            </div>
                            <div class="col-md-4 text-center">
                                <div class="avatar-lg bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 120px; height: 120px; font-size: 3rem;">
                                    <i class="bi bi-book"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-warning" onclick="editCourse(${course.id})">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('courseDetailsModal');
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('courseDetailsModal'));
    modal.show();
}

// Edit course
async function editCourse(courseId) {
    try {
        showLoadingOverlay();
        const response = await CoursesAPI.getById(courseId);
        const course = response.course || response;
        
        // Close details modal if open
        const detailsModal = bootstrap.Modal.getInstance(document.getElementById('courseDetailsModal'));
        if (detailsModal) detailsModal.hide();
        
        const modal = createCourseModal(course);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        hideLoadingOverlay();
    } catch (error) {
        console.error('Failed to load course for editing:', error);
        showError('Failed to load course data for editing.');
        hideLoadingOverlay();
    }
}

// Delete course
async function deleteCourse(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    const courseName = course ? course.course_name : 'this course';
    
    confirmDialog(
        `Are you sure you want to delete ${courseName}? This action cannot be undone.`,
        async () => {
            try {
                await CoursesAPI.delete(courseId);
                showSuccess('Course deleted successfully!');
                loadCourses(currentCoursesPage, coursesPerPage);
            } catch (error) {
                console.error('Failed to delete course:', error);
                showError('Failed to delete course. Please try again.');
            }
        }
    );
}

// Show empty state for courses
function showEmptyState(tableId, type) {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    if (!tableBody) return;

    const emptyMessages = {
        courses: {
            icon: 'bi-book',
            title: 'No courses found',
            message: 'Start by adding your first course to the system.'
        }
    };

    const config = emptyMessages[type] || emptyMessages.courses;

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
        // Initialize courses when dashboard loads
        setTimeout(() => {
            if (typeof initializeCourses === 'function') {
                initializeCourses();
            }
        }, 100);
    }
});

// Export functions for global access
window.loadCourses = loadCourses;
window.viewCourse = viewCourse;
window.editCourse = editCourse;
window.deleteCourse = deleteCourse; 