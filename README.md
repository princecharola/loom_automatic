# Loom Automation Full-Stack Application

A full-stack loom automation dashboard with JWT auth, machine CRUD, real-time Socket.io updates, animated React UI, and MongoDB persistence.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- Backend: Node.js + Express + Mongoose + Socket.io
- Database: MongoDB Atlas/local MongoDB
- Auth: JWT (signup/login)

## Folder Structure

```text
.
├── backend
│   ├── package.json
│   └── src
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       │   ├── authController.js
│       │   └── machineController.js
│       ├── middleware/
│       │   ├── auth.js
│       │   └── errorHandler.js
│       ├── models/
│       │   ├── Alert.js
│       │   ├── Machine.js
│       │   └── User.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── machineRoutes.js
│       └── services/
│           ├── alertService.js
│           └── dummyGenerator.js
├── frontend
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── src
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components/
│       ├── context/
│       ├── layouts/
│       ├── pages/
│       └── services/
├── mobile
└── simulator
```

## Backend `.env` Example (`backend/.env`)

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/loom_monitoring
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=super-secret-jwt
TEMPERATURE_THRESHOLD=90
ENABLE_DUMMY_GENERATOR=true
DUMMY_INTERVAL_MS=5000
```

## Frontend `.env` Example (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

## Feature Checklist

### Authentication
- Signup/Login with JWT token issuance.
- Protected backend machine APIs.
- Protected frontend dashboard route.

### Dashboard
- Real-time machine cards with ON/OFF status, speed, and temperature.
- Live summary tiles (total/on/off/avg temperature).
- Sidebar layout and responsive dashboard.

### Machine Management
- Add machine
- Edit machine
- Delete machine

### Alerts
- Auto-generate alert if machine temperature > threshold.
- Auto-generate alert if machine status turns OFF.
- Persist alerts in MongoDB.
- Render animated alert feed on dashboard.

### Animations
- Route fade transitions.
- Card hover animations.
- Alert popup/list animations.

### Real-Time
- Socket.io events: `machine:update`, `machine:delete`, `alert:new`.

### Bonus
- Dummy generator service updates machines on interval when enabled.

## API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Machines (JWT required)
- `GET /api/machines`
- `POST /api/machines`
- `PUT /api/machines/:id`
- `DELETE /api/machines/:id`
- `GET /api/machines/summary`
- `GET /api/machines/alerts/list`

## Step-by-Step Run Guide

1. **Start MongoDB** (Atlas or local).
2. **Backend setup**
   - `cd backend`
   - `npm install`
   - add `.env`
   - `npm run dev`
3. **Frontend setup**
   - `cd frontend`
   - `npm install`
   - add `.env`
   - `npm run dev`
4. Open `http://localhost:5173`, signup, and manage machines.

## Notes
- If Android emulator/mobile app is used, ensure backend host mapping is reachable (`10.0.2.2` for emulator).
- If package install fails in restricted environments, run the same commands on your local machine with npm registry access.
