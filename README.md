# Bob the Builder

Prompt-to-backend generator for frontend developers.

You describe the backend you need in plain English, and the app generates:
- a structured backend spec,
- live usable API endpoints (inside this server),
- an OpenAPI file + scaffolded backend folder,
- a dashboard for CRUD testing.

## What It Solves

Frontend developers often lose time building temporary backend APIs for demos, assignments, and rapid prototypes.

This project removes that friction:
1. Enter prompt
2. Get backend instantly
3. Use generated endpoints directly from your frontend

## Core Features

- AI-powered backend intent parsing (`/ai/build`)
- Dynamic per-service API runtime (`/generated/:serviceId/...`)
- Schema-aware validation from generated spec
- TTL-based service lifecycle (expire + destroy)
- Live dashboard with create/list/update/delete + cURL copy buttons
- OpenAPI + backend scaffold artifact generation
- Automated end-to-end smoke test

## Tech Stack

- Node.js + Express + TypeScript
- PostgreSQL
- BullMQ + Redis (cleanup worker)
- Google Gemini API (`@google/generative-ai`)
- Tailwind (frontend pages)

## Architecture

1. User prompt -> `POST /ai/build`
2. Gemini returns strict JSON spec (validated with `zod`)
3. Service + spec saved in DB (`services.spec_json`)
4. Live routes available at `/generated/:serviceId/:resource`
5. Dashboard consumes these routes
6. Worker expires/destroys services after TTL

### Architecture Diagram

```mermaid
flowchart LR
    A[Frontend Builder UI\npublic/index.html] -->|POST /ai/build| B[AI Controller]
    B -->|Prompt->Spec| C[Gemini API]
    B -->|Persist service + spec| D[(PostgreSQL)]
    B -->|Generate artifacts| E[Scaffold Generator]
    B -->|Schedule TTL cleanup| F[BullMQ Queue]
    F --> G[Cleanup Worker]
    G -->|Destroy expired service data| D

    H[Dashboard UI\npublic/dashboard.html] -->|Token-auth CRUD| I[Generated Routes]
    I -->|validateService + requireServiceToken + rateLimit| J[Generated Controller]
    J -->|Read/Write JSON payload records| D
```

### Component Responsibilities

| Component | Responsibility |
| --- | --- |
| `src/controllers/ai.controller.ts` | Converts prompts to strict backend specs, persists service metadata, returns live API contract. |
| `src/controllers/generated.controller.ts` | Dynamic schema-aware CRUD over `service_records` from generated spec. |
| `src/middlewares/service.middleware.ts` | Service existence + expiry/destroy checks (`410` on expired services). |
| `src/middlewares/generated-auth.middleware.ts` | Token auth for all generated endpoints (`x-service-token`, bearer, query fallback). |
| `src/middlewares/rate-limit.middleware.ts` | In-memory throttling to control request bursts per client and route. |
| `src/queue/cleanup.queue.ts` + `src/queue/cleanup.worker.ts` | TTL scheduling and asynchronous cleanup/destruction lifecycle. |
| `scripts/smoke-test.mjs` | End-to-end verification of build -> CRUD -> delete lifecycle. |

## Quick Start

### 1) Install

```bash
npm install
```

### 2) Configure `.env`

```env
PORT=5000
DATABASE_URL=postgres://admin:password123@localhost:5433/bob_db
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3) Setup DB

```bash
npm run db:setup
```

### 4) Run app

```bash
npm run dev
```

Open: `http://localhost:5000`

## How To Use

1. On homepage, enter prompt and click `BUILD`
2. Copy `SERVICE ID` and open `OPEN LIVE DASHBOARD`
3. In dashboard:
   - connect service
   - choose resource
   - POST/GET/PUT/DELETE records
   - copy cURL commands for integration

## Live API Endpoints

For generated service `<serviceId>`:

- `GET /generated/<serviceId>/meta`
- `GET /generated/<serviceId>/<resource>`
- `POST /generated/<serviceId>/<resource>`
- `GET /generated/<serviceId>/<resource>/<id>`
- `PUT /generated/<serviceId>/<resource>/<id>`
- `DELETE /generated/<serviceId>/<resource>/<id>`

## Smoke Test (Automated Verification)

Run while server is up:

```bash
npm run smoke:test
```

What it verifies:
- build success
- meta fetch success
- create record
- list includes created record
- update persists
- delete works
- record no longer present after delete

## Measurable Outcomes (Current Baseline)

- Generated API surface: `1` metadata endpoint + `5` CRUD endpoints per resource (`GET/POST/GET by id/PUT/DELETE`).
- Lifecycle bounds: service TTL constrained to `0.0167` to `48` hours (about `1 min` to `48 hrs`).
- Access control coverage: all `/generated/:serviceId/*` endpoints are token-protected.
- Throttling baseline: `120` requests per `60` seconds per client+route bucket.
- Cleanup scheduling guarantee: `1` pending cleanup job per service (`jobId: cleanup:<serviceId>`), rescheduled on renewal.
- Reliability checks: smoke test enforces `7` end-to-end assertions across create/read/update/delete flow.

Optional env vars:
- `SMOKE_BASE_URL` (default: `http://localhost:5000`)
- `SMOKE_PROMPT` (custom prompt for test)

## Example Prompts

- `IoT device logger for 20 mins with fields deviceId, payload, severity`
- `Webhook receiver for payment events for 30 mins`
- `Temporary notes backend for 1 hour`
- `Product inventory backend for 2 hours`

## Project Structure

```text
public/
  index.html
  dashboard.html
scripts/
  smoke-test.mjs
src/
  app.ts
  server.ts
  controllers/
    ai.controller.ts
    generated.controller.ts
    message.controllers.ts
    service.controller.ts
  routes/
    ai.routes.ts
    generated.routes.ts
    message.routes.ts
    services.routes.ts
  middlewares/
    service.middleware.ts
  generator/
    backend-generator.ts
  db/
    setup.ts
    index.ts
  queue/
    cleanup.queue.ts
    cleanup.worker.ts
```

## Screenshots

Add screenshots to `docs/screenshots/` and keep these names:
- `01-home-build.png`
- `02-build-output.png`
- `03-dashboard-connected.png`
- `04-dashboard-records.png`
- `05-curl-command-center.png`

Then they will render here:

![Home Build](docs/screenshots/01-home-build.png)
![Build Output](docs/screenshots/02-build-output.png)
![Dashboard Connected](docs/screenshots/03-dashboard-connected.png)
![Dashboard Records](docs/screenshots/04-dashboard-records.png)
![Command Center](docs/screenshots/05-curl-command-center.png)

## Status Codes

- `201` created
- `200` success
- `400` validation error
- `404` service/resource/record not found
- `410` service expired/destroyed
- `500` internal error

## Resume-Ready Highlights

- Built an AI-to-API generation pipeline using strict schema validation
- Implemented dynamic multi-tenant runtime APIs from generated specs
- Added TTL-based lifecycle cleanup with BullMQ worker
- Built operator dashboard with live CRUD and auto-generated cURL commands
- Added automated smoke tests for end-to-end reliability checks


## Security Note

If any real API key was exposed during development, rotate it immediately and update `.env`.
