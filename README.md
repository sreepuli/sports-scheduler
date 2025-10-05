# 📅 Sports Scheduler - Full Stack Application

A comprehensive web application for organizing and managing sports sessions, built with React, Express.js, PostgreSQL, and Sequelize ORM.

## 🎯 Overview

Sports Scheduler helps players and administrators organize sports sessions efficiently. Players can create and join sessions, while administrators can manage sports and view detailed reports.

## ✨ Features

### For Players

- 🔐 User authentication (signup/login with JWT)
- 🎮 Create sports sessions with venue and date/time
- 👥 Join available sports sessions
- 📋 View created and joined sessions
- ❌ Cancel own sessions with reason

### For Administrators

- 🏆 Create and manage sports
- 📊 View detailed reports on sessions
- 📈 Analyze popular sports
- 📅 Filter reports by date range
- 💾 Export reports as JSON/CSV

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP requests
- **Tailwind CSS** - Styling
- **Context API** - State management

### Backend

- **Node.js + Express.js** - REST API
- **Sequelize ORM** - Database management
- **PostgreSQL** - Database
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin requests

## 📁 Project Structure

```
sportsScheduler/
├── backend/
│   ├── config/
│   │   └── database.js         # Sequelize configuration
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Sport.js            # Sport model
│   │   ├── Session.js          # Session model
│   │   ├── SessionPlayer.js    # Session-Player join table
│   │   └── index.js            # Model associations
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── sports.js           # Sports routes
│   │   ├── sessions.js         # Sessions routes
│   │   └── reports.js          # Reports routes (admin)
│   ├── server.js               # Express server
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Sessions.jsx
    │   │   └── Reports.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd sportsScheduler
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sports_scheduler
# DB_USER=your_postgres_username
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your-super-secret-jwt-key
# PORT=5000

# Create PostgreSQL database
psql -U postgres
CREATE DATABASE sports_scheduler;
\q

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer

# Create .env file
cp .env.example .env

# Edit .env with your backend URL
# VITE_API_URL=http://localhost:5000

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📡 API Endpoints

### Authentication

| Method | Endpoint       | Description       | Auth |
| ------ | -------------- | ----------------- | ---- |
| POST   | `/auth/signup` | Register new user | ❌   |
| POST   | `/auth/login`  | Login user        | ❌   |
| GET    | `/auth/me`     | Get current user  | ✅   |

### Sports

| Method | Endpoint  | Description      | Auth | Role  |
| ------ | --------- | ---------------- | ---- | ----- |
| POST   | `/sports` | Create new sport | ✅   | Admin |
| GET    | `/sports` | List all sports  | ✅   | All   |

### Sessions

| Method | Endpoint               | Description                  | Auth |
| ------ | ---------------------- | ---------------------------- | ---- |
| POST   | `/sessions`            | Create new session           | ✅   |
| GET    | `/sessions`            | List all sessions            | ✅   |
| GET    | `/sessions/my`         | List user's created sessions | ✅   |
| GET    | `/sessions/joined`     | List user's joined sessions  | ✅   |
| POST   | `/sessions/:id/join`   | Join a session               | ✅   |
| PUT    | `/sessions/:id/cancel` | Cancel session               | ✅   |

### Reports (Admin Only)

| Method | Endpoint                                      | Description                 | Auth | Role  |
| ------ | --------------------------------------------- | --------------------------- | ---- | ----- |
| GET    | `/reports/sessions?startDate=&endDate=`       | Session count in date range | ✅   | Admin |
| GET    | `/reports/popular-sports?startDate=&endDate=` | Most popular sports         | ✅   | Admin |

## 🗄️ Database Schema

### User

- id (UUID, PK)
- name (String)
- email (String, Unique)
- password (String, Hashed)
- role (ENUM: 'admin', 'player')

### Sport

- id (UUID, PK)
- name (String)
- createdBy (UUID, FK → User)

### Session

- id (UUID, PK)
- sportId (UUID, FK → Sport)
- createdBy (UUID, FK → User)
- date (DateTime)
- venue (String)
- status (ENUM: 'active', 'cancelled')
- reason (String, nullable)

### SessionPlayer (Join Table)

- id (UUID, PK)
- sessionId (UUID, FK → Session)
- userId (UUID, FK → User)
- status (ENUM: 'joined', 'cancelled')

## 🔐 Authentication Flow

1. User signs up → Password hashed with bcrypt
2. User logs in → Server returns JWT token
3. Frontend stores token in localStorage
4. All subsequent requests include token in Authorization header
5. Backend middleware verifies token before accessing protected routes

## 🎨 Features Walkthrough

### Player Flow

1. Sign up as a player
2. Browse available sports on dashboard
3. Create a new session (select sport, date, venue)
4. Browse all available sessions
5. Join sessions created by others
6. View your created and joined sessions

### Admin Flow

1. Sign up as an admin
2. Create new sports (Cricket, Football, etc.)
3. Create and manage sessions like players
4. Access reports page
5. Select date range and generate reports
6. View session statistics and popular sports
7. Export reports as JSON or CSV

## 🚢 Deployment

### Backend (Render/Railway/Heroku)

1. Create PostgreSQL database addon
2. Set environment variables (DB credentials, JWT_SECRET)
3. Deploy backend
4. Note down the deployed URL

### Frontend (Vercel/Netlify)

1. Set `VITE_API_URL` to your backend URL
2. Deploy frontend
3. Access your app!

## 🔮 Future Enhancements

- 🔑 Password reset feature
- 📧 Email notifications for session invites/cancellations
- 🚫 Prevent double-booking at same time
- 💬 Real-time updates with WebSockets
- 📱 Mobile app version
- 🌐 Multi-language support
- 📸 User profile pictures
- ⭐ Session ratings and reviews

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## � Screenshots

### Landing Page

![Landing Page](screenshots/landing-page.png)
_Beautiful hero section with call-to-action buttons_

### Dashboard - Player View

![Player Dashboard](screenshots/player-dashboard.png)
_Clean dashboard showing available sports and upcoming sessions_

### Dashboard - Admin View

![Admin Dashboard](screenshots/admin-dashboard.png)
_Admin panel with sports management, analytics, and session monitoring_

### Sessions Page

![Sessions Page](screenshots/sessions-page.png)
_Browse and join available sports sessions_

### Reports Page (Admin)

![Reports Page](screenshots/reports-page.png)
_Detailed analytics and session reports with date range filtering_

## 🌐 Live Application

**Try it out:** [https://your-app-url.com](https://your-app-url.com)

Test accounts:

- **Admin**: admin@test.com / password123
- **Player**: player@test.com / password123

## 🎥 Video Demo

Watch the full walkthrough of the application:

[![Sports Scheduler Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

**[▶️ Watch on YouTube](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)** | **[▶️ Watch on Loom](https://www.loom.com/share/YOUR_VIDEO_ID)**

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

Built with ❤️ for sports enthusiasts everywhere!

---

**Happy Scheduling! 🎉**
