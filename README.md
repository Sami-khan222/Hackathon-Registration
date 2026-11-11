# MatruCare AI – Hackathon Registration Portal

A full-stack MERN application where students sign up, verify their email with a one-time code, log in to a personal dashboard and register their team for the **MatruCare AI Hackathon**. Emails (OTP and registration confirmation) are sent through Nodemailer + Gmail SMTP.

## Features

- Email + password signup with a 6-digit OTP (hashed in the database, expires in 10 minutes, single use, max 5 attempts, 60 s resend cooldown)
- Login with bcrypt password check, JWT in an **HTTP-only cookie**, unverified accounts rejected
- Protected dashboard showing the real profile and registration status; edit your name
- 14-field registration form with **dynamic team-member fields**, validated on both client and server
- One registration per user (enforced by a unique database index); withdraw and re-register
- Confirmation email with event, project, domain, team size and team members
- Contact form (stored in MongoDB and forwarded to matrucareai@gmail.com)
- Helmet, CORS allow-list, rate limiting, NoSQL-injection sanitising, centralised error handling
- Fully responsive UI (checked at 375 px, 768 px and 1280 px)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, Tailwind CSS 3, React Router, Axios, Lucide React |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (HTTP-only cookie) + bcrypt (`bcryptjs`, the pure-JS bcrypt implementation, so it installs on Render without native builds) |
| Email | Nodemailer + Gmail SMTP |
| OTP | `crypto.randomInt` 6-digit generator |

## Folder structure

```
matrucare-ai/
├── client/
│   ├── public/
│   └── src/
│       ├── components/   Button, Field (Input/Select/Textarea), Navbar, Footer, OtpInput, ParticipantPass, ...
│       ├── pages/        Home, About, Contact, Signup, VerifyOtp, Login, Dashboard, Register, NotFound
│       ├── layouts/      MainLayout
│       ├── context/      AuthContext
│       ├── hooks/        useCountdown
│       ├── services/     api (axios), authService, hackathonService
│       └── utils/        validation, eventConfig
└── server/
    ├── config/           env, db, constants (dropdown options + business rules)
    ├── controllers/      auth, user, hackathon, contact
    ├── middleware/       auth (JWT), errorHandler, rateLimiters, sanitize
    ├── models/           User, HackathonRegistration, ContactMessage
    ├── routes/
    ├── services/         emailService (Nodemailer + HTML templates)
    ├── utils/            ApiError, asyncHandler, otp, token, validators, response
    ├── tests/            api.test.js (end-to-end API tests)
    ├── app.js
    └── server.js
```

## Run locally (about 10 minutes)

Prerequisites: Node.js 18+, a MongoDB Atlas cluster (or local MongoDB), a Gmail account with an App Password.

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # then fill in the values (see below)
npm run dev               # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

### Environment variables

`server/.env`

| Variable | Description |
|---|---|
| `PORT` | API port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random string, **at least 32 characters**. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLIENT_URL` | Frontend origin for CORS, e.g. `http://localhost:5173`. Several origins can be comma-separated |
| `EMAIL_USER` | `matrucareai@gmail.com` |
| `EMAIL_PASS` | Gmail **App Password** (not the account password) |
| `NODE_ENV` | `development` or `production` |

`client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | API base URL, e.g. `http://localhost:5000/api` |

Real `.env` files are git-ignored. Never commit them.

