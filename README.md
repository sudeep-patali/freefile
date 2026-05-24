# FreeFile — Full-Stack App

A clean, professional file and notes manager with JWT auth and SQLite persistence.

## Project Structure

```
freefile/
├── backend/          # Node.js + Express + SQLite
│   ├── server.js
│   ├── db.js
│   ├── middleware/auth.js
│   ├── routes/auth.js
│   ├── routes/files.js
│   └── package.json
└── frontend/         # React SPA
    ├── src/
    │   ├── App.jsx
    │   ├── index.js
    │   ├── index.css
    │   ├── hooks/useAuth.js
    │   ├── utils/api.js
    │   ├── pages/AuthPage.jsx
    │   ├── pages/Dashboard.jsx
    │   ├── pages/FileDetail.jsx
    │   └── components/AddFileModal.jsx
    └── package.json
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set a strong JWT_SECRET
npm run dev
```

The backend will start at **http://localhost:5000** and auto-create `freefile.db`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The React app will start at **http://localhost:3000** and proxy API calls to `:5000`.

## Environment Variables (backend/.env)

| Variable        | Description                              | Default          |
|----------------|------------------------------------------|------------------|
| `PORT`          | Port for Express server                  | `5000`           |
| `JWT_SECRET`    | Secret for signing JWT tokens            | **Set this!**    |
| `DB_PATH`       | Path to SQLite database file             | `./freefile.db`  |
| `FRONTEND_URL`  | Allowed CORS origin                      | `http://localhost:3000` |

## API Reference

### Auth (no token required)
| Method | Endpoint              | Body                        |
|--------|-----------------------|-----------------------------|
| POST   | `/api/auth/signup`    | `{name, email, password}`   |
| POST   | `/api/auth/signin`    | `{email, password}`         |

### Files (requires `Authorization: Bearer <token>`)
| Method | Endpoint       | Body / Params              |
|--------|----------------|----------------------------|
| GET    | `/api/files`   | —                          |
| POST   | `/api/files`   | `{name}`                   |
| DELETE | `/api/files`   | `{ids: [1,2,3]}`           |

### Entries (requires auth)
| Method | Endpoint                              | Body        |
|--------|---------------------------------------|-------------|
| GET    | `/api/files/:fileId/entries`          | —           |
| POST   | `/api/files/:fileId/entries`          | `{content}` |
| PUT    | `/api/files/:fileId/entries/:id`      | `{content}` |
| DELETE | `/api/files/:fileId/entries/:id`      | —           |

## Features

- **Auth**: Sign up / sign in with bcrypt-hashed passwords, JWT sessions (7-day expiry)
- **Dashboard**: View all files in a grid, multi-select + bulk delete
- **Files**: Create named files, see entry count per file
- **Entries**: Add, edit inline (click to edit), delete entries with timestamps
- **Security**: All queries scoped to `user_id`, JWT verified on every protected route
- **Persistence**: SQLite via `better-sqlite3` — zero config, single file DB

## Production Notes

For production deployment:
1. Set `JWT_SECRET` to a long random string (e.g. `openssl rand -hex 32`)
2. Set `NODE_ENV=production`
3. Set `FRONTEND_URL` to your actual frontend domain
4. Run `npm run build` in the frontend, serve static files from Express or a CDN
5. Consider switching to PostgreSQL by changing `db.js` to use `pg` package
