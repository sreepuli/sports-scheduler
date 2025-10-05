# 📅 Sports Scheduler# 📅 Sports Scheduler

A web application for organizing and managing sports sessions. Players can create and join sessions, while admins manage sports and view analytics.A web application for organizing and managing sports sessions. Players can create and join sessions, while admins manage sports and view analytics.

## ✨ Features## ✨ Features

- 🔐 User authentication (JWT)- 🔐 User authentication (JWT)

- ⚽ Create and manage sports (Admin)- � Create and manage sports (Admin)

- 🎮 Create and join sports sessions- 🎮 Create and join sports sessions

- 📊 Analytics and reports (Admin)- 📊 Analytics and reports (Admin)

- 📅 Session management with cancellation- 📅 Session management with cancellation

## 🛠️ Tech Stack## 🛠️ Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router **Frontend:** React 19, Vite, Tailwind CSS, React Router

**Backend:** Node.js, Express, PostgreSQL, Sequelize, JWT**Backend:** Node.js, Express, PostgreSQL, Sequelize, JWT

## 🚀 Quick Start## 🚀 Quick Start

### Backend Setup<<<<<<< HEAD

### Backend Setup

````bash

cd backend```bash

npm installcd backend

# Configure .env with database credentialsnpm install

npm run dev  # Runs on http://localhost:5000# Configure .env with database credentials

```npm run dev  # Runs on http://localhost:5000

````

### Frontend Setup

### Frontend Setup

````bash

cd frontend```bash

npm installcd frontend

npm run dev  # Runs on http://localhost:5173npm install

```npm run dev  # Runs on http://localhost:5173

````

### Database Setup

### Database Setup

```sql=======

CREATE DATABASE sports_scheduler;### Backend

```

- **Node.js + Express.js** - REST API

## 📸 Screenshots- **Sequelize ORM** - Database management

- **PostgreSQL** - Database

![Landing Page](screenshots/landing-page.png)- **bcrypt** - Password hashing

![Player Dashboard](screenshots/player-dashboard.png)- **jsonwebtoken** - JWT authentication

![Admin Dashboard](screenshots/admin-dashboard.png)- **cors** - Cross-origin requests

## 🌐 Live Demo## 📁 Project Structure

**URL:** [your-app-url.com](https://your-app-url.com)```

sportsScheduler/

## 🎥 Video├── backend/

│ ├── config/

[▶️ Watch Demo](https://youtube.com/watch?v=YOUR_VIDEO_ID)│ │ └── database.js # Sequelize configuration

│ ├── middleware/

## 👨‍💻 Author│ │ └── auth.js # JWT authentication middleware

│ ├── models/

**Your Name** │ │ ├── User.js # User model

GitHub: [@yourusername](https://github.com/yourusername)│ │ ├── Sport.js # Sport model

│ │ ├── Session.js # Session model

---│ │ ├── SessionPlayer.js # Session-Player join table

│ │ └── index.js # Model associations

Built with ❤️ for sports enthusiasts!│ ├── routes/

│ │ ├── auth.js # Authentication routes
│ │ ├── sports.js # Sports routes
│ │ ├── sessions.js # Sessions routes
│ │ └── reports.js # Reports routes (admin)
│ ├── server.js # Express server
│ ├── package.json
│ └── .env.example
│
└── frontend/
├── src/
│ ├── components/
│ │ └── ProtectedRoute.jsx
│ ├── context/
│ │ └── AuthContext.jsx
│ ├── pages/
│ │ ├── Login.jsx
│ │ ├── Signup.jsx
│ │ ├── Dashboard.jsx
│ │ ├── Sessions.jsx
│ │ └── Reports.jsx
│ ├── utils/
│ │ └── api.js
│ ├── App.jsx
│ └── main.jsx
├── package.json
└── .env.example

````


>>>>>>> 298eed86a207c679f54812aeb8447f122dcfe48f

```sql
CREATE DATABASE sports_scheduler;
````

## 📸 Screenshots

![Landing Page](screenshots/landing-page.png)
![Dashboard](screenshots/admin-dashboard.png)
![Sessions](screenshots/sessions-page.png)

## 🌐 Live Demo

**URL:** [your-app-url.com](https://your-app-url.com)

## 🎥 Video

[▶️ Watch Demo](https://youtube.com/watch?v=YOUR_VIDEO_ID)

## 👨‍� Author

**Your Name**  
GitHub: [@yourusername](https://github.com/yourusername)

---

<<<<<<< HEAD
Built with ❤️ for sports enthusiasts!
=======

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

> > > > > > > 298eed86a207c679f54812aeb8447f122dcfe48f

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
