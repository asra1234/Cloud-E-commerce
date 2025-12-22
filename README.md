# CloudRetail Microservices Assignment

This repo contains a sample full-stack web application for the CloudRetail case study.

Stack:

- Backend: Node.js, Express, MySQL
- Frontend: React, Bootstrap

Folders:

- `backend/` - Express API server
- `frontend/` - React app

Quick setup

1. Create a MySQL database and run `backend/db.sql` to create tables and seed sample data.
2. Copy `backend/.env.example` to `.env` and fill DB credentials and JWT secret.
3. Start backend:

```bash
cd backend
npm install
npm run dev
```

4. Start frontend:

```bash
cd frontend
npm install
npm start
```

API endpoints are available at `http://localhost:5000/api` by default.
