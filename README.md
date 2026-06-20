# Nana’s Akara (Nana's Akara)

Premium Nigerian online food ordering platform.

- **Backend:** Node.js + Express + MongoDB + JWT
- **Frontend:** Static HTML/CSS/JavaScript
- **Payments:** Paystack (initialize + verify + webhook)
- **Uploads:** Cloudinary (menu images + CV uploads)

## Architecture (high level)

- **Frontend** (static): renders pages and calls backend APIs from `frontend/js/*.js`.
- **Backend API** (Express): lives in `bflux-main/src`.
  - `src/routes/*` mounts endpoints
  - `src/controllers/*` implement request handlers
  - `src/services/*` contain business logic (orders, payments, settings, emails, uploads)
  - `src/middlewares/*` handle auth, validation, error handling, upload validation, security headers
  - `src/models/*` are MongoDB/Mongoose models

## Folder structure

```text
.
├─ bflux-main/                     # Backend API
│  ├─ server.js                   # Entrypoint
│  ├─ src/
│  │  ├─ app.js                   # Express app bootstrap
│  │  ├─ config/                # env/db/paystack/cloudinary/email/logger
│  │  ├─ controllers/          # route handlers
│  │  ├─ middlewares/          # security/auth/validate/upload/errors
│  │  ├─ models/               # Mongoose schemas
│  │  ├─ routes/               # API routers
│  │  ├─ services/             # order/payment/email/settings/upload logic
│  │  ├─ validators/           # Joi validators
│  │  ├─ utils/                 # helpers
│  │  └─ views/emails/        # email templates
│  └─ test/                      # API integration tests
│
├─ frontend/                       # Static site + admin pages
│  ├─ index.html
│  ├─ js/                          # public JS
│  ├─ admin/                       # admin HTML pages
│  └─ docker-entrypoint.d/         # runtime API base URL injection
│
├─ docker-compose.yml              # Local multi-container setup
├─ .env.example                   # Repo-wide env template
└─ docs/                          # Previously generated audit/deployment reports
```

## Installation (local)

### Prerequisites

- Node.js **>= 18**
- MongoDB (local or Atlas)

### Backend

```bash
cd bflux-main
npm install
npm run dev
```

Health check:

- `GET http://localhost:4000/api/status`

### Frontend

Frontend is served via its container (Nginx) or any static host.

## Environment variables

Copy `.env.example` to an actual `.env` file (do **not** commit secrets).

Backend reads environment variables from `bflux-main/src/config/env.js`.

Required in production:

- `NODE_ENV`
- `MONGODB_URI`
- `JWT_SECRET`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_WEBHOOK_SECRET`
- `FRONTEND_URL`

Required for optional integrations:

- `FROM_EMAIL` (emails)
- `RESEND_API_KEY` (preferred transactional email)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (SMTP fallback)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (uploads)

See **`.env.example`** for the complete list.

## MongoDB setup

1. Create a MongoDB database (or use MongoDB Atlas).
2. Set `MONGODB_URI`.
3. Seed baseline data:

```bash
cd bflux-main
npm run seed
```

If `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` are set, a super-admin is created.

## Paystack setup (flow)

### 1) Initialize payment

- Backend: `POST /api/payments/initialize`
- Receives an `orderId` and customer email.
- Creates a Paystack transaction and returns `authorization_url`.

### 2) Verify payment (redirect)

- Backend: `GET /api/orders/verify/:reference`
- Confirms the Paystack reference server-side.
- Updates the order to `paymentStatus: "success"`.

### 3) Webhook (server confirmation)

- Backend: `POST /api/payments/webhook`
- Validates Paystack webhook signature using `PAYSTACK_WEBHOOK_SECRET`.
- Marks the order paid on `charge.success`.

## Image upload flow (Cloudinary)

- Upload middleware validates file type and size.
- Upload service streams in-memory buffers to Cloudinary.
- Admin endpoint:
  - `POST /api/admin/menu-items/:id/images` (multipart `images[]`)
- Public endpoint(s):
  - `POST /api/careers` uses multipart upload field `cv`.

Local disk uploads are not used; the repository does not rely on a `.uploads/` directory.

## Docker

### Local

```bash
docker-compose up --build
```

Services:

- MongoDB
- Backend (`bflux-main`)
- Frontend (static Nginx)

## Render deployment

- `bflux-main/render.yaml` deploys the backend.
- Set environment variables in Render to match `.env.example`.

## Hostinger VPS deployment

Recommended topology:

- Nginx reverse proxy on ports 80/443
- Backend on internal port **4000**
- Frontend served as static files via Nginx

See `VPS_SETUP.md` for step-by-step VPS instructions.

## API quick reference

Public:

- `GET /api/menu`
- `GET /api/menu/:slug`
- `GET /api/categories`
- `POST /api/orders`
- `GET /api/orders/verify/:reference`
- `POST /api/payments/initialize`
- `POST /api/payments/webhook`
- `POST /api/contact`
- `POST /api/careers` (multipart `cv`)
- `GET /api/testimonials`
- `GET /api/settings`
- `GET /api/delivery-zones`
- `POST /api/newsletter`

Admin (JWT required):

- `POST /api/auth/admin/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/admin/*` (CRUD)
- `POST /api/admin/menu-items/:id/images` (multipart `images[]`)

## Testing

Run backend API tests:

```bash
cd bflux-main
npm test
```

## Troubleshooting

- **Mongo connection failures:** verify `MONGODB_URI` and firewall/network to Mongo.
- **Paystack webhook failures:** ensure the webhook secret matches `PAYSTACK_WEBHOOK_SECRET` and that the backend receives raw body.
- **Uploads not working:** confirm Cloudinary credentials and that admin endpoints use multipart fields correctly.
- **Order verification fails:** ensure `authorization_url` redirect leads to `/order-verify.html?reference=...`.

