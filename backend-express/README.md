# CMMS Express Backend

This is the newly migrated Express.js and Prisma (PostgreSQL) backend for the CMMS application. It replaces the previous FastAPI and MongoDB implementation to enforce strict relational data integrity and improve scalability.

## Tech Stack

*   **Node.js & Express:** Web framework for building the REST API.
*   **Prisma:** Next-generation TypeScript Object Relational Mapper (ORM) for PostgreSQL.
*   **TypeScript:** Strongly typed programming language that builds on JavaScript.
*   **PostgreSQL:** Relational database for robust data modeling and constraints.
*   **JWT & bcrypt:** For stateless, secure authentication.

## Project Structure

```text
backend-express/
├── prisma/
│   └── schema.prisma         # Database schema mapping
├── src/
│   ├── app.ts                # Express application configuration & entry point
│   ├── controllers/          # Request handlers and business logic
│   ├── middlewares/          # Express middlewares (e.g., authentication)
│   └── routes/               # Express route definitions
├── package.json
└── tsconfig.json             # TypeScript compiler settings
```

## Setup Instructions

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+ recommended) and `npm` installed. You will also need a PostgreSQL database instance (local, or cloud-hosted via Neon, Supabase, RDS, etc.).

### 2. Install Dependencies

```bash
cd backend-express
npm install
```

### 3. Environment Variables

Create a `.env` file in the `backend-express` root directory:

```env
# Database connection string
DATABASE_URL="postgresql://username:password@localhost:5432/cmms_db?schema=public"

# JWT Secret for authentication
JWT_SECRET="your_secure_random_string"

# Server Port (Optional, defaults to 3000)
PORT=3000
```

### 4. Database Initialization

Push the Prisma schema to your PostgreSQL database to create the necessary tables:

```bash
npx prisma db push
```

*(Alternatively, use `npx prisma migrate dev` if you prefer to generate migration files).*

Generate the Prisma Client:

```bash
npx prisma generate
```

### 5. Running the Application

**Development Mode** (with auto-reload using `ts-node`):

```bash
npm run dev
```

**Production Mode**:

```bash
npm run build
npm start
```

## Key API Endpoints

*   `POST /api/auth/register` - Create a new user (default role: requester)
*   `POST /api/auth/login` - Authenticate and receive a JWT
*   `GET /api/work-orders` - List work orders
*   `GET /api/inventory` - List inventory items
