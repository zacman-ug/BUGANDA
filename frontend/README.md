# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

Deployment notes
 - Configure API base URL via environment variable: create `frontend/.env` (or set `VITE_API_URL` in your host) and set:
	 - `VITE_API_URL=http://localhost:5000` (development default)
 - Example file: `frontend/.env.example`

Run commands
 - Install deps: `npm install`
 - Development server: `npm run dev`
 - Production build: `npm run build` (outputs to `dist/`)

Behavior
 - The app sets `axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'` in `src/context/HeritageContext.jsx`.
 - All API requests use relative `/api/...` paths so they resolve against `VITE_API_URL` at runtime.

If you want, I can add a short troubleshooting section or instructions to serve `dist/` with nginx or a static host.
