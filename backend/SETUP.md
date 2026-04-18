# MotoRide Backend — Setup Guide

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.11+ |
| Framework | Django 4.2 (LTS) |
| API | Django REST Framework |
| Auth | JWT via SimpleJWT |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Admin | Django Admin (built-in) |

---

## Quick Start (Windows)

### 1. Create and activate a virtual environment

```cmd
cd "Ecommerce Motorcycle Website\backend"
python -m venv venv
venv\Scripts\activate
```

### 2. Install dependencies

```cmd
pip install -r requirements.txt
```

### 3. Set up your environment

```cmd
copy .env.example .env
```

Open `.env` and change `SECRET_KEY` to a long random string for production.

### 4. Run database migrations

```cmd
python manage.py migrate
```

### 5. Seed initial data (categories, products, testimonials)

```cmd
python manage.py seed_data
```

### 6. Create a superuser (admin account)

```cmd
python manage.py createsuperuser
```

### 7. Start the development server

```cmd
python manage.py runserver
```

The backend is now running at **http://localhost:8000**

---

## Admin Panel

Visit **http://localhost:8000/admin/** and log in with your superuser credentials.

### What you can manage in the admin:

| Section | What you can do |
|---|---|
| **Products › Categories** | Add/edit/delete categories, set sort order |
| **Products › Products** | Full CRUD with inline images, specs, features; thumbnail previews; bulk edit price/stock/flags |
| **Products › Reviews** | Approve/reject customer reviews, bulk actions |
| **Orders › Orders** | View all orders with colour-coded status/payment badges, update status |
| **Orders › Cart Items** | See what's in every customer's cart |
| **Core › Testimonials** | Manage homepage testimonials, set sort order |
| **Core › Newsletter Subscribers** | View/export subscribers |
| **Core › Site Settings** | Edit hero text, contact info, social links, shipping thresholds, tax rate |
| **Users › Users** | Full user management with profile fields |

---

## API Endpoints

### Auth
| Method | URL | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user → returns JWT tokens |
| POST | `/api/auth/login/` | Login → returns JWT tokens |
| POST | `/api/auth/logout/` | Blacklist refresh token |
| GET/PATCH | `/api/auth/profile/` | Get or update own profile |
| POST | `/api/auth/change-password/` | Change password |
| POST | `/api/token/refresh/` | Refresh access token |

### Products
| Method | URL | Description |
|---|---|---|
| GET | `/api/products/categories/` | All active categories |
| GET | `/api/products/` | Paginated products (filter: category, filter, min/max price, search, ordering) |
| GET | `/api/products/featured/` | Featured products |
| GET | `/api/products/new-arrivals/` | New arrival products |
| GET | `/api/products/sale/` | On-sale products |
| GET | `/api/products/{id}/` | Product detail (with images, specs, features, reviews) |
| GET | `/api/products/{id}/related/` | Related products in same category |
| GET/POST | `/api/products/{id}/reviews/` | List approved reviews / submit a review (auth required) |

### Cart (auth required)
| Method | URL | Description |
|---|---|---|
| GET | `/api/orders/cart/` | Get cart with totals |
| POST | `/api/orders/cart/` | Add item to cart |
| PATCH | `/api/orders/cart/{id}/` | Update item quantity |
| DELETE | `/api/orders/cart/{id}/` | Remove item |
| DELETE | `/api/orders/cart/clear/` | Clear entire cart |

### Orders (auth required)
| Method | URL | Description |
|---|---|---|
| GET | `/api/orders/` | User's order history |
| GET | `/api/orders/{id}/` | Single order detail |
| POST | `/api/orders/create/` | Place order from current cart |

### Core
| Method | URL | Description |
|---|---|---|
| GET | `/api/testimonials/` | Homepage testimonials |
| POST | `/api/newsletter/subscribe/` | Subscribe to newsletter |
| GET | `/api/settings/` | Public site settings |

---

## Connecting the React Frontend

The frontend already has the API service layer at `src/app/services/api.ts`.

1. Start the backend: `python manage.py runserver`
2. Start the frontend: `npm run dev` (from the project root)
3. The `VITE_API_URL` in `.env` points to `http://localhost:8000/api`

---

## Production Deployment

### Environment variables (all platforms)

Set these in your hosting dashboard — never commit real values to git.

