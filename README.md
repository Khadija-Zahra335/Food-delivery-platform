# Food Delivery Platform

A simplified multi-vendor food delivery platform (in the spirit of Foodpanda / Uber Eats) supporting multiple independent restaurants, customer browsing and ordering, rider-based delivery, and post-order reviews.

This repository implements two layers so far:
1. **Database layer** — schema design, PostgreSQL implementation via Prisma, migrations, seed data
2. **API layer** — a REST API built with Express + TypeScript, following an MVC structure, connected to the database layer, with request validation, centralized error handling, and interactive documentation

The frontend is planned for a future phase.

## Tech Stack

- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/) (`prisma-client-js` generator, `@prisma/adapter-pg` driver adapter)
- **API:** Node.js, [Express](https://expressjs.com/) 5, [TypeScript](https://www.typescriptlang.org/)
- **Validation:** [Zod](https://zod.dev/)
- **API Documentation:** [Swagger (OpenAPI)](https://swagger.io/) via `swagger-jsdoc` + `swagger-ui-express`, plus an exported Postman collection

## Project Structure

```
food-delivery-platform/
├── prisma/
│   ├── schema.prisma        # Data model: 9 tables, relationships, enums
│   ├── migrations/          # Version-controlled schema migrations
│   ├── seed.js               # Populates the database with sample data
│   ├── crud.js                # Standalone CRUD scripts (pre-API reference/testing)
│   └── README.md             # Database layer documentation
├── src/
│   ├── controllers/          # Business logic — one file per resource
│   ├── routes/                # URL + method → controller mapping, with Swagger docs
│   ├── validators/           # Zod schemas describing valid request bodies
│   ├── middleware/
│   │   ├── validate.ts        # Reusable request validation middleware
│   │   └── errorHandler.ts     # Centralized error handling middleware
│   ├── prismaClient.ts        # Single shared Prisma client instance
│   ├── swagger.ts              # OpenAPI/Swagger configuration
│   ├── app.ts                   # Express app setup, middleware, route registration
│   └── server.ts                 # Entry point — starts the HTTP server
├── docs/
│   └── postman_collection.json  # Exported Postman collection (import to explore/test)
├── ERD.svg                    # Entity-Relationship Diagram, generated from schema.prisma
├── tsconfig.json
├── package.json
└── prisma.config.ts
```

## Data Model Overview

The schema models 9 entities: **Restaurant**, **Category**, **MenuItem**, **Customer**, **Address**, **Rider**, **Order**, **OrderItem** (junction table), **Review**. Full design reasoning and relationship justification are documented in [`prisma/README.md`](./prisma/README.md).

## API Architecture (MVC)

Requests flow through a consistent path for every resource:

```
Request → Route (which URL/method?) → Middleware (validation) → Controller (business logic) → Prisma/Model (database) → Response
```

- **Routes** (`src/routes/`) map a URL + HTTP method to a controller function, and declare validation middleware where applicable. They contain no business logic.
- **Controllers** (`src/controllers/`) contain the actual logic — reading the request, calling Prisma, shaping the response, and forwarding unexpected errors to the centralized error handler via `next(err)`.
- **Model** — represented by `schema.prisma` and the Prisma client; there is no separate "View" layer since this is a JSON-only API.

### Request Validation

Every `POST` (and relevant `PUT`) endpoint validates its request body against a [Zod](https://zod.dev/) schema before it reaches the controller, via a reusable `validate(schema)` middleware. Invalid requests receive a `400 Bad Request` with a structured list of validation issues, without ever touching the database.

### Centralized Error Handling

A single Express error-handling middleware (`src/middleware/errorHandler.ts`) catches errors forwarded from any controller and returns a consistent JSON error shape. It specifically recognizes [Prisma's known error codes](https://www.prisma.io/docs/orm/reference/error-reference) (e.g. `P2002` unique constraint, `P2025` record not found, `P2003`/`P2004` foreign key conflicts) and maps them to appropriate HTTP status codes, falling back to `500` for anything unexpected.

### Endpoints

All 6 resources (`/restaurants`, `/menu-items`, `/categories`, `/customers`, `/riders`, `/orders`) expose standard REST CRUD endpoints:

| Method | Path | Action |
|---|---|---|
| GET | `/{resource}` | List all |
| GET | `/{resource}/:id` | Get one by ID |
| POST | `/{resource}` | Create |
| PUT | `/{resource}/:id` | Update |
| DELETE | `/{resource}/:id` | Delete |

Notable exceptions, driven by real data-integrity and business rules:
- `DELETE /restaurants/:id` and `DELETE /categories/:id` return `409 Conflict` if dependent `MenuItem` rows still exist.
- `DELETE /orders/:id` always returns `403 Forbidden` — orders are historical records and should be cancelled via `PUT` (status → `CANCELLED`), never deleted.
- `POST /orders` creates an `Order` and its `OrderItem` rows together inside a Prisma `$transaction`, guaranteeing atomicity.

Full request/response shapes and validation rules for every endpoint are available via the interactive Swagger UI (see below) or the exported Postman collection.

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL (running locally or accessible via connection string)

### Setup

```bash
# Install dependencies
npm install

# Configure your database connection in .env:
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"

# Apply migrations and generate the Prisma client
npx prisma migrate dev
npx prisma generate

# Seed the database with sample data
node prisma/seed.js

# Start the API in development mode (auto-restarts on changes)
npm run dev
```

The API runs at `http://localhost:3000` by default.

### API Documentation

- **Interactive (Swagger UI):** once the server is running, visit `http://localhost:3000/api-docs` to browse every endpoint and send live test requests directly from the browser.
- **Postman:** import [`docs/postman_collection.json`](./docs/postman_collection.json) into Postman to explore and run every endpoint with example request bodies.

## Entity-Relationship Diagram

See [`ERD.svg`](./ERD.svg), auto-generated directly from `schema.prisma` via `prisma-erd-generator`.

## Scope

**In scope so far:** database schema/migrations/seed data, full REST CRUD API with MVC structure, request validation, centralized error handling, API documentation.

**Out of scope (this phase):** payments/billing, real-time order tracking, authentication/authorization, frontend UI.

## License

Internal project — no license specified.