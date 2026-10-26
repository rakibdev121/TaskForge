# TaskForge

A purple-gradient full-stack task management starter built with React + Vite, Express, and PostgreSQL.

## Features
- Register and log in with JWT authentication and bcrypt password hashing
- Dashboard summary
- Create, edit, and delete projects
- Create, edit, delete, and move tasks between workflow statuses
- Task priorities and due dates
- PostgreSQL schema with user ownership checks
- Responsive purple-gradient UI
- API health check

## Requirements
- Node.js 20+ recommended
- PostgreSQL 14+ (or a hosted PostgreSQL provider)

## 1. Configure PostgreSQL
Create a database, for example `taskforge`, then apply the schema:

```bash
psql "$DATABASE_URL" -f backend/schema.sql
```

If your provider requires SSL, use a connection string with its required SSL options. The server supports `DATABASE_SSL=true`.

## 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` values using your hosting dashboard or command line:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: long random secret (at least 32 characters recommended)
- `FRONTEND_URL`: your frontend origin, e.g. `http://localhost:5173`

Install and run:

```bash
npm install
npm run dev
```

Backend defaults to `http://localhost:3000`.

## 3. Configure the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend defaults to `http://localhost:5173`. Set `VITE_API_URL` if your backend is hosted elsewhere, e.g. `https://your-api.example.com/api`.

## API routes
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/projects`
- `PATCH/DELETE /api/projects/:id`
- `GET/POST /api/tasks`
- `PATCH/DELETE /api/tasks/:id`

All project and task routes require `Authorization: Bearer <token>`.

## Security notes
- Never commit `.env` files or secrets.
- Use HTTPS in production.
- Configure exact CORS origins in production.
- For production use, add rate limiting, email verification, password reset, audit logs, and automated tests before opening the service publicly.