| Variable | Example / Notes |
|---|---|
| `SECRET_KEY` | Long random string — run `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-app.onrender.com,api.yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `DATABASE_URL` | Provided automatically by Render/Railway PostgreSQL add-on |
| `INTASEND_API_TOKEN` | Your live IntaSend secret key |
| `INTASEND_PUBLISHABLE_KEY` | Your live IntaSend publishable key |
| `INTASEND_TEST_MODE` | `False` in production |
| `RESEND_API_KEY` | Your Resend API key |
| `DEFAULT_FROM_EMAIL` | `MotoRide <noreply@yourdomain.com>` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |

---

### Option A — Render (recommended for beginners)

Render gives you a free PostgreSQL database and auto-deploys from GitHub.

#### 1. Push the `backend/` folder to GitHub

Your repo should have `backend/` at the root (or deploy from a subfolder using the Root Directory setting).

#### 2. Create a PostgreSQL database

1. Render dashboard → **New → PostgreSQL**
2. Choose the free tier, pick a region close to your users
3. Copy the **Internal Database URL** (used only within Render) or the **External Database URL**

#### 3. Create a Web Service

1. Render dashboard → **New → Web Service** → connect your GitHub repo
2. Fill in the settings:

| Field | Value |
|---|---|
| **Root Directory** | `backend` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate` |
| **Start Command** | `gunicorn motoride.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2` |

3. Under **Environment Variables**, add all the variables from the table above.  
   For `DATABASE_URL`, paste the Internal Database URL from step 2.
4. Click **Create Web Service** — Render builds and deploys automatically.

#### 4. Seed data & create superuser (one-time)

Open the Render **Shell** tab for your service:

```bash
python manage.py seed_data
python manage.py createsuperuser
```

#### Media files on Render

Render's filesystem is ephemeral — uploaded images are lost on redeploy. For persistent media, use **Cloudinary** or an **S3-compatible bucket** (e.g. Cloudflare R2, AWS S3) and swap `MEDIA_ROOT` for a cloud storage backend via `django-storages`.

---

### Option B — Railway

Railway auto-detects Django and provisions PostgreSQL in one click.

#### 1. Create a new project

1. Railway dashboard → **New Project → Deploy from GitHub repo**
2. Select your repo and set **Root Directory** to `backend`

#### 2. Add a PostgreSQL plugin

Inside the project → **+ Add Plugin → PostgreSQL**  
Railway injects `DATABASE_URL` into your service automatically.

#### 3. Configure environment variables

In the service's **Variables** tab, add all variables from the table above.  
(`DATABASE_URL` is already set by the plugin — no action needed.)

#### 4. Set the start command

In **Settings → Deploy → Start Command**:

```
gunicorn motoride.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 2
```

And the build command:

```
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

#### 5. Seed & superuser

Railway dashboard → **Service → Shell**:

```bash
python manage.py seed_data
python manage.py createsuperuser
```

---

### Option C — Your Own VPS (Ubuntu 22.04 / 24.04)

Use this if you have a DigitalOcean Droplet, Hetzner VPS, or any Linux server.

#### 1. Install system packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv python3-pip postgresql postgresql-contrib nginx git
```

#### 2. Set up PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE motoride;
CREATE USER motoride_user WITH PASSWORD 'strong-password-here';
ALTER ROLE motoride_user SET client_encoding TO 'utf8';
ALTER ROLE motoride_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE motoride_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE motoride TO motoride_user;
\q
```

#### 3. Clone the repo and set up Python

```bash
cd /var/www
sudo git clone https://github.com/your-org/your-repo.git motoride
sudo chown -R $USER:$USER /var/www/motoride

cd /var/www/motoride/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 4. Create the `.env` file

```bash
cp .env.example .env
nano .env
```

Fill in all production values (especially `DATABASE_URL`, `SECRET_KEY`, `DEBUG=False`).

```
DATABASE_URL=postgres://motoride_user:strong-password-here@localhost:5432/motoride
SECRET_KEY=<generate with: python -c "import secrets; print(secrets.token_urlsafe(50))">
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
...
```

#### 5. Initialise the app

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py seed_data
python manage.py createsuperuser
```

#### 6. Create a systemd service

```bash
sudo nano /etc/systemd/system/motoride.service
```

```ini
[Unit]
Description=MotoRide Django API
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/motoride/backend
EnvironmentFile=/var/www/motoride/backend/.env
ExecStart=/var/www/motoride/backend/venv/bin/gunicorn \
          motoride.wsgi:application \
          --bind unix:/run/motoride.sock \
          --workers 3 \
          --threads 2 \
          --timeout 120
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now motoride
sudo systemctl status motoride   # should show "active (running)"
```

#### 7. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/motoride
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 20M;

    location /static/ {
        alias /var/www/motoride/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/motoride/backend/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/motoride.sock;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/motoride /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### 8. Enable HTTPS with Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Certbot auto-renews — nothing else needed.

#### Deploying updates (VPS)

```bash
cd /var/www/motoride
git pull origin main
source backend/venv/bin/activate
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart motoride
```

---

### Connecting the frontend after deployment

Update the frontend `.env` (or Vercel/Netlify environment variables):

```
VITE_API_URL=https://api.yourdomain.com/api
```

Then redeploy the frontend.
