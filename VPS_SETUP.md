# Hostinger VPS Setup (Nginx + Mongo + Node + Static Frontend)

This is a pragmatic step-by-step guide to get Nana’s Akara running on a Hostinger VPS.

## 1) Prerequisites

- Ubuntu/Debian-based VPS recommended.
- Root/sudo access.
- Domain registered at Namecheap.

Install basics:

```bash
sudo apt-get update
sudo apt-get install -y nginx curl git build-essential
```

Install Node.js (LTS) and MongoDB (or connect MongoDB Atlas):

- Option A: MongoDB Atlas (recommended)
- Option B: MongoDB self-hosted on VPS

---

## 2) Deploy MongoDB

### Option A (Atlas)

- Create a cluster
- Create DB user
- Set `MONGODB_URI` in backend env

### Option B (local Mongo)

- Install MongoDB
- Ensure port is protected (bind localhost or firewall rules)

---

## 3) Deploy backend (`bflux-main`)

1. Copy repo or clone it:

```bash
git clone <repo-url> nanas-akara
cd nanas-akara/bflux-main
npm install
```

2. Create backend env file:

```bash
cp .env.example .env
# edit .env with real secrets
```

3. Start backend with a process manager (recommended):

Install PM2:

```bash
sudo npm install -g pm2
pm2 start server.js --name nanas-akara-backend --time
```

4. Ensure backend is reachable internally on port **4000**.

---

## 4) Deploy frontend (`frontend`)

Frontend is static and served by Nginx.

```bash
cd nanas-akara/frontend
# build not required; static assets only
```

Copy frontend to Nginx web root (example):

```bash
sudo rm -rf /var/www/nanasakara
sudo mkdir -p /var/www/nanasakara
sudo cp -r * /var/www/nanasakara/
```

---

## 5) Configure Nginx

### Create site config

Create `/etc/nginx/sites-available/nanasakara`.

Example behavior:
- Serve static frontend for `/`
- Proxy `/api/*` to backend at `http://127.0.0.1:4000`

After editing:

```bash
sudo ln -s /etc/nginx/sites-available/nanasakara /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6) TLS with Let’s Encrypt

Install certbot:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

Obtain certificate:

```bash
sudo certbot --nginx -d nanasakara.ng
```

Verify renew:

```bash
sudo certbot renew --dry-run
```

---

## 7) Paystack + webhook URLs

- Your Paystack callback should land on:
  - `https://<your-domain>/order-verify.html`
- Your Paystack webhook should call:
  - `https://<your-domain>/api/payments/webhook`

Ensure backend receives raw webhook body (already implemented in `src/app.js`).

---

## 8) Admin access hardening

Admin endpoints are JWT protected, but you should also restrict access at the reverse proxy level:
- allowlist IP
- or require basic auth for `/frontend/admin` routes

---

## 9) Backups

- MongoDB: Atlas automated backups or schedule `mongodump`
- Cloudinary: keep retention/export strategy

---

## Troubleshooting

### 502 Bad Gateway for `/api`
- Backend not running or wrong port
- Nginx upstream misconfigured

### Paystack webhook 401/invalid signature
- Ensure `PAYSTACK_WEBHOOK_SECRET` matches Paystack
- Ensure raw body is preserved; do not add JSON body parsing to webhook route elsewhere

### Frontend can’t call API
- Ensure your runtime API base URL is set (in Docker it’s injected)
- If using plain Nginx on VPS, verify `frontend/js/runtime-config.js` or injected config logic

