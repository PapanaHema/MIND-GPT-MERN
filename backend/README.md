## Backend MVC structure

```text
backend/
├── config/       Environment and MongoDB configuration
├── controllers/  Request and response handling
├── middleware/   Authentication, CORS, and error handling
├── models/       Mongoose data models
├── routes/       API endpoint definitions
├── services/     Google AI integration
├── utils/        Shared email, token, media, and async helpers
├── app.js        Express application composition
└── server.js     Database connection and HTTP server startup
```

The public API remains unchanged:

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/chat`
