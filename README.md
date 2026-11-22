# Tivoro

Tivoro's responsive website for website design, digital products and business tools. The frontend uses warm ivory, forest green and terracotta, editorial typography, project previews and accessible motion.

Live website: https://tivoro-studio-preview.mossy-petal-9415.chatgpt.site/

The main website link opens the Tivoro homepage. It is also available at `/home`; brand links return there from the other pages.

## Project structure

- `frontend/`: authored marketing pages, styles and image assets.
- `src/`: frontend interactions and motion modules.
- `app/`: Vinext routes, enquiry endpoints and private inbox.
- `server/`: enquiry validation, storage and authorization logic.
- `db/` and `drizzle/`: database schema and migration.
- `worker/`: Cloudflare Worker entry point.
- `tests/`: SQLite-backed API and security tests.

## Local development

Use Node.js 22.13 or newer. Install dependencies with `npm run install:ci`, then run `npm run dev`. Use the supplied Sites build workflow for hosted deployments.

Copy `.env.example` values into an ignored local environment file as appropriate. Use a separate local signing secret. Never commit production secrets, customer enquiries, local database state or build output. The official starter's local sign-in uses `seedy@sites.test`; the production inbox requires the configured owner account.

```sh
npm run dev
node --test tests/enquiries.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

## Enquiries

The contact form stores enquiries in D1 and displays a reference. `/inbox` supports owner-only search, pagination and enquiry status updates. Automatic email alerts remain disabled until an email provider is configured. See [ENQUIRY-SYSTEM.md](ENQUIRY-SYSTEM.md) for configuration, security controls and migration notes.

`dist/` and `public/` are generated. `design-references/`, `packages/` and the ThreeUI reference notes retain earlier animation experiments; the marketing site is built from `frontend/` and `src/`.
