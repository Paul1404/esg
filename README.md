# ESG — Email Signature Generator

A pixel-perfect, cross-client email signature builder. Designed to render correctly in Outlook (Word renderer), Gmail (web + mobile), Apple Mail (incl. dark-mode auto-invert), Outlook 365 / OWA, and Yahoo.

Built with Next.js 14 (App Router), Postgres (Prisma), and S3-compatible image storage. Deploys cleanly on Railway.

## Features

- **8 templates**: Modern, Classic, Minimal, Corporate, Creative, Horizontal, Photo Card, Compact.
- **Cross-client safe HTML**: table-based layouts, all CSS inlined, MSO conditionals, VML round-rect buttons for Outlook desktop, explicit `width`/`height` image attributes, `mso-line-height-rule: exactly`, no shorthand properties, web-safe font stacks.
- **Live multi-client preview**: Gmail Light, Gmail Dark, Outlook Desktop, Apple Mail, mobile (375 px).
- **Image uploads to S3**: profile photo, company logo, promotional banner. EXIF stripped, dimensions capped, re-encoded via `sharp`.
- **Social row**: 10 platforms, rendered as colored letterform pills (no images required) — survives image-blocking clients.
- **Style controls**: 6 color presets + custom HEX, web-safe font picker, font-size slider (11–18 px), width slider (400–680 px).
- **Extras**: VML-safe CTA button, italic tagline/quote, legal disclaimer, custom credentials & pronouns.
- **Multiple exports**:
  - Copy as **rich text** (works in Gmail / Outlook / Apple Mail compose windows)
  - Copy raw HTML
  - Download standalone `.html`
  - Download **vCard** (`.vcf`)
  - Plain-text fallback for Slack, terminals, and plaintext-only clients
- **Per-client install guides** (Gmail web, Outlook desktop, Apple Mail, Outlook 365).
- **Shareable links**: save a signature to a public `/s/{slug}` URL; anyone can copy from it without an account.
- **Local draft autosave**: localStorage-backed; nothing is sent to the server unless you click Share.
- **Health endpoint**: `GET /api/health` returns DB / S3 configuration status.

## Email-client gotchas this app handles

| Problem | Fix |
|---|---|
| Outlook desktop uses Word as the renderer (no flexbox, no `<div>` layout) | Pure tables with `cellpadding="0" cellspacing="0" border="0"` |
| Gmail strips `<style>` and `<head>` on the web | All CSS inlined |
| Outlook ignores `margin` on inline-block | Spacer cells (`<td width="6">`) |
| Outlook ignores CSS `width` on `<img>` | Explicit HTML `width`/`height` attributes |
| Outlook re-flows rounded buttons | VML `<v:roundrect>` inside `<!--[if mso]>` |
| Apple Mail / Outlook iOS auto-darken light backgrounds | High-contrast text colors; tested against dark mode preview |
| Gmail clips messages > 102 KB | Output kept tight; size shown in the HTML tab |
| Image hotlinks blocked by default | Social icons are letterforms in colored cells, not images |
| EXIF / oversized photos | All uploads re-encoded server-side with `sharp`, capped at sensible dimensions |
| Word's "phantom" 10pt font | `mso-line-height-rule: exactly` and explicit `font-family` on every text cell |

## Getting started locally

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL and AWS_* values

