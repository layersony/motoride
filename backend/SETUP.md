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

## Production Deployment Notes

1. Change `SECRET_KEY` to a strong random value
2. Set `DEBUG=False`
3. Switch to PostgreSQL: add `psycopg2-binary` to requirements and update `DATABASES`
4. Set `ALLOWED_HOSTS` to your domain
5. Collect static files: `python manage.py collectstatic`
6. Use gunicorn or uvicorn behind nginx
