// Dashboard functionality for the Student Management System

// Global variables
let dashboardData = {};
let currentSection = 'dashboard';
let isLoading = false;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        initializeDashboard();
    }
});

// Main dashboard initialization
async function initializeDashboard() {
    try {
        showLoadingOverlay();
        
        // Setup initial event listeners
        setupEventListeners();
        
        // Load dashboard data
        await loadDashboard();
        
        // Show default section
        showSection('dashboard');
        
        hideLoadingOverlay();
    } catch (error) {
        console.error('Dashboard initialization failed:', error);
        showError('Failed to initialize dashboard. Please refresh the page.');
        hideLoadingOverlay();
    }
}

// Setup event listeners for dashboard components
function setupEventListeners() {
    // Navigation menu clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.onclick) return; // Skip if already has onclick
        
        const href = link.getAttribute('href');
        if (href === '#') {
            const text = link.textContent.toLowerCase();
            if (text.includes('dashboard')) {
                link.onclick = () => showSection('dashboard');
            } else if (text.includes('students')) {
                link.onclick = () => showSection('students');
            } else if (text.includes('courses')) {
                link.onclick = () => showSection('courses');
            } else if (text.includes('grades')) {
                link.onclick = () => showSection('grades');
            } else if (text.includes('attendance')) {
                link.onclick = () => showSection('attendance');
            } else if (text.includes('announcements')) {
                link.onclick = () => showSection('announcements');
            } else if (text.includes('profile')) {
                link.onclick = () => showSection('profile');
            }
        }
    });

    // Refresh button for dashboard
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'btn btn-outline-primary btn-sm ms-2';
    refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh';
    refreshBtn.onclick = refreshDashboard;
    
    const dashboardHeader = document.querySelector('#dashboard-section h2');
    if (dashboardHeader) {
        dashboardHeader.appendChild(refreshBtn);
    }
}

// Load main dashboard data
async function loadDashboard() {
    try {
        isLoading = true;
        
        // Load all dashboard data in parallel
        const [
            studentsData,
            coursesData,
            gradesData,
            attendanceData,
            announcementsData
        ] = await Promise.allSettled([
            StudentsAPI.getAll(1, 5),
            CoursesAPI.getAll(1, 5),
            GradesAPI.getAll(1, 5),
            AttendanceAPI.getAll(1, 5),
            AnnouncementsAPI.getAll(1, 3)
        ]);

        // Store data
        dashboardData = {
            students: studentsData.status === 'fulfilled' ? studentsData.value : { data: [], total: 0 },
            courses: coursesData.status === 'fulfilled' ? coursesData.value : { data: [], total: 0 },
            grades: gradesData.status === 'fulfilled' ? gradesData.value : { data: [], total: 0 },
            attendance: attendanceData.status === 'fulfilled' ? attendanceData.value : { data: [], total: 0 },
            announcements: announcementsData.status === 'fulfilled' ? announcementsData.value : { data: [], total: 0 }
        };

        // Update dashboard UI
        updateStatisticsCards();
        updateRecentActivities();
        updateLatestAnnouncements();
        
        isLoading = false;
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showError('Failed to load dashboard data.');
        isLoading = false;
    }
}

