# Food Delivery Platform

A simplified multi-vendor food delivery platform (in the spirit of Foodpanda / Uber Eats) supporting multiple independent restaurants, customer browsing and ordering, rider-based delivery, and post-order reviews.

The repository implements three layers:

1. **Database layer** — schema design, PostgreSQL implementation via Prisma, migrations, seed data
2. **API layer** — a REST API built with Express + TypeScript in an MVC structure, with request validation, JWT authentication, role-based authorization, centralized error handling, and interactive documentation
3. **Frontend layer** — a Next.js (App Router) client with authentication flows, token management, and protected routes

## Tech Stack

**Backend**
- PostgreSQL
- [Prisma](https://www.prisma.io/) (`prisma-client-js` generator, `@prisma/adapter-pg` driver adapter)
- Node.js, [Express](https://expressjs.com/) 5, [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/) for request validation
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) and [bcrypt](https://www.npmjs.com/package/bcrypt) for authentication
- [Swagger (OpenAPI)](https://swagger.io/) via `swagger-jsdoc` + `swagger-ui-express`

**Frontend**
- [Next.js](https://nextjs.org/) (App Router), React, TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- React Context for auth state, cookies for token persistence

## Project Structure

```
food-delivery-platform/
├── prisma/
│   ├── schema.prisma          # Data model: 10 tables, relationships, enums
│   ├── migrations/            # Version-controlled schema migrations
│   ├── seed.js                 # Populates the database with sample data
│   ├── crud.js                  # Standalone CRUD scripts (pre-API reference/testing)
│   └── README.md                # Database layer documentation
├── src/                          # Backend API
│   ├── controllers/             # Business logic — one file per resource
│   ├── routes/                   # URL + method → controller mapping, with Swagger docs
│   ├── validators/              # Zod schemas describing valid request bodies
│   ├── middleware/
│   │   ├── validate.ts           # Reusable request validation middleware
│   │   ├── authenticate.ts        # Verifies JWTs and attaches the user to the request
│   │   ├── authorize.ts            # Role-based access control
│   │   └── errorHandler.ts          # Centralized error handling middleware
│   ├── prismaClient.ts            # Single shared Prisma client instance
│   ├── swagger.ts                  # OpenAPI/Swagger configuration
│   ├── app.ts                       # Express app setup, middleware, route registration
│   └── server.ts                     # Entry point — starts the HTTP server
├── frontend/                          # Next.js client
│   ├── public/images/                # Static assets
│   └── src/
│       ├── app/
│       │   ├── layout.tsx             # Root layout — fonts, AuthProvider
│       │   ├── globals.css             # Tailwind setup and brand theme tokens
│       │   ├── (auth)/                  # Route group: login and signup (no footer)
│       │   └── (main)/                   # Route group: app pages (with footer)
│       ├── components/                     # BrandLogo, ErrorAlert, PasswordInput, Footer, ProtectedRoute
│       ├── context/AuthContext.tsx          # Token state, login/logout, cookie persistence
│       └── lib/api.ts                        # authFetch — attaches the JWT to requests
├── ERD.svg                             # Entity-Relationship Diagram, generated from schema.prisma
├── package.json                         # Backend dependencies
└── prisma.config.ts
```

Note the backend and frontend are separate applications sharing one repository, each with its own `package.json` and dependencies.

## Data Model

10 entities: **User**, **Restaurant**, **Category**, **MenuItem**, **Customer**, **Address**, **Rider**, **Order**, **OrderItem** (junction table), **Review**.

`User` handles authentication for everyone who logs in, with a `Role` enum (`CUSTOMER`, `RESTAURANT_OWNER`, `RIDER`, `ADMIN`) driving authorization. It links one-to-one to `Customer`, `Restaurant`, or `Rider` depending on who the user is — keeping login concerns in one table rather than duplicated across three.

Full design reasoning and relationship justification are documented in [`prisma/README.md`](./prisma/README.md).

## API Architecture (MVC)

Every request follows the same path:

```
Request → Route → authenticate → authorize → validate → Controller → Prisma → Response
```

- **Routes** (`src/routes/`) map URL + HTTP method to a controller, and declare which middleware applies. No business logic.
- **Middleware** runs in order, and any layer can stop the request early: `authenticate` (401 if the token is missing or invalid), `authorize` (403 if the role isn't permitted), `validate` (400 if the body is malformed).
- **Controllers** (`src/controllers/`) hold the logic — reading the request, calling Prisma, shaping the response, and forwarding unexpected errors via `next(err)`.
- **Model** — `schema.prisma` and the Prisma client. There's no View layer; this is a JSON-only API.

### Authentication & Authorization

- `POST /auth/register` — hashes the password with bcrypt and creates a user
- `POST /auth/login` — verifies the password with `bcrypt.compare` and returns a signed JWT containing `{ userId, role }`, valid for 24 hours

Protected endpoints expect the token as `Authorization: Bearer <token>`. The `authenticate` middleware verifies the signature and attaches the decoded payload to `req.user`; `authorize(...roles)` then checks that role against what the endpoint permits.

Examples of the resulting policy:
- Menu management (`POST`/`PUT`/`DELETE` on `/menu-items`) — restaurant owners and admins only
- Order placement (`POST /orders`) — customers only
- Browsing restaurants, menus, and categories (`GET`) — public, no token required

### Request Validation

Every `POST` endpoint validates its body against a [Zod](https://zod.dev/) schema before reaching the controller, via a reusable `validate(schema)` middleware. Invalid requests get a `400` with a structured list of issues, without touching the database. Frontend validation exists for user experience; this backend validation is what actually enforces the rules.

### Centralized Error Handling

A single error-handling middleware (`src/middleware/errorHandler.ts`) catches errors forwarded from any controller and returns a consistent JSON shape. It maps [Prisma's known error codes](https://www.prisma.io/docs/orm/reference/error-reference) (`P2002` unique constraint, `P2025` record not found, `P2003`/`P2004` foreign key conflicts) to appropriate HTTP statuses, falling back to `500`.

### Endpoints

Six resources (`/restaurants`, `/menu-items`, `/categories`, `/customers`, `/riders`, `/orders`) expose standard REST CRUD, plus `/auth` for register and login.

| Method | Path | Action |
|---|---|---|
| GET | `/{resource}` | List all |
| GET | `/{resource}/:id` | Get one by ID |
| POST | `/{resource}` | Create |
| PUT | `/{resource}/:id` | Update |
| DELETE | `/{resource}/:id` | Delete |

Notable exceptions, driven by data-integrity and business rules:
- `DELETE /restaurants/:id` and `DELETE /categories/:id` return `409 Conflict` if dependent `MenuItem` rows still exist.
- `DELETE /orders/:id` always returns `403 Forbidden` — orders are historical records and should be cancelled via `PUT` (status → `CANCELLED`), never deleted.
- `POST /orders` creates an `Order` and its `OrderItem` rows together inside a Prisma `$transaction`, guaranteeing atomicity.

## Frontend Architecture

**Auth state** lives in `AuthContext`, wrapping the whole app from the root layout. It holds the token in React state (for reactivity — components re-render when it changes) and mirrors it to a cookie (for persistence across refreshes). On startup, an effect reads the cookie back into state, so a refresh doesn't log the user out.

**Route protection** is handled by the `ProtectedRoute` wrapper, which reads the token from context and refuses to render its children without one, redirecting to `/login` via an effect. It waits on an `isLoading` flag so a logged-in user isn't wrongly redirected before the cookie has been checked.

**Authenticated requests** go through `lib/api.ts`, which attaches `Authorization: Bearer <token>` automatically — the frontend counterpart to the backend's `authenticate` middleware.

**Route groups** (`(auth)` and `(main)`) let auth pages and app pages use different layouts without affecting URLs — login and signup render without the footer, everything else with it.

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL (running locally or accessible via connection string)

### Backend

```bash
npm install

# .env should contain:
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"
# JWT_SECRET="a-long-random-secret"

npx prisma migrate dev
npx prisma generate
node prisma/seed.js

npm run dev
```

Runs at `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev -- -p 3001
```

Runs at `http://localhost:3001`. Both need to be running at once — the frontend calls the backend, and the backend's CORS config permits requests from port 3001.

## API Documentation

With the backend running, visit `http://localhost:3000/api-docs` for interactive Swagger UI — browse every endpoint, see request/response shapes and validation rules, and send live test requests from the browser. Use the **Authorize** button to paste a JWT once and have it attached to all protected endpoints automatically.

## Entity-Relationship Diagram

See [`ERD.svg`](./ERD.svg), auto-generated directly from `schema.prisma` via `prisma-erd-generator`, so it stays in sync with the actual schema.

## Scope

**Implemented:** database schema, migrations and seed data; full REST CRUD API with MVC structure; JWT authentication and role-based authorization; request validation; centralized error handling; API documentation; frontend authentication flows with protected routes.

**Not yet implemented:** payments/billing, real-time order tracking, ownership-level authorization (currently any restaurant owner can edit any restaurant, not only their own), full customer-facing ordering UI.

## License

Internal project — no license specified.