# IoT Loom Machine Monitoring System

## Architecture Overview

This repository contains a reference architecture for an IoT-based loom machine monitoring platform. The system is designed to ingest telemetry from loom machines, persist time-series machine readings, generate alerts when a machine slows down or stops, and stream updates to web and mobile dashboards in real time.

### Core Requirements Covered
- Machines send `speed` and `status` telemetry.
- Express-based backend API stores and processes data in MongoDB.
- Socket.io pushes real-time updates to frontend and mobile clients.
- Alert engine creates warning and stop alerts and stores them in MongoDB.
- A simulator generates synthetic loom data every 5 seconds.
- React dashboard and React Native app consume live data and alerts.
- ESP32 example shows how to read sensor data and send it to the backend.
- Deployment guidance is included for Render/AWS, MongoDB Atlas, and frontend hosting.

## Monorepo Folder Structure

```text
.
├── README.md
├── backend
│   ├── package.json
│   └── src
│       ├── app.js
│       ├── server.js
│       ├── config
│       │   ├── db.js
│       │   └── socket.js
│       ├── controllers
│       │   └── machineController.js
│       ├── middleware
│       │   └── errorHandler.js
│       ├── models
│       │   ├── Alert.js
│       │   └── MachineReading.js
│       ├── routes
│       │   └── machineRoutes.js
│       └── services
│           └── alertService.js
├── simulator
│   ├── index.js
│   └── package.json
├── frontend
│   ├── package.json
│   └── src
│       ├── App.jsx
│       ├── main.jsx
│       ├── styles.css
│       ├── components
│       │   ├── AlertList.jsx
│       │   ├── SpeedChart.jsx
│       │   └── StatCard.jsx
│       └── services
│           ├── api.js
│           └── socket.js
├── mobile
│   ├── App.js
│   ├── package.json
│   └── src
│       └── services
│           ├── api.js
│           └── socket.js
└── esp32
    └── README.md
```

## Recommended Tech Stack

### Edge / Device Layer
- **ESP32** for sensor data acquisition and Wi-Fi connectivity.
- **Hall effect / proximity / optical sensor** to count loom shaft or roller rotations.
- **Arduino framework** to read pulse counts and calculate speed.
- **HTTP or MQTT** for telemetry transport.

### Backend Layer
- **Node.js + Express** for APIs and ingestion endpoints.
- **Socket.io** for real-time broadcasting to dashboards.
- **MongoDB Atlas** for machine readings and alert persistence.
- **Mongoose** for schema modeling and indexes.
- **node-cron / worker / queue (optional extension)** for periodic health checks and notification pipelines.

### Frontend Layer
- **React + Vite** for a browser dashboard.
- **Recharts** for speed trend charts.
- **Socket.io client** for low-latency live updates.
- **Axios** for REST API calls.

### Mobile Layer
- **React Native / Expo** for operator mobile monitoring.
- **Socket.io client** for live telemetry and alerts.

### Notifications / Operations
- **Email / push provider** such as SendGrid, AWS SES, FCM, or Expo Notifications.
- **Render / AWS Elastic Beanstalk / ECS** for backend deployment.
- **Vercel / Netlify** for web dashboard hosting.

## Data Flow Diagram Explanation

### Logical Flow
1. **Machine sensor capture**: ESP32 reads loom rotation pulses and computes machine speed.
2. **Telemetry submission**: The device sends `{ machineId, speed, status, timestamp }` to the backend API using HTTP POST or publishes to MQTT.
3. **Backend ingestion**: Express validates the request, stores it in MongoDB, and runs alert rules.
4. **Alert evaluation**:
   - `speed === 0` → create `critical` stop alert.
   - `speed < threshold` and `speed > 0` → create `warning` slow-speed alert.
5. **Real-time fan-out**: After saving the reading, Socket.io broadcasts:
   - `machine:reading` for new telemetry.
   - `machine:alert` for newly created alerts.
6. **Dashboard updates**: React and React Native clients subscribe to events and update UI instantly.
7. **Historical access**: Clients also use REST APIs to fetch recent readings and alert history.
8. **Notifications (optional)**: Backend can forward alerts to email, SMS, or push services.

### Text Diagram

```text
[ Loom Machine + Sensor ]
           |
           v
[ ESP32 / Edge Device ]
  - reads pulses
  - computes speed
  - determines status
           |
           | HTTP POST / MQTT publish
           v
[ Express API + Socket.io Server ]
  - validate payload
  - save reading in MongoDB
  - evaluate alerts
  - emit live events
           |
   -----------------------------
   |                           |
   v                           v
[ MongoDB Atlas ]        [ WebSocket Clients ]
  - readings                - React dashboard
  - alerts                  - React Native app
                               - operator screens
```

## Backend API Design

### Machine Data Ingestion
- `POST /api/machines/data`
- Payload:

```json
{
  "machineId": "loom-01",
  "speed": 128,
  "status": "running",
  "timestamp": "2026-03-23T10:00:00.000Z"
}
```

### REST APIs
- `GET /api/machines/readings` → latest readings with filters.
- `GET /api/machines/:machineId/readings` → machine-specific history.
- `GET /api/machines/alerts` → alert history.
- `GET /api/machines/summary` → recent machine snapshot summary.

## MongoDB Schema Design

### `MachineReading`
- `machineId`: string, required.
- `speed`: number, required, minimum `0`.
- `status`: enum: `running`, `stopped`, `error`.
- `timestamp`: date, required.
- `receivedAt`: server-side timestamp.

### `Alert`
- `machineId`: string, required.
- `type`: enum: `warning`, `critical`, `error`.
- `message`: string, required.
- `speed`: number.
- `threshold`: number.
- `status`: enum: `open`, `acknowledged`, `resolved`.
- `createdAt`: date.

### Recommended Indexing
- `MachineReading: { machineId: 1, timestamp: -1 }`
  - Optimizes per-machine time-series queries.
- `MachineReading: { status: 1, timestamp: -1 }`
  - Helps dashboards filter by status.
- `MachineReading: { timestamp: -1 }`
  - Supports global recent-reading views.
- `Alert: { machineId: 1, createdAt: -1 }`
  - Speeds machine alert history retrieval.
- `Alert: { status: 1, type: 1, createdAt: -1 }`
  - Helps active-alert dashboards and escalation workflows.

## Real-Time Updates with Socket.io

### Flow
1. Frontend/mobile client connects to the Socket.io server.
2. On each POSTed machine reading, the backend stores the reading.
3. The backend emits `machine:reading` with the saved payload.
4. Alert rules run.
5. If an alert is generated, the backend stores it and emits `machine:alert`.
6. Multiple clients can subscribe simultaneously and all receive the same live update.

### Socket Events
- `machine:reading` → new machine telemetry.
- `machine:alert` → new alert event.
- `machine:subscribed` → optional room subscription acknowledgement.

## Alert Rules
- **Stopped**: `speed === 0` → generate critical alert and set status to `stopped`.
- **Slow**: `0 < speed < SPEED_WARNING_THRESHOLD` → generate warning alert.
- **Error**: explicit device error or malformed sensor state can map to `error`.

## Deployment Guide

### Backend Deployment
#### Render
1. Create a new Web Service pointing to `backend`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Set environment variables:
   - `PORT`
   - `MONGODB_URI`
   - `CLIENT_ORIGIN`
   - `SPEED_WARNING_THRESHOLD`
   - `NOTIFICATION_EMAIL_TO` (optional)

#### AWS Options
- **Elastic Beanstalk** for a simple Node deployment.
- **ECS/Fargate** for containerized production scaling.
- **API Gateway + Lambda** if redesigning the ingestion API as serverless.

### Database Hosting
- Use **MongoDB Atlas** with IP allow-list and database users.
- Enable backups and monitoring.
- Create separate databases for development and production.

### Frontend Hosting
- **Vercel** or **Netlify** for the React dashboard.
- Set `VITE_API_URL` and `VITE_SOCKET_URL` to the backend endpoint.

### Mobile Distribution
- Use **Expo EAS** or standard React Native release pipelines.
- Configure app env variables for API and Socket endpoints.

### Environment Variables Summary

#### Backend
```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/loom_monitoring
CLIENT_ORIGIN=http://localhost:5173
SPEED_WARNING_THRESHOLD=80
EMAIL_NOTIFICATIONS=false
NOTIFICATION_EMAIL_TO=ops@example.com
```

#### Frontend
```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

#### Mobile
```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_SOCKET_URL=http://localhost:4000
```

## ESP32 Integration Summary
- Connect a pulse-generating sensor to an interrupt-capable GPIO on the ESP32.
- Count pulses for a fixed interval and convert to RPM or loom speed.
- Package the calculated speed with machine status.
- Send readings to the backend over Wi-Fi using HTTP POST or MQTT.
- If the calculated speed is zero for one or more intervals, report `stopped` or `error` based on sensor expectations.

See `esp32/README.md` for detailed Arduino code.
