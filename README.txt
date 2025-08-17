CHIMNEY CRM — MERN (React + Express + MongoDB + Tailwind + Socket.IO)

Quick Start (Local):
1) Backend
   - cd backend
   - copy .env.example to .env and edit MONGO_URI, JWT_SECRET, CORS_ORIGIN
   - npm install
   - npm run dev
   - It seeds admin (username: admin, password: Chimneysolution@123#)

2) Frontend
   - cd ../frontend
   - npm install
   - echo "VITE_API_BASE=http://localhost:4000" > .env
   - npm run dev
   - Open http://localhost:5173

Vercel Deployment:
- Create two Vercel projects from this repo:
  A) Backend (root: backend). Vercel will use vercel.json and api/index.cjs (serverless)
     - Add Environment Variables on Vercel:
       MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN (your frontend domain)
  B) Frontend (root: frontend). Build Command: npm run build; Output: dist
     - Add env VITE_API_BASE to your deployed backend URL (e.g. https://<backend>.vercel.app)
- Optional custom domains for both.

Features implemented:
- Admin & Technician login (JWT in httpOnly cookie, bcrypt hashed passwords). No autofill.
- Technician registration.
- Technician dashboard: Service Form (with client signature), Forwarded Calls with tabs (All/Today/Pending/Completed/Closed) and backend pagination (4 per page), "Go" button to Google Maps directions, status dropdown, "Call" button (marks In Process).
- Payment Mode modal with payee name, mode (Online/Cash/Mixed), amounts, required signature. Data visible in Admin > Reports/Payments with signature image.
- Admin dashboard: Summary + "Recent Forwarded Calls" section.
- Admin sections:
  * Service Forms: filters (All/Today/Date range/Technician + search by name/phone/address), signature visible.
  * Call Forwarding: form to assign calls; "Recent Forwarded Calls" list.
  * Payments/Reports: filters, totals per page, signature visible.
  * Technicians: list + detail page with date-range totals and history.
- Socket.IO real-time technician notification on call forward (toast).
- Skeleton classes available; Tailwind UI with smooth, modern styling.
- Pagination on all heavy lists server-side; scalable.

Notes:
- Change JWT cookie to secure:true when using HTTPS.
- If deploying backend outside Vercel, run `node server.js` normally.
- For PWA/push notifications you can later add service worker; current implementation uses real-time in-app toasts.
