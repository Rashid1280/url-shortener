# Shortie: URL Shortener

A full-stack URL shortener. Paste a long link and get a short one, with optional custom aliases, expiry, click statistics, and a QR code.

**Live demo:** [https://url-shortener-napj.onrender.com](https://url-shortener-napj.onrender.com)  
**API:** [https://shortie-eenu.onrender.com](https://shortie-eenu.onrender.com) (health check at `/health`)

> The backend runs on a free hosting tier that sleeps after 15 minutes of inactivity, so the first request after a pause can take up to a minute. Open the live demo, wait a moment, and it will respond normally.

![Shortening a link and checking its stats](docs/screenshot.png)

## Features

- Shorten any `http` or `https` URL (up to 2048 characters)
- Optional **custom alias** (5 to 15 letters, numbers, or hyphens)
- Optional **expiry** in minutes; expired links return `410 Gone` and their clicks are not counted
- **Click counting** and a stats lookup (clicks, creation date, expiry, destination)
- **QR code** and copy-to-clipboard for every short link
- **Rate limiting** per IP, with a friendly "try again in N seconds" message

## Tech stack

| Layer     | Tools                                                  |
| --------- | ------------------------------------------------------ |
| Frontend  | React (Vite), plain CSS                                |
| Backend   | Node.js, Express                                       |
| Database  | MongoDB Atlas, Mongoose                                |
| Libraries | `express-rate-limit`, `cors`, `dotenv`, `qrcode.react` |
| Hosting   | Render                                                 |

## How it works

**Creating a link:** the React form sends `POST /api/shorten`. The server validates the input, gets the next number from an atomic counter in MongoDB, encodes it in base62 to make the short code (or uses the custom alias), saves the link, and returns the code.

**Visiting a link:** `GET /:code` looks up the link. If the code is unknown it returns `404`. If the link has expired it returns `410` without counting the visit. Otherwise it adds 1 to the click count with an atomic update and responds with a `302` redirect to the original URL.

## API

| Method and path        | Purpose                      | Success                                                  | Errors                                                                       |
| ---------------------- | ---------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `POST /api/shorten`    | Create a short link          | `201` with `{ code, expiresAt }`                         | `400` invalid input or malformed JSON, `409` alias taken, `429` rate limited |
| `GET /api/stats/:code` | Get a link's statistics      | `200` with `{ code, url, clicks, createdAt, expiresAt }` | `404` unknown code, `429`                                                    |
| `GET /:code`           | Redirect to the original URL | `302`                                                    | `404` unknown, `410` expired, `429`                                          |
| `GET /health`          | Health check                 | `200` when the database is connected                     | `503` when it is not                                                         |

**Request body for `POST /api/shorten`** (`alias` and `expiresInMinutes` are optional):

```json
{
  "url": "https://example.com/some/very/long/path",
  "alias": "my-link",
  "expiresInMinutes": 60
}
```

**Rate limits:** 10 link creations per minute and 100 reads (redirects and stats) per minute, per IP. Limited responses use `429` with a `Retry-After` header.

## Design decisions

- **Short codes from an atomic counter, encoded in base62.** The counter is a single MongoDB document updated with `$inc`, so two simultaneous requests can never receive the same number, and different numbers always give different codes. Seven base62 characters cover about 3.5 trillion links. I also built a hash-and-truncate alternative with salted retries and compared the two. I chose the counter because it makes collisions impossible by construction. The trade-off is that codes are sequential and therefore guessable, and every new link touches one shared counter.
- **`302` redirects, not `301`.** A `302` is not cached by browsers, so every click reaches the server. That makes click counting accurate, and it lets expiry take effect immediately.
- **Expired links are not counted.** The redirect first looks the link up and checks its expiry, and only then increments `clicks`. The increment itself is an atomic `$inc`, so simultaneous clicks cannot overwrite each other's count. The trade-off is two database calls per click, and a link that expires between the two calls could still be redirected once, which is harmless here.
- **Aliases and generated codes share one `code` field and a unique index.** The database enforces uniqueness, with no check-then-write race. If a generated code collides with an existing alias, the server asks the counter for the next number and retries (up to 5 attempts), only on duplicate-key errors.
- **Lazy expiry.** The expiry date is stored on the link, and each visit compares it with the current time. Nothing needs to run at the moment of expiry, and the document stays, so `410` can be told apart from `404`.
- **Server-side validation of everything.** Only `http` and `https` URLs are accepted, since schemes like `javascript:` are dangerous to render as links, and URLs are capped at 2048 characters. Aliases are checked against a pattern and a reserved-word list. The browser's own checks are only a convenience.
- **Correct client IPs behind proxies.** Rate limits count requests per IP, but on Render the app sits behind three proxy hops, so by default every visitor would look like the same address and share one limit. `app.set("trust proxy", 3)` makes Express read the real visitor IP from the `X-Forwarded-For` header, counting exactly three trusted hops from the right, so a forged header cannot dodge the limit. I found the number with a temporary debug route that showed the header on the deployed app. If the host changes its setup, the number needs to be checked again.
- **Fail fast.** If the database connection fails at startup, the server exits with the error instead of running without a database, so the host shows a failed deploy instead of a healthy-looking app whose requests hang.
- **JSON errors only.** A final error handler turns malformed JSON bodies into a `400` JSON response and any unexpected error into a generic `500`, so clients never receive an HTML error page or a stack trace.
- **CORS allowlist.** Only the frontend's origin may read API responses, and `Retry-After` is explicitly exposed so the frontend can show a countdown. The CORS middleware runs before the rate limiter, so permission checks aren't counted and error responses still carry CORS headers.
- **API under `/api`, redirects at the root.** This keeps short links short and avoids clashes between API routes and codes.

## Known limitations

- **Guessable codes.** Codes come from a counter, so links are unlisted rather than private. Do not use the service for sensitive content.
- **Rate limits are per IP and in memory.** People sharing one network (a college, a mobile carrier) share one allowance. The counts live in one server process, so several servers would need a shared store such as Redis.
- **Click counts are raw.** Bots and link-preview crawlers count as clicks, and there is no unique-visitor tracking.
- **No accounts.** Aliases are first come, first served, and anyone can read any link's stats.
- **Expired links stay in the database.** There is no cleanup job, and an expired alias stays taken.
- **No automated tests yet.**
- **Free-tier cold starts**, as described above, and short links live on the hosting provider's domain, not a short custom one.

## Run it locally

You need Node.js 20.19+, 22.13+, or 24+, and a MongoDB connection string (a free MongoDB Atlas cluster works).

**Server**

```bash
cd server
npm install
cp .env.example .env     # on Windows PowerShell: copy .env.example .env
npm start
```

**Client**

```bash
cd client
npm install
cp .env.example .env     # on Windows PowerShell: copy .env.example .env
npm run dev
```

Open `http://localhost:5173`. The server listens on port 3000 by default.

### Environment variables

| Where  | Name            | Purpose                                                                         |
| ------ | --------------- | ------------------------------------------------------------------------------- |
| server | `MONGO_URI`     | MongoDB connection string                                                       |
| server | `CLIENT_ORIGIN` | the frontend's origin, allowed by CORS (for local use: `http://localhost:5173`) |
| server | `PORT`          | optional, defaults to 3000; hosting platforms set it automatically              |
| client | `VITE_API_URL`  | the backend's address (for local use: `http://localhost:3000`)                  |

Variables prefixed `VITE_` are baked into the built frontend and are public, so never put a secret in one.

## Deployment

Both parts are hosted on Render, and the database is on MongoDB Atlas.

- **Database:** MongoDB Atlas, with network access opened so the host can connect.
- **Server:** Render Web Service, root directory `server`, build command `npm install`, start command `npm start`. Environment variables: `MONGO_URI`, `CLIENT_ORIGIN` (the deployed client's address, with no trailing slash), and `NODE_VERSION` to pin the Node version.
- **Client:** Render Static Site, root directory `client`, build command `npm install && npm run build`, publish directory `dist`. Environment variable: `VITE_API_URL` (the deployed server's address, with no trailing slash). It is read at build time, so changing it needs a new build.

## Project structure

```
server/
  index.js          starts the server (environment, database, listen)
  app.js            builds the Express app (proxy setting, health check, CORS, routes, error handler)
  config/           database connection and constants
  models/           Mongoose models: Link, Counter
  routes/           route definitions
  controllers/      request handlers (shorten, stats, redirect)
  middleware/       rate limiters
  utils/            base62 encoding, counter helper
client/
  src/
    App.jsx         state and logic
    ShortenForm.jsx the form and result UI
    StatsCheck.jsx  the stats lookup UI
    api.js          the fetch layer and error handling
```

## What I would do next

- Add automated tests for the API routes
- Put a Redis cache in front of the redirect lookup, and move rate-limit counts to a shared store
- Clean up expired links after a grace period with a TTL index
- Add user accounts, so aliases and stats belong to someone
- Use a short custom domain for the links themselves
