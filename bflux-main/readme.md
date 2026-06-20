# Nana's Akara Backend

Production-grade Node.js/Express/MongoDB backend powering Nana's Akara (premium Nigerian online food ordering platform).

## Features

- Public ordering APIs (guest checkout)
- Admin authentication (JWT) + role-based access control (Admin / Super Admin)
- Menu, categories, orders, customers, testimonials, careers, contact messages, delivery zones, site settings
- Paystack payments: initialize, verify, webhook processing
- Email notifications (Resend, Nodemailer fallback)
- Cloudinary uploads (menu images, assets, CV uploads)
- Security hardening (Helmet, CORS, rate limiting, XSS clean, HPP, mongo sanitize)

## Requirements

- Node.js >= 18
- MongoDB (local or Atlas)

## Setup

```bash
cd bflux-main
npm install
```

Create a `.env` file (or update the existing one) using `.env.example`.

## Run locally

```bash
npm run dev
```

Health check:

- `GET http://localhost:4000/api/status`

## Seeding

Seeds default data (delivery zones, site settings, sample categories/menu items) and creates a Super Admin if these env vars are set:

- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `SUPER_ADMIN_NAME` (optional)

Run:

```bash
npm run seed
```

## API Overview

Base path:

- `/api`

Public endpoints:

- `GET /api/menu`
- `GET /api/menu/:slug`
- `GET /api/categories`
- `POST /api/orders`
- `GET /api/orders/verify/:reference`
- `POST /api/payments/initialize`
- `POST /api/payments/webhook`
- `POST /api/contact`
- `POST /api/careers` (multipart: `cv` file optional)
- `GET /api/testimonials`
- `GET /api/settings`

Admin endpoints:

- `POST /api/auth/admin/login`
- `GET /api/auth/me`
- CRUD under `/api/admin/*` (users, categories, menu-items, orders, customers, contact-messages, career-applications, testimonials, delivery-zones, settings)
- Uploads:
  - `POST /api/admin/menu-items/:id/images` (multipart: `images[]`)
  - `POST /api/admin/assets/upload` (multipart: `file`)

## Paystack Notes

Recommended flow:

1. Create order (`POST /api/orders`)
2. Initialize payment (`POST /api/payments/initialize`) to get `authorization_url`
3. After Paystack redirect, verify (`GET /api/orders/verify/:reference`)
4. Webhook (`POST /api/payments/webhook`) is used for server-side confirmation and idempotent order updates

## Deployment (Render)

`render.yaml` is included. Set the environment variables in Render using `.env.example` as reference.

## Folder Structure

```
bflux-main/
  src/
    config/
    controllers/
    middlewares/
    models/
    routes/
    scripts/
    services/
    utils/
    views/
      emails/
    app.js
  server.js
```
