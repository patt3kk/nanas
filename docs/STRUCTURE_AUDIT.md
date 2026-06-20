# Structure Audit Report

## Executive Summary

- Active backend: `bflux-main`
- Active frontend: `frontend`
- Repository root orchestrator: `docker-compose.yml`
- No real `client/` application exists in the current filesystem
- No `.uploads/` directory exists in the current filesystem
- `.trae/` contains IDE-generated planning documents and is not runtime code

## Root Inventory

| Path | Type | Purpose | Status |
| --- | --- | --- | --- |
| `.trae/` | Folder | Local Trae/IDE metadata and generated planning docs | Keep, non-production |
| `.trae/documents/nanas-akara-prd.md` | File | Product requirements draft | Keep, internal-only |
| `.trae/documents/nanas-akara-technical-architecture.md` | File | Architecture draft | Keep, internal-only |
| `bflux-main/` | Folder | Node.js/Express backend API | Authoritative |
| `frontend/` | Folder | Static HTML/CSS/JS storefront plus admin UI | Authoritative |
| `docker-compose.yml` | File | Local/VPS multi-container orchestration | Keep and improved |
| `.env.example` | File | Repository-wide environment template | Generated |
| `.gitignore` | File | Repository hygiene and secret exclusion | Generated |
| `docs/` | Folder | Production, audit, and deployment documentation | Generated |

## Missing Or Phantom Paths

| Path | Observed State | Interpretation |
| --- | --- | --- |
| `.uploads/` | Not present on disk | Legacy expectation only; current upload strategy is Cloudinary, not local disk |
| `client/` | Not present on disk | Historical residue only; there is no active second frontend application |

## Backend Inventory

### Root Files

| Path | Purpose | Status |
| --- | --- | --- |
| `bflux-main/.dockerignore` | Docker build exclusions | Used |
| `bflux-main/.env` | Local secret file | Risk if ever committed |
| `bflux-main/.env.example` | Backend env template | Used, updated |
| `bflux-main/.gitignore` | Backend-local ignore rules | Redundant but harmless |
| `bflux-main/Dockerfile` | Backend production container image | Used |
| `bflux-main/package-lock.json` | Dependency lockfile | Used |
| `bflux-main/package.json` | Backend manifest and scripts | Used |
| `bflux-main/readme.md` | Backend-only readme | Partially superseded by root `README.md` |
| `bflux-main/render.yaml` | Render deployment descriptor | Used |
| `bflux-main/server.js` | Backend process entrypoint | Used, improved |

### `src/config`

| Path | Purpose | Status |
| --- | --- | --- |
| `src/config/cloudinary.js` | Cloudinary client bootstrap | Used |
| `src/config/db.js` | MongoDB connection and retry logic | Used |
| `src/config/email.js` | Resend/SMTP transport setup | Used |
| `src/config/env.js` | Environment normalization and validation | Used, improved |
| `src/config/index.js` | Shared config export | Used |
| `src/config/logger.js` | Winston logger and Morgan bridge | Used |
| `src/config/paystack.js` | Axios client for Paystack API | Used |

### `src/controllers`

| Path | Purpose | Status |
| --- | --- | --- |
| `adminAnalytics.controller.js` | Admin overview metrics | Used |
| `adminCrud.controller.js` | Generic admin CRUD handlers | Used, hardened |
| `adminCustomerOrders.controller.js` | Customer order history in admin | Used |
| `adminSettings.controller.js` | Admin settings read/update | Used |
| `adminUpload.controller.js` | Menu image upload handling | Used, cleaned |
| `adminUsers.controller.js` | Admin user management | Used |
| `auth.controller.js` | Admin auth endpoints | Used |
| `career.controller.js` | Public career application endpoint | Used |
| `category.controller.js` | Public category listing | Used |
| `contact.controller.js` | Public contact endpoint | Used |
| `deliveryZone.controller.js` | Public delivery zone listing | Used but currently not consumed by frontend |
| `menu.controller.js` | Public menu endpoints | Used |
| `newsletter.controller.js` | Newsletter subscription endpoint | Used |
| `order.controller.js` | Order creation and payment verification | Used |
| `payment.controller.js` | Paystack init and webhook handling | Used |
| `settings.controller.js` | Public settings endpoint | Used by frontend after repair |
| `testimonial.controller.js` | Public testimonials endpoint | Used by frontend after repair |

### `src/middlewares`

| Path | Purpose | Status |
| --- | --- | --- |
| `auth.middleware.js` | JWT auth and role guards | Used |
| `error.middleware.js` | 404 and API error response handling | Used |
| `errorApi.js` | API error class helpers | Used |
| `security.middleware.js` | Helmet, CORS, rate limit, sanitizers, compression | Used |
| `upload.middleware.js` | Multer upload validation | Used, hardened |
| `validate.middleware.js` | Joi validation bridge | Used |

### `src/models`

| Path | Purpose | Status |
| --- | --- | --- |
| `careerApplication.model.js` | Stored job applications | Used |
| `category.model.js` | Menu categories | Used |
| `contactMessage.model.js` | Contact form submissions | Used |
| `customer.model.js` | Customer records and addresses | Used |
| `deliveryZone.model.js` | Distance-based delivery pricing | Used |
| `menuItem.model.js` | Menu catalog | Used |
| `newsletterSubscriber.model.js` | Newsletter contacts | Used |
| `order.model.js` | Orders and payment state | Used |
| `siteSetting.model.js` | Business/site settings | Used |
| `testimonial.model.js` | Customer testimonials | Used |
| `user.model.js` | Admin users | Used |

