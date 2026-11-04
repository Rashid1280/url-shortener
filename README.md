# Shortie: URL Shortener

A full-stack URL shortener. Paste a long link and get a short one, with optional custom aliases, expiry, click statistics, and a QR code.

**Live demo:** [https://url-shortener-napj.onrender.com](https://url-shortener-napj.onrender.com)

> The backend runs on a free hosting tier that sleeps after 15 minutes of inactivity, so the first request after a pause can take up to a minute. Open the live demo, wait a moment, and it will respond normally.

![Shortening a link and checking its stats](docs/screenshot.png)

## Features

- Shorten any `http` or `https` URL
- Optional **custom alias** (5 to 15 letters, numbers, or hyphens)
- Optional **expiry** in minutes; expired links return `410 Gone`
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

**Visiting a link:** `GET /:code` finds the link and adds 1 to its click count in a single atomic database update, then responds with a `302` redirect to the original URL. If the link is unknown it returns `404`, and if it has expired it returns `410`.

## API

| Method and path        | Purpose                      | Success                                                  | Errors                                                     |
| ---------------------- | ---------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| `POST /api/shorten`    | Create a short link          | `201` with `{ code, expiresAt }`                         | `400` invalid input, `409` alias taken, `429` rate limited |
| `GET /api/stats/:code` | Get a link's statistics      | `200` with `{ code, url, clicks, createdAt, expiresAt }` | `404` unknown code, `429`                                  |
| `GET /:code`           | Redirect to the original URL | `302`                                                    | `404` unknown, `410` expired, `429`                        |
| `GET /health`          | Health check                 | `200`                                                    | none                                                       |

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
- **Atomic click counting.** The redirect looks up the link and increments `clicks` in one `findOneAndUpdate`, which avoids the lost-update race that a read-then-save would have. Expired links are not counted.
- **Aliases and generated codes share one `code` field and a unique index.** The database enforces uniqueness, with no check-then-write race. If a generated code collides with an existing alias, the server asks the counter for the next number and retries, only on duplicate-key errors.
- **Lazy expiry.** The expiry date is stored on the link, and each visit compares it with the current time. Nothing needs to run at the moment of expiry, and the document stays, so `410` can be told apart from `404`.
- **Server-side validation of everything.** Only `http` and `https` URLs are accepted, since schemes like `javascript:` are dangerous to render as links. Aliases are checked against a pattern and a reserved-word list. The browser's own checks are only a convenience.
- **CORS allowlist.** Only the frontend's origin may read API responses, and `Retry-After` is explicitly exposed so the frontend can show a countdown. The CORS middleware runs before the rate limiter, so permission checks aren't counted and error responses still carry CORS headers.
- **API under `/api`, redirects at the root.** This keeps short links short and avoids clashes between API routes and codes.

## Known limitations

- **Guessable codes.** Codes come from a counter, so links are unlisted rather than private. Do not use the service for sensitive content.
- **Rate limits are in memory.** They work on a single server. With several servers, a shared store such as Redis would be needed.
- **Click counts are raw.** Bots and link-preview crawlers count as clicks, and there is no unique-visitor tracking.
- **No accounts.** Aliases are first come, first served, and anyone can read any link's stats.
- **Expired links stay in the database.** There is no cleanup job, and an expired alias stays taken.
- **No automated tests yet.**
- **Free-tier cold starts**, as described above, and short links live on the hosting provider's domain, not a short custom one.

## Run it locally

You need a recent Node.js LTS and a MongoDB connection string (a free MongoDB Atlas cluster works).

**Server**

```bash
cd server
npm install
cp .env.example .env     # then fill in the values
npm start
```

**Client**

```bash
cd client
npm install
cp .env.example .env
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

## Project structure

```
server/
  index.js          starts the server (environment, database, listen)
  app.js            builds the Express app (middleware, CORS, routes)
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
