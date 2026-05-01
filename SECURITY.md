# Security Policy

MechGo handles names, phone numbers, locations, vehicles, payment-adjacent data, support issues, and verification records. Treat all of it as private user data.

## Before Production

- Replace browser-only auth with API-backed auth.
- Store passwords only as salted hashes.
- Move session handling to secure, HTTP-only cookies or carefully scoped tokens.
- Add rate limits for sign-in, registration, support reports, and verification submissions.
- Add role checks to every admin operation.
- Store uploaded documents in private object storage.
- Use Stripe or another compliant provider for payments and payouts.
- Add audit logs for admin access and verification decisions.

## Reporting Issues

For now, report security issues directly to the project owner. Before a public launch, publish a dedicated security contact address and response SLA.
