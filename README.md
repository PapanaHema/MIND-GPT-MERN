# MindGPT

MindGPT is separated into two applications:

```text
frontend/   React + Webpack user interface
backend/    Express API, authentication, user data, and Google AI integration
```

## Setup

```bash
npm run install:all
```

Copy `backend/.env.example` to `backend/.env`, then add your API key and secrets.

Set the MongoDB connection in `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/mindgpt
CORS_ORIGINS=http://localhost:3000
```

Passwords are stored only as bcrypt hashes, never as plaintext.

For deployed frontends, add comma-separated origins:

```env
CORS_ORIGINS=http://localhost:3000,https://your-mindgpt-site.example
```

To migrate accounts from the previous JSON user file:

```bash
npm --prefix backend run migrate:users
```

## Development

Run both applications from the project root:

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8999`

You can also run them independently:

```bash
npm --prefix frontend run dev
npm --prefix backend run dev
```

## Checks

```bash
npm run lint
npm run build
```
