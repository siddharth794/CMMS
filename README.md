# Spartans CMMS

Welcome to the Spartans CMMS (Computerized Maintenance Management System) project. This repository contains both the FastAPI backend and the React frontend.

## Prerequisites

Before running the application, ensure you have the following installed:
- Python 3.8+
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (Running locally or via a cloud provider like MongoDB Atlas)

## Running the Backend

The backend is built with FastAPI and MongoDB (Motor async driver).

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Set up the environment variables:**
   Create a `.env` file in the `backend` directory (if it doesn't already exist) and populate it with your configuration:
   ```env
   MONGO_URL=mongodb://localhost:27017  # Or your MongoDB Atlas URI
   DB_NAME=spartans_cmms
   JWT_SECRET=your_super_secret_jwt_key
   CORS_ORIGINS=http://localhost:3000
   ```

3. **Install Python dependencies:**
   It's highly recommended to use a virtual environment.
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Start the FastAPI server:**
   ```bash
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend API will be running at `http://localhost:8000`. 
   You can view the interactive API documentation at `http://localhost:8000/docs`.

---

## Running the Frontend

The frontend is built with React, Tailwind CSS, and Shadcn/UI.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `frontend` directory with the required configuration, for example:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   ```

3. **Install Node dependencies:**
   ```bash
   npm install
   # Or if you prefer yarn: yarn install
   ```

4. **Start the React development server:**
   ```bash
   npm start
   # Or with yarn: yarn start
   ```
   The frontend application will be running at `http://localhost:3000`. The page will reload when you make changes.

## Testing the Application

To run the backend end-to-end tests:
```bash
cd backend
python backend_test.py
```
This script will test API connectivity, user registration, authentication, and core CRUD workflows for work orders, assets, PM schedules, and inventory.