npx prisma db push
npm run dev
# → http://localhost:3000
```

## Deploying to Railway

1. Create a new Railway project and add a **Postgres** plugin.
2. Add a **Bucket** plugin (or any S3-compatible bucket).
3. Add a service from this repo. Railway autodetects the `Dockerfile`.
4. Wire the variables. Using Railway's "Connect Service to Bucket" dialog, set:
   - `AWS_ENDPOINT_URL = ${{<bucket>.ENDPOINT}}`
   - `AWS_S3_BUCKET_NAME = ${{<bucket>.BUCKET}}`
   - `AWS_DEFAULT_REGION = ${{<bucket>.REGION}}`
   - `AWS_ACCESS_KEY_ID = ${{<bucket>.ACCESS_KEY_ID}}`
   - `AWS_SECRET_ACCESS_KEY = ${{<bucket>.SECRET_ACCESS_KEY}}`
5. Postgres is wired automatically via `${{Postgres.DATABASE_URL}}`. Confirm `DATABASE_URL` is bound to your service.
6. Deploy. The container's entrypoint runs `prisma db push` on startup so the schema is created without you needing a separate migration step.
7. Health check: `GET /api/health`.

The included `railway.toml` declares the Dockerfile builder and a healthcheck path. No further configuration is needed.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | for share links / asset metadata | Postgres connection string |
| `AWS_ENDPOINT_URL` | for image uploads | S3-compatible endpoint URL |
| `AWS_S3_BUCKET_NAME` | for image uploads | Bucket name |
| `AWS_DEFAULT_REGION` | for image uploads | Defaults to `auto` |
| `AWS_ACCESS_KEY_ID` | for image uploads | |
| `AWS_SECRET_ACCESS_KEY` | for image uploads | |
| `NEXT_PUBLIC_APP_URL` | optional | Public app URL used for share links; falls back to request origin |
| `PORT` | optional | Defaults to `3000` |

The app degrades gracefully: image uploads return 503 if S3 isn't configured, and share links return 503 if Postgres isn't configured. The editor (with copy/download) works with neither.

## Hosting publicly

A few things to know if you're exposing this to the open internet:

- **Image proxy.** Uploaded images are served through `/i/<key>` using the app's S3 credentials. The bucket can stay private and you don't have to fight with object-level ACLs that most S3-compatible providers silently ignore. Image traffic flows through your app's egress on every email open; if that becomes a concern, put a CDN in front of `/i/` rather than trying to expose the bucket directly.
- **Rate limits.** Per-IP best-effort limits are applied to `/api/upload` (20/hour) and `/api/signatures` (10/hour). State is in-memory, so it resets on restart and isn't shared between replicas — fine for a single instance, swap for an external store if you scale out.
- **Search indexing.** `/s/` (shared signatures) and `/i/` (proxied images) are blocked via `robots.txt` and shared signature pages set `<meta name="robots" content="noindex">`. Anything containing personal contact info stays out of search results.
- **Sharing is public.** Anyone with a `/s/<slug>` link can view the signature, including any contact details it contains. The slugs are unguessable but the page warns the user before they share.

## Project layout

```
src/
├── app/
│   ├── api/{render,upload,signatures,health}/route.ts
│   ├── editor/page.tsx
│   ├── s/[slug]/page.tsx                 # public shared signatures
│   └── page.tsx                          # landing
├── components/
│   ├── editor/                           # form sections
│   └── preview/                          # multi-client preview + export
├── lib/
│   ├── db.ts                             # Prisma client
│   ├── s3.ts                             # S3 client + uploadObject helper
│   ├── template-helpers.ts               # esc, VML button, social pills, vCard, plain text
│   ├── types.ts                          # SignatureData, defaults
│   └── validation.ts                     # zod schemas
├── templates/                            # 8 templates, each is a pure render fn
│   └── index.ts                          # renderTemplate(id, data)
└── ...
prisma/schema.prisma
Dockerfile
docker-entrypoint.sh                      # prisma db push on boot
railway.toml
```

## Adding a new template

1. Create `src/templates/your-template.ts` exporting `render<Name>(data: SignatureData): string`.
2. Use the helpers from `src/lib/template-helpers.ts`:
   - `wrapSignature({ width, inner, fontFamily, fontSize })` for the outer `<table>`
   - `renderButton(...)` for VML-safe CTAs
   - `renderSocialRow(...)` for the social pills
   - `buildContactRows(...)` + `contactRowHtml(...)` for the contact list
   - `img({...})` for Outlook-safe image tags
   - `esc(...)` for everything user-controlled
3. Add the template id to `TemplateId` in `src/lib/types.ts`, register it in `src/templates/index.ts`, add an entry to `TEMPLATE_LIST`, and update the `TemplateIdSchema` enum in `src/lib/validation.ts`.

## License

MIT
