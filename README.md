# Food Delivery Platform

A simplified multi-vendor food delivery platform (in the spirit of Foodpanda / Uber Eats) supporting multiple independent restaurants, customer browsing and ordering, rider-based delivery, and post-order reviews.

This repository currently implements the **database layer** of the platform: schema design, PostgreSQL implementation via Prisma, migrations, seed data, and CRUD operations. The backend API and frontend are planned for future phases.

## Tech Stack

- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/) (`prisma-client-js` generator, `@prisma/adapter-pg` driver adapter)
- **Runtime:** Node.js

## Project Structure

```
food-delivery-platform/
├── prisma/
│   ├── schema.prisma       # Data model: 9 tables, relationships, enums
│   ├── migrations/         # Version-controlled schema migrations
│   ├── seed.js              # Populates the database with sample data
│   ├── crud.js               # Example CRUD operations against the schema
│   └── README.md            # Database layer documentation (schema, setup, design notes)
├── ERD.svg                  # Entity-Relationship Diagram, generated from schema.prisma
├── package.json
└── prisma.config.ts
```

## Data Model Overview

The schema models 9 entities and their relationships:

- **Restaurant** — independently managed by vendors, each with its own menu and operating status
- **Category** — platform-wide menu categories (e.g. appetizers, mains, desserts)
- **MenuItem** — items offered by a restaurant, belonging to one category
- **Customer** — platform users who browse, order, and review
- **Address** — one or more saved delivery addresses per customer
- **Rider** — delivery personnel, assigned to orders
- **Order** — placed by a customer at a single restaurant, optionally assigned a rider, tracked through a status lifecycle
- **OrderItem** — junction table resolving the many-to-many relationship between Order and MenuItem, recording quantity and a price snapshot at time of order
- **Review** — customer feedback on either the restaurant or the rider for a completed order

Full design reasoning, relationship justification, and non-obvious decisions are documented in [`prisma/README.md`](./prisma/README.md).

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL (running locally or accessible via connection string)

### Setup

```bash
# Install dependencies
npm install

# Configure your database connection
# Create a .env file with:
# DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"

# Apply migrations
npx prisma migrate dev

# Generate the Prisma client
npx prisma generate

# Seed the database with sample data
node prisma/seed.js
```

### Running CRUD examples

```bash
node prisma/crud.js
```

See [`prisma/crud.js`](./prisma/crud.js) for example operations: placing an order, assigning a rider, updating order status, adding a review, and querying related data.

## Entity-Relationship Diagram

See [`ERD.svg`](./ERD.svg), auto-generated directly from `schema.prisma` via `prisma-erd-generator`.

## Scope

**In scope:** schema design, migrations, seed data, CRUD operations against the database layer.

**Out of scope (this phase):** payments/billing, real-time order tracking, backend API, frontend UI.

## License

Internal project — no license specified.