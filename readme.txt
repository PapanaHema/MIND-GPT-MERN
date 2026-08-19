# MindGPT MERN

MindGPT is a full-stack AI chat application built with React, Express, MongoDB, and Google Gemini. It includes secure user authentication, AI conversations, image and video prompts, camera capture, profile pictures, password reset, chat history, and light/dark themes.

## Features

- User signup and login with JWT authentication
- Passwords protected with bcrypt hashing
- Forgot-password and reset-code flow
- Google Gemini text, image, and video prompts
- Front/rear camera capture from supported browsers
- Profile-picture upload and removal
- Per-account chat history stored in the browser
- Open, delete, or clear saved conversations
- Light and dark themes
- Responsive desktop and mobile interface
- Gemini fallback-model support
- MongoDB user storage
- MVC-style Express backend

## Technology stack

### Frontend

- React 18
- React Context API
- Webpack 5
- Babel
- CSS
- Browser MediaDevices API

### Backend

- Node.js
- Express 5
- MongoDB and Mongoose
- Google Gen AI SDK
- JSON Web Tokens
- bcryptjs
- CORS

## Project structure

```text
MIND-GPT-MERN/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── main/
│   │   │   └── sidebar/
│   │   ├── config/
│   │   ├── context/
│   │   ├── App.js
│   │   └── main.js
│   ├── index.html
│   ├── webpack.config.cjs
│   └── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── package.json
└── README.md
```

## Requirements

- Node.js 22.18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection
- Google Gemini API key

## Installation

Open a terminal in the project root:

```bash
cd /Users/g.srinuvas/UI-development/MIND-GPT-MERN
npm run install:all
```

This installs the root, frontend, and backend dependencies.

## Environment configuration

Create `backend/.env` and add:

```env
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-2.5-flash-lite

PORT=8999
JWT_SECRET=replace_with_a_long_random_secret
MONGODB_URI=mongodb://127.0.0.1:27017/mindgpt
CORS_ORIGINS=http://localhost:3000
```

For multiple allowed frontend origins, separate them with commas:

```env
CORS_ORIGINS=http://localhost:3000,https://your-domain.example
```

Never commit `backend/.env` or expose `GEMINI_API_KEY` and `JWT_SECRET`.

## Run in development

Ensure MongoDB is running, then execute:

```bash
npm run dev
```

Open:

- Frontend: http://localhost:3000
- Backend: http://localhost:8999
- Health check: http://localhost:8999/api/health

The Webpack development server proxies frontend `/api` requests to the backend.

### Run separately

Backend:

```bash
npm --prefix backend run dev
```

Frontend:

```bash
npm --prefix frontend run dev
```

## Available scripts

| Command | Description |
|---|---|
| `npm run install:all` | Install all project dependencies |
| `npm run dev` | Run frontend and backend together |
| `npm run build` | Create the frontend production build |
| `npm run lint` | Lint the frontend and check backend syntax |
| `npm --prefix backend run migrate:users` | Migrate legacy JSON users to MongoDB |
| `npm --prefix frontend run preview` | Preview the built frontend |

## API endpoints

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API availability |

### Authentication

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create an account |
| POST | `/api/auth/login` | No | Log in and receive a JWT |
| GET | `/api/auth/me` | Bearer token | Get the current user |
| POST | `/api/auth/forgot-password` | No | Generate a password-reset code |
| POST | `/api/auth/reset-password` | No | Reset the password using a code |
| PUT | `/api/auth/profile-picture` | Bearer token | Add or replace a profile picture |
| DELETE | `/api/auth/profile-picture` | Bearer token | Remove the profile picture |

### AI chat

| Method | Endpoint | Authentication | Description |
|---|---|---|---|
| POST | `/api/chat` | Bearer token | Send a text or media prompt to Gemini |

Example:

```json
{
  "prompt": "Explain what is shown in this image",
  "media": {
    "mimeType": "image/jpeg",
    "data": "base64-data"
  }
}
```

The `media` property is optional for text-only prompts.

## Media support

Supported images:

- JPEG
- PNG
- WebP
- GIF

Supported videos include:

- MP4
- MPEG
- QuickTime
- AVI
- WebM
- FLV
- WMV
- 3GP

Recommended limits:

- Images under 7 MB
- Videos under 12 MB
- Profile pictures under 2 MB in JPG, PNG, or WebP format

Camera access requires browser permission and normally works on `localhost` or HTTPS.

## Authentication

After login or signup, the frontend stores the JWT under `mindgpt_token` in local storage. Protected API calls send:

```http
Authorization: Bearer YOUR_TOKEN
```

Passwords and reset codes are stored only as hashes.

In development, generated password-reset codes are returned by the API and printed in the backend terminal. A production deployment should deliver reset codes through email or another secure channel.

## Chat history and settings

Chat history and appearance settings are stored locally in the browser:

- History is separated by user account.
- Up to 100 conversations are retained.
- Users can reopen, delete, or clear conversations.
- Theme preferences persist between sessions.

Clearing browser storage removes locally saved history and settings.

## Production build

Create the frontend build:

```bash
npm run build
```

The output is generated in:

```text
frontend/dist/
```

Run the backend:

```bash
npm --prefix backend start
```

Deploy `frontend/dist` using a static host and deploy the backend separately. Update `CORS_ORIGINS` with the deployed frontend URL.

## Troubleshooting

### MongoDB connection failed

- Confirm MongoDB is running.
- Verify `MONGODB_URI`.
- If using Atlas, verify network access and credentials.

### Gemini API error

- Confirm `GEMINI_API_KEY` is valid.
- Verify the selected model is available to the API key.
- HTTP `429` means the quota or rate limit was reached.
- HTTP `503` means the Gemini service is temporarily busy.

### CORS error

Ensure the exact frontend origin is listed:

```env
CORS_ORIGINS=http://localhost:3000
```

Restart the backend after editing `.env`.

### Port already in use

The expected development ports are:

- Frontend: `3000`
- Backend: `8999`

Stop the process using the port or update both the backend port and Webpack proxy target.

### Camera does not open

- Allow camera permission in browser settings.
- Use `localhost` or HTTPS.
- Close other applications using the camera.

## Security notes

- Use a long, random `JWT_SECRET`.
- Never expose the Gemini API key in frontend code.
- Keep `.env` out of version control.
- Restrict production CORS origins.
- Use HTTPS in production.
- Replace the development password-reset response with secure email delivery.

## License

Add the license appropriate for your project before public distribution.