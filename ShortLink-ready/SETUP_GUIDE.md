# 🚀 ShortLink — Complete Setup Guide (Run on Another Computer)

This guide explains **everything** you need to do to copy the project to another computer
(no GitHub needed) and run it locally. Follow the steps in order. No prior experience required.

---

## 📦 What to copy ("drag and drop")

Copy the **entire `URL SHORTNER` folder** to a USB drive / cloud drive and drop it onto the new computer.

> ⚠️ **Important — make the copy smaller and avoid errors:**
> Before copying, **DELETE the `node_modules` folders** (they are huge and machine-specific).
> You will reinstall them fresh on the new computer in Step 4.
>
> Delete these two folders if they exist:
> - `URL SHORTNER\backend\node_modules`
> - `URL SHORTNER\frontend\node_modules`
>
> You can delete them in File Explorer, or run this in PowerShell from inside the `URL SHORTNER` folder:
> ```powershell
> Remove-Item -Recurse -Force backend\node_modules, frontend\node_modules
> ```

After copying, the new computer should have this structure:

```
URL SHORTNER/
├── backend/      (server code)
├── frontend/     (website code)
├── docs/
├── README.md
└── SETUP_GUIDE.md   ← (this file)
```

---

## ✅ Step 1 — Install the required software (on the NEW computer)

You need **two** free programs installed. Skip any you already have.

### 1a. Node.js (required)
This runs both the backend and frontend.

1. Go to https://nodejs.org
2. Download the **LTS** version (the big green button).
3. Run the installer → keep clicking **Next** → **Install** → **Finish**.
4. Verify it worked: open **PowerShell** (press `Windows key`, type `PowerShell`, press Enter) and run:
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers (e.g. `v20.x.x` and `10.x.x`). If you see an error, restart the computer and try again.

