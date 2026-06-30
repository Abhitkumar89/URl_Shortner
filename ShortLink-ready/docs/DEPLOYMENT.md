# ShortLink — Deployment Guide

Deploy targets:
- **Database** → MongoDB Atlas
- **Backend** → Render
- **Frontend** → Vercel

---

## 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere) so Render can connect.
4. **Connect → Drivers** → copy the connection string, e.g.:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/shortlink?retryWrites=true&w=majority
   ```
   Keep this as your `MONGODB_URI`.

---

## 2. Google OAuth Client

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) → **Create OAuth client ID** → *Web application*.
2. **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://<your-app>.vercel.app`
3. Copy the **Client ID** — used by both backend (`GOOGLE_CLIENT_ID`) and frontend (`VITE_GOOGLE_CLIENT_ID`).

> Update the authorized origins again after you know your final Vercel URL.

---

## 3. Backend → Render

### Option A — Blueprint (recommended)
The repo includes [`backend/render.yaml`](../backend/render.yaml).

1. Push the repo to GitHub.
2. Render Dashboard → **New → Blueprint** → select the repo.
3. Render reads `render.yaml` and creates the `shortlink-api` web service.
4. Fill in the prompted env vars (`MONGODB_URI`, `GOOGLE_CLIENT_ID`, `BASE_URL`, `CLIENT_URL`).

### Option B — Manual Web Service
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Health Check Path:** `/health`

### Backend environment variables (Render)
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render injects its own; app reads `PORT`) |
| `MONGODB_URI` | *(Atlas connection string)* |
| `JWT_SECRET` | *(long random string)* |
| `JWT_EXPIRES_IN` | `7d` |
| `GOOGLE_CLIENT_ID` | *(Google client ID)* |
| `BASE_URL` | `https://shortlink-api.onrender.com` *(your Render URL)* |
| `CLIENT_URL` | `https://<your-app>.vercel.app` |

> `BASE_URL` must be the **backend** URL because short links + redirects are served by the API
> (e.g. `https://shortlink-api.onrender.com/abc123`).

After deploy, verify: `https://shortlink-api.onrender.com/health` → `{ "status": "ok" }`.

---

## 4. Frontend → Vercel

1. Vercel Dashboard → **Add New → Project** → import the repo.
2. **Root Directory:** `frontend`
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
4. The included [`frontend/vercel.json`](../frontend/vercel.json) handles SPA routing rewrites.

### Frontend environment variables (Vercel)
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://shortlink-api.onrender.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | *(Google client ID)* |

5. Deploy. Note the resulting URL, e.g. `https://shortlink.vercel.app`.

---

## 5. Wire everything together

1. Set backend `CLIENT_URL` = your Vercel URL → redeploy backend.
2. Add the Vercel URL to **Google OAuth Authorized JavaScript origins**.
3. Confirm frontend `VITE_API_URL` points at the Render `/api` URL.

---

## 6. Smoke test

1. Open the Vercel URL → **Sign in with Google**.
2. Create a short link → confirm it appears in the table.
3. Click the short link → confirm it redirects and the click count increments.
4. Open **Analytics** → confirm stats + QR render; download the QR.
5. Set an expiry in the past via API → confirm the link shows **Expired** and returns `410`.

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| CORS error in browser | `CLIENT_URL` on backend must exactly match the frontend origin (no trailing slash). |
| Google button missing | `VITE_GOOGLE_CLIENT_ID` not set on the frontend build. |
| `401` after login | Check `GOOGLE_CLIENT_ID` matches on both sides and `JWT_SECRET` is set. |
| Redirect 404 | `BASE_URL` must be the backend URL; short links are served by the API. |
| Render cold start slow | Free tier sleeps; first request after idle is slow — upgrade plan to avoid. |
| Mongo connection timeout | Whitelist `0.0.0.0/0` in Atlas Network Access. |
