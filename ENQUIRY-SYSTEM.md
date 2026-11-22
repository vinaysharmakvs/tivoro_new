# Tivoro enquiries

The marketing pages remain authored in `frontend/`. A Vinext Worker serves those pages and the enquiry API; D1 stores submissions. `dist/` and `public/` are generated build output.

- Public form: `/contact`
- Private inbox: `/inbox` (ChatGPT sign-in, existing Site owner only)
- Form session: `GET /api/enquiries/session`
- Submission: `POST /api/enquiries`
- Owner list/search: `GET /api/inbox/enquiries`
- Owner status update: `PATCH /api/inbox/enquiries/:id`

Submissions are validated on the server and saved before any optional notification. A confirmed submission displays a reference. Signed, cookie-bound form sessions, same-origin checks, a honeypot, request size limits and rate limits protect the form. Duplicate retries reuse the same reference. Private routes authorize each request and disable caching. Archiving changes status; it does not delete a record.

## Runtime configuration

Production configuration is stored in Sites, never in source. `ADMIN_EMAILS` contains the existing Site owner's account email; `ENQUIRY_TOKEN_SECRET` is a secret signing key. `PUBLIC_SITE_ORIGIN` is the deployed origin. `ENQUIRY_EMAIL_TO` is `tivorosupport@gmail.com`.

**Automatic email alerts are currently off.** Enquiries are stored and available in the inbox. To activate alerts later, connect an email provider by setting secret `RESEND_API_KEY` and `ENQUIRY_EMAIL_FROM` to a provider-verified sender, then redeploy. Do not put an API key in frontend code. The optional provider adapter is covered by mocked tests; no real email delivery has been verified. Replies from the inbox open a draft in the owner's email app for review and manual sending.

## Development and checks

Use Node 22.13+ and the supplied Sites installation/build workflow. `npm run dev` builds the authored frontend and starts the local preview. A local ignored `.dev.vars` can supply a separate signing secret, local origin and `ADMIN_EMAILS=seedy@sites.test` for the official starter's local sign-in. Local authentication simulation is absent from production.

- `node --test tests/enquiries.test.mjs` runs SQLite-backed API/security tests.
- `node node_modules/typescript/bin/tsc --noEmit` checks types.
- `npm run build` builds frontend assets and the Worker.

`drizzle/0000_known_millenium_guard.sql` creates the enquiry tables and indexes. Apply migrations through the Sites deployment workflow; do not create tables from request handlers or replay an already-applied migration. Local database state and environment files are ignored. Production data is not bundled into the source or deployment archive.
