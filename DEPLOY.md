# Deploying ScaleX

This guide walks you through getting ScaleX online using **Supabase** for the database and **Render** for both the backend API and the frontend site.

Time needed: about 20 minutes.

---

## 1. Set up Supabase (database)

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is fine).
2. Click **New project**.
3. Pick:
   - **Name:** `scalex`
   - **Database password:** generate a strong one and **save it somewhere safe**. You'll need it in a moment.
   - **Region:** pick the one closest to your users.
4. Wait ~2 minutes for the project to provision.
5. Once it's ready, go to **Project Settings → Database**.
6. Scroll to **Connection string** and select the **URI** tab. There are two you'll see:
   - **Direct connection** (port 5432) — use this one. It's what Django migrations need.
   - Transaction pooler (port 6543) — don't use this for Django; it doesn't support all the features Django's ORM needs.
7. Copy the direct connection URI. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefgh.supabase.co:5432/postgres
   ```
8. Replace `[YOUR-PASSWORD]` with the password from step 3.
9. Keep this string handy — you'll paste it into Render in a minute.

---

## 2. Push the code to GitHub

Render deploys from a Git repo, so:

```bash
cd scalex
git init
git add .
git commit -m "Initial ScaleX commit"
# create an empty repo on github.com, then:
git remote add origin https://github.com/YOUR-USERNAME/scalex.git
git branch -M main
git push -u origin main
```

---

## 3. Deploy the backend API on Render

1. Go to [render.com](https://render.com) and sign up (free tier works).
2. Click **New → Web Service**.
3. Connect your GitHub account and pick the `scalex` repo.
4. Fill in:
   - **Name:** `scalex-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn scalex.wsgi:application`
   - **Plan:** Free
5. Scroll down to **Environment Variables** and add:
   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | click **Generate** to auto-fill |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `.onrender.com` |
   | `DATABASE_URL` | *paste the Supabase URI from step 1* |
   | `CORS_ALLOWED_ORIGINS` | leave blank for now, you'll come back |
6. Click **Create Web Service**.
7. Watch the build log. When it's green, copy your API's URL — something like:
   ```
   https://scalex-api.onrender.com
   ```
8. Visit it in the browser. You should see `{"status":"ok","service":"scalex-api"}`.

### Create your admin login

Once deployed, open Render's **Shell** tab for `scalex-api` and run:
```bash
python manage.py createsuperuser
```
Enter an email and password. You can then log into `/admin/` on your API URL to review applications.

---

## 4. Deploy the frontend on Render

1. In Render, click **New → Web Service** again.
2. Pick the same `scalex` repo.
3. Fill in:
   - **Name:** `scalex-web`
   - **Root Directory:** `frontend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Add one environment variable:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | your API URL from step 3, e.g. `https://scalex-api.onrender.com` |
5. Click **Create Web Service**.
6. When it's green, copy the frontend URL — something like:
   ```
   https://scalex-web.onrender.com
   ```

---

## 5. Wire CORS between the two

Back in the `scalex-api` service on Render:

1. Go to **Environment**.
2. Edit `CORS_ALLOWED_ORIGINS` and set it to your frontend URL:
   ```
   https://scalex-web.onrender.com
   ```
3. Save. Render will auto-redeploy the API.

---

## 6. Smoke-test the live site

Visit your frontend URL and:

1. Click **Apply** in the nav.
2. Fill out the 5-step form and submit.
3. You should be redirected to `/dashboard` and see your application status.
4. Log into the Django admin at `https://scalex-api.onrender.com/admin/` with the superuser you created — the submitted application will be waiting in the **Applications** section.

Done. 🎉

---

## Render free-tier heads-up

Free Render services spin down after 15 minutes of inactivity. The first request after that takes ~30 seconds to wake up. For production traffic, upgrade to a paid plan ($7/mo per service).

## Alternative: deploy the frontend on Vercel

If you want faster frontend performance, deploy `frontend/` on Vercel instead:

1. Go to [vercel.com](https://vercel.com), import the `scalex` repo.
2. Set **Root Directory** to `frontend`.
3. Add env var `NEXT_PUBLIC_API_URL` = your Render API URL.
4. Click Deploy. Update `CORS_ALLOWED_ORIGINS` on the API to your `.vercel.app` URL.

## Troubleshooting

- **"relation does not exist" errors** → migrations didn't run. Open the Render shell for `scalex-api` and run `python manage.py migrate`.
- **CORS errors in the browser console** → double-check `CORS_ALLOWED_ORIGINS` on the API exactly matches your frontend URL (no trailing slash).
- **Can't connect to Supabase** → make sure you used the **direct** connection string (port 5432), not the pooler (6543). Also verify your password doesn't contain `@` or `/` — if it does, URL-encode those characters.
