# CMMS Frontend Application

This provides the frontend user interface for the CMMS platform. Built using modern web technologies, it features a responsive, accessible, and fast interface.

## 🏗 System Architecture

The frontend follows a component-centric architecture built around React and Tailwind CSS, leveraging specialized libraries for state, routing, and form handling:

### Tech Stack
- **Framework:** React.js (Bootstrapped with CRA + Craco for Tailwind integration)
- **Styling:** Tailwind CSS & `tailwindcss-animate`
- **Component Library:** Radix UI primitives (shadcn/ui style)
- **Routing:** React Router v7
- **Form Handling:** React Hook Form + Zod for schema validation
- **Data Fetching:** Axios
- **Icons:** Lucide React
- **Notifications:** Sonner for Toast messages

### Directory Structure
```text
frontend/
├── public/               # Static assets
└── src/
    ├── components/       # Reusable UI components (often Radix UI based)
    ├── context/          # React Context providers (e.g., Auth, Theme)
    ├── hooks/            # Custom React hooks
    ├── lib/              # Utility functions and library configuration (e.g. axios)
    ├── pages/            # Page-level components matching routes
    ├── App.js            # Main application root and routing setup
    └── index.js          # React entry point
```

## 🚀 Setup Instructions

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Install Dependencies
Navigate into the `frontend` directory and install the necessary dependencies using `npm` or `yarn`:

```bash
cd frontend
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the `frontend` directory if necessary. Typically you will need the API URL:
```env
REACT_APP_API_URL=http://localhost:3000/api
```
*(Check your backend setup for the exact API port and path)*

### 4. Running the Development Server
To start the React development server:
```bash
npm start
```
The application will be available at [http://localhost:3000](http://localhost:3000). The dev server features hot reloading, so changes in the source code will immediately reflect in the browser.

### 5. Building for Production
To create an optimized production build:
```bash
npm run build
```
This processes and minifies the code into the `build/` directory, ready to be served by any static file server like Nginx or deployed to Vercel/Netlify.

## ✨ Development Guidelines

- **Components:** Place shared components in `src/components`. Utilize Radix UI unstyled primitives for accessible UI building.
- **Styling:** Use Tailwind CSS utility classes. The design system is configured in `tailwind.config.js`.
- **Forms:** Use `react-hook-form` paired with `zod` for strongly typed, performant form validation.
- **Icons:** Search for what you need on [Lucide](https://lucide.dev/) and import directly via `lucide-react`.
