// API configuration and utilities
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

// API utility class
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // GET request
    static async get(endpoint) {
        return await this.request(endpoint, {
            method: 'GET'
        });
    }

    // POST request
    static async post(endpoint, data) {
        return await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    static async put(endpoint, data) {
        return await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    static async delete(endpoint) {
        return await this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Authentication API
class AuthAPI {
    static async login(credentials) {
        return await API.post('/auth/login', credentials);
    }

    static async register(userData) {
        return await API.post('/auth/register', userData);
    }

    static async getProfile() {
        return await API.get('/auth/profile');
    }

    static async updateProfile(profileData) {
        return await API.put('/auth/profile', profileData);
    }
}

// Students API
class StudentsAPI {
    static async getAll(page = 1, limit = 10) {
        return await API.get(`/students?page=${page}&limit=${limit}`);
    }

    static async getById(id) {
        return await API.get(`/students/${id}`);
    }

    static async create(studentData) {
        return await API.post('/students', studentData);
    }

    static async update(id, studentData) {
        return await API.put(`/students/${id}`, studentData);
    }

    static async delete(id) {
        return await API.delete(`/students/${id}`);
    }

    static async enrollInCourse(studentId, courseId) {
        return await API.post(`/students/${studentId}/enroll/${courseId}`);
    }

    static async unenrollFromCourse(studentId, courseId) {
        return await API.delete(`/students/${studentId}/unenroll/${courseId}`);
    }
}

// Courses API
class CoursesAPI {
    static async getAll(page = 1, limit = 10) {
        return await API.get(`/courses?page=${page}&limit=${limit}`);
    }

    static async getById(id) {
        return await API.get(`/courses/${id}`);
    }

    static async create(courseData) {
        return await API.post('/courses', courseData);
    }

    static async update(id, courseData) {
        return await API.put(`/courses/${id}`, courseData);
    }

    static async delete(id) {
        return await API.delete(`/courses/${id}`);
    }

    static async getByFaculty(facultyId) {
        return await API.get(`/courses/faculty/${facultyId}`);
    }
}

// Grades API
class GradesAPI {
    static async getAll(page = 1, limit = 10) {
        return await API.get(`/grades?page=${page}&limit=${limit}`);
    }

    static async getByStudent(studentId) {
        return await API.get(`/grades/student/${studentId}`);
    }

    static async getByCourse(courseId) {
        return await API.get(`/grades/course/${courseId}`);
    }

    static async createOrUpdate(gradeData) {
        return await API.post('/grades', gradeData);
    }

    static async delete(id) {
        return await API.delete(`/grades/${id}`);
    }
}

// Attendance API
class AttendanceAPI {
    static async getAll(page = 1, limit = 10) {
        return await API.get(`/attendance?page=${page}&limit=${limit}`);
    }

    static async getByStudent(studentId, courseId = null) {
        const url = courseId 
            ? `/attendance/student/${studentId}?courseId=${courseId}`
            : `/attendance/student/${studentId}`;
        return await API.get(url);
    }

    static async getByCourse(courseId, date = null) {
        const url = date 
            ? `/attendance/course/${courseId}?date=${date}`
            : `/attendance/course/${courseId}`;
        return await API.get(url);
    }

    static async getByDate(date) {
        return await API.get(`/attendance/date/${date}`);
    }

    static async mark(attendanceData) {
        return await API.post('/attendance', attendanceData);
    }

    static async update(id, attendanceData) {
        return await API.put(`/attendance/${id}`, attendanceData);
    }

    static async delete(id) {
        return await API.delete(`/attendance/${id}`);
    }
}

// Announcements API
class AnnouncementsAPI {
    static async getAll(page = 1, limit = 10, filters = {}) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters
        });
        return await API.get(`/announcements?${queryParams}`);
    }

    static async getById(id) {
        return await API.get(`/announcements/${id}`);
    }

    static async getByCourse(courseId) {
        return await API.get(`/announcements/course/${courseId}`);
    }

    static async create(announcementData) {
        return await API.post('/announcements', announcementData);
    }

    static async update(id, announcementData) {
        return await API.put(`/announcements/${id}`, announcementData);
    }

    static async delete(id) {
        return await API.delete(`/announcements/${id}`);
    }
}

// Export API classes for use in other files
window.API = API;
window.AuthAPI = AuthAPI;
window.StudentsAPI = StudentsAPI;
window.CoursesAPI = CoursesAPI;
window.GradesAPI = GradesAPI;
window.AttendanceAPI = AttendanceAPI;
window.AnnouncementsAPI = AnnouncementsAPI; 