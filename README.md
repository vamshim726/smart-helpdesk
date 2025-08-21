### Smart Helpdesk – Architecture, Setup, and Environment Guide

### Overview
Smart Helpdesk is a full‑stack application for managing support tickets with AI-assisted triage, knowledge base suggestions, role-based workflows (admin, agent, user), real-time notifications, and SLA checks.

### Key Features
- AI-like rule-based triage with KB suggestions and optional auto-close
- Role-based access: admin, agent, user (customer)
- Users can create/view tickets and replies; staff can triage/resolve/assign
- Real-time notifications using Socket.IO
- SLA checker job, audit logs, and email notifications
- Knowledge Base with draft/published statuses and full-text search

### Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT
- **Frontend**: React (Vite), Redux Toolkit, TailwindCSS
- **Jobs**: node-cron

### Repository Structure
```
smart-helpdesk/
  backend/
    controllers/   # Route handlers (auth, tickets, agent, kb, config)
    jobs/          # SLA checker
    middlewares/   # Auth + RBAC
    models/        # Mongoose models
    routes/        # Express routes
    services/      # notification service
    utils/         # db, jwt, mailer, realtime (Socket.IO)
    server.js      # Express app and Socket.IO init
  frontend/
    src/
      components/
      pages/
      store/       # Redux slices (auth, tickets, agent, kb, config, notifications)
      utils/       # socket client
    vite.config.js
  README.md
```

### Data Model Highlights
- **User**: name, email, passwordHash, role = admin|agent|user
- **Ticket**: title, description, category (billing|tech|shipping|account|other), status (open|triaged|waiting_human|resolved|closed), createdBy, assignee, agentSuggestion, replies[], SLA fields
- **KBArticle**: title, body, tags[], status = draft|published (full-text indexed)
- **Notification**: user, title, message, type, ticket, isRead
- **Config**: autoCloseEnabled, confidenceThreshold, slaHours
- **AuditLog**: ticket, traceId, step, message, metadata, createdAt

### Role-Based Access Summary
- **user (customer)**:
  - Can register/login, create tickets, view own tickets, post replies on own tickets
- **agent**:
  - Can triage (suggestions), reply, assign, reopen/close, view all tickets
  - Cannot create new tickets
- **admin**:
  - Full staff privileges + admin endpoints (users, config, stats)
  - Cannot create new tickets

Backend strictly enforces that only user role can POST `/api/tickets`.

---

### Backend – Setup and Environment

#### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

#### Environment Variables (Backend)
- Required
  - `MONGO_URI`: MongoDB connection (e.g., `mongodb://127.0.0.1:27017/smart-helpdesk`)
  - `JWT_SECRET`: a long random secret for signing JWTs
  - `PORT`: optional (default 8080)
  - `NODE_ENV`: production or development
- Example (.env-style; don’t commit secrets)
```bash
MONGO_URI=mongodb://127.0.0.1:27017/smart-helpdesk
JWT_SECRET=replace-with-a-long-random-string
PORT=8080
NODE_ENV=development
```

#### Install and Run (Backend)
```bash
cd backend
npm install
# Ensure MongoDB is running (see MONGO_URI)
node server.js
# or with nodemon in dev:
npm run dev
```

#### Important Backend Endpoints
- **Auth**:
  - `POST /api/auth/register` `{name,email,password,role?}`
  - `POST /api/auth/login` `{email,password}`
  - `GET /api/auth/profile` (Bearer token)
- **Tickets**:
  - `POST /api/tickets` (user only; Bearer token)
  - `GET /api/tickets?status=&mine=&assigned=` (Bearer token; staff can see all)
  - `GET /api/tickets/:id` (Bearer token)
  - `POST /api/tickets/:id/replies` `{body,kbRefs?,status?}` (user to own ticket; staff any ticket)
- **Agent (staff-only)**:
  - `POST /api/agent/triage` `{ticketId, autoClose?, confidenceThreshold?}`
  - `GET /api/agent/suggestion/:ticketId`
  - `GET /api/agent/logs/:ticketId`
  - `POST /api/agent/tickets/:id/reply` `{reply,status?,kbRefs?}`
  - `POST /api/agent/tickets/:id/assign` `{assigneeId?}`
  - `POST /api/agent/tickets/:id/reopen`
  - `POST /api/agent/tickets/:id/close`
- **KB**:
  - `GET /api/kb?q=&status=&tags=` (public; published by default)
  - `GET /api/kb/:id` (public if published)
  - Admin only: `POST/PUT/DELETE /api/kb`