// Update statistics cards
function updateStatisticsCards() {
    const statsContainer = document.getElementById('statsCards');
    if (!statsContainer) return;

    const stats = [
        {
            title: 'Total Students',
            value: dashboardData.students.total || 0,
            icon: 'bi-people',
            color: 'primary',
            change: '+12%',
            changeType: 'positive'
        },
        {
            title: 'Active Courses',
            value: dashboardData.courses.total || 0,
            icon: 'bi-book',
            color: 'success',
            change: '+5%',
            changeType: 'positive'
        },
        {
            title: 'Recent Grades',
            value: dashboardData.grades.total || 0,
            icon: 'bi-award',
            color: 'warning',
            change: '+8%',
            changeType: 'positive'
        },
        {
            title: 'Attendance Rate',
            value: calculateAttendanceRate() + '%',
            icon: 'bi-calendar-check',
            color: 'info',
            change: '-2%',
            changeType: 'negative'
        }
    ];

    statsContainer.innerHTML = stats.map(stat => `
        <div class="col-lg-3 col-md-6 mb-4">
            <div class="card border-${stat.color} shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="card-title text-muted mb-1">${stat.title}</h6>
                            <h3 class="mb-0 text-${stat.color}">${stat.value}</h3>
                            <small class="text-${stat.changeType === 'positive' ? 'success' : 'danger'}">
                                <i class="bi bi-arrow-${stat.changeType === 'positive' ? 'up' : 'down'}"></i>
                                ${stat.change} from last month
                            </small>
                        </div>
                        <div class="text-${stat.color}">
                            <i class="${stat.icon}" style="font-size: 2rem;"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Calculate attendance rate
function calculateAttendanceRate() {
    const attendanceData = dashboardData.attendance.data || [];
    if (attendanceData.length === 0) return 0;

    const presentCount = attendanceData.filter(record => 
        record.status && record.status.toLowerCase() === 'present'
    ).length;
    
    return Math.round((presentCount / attendanceData.length) * 100);
}

// Update recent activities
function updateRecentActivities() {
    const activitiesContainer = document.getElementById('recentActivities');
    if (!activitiesContainer) return;

    // Combine and sort recent activities
    const activities = [];

    // Add recent student enrollments
    if (dashboardData.students.data) {
        dashboardData.students.data.slice(0, 3).forEach(student => {
            activities.push({
                type: 'student',
                title: 'New student enrolled',
                description: `${student.first_name} ${student.last_name} has joined the system`,
                timestamp: student.created_at || new Date().toISOString(),
                icon: 'bi-person-plus',
                color: 'primary'
            });
        });
    }

    // Add recent grades
    if (dashboardData.grades.data) {
        dashboardData.grades.data.slice(0, 3).forEach(grade => {
            activities.push({
                type: 'grade',
                title: 'Grade recorded',
                description: `New grade ${grade.letter_grade} recorded for ${grade.student_name || 'student'}`,
                timestamp: grade.created_at || new Date().toISOString(),
                icon: 'bi-award',
                color: 'success'
            });
        });
    }

    // Add recent announcements
    if (dashboardData.announcements.data) {
        dashboardData.announcements.data.slice(0, 2).forEach(announcement => {
            activities.push({
                type: 'announcement',
                title: 'New announcement',
                description: announcement.title,
                timestamp: announcement.created_at || new Date().toISOString(),
                icon: 'bi-megaphone',
                color: 'info'
            });
        });
    }

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Display activities
    if (activities.length === 0) {
        activitiesContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                <p class="mt-2">No recent activities</p>
            </div>
        `;
        return;
    }

    activitiesContainer.innerHTML = `
        <div class="timeline">
            ${activities.slice(0, 5).map(activity => `
                <div class="timeline-item">
                    <div class="timeline-marker bg-${activity.color}">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <h6 class="mb-1">${activity.title}</h6>
                        <p class="text-muted mb-1">${activity.description}</p>
                        <small class="text-muted">
                            <i class="bi bi-clock"></i>
                            ${formatDateTime(activity.timestamp)}
                        </small>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Update latest announcements
function updateLatestAnnouncements() {
    const announcementsContainer = document.getElementById('latestAnnouncements');
    if (!announcementsContainer) return;

    const announcements = dashboardData.announcements.data || [];

    if (announcements.length === 0) {
        announcementsContainer.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-megaphone" style="font-size: 3rem;"></i>
                <p class="mt-2">No announcements</p>
            </div>
        `;
        return;
    }

    announcementsContainer.innerHTML = announcements.slice(0, 3).map(announcement => `
        <div class="announcement-item border-bottom pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${announcement.title}</h6>
                    <p class="text-muted small mb-2">${announcement.content ? announcement.content.substring(0, 100) + '...' : 'No content'}</p>
                    <small class="text-muted">
                        <i class="bi bi-calendar"></i>
                        ${formatDate(announcement.created_at)}
                    </small>
                </div>
                <span class="badge bg-${getPriorityBadgeClass(announcement.priority || 'medium')}">
                    ${capitalizeWords(announcement.priority || 'Medium')}
                </span>
            </div>
        </div>
    `).join('');
}

// Show specific section and hide others
function showSection(sectionName) {
    // Update current section
    currentSection = sectionName;

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }

    // Update navigation active state
    updateNavigationActiveState(sectionName);

    // Load section-specific data
    loadSectionData(sectionName);

    // Update page title
    updatePageTitle(sectionName);
}

// Update navigation active state
function updateNavigationActiveState(sectionName) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to current section nav link
    const navItem = document.getElementById(`${sectionName}-nav`);
    if (navItem) {
        const navLink = navItem.querySelector('.nav-link');
        if (navLink) {
            navLink.classList.add('active');
        }
    }

    // Handle dashboard nav (doesn't have ID with -nav suffix)
    if (sectionName === 'dashboard') {
        const dashboardNavLink = document.querySelector('.nav-link[onclick="showSection(\'dashboard\')"]');
        if (dashboardNavLink) {
            dashboardNavLink.classList.add('active');
        }
    }
}

// Load section-specific data
function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            // Dashboard data is already loaded
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
            if (typeof loadProfile === 'function') {
                loadProfile();
            }
            break;
    }
}

// Update page title
function updatePageTitle(sectionName) {
    const titles = {
        dashboard: 'Dashboard',
        students: 'Students Management',
        courses: 'Courses Management',
        grades: 'Grades Management',
        attendance: 'Attendance Management',
        announcements: 'Announcements',
        profile: 'Profile'
    };

    document.title = `${titles[sectionName] || 'Dashboard'} - Student Management System`;
}

// Refresh dashboard data
async function refreshDashboard() {
    if (isLoading) return;

    try {
        showInfo('Refreshing dashboard...');
        await loadDashboard();
        showSuccess('Dashboard refreshed successfully!');
    } catch (error) {
        console.error('Failed to refresh dashboard:', error);
        showError('Failed to refresh dashboard.');
    }
}

// Get dashboard statistics
function getDashboardStats() {
    return {
        totalStudents: dashboardData.students.total || 0,
        totalCourses: dashboardData.courses.total || 0,
        totalGrades: dashboardData.grades.total || 0,
        attendanceRate: calculateAttendanceRate()
    };
}

// Export functions for use by other modules
window.showSection = showSection;
window.loadDashboard = loadDashboard;
window.refreshDashboard = refreshDashboard;
window.getDashboardStats = getDashboardStats; 