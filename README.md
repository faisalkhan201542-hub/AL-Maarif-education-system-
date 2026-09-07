# Al-Maarif Education — School Database Management System

A complete, real, working School Management System for **Al-Maarif Education**.

- Principal: **Murad Khalil**
- WhatsApp: **+923139163732**
- Address: **512, Near Professor Colony**

## Stack

- Frontend: React.js + Vite + Tailwind CSS + Axios + React Router
- Backend: Node.js + Express.js + MongoDB + Mongoose + JWT + bcrypt + Multer
- Exports: ExcelJS (.xlsx) and docx (.docx)

## Features

- Single role login: **Principal only** (JWT auth, bcrypt password hashing, no public signup)
- Students (165 sample students across 11 classes: KG, 1st–10th, 15 per class)
- Teachers (3 sample teachers), Classes, Attendance, Fees, Fee Challans (EasyPaisa, manual verification),
  Examinations & Results, Result Cards, Student ID Cards, Announcements, Reports, Excel/Word export, Print views,
  WhatsApp deep links (`wa.me`), School Settings (logo, address, EasyPaisa number, map link — all editable, not hardcoded).

## Project Structure

```
al-maarif-education/
├── backend/     # Express + MongoDB API
├── frontend/    # React + Vite + Tailwind app
└── README.md
```

## 1. Prerequisites

- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
# edit .env if needed (MONGO_URI, JWT_SECRET, PRINCIPAL_PASSWORD, etc.)
npm install
npm run seed     # creates Principal, Settings, 3 Teachers, 11 Classes, 165 Students,
                  # Attendance, Fee Challans, Exams & Results
npm run dev       # starts API on http://localhost:5000
```

Default Principal login created by the seed script:

- **WhatsApp / Username:** `+923139163732`
- **Password:** value of `PRINCIPAL_PASSWORD` in `.env` (default: `Maarif@123`)

Uploaded photos (students/teachers/logo) are served from `backend/uploads` at `/uploads/...`.

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env   # set VITE_API_URL if backend isn't on localhost:5000
npm install
npm run dev             # starts the app on http://localhost:5173
```

Login with the Principal credentials above.

## 4. Re-seeding

Running `npm run seed` again inside `backend` will **wipe and recreate** all collections
(Principal, Settings, Teachers, Students, Attendance, Fee Challans, Exams, Results, Announcements)
with fresh sample data — 1 Principal + 3 Teachers + 11 Classes + 165 Students + Photos/Avatars +
Father WhatsApp Numbers + Fees + Attendance + Examinations + Results + Announcements.

## 5. Notes on WhatsApp & EasyPaisa

- WhatsApp buttons open `https://wa.me/<number>` with a pre-filled message. **No message is ever sent
  automatically** — the Principal reviews and presses Send inside WhatsApp.
- EasyPaisa payments are **manual**: the challan shows the school's EasyPaisa number & account name
  (configurable in School Settings), the father pays and shares a Transaction Reference, and the
  Principal manually marks the challan `Verified` after checking. There is no live EasyPaisa API
  integration — the system never claims to auto-verify a payment.

## 6. Security

- JWT-protected APIs, bcrypt-hashed password, input validation, centralized error handling.
- `.env` files hold all secrets (`JWT_SECRET`, `MONGO_URI`, `PRINCIPAL_PASSWORD`) — never commit them.
