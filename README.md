# TeamUp — Student Project Collaboration Platform

Find Your Team. Build Something Great.

---

## 1. Project Overview

TeamUp is a full-stack student project collaboration platform designed for university students, developers, designers, machine learning enthusiasts, and hackathon competitors. It addresses the common challenge of discovering viable project ideas, finding teammates with complementary technical proficiencies, managing join requests, and coordinating project capacity across academic courses and competitions.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 (SPA Architecture)
- **Tooling & Bundler:** Vite
- **Routing:** React Router DOM (v7)
- **Styling:** CSS3 Design System (Dark Navy & Charcoal theme, CSS Custom Properties, responsive design, zero emojis)
- **Icons:** Lucide React
- **HTTP Client:** Axios (with centralized interceptors and credential management)
- **Analytics Visualizations:** Recharts

### Backend
- **Runtime & Framework:** Node.js (v22+) & Express.js
- **Architecture:** RESTful API with structured Layered Architecture (Routes, Controllers, Services, Middleware, Validators, Config)
- **Database Client:** `mysql2/promise` with Connection Pooling
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
- **Security Headers & Protection:** Helmet, CORS, and Express Rate Limiters
- **Environment Management:** Dotenv

### Database
- **Engine:** MySQL 8.0+
- **Storage Engine:** InnoDB (ACID compliant with Foreign Key constraints and Row-Level Locking)

---

## 3. Architecture & Project Structure

```
TeamUp/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |   |-- db.js               # MySQL2 connection pooling & ping verification
|   |   |   |-- env.js              # Environment variable validation & exports
|   |   |-- controllers/
|   |   |   |-- authController.js   # Register, login, logout, getMe
|   |   |   |-- userController.js   # Profiles and user skill management
|   |   |   |-- projectController.js# Discovery, project CRUD, dashboard
|   |   |   |-- requestController.js# Join requests, status transitions
|   |   |   |-- teamController.js   # Member roster & member removal
|   |   |   |-- notificationController.js # Read/unread notifications
|   |   |-- middleware/
|   |   |   |-- authMiddleware.js   # JWT authentication & optional auth
|   |   |   |-- errorMiddleware.js  # Centralized error handler & 404 handler
|   |   |   |-- rateLimiter.js      # Endpoint-specific rate limiters
|   |   |   |-- validationMiddleware.js # Schema validation wrapper
|   |   |-- routes/
|   |   |   |-- authRoutes.js
|   |   |   |-- userRoutes.js
|   |   |   |-- projectRoutes.js
|   |   |   |-- requestRoutes.js
|   |   |   |-- notificationRoutes.js
|   |   |   |-- healthRoutes.js
|   |   |-- services/
|   |   |   |-- authService.js
|   |   |   |-- userService.js
|   |   |   |-- projectService.js
|   |   |   |-- requestService.js
|   |   |   |-- teamService.js
|   |   |   |-- notificationService.js
|   |   |-- utils/
|   |   |   |-- apiResponse.js      # Structured success & error formatting
|   |   |   |-- constants.js        # Categories, statuses, types
|   |   |   |-- jwt.js              # Token signing, verification & cookies
|   |   |   |-- logger.js           # Structured logging utility
|   |   |-- validators/
|   |   |   |-- authValidator.js
|   |   |   |-- projectValidator.js
|   |   |   |-- requestValidator.js
|   |   |   |-- userValidator.js
|   |   |-- app.js                  # Express app setup and middleware chain
|   |   |-- server.js               # Server bootstrap and graceful shutdown
|   |-- tests/
|   |   |-- run-tests.js            # 37-point integration test suite
|   |-- .env.example
|   |-- package.json
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   |-- common/
|   |   |   |   |-- ConfirmationDialog.jsx
|   |   |   |   |-- EmptyState.jsx
|   |   |   |   |-- ErrorState.jsx
|   |   |   |   |-- FilterPanel.jsx
|   |   |   |   |-- FormField.jsx
|   |   |   |   |-- LoadingSpinner.jsx
|   |   |   |   |-- Modal.jsx
|   |   |   |   |-- NotificationPanel.jsx
|   |   |   |   |-- ProtectedRoute.jsx
|   |   |   |   |-- SearchBar.jsx
|   |   |   |   |-- SkeletonLoader.jsx
|   |   |   |   |-- SkillBadge.jsx
|   |   |   |   |-- UserAvatar.jsx
|   |   |   |-- layout/
|   |   |   |   |-- Navbar.jsx
|   |   |   |   |-- Footer.jsx
|   |   |   |-- projects/
|   |   |   |   |-- ProjectCard.jsx
|   |   |-- context/
|   |   |   |-- AuthContext.jsx
|   |   |   |-- NotificationContext.jsx
|   |   |-- hooks/
|   |   |   |-- useAuth.js
|   |   |   |-- useNotifications.js
|   |   |-- pages/
|   |   |   |-- auth/
|   |   |   |   |-- LoginPage.jsx
|   |   |   |   |-- RegisterPage.jsx
|   |   |   |-- dashboard/
|   |   |   |   |-- DashboardPage.jsx
|   |   |   |-- profile/
|   |   |   |   |-- ProfilePage.jsx
|   |   |   |   |-- UserProfilePage.jsx
|   |   |   |-- projects/
|   |   |   |   |-- CreateProjectPage.jsx
|   |   |   |   |-- MyProjectsPage.jsx
|   |   |   |   |-- ProjectDetailsPage.jsx
|   |   |   |   |-- ProjectsPage.jsx
|   |   |   |-- requests/
|   |   |   |   |-- RequestsPage.jsx
|   |   |-- services/
|   |   |   |-- api.js
|   |   |   |-- authService.js
|   |   |   |-- notificationService.js
|   |   |   |-- projectService.js
|   |   |   |-- requestService.js
|   |   |   |-- userService.js
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- index.css
|   |-- .env.example
|   |-- package.json
|   |-- vite.config.js
|
|-- database/
|   |-- schema.sql                  # Normalized MySQL tables and indexes
|   |-- seed.sql                    # Initial students, skills, and projects
|
|-- .gitignore
|-- README.md
```

