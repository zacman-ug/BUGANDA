**Deployment & Run (Quick Start)**

- **Backend (Node/Express)**
  - Required env vars (copy from `backend/.env.example` to `backend/.env`):
    - `PORT` (default 5000)
    - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
    - `JWT_SECRET`
    - `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM` (for password reset)
  - Local dev:
    ```bash
    cd backend
    npm install
    # create backend/.env from .env.example and fill values
    npm start
    ```
  - Production (simple):
    ```bash
    cd backend
    npm install --production
    npm run start:prod
    ```
  - Start with PM2 (recommended for process management):
    ```bash
    cd backend
    npm install -g pm2   # if not installed
    pm2 start ecosystem.config.js --env production
    pm2 save
    ```

- **Frontend (Vite + React)**
  - Create `frontend/.env` or set `VITE_API_URL` in environment. Example in `frontend/.env.example`.
  - Local dev:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
  - Build for production:
    ```bash
    cd frontend
    npm install
    # ensure frontend/.env contains VITE_API_URL pointing at your backend
    npm run build
    ```

Notes:
- The frontend is configured to use `axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'`.
- Make sure your backend is reachable from the frontend host and the DB is initialized using the provided SQL files before running.
