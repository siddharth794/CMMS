from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app
app = FastAPI(title="Spartans CMMS API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    TECHNICIAN = "technician"
    REQUESTER = "requester"

class WorkOrderStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class WorkOrderPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AssetStatus(str, Enum):
    OPERATIONAL = "operational"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"
    RETIRED = "retired"

class MaintenanceFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

# Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.REQUESTER

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Work Order Models
class WorkOrderBase(BaseModel):
    title: str
    description: str
    priority: WorkOrderPriority = WorkOrderPriority.MEDIUM
    asset_id: Optional[str] = None
    location: str
    due_date: Optional[str] = None

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[WorkOrderPriority] = None
    status: Optional[WorkOrderStatus] = None
    assigned_to: Optional[str] = None
    location: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None

class WorkOrder(WorkOrderBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: WorkOrderStatus = WorkOrderStatus.OPEN
    created_by: str
    assigned_to: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None

# Asset Models
class AssetBase(BaseModel):
    name: str
    description: str
    category: str
    location: str
    serial_number: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    purchase_date: Optional[str] = None
    warranty_expiry: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    status: Optional[AssetStatus] = None
    serial_number: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    purchase_date: Optional[str] = None
    warranty_expiry: Optional[str] = None

class Asset(AssetBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: AssetStatus = AssetStatus.OPERATIONAL
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Preventive Maintenance Models
class PMScheduleBase(BaseModel):
    title: str
    description: str
    asset_id: str
    frequency: MaintenanceFrequency
    next_due_date: str
    assigned_to: Optional[str] = None
    checklist: Optional[List[str]] = None

class PMScheduleCreate(PMScheduleBase):
    pass

class PMScheduleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[MaintenanceFrequency] = None
    next_due_date: Optional[str] = None
    assigned_to: Optional[str] = None
    is_active: Optional[bool] = None
    checklist: Optional[List[str]] = None

class PMSchedule(PMScheduleBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_active: bool = True
    last_completed: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Inventory Models
class InventoryItemBase(BaseModel):
    name: str
    description: str
    category: str
    sku: Optional[str] = None
    quantity: int = 0
    min_quantity: int = 0
    unit: str = "pcs"
    location: str
    unit_cost: float = 0.0

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    min_quantity: Optional[int] = None
    unit: Optional[str] = None
    location: Optional[str] = None
    unit_cost: Optional[float] = None

class InventoryItem(InventoryItemBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Notification Models
class NotificationType(str, Enum):
    WORK_ORDER = "work_order"
    ASSET = "asset"
    MAINTENANCE = "maintenance"
    INVENTORY = "inventory"
    SYSTEM = "system"

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: NotificationType
    title: str
    message: str
    is_read: bool = False
    reference_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def create_notification(user_id: str, ntype: NotificationType, title: str, message: str, reference_id: str = None):
    notification = Notification(
        user_id=user_id,
        type=ntype,
        title=title,
        message=message,
        reference_id=reference_id
    )
    doc = notification.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.notifications.insert_one(doc)

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=UserRole.REQUESTER  # Force default role for security
    )
    
    doc = user.model_dump()
    doc['password_hash'] = hash_password(user_data.password)
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.email, user.role.value)
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value,
            is_active=user.is_active
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user.get('password_hash', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'], user['role'])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user['id'],
            email=user['email'],
            name=user['name'],
            role=user['role'],
            is_active=user.get('is_active', True)
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user['id'],
        email=current_user['email'],
        name=current_user['name'],
        role=current_user['role'],
        is_active=current_user.get('is_active', True)
    )

# User Management Routes (Admin only)
@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

@api_router.get("/users/technicians", response_model=List[UserResponse])
async def get_technicians(current_user: dict = Depends(get_current_user)):
    users = await db.users.find({"role": {"$in": ["admin", "technician"]}}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**u) for u in users]

# Work Order Routes
@api_router.post("/work-orders", response_model=dict)
async def create_work_order(wo_data: WorkOrderCreate, current_user: dict = Depends(get_current_user)):
    work_order = WorkOrder(
        **wo_data.model_dump(),
        created_by=current_user['id']
    )
    
    doc = work_order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc['completed_at']:
        doc['completed_at'] = doc['completed_at'].isoformat()
    
    await db.work_orders.insert_one(doc)
    
    # Notify admins and technicians
    admins = await db.users.find({"role": {"$in": ["admin", "technician"]}}, {"_id": 0}).to_list(100)
    for admin in admins:
        if admin['id'] != current_user['id']:
            await create_notification(
                admin['id'],
                NotificationType.WORK_ORDER,
                "New Work Order",
                f"Work order '{work_order.title}' has been created",
                work_order.id
            )
    
    # Return document without _id
    doc.pop('_id', None)
    return {**doc, "created_by_name": current_user['name']}

@api_router.get("/work-orders", response_model=List[dict])
async def get_work_orders(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    # Requesters can only see their own work orders
    if current_user['role'] == 'requester':
        query['created_by'] = current_user['id']
    elif assigned_to:
        query['assigned_to'] = assigned_to
    
    if status:
        query['status'] = status
    if priority:
        query['priority'] = priority
    
    work_orders = await db.work_orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Enrich with user names
    for wo in work_orders:
        creator = await db.users.find_one({"id": wo['created_by']}, {"_id": 0, "name": 1})
        wo['created_by_name'] = creator['name'] if creator else 'Unknown'
        if wo.get('assigned_to'):
            assignee = await db.users.find_one({"id": wo['assigned_to']}, {"_id": 0, "name": 1})
            wo['assigned_to_name'] = assignee['name'] if assignee else 'Unknown'
    
    return work_orders

@api_router.get("/work-orders/{wo_id}", response_model=dict)
async def get_work_order(wo_id: str, current_user: dict = Depends(get_current_user)):
    wo = await db.work_orders.find_one({"id": wo_id}, {"_id": 0})
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    # Add creator and assignee names
    creator = await db.users.find_one({"id": wo['created_by']}, {"_id": 0, "name": 1})
    wo['created_by_name'] = creator['name'] if creator else 'Unknown'
    if wo.get('assigned_to'):
        assignee = await db.users.find_one({"id": wo['assigned_to']}, {"_id": 0, "name": 1})
        wo['assigned_to_name'] = assignee['name'] if assignee else 'Unknown'
    
    # Add asset info if linked
    if wo.get('asset_id'):
        asset = await db.assets.find_one({"id": wo['asset_id']}, {"_id": 0, "name": 1})
        wo['asset_name'] = asset['name'] if asset else 'Unknown'
    
    return wo

@api_router.put("/work-orders/{wo_id}", response_model=dict)
async def update_work_order(wo_id: str, update_data: WorkOrderUpdate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'requester':
        raise HTTPException(status_code=403, detail="Not authorized to update work orders")
    
    wo = await db.work_orders.find_one({"id": wo_id}, {"_id": 0})
    if not wo:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    if update_data.status == WorkOrderStatus.COMPLETED:
        update_dict['completed_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.work_orders.update_one({"id": wo_id}, {"$set": update_dict})
    
    # Notify relevant users
    if update_data.assigned_to:
        await create_notification(
            update_data.assigned_to,
            NotificationType.WORK_ORDER,
            "Work Order Assigned",
            f"Work order '{wo['title']}' has been assigned to you",
            wo_id
        )
    
    if update_data.status:
        # Notify creator
        await create_notification(
            wo['created_by'],
            NotificationType.WORK_ORDER,
            "Work Order Updated",
            f"Work order '{wo['title']}' status changed to {update_data.status}",
            wo_id
        )
    
    updated = await db.work_orders.find_one({"id": wo_id}, {"_id": 0})
    return updated

@api_router.delete("/work-orders/{wo_id}")
async def delete_work_order(wo_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.work_orders.delete_one({"id": wo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    return {"message": "Work order deleted"}

# Asset Routes
@api_router.post("/assets", response_model=dict)
async def create_asset(asset_data: AssetCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'requester':
        raise HTTPException(status_code=403, detail="Not authorized to create assets")
    
    asset = Asset(**asset_data.model_dump())
    doc = asset.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.assets.insert_one(doc)
    # Return document without _id
    doc.pop('_id', None)
    return doc

@api_router.get("/assets", response_model=List[dict])
async def get_assets(
    status: Optional[str] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if status:
        query['status'] = status
    if category:
        query['category'] = category
    
    assets = await db.assets.find(query, {"_id": 0}).to_list(1000)
    return assets

@api_router.get("/assets/{asset_id}", response_model=dict)
async def get_asset(asset_id: str, current_user: dict = Depends(get_current_user)):
    asset = await db.assets.find_one({"id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Get maintenance history
    work_orders = await db.work_orders.find({"asset_id": asset_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    asset['maintenance_history'] = work_orders
    
    # Get PM schedules
    pm_schedules = await db.pm_schedules.find({"asset_id": asset_id}, {"_id": 0}).to_list(100)
    asset['pm_schedules'] = pm_schedules
    
    return asset

@api_router.put("/assets/{asset_id}", response_model=dict)
async def update_asset(asset_id: str, update_data: AssetUpdate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'requester':
        raise HTTPException(status_code=403, detail="Not authorized to update assets")
    
    asset = await db.assets.find_one({"id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.assets.update_one({"id": asset_id}, {"$set": update_dict})
    
    updated = await db.assets.find_one({"id": asset_id}, {"_id": 0})
    return updated

@api_router.delete("/assets/{asset_id}")
async def delete_asset(asset_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.assets.delete_one({"id": asset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"message": "Asset deleted"}

# Preventive Maintenance Routes
@api_router.post("/pm-schedules", response_model=dict)
async def create_pm_schedule(pm_data: PMScheduleCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'requester':
        raise HTTPException(status_code=403, detail="Not authorized to create PM schedules")
    
    pm = PMSchedule(**pm_data.model_dump())
    doc = pm.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.pm_schedules.insert_one(doc)
    # Return document without _id
    doc.pop('_id', None)
    return doc

@api_router.get("/pm-schedules", response_model=List[dict])
async def get_pm_schedules(current_user: dict = Depends(get_current_user)):
    schedules = await db.pm_schedules.find({}, {"_id": 0}).to_list(1000)
    
    # Enrich with asset names
    for pm in schedules:
        asset = await db.assets.find_one({"id": pm['asset_id']}, {"_id": 0, "name": 1})
        pm['asset_name'] = asset['name'] if asset else 'Unknown'
        if pm.get('assigned_to'):
            assignee = await db.users.find_one({"id": pm['assigned_to']}, {"_id": 0, "name": 1})
            pm['assigned_to_name'] = assignee['name'] if assignee else 'Unassigned'
    
    return schedules

@api_router.put("/pm-schedules/{pm_id}", response_model=dict)
async def update_pm_schedule(pm_id: str, update_data: PMScheduleUpdate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'requester':
        raise HTTPException(status_code=403, detail="Not authorized to update PM schedules")
    
    pm = await db.pm_schedules.find_one({"id": pm_id}, {"_id": 0})
    if not pm:
        raise HTTPException(status_code=404, detail="PM schedule not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    await db.pm_schedules.update_one({"id": pm_id}, {"$set": update_dict})
    
    updated = await db.pm_schedules.find_one({"id": pm_id}, {"_id": 0})
    return updated

@api_router.delete("/pm-schedules/{pm_id}")
async def delete_pm_schedule(pm_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.pm_schedules.delete_one({"id": pm_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="PM schedule not found")
    return {"message": "PM schedule deleted"}

@api_router.post("/pm-schedules/{pm_id}/complete", response_model=dict)
async def complete_pm_schedule(pm_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'requester':
        raise HTTPException(status_code=403, detail="Not authorized")
    
    pm = await db.pm_schedules.find_one({"id": pm_id}, {"_id": 0})
    if not pm:
        raise HTTPException(status_code=404, detail="PM schedule not found")
    
    # Calculate next due date based on frequency
    from dateutil.relativedelta import relativedelta
    current_due = datetime.fromisoformat(pm['next_due_date'])
    
    freq_map = {
        'daily': relativedelta(days=1),
        'weekly': relativedelta(weeks=1),
        'biweekly': relativedelta(weeks=2),
        'monthly': relativedelta(months=1),
        'quarterly': relativedelta(months=3),
        'yearly': relativedelta(years=1)
    }
    
    next_due = current_due + freq_map.get(pm['frequency'], relativedelta(months=1))
    
    await db.pm_schedules.update_one(
        {"id": pm_id},
        {"$set": {
            "last_completed": datetime.now(timezone.utc).isoformat(),
            "next_due_date": next_due.isoformat()[:10]
        }}
    )
    
    updated = await db.pm_schedules.find_one({"id": pm_id}, {"_id": 0})
    return updated

# Inventory Routes
@api_router.post("/inventory", response_model=dict)
async def create_inventory_item(item_data: InventoryItemCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'requester':
        raise HTTPException(status_code=403, detail="Not authorized to manage inventory")
    
    item = InventoryItem(**item_data.model_dump())
    doc = item.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.inventory.insert_one(doc)
    # Return document without _id
    doc.pop('_id', None)
    return doc

@api_router.get("/inventory", response_model=List[dict])
async def get_inventory(
    category: Optional[str] = None,
    low_stock: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if category:
        query['category'] = category
    
    items = await db.inventory.find(query, {"_id": 0}).to_list(1000)
    
    if low_stock:
        items = [i for i in items if i['quantity'] <= i['min_quantity']]
    
    return items

@api_router.put("/inventory/{item_id}", response_model=dict)
async def update_inventory_item(item_id: str, update_data: InventoryItemUpdate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] == 'requester':
        raise HTTPException(status_code=403, detail="Not authorized to manage inventory")
    
    item = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.inventory.update_one({"id": item_id}, {"$set": update_dict})
    
    # Check for low stock alert
    if update_dict.get('quantity') is not None:
        updated = await db.inventory.find_one({"id": item_id}, {"_id": 0})
        if updated['quantity'] <= updated['min_quantity']:
            # Notify admins
            admins = await db.users.find({"role": "admin"}, {"_id": 0}).to_list(100)
            for admin in admins:
                await create_notification(
                    admin['id'],
                    NotificationType.INVENTORY,
                    "Low Stock Alert",
                    f"Item '{updated['name']}' is running low ({updated['quantity']} remaining)",
                    item_id
                )
    
    updated = await db.inventory.find_one({"id": item_id}, {"_id": 0})
    return updated

@api_router.delete("/inventory/{item_id}")
async def delete_inventory_item(item_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.inventory.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return {"message": "Inventory item deleted"}

# Notification Routes
@api_router.get("/notifications", response_model=List[dict])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return notifications

@api_router.put("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notif_id, "user_id": current_user['id']},
        {"$set": {"is_read": True}}
    )
    return {"message": "Notification marked as read"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": current_user['id']},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}

# Dashboard/Reports Routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Work order stats
    total_wo = await db.work_orders.count_documents({})
    open_wo = await db.work_orders.count_documents({"status": "open"})
    in_progress_wo = await db.work_orders.count_documents({"status": "in_progress"})
    completed_wo = await db.work_orders.count_documents({"status": "completed"})
    critical_wo = await db.work_orders.count_documents({"priority": "critical", "status": {"$ne": "completed"}})
    
    # Asset stats
    total_assets = await db.assets.count_documents({})
    operational_assets = await db.assets.count_documents({"status": "operational"})
    maintenance_assets = await db.assets.count_documents({"status": "maintenance"})
    
    # Inventory stats
    total_inventory = await db.inventory.count_documents({})
    low_stock_items = await db.inventory.find({}, {"_id": 0}).to_list(1000)
    low_stock_count = len([i for i in low_stock_items if i['quantity'] <= i['min_quantity']])
    
    # PM stats
    total_pm = await db.pm_schedules.count_documents({"is_active": True})
    
    # Recent work orders
    recent_wo = await db.work_orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(5)
    for wo in recent_wo:
        creator = await db.users.find_one({"id": wo['created_by']}, {"_id": 0, "name": 1})
        wo['created_by_name'] = creator['name'] if creator else 'Unknown'
    
    # Upcoming PM
    upcoming_pm = await db.pm_schedules.find({"is_active": True}, {"_id": 0}).sort("next_due_date", 1).to_list(5)
    for pm in upcoming_pm:
        asset = await db.assets.find_one({"id": pm['asset_id']}, {"_id": 0, "name": 1})
        pm['asset_name'] = asset['name'] if asset else 'Unknown'
    
    return {
        "work_orders": {
            "total": total_wo,
            "open": open_wo,
            "in_progress": in_progress_wo,
            "completed": completed_wo,
            "critical": critical_wo
        },
        "assets": {
            "total": total_assets,
            "operational": operational_assets,
            "maintenance": maintenance_assets
        },
        "inventory": {
            "total": total_inventory,
            "low_stock": low_stock_count
        },
        "pm_schedules": {
            "active": total_pm
        },
        "recent_work_orders": recent_wo,
        "upcoming_maintenance": upcoming_pm
    }

@api_router.get("/reports/work-orders")
async def get_work_order_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if start_date:
        query['created_at'] = {"$gte": start_date}
    if end_date:
        if 'created_at' in query:
            query['created_at']['$lte'] = end_date
        else:
            query['created_at'] = {"$lte": end_date}
    
    work_orders = await db.work_orders.find(query, {"_id": 0}).to_list(10000)
    
    # Calculate metrics
    total = len(work_orders)
    completed = len([w for w in work_orders if w['status'] == 'completed'])
    completion_rate = (completed / total * 100) if total > 0 else 0
    
    # By status
    by_status = {}
    for wo in work_orders:
        status = wo['status']
        by_status[status] = by_status.get(status, 0) + 1
    
    # By priority
    by_priority = {}
    for wo in work_orders:
        priority = wo['priority']
        by_priority[priority] = by_priority.get(priority, 0) + 1
    
    return {
        "total": total,
        "completed": completed,
        "completion_rate": round(completion_rate, 1),
        "by_status": by_status,
        "by_priority": by_priority
    }

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "Spartans CMMS API", "version": "1.0.0"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
