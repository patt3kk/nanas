# Production Readiness Report

## Current Readiness

### Ready

- Express API boots from a single clear entrypoint
- MongoDB connection includes retry handling
- Health endpoint exists at `/api/status`
- Structured logging is enabled through Winston and Morgan
- Graceful shutdown handling is now present
- Paystack initialize, verify, and webhook paths exist
- Cloudinary-backed uploads exist for menu images and CV uploads
- Frontend can now consume live testimonials and site settings
- Frontend Docker image can now inject API base URL at runtime

### Partially Ready

- Admin dashboard covers core CRUD and analytics, but advanced operational tooling is still minimal
- Email delivery supports Resend or SMTP, but production deliverability depends on DNS and sender-domain setup
- Delivery zones exist, but the customer frontend does not yet expose interactive delivery-fee estimation
- Frontend is still a static multi-page app, so large future growth may justify a componentized framework

### Still Manual

- VPS reverse proxy, TLS, and process supervision
- MongoDB backups and retention policy
- Domain DNS setup in Namecheap
- Cloudinary account provisioning
- Paystack live key provisioning and webhook registration
- Admin credential seeding in production

## Recommended Production Topology

### Hostinger VPS

- Nginx reverse proxy on ports 80/443
- Backend container or Node process on internal port `4000`
- MongoDB either managed Atlas or a secured VPS-local container
- Static frontend served by Nginx
- Optional admin subdomain pointing to `/frontend/admin`

### Secondary Targets

- Render: backend API only
- Vercel: static frontend only, with `FRONTEND_API_BASE_URL` pointing at the backend domain

## Backup Recommendations

1. Prefer MongoDB Atlas automated backups if using Atlas.
2. If self-hosting MongoDB, run nightly `mongodump` to off-host storage.
3. Export Cloudinary asset metadata weekly if uploads are business-critical.
4. Keep environment files outside the repository and inside server backups.

## Observability Recommendations

1. Ship JSON logs to a log collector or retain them under systemd/journal on VPS.
2. Monitor `/api/status` from an external uptime checker.
3. Add error alerts for repeated 5xx spikes, failed Paystack webhooks, and email delivery failures.

## Final Go-Live Checklist

- Set all production environment variables from `.env.example`
- Replace all placeholder secrets with strong values
- Seed the initial super-admin
- Configure Paystack callback URL and webhook URL
- Configure Cloudinary credentials
- Configure sender email provider and domain authentication
- Enable TLS and redirect HTTP to HTTPS
- Verify contact, newsletter, order, and payment flows against live infrastructure