---

## 4. Key Business Logic and Rules

1. **Owner Capacity Rule:** The project owner is registered as an active member (`role = 'Owner'`) upon project creation. The desired team size is the total team count including the owner. For example, a team of 4 accommodates the owner plus 3 accepted student applicants.
2. **Capacity Enforcement:** Join request acceptances use database transactions with `SELECT ... FOR UPDATE` locking to ensure concurrent acceptances cannot exceed team capacity.
3. **Owner Protection:** Project owners cannot submit join requests to their own projects.
4. **Duplicate Prevention:** A student cannot submit duplicate pending join requests to the same project.
5. **Authorization Boundaries:** All state modifications (edits, deletions, member removals, request status changes) verify verified session credentials derived on the server, not client-supplied IDs.

---

## 5. Prerequisites

- **Node.js:** v18.0.0 or higher (v22 recommended)
- **npm:** v9.0.0 or higher
- **MySQL:** v8.0 or higher

---

## 6. Installation & Setup Instructions

### Step 1: Database Setup
1. Launch your MySQL server instance.
2. Initialize the schema and seed data using the MySQL command line client or Workbench:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```
This creates the `teamup_db` database and populates sample students, skills, and projects.

### Step 2: Backend Configuration
1. Navigate to the backend directory:
```bash
cd backend
```
2. Copy the example environment configuration:
```bash
cp .env.example .env
```
3. Update `.env` with your MySQL database credentials and a secure JWT secret:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YourLocalPassword
DB_NAME=teamup_db
DB_CONNECTION_LIMIT=10
JWT_SECRET=your_secure_jwt_secret_key_at_least_32_characters
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```
4. Install backend dependencies:
```bash
npm install
```

### Step 3: Frontend Configuration
1. Navigate to the frontend directory:
```bash
cd ../frontend
```
2. Copy the example environment configuration:
```bash
cp .env.example .env
```
3. Verify the `VITE_API_URL` setting:
```env
VITE_API_URL=http://localhost:5000/api
```
4. Install frontend dependencies:
```bash
npm install --legacy-peer-deps
```

---

## 7. Running the Application

### Start the Backend Server
```bash
cd backend
npm start
# Server listens on http://localhost:5000
```

### Start the Frontend Development Server
```bash
cd frontend
npm run dev
# Vite runs at http://localhost:5173
```

---

## 8. Test Accounts (Seed Data)

All seed accounts share the development password: `Password123!`

| Student Name | Email | University | Department | Role |
| :--- | :--- | :--- | :--- | :--- |
| Rahim Ahmed | rahim.ahmed@example.edu | BUET | Computer Science and Engineering | Lead (CampusRide) |
| Fatima Zaman | fatima.zaman@example.edu | Dhaka University | Computer Science | Lead (AgroSense) |
| Tanvir Hasan | tanvir.hasan@example.edu | NSU | Electrical and Computer Engineering | Lead (UniBookSwap) |
| Anika Tabassum | anika.tabassum@example.edu | BRAC University | Computer Science | Lead (ShieldAudit) |
| Siam Chowdhury | siam.chowdhury@example.edu | IUT | Software Engineering | Member (UniBookSwap) |

