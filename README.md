# Foodly — Multi-Vendor Food Delivery Platform

A full-stack food delivery platform supporting multiple independent restaurants, customer ordering, rider-based delivery, and post-order reviews. Built as a full-stack internship project across four phases: database design, REST API, authentication, and frontend.

**Two user roles, one application:**
- **Customers** browse restaurants, view menus, place orders, track status, leave reviews, and manage delivery addresses
- **Restaurant owners** manage their restaurant profile, menu and categories, and process incoming orders through to delivery


## Live Demo

- **Application:** https://food-delivery-platform-three.vercel.app
- **API documentation:** https://fooddelivery-api-ao4m.onrender.com/api-docs

The API runs on a free tier that sleeps after 15 minutes of inactivity, so the
first request may take up to a minute while the service wakes up. Subsequent
requests are fast.




## Tech Stack

**Backend**
- PostgreSQL with [Prisma](https://www.prisma.io/) (`prisma-client-js`, `@prisma/adapter-pg`)
- Node.js, [Express](https://expressjs.com/) 5, [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/) for request validation
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) + [bcrypt](https://www.npmjs.com/package/bcrypt) for authentication
- [Swagger / OpenAPI](https://swagger.io/) via `swagger-jsdoc` and `swagger-ui-express`

**Frontend**
- [Next.js](https://nextjs.org/) App Router, React, TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- React Context for auth state, cookies for token persistence

## Project Structure

```
food-delivery-platform/
├── prisma/
│   ├── schema.prisma          # 10 models, relationships, enums
│   ├── migrations/            # Version-controlled schema history
│   ├── seed.js                 # Sample data for all tables
│   ├── crud.js                  # Standalone CRUD scripts (pre-API reference)
│   └── README.md                # Database layer documentation
├── src/                            # Backend API
│   ├── controllers/               # Business logic, one file per resource
│   ├── routes/                     # URL + method → controller, with Swagger docs
│   ├── validators/                # Zod schemas for request bodies
│   ├── middleware/
│   │   ├── validate.ts             # Reusable request validation
│   │   ├── authenticate.ts          # Verifies JWTs, attaches req.user
│   │   ├── authorize.ts              # Role-based access control
│   │   └── errorHandler.ts            # Centralised error handling
│   ├── lib/ownership.ts               # Resolves which records belong to a user
│   ├── prismaClient.ts                 # Single shared Prisma client
│   ├── swagger.ts                       # OpenAPI configuration
│   ├── app.ts                            # Express setup and route registration
│   └── server.ts                          # Entry point
├── frontend/                                # Next.js client
│   └── src/
│       ├── app/
│       │   ├── layout.tsx                  # Root layout, fonts, AuthProvider
│       │   ├── page.tsx                     # Front door — redirects by role
│       │   ├── (auth)/                       # login, signup (no navbar/footer)
│       │   └── (main)/                        # app pages (navbar + footer)
│       │       ├── restaurants/                # browse + [id] menu and cart
│       │       ├── orders/                      # history + [id] detail and reviews
│       │       ├── addresses/                    # saved delivery addresses
│       │       └── owner/                         # profile, menu, orders
│       ├── components/                             # Shared UI and route guards
│       ├── context/AuthContext.tsx                  # Token, role, login/logout
│       └── lib/api.ts                                # Typed client for every endpoint
├── ERD.svg                                  # Generated from schema.prisma
├── package.json                              # Backend dependencies
└── prisma.config.ts
```

Backend and frontend are separate applications sharing one repository, each with its own `package.json`.

## Data Model

Ten entities: **User**, **Restaurant**, **Category**, **MenuItem**, **Customer**, **Address**, **Rider**, **Order**, **OrderItem**, **Review**.

`User` handles authentication for everyone who logs in, with a `Role` enum (`CUSTOMER`, `RESTAURANT_OWNER`, `RIDER`, `ADMIN`) driving authorization. It links one-to-one to `Customer`, `Restaurant`, or `Rider` depending on who the user is — keeping login concerns in one table rather than duplicated across three. Registering as a customer creates the `User` and `Customer` records together in a transaction.

Full design reasoning is in [`prisma/README.md`](./prisma/README.md).

### Design decisions worth noting

**Orders snapshot values rather than referencing them.** `OrderItem.priceAtOrder` captures the price when the order was placed, and `Order.deliveryStreet`/`deliveryCity` capture the address. An order is a historical record — editing a menu price or deleting a saved address must never rewrite what already happened.

**`OrderItem` is a junction table.** One order contains many items and one item appears in many orders, so neither side can hold a foreign key to the other. Each `OrderItem` row records one pairing, with its quantity and price.

**Reviews use a `targetType` field** rather than separate rating columns, so an order can have zero, one, or two reviews (restaurant and/or rider) with every row meaning the same thing.

**Orders are never deleted.** `DELETE /orders/:id` returns `403`. Cancelling is a status change, which preserves order history.

## API Architecture

Every request follows the same path, and any layer can stop it:

```
Request → Route → authenticate → authorize → validate → Controller → Prisma → Response
```

- **Routes** map URL + method to a controller and declare which middleware applies. No business logic.
- **`authenticate`** verifies the JWT signature and attaches `req.user`. Returns `401` when missing or invalid.
- **`authorize(...roles)`** checks the role against what the endpoint permits. Returns `403`.
- **`validate(schema)`** checks the request body against a Zod schema. Returns `400` with structured issues.
- **Controllers** hold the logic and forward unexpected errors via `next(err)`.
- **`errorHandler`** catches those and maps [Prisma error codes](https://www.prisma.io/docs/orm/reference/error-reference) (`P2002`, `P2025`, `P2003`) to appropriate HTTP statuses, falling back to `500`.

### Authentication and authorization

- `POST /auth/register` — hashes the password with bcrypt, creates the user (and a `Customer` profile for customers)
- `POST /auth/login` — verifies with `bcrypt.compare`, returns a JWT containing `{ userId, role }`, valid 24 hours

Protected endpoints expect `Authorization: Bearer <token>`.

**Two distinct layers of access control:**

1. **Role gating** — is this user the right *kind* of user? Menu management is owners only; placing an order is customers only.
2. **Ownership checks** — is this specific record *theirs*? Before any edit or delete, the controller loads the record and compares its owner against the identity in the verified token. An owner cannot touch another restaurant's menu or orders; a customer cannot see another customer's addresses or order history.

**Identity always comes from the token, never the request body.** `customerId` is resolved server-side from `req.user`, so a client cannot act as someone else.

### Endpoints

| Resource | Notable endpoints |
|---|---|
| `/auth` | `POST /register`, `POST /login` |
| `/restaurants` | Public browse and detail; `GET /my-restaurant` for owners; create/update/delete ownership-checked |
| `/menu-items` | `GET /restaurant/:id` for a restaurant's full menu (public); CRUD ownership-checked |
| `/categories` | Public read; owner/admin write |
| `/orders` | `GET /my-orders` (customer), `GET /restaurant-orders` (owner), `POST /` (customer, transactional), `PUT /:id` (status and rider) |
| `/addresses` | Full CRUD, scoped to the logged-in customer |
| `/reviews` | `GET /restaurant/:id` (public), `POST /` (customer, delivered orders only) |
| `/riders` | `GET /available` — riders not currently on an active delivery |

**Business rules enforced server-side:**
- An order and its items are created together in a `$transaction` — all or nothing
- A review requires a delivered order the customer actually placed, one per target, and a rider review requires an assigned rider
- A rider can only be on one active delivery at a time
- A restaurant with menu items cannot be deleted (`409`)

## Frontend Architecture

**Routing.** File-based, using route groups so auth pages and app pages get different layouts without affecting URLs. Dynamic segments (`restaurants/[id]`, `orders/[id]`) serve one page per record.

**Auth state.** `AuthContext` holds the token in React state (for reactivity) and mirrors it to a cookie (for persistence across refreshes). It decodes the JWT payload to read the user's role — safe because it drives UI only, never access to data. On startup an effect restores the token from the cookie back into state.

**Route protection.** `ProtectedRoute` accepts an optional `allowedRoles`. It refuses to render its children without a valid token, and redirects a wrong-role user to their own home rather than to login. An `isLoading` flag prevents a false redirect before the cookie has been read.

**Data fetching.** All client-side, through a typed `lib/api.ts` that attaches the token automatically. Pages that need several resources fetch them in parallel with `Promise.all`. Every page handles loading, error, and empty states explicitly.

**The frontend gates the UI; the backend gates the data.** Role-aware navigation and route guards are user experience. They are bypassable, and it does not matter — every request is independently verified server-side.

## Getting Started

### Prerequisites
- Node.js
- PostgreSQL

### Backend

```bash
npm install

# .env:
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
# JWT_SECRET="a-long-random-secret"

npx prisma migrate dev
npx prisma generate
node prisma/seed.js

npm run dev          # http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- -p 3001    # http://localhost:3001
```

Both must run together. CORS on the backend permits requests from port 3001.

## Deployment

| Layer | Platform |
| ------| ---------|
| Database | [Neon](https://neon.tech) — serverless PostgreSQL |
| Backend | [Render](https://render.com) — Node web service |
| Frontend | [Vercel](https://vercel.com) — Next.js |

Both applications deploy automatically from `main`.

**Environment variables**

Backend (Render):
- `DATABASE_URL` — Neon connection string
- `JWT_SECRET` — signing secret for tokens
- `FRONTEND_URL` — deployed frontend origin, added to the CORS allow-list

Frontend (Vercel):
- `NEXT_PUBLIC_API_URL` — deployed backend URL

The `NEXT_PUBLIC_` prefix is required for Next.js to expose a variable to browser
code, and is a reminder that anything with it is public — secrets never go there.
`PORT` is provided by Render automatically.



## API Documentation

With the backend running, visit **`http://localhost:3000/api-docs`** for interactive Swagger UI — every endpoint with request/response shapes and validation rules, testable from the browser. Use the **Authorize** button to paste a JWT once and have it attached to protected endpoints.

## Entity-Relationship Diagram

See [`ERD.svg`](./ERD.svg), generated directly from `schema.prisma` via `prisma-erd-generator`, so it stays in sync with the real schema.

## Scope and Known Limitations

**Implemented:** database schema and migrations; full REST API with MVC structure; JWT authentication with role-based and ownership-based authorization; request validation; centralised error handling; API documentation; complete customer and restaurant-owner frontends.

**Deliberately out of scope:** payments and billing, real-time order tracking, rider-facing views.

**Known limitations, noted rather than hidden:**
- Menu items and restaurants have no image field yet — the frontend uses placeholder imagery keyed on record id
- Categories are platform-wide rather than per-restaurant, so deleting one can affect other restaurants' items (guarded by a `409`, but a per-restaurant model would be cleaner)
- No pagination on any list endpoint — fine at current data volumes, would need addressing at scale
- Customers cannot cancel their own orders; only owners can

## License

Internal project — no license specified.