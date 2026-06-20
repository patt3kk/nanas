# Nana’s Akara Deployment Guide

This guide covers deploying the backend and frontend to:
- **Render** (backend)
- **Vercel** (frontend)
- **Hostinger VPS** (full stack or reverse-proxy topology)

## 0) What’s in the repo

- **Backend:** `bflux-main/` (Express + MongoDB + Paystack + Cloudinary)
- **Frontend:** `frontend/` (static multi-page app + admin UI)
- **Local orchestration:** `docker-compose.yml`

---

## 1) Environment variables

See `.env.example` for the canonical list.

Backend env is used by: `bflux-main/src/config/env.js`.

### Required in production

- `PORT`
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`
- `FRONTEND_URL`

### Paystack

- `PAYSTACK_PUBLIC_KEY` (safe to expose; used client-side only)
- `PAYSTACK_SECRET_KEY` (server-side only)
- Webhook signature must match `PAYSTACK_WEBHOOK_SECRET`

### Cloudinary (uploads)

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Emails (optional)

- `RESEND_API_KEY` OR SMTP:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `FROM_EMAIL`

---

## 2) Render deployment (backend)

1. Create a Render **Web Service** for `bflux-main`.
2. Set build command and start command consistent with your setup:
   - Install: `npm install`
   - Start: `npm start` (or `node server.js`)
3. Add environment variables from `.env.example`.
4. Confirm Render receives webhooks:
   - Your Paystack webhook URL must point to `https://<render-service>/api/payments/webhook`.
   - Backend must be configured to receive raw webhook body (it is implemented in `src/app.js`).

---

## 3) Vercel deployment (frontend)

The frontend is static.

1. Deploy `frontend/` as a static site in Vercel.
2. Ensure API base URL is correct:
   - Container-based injection exists for Docker, but on Vercel you should set `FRONTEND_API_BASE_URL` during build/runtime.

If you use Vercel’s environment variables, ensure `frontend/js/runtime-config.js` is configured to read them.

---

## 4) Hostinger VPS deployment (recommended)

Recommended Nginx topology:
- **Nginx** terminates TLS
- Static **frontend** served by Nginx
- **backend** runs behind Nginx (Node container or process)

### Suggested ports

- Nginx: 80/443
- Backend: `4000`

### Nginx routes

- `/api/*` → backend upstream
- `/` and `/frontend/*` → static frontend

Keep admin endpoints behind your reverse proxy auth/WAF policy if needed.

---

## 5) Paystack deployment checklist

1. Set Paystack keys (test → live).
2. Configure Paystack payment callback:
   - Callback URL should resolve to: `${FRONTEND_URL}/order-verify.html`
   - Backend uses `FRONTEND_URL` to build callback URL.
3. Configure Paystack webhook URL:
   - Point to: `${BACKEND_PUBLIC_URL}/api/payments/webhook`
4. Verify:
   - Initialize → redirect → verify endpoint updates order
   - Webhook marks order paid idempotently

---

## 6) Operational checklist

- Run `npm test` on backend before go-live.
- Seed initial data:
  - Delivery zones + settings + super admin
  - `npm run seed`
- Ensure MongoDB backups are configured (Atlas or VPS).

---

## Troubleshooting

### Backend fails to boot
- Ensure required env vars exist.
- Verify Node version compatibility.

### Paystack webhook returns 401
- Ensure `PAYSTACK_WEBHOOK_SECRET` matches Paystack.
- Ensure webhook handler receives raw body.

### Uploads fail
- Ensure Cloudinary env vars are set.
- Ensure multipart field names match handlers (`images[]`, `cv`).