- **Config (admin)**:
  - `GET/PUT /api/config`
- **Notifications**:
  - `GET /api/notifications`
  - `POST /api/notifications/:id/read`
- **Health**:
  - `GET /health`, `GET /socket-health`

#### Realtime (Socket.IO)
- Backend allows CORS for dev origins in `utils/realtime.js`
- Frontend connects to `${protocol}//${host}:8080` by default (`src/utils/socket.js`) and emits `auth` with `userId`

---

### Frontend – Setup and Environment

#### Environment Variables (Frontend – Vite)
- `VITE_API_BASE`: optional; if proxying via Nginx or same origin use `/api`. For separate origins, set full URL, e.g. `https://api.example.com`.
- Example `.env.local`:
```bash
VITE_API_BASE=/api
```

#### Install and Run (Frontend)
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

#### Production Build (Frontend)
```bash
cd frontend
npm run build   # outputs dist/
npm run preview # optional local preview
```

---

### Development Quick Start (Local)
1. Start MongoDB (default localhost:27017).
2. Backend:
   - Set `MONGO_URI` and `JWT_SECRET`
   - `npm install && npm run dev` (port 8080)
3. Frontend:
   - `npm install && npm run dev` (port 5173)
4. Register a test user (customer): `POST /api/auth/register`
5. Login to get JWT; frontend stores token+user in localStorage.
6. As user: create a ticket; test classification and suggestions.
7. Register an agent/admin if needed for triage and config.

---

### Configuration & AI-like Triage
- Classification rules include account keywords (“password”, “reset”, “forgot password”, etc.) and map to category `account`.
- Confidence is more sensitive (score/2). Default auto-close threshold is configurable via `/api/config`.
- KB search uses full-text; appends bias terms for account-related queries.

---

### Role-Based Ticket Creation (Important)
- UI: “New Ticket” visible only to role `user` (customers).
- API: `POST /api/tickets` guarded by backend `requireCustomer` middleware. Agents/admins receive 403.

---

### CORS & Production Notes
- Update CORS in `backend/server.js` and `backend/utils/realtime.js` allowed origins to include your production frontend URL (e.g., `https://helpdesk.example.com`).
- If serving frontend and backend from different domains, set `VITE_API_BASE` to backend URL and expose proper CORS origins.
- For multi-instance backend with Socket.IO, consider a Redis adapter for scaling.

---

### Email, Notifications, SLA
- Email via `utils/mailer.js` (ensure SMTP creds if enabling real emails).
- Notification service creates Notification records and emits Socket.IO events to creators/assignees.
- SLA job flags tickets exceeding configured hours; creates audit logs and notifications. Trigger via schedule or manually (admin route available in code).

---

### Troubleshooting
- 401 Unauthorized: ensure `Authorization: Bearer <token>` header present.
- 403 Insufficient permissions: role restrictions enforced (e.g., ticket creation for users only).
- Realtime issues: check Socket.IO server origins and client URL; ensure port 8080 reachable.
- KB “not published”: only published KBs are publicly viewable.

---

### Suggested Production Workflow (High-Level)
1. Set environment variables securely (platform secrets).
2. Point backend to production MongoDB (Atlas).
3. Build frontend for production and serve via Nginx; proxy `/api` to backend service.
4. Update CORS to production frontend origin.
5. Create initial admin (register with role=admin for first-time bootstrap).
6. Verify agent and user flows in staging:
   - Ticket creation (user), triage/suggest (agent), notifications, audit logs, KB view.
7. Enable monitoring (Sentry/APM or platform logs) and health checks on `/health`.

---

### Example curl Snippets
- Register (user):
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Uma","email":"user@example.com","password":"Password123!"}'
```
- Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'
```
- Create Ticket (user):
```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Forgot password","description":"Need reset"}'
```
- Agent Suggestion:
```bash
curl -H "Authorization: Bearer AGENT_TOKEN" http://localhost:8080/api/agent/suggestion/TICKET_ID
```

---

### Security Notes
- Keep `JWT_SECRET` truly random and rotated via your platform’s secret manager.
- Restrict admin-only routes behind role middleware.
- For Internet-facing deployment, use HTTPS (TLS) and secure cookies if adopting cookie-based auth later.
- Sanitize mailer credentials and disable email in development by default.

---

### Maintenance & Documentation
- Maintain a CHANGELOG and release notes.
- Record environment variable definitions and where they’re set (runbook).
- Document routine tasks: adding agents, adjusting config, scaling backend, updating allowed origins.

---

### License
ISC
