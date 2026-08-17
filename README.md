# FocusTM Admin

Private admin dashboard: Login, Dashboard stats, Products CRUD, Orders management.

## Stack
Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Firebase Auth (required — admin claim) · Recharts

## Dev
```bash
npm install
cp .env.example .env.local  # same Firebase config as store + API URL
npm run dev                  # http://localhost:3001
```

## Deploy → Vercel (separate project from store)
- Build command: `npm run build`
- Custom domain: `admin.focustm.com`
- Env vars: all `NEXT_PUBLIC_*` from `.env.example`

## Access Control
Only users with `admin: true` Firebase custom claim can access API write routes.
Run the `POST /auth/make-admin` bootstrap once after your first deploy.