### MongoDB Atlas setup

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. **Database Access** → add a user with a password.
3. **Network Access** → allow your IP (use `0.0.0.0/0` for Render, since its IPs change).
4. **Connect → Drivers** → copy the connection string, replace `<password>`, and append the database name, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/matrucare`.

### Gmail App Password setup

1. Sign in to the sender Google account (matrucareai@gmail.com) and enable **2-Step Verification**.
2. Open <https://myaccount.google.com/apppasswords>, create an app password named "MatruCare API".
3. Copy the 16-character code into `EMAIL_PASS` (spaces optional).

The server checks the SMTP connection at start-up and logs a warning if it fails.

## API documentation

Every response is `{ success, message, data }`. Errors are `{ success: false, message, errors? }` with field-level `errors` for validation failures (HTTP 422). Authentication uses the `token` HTTP-only cookie (a `Bearer` header is also accepted for API tools).

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/api/auth/signup` | – | `fullName, email, password, confirmPassword` | Create unverified user, email OTP |
| POST | `/api/auth/verify-otp` | – | `email, otp` | Verify account, invalidate OTP |
| POST | `/api/auth/resend-otp` | – | `email` | New OTP (60 s cooldown), old one invalidated |
| POST | `/api/auth/login` | – | `email, password` | Sets JWT cookie. `403 code=UNVERIFIED` if not verified |
| POST | `/api/auth/logout` | – | – | Clears the cookie |
| GET | `/api/user/me` | ✔ | – | Profile + `isRegistered` |
| PUT | `/api/user/update` | ✔ | `fullName` | Update profile name |
| GET | `/api/hackathon/options` | – | – | Dropdown options for the form |
| POST | `/api/hackathon/register` | ✔ | see below | Save registration, send confirmation email |
| GET | `/api/hackathon/my-entry` | ✔ | – | Your registration (or `null`) |
| DELETE | `/api/hackathon/:id` | ✔ | – | Delete **your own** registration |
| POST | `/api/contact` | – | `name, email, message` | Store + forward to the company inbox |
| GET | `/api/health` | – | – | Health check |

Registration body: `fullName, email, mobileNumber, collegeName, course, branch, yearOfStudy, domain, projectName, pptLink, prototypeLink, demoVideoLink (optional), teamSize (1–5), teamMembers [{name, email}]`.

**Team members rule:** team size 1 (solo) has no member entries; team size N > 1 requires exactly N member entries (name + email, unique, different from the lead's email), as described in the assignment brief.

**Delete:** the brief marks `DELETE /api/hackathon/:id` as "admin / optional". There is no admin role in the specified data model, so it is owner-only.

## Tests

```bash
cd server
TEST_MONGO_URI=mongodb://127.0.0.1:27017/matrucare_test npm test
```

The suite runs 20 end-to-end API checks against a real MongoDB (signup, hashing, OTP expiry/reuse/cooldown/attempt limit, login, protected routes, registration, duplicates, team rules, contact, delete, logout). Only the Nodemailer transport is replaced with a recorder, so it needs no Gmail. **Real email delivery must be checked manually** with your App Password.

## Deployment

### Backend → Render
1. New **Web Service** from your GitHub repo, **Root Directory** `server`.
2. Build command `npm install`, start command `npm start`.
3. Add the environment variables above with `NODE_ENV=production` and `CLIENT_URL=https://<your-app>.vercel.app`.

### Frontend → Vercel
1. Import the repo, **Root Directory** `client`, framework preset Vite.
2. Set `VITE_API_URL=https://<your-api>.onrender.com/api`.
3. `client/vercel.json` already routes all paths to `index.html` for React Router.

### Cookies across domains
In production the cookie is `Secure; SameSite=None` so a Vercel frontend can call a Render API. Browsers that block third-party cookies (notably Safari) may drop it. The robust fix is to make the API same-origin: add this to `client/vercel.json` (before the catch-all) and set `VITE_API_URL=/api`:

```json
{ "source": "/api/:path*", "destination": "https://<your-api>.onrender.com/api/:path*" }
```

### Customising event content
Dates, prizes and social links on the Home page live in `client/src/utils/eventConfig.js`. They are placeholders: update them, and keep the event name/dates in `server/config/constants.js` (used in emails) in sync.

## Screenshots

Add your own captures here after deploying:

| Page | Screenshot |
|---|---|
| Home | `docs/home.png` |
| OTP verification | `docs/otp.png` |
| Dashboard | `docs/dashboard.png` |
| Registration form | `docs/register.png` |