### 1b. A code editor (recommended, optional)
To edit the `.env` files easily, install **VS Code** from https://code.visualstudio.com
(You can also use Notepad — that's fine too.)

---

## ✅ Step 2 — Get a free MongoDB database (cloud, takes ~5 min)

The app stores users and links in MongoDB. The easiest way is the free cloud option (MongoDB Atlas).

1. Go to https://www.mongodb.com/atlas and **sign up** (free).
2. Create a **free cluster** (choose the **M0 / Free** tier). Pick any cloud/region and click **Create**.
3. **Create a database user:**
   - Left menu → **Database Access** → **Add New Database User**.
   - Choose **Password** authentication. Set a **username** and **password** (write them down!).
   - Give it the **Read and write to any database** role → **Add User**.
4. **Allow network access:**
   - Left menu → **Network Access** → **Add IP Address** → click **Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**.
5. **Get the connection string:**
   - Left menu → **Database** → click **Connect** on your cluster → **Drivers**.
   - Copy the string. It looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Replace `<username>` and `<password>`** with the ones you created in step 3.
   - Add the database name `shortlink` right before the `?`, like this:
     ```
     mongodb+srv://myuser:mypass123@cluster0.xxxxx.mongodb.net/shortlink?retryWrites=true&w=majority
     ```
   - **Save this final string** — you'll paste it in Step 3.

> 💡 Prefer a local database instead of cloud? Install MongoDB Community Server and use
> `mongodb://127.0.0.1:27017/shortlink` as your connection string. Cloud (Atlas) is easier.

---

## ✅ Step 3 — Get a free Google Login Client ID (takes ~5 min)

The app uses "Sign in with Google", so you need a Google Client ID.

1. Go to https://console.cloud.google.com/apis/credentials (sign in with any Google account).
2. If asked, create a **New Project** (any name, e.g. "ShortLink") and select it.
3. Click **Create Credentials** → **OAuth client ID**.
   - If it asks you to **configure the consent screen** first:
     - Choose **External** → **Create**.
     - Fill in **App name** (e.g. ShortLink), your email for the support + developer email fields → **Save and Continue** through the steps → **Back to Dashboard**.
     - Under **Audience / Test users**, add your own Gmail address so you can log in.
   - Then go back to **Create Credentials → OAuth client ID**.
4. **Application type:** choose **Web application**.
5. Under **Authorized JavaScript origins**, click **Add URI** and add **both**:
   - `http://localhost:5173`
   - `http://localhost:3000`
6. Click **Create**.
7. Copy the **Client ID** shown (it ends with `.apps.googleusercontent.com`). **Save it** — you'll use it in Step 3 below for both files.

---

## ✅ Step 4 — Configure the project (create the two `.env` files)

The project ships with example files (`.env.example`). You'll make real `.env` files from them.

### 4a. Backend `.env`
1. Open the folder `URL SHORTNER\backend`.
2. Make a copy of `.env.example` and rename the copy to exactly **`.env`** (no `.txt`).
3. Open `.env` in VS Code / Notepad and set these values:

```env
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# Paste your MongoDB string from Step 2:
MONGODB_URI=mongodb+srv://myuser:mypass123@cluster0.xxxxx.mongodb.net/shortlink?retryWrites=true&w=majority

# Any long random text works as the secret:
JWT_SECRET=please-change-this-to-a-long-random-string-12345
JWT_EXPIRES_IN=7d

# Paste your Google Client ID from Step 3:
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

### 4b. Frontend `.env`
1. Open the folder `URL SHORTNER\frontend`.
2. Make a copy of `.env.example` and rename the copy to exactly **`.env`**.
3. Open it and set:

```env
VITE_API_URL=http://localhost:5000/api

# Same Google Client ID as the backend:
VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

> 📝 The `GOOGLE_CLIENT_ID` (backend) and `VITE_GOOGLE_CLIENT_ID` (frontend) must be the **same** value.

---

## ✅ Step 5 — Install dependencies (one-time per computer)

This downloads the code libraries the project needs. You only do this once.

Open **PowerShell** and run these commands **one block at a time**.

**Install backend libraries:**
```powershell
cd "C:\path\to\URL SHORTNER\backend"
npm install
```

**Install frontend libraries:**
```powershell
cd "C:\path\to\URL SHORTNER\frontend"
npm install
```

> Replace `C:\path\to\URL SHORTNER` with the real location where you dropped the folder.
> Tip: In File Explorer, right-click the folder → **Copy as path**, then paste it after `cd`.
> Each `npm install` may take 1–3 minutes.

---

## ✅ Step 6 — Run the app (every time you want to use it)

You need **TWO PowerShell windows** open at the same time — one for the backend, one for the frontend.

### Window 1 — Start the backend
```powershell
cd "C:\path\to\URL SHORTNER\backend"
npm run dev
```
✅ Success looks like:
```
✅ MongoDB connected: cluster0-...
🚀 ShortLink API running on port 5000
```
**Leave this window open.**

### Window 2 — Start the frontend
Open a **new** PowerShell window and run:
```powershell
cd "C:\path\to\URL SHORTNER\frontend"
npm run dev
```
✅ Success looks like:
```
VITE v5.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Open the app
Open your browser and go to: **http://localhost:5173**
Click **Continue with Google** and sign in. 🎉

---

## ✅ Step 7 — Stop the app

In each PowerShell window, press **`Ctrl + C`** (and confirm with `Y` if asked).

---

## 🔁 Quick reference (after first-time setup)

Once everything is installed and configured, running it again is just:

| Window | Commands |
|--------|----------|
| 1 (backend) | `cd "...\backend"` then `npm run dev` |
| 2 (frontend) | `cd "...\frontend"` then `npm run dev` |
| Browser | open `http://localhost:5173` |

---

## ❓ Troubleshooting

| Problem | Cause / Fix |
|--------|-------------|
| `'npm' is not recognized` | Node.js isn't installed or PowerShell needs a restart. Redo Step 1, then reopen PowerShell. |
| Backend says `MongoDB connection error` | Your `MONGODB_URI` is wrong, or you didn't allow network access (`0.0.0.0/0`) in Atlas. Recheck Step 2. |
| `MONGODB_URI is not defined` | The `backend\.env` file is missing or named wrong (must be exactly `.env`, not `.env.txt`). |
| Google button missing / "Client ID missing" warning | `VITE_GOOGLE_CLIENT_ID` is not set in `frontend\.env`. Recheck Step 4b. |
| Google login popup error / "origin not allowed" | You didn't add `http://localhost:5173` to **Authorized JavaScript origins** in Step 3. |
| "Access blocked / app not verified" on Google | Add your Gmail as a **Test user** on the OAuth consent screen (Step 3). |
| Page loads but login fails with 401 | The Client ID in `backend\.env` and `frontend\.env` don't match. Make them identical. |
| Port 5000 or 5173 already in use | Another program is using it. Close it, or change `PORT` in `backend\.env` (and update `VITE_API_URL` to match). |
| Short links don't redirect | Make sure the backend is running and `BASE_URL=http://localhost:5000`. |

---

## 🌐 Want to put it online later?

See **`docs/DEPLOYMENT.md`** for free hosting (Frontend → Vercel, Backend → Render, Database → MongoDB Atlas).

---

## 📂 File checklist (must exist before running)

- [ ] `backend\.env`  (created from `.env.example`)
- [ ] `frontend\.env`  (created from `.env.example`)
- [ ] `backend\node_modules`  (created by `npm install`)
- [ ] `frontend\node_modules`  (created by `npm install`)

If all four exist and your MongoDB + Google values are correct, the app will run. ✅
