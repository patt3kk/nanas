# Nana’s Akara API Documentation

Base path: `/api`

Responses:
- JSON: `{ success: true, ... }` for success
- JSON errors: `{ success: false, message: "...", ... }` (exact shape depends on error middleware)

## Health

### GET `/api/status`

Returns server status.

## Public endpoints

### GET `/api/menu`

List featured/menu items.

### GET `/api/menu/:slug`

Fetch a single menu item by slug.

### GET `/api/categories`

List categories.

### POST `/api/orders`

Create an order.

Body:

```json
{
  "customer": {
    "fullName": "string",
    "email": "string (optional)",
    "phone": "string (optional)"
  },
  "items": [
    { "menuItemId": "string", "quantity": 1 }
  ],
  "deliveryAddress": {
    "addressLine1": "string",
    "addressLine2": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "landmark": "string (optional)",
    "notes": "string (optional)"
  },
  "distanceKm": 0,
  "orderNotes": "string (optional)"
}
```

Notes:
- `customer` must contain **email or phone**.
- Each order item requires `menuItemId` and `quantity`.

### GET `/api/orders/verify/:reference`

Verify Paystack payment by transaction reference and mark order paid.

### POST `/api/payments/initialize`

Initialize a Paystack payment.

Body:

```json
{ "orderId": "string", "email": "string (optional)" }
```

### POST `/api/payments/webhook`

Paystack webhook endpoint.

- Validates `x-paystack-signature`.
- Expects raw request body to be available at `req.rawBody` (implemented in backend `src/app.js`).

### POST `/api/contact`

Submit a contact message.

Body:

```json
{ "name": "string", "email": "string", "subject": "string (optional)", "message": "string" }
```

### POST `/api/careers`

Submit a career application.

- `multipart/form-data`
- Optional file field: `cv`

Fields are validated using Joi schema in `src/validators/public.validation.js`.

### GET `/api/testimonials`

List approved testimonials.

### GET `/api/settings`

Fetch public site settings.

### GET `/api/delivery-zones`

List delivery zones.

### POST `/api/newsletter`

Newsletter subscription.

Body:

```json
{ "email": "string", "source": "string (optional)" }
```

## Admin endpoints (JWT required)

Admin auth:

### POST `/api/auth/admin/login`

Body:

```json
{ "email": "string", "password": "string" }
```

### GET `/api/auth/me`

Fetch current admin.

Admin CRUD base:

All CRUD endpoints under `/api/admin/*` require JWT and authorization.

Examples:

- `GET /api/admin/users`
- `POST /api/admin/categories`
- `POST /api/admin/menu-items/:id/images` (multipart `images[]`)
- `GET /api/admin/orders`
- `GET /api/admin/settings`

See backend controllers/routes for the complete list.

