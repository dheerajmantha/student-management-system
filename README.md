# 🎓 Student Management System

A comprehensive web-based Student Management System built with Node.js, Express, Sequelize, and vanilla JavaScript. This system provides a complete solution for managing students, courses, grades, attendance, and announcements.

## ✨ Features

### 📊 Dashboard
- Real-time statistics overview
- Recent activities timeline
- Latest announcements
- Quick navigation to all modules

### 👨‍🎓 Student Management
- Add, edit, view, and delete students
- Student profiles with personal information
- Roll number generation and management
- Search and filter capabilities

### 📚 Course Management
- Course creation and management
- Faculty assignment
- Department and semester organization
- Credit hour tracking

### 📝 Grade Management
- Score recording and calculation
- Letter grade assignment
- Multiple assessment types (assignments, quizzes, midterms, finals)
- Grade analytics and reporting

### 📅 Attendance Tracking
- Daily attendance recording
- Multiple status types (Present, Absent, Excused, Late)
- Attendance statistics and reports
- Visual status indicators

### 📢 Announcements
- Priority-based announcement system
- Target audience management
- Validity period controls
- Real-time notifications

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Faculty, Student)
- JWT-based authentication
- Secure password hashing
- Session management

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Sequelize** - ORM for database management
- **SQLite** - Database (for development)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with Bootstrap 5
- **Vanilla JavaScript** - Client-side logic
- **Bootstrap 5** - UI framework
- **Font Awesome** - Icons

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Python (for development server)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/dheerajmantha/student-management-system.git
   cd student-management-system
   ```

2. **Setup Project (One Command Setup)**
   ```bash
   npm run setup
   ```
   This will install backend dependencies and initialize the database with sample data.

3. **Start Backend Server**
   ```bash
   npm run dev
   ```
   The backend will start on `http://localhost:5000`

4. **Start Frontend Server**
   ```bash
   # Open a new terminal
   cd frontend
   python -m http.server 3000
   ```
   The frontend will be available at `http://localhost:3000`

5. **Access the Application**
   Open your browser and go to `http://localhost:3000/frontend/`

### Alternative Setup (Manual)

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Initialize Database**
   ```bash
   npm run init-db
   ```

## 🔑 Default Login Credentials

After initializing the database, you can log in with these accounts:

### Admin Account
- **Email:** admin@school.com
- **Password:** admin123
- **Role:** Administrator (Full access)

### Faculty Account
- **Email:** faculty@school.com
- **Password:** faculty123
- **Role:** Faculty (Limited access)

## 📁 Project Structure

```
student-management-system/
├── backend/                    # Backend API
│   ├── config/
│   │   └── database.js        # Database configuration
│   │   └── env.js             # Environment variables
│   ├── controllers/           # API controllers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── courseController.js
│   │   ├── gradeController.js
│   │   ├── attendanceController.js
│   │   └── announcementController.js
│   ├── middleware/            # Authentication middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── scripts/
│   │   └── initDatabase.js   # Database initialization
│   ├── package.json
│   └── server.js            # Main server file
├── frontend/                 # Frontend application
│   ├── css/
│   │   └── style.css        # Custom styles
│   ├── js/
│   │   ├── api.js           # API communication
│   │   ├── auth.js          # Authentication
│   │   ├── dashboard.js     # Dashboard functionality
│   │   ├── students.js      # Student management
│   │   ├── courses.js       # Course management
│   │   ├── grades.js        # Grade management
│   │   ├── attendance.js    # Attendance tracking
│   │   ├── announcements.js # Announcement management
│   │   └── utils.js         # Utility functions
│   ├── index.html           # Login page
│   └── dashboard.html       # Main application
└── README.md
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Grades
- `GET /api/grades` - Get all grades
- `POST /api/grades` - Create new grade
- `GET /api/grades/student/:id` - Get grades by student
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

### Attendance
- `GET /api/attendance` - Get all attendance records
- `POST /api/attendance` - Create attendance record
- `GET /api/attendance/student/:id` - Get attendance by student
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `GET /api/announcements/:id` - Get announcement by ID
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

## 📊 Sample Data

The system comes pre-loaded with:
- 5 sample students
- 3 sample courses
- 15 grade records
- 30 days of attendance data
- 3 sample announcements

## 🔧 Configuration

### Database
- **Development:** SQLite (file-based)
- **Production:** PostgreSQL (configurable via environment variables)

### Environment Variables
Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_management
DB_USER=postgres
DB_PASSWORD=password
```

## 🚀 Deployment

### 🌐 Deploy to Vercel (Recommended)

This project is optimized for Vercel deployment with automatic configuration:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository: `https://github.com/dheerajmantha/student-management-system`
   - Vercel will automatically detect the configuration
   - Click "Deploy"

3. **Environment Variables (Optional):**
   Set these in Vercel dashboard → Settings → Environment Variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Access your deployed app:**
   - Your app will be available at `https://your-app-name.vercel.app`
   - API endpoints at `https://your-app-name.vercel.app/api/*`

### ✅ Vercel Configuration Included:
- **✅ `vercel.json`** - Automatic routing configuration
- **✅ API Routes** - `/api/*` automatically routed to backend
- **✅ Static Files** - Frontend served from root
- **✅ Environment Detection** - API URLs adapt automatically
- **✅ Node.js Functions** - Backend runs as serverless functions

### Alternative Deployment Options

#### Backend Deployment
1. Set environment variables for production
2. Use PostgreSQL for production database
3. Build and deploy to your preferred platform (Heroku, Railway, AWS, etc.)

#### Frontend Deployment
1. Build the frontend assets
2. Deploy to static hosting (Netlify, GitHub Pages)
3. Update API endpoints in the frontend configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Commit your changes
6. Push to the branch
7. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the console for error messages
2. Verify that both backend and frontend servers are running
3. Ensure the database is properly initialized
4. Check network connectivity between frontend and backend

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] File upload for student photos
- [ ] Advanced reporting and analytics
- [ ] Mobile responsive design improvements
- [ ] Real-time notifications with WebSockets
- [ ] Bulk operations for students and grades
- [ ] Parent portal access
- [ ] Fee management system
- [ ] Timetable management
- [ ] Library management integration

---

**Happy Learning! 🎓** 