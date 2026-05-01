# MechGo

MechGo is a roadside mobile mechanic marketplace prototype. It includes customer and mechanic account flows, a booking marketplace, dispatch views, verification screens, support reporting, settings, policy pages, and an admin operations portal.

## Current State

The existing UI is a static frontend. This pass adds professional project scaffolding and a backend API starter so the app has a path away from browser-only storage.

Important: the static pages still need to be wired to the new API before this is production-ready.

The `download-app.html` page links the web app to the separate `../mechgo-mobile` prototype. Mobile-created customer accounts use the same prototype storage keys as the web app, so the admin portal can see accounts created from either surface when both are served from the same origin.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Copy environment settings:

```bash
cp .env.example .env
```

3. Start the API:

```bash
npm run api
```

4. In another terminal, serve the frontend:

```bash
npm run dev
```

## Production Priorities

- Wire frontend auth, bookings, support, verification, customer, and mechanic screens to `/api`.
- Use a managed database such as Postgres/Supabase instead of local JSON files.
- Move all authentication and admin authorization server-side.
- Add Stripe for customer payments and Stripe Connect for mechanic payouts.
- Store verification documents in private object storage with signed URLs.
- Add analytics, audit logs, monitoring, error reporting, and backup policies.
- Run accessibility, mobile, security, and end-to-end tests before launch.

## Security Notes

- Never ship demo passwords in frontend JavaScript or HTML.
- Never store raw passwords in `localStorage`.
- Never store payment card numbers directly.
- Keep `JWT_SECRET` and `ADMIN_SETUP_TOKEN` private.
- Restrict admin APIs by role and log sensitive actions.