---

## 9. Automated Testing

The backend includes an automated test runner testing 37 end-to-end integration scenarios covering health, authentication, input validation, unauthorized access rejections, capacity constraints, transactional row-locking, and notifications.

Run the test suite:
```bash
cd backend
npm test
```

Expected result:
```
--- STARTING TEAMUP BACKEND TEST SUITE ---
...
--- TEST SUITE COMPLETE ---
Total: 37 | Passed: 37 | Failed: 0
```

To verify the production frontend build:
```bash
cd frontend
npm run build
```

---

## 10. API Documentation Reference

All API responses follow the uniform JSON structure:
- **Success:** `{ "success": true, "message": "...", "data": { ... } }`
- **Error:** `{ "success": false, "message": "...", "errors": [ ... ] }`

### Authentication Endpoints
- `POST /api/auth/register` — Create a new student account
- `POST /api/auth/login` — Authenticate and receive session cookie/token
- `POST /api/auth/logout` — Terminate session and clear cookies
- `GET /api/auth/me` — Verify active session and retrieve authenticated user

### User & Profile Endpoints
- `GET /api/users/me` — Retrieve full profile with skills and memberships
- `PATCH /api/users/me` — Update bio, university, department, URLs
- `PUT /api/users/me/skills` — Synchronize student skills array
- `GET /api/users/skills/all` — Retrieve platform master skills directory
- `GET /api/users/:id` — Retrieve public student profile

### Project Endpoints
- `GET /api/projects` — Search, filter by category/skill/status, paginate projects
- `POST /api/projects` — Create new project (Owner registered as initial member)
- `GET /api/projects/dashboard` — Retrieve personalized dashboard analytics
- `GET /api/projects/my` — Retrieve projects created by current user
- `GET /api/projects/:id` — Detailed project view with capacity and roster
- `PATCH /api/projects/:id` — Update project metadata (Owner only)
- `DELETE /api/projects/:id` — Delete project and cascade records (Owner only)

### Join Request Endpoints
- `POST /api/projects/:id/requests` — Submit join request with custom message
- `GET /api/requests/sent` — View applications submitted to other teams
- `GET /api/requests/received` — View applicant submissions for owned projects
- `PATCH /api/requests/:id/status` — Accept or reject (owner) or withdraw (applicant)
- `DELETE /api/requests/:id` — Delete applicant request

### Team & Notifications Endpoints
- `GET /api/projects/:id/members` — View active team member roster
- `DELETE /api/projects/:id/members/:userId` — Remove team member (Owner only)
- `GET /api/notifications` — Fetch user notifications with unread count
- `PATCH /api/notifications/:id/read` — Mark single notification as read
- `PATCH /api/notifications/read-all` — Mark all user notifications as read
- `GET /api/health` — Application health check and database ping

---

## 11. Security Implementations

- **Password Security:** Salted hashes generated using bcryptjs with 10 salt rounds.
- **Session Protection:** HttpOnly, SameSite cookies with fallback Bearer token authentication.
- **Data Protection:** Sanitized SQL parameters preventing SQL injection.
- **Input Validation:** Strict type and length boundary checks on all endpoints.
- **Rate Limiting:** Dedicated rate limiting windows for authentication attempts (30 req/15 min) and general API operations (500 req/15 min).
- **Security Headers:** Helmet integration adding Content-Security-Policy, HSTS, and X-Content-Type-Options headers.

---

## 12. Deployment Guidelines

### Frontend (e.g. Vercel)
1. Link your Git repository on Vercel.
2. Set Framework Preset to `Vite`.
3. Set the Root Directory to `frontend`.
4. Configure the environment variable:
   - `VITE_API_URL` = `https://your-production-backend-domain.com/api`
5. Deploy.

### Backend (e.g. Render / Railway / DigitalOcean)
1. Deploy the `backend` folder.
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Configure production environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (Pointing to your managed MySQL instance)
   - `JWT_SECRET` (Secure random string)
   - `FRONTEND_URL` = `https://your-frontend-deployment.vercel.app`

---

## 13. Known Limitations & Roadmap

- **Team Chat:** Real-time messaging is intentionally excluded from the initial MVP to keep core collaboration, capacity management, and team discovery stable.
- **File Uploads:** Project avatars and attachments currently utilize URL links rather than cloud object storage (S3/Cloudinary).

---

## 14. License

This project is licensed under the MIT License.

