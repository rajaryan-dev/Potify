# Potify

A music streaming web app inspired by Spotify: React + Vite front end, Express + MongoDB back end, cookie-based JWT auth, and a persistent bottom music player.

> **Demo content:** the seed script loads 16 *fictional* demo tracks. Audio streams from [SoundHelix](https://www.soundhelix.com/) example files (generated music offered for testing). Check their terms before deploying publicly. Cover art comes from picsum.photos placeholders. Nothing here uses copyrighted Spotify audio.

## Screenshots

| Home | Player | Mobile |
|---|---|---|
| _add `docs/home.png`_ | _add `docs/player.png`_ | _add `docs/mobile.png`_ |

## Features

- **Auth:** register, login, logout, session restore, bcrypt hashing, JWT in an httpOnly cookie, protected routes (API and UI), validation and error messages
- **Music:** browse, search by title/artist/album, genre filter, artists and albums sections, recommended picks, popular artists
- **Player:** play/pause, next/previous, seek, volume, mute, shuffle, repeat (off/all/one), time and duration, persistent across pages, keyboard Space toggle, OS media keys, graceful handling of broken audio URLs, responsive controls
- **Library:** playlists (create, edit, delete, public/private, add/remove songs), liked songs, recently played, featured (public) playlists
- **Profile:** edit username and avatar URL, listening activity (counts and top genres)
- **Artists:** accounts with the *Artist* role can add songs by audio URL and delete their own uploads

## Tech stack

| Layer | Tools |
|---|---|
| Front end | React 19, Vite, Tailwind CSS 4, React Router, Axios, Lucide icons |
| Back end | Node.js, Express 5, Mongoose 9, jsonwebtoken, bcryptjs, cookie-parser |
| Database | MongoDB (local or Atlas) |
| Tests | `node:test`, Supertest, mongodb-memory-server |

## Project structure

```
spotify-project/
├── src/                  # Express API
│   ├── app.js            # middleware + routes (also serves client/dist in production)
│   ├── server.js         # env check, DB connect, listen
│   ├── db/db.js
│   ├── models/           # user, music, playlist
│   ├── controllers/      # auth, music, playlist, like, user
│   ├── routes/
│   ├── middleware/       # auth, validateObjectId, error handling
│   ├── utils/
│   └── seed/seed.js      # demo songs, demo user, featured playlists
├── tests/api.test.js     # API tests (real MongoDB via mongodb-memory-server)
└── client/               # React app
    └── src/{api,context,components,pages,utils}
```

## Getting started

Requirements: Node.js 20+ and a MongoDB database.

```bash
git clone <your-repo-url>
cd spotify-project
npm install
npm run client:install
cp .env.example .env        # Windows: copy .env.example .env
```

Edit `.env`:

| Variable | Description |
|---|---|
| `MONGO_URI` | e.g. `mongodb://127.0.0.1:27017/spotify-project` or your Atlas URI |
| `JWT_SECRET` | long random string (never commit it) |
| `PORT` | API port, default `3000` |
| `NODE_ENV` | `development` locally; `production` enables Secure cookies and static serving |

Load demo data (safe to run repeatedly):

```bash
npm run seed
```

This also creates a **local-dev demo user**: `demo@example.com` / `Demo12345!` (skipped when `NODE_ENV=production`).

Run in two terminals:

```bash
npm run dev            # API on http://localhost:3000
npm run client:dev     # app on http://localhost:5173 (proxies /api to the API)
```

Open http://localhost:5173.

### Production-style run

```bash
npm run client:build
NODE_ENV=production npm start   # Express serves the built app and the API on one origin
```

Production cookies are `Secure`, so serve over HTTPS (behind a proxy you also need `app.set('trust proxy', 1)`).

## Testing

```bash
npm test
```

Starts an in-memory MongoDB (downloaded on first run), and covers registration, duplicates, invalid login, NoSQL-injection payloads, protected routes, logout, song listing/search, role checks, likes, recently played, playlist CRUD and permissions, profile updates, and error responses.

## API

Base path `/api`. Everything except register/login/logout/health requires the auth cookie (or `Authorization: Bearer <token>`). Errors are `{ "message": "..." }`.

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{username, email, password, role?}` → 201 `{user}` |
| POST | `/auth/login` | `{email \| username, password}` → `{user}` |
| POST | `/auth/logout` | clears cookie |
| GET | `/auth/me` | current user |
| GET | `/music` | `?page&limit&genre&sort=popular` → `{songs,total,page,pages}` |
| GET | `/music/search?q=` | `{songs, artists, albums}` |
| GET | `/music/artists`, `/recommended`, `/genres`, `/recent` | |
| GET | `/music/:id` | one song |
| POST | `/music/:id/play` | records a play, updates recently played; optional `{duration}` |
| GET/POST | `/music/mine`, `/music` | artist role: list own / add song `{title, uri, artist?, album?, genre?, coverImage?}` |
| DELETE | `/music/:id` | artist who added it |
| GET/POST | `/playlists` | mine / create `{name, description?, isPublic?}` |
| GET | `/playlists/featured` | public playlists |
| GET/PATCH/DELETE | `/playlists/:id` | owner (public ones readable by all) |
| POST | `/playlists/:id/songs` | `{songId}` (409 if already added) |
| DELETE | `/playlists/:id/songs/:songId` | |
| GET | `/likes` | liked songs, newest first |
| POST/DELETE | `/likes/:songId` | like / unlike |
| GET/PATCH | `/users/profile` | stats + top genres / `{username?, profileImage?}` |

## Known limitations

- Songs are streamed from URLs; there is no audio file upload or hosting.
- Anyone can pick the *Artist* role at sign-up (fine for a demo; add an approval flow for real use).
- No rate limiting, refresh tokens, email verification, or password reset.
- Song durations are stored lazily: they are filled in the first time a track is played.
- No ESLint config is included.

## License

ISC
