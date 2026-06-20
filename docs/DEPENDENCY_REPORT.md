# Dependency Report

## Backend Runtime Dependencies

| Package | Purpose |
| --- | --- |
| `axios` | Paystack API HTTP client |
| `bcryptjs` | Admin password hashing |
| `cloudinary` | Cloud file storage for menu images and CV uploads |
| `compression` | Response compression |
| `cookie-parser` | Cookie parsing support |
| `cors` | Cross-origin request control |
| `dotenv` | Environment variable loading |
| `express` | API framework |
| `express-mongo-sanitize` | MongoDB operator injection mitigation |
| `express-rate-limit` | Request rate limiting |
| `helmet` | HTTP security headers |
| `hpp` | HTTP parameter pollution mitigation |
| `joi` | Input validation |
| `jsonwebtoken` | JWT auth |
| `mongoose` | MongoDB ODM |
| `morgan` | HTTP request logging |
| `multer` | Multipart upload parsing |
| `nodemailer` | SMTP fallback email sending |
| `resend` | Transactional email API |
| `slugify` | Category/menu slug generation |
| `winston` | Structured application logging |
| `xss-clean` | Request XSS sanitization |

## Backend Development Dependencies

| Package | Purpose |
| --- | --- |
| `mongodb-memory-server` | Integration test MongoDB instance |
| `nodemon` | Local development auto-restart |
| `supertest` | API integration testing |

## Package Assessment

- No clearly unused backend dependency was identified in `bflux-main/package.json`.
- `mongodb-memory-server` causes a large first-run download during tests; this is expected and not a defect.
- Frontend uses no package manager; it is plain HTML/CSS/JavaScript shipped by Nginx.

## Operational Notes

- Backend runtime requires Node.js `>=18`; Dockerfile currently uses Node 22 Alpine.
- Render deployment is backend-only; frontend deployment must be handled separately through Nginx, Vercel static hosting, or a VPS.
- Root `docker-compose.yml` is the recommended local orchestration path.
