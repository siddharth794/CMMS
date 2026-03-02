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

## System Architecture & Flow

### Entity-Relationship Diagram (ERD)
The following ER Diagram visualizes the core PostgreSQL database schema mapped via Prisma.

![ER Diagram](https://mermaid.ink/img/ZXJEaWFncmFtCiAgICBVc2VyIHx8LS1veyBXb3JrT3JkZXIgOiAiY3JlYXRlcyIKICAgIFVzZXIgfHwtLW97IFdvcmtPcmRlciA6ICJhc3NpZ25lZCB0byIKICAgIFVzZXIgfHwtLW97IFBNU2NoZWR1bGUgOiAiYXNzaWduZWQgdG8iCiAgICBVc2VyIHx8LS1veyBOb3RpZmljYXRpb24gOiAicmVjZWl2ZXMiCiAgICBBc3NldCB8fC0tb3sgV29ya09yZGVyIDogImhhcyIKICAgIEFzc2V0IHx8LS1veyBQTVNjaGVkdWxlIDogInJlcXVpcmVzIgogICAgCiAgICBVc2VyIHsKICAgICAgICBTdHJpbmcgaWQgUEsKICAgICAgICBTdHJpbmcgZW1haWwgVUsKICAgICAgICBTdHJpbmcgbmFtZQogICAgICAgIFN0cmluZyBwYXNzd29yZEhhc2gKICAgICAgICBVc2VyUm9sZSByb2xlCiAgICAgICAgQm9vbGVhbiBpc0FjdGl2ZQogICAgfQogICAgV29ya09yZGVyIHsKICAgICAgICBTdHJpbmcgaWQgUEsKICAgICAgICBTdHJpbmcgdGl0bGUKICAgICAgICBTdHJpbmcgZGVzY3JpcHRpb24KICAgICAgICBXb3JrT3JkZXJQcmlvcml0eSBwcmlvcml0eQogICAgICAgIFdvcmtPcmRlclN0YXR1cyBzdGF0dXMKICAgICAgICBEYXRlVGltZSBkdWVEYXRlCiAgICAgICAgU3RyaW5nIGNyZWF0b3JJZCBGSwogICAgICAgIFN0cmluZyBhc3NpZ25lZUlkIEZLCiAgICAgICAgU3RyaW5nIGFzc2V0SWQgRksKICAgIH0KICAgIEFzc2V0IHsKICAgICAgICBTdHJpbmcgaWQgUEsKICAgICAgICBTdHJpbmcgbmFtZQogICAgICAgIFN0cmluZyBjYXRlZ29yeQogICAgICAgIEFzc2V0U3RhdHVzIHN0YXR1cwogICAgICAgIFN0cmluZyBsb2NhdGlvbgogICAgfQogICAgUE1TY2hlZHVsZSB7CiAgICAgICAgU3RyaW5nIGlkIFBLCiAgICAgICAgU3RyaW5nIHRpdGxlCiAgICAgICAgTWFpbnRlbmFuY2VGcmVxdWVuY3kgZnJlcXVlbmN5CiAgICAgICAgRGF0ZVRpbWUgbmV4dER1ZURhdGUKICAgICAgICBTdHJpbmcgYXNzZXRJZCBGSwogICAgICAgIFN0cmluZyBhc3NpZ25lZUlkIEZLCiAgICB9CiAgICBJbnZlbnRvcnlJdGVtIHsKICAgICAgICBTdHJpbmcgaWQgUEsKICAgICAgICBTdHJpbmcgbmFtZQogICAgICAgIEludCBxdWFudGl0eQogICAgICAgIFN0cmluZyBsb2NhdGlvbgogICAgICAgIEZsb2F0IHVuaXRDb3N0CiAgICB9CiAgICBOb3RpZmljYXRpb24gewogICAgICAgIFN0cmluZyBpZCBQSwogICAgICAgIE5vdGlmaWNhdGlvblR5cGUgdHlwZQogICAgICAgIFN0cmluZyBtZXNzYWdlCiAgICAgICAgQm9vbGVhbiBpc1JlYWQKICAgICAgICBTdHJpbmcgdXNlcklkIEZLCiAgICB9Cg==)

### Request Lifecycle Flowchart
This flow chart illustrates how an incoming HTTP request is processed through the Express.js architecture.

![Request Lifecycle Flowchart](https://mermaid.ink/img/Zmxvd2NoYXJ0IFRECiAgICBDbGllbnQoW0NsaWVudCAvIEZyb250ZW5kXSkgLS0+fEhUVFAgUmVxdWVzdHwgRXhwcmVzc0FwcFtFeHByZXNzIEFwcF0KICAgIEV4cHJlc3NBcHAgLS0+IFJvdXRlcltSb3V0ZXJdCiAgICBSb3V0ZXIgLS0+IEF1dGhNaWRkbGV3YXJle0F1dGggTWlkZGxld2FyZX0KICAgIAogICAgQXV0aE1pZGRsZXdhcmUgLS0+fFZhbGlkIFRva2VuIC8gUHVibGljfCBDb250cm9sbGVyW0NvbnRyb2xsZXIgbG9naWNdCiAgICBBdXRoTWlkZGxld2FyZSAtLT58SW52YWxpZC9ObyBUb2tlbnwgRXJyb3I0MDEoWzQwMSBVbmF1dGhvcml6ZWRdKQogICAgCiAgICBDb250cm9sbGVyIC0tPiBTZXJ2aWNlW0J1c2luZXNzIExvZ2ljIFNlcnZpY2VdCiAgICBTZXJ2aWNlIC0tPiBQcmlzbWFbUHJpc21hIE9STV0KICAgIFByaXNtYSAtLT4gREJbKFBvc3RncmVTUUwgRGF0YWJhc2UpXQogICAgCiAgICBEQiAtLT4gUHJpc21hCiAgICBQcmlzbWEgLS0+IFNlcnZpY2UKICAgIFNlcnZpY2UgLS0+IENvbnRyb2xsZXIKICAgIENvbnRyb2xsZXIgLS0+fFJldHVybiBKU09OfCBDbGllbnQK)

### Authentication Sequence Diagram
A sequence diagram demonstrating the user login flow and JWT generation.

![Authentication Sequence Diagram](https://mermaid.ink/img/eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG4gICAgcGFydGljaXBhbnQgQ2xpZW50XG4gICAgcGFydGljaXBhbnQgQXV0aENvbnRyb2xsZXIgYXMgQXV0aCBDb250cm9sbGVyXG4gICAgcGFydGljaXBhbnQgQXV0aFNlcnZpY2UgYXMgQXV0aCBTZXJ2aWNlXG4gICAgcGFydGljaXBhbnQgUHJpc21hIGFzIFByaXNtYSBDbGllbnRcbiAgICBwYXJ0aWNpcGFudCBEQiBhcyBQb3N0Z3JlU1FMXG5cbiAgICBDbGllbnQtPj5BdXRoQ29udHJvbGxlcjogUE9TVCAvYXBpL2F1dGgvbG9naW4ge2VtYWlsLCBwYXNzd29yZH1cbiAgICBBdXRoQ29udHJvbGxlci0+PkF1dGhTZXJ2aWNlOiBhdXRoZW50aWNhdGVVc2VyKGVtYWlsLCBwYXNzd29yZClcbiAgICBBdXRoU2VydmljZS0+PlByaXNtYTogZmluZFVuaXF1ZShlbWFpbClcbiAgICBQcmlzbWEtPj5EQjogU0VMRUNUICogRlJPTSBVc2VyIFdIRVJFIGVtYWlsID0gP1xuICAgIERCLS0+PlByaXNtYTogVXNlciBSZWNvcmRcbiAgICBQcmlzbWEtLT4+QXV0aFNlcnZpY2U6IFVzZXIgT2JqZWN0XG4gICAgXG4gICAgQXV0aFNlcnZpY2UtPj5BdXRoU2VydmljZTogQ29tcGFyZSBiY3J5cHQgcGFzc3dvcmRzXG4gICAgYWx0IFBhc3N3b3JkcyBNYXRjaFxuICAgICAgICBBdXRoU2VydmljZS0+PkF1dGhTZXJ2aWNlOiBHZW5lcmF0ZSBKV1RcbiAgICAgICAgQXV0aFNlcnZpY2UtLT4+QXV0aENvbnRyb2xsZXI6IHJldHVybiB7IHRva2VuLCB1c2VyIH1cbiAgICAgICAgQXV0aENvbnRyb2xsZXItLT4+Q2xpZW50OiAyMDAgT0sgeyB0b2tlbiwgdXNlciB9XG4gICAgZWxzZSBJbnZhbGlkXG4gICAgICAgIEF1dGhTZXJ2aWNlLS0+PkF1dGhDb250cm9sbGVyOiB0aHJvdyBFcnJvcig0MDEpXG4gICAgICAgIEF1dGhDb250cm9sbGVyLS0+PkNsaWVudDogNDAxIFVuYXV0aG9yaXplZFxuICAgIGVuZCJ9)
