// Grades management functionality for Student Management System

let gradesData = [];
let currentGradesPage = 1;
let gradesPerPage = 10;
let totalGrades = 0;

// Initialize grades section
function initializeGrades() {
    setupGradesEventListeners();
    loadGrades();
}

// Setup event listeners
function setupGradesEventListeners() {
    const addGradeBtn = document.getElementById('addGradeBtn');
    if (addGradeBtn) {
        addGradeBtn.addEventListener('click', showAddGradeModal);
    }
}

// Load grades data
async function loadGrades(page = 1, limit = 10) {
    try {
        currentGradesPage = page;
        gradesPerPage = limit;
        
        showTableLoading('gradesTable');
        
        const response = await GradesAPI.getAll(page, limit);
        gradesData = response.data || [];
        totalGrades = response.total || 0;
        
        updateGradesTable();
        updateGradesPagination();
        
    } catch (error) {
        console.error('Failed to load grades:', error);
        showError('Failed to load grades data.');
        showGradesEmptyState();
    }
}

// Update grades table
function updateGradesTable() {
    const tableBody = document.querySelector('#gradesTable tbody');
    if (!tableBody) return;

    if (gradesData.length === 0) {
        showGradesEmptyState();
        return;
    }

    tableBody.innerHTML = gradesData.map(grade => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                        ${(grade.student_name?.[0] || 'S').toUpperCase()}
                    </div>
                    <div>
                        <div class="fw-semibold">${grade.student_name || 'Unknown Student'}</div>
                        <small class="text-muted">${grade.student_roll || ''}</small>
                    </div>
                </div>
            </td>
            <td>
                <div>
                    <div class="fw-semibold">${grade.course_name || 'Unknown Course'}</div>
                    <small class="text-muted">${grade.course_code || ''}</small>
                </div>
            </td>
            <td>
                <div class="text-center">
                    <div class="fw-bold">${grade.score || 0}/100</div>
                    <div class="progress mt-1" style="height: 6px;">
                        <div class="progress-bar ${getScoreProgressClass(grade.score)}" 
                             style="width: ${grade.score || 0}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-${getGradeBadgeClass(grade.letter_grade)}">${grade.letter_grade || 'N/A'}</span>
            </td>
            <td>
                <div>
                    <div>${grade.faculty_name || 'Unknown Faculty'}</div>
                    <small class="text-muted">${grade.recorded_date ? formatDate(grade.recorded_date) : ''}</small>
                </div>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewGrade(${grade.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="editGrade(${grade.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteGrade(${grade.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get score progress bar class
function getScoreProgressClass(score) {
    if (score >= 90) return 'bg-success';
    if (score >= 80) return 'bg-primary';
    if (score >= 70) return 'bg-info';
    if (score >= 60) return 'bg-warning';
    return 'bg-danger';
}

// Update grades pagination
function updateGradesPagination() {
    const totalPages = Math.ceil(totalGrades / gradesPerPage);
    createPagination('gradesPagination', currentGradesPage, totalPages, (page) => {
        loadGrades(page, gradesPerPage);
    });
}

// Show add grade modal
function showAddGradeModal() {
    // Implementation for grade modal
    showInfo('Add Grade modal functionality coming soon!');
}

// View grade details
function viewGrade(gradeId) {
    const grade = gradesData.find(g => g.id === gradeId);
    if (grade) {
        showInfo(`Grade details for ${grade.student_name}: ${grade.score}/100 (${grade.letter_grade})`);
    }
}

// Edit grade
function editGrade(gradeId) {
    showInfo('Edit grade functionality coming soon!');
}

// Delete grade
function deleteGrade(gradeId) {
    const grade = gradesData.find(g => g.id === gradeId);
    const gradeName = grade ? `${grade.student_name} - ${grade.course_name}` : 'this grade';
    
    confirmDialog(
        `Are you sure you want to delete the grade for ${gradeName}?`,
        async () => {
            try {
                await GradesAPI.delete(gradeId);
                showSuccess('Grade deleted successfully!');
                loadGrades(currentGradesPage, gradesPerPage);
            } catch (error) {
                console.error('Failed to delete grade:', error);
                showError('Failed to delete grade.');
            }
        }
    );
}

// Show grades empty state
function showGradesEmptyState() {
    const tableBody = document.querySelector('#gradesTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-5">
                <div class="text-muted">
                    <i class="bi bi-award" style="font-size: 3rem;"></i>
                    <h5 class="mt-3">No grades found</h5>
                    <p>Start by adding grades for your students.</p>
                </div>
            </td>
        </tr>
    `;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        setTimeout(() => {
            if (typeof initializeGrades === 'function') {
                initializeGrades();
            }
        }, 100);
    }
});

// Export functions
window.loadGrades = loadGrades;
window.viewGrade = viewGrade;
window.editGrade = editGrade;
window.deleteGrade = deleteGrade; 