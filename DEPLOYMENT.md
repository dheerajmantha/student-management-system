# 🚀 Deployment Guide

## 🌐 Vercel Deployment (Recommended)

This project is optimized for Vercel with zero-configuration deployment.

### Step 1: Push to GitHub

Your code is already pushed to: `https://github.com/dheerajmantha/student-management-system`

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Import Project:**
   - Click "New Project"
   - Import `dheerajmantha/student-management-system`
   - Vercel will automatically detect the configuration

4. **Configure (Optional):**
   - Project Name: `student-management-system`
   - Framework Preset: Other
   - Root Directory: `./` (default)

5. **Environment Variables:**
   In Vercel Dashboard → Settings → Environment Variables, add:
   ```
   NODE_ENV=production
   JWT_SECRET=your_secure_jwt_secret_here_make_it_long_and_random
   ```

6. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-app-name.vercel.app`

### ✅ What's Included:

- **✅ `vercel.json`** - Automatic configuration
- **✅ API Routes** - `/api/*` → backend serverless functions
- **✅ Static Hosting** - Frontend served from root
- **✅ Environment Detection** - API URLs adapt automatically
- **✅ Database** - SQLite works out-of-the-box on Vercel

### 🔧 Vercel Configuration Explained:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

This configuration:
- Builds the backend as Node.js serverless functions
- Serves frontend as static files
- Routes API calls to `/api/*` to the backend
- Routes everything else to frontend files

---

## 🛠️ Alternative Deployment Options

### Railway

1. **Connect GitHub repository**
2. **Set environment variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=your_secret_key
   ```
3. **Deploy** - Railway will auto-detect Node.js

### Heroku

1. **Create Heroku app**
2. **Connect GitHub repository**
3. **Add buildpack:** `heroku/nodejs`
4. **Set environment variables**
5. **Deploy**

### Netlify

1. **Connect GitHub repository**
2. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `frontend`
3. **Environment variables:**
   ```
   NODE_ENV=production
   ```

---

## 📱 Testing Your Deployment

### 1. Frontend Access
- Visit: `https://your-app-name.vercel.app`
- Should show the login page

### 2. API Testing
- Test: `https://your-app-name.vercel.app/api/`
- Should return: `{"message":"Student Management System API"}`

### 3. Registration/Login
- Create a new account with:
  - Username: `testuser123`
  - Email: `test@example.com`
  - Password: `Test123456`
  - Role: `Student`

### 4. Default Accounts
Use the pre-seeded accounts:
- **Admin:** admin@school.com / admin123
- **Faculty:** faculty@school.com / faculty123

---

## 🔐 Security Notes

### Production Environment Variables

For production, set these in your deployment platform:

```env
NODE_ENV=production
JWT_SECRET=use_a_very_long_random_string_here_at_least_64_characters_long
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Database Security

- SQLite is suitable for small-medium applications
- For larger applications, consider PostgreSQL
- Backup your database regularly
- Use environment variables for sensitive data

---

## 🐛 Troubleshooting

### Common Issues:

1. **API calls failing:**
   - Check API URL configuration in `frontend/js/api.js`
   - Ensure backend is deploying correctly

2. **Database errors:**
   - Check Vercel function logs
   - Ensure database initialization completed

3. **Frontend not loading:**
   - Check static file routing in `vercel.json`
   - Verify file paths are correct

### Debug Steps:

1. **Check deployment logs** in Vercel dashboard
2. **Test API endpoints** individually
3. **Check browser console** for JavaScript errors
4. **Verify environment variables** are set correctly

---

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and usage

### Error Tracking
- Consider adding Sentry for error tracking
- Monitor API response times

---

## 🔄 Continuous Deployment

Your repository is set up for automatic deployment:

1. **Push to main branch** → Triggers deployment
2. **Pull requests** → Creates preview deployments
3. **Automatic builds** on every commit

### Workflow:
```bash
git add .
git commit -m "Your changes"
git push origin main
# → Automatic deployment to Vercel
```

This ensures your live app is always up-to-date with your latest code! 