### `src/routes`

| Path | Purpose | Status |
| --- | --- | --- |
| `admin.routes.js` | Protected admin API surface | Used, hardened |
| `auth.routes.js` | Admin authentication routes | Used |
| `index.js` | Central route mounting | Used |
| `public.routes.js` | Public ordering and content routes | Used |

### Remaining Backend Files

| Path | Purpose | Status |
| --- | --- | --- |
| `src/scripts/seed.js` | Seed baseline categories, zones, settings, and admin | Used |
| `src/services/auth.service.js` | Admin login and token signing | Used |
| `src/services/career.service.js` | Career application persistence and email | Used |
| `src/services/contact.service.js` | Contact persistence and email | Used |
| `src/services/crud.service.js` | Shared CRUD data access helpers | Used, hardened |
| `src/services/delivery.service.js` | Delivery fee lookup | Used |
| `src/services/email.service.js` | Email delivery wrapper | Used |
| `src/services/newsletter.service.js` | Newsletter upsert and alert flow | Used |
| `src/services/order.service.js` | Order creation and customer upsert | Used, improved |
| `src/services/payment.service.js` | Paystack payment logic | Used, hardened |
| `src/services/settings.service.js` | Site settings persistence | Used |
| `src/services/upload.service.js` | Cloudinary streaming upload | Used |
| `src/utils/asyncHandler.js` | Async express wrapper | Used |
| `src/utils/orderNumber.js` | Order number generation | Used |
| `src/validators/admin.validation.js` | Admin user validation | Used |
| `src/validators/auth.validation.js` | Auth validation | Used |
| `src/validators/public.validation.js` | Public API validation | Used, improved |
| `src/views/emails/*.js` | Transactional email templates | Used |
| `src/app.js` | Express app bootstrap | Used, improved |
| `test/api.test.js` | Backend integration tests | Used |

## Frontend Inventory

### Root Files

| Path | Purpose | Status |
| --- | --- | --- |
| `frontend/Dockerfile` | Static Nginx image for storefront | Used, improved |
| `frontend/nginx.conf` | Nginx static serving config | Used, improved |
| `frontend/index.html` | Homepage | Used |
| `frontend/menu.html` | Menu listing page | Used |
| `frontend/cart.html` | Shopping cart page | Used |
| `frontend/checkout.html` | Checkout page | Used |
| `frontend/order-verify.html` | Paystack redirect verification page | Used |
| `frontend/contact.html` | Contact page | Used |
| `frontend/careers.html` | Careers page | Used |
| `frontend/robots.txt` | Search crawler rules | Used |
| `frontend/sitemap.xml` | SEO sitemap | Used |

### `frontend/admin`

| Path | Purpose | Status |
| --- | --- | --- |
| `admin/dashboard.html` | Admin dashboard shell | Used |
| `admin/login.html` | Admin login page | Used |
| `admin/css/admin.css` | Admin-specific styling | Used |
| `admin/js/admin-api.js` | Admin API client | Used |
| `admin/js/auth.js` | Admin token/session storage | Used |
| `admin/js/dashboard.js` | Admin dashboard behavior | Used |
| `admin/js/login.js` | Admin login behavior | Used |

### `frontend/assets`

| Path | Purpose | Status |
| --- | --- | --- |
| `assets/icons/.gitkeep` | Placeholder for empty directory retention | Harmless |
| `assets/icons/favicon.png` | Site favicon | Used |
| `assets/icons/logo.png` | Brand logo on homepage | Used |
| `assets/images/.gitkeep` | Placeholder for empty directory retention | Harmless |
| `assets/images/herosect.png` | Hero image fallback/local asset | Used |

### `frontend/css`

| Path | Purpose | Status |
| --- | --- | --- |
| `css/components.css` | UI components styling | Used |
| `css/global.css` | Global layout and typography | Used |
| `css/reset.css` | CSS reset | Used |
| `css/responsive.css` | Responsive rules | Used |
| `css/variables.css` | Design tokens and color variables | Used |

### `frontend/js`

| Path | Purpose | Status |
| --- | --- | --- |
| `js/api.js` | Public API client | Used, cleaned |
| `js/cart.js` | Cart persistence and currency formatting | Used |
| `js/chat.js` | Placeholder chat widget behavior | Used |
| `js/checkout.js` | Checkout behavior | Used |
| `js/config.js` | Runtime API base URL selection | Used |
| `js/data.js` | Static fallback content and mock catalog | Used as fallback data |
| `js/main.js` | Global page initialization | Used, improved |
| `js/menu.js` | Menu page filtering and rendering | Used |
| `js/order-verify.js` | Post-payment verification page logic | Used |
| `js/runtime-config.js` | Default browser runtime config | Used |
| `js/runtime-config.template.js` | Docker-injected runtime config template | Generated |
| `js/search.js` | Menu search helpers | Used indirectly by menu page |

### Frontend Container Bootstrap

| Path | Purpose | Status |
| --- | --- | --- |
| `docker-entrypoint.d/40-runtime-config.sh` | Injects API base URL into static runtime config at container start | Generated |

## Duplicate, Unused, And Broken Findings

- Removed dead endpoint usage risk: generic admin asset upload route was removed because no client consumed it.
- Resolved broken newsletter wiring: all newsletter forms are now bound instead of only the first one on each page.
- Resolved broken testimonials/settings integration: frontend now reads live `/api/testimonials` and `/api/settings`.
- `client/` references were not backed by any current on-disk application and are treated as historical residue.
- `.trae/` is intentionally excluded from deployment scope.
