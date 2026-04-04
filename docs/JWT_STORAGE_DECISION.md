# JWT Storage Decision — Constellation

**Decision made:** April 2026
**Chosen approach:** httpOnly Cookie

---

## Decision

The JWT authentication token is stored in an **httpOnly cookie**, not in localStorage.

---

## Rationale

### Why not localStorage

localStorage is accessible via JavaScript. Any XSS (Cross-Site Scripting) vulnerability — even in a third-party dependency — could allow an attacker to read the token and impersonate the user. This risk is unacceptable for an authentication token.

### Why httpOnly Cookie

An httpOnly cookie cannot be read by JavaScript, which neutralizes XSS attacks on the token itself. It is the industry-standard approach for storing sensitive session data in web applications.

---

## Implementation

### Server-side (Express)

```ts
res.cookie('token', jwt, {
  httpOnly: true,        // Inaccessible to JavaScript
  secure: true,          // HTTPS only (production)
  sameSite: 'strict',    // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
})
```

### Client-side (Axios)

```ts
// axios instance in services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true  // Required to send cookies cross-origin
})
```

### CORS configuration (Express)

```ts
app.use(cors({
  origin: import.meta.env.VITE_CLIENT_URL, // e.g. http://localhost:5173
  credentials: true  // Required to allow cookies cross-origin
}))
```

### Logout

```ts
// Clear the cookie on logout
res.clearCookie('token', {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
})
```

---

## Security attributes explained

| Attribute | Value | Purpose |
|---|---|---|
| `httpOnly` | `true` | Prevents JavaScript access — blocks XSS token theft |
| `secure` | `true` | Cookie sent over HTTPS only (set to `false` in development) |
| `sameSite` | `strict` | Prevents the cookie from being sent in cross-site requests — blocks CSRF |
| `maxAge` | 7 days | Matches the JWT expiry (`JWT_EXPIRES_IN=7d` in `.env`) |

---

## Implications for the Cookie Banner

Authentication cookies set with `httpOnly`, `secure`, and `sameSite=strict` are considered **strictly necessary cookies** — they are required for the service to function and do not track users.

Under the ePrivacy Directive and CNIL guidelines, strictly necessary cookies are **exempt from prior consent**. A cookie banner is therefore **not required** for this cookie alone.

However, the cookie must still be **disclosed** in the Privacy Policy (`/confidentialite`) with the following information:
- Name: `token`
- Purpose: user authentication
- Duration: 7 days
- Category: strictly necessary

> If analytics or third-party cookies are added in the future, a consent banner will be required at that point.

---

## Trade-offs accepted

| Risk | Mitigation |
|---|---|
| CSRF attacks | Mitigated by `sameSite: strict` |
| Cross-origin complexity | Handled via `withCredentials: true` on Axios and `credentials: true` on CORS |
| No token in localStorage | AuthContext reads user state from `GET /api/users/me` on app load, not from the token directly |