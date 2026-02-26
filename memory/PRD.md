# Spartans CMMS - Product Requirements Document

## Overview
CMMS (Computerized Maintenance Management System) for Spartans Facility Management

## Original Problem Statement
Build a small CMMS app for Spartans Facility Management firm with:
- Work Order Management
- Asset/Equipment Management
- Preventive Maintenance Scheduling
- Inventory/Spare Parts Management
- Role-based access (Admin, Technician, Requester)
- In-app notifications
- Basic reports

## User Personas
1. **Admin** - Full system access, user management, all CRUD operations
2. **Technician** - View/update work orders, manage assets, complete PM tasks
3. **Requester** - Create work orders, view own requests

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind CSS + Shadcn/UI
- Auth: JWT-based authentication

## What's Been Implemented (January 16, 2026)

### Backend (100% Complete)
- [x] User authentication (register, login, JWT)
- [x] Work Orders CRUD with status/priority management
- [x] Assets CRUD with maintenance history
- [x] Preventive Maintenance scheduling with frequency
- [x] Inventory management with low stock alerts
- [x] Notifications system
- [x] Dashboard statistics API
- [x] Reports API with date filtering
- [x] Role-based access control

### Frontend (100% Complete)
- [x] Login/Registration with role selection
- [x] Dashboard with KPI cards and bento grid layout
- [x] Work Orders list, create, view, update, delete
- [x] Assets management with status tracking
- [x] PM Schedules with calendar view
- [x] Inventory with low stock indicators
- [x] Reports with charts (Recharts)
- [x] Settings with user management (admin)
- [x] Dark sidebar navigation
- [x] Toast notifications (Sonner)
- [x] Mobile responsive design

### Design System
- Brand colors: Navy Blue (#001F3F), Spartan Red (#D32F2F)
- Typography: Barlow Condensed (headings), Public Sans (body), JetBrains Mono (codes)
- Industrial/Tactical aesthetic

## Prioritized Backlog

### P0 (Completed)
- Core CMMS functionality
- Authentication
- Role-based access

### P1 (Future)
- Email notifications integration
- Work order history/comments
- Asset QR code scanning
- Mobile app version

### P2 (Future)
- Advanced reporting with export
- Vendor/contractor management
- Budget tracking
- Custom fields

## Next Tasks
1. Add email notifications (optional integration)
2. Implement work order comments/history
3. Add bulk operations for work orders
4. Export reports to PDF/Excel
