# ⚡ DevTinder — Professional Developer Matchmaking Platform

DevTinder is an elite, modern developer networking and matchmaking platform where software engineers can discover, match, and connect with peers based on tech-stack alignment, open-source interest, and project collaboration goals.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Redux Toolkit, Tailwind CSS v3, Lucide React, Canvas Confetti, Vite
- **Backend:** Node.js (v22), Express.js (v5), Mongoose (v9), MongoDB Atlas
- **Authentication & Security:** JWT (JSON Web Tokens) with `httpOnly` cookies + Bearer token fallback, Bcrypt password hashing, Helmet, Express-Rate-Limit, CORS origin isolation
- **State Management:** Redux Toolkit slices (`authSlice`, `feedSlice`, `requestsSlice`, `connectionsSlice`, `toastSlice`) with optimistic updates and automatic server-error rollback

---

## 📋 Features Overview

1. **Cyber-Developer UX & Aesthetic:**
   - Dark developer-themed design with neon accents and glassmorphism.
   - Interactive Tinder-style swipeable card deck with 3D stacking depth and keyboard shortcuts (`[← Pass]`, `[→ Like]`).
   - Confetti particle animations on mutual connection.
2. **Tech-Stack Alignment & Smart Feed:**
   - Feed automatically excludes the logged-in user, existing connections, and already requested/ignored users.
   - Real-time compatibility score (% match) based on skills overlap.
   - Live skill filters (React, Node.js, Python, Go, Docker, AWS, Rust).
3. **Pending Invitations Hub:**
   - Dedicated dashboard to review incoming connection requests with Accept and Decline actions.
   - Unread count badge in top navigation.
4. **Matches & Direct Chat Modal:**
   - Grid view of all accepted connections with links to GitHub and LinkedIn.
   - Interactive instant direct message modal with smart icebreakers.
5. **Interactive Profile Customizer:**
   - Side-by-side editing: edit form on the left with a live deck card preview on the right.
6. **Robust Security & Error Handling:**
   - Input validation and sanitization.
   - Password hashes completely excluded from serialized responses (`toJSON`).
   - Rate limiting on authentication routes (30 req / 15 min) and API (300 req / 15 min).
   - Centralized error handling middleware.

---

## ⚙️ Environment Variables (.env)

Create a `.env` file in the root folder with the following keys:

```env
PORT=7777
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/devTinder
JWT_SECRET=devtinder_super_secret_jwt_key_2026_secure
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Seed Demo Developers
To populate the database with realistic engineer profiles (Frontend, Backend, DevOps, AI, Mobile, Web3):
```bash
npm run seed
```

### 3. Run Backend & Frontend Concurrently
```bash
npm run dev
```
- Backend runs on: `http://localhost:7777`
- Frontend runs on: `http://localhost:5173`

---

## 🧪 Quick Test / Recruiter Accounts
Use the **1-Click Demo Login** buttons on the login screen, or enter:
- **Email:** `aarav.sharma@example.com` | **Password:** `Password@123`
- **Email:** `riya.verma@example.com` | **Password:** `Password@123`
- **Email:** `devon.carter@example.com` | **Password:** `Password@123`

---

## 🤖 Phase 2: Google Gemini AI Features

### 1. AI Semantic Matching & Blended Match Score
- Profiles automatically generate text embeddings stored in MongoDB.
- Matching blends semantic similarity (cosine similarity) with technical skills overlap.
- **MongoDB Atlas Vector Search Index Definition JSON:**
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```
*Steps to activate in MongoDB Atlas:*
1. Go to your MongoDB Atlas Cluster > **Atlas Search** tab > **Create Search Index**.
2. Select **JSON Editor** under **Atlas Vector Search**.
3. Choose the `devTinder` database and `users` collection.
4. Name the index `vector_index` and paste the JSON definition above.
*(Note: If Atlas Vector Search is not enabled on your tier, DevTinder automatically uses our built-in in-memory Node.js cosine similarity fallback seamlessly).*

### 2. "Why You Matched" Explanation (Gemini LLM)
- Click **"Why You Matched? (Ask Gemini)"** on any feed card to get a 1-2 sentence match rationale based on complementary strengths.
- Cached in MongoDB (`AiCache` collection) to prevent repeated API calls.

### 3. AI Profile Builder from GitHub
- Click **"Generate Profile from GitHub (AI)"** on the Profile page.
- Enter any GitHub username (e.g. `torvalds`, `gaearon`). The backend fetches repositories via GitHub REST API, and Gemini generates a professional bio, top skills, and matchmaking focus for your review.

### 4. AI Icebreakers in Direct Chat
- When opening a match chat, 3 conversation starters tailored to both developers' profiles are automatically suggested. Click any icebreaker to insert it into your message input!

---

### Auth Router
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/signup` | Register developer account | No |
| `POST` | `/login` | Authenticate & set JWT cookie | No |
| `POST` | `/logout` | Invalidate cookie session | No |

### Profile Router
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/profile/view` | Get current logged-in user profile | Yes (JWT) |
| `PATCH` | `/profile/edit` | Update profile fields and persist to DB | Yes (JWT) |
| `PATCH` | `/profile/password` | Safely update password | Yes (JWT) |

### Connection Request Router
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/request/send/:status/:toUserId` | Send request (`interested` or `ignored`) | Yes (JWT) |
| `POST` | `/request/review/:status/:requestId` | Review request (`accepted` or `rejected`) | Yes (JWT) |

### User Router
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/user/feed` | Paginated feed of recommended devs | Yes (JWT) |
| `GET` | `/user/requests/received` | List all incoming pending requests | Yes (JWT) |
| `GET` | `/user/connections` | List all accepted mutual connections | Yes (JWT) |
