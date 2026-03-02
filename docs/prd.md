# CMMS Express  
## Executive Product Requirements Document (PRD)  
Version 2.0  
Prepared For: Executive & Stakeholder Review  

---

# 1. Executive Summary

CMMS Express is a scalable, multi-role Computerized Maintenance Management System (CMMS) designed to centralize maintenance operations across:

- Assets  
- Work Orders  
- Preventive Maintenance  
- Inventory  
- Notifications  
- Role-Based Access Control  

Built on Express.js, Prisma ORM, and PostgreSQL, the system enforces strict relational integrity, secure JWT authentication, and full audit traceability.

---

# 2. Business Objectives

## 2.1 Strategic Goals

- Centralize maintenance workflows
- Improve asset uptime
- Standardize work execution processes
- Increase preventive maintenance compliance
- Ensure full inventory accountability
- Support multi-organization SaaS scalability

## 2.2 Operational Goals

- Reduce response time to maintenance issues
- Eliminate manual tracking systems
- Enable real-time performance monitoring
- Improve technician productivity
- Maintain audit-ready compliance logs

---

# 3. User Roles & Permissions

## 3.1 Super Admin
- Cross-organization control
- Manage organizations
- Full system visibility

## 3.2 Administrator
- Full control within assigned organization
- Manage users, assets, inventory
- Configure PM schedules
- Assign technicians
- Close work orders

## 3.3 Supervisor
- Oversight & reporting
- Monitor KPIs
- View system performance metrics

## 3.4 Requester
- Submit service requests
- Track personal requests
- Upload images
- View status updates

Restrictions:
- Cannot assign technicians
- Cannot modify status
- Cannot view other users’ work orders
- No access to inventory or PM module

## 3.5 Technician
- View assigned work orders
- Update status
- Log materials used
- Upload completion media
- Execute preventive maintenance tasks

Restrictions:
- Cannot delete work orders
- Cannot modify inventory master
- Cannot reassign tasks
- Cannot modify location hierarchy

---

# 4. Core Modules

1. Authentication & Authorization
2. Work Order Management
3. Preventive Maintenance
4. Asset Management
5. Inventory Management
6. Notifications
7. Dashboards & KPIs

---

# 5. System Architecture

Frontend Client  
→ Express Router  
→ Authentication Middleware (JWT)  
→ Controller  
→ Service Layer  
→ Prisma ORM  
→ PostgreSQL Database  

## 5.1 Security Controls

- JWT-based stateless authentication
- Role-based middleware enforcement
- Organization-level data isolation
- Soft delete strategy for audit preservation
- Secure file upload validation

---

# 6. Work Order Management

## 6.1 Work Order Types

- CORRECTIVE
- PREVENTIVE

## 6.2 Work Order Sources

1. Requester submission (auto-created CORRECTIVE WO)
2. Admin manual creation
3. PM auto-generation (PREVENTIVE WO)

## 6.3 Work Order Status Lifecycle

NEW → OPEN → IN_PROGRESS → COMPLETED → CLOSED

### Rules

- Requester-created = NEW
- Admin review sets = OPEN
- Technician sets = IN_PROGRESS
- Completion requires media upload
- Admin/Supervisor may set = CLOSED

## 6.4 Mandatory Completion Requirements

- At least one image or video upload
- Materials usage logged
- Automatic inventory deduction
- Completion timestamp recorded
- Technician ID recorded

---

# 7. Preventive Maintenance (PM)

## 7.1 PM Schedule Structure

Each PM must define:
- Asset
- Frequency (Daily, Weekly, Monthly, Custom)
- Assigned Technician
- Next Due Date
- Instructions
- Status (ACTIVE, PAUSED, ARCHIVED)

---

## 7.2 PM → Work Order Auto-Generation

On reaching `nextDueDate`, system automatically:

1. Creates Work Order
2. Sets:
   - type = PREVENTIVE
   - status = OPEN
3. Assigns predefined technician
4. Links Work Order to:
   - assetId
   - pmScheduleId
5. Updates nextDueDate based on frequency
6. Logs generation timestamp

---

## 7.3 PM Execution

Technician:

- Updates status
- Logs materials
- Uploads documentation
- Completes task

Inventory auto-deducts.
Asset status synchronizes.

---

# 8. Asset Management

## 8.1 Asset Status Synchronization Rules

If any linked Work Order = IN_PROGRESS  
→ Asset Status = UNDER_MAINTENANCE

If all linked Work Orders = COMPLETED/CLOSED  
→ Asset Status = OPERATIONAL

---

# 9. Inventory Management

## 9.1 Inventory Controls

- All material usage creates InventoryTransaction record
- No direct manual stock deduction allowed
- Full audit trail required
- Only Administrator may:
  - Add items
  - Edit thresholds
  - Delete inventory entries

## 9.2 Inventory Transaction Model

- inventoryItemId
- workOrderId
- quantityUsed
- usedBy
- timestamp

---

# 10. Notifications System

Triggers:

- Work Order assignment
- Status updates
- PM generation
- Work completion
- Overdue detection

Delivery:
- In-app notifications
- Future: Email / SMS

---

# 11. Dashboard & KPIs

## Administrator Dashboard

- Total Open Work Orders
- Overdue Work Orders
- Critical Priority Work Orders
- Upcoming PM Tasks
- Low Stock Inventory Items

## Technician Dashboard

- Assigned Work Orders
- Due Today
- Overdue
- Critical
- Upcoming PM

## Requester Dashboard

- Total Submitted
- Open Requests
- Closed Requests

---

# 12. Non-Functional Requirements

## 12.1 Performance

- Index on:
  - workOrder.status
  - workOrder.assigneeId
  - pmSchedule.nextDueDate
- Optimized queries for dashboards

## 12.2 Security

- JWT expiration enforcement
- Password hashing with bcrypt
- Role-based authorization
- Organization data isolation

## 12.3 Audit & Compliance

- createdAt / updatedAt on all entities
- Soft delete strategy
- Immutable inventory transactions
- Complete Work Order history tracking

## 12.4 Scalability

- Background job scheduler required
  - PM generation
  - Overdue detection
- Multi-tenant ready architecture
- Horizontal scaling compatible

---

# 13. Future Roadmap (Phase 2)

- SLA timers
- Escalation rules
- Cost tracking per asset
- Downtime analytics
- Supervisor reporting module
- Email & SMS integration
- Mobile push notifications
- Mobile app support

---

# 14. Technical Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt password hashing

---

# 15. Success Metrics

- Reduction in average response time
- Increase in PM compliance rate
- Reduction in asset downtime
- Zero inventory discrepancy
- 99% system uptime target

---

# Conclusion

CMMS Express is a structured, scalable, audit-ready maintenance platform designed for modern operational environments.  

The system enforces strong relational integrity, role separation, automated preventive maintenance workflows, and complete inventory traceability, positioning it for enterprise deployment and SaaS expansion.