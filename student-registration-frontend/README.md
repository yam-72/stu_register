# Student Registration Management System — Frontend

A production-style React (Create React App) frontend for a university
registrar's office, built to sit in front of an existing Node.js + Express +
MySQL backend. No mock data, no new backend — this talks to your real API.

## Stack

- React 18 + Create React App (no TypeScript)
- React Router DOM v6
- Axios (centralized instance + refresh-token interceptor)
- Context API for auth + toast notifications
- Tailwind CSS (custom navy/gold academic design system)
- Framer Motion for transitions and micro-interactions
- React Icons (Feather set)
- Recharts for dashboard visualizations

## Getting started

```bash
cd student-registration-frontend
npm install
cp .env.example .env   # adjust the API URL if your backend isn't on :5000
npm start
```

The app runs on `http://localhost:3000` and expects your backend at
`http://localhost:5000/api` (configurable via `REACT_APP_API_BASE_URL`).
Uploaded photos are resolved against `REACT_APP_UPLOADS_BASE_URL`
(`http://localhost:5000` by default, matching an Express `/uploads` static route).

## Backend contract this frontend expects

The app is written defensively — most list/detail responses are read as
either a bare array or `{ data: [...], total }`, so small differences in your
backend's response envelope shouldn't break it outright. That said, it assumes:

- `POST /api/auth/login` → `{ token, refreshToken, user }`
- `POST /api/auth/refresh-token` → `{ token }` (used transparently on 401s)
- `GET /api/students|departments|courses|instructors|registrations|grades`
  accept `page`, `limit`, `search`, `sortBy`, `sortDir` query params
- `POST /api/students/:id/photo` accepts `multipart/form-data` with a `photo` field
- `GET /api/registrations/student/:id`, `GET /api/grades/student/:id`,
  `GET /api/grades/student/:id/gpa` for the student profile & grade report pages
- `POST /api/grades/assign` accepts `{ student_id, registration_id, grade, remark }`

If your actual routes or payload field names differ, the two files to adjust
first are `src/api/*.js` (endpoint paths) and the corresponding page's
`values` object (payload shape) — everything else (tables, forms, toasts,
loading states) is decoupled from those specifics.

## Project structure

```
src/
├── api/            Axios instance + one service module per resource
├── components/      Reusable UI: Sidebar, Navbar, DataTable, Modal, etc.
├── context/         AuthContext, ToastContext
├── hooks/           useApiResource (pagination/search/sort), useLookupOptions
├── layouts/         DashboardLayout, AuthLayout
├── pages/           auth/ dashboard/ students/ departments/ courses/
│                    registrations/ grades/ instructors/
├── utils/           auth.js, validators.js, formatters.js
└── App.jsx          All routing lives here, protected by ProtectedRoute
```

## Design notes

The visual identity is a deep navy + academic gold palette, Lora for
display type, Inter for body text, and IBM Plex Mono for registration
numbers, course codes, and GPA figures — the small "ledger" details real
registrar systems tend to have. The circular seal mark used on the login
screen and sidebar is original SVG, not a stock logo.

## Known gaps to wire up as your backend evolves

- Role-based UI restriction is scaffolded (`ProtectedRoute` accepts a
  `roles` prop) but not yet applied to specific routes — add
  `roles={["admin"]}` to any route in `App.jsx` once you've decided which
  actions are admin-only vs. registrar-accessible.
- The dashboard's "students/courses by department" chart expects
  `student_count`/`course_count` fields on department records; adjust the
  field names in `src/pages/dashboard/Dashboard.jsx` if your backend names
  them differently.
