# ScaleX

An exclusive venture capital platform where verified founders connect with capital.

## Stack

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion
- **Backend:** Python 3.11 · Django 5 · Django REST Framework · JWT auth
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Render (backend) · Vercel or Render (frontend)

## Structure

```
scalex/
├── frontend/   # Next.js app
└── backend/    # Django API
```

## Quick start

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_API_URL
npm run dev
```
Open http://localhost:3000

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env               # fill in SUPABASE DATABASE_URL + SECRET_KEY
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
API runs at http://localhost:8000

See `DEPLOY.md` at the repo root for full Supabase + Render walkthrough.
