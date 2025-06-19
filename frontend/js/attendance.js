// Attendance management functionality for Student Management System

let attendanceData = [];
let currentAttendancePage = 1;
let attendancePerPage = 10;
let totalAttendance = 0;

// Initialize attendance section
function initializeAttendance() {
    setupAttendanceEventListeners();
    loadAttendance();
}

// Setup event listeners
function setupAttendanceEventListeners() {
    const markAttendanceBtn = document.getElementById('markAttendanceBtn');
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener('click', showMarkAttendanceModal);
    }
}

// Load attendance data
async function loadAttendance(page = 1, limit = 10) {
    try {
        currentAttendancePage = page;
        attendancePerPage = limit;
        
        showTableLoading('attendanceTable');
        
        const response = await AttendanceAPI.getAll(page, limit);
        attendanceData = response.data || [];
        totalAttendance = response.total || 0;
        
        updateAttendanceTable();
        updateAttendancePagination();
        
    } catch (error) {
        console.error('Failed to load attendance:', error);
        showError('Failed to load attendance data.');
        showAttendanceEmptyState();
    }
}

// Update attendance table
function updateAttendanceTable() {
    const tableBody = document.querySelector('#attendanceTable tbody');
    if (!tableBody) return;

    if (attendanceData.length === 0) {
        showAttendanceEmptyState();
        return;
    }

    tableBody.innerHTML = attendanceData.map(attendance => `
        <tr>
            <td>
                <div class="fw-semibold">${formatDate(attendance.date)}</div>
                <small class="text-muted">${new Date(attendance.date).toLocaleDateString('en-US', { weekday: 'long' })}</small>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                        ${(attendance.student_name?.[0] || 'S').toUpperCase()}
                    </div>
                    <div>
                        <div class="fw-semibold">${attendance.student_name || 'Unknown Student'}</div>
                        <small class="text-muted">${attendance.student_roll || ''}</small>
                    </div>
                </div>
            </td>
            <td>
                <div>
                    <div class="fw-semibold">${attendance.course_name || 'Unknown Course'}</div>
                    <small class="text-muted">${attendance.course_code || ''}</small>
                </div>
            </td>
            <td>
                <span class="badge bg-${getAttendanceBadgeClass(attendance.status)}">
                    <i class="bi bi-${getAttendanceIcon(attendance.status)} me-1"></i>
                    ${capitalizeWords(attendance.status || 'Unknown')}
                </span>
            </td>
            <td>
                <div>
                    <div>${attendance.recorded_by || 'System'}</div>
                    <small class="text-muted">${attendance.recorded_at ? formatDateTime(attendance.recorded_at) : ''}</small>
                </div>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewAttendance(${attendance.id})" title="View">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="editAttendance(${attendance.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteAttendance(${attendance.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get attendance icon
function getAttendanceIcon(status) {
    switch (status?.toLowerCase()) {
        case 'present': return 'check-circle';
        case 'absent': return 'x-circle';
        case 'excused': return 'exclamation-circle';
        case 'late': return 'clock';
        default: return 'question-circle';
    }
}

// Update attendance pagination
function updateAttendancePagination() {
    const totalPages = Math.ceil(totalAttendance / attendancePerPage);
    createPagination('attendancePagination', currentAttendancePage, totalPages, (page) => {
        loadAttendance(page, attendancePerPage);
    });
}

// Show mark attendance modal
function showMarkAttendanceModal() {
    showInfo('Mark Attendance modal functionality coming soon!');
}

// View attendance details
function viewAttendance(attendanceId) {
    const attendance = attendanceData.find(a => a.id === attendanceId);
    if (attendance) {
        showInfo(`Attendance for ${attendance.student_name} on ${formatDate(attendance.date)}: ${attendance.status}`);
    }
}

// Edit attendance
function editAttendance(attendanceId) {
    showInfo('Edit attendance functionality coming soon!');
}

// Delete attendance
function deleteAttendance(attendanceId) {
    const attendance = attendanceData.find(a => a.id === attendanceId);
    const attendanceName = attendance ? `${attendance.student_name} on ${formatDate(attendance.date)}` : 'this attendance record';
    
    confirmDialog(
        `Are you sure you want to delete the attendance record for ${attendanceName}?`,
        async () => {
            try {
                await AttendanceAPI.update(attendanceId, { deleted: true });
                showSuccess('Attendance record deleted successfully!');
                loadAttendance(currentAttendancePage, attendancePerPage);
            } catch (error) {
                console.error('Failed to delete attendance:', error);
                showError('Failed to delete attendance record.');
            }
        }
    );
}

// Show attendance empty state
function showAttendanceEmptyState() {
    const tableBody = document.querySelector('#attendanceTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-5">
                <div class="text-muted">
                    <i class="bi bi-calendar-check" style="font-size: 3rem;"></i>
                    <h5 class="mt-3">No attendance records found</h5>
                    <p>Start by marking attendance for your courses.</p>
                </div>
            </td>
        </tr>
    `;
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        setTimeout(() => {
            if (typeof initializeAttendance === 'function') {
                initializeAttendance();
            }
        }, 100);
    }
});

// Export functions
window.loadAttendance = loadAttendance;
window.viewAttendance = viewAttendance;
window.editAttendance = editAttendance;
window.deleteAttendance = deleteAttendance; 