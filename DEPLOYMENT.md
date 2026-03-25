# Industrial IoT Deployment Guide

## Environment Profiles

### Backend (`backend/.env`)
- `PORT=4000`
- `MONGO_URI=<mongo connection string>`
- `JWT_SECRET=<strong secret>`
- `CLIENT_ORIGIN=<frontend origin>`
- `EMAIL_NOTIFICATIONS=false`
- `PUSH_HOOK_ENABLED=false`
- `BOOTSTRAP_ADMIN=true`
- `ADMIN_EMAIL=admin@loomops.local`
- `ADMIN_PASSWORD=<temporary bootstrap password>`

### Frontend (`frontend/.env`)
- `VITE_API_URL=https://<backend-domain>/api`
- `VITE_SOCKET_URL=https://<backend-domain>`

### Mobile (`mobile/.env`)
- `EXPO_PUBLIC_API_URL=https://<backend-domain>/api`
- `EXPO_PUBLIC_SOCKET_URL=https://<backend-domain>`

## Platforms

### Backend → Render / AWS
1. Configure Node 20 runtime.
2. Set environment variables from backend profile.
3. Attach managed MongoDB connection.
4. Start command: `npm start`.

### Frontend → Vercel
1. Set Root Directory to `frontend`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add `VITE_API_URL` and `VITE_SOCKET_URL`.

### Mobile → Expo EAS
1. Configure `eas.json` with `preview` and `production` profiles.
2. Set secrets for backend URLs.
3. Build with `eas build --platform all`.

## Containerized Development

```bash
docker compose up --build
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- MongoDB: `mongodb://localhost:27017`
