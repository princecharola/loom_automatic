# Loom Automation Application (Full-Stack)

A complete loom monitoring and automation system with authentication, machine CRUD, alerts, real-time updates, and animated dashboard UI.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Socket.io client
- **Backend**: Node.js + Express + Socket.io
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (signup/login/protected routes)

## Folder Structure

```text
.
├── backend
│   ├── .env.example
│   ├── package.json
│   └── src
│       ├── app.js
│       ├── server.js
│       ├── config
│       │   ├── db.js
│       │   └── socket.js
│       ├── controllers
│       │   ├── authController.js
│       │   └── machineController.js
│       ├── middleware
│       │   ├── authMiddleware.js
│       │   └── errorHandler.js
│       ├── models
│       │   ├── Alert.js
│       │   ├── Machine.js
│       │   └── User.js
│       ├── routes
│       │   ├── authRoutes.js
│       │   └── machineRoutes.js
│       ├── services
│       │   ├── alertService.js
│       │   └── simulationService.js
│       └── utils
│           └── token.js
├── frontend
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components
│       │   ├── AlertToast.jsx
│       │   ├── LoadingSkeleton.jsx
│       │   ├── MachineCard.jsx
│       │   ├── MachineFormModal.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context
│       │   └── AuthContext.jsx
│       ├── layouts
│       │   └── DashboardLayout.jsx
│       ├── pages
│       │   ├── AlertsPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── LoginPage.jsx
│       │   └── SignupPage.jsx
│       └── services
│           ├── api.js
│           └── socket.js
└── simulator
    ├── index.js
    └── package.json
```

## Features Implemented

1. **Authentication**
   - Signup / Login / Logout
   - JWT token generation and validation
   - Protected backend APIs and frontend routes

2. **Dashboard**
   - Machine list cards
   - Live status: `ON/OFF/ERROR`, speed, temperature
   - Real-time machine and alert updates with Socket.io

3. **Machine Management**
   - Add machine
   - Edit machine
   - Delete machine

4. **Alerts System**
   - Alert when machine temperature exceeds threshold
   - Alert when machine status is `OFF`
   - Alerts stored in MongoDB and emitted to UI

5. **Animations (Framer Motion)**
   - Page transitions
   - Card hover effects
   - Animated alert toasts
   - Loading skeleton animation

6. **Bonus: Dummy Data Generator**
   - `simulator/` script logs in (or signs up) demo user
   - Creates sample machines if needed
   - Updates machines every 5 seconds

---

## Backend Environment Variables (`backend/.env`)

Copy `.env.example` to `.env`:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/loom_automation
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
TEMP_ALERT_THRESHOLD=80
SIMULATION_ENABLED=true
SIMULATION_INTERVAL_MS=5000
```

## Frontend Environment Variables (`frontend/.env`)

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

---

## API Summary (REST)

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Machines (Protected)
- `GET /api/machines`
- `POST /api/machines`
- `PUT /api/machines/:id`
- `DELETE /api/machines/:id`

### Alerts (Protected)
- `GET /api/alerts`

---

## Step-by-Step Setup and Run

### 1) Prerequisites
- Node.js 18+
- npm 9+
- MongoDB local or Atlas

### 2) Clone Project

```bash
git clone <your-repo-url>
cd loom_automatic
```

### 3) Setup Backend

```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB URI and JWT_SECRET
npm install
npm run dev
```

Backend runs at: `http://localhost:4000`

Health check:

```bash
curl http://localhost:4000/health
```

### 4) Setup Frontend

Open a **new terminal**:

```bash
cd loom_automatic/frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 5) Run Dummy Data Generator (Bonus)

Open a **new terminal**:

```bash
cd loom_automatic/simulator
npm install
npm start
```

This script will:
- create or login a demo user
- create default machines if missing
- push machine updates every 5 seconds

### 6) Login and Use App

1. Open `http://localhost:5173`
2. Signup a new account (or login)
3. Add machines, edit values, delete machines
4. Watch live status and alerts update in real time

---

## Real-Time Flow

1. User updates a machine (or simulator sends update).
2. Backend saves machine state in MongoDB.
3. Backend runs alert checks.
4. Backend emits Socket.io events:
   - `machine:created`
   - `machine:updated`
   - `machine:deleted`
   - `alert:created`
5. Frontend receives events and updates UI instantly.

---

## Notes

- `TEMP_ALERT_THRESHOLD` controls high-temperature alerts.
- For production, set a strong `JWT_SECRET` and secure CORS.
- Add pagination for machines/alerts if data grows.
