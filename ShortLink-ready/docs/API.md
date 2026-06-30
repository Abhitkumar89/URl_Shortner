# ShortLink — API Documentation

Base URL (local): `http://localhost:5000`
All JSON. Authenticated routes require a Bearer token:

```
Authorization: Bearer <jwt>
```

---

## Conventions

- API routes are prefixed with **`/api`**.
- The **redirect** route lives at the root (`/:code`) so short links stay clean.
- Errors return `{ "message": "..." }` with an appropriate HTTP status.

---

## Auth

### `POST /api/auth/google`
Exchange a Google ID token for an app JWT. Creates the user on first login.

**Body**
```json
{ "credential": "<google-id-token>" }
```

**200**
```json
{
  "token": "<jwt>",
  "user": {
    "id": "665...",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "avatar": "https://...",
    "createdAt": "2026-06-30T10:00:00.000Z"
  }
}
```
**Errors:** `400` missing credential · `401` invalid Google token

> 📌 Note: the public endpoint in the spec is `POST /auth/google`. In this implementation it is mounted under the `/api` prefix → `POST /api/auth/google`.

---

### `GET /api/auth/me` 🔒
Return the current user.

**200** `{ "user": { ... } }`

---

### `POST /api/auth/logout` 🔒
Stateless logout (client discards the token).

**200** `{ "message": "Logged out" }`

---

## Links

### `POST /api/shorten` 🔒
Create a short link.

**Body**
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "customAlias": "my-link",          // optional, 3-32 chars [a-zA-Z0-9_-]
  "expiresAt": "2026-12-31T23:59:00.000Z"  // optional ISO date (must be future)
}
```

**201**
```json
{
  "link": {
    "id": "665...",
    "originalUrl": "https://example.com/very/long/url",
    "shortCode": "my-link",
    "customAlias": "my-link",
    "shortUrl": "http://localhost:5000/my-link",
    "totalClicks": 0,
    "lastClickedAt": null,
    "expiresAt": "2026-12-31T23:59:00.000Z",
    "status": "active",
    "createdAt": "2026-06-30T10:00:00.000Z"
  }
}
```
**Errors:** `400` invalid URL / alias / expiry · `409` alias taken

---

### `GET /api/links` 🔒
List the user's links with aggregate stats.

**Query params**
| Param | Default | Description |
|-------|---------|-------------|
| `search` | `''` | matches originalUrl / shortCode / customAlias |
| `status` | `all` | `all` \| `active` \| `expired` |
| `page` | `1` | pagination page |
| `limit` | `50` | page size (max 100) |

**200**
```json
{
  "links": [ { /* link */ } ],
  "pagination": { "page": 1, "limit": 50, "total": 12, "pages": 1 },
  "stats": { "totalLinks": 12, "totalClicks": 340, "activeLinks": 9, "expiredLinks": 3 }
}
```

---

### `DELETE /api/links/:id` 🔒
Delete a link owned by the user.

**200** `{ "message": "Link deleted", "id": "665..." }`
**Errors:** `404` not found

---

### `GET /api/links/:id/qr` 🔒
Get a high-res QR code (PNG data URL) for a link.

**200** `{ "qrCode": "data:image/png;base64,...", "shortUrl": "..." }`

---

## Analytics

### `GET /api/analytics/:id` 🔒
Detailed analytics for a single link (includes an embedded QR data URL).

**200**
```json
{
  "analytics": {
    "id": "665...",
    "originalUrl": "https://example.com/...",
    "shortCode": "my-link",
    "shortUrl": "http://localhost:5000/my-link",
    "totalClicks": 42,
    "lastClickedAt": "2026-06-30T09:12:00.000Z",
    "expiresAt": null,
    "status": "active",
    "createdAt": "2026-06-01T10:00:00.000Z",
    "qrCode": "data:image/png;base64,..."
  }
}
```
**Errors:** `404` not found

---

## Redirect (public)

### `GET /:code`
Public redirect. Increments `totalClicks`, updates `lastClickedAt`, enforces expiry.

- **302** → redirects to `originalUrl`
- **404** unknown code
- **410** link expired

---

## Health

### `GET /health`
**200** `{ "status": "ok", "uptime": 123.4 }`

---

## Rate Limiting
API routes are limited to **300 requests / 15 min / IP**. Exceeding returns `429`.

🔒 = requires `Authorization: Bearer <jwt>`
