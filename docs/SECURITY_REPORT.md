# Security Report

## Summary

This repository already had a reasonable baseline with `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`, `xss-clean`, and JWT-based admin auth. The production hardening pass focused on removing unsafe defaults, tightening update surfaces, validating uploads more strictly, and improving operational safety.

## Findings And Fixes

### Fixed

| Area | Issue | Action Taken |
| --- | --- | --- |
| Secrets | Weak `JWT_SECRET` defaults encouraged unsafe deployment | Production env validation now rejects placeholder secrets |
| Paystack | Webhook secret fallback was loosely documented and not enforced in production | Production env validation now requires `PAYSTACK_WEBHOOK_SECRET` |
| Admin CRUD | Generic CRUD accepted raw `req.body` for multiple admin resources | Added per-resource allowlists in `admin.routes.js` and field picking in `crud.service.js` |
| Uploads | File validation relied too heavily on MIME type alone | Added extension-to-MIME validation and env-configurable upload size limit |
| Process safety | Server lacked graceful shutdown and unhandled rejection protection | Added `SIGINT`/`SIGTERM` shutdown, timeout handling, and rejection/exception logging |
| Payment verification | Successful Paystack verification did not cross-check amount or metadata | Added verification checks against order total and order ID metadata |
| Validation | Public order/contact/career payloads allowed looser input than necessary | Tightened Joi validation for contact text length and required customer contact method |

### Remaining Operational Risks

| Area | Risk | Mitigation |
| --- | --- | --- |
| Local `.env` file | `bflux-main/.env` exists in the workspace and may contain secrets | Keep it untracked, rotate secrets if it was ever committed publicly |
| Stateless JWT auth | No token revocation or session blacklist | Acceptable for small admin-only surface, but consider refresh tokens or revoked-token storage later |
| Upload trust | Extension and MIME validation reduces risk but does not inspect binary magic numbers | Add content sniffing or AV scanning if compliance or higher-risk uploads are required |
| Admin UI exposure | Admin is served as static pages without IP allowlisting | Protect admin origin via reverse proxy, HTTP auth, VPN, or WAF rules in production |
| Single-factor auth | Admin auth is email/password only | Add MFA before broader operational rollout |

## Current Security Controls

- HTTP hardening: `helmet`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`
- CORS restriction: explicit `FRONTEND_URL`, `ADMIN_URL`, and optional `CORS_ORIGINS`
- Rate limiting: global request limiter for API abuse reduction
- Request sanitization: Mongo operator sanitization, XSS cleaning, HPP
- Auth: JWT with role-based authorization for `admin` and `super-admin`
- Password storage: `bcryptjs` hashing at save time
- Validation: Joi schemas for public forms and admin user management
- Upload handling: in-memory Multer with validated extension/MIME combinations and size caps
- Payment trust: Paystack secret-based API access and webhook signature verification

## Recommendations For Production

1. Put the backend behind Nginx or Caddy with TLS termination, request logging, and optional IP filtering for `/admin`.
2. Store secrets only in deployment platforms or VPS environment files owned by root.
3. Rotate any existing `JWT_SECRET`, Paystack keys, SMTP credentials, and Cloudinary keys before go-live if they were ever shared.
4. Add MFA for admin users and consider audit logging for admin actions.
5. Add binary file inspection if resume/CV uploads are expanded beyond trusted internal operations.
