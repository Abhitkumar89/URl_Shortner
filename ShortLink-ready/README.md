# 🔗 ShortLink — Full-Stack URL Shortener

A production-ready URL shortener with Google authentication, click analytics, QR codes,
custom aliases, link expiry, and a modern Vercel-inspired dashboard.

![Tech](https://img.shields.io/badge/React-18-61dafb) ![Tech](https://img.shields.io/badge/Node-Express-339933) ![Tech](https://img.shields.io/badge/MongoDB-Mongoose-47A248) ![Tech](https://img.shields.io/badge/Auth-JWT%20%2B%20Google-6d28d9)

---

## ✨ Features

| Area | Capabilities |
|------|--------------|
| **Auth** | Google login (OAuth ID token → app JWT), logout, user profile |
| **Dashboard** | Total links, total clicks, active links — live aggregate stats |
| **Short URLs** | Long → short, custom aliases, copy to clipboard, delete |
| **QR Codes** | Auto-generated QR for every link, downloadable PNG |
| **Analytics** | Total clicks, last click time, creation date, link status |
| **Expiry** | Optional expiration date; expired links auto-deactivate (HTTP 410) |
| **Search & Filter** | Search by URL/code/alias; filter by Active / Expired / All |
| **UI** | Dark mode, fully responsive, cards, tables, loading spinners, toast notifications |

---

## 🧱 Tech Stack

**Frontend:** React + Vite, JavaScript (ES6+), Tailwind CSS, React Router, Axios, `@react-oauth/google`
**Backend:** Node.js, Express, MongoDB + Mongoose, JWT, `nanoid`, `qrcode`, `google-auth-library`
**Infra:** Frontend → Vercel · Backend → Render · Database → MongoDB Atlas

---

## 📁 Project Structure

```
URL SHORTNER/
├── backend/
│   ├── src/
│   │   ├── config/db.js            # Mongo connection
│   │   ├── models/                 # User, Link schemas
│   │   ├── middleware/             # auth (JWT), error handling
│   │   ├── controllers/            # auth + link/analytics logic
│   │   ├── routes/                 # /auth, link routes
│   │   ├── utils/token.js          # JWT helpers
│   │   ├── app.js                  # Express app (CORS, routes, redirect)
│   │   └── server.js               # Entry point
│   ├── render.yaml                 # Render blueprint
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                    # axios client + endpoints
│   │   ├── context/                # Auth, Theme, Toast providers
│   │   ├── components/             # reusable UI (table, cards, QR, toast…)
│   │   ├── pages/                  # Login, Dashboard, Analytics, Profile
│   │   ├── hooks/ utils/
│   │   ├── App.jsx  main.jsx  index.css
│   ├── vercel.json
│   └── .env.example
└── docs/
    ├── API.md                      # API reference
    └── DEPLOYMENT.md               # Deployment guide
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A Google OAuth Client ID ([Google Cloud Console](https://console.cloud.google.com/apis/credentials))

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # then edit values
npm run dev                   # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # then edit values
npm run dev                   # starts on http://localhost:5173
```

Open **http://localhost:5173** and sign in with Google.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Var | Description |
|-----|-------------|
| `PORT` | Server port (default 5000) |
| `BASE_URL` | Public URL of the backend (used to build short links + redirects) |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS (comma-separated) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing app JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |

### Frontend (`frontend/.env`)
| Var | Description |
|-----|-------------|
| `VITE_API_URL` | Backend API base URL incl. `/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (same as backend) |

---

## 🔐 Setting up Google OAuth

1. Go to **Google Cloud Console → APIs & Services → Credentials**.
2. Create an **OAuth 2.0 Client ID** (Application type: *Web application*).
3. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (dev)
   - `https://your-frontend.vercel.app` (prod)
4. Copy the **Client ID** into both `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend).

> The frontend sends the Google **ID token (credential)** to `POST /auth/google`; the backend verifies it with Google and issues an app JWT.

---

## 📡 API & Deployment

- **API reference:** [`docs/API.md`](docs/API.md)
- **Deployment guide:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---

## 🗄️ Data Model

**User:** `googleId`, `email`, `name`, `avatar`, `createdAt`
**Link:** `userId`, `originalUrl`, `shortCode`, `customAlias`, `totalClicks`, `lastClickedAt`, `createdAt`, `expiresAt` (+ computed `status`)

---

## 📝 License

MIT
