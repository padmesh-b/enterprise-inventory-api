# Enterprise Inventory API

Multi-tenant inventory and workflow management API designed for enterprise SaaS platforms.

## Architecture

This backend service is built with **NestJS**, **Fastify**, **TypeScript**, **Prisma**, **PostgreSQL**, and **Redis**. It follows a strict layered architecture utilizing the Repository Pattern and Dependency Injection.

### Features
- **Multi-Tenancy**: All data access is strictly scoped to the tenant's `companyId`. Cross-tenant data access is structurally impossible.
- **Role-Based Access Control (RBAC)**: Enforced via guards (`ADMIN`, `MANAGER`, `VIEWER`).
- **Structured Logging**: Context-aware logging (with `requestId`, `userId`, `companyId`) powered by `Pino`.
- **Advanced Queries**: Cursor-based pagination and composable filtering.
- **Transactions & Audit Trails**: Atomic updates with a dedicated `AuditLog` using `prisma.$transaction`.
- **Caching**: Redis caching for inventory summary endpoints.
- **Background Jobs**: BullMQ integration for low-stock alerts.

## Prerequisites

- Node.js (v20+)
- pnpm (or npm/yarn)
- Docker & Docker Compose (for local DB & Redis)

## Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/enterprise_inventory?schema=public` |
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-jwt-key` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |

## Setup & Running Locally

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start Infrastructure (PostgreSQL & Redis):**
   ```bash
   docker compose up -d
   ```

3. **Run Prisma Migrations:**
   ```bash
   npx prisma migrate dev
   ```

4. **Start the API:**
   ```bash
   pnpm run start:dev
   ```

## Testing

The project uses Jest for testing and enforces an 80% coverage threshold for the service layer.

- **Unit & Integration Tests**: `pnpm run test`
- **E2E Tests**: `pnpm run test:e2e`
- **Coverage Report**: `pnpm run test:cov`

## API Endpoints

A fully interactive Swagger documentation is available at `/api` when the server is running.

### Auth
- `POST /v1/auth/register` - Register a new user and company
- `POST /v1/auth/login` - Authenticate and receive a JWT

### Inventory Items
- `POST /v1/items` - Create a new item (Admin/Manager)
- `GET /v1/items` - List items with cursor pagination & filters
- `GET /v1/items/summary` - Get inventory summary (Redis Cached)
- `GET /v1/items/:id` - Get item by ID
- `PATCH /v1/items/:id` - Update item (Admin/Manager)
- `PATCH /v1/items/:id/adjustment` - Adjust quantity and write AuditLog (Admin/Manager)
- `DELETE /v1/items/:id` - Soft delete an item (Admin/Manager)

### System
- `GET /v1/health` - Process liveness check
- `GET /v1/health/ready` - Readiness check (DB & Redis)
