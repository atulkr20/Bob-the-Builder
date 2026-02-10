# Bob the Builder

Ephemeral service + messaging backend. Create a time‑boxed service, send messages to it, read them back, and let a worker clean up after expiration.

## Features
- Create services with TTL (expiry)
- Send and read messages scoped to a service
- Service validation middleware (expired/destroyed services return `410`)
- Database setup script
- Queue/worker hooks for cleanup (BullMQ)

## Tech Stack
- Node.js + Express (TypeScript)
- PostgreSQL
- BullMQ (queue/worker)

## Prerequisites
- Node.js 18+
- PostgreSQL

## Environment
Create a `.env` file in the project root:

```
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME
PORT=5000
```

## Install
```
npm install
```

## Database Setup
```
npm run db:setup
```

## Run (dev)
```
npm run dev
```

Server starts at:
```
http://localhost:5000
```

## API Usage

### 1) Create Service
`POST /services`

Body:
```json
{
  "name": "chat-demo",
  "ttlHours": 1
}
```

Response (example):
```json
{
  "success": true,
  "message": "Service created Successfully",
  "data": {
    "serviceId": 1,
    "name": "chat-demo",
    "expiresAt": "2026-02-10T12:34:56.789Z",
    "endpoints": {
      "send": "POST /1/message",
      "read": "GET /1/messages"
    }
  }
}
```

### 2) Send Message
`POST /:serviceId/message`

Body:
```json
{
  "text": "Hello"
}
```

### 3) Read Messages
`GET /:serviceId/messages`

Response (example):
```json
{
  "success": true,
  "count": 1,
  "messages": [
    {
      "id": 10,
      "service_id": 1,
      "text": "Hello",
      "created_at": "2026-02-10T12:35:00.000Z"
    }
  ]
}
```

## Status Codes
- `201` Created (service/message)
- `400` Validation error
- `404` Service not found
- `410` Service expired/destroyed
- `500` Server error

## Project Structure
```
src/
  app.ts
  server.ts
  controllers/
  routes/
  middlewares/
  db/
queue/
  cleanup.queue.ts
  cleanup.worker.ts
```

## Notes
- `serviceId` must be a valid integer. Using a placeholder like `<serviceId>` will fail.
- Cleanup is scheduled based on expiry (see `queue/`).

