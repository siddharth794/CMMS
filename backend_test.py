#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class CMSSTester:
    def __init__(self, base_url: str = "https://facility-manager-19.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_resources = {
            'users': [],
            'work_orders': [],
            'assets': [],
            'pm_schedules': [],
            'inventory': []
        }

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            'name': name,
            'success': success,
            'details': details,
            'response_data': response_data
        })

    def make_request(self, method: str, endpoint: str, data: Dict = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {'error': f'Unsupported method: {method}'}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {'status_code': response.status_code, 'text': response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {'error': str(e)}

    def test_health_check(self):
        """Test basic API health"""
        print("\n🔍 Testing API Health...")
        success, response = self.make_request('GET', '')
        self.log_test("API Health Check", success, 
                     "" if success else f"API not responding: {response.get('error', 'Unknown error')}")
        return success

    def test_user_registration(self):
        """Test user registration with different roles"""
        print("\n🔍 Testing User Registration...")
        
        # Test admin registration
        admin_data = {
            "name": "Test Admin",
            "email": f"admin_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "role": "admin"
        }
        
        success, response = self.make_request('POST', 'auth/register', admin_data, 200)
        if success:
            self.token = response.get('access_token')
            self.user_id = response.get('user', {}).get('id')
            self.created_resources['users'].append(response.get('user', {}))
        
        self.log_test("Admin Registration", success, 
                     "" if success else f"Registration failed: {response.get('detail', 'Unknown error')}")
        
        # Test technician registration
        tech_data = {
            "name": "Test Technician",
            "email": f"tech_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "role": "technician"
        }
        
        success, response = self.make_request('POST', 'auth/register', tech_data, 200)
        if success:
            self.created_resources['users'].append(response.get('user', {}))
        
        self.log_test("Technician Registration", success,
                     "" if success else f"Registration failed: {response.get('detail', 'Unknown error')}")
        
        # Test requester registration
        req_data = {
            "name": "Test Requester",
            "email": f"req_{datetime.now().strftime('%H%M%S')}@test.com",
            "password": "TestPass123!",
            "role": "requester"
        }
        
        success, response = self.make_request('POST', 'auth/register', req_data, 200)
        if success:
            self.created_resources['users'].append(response.get('user', {}))
        
        self.log_test("Requester Registration", success,
                     "" if success else f"Registration failed: {response.get('detail', 'Unknown error')}")
        
        return self.token is not None

    def test_user_login(self):
        """Test user login"""
        print("\n🔍 Testing User Login...")
        
        if not self.created_resources['users']:
            self.log_test("Login Test", False, "No users created to test login")
            return False
        
        user = self.created_resources['users'][0]  # Use admin user
        login_data = {
            "email": user['email'],
            "password": "TestPass123!"
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data, 200)
        if success:
            self.token = response.get('access_token')
        
        self.log_test("User Login", success,
                     "" if success else f"Login failed: {response.get('detail', 'Unknown error')}")
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        print("\n🔍 Testing Get Current User...")
        
        success, response = self.make_request('GET', 'auth/me', expected_status=200)
        self.log_test("Get Current User", success,
                     "" if success else f"Failed to get user info: {response.get('detail', 'Unknown error')}")
        return success

    def test_work_orders(self):
        """Test work order CRUD operations"""
        print("\n🔍 Testing Work Orders...")
        
        # Create work order
        wo_data = {
            "title": "Test Work Order",
            "description": "This is a test work order for CMMS testing",
            "priority": "high",
            "location": "Building A - Floor 2",
            "due_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        }
        
        success, response = self.make_request('POST', 'work-orders', wo_data, 200)
        wo_id = None
        if success:
            wo_id = response.get('id')
            self.created_resources['work_orders'].append(response)
        
        self.log_test("Create Work Order", success,
                     "" if success else f"Failed to create work order: {response.get('detail', 'Unknown error')}")
        
        # Get work orders
        success, response = self.make_request('GET', 'work-orders', expected_status=200)
        self.log_test("Get Work Orders", success,
                     "" if success else f"Failed to get work orders: {response.get('detail', 'Unknown error')}")
        
        # Get specific work order
        if wo_id:
            success, response = self.make_request('GET', f'work-orders/{wo_id}', expected_status=200)
            self.log_test("Get Specific Work Order", success,
                         "" if success else f"Failed to get work order: {response.get('detail', 'Unknown error')}")
            
            # Update work order
            update_data = {
                "status": "in_progress",
                "notes": "Work started"
            }
            success, response = self.make_request('PUT', f'work-orders/{wo_id}', update_data, 200)
            self.log_test("Update Work Order", success,
                         "" if success else f"Failed to update work order: {response.get('detail', 'Unknown error')}")

    def test_assets(self):
        """Test asset CRUD operations"""
        print("\n🔍 Testing Assets...")
        
        # Create asset
        asset_data = {
            "name": "Test HVAC Unit",
            "description": "Test HVAC unit for testing purposes",
            "category": "HVAC",
            "location": "Building A - Roof",
            "serial_number": "HVAC-001-TEST",
            "manufacturer": "Test Manufacturer",
            "model": "TestModel-2024"
        }
        
        success, response = self.make_request('POST', 'assets', asset_data, 200)
        asset_id = None
        if success:
            asset_id = response.get('id')
            self.created_resources['assets'].append(response)
        
        self.log_test("Create Asset", success,
                     "" if success else f"Failed to create asset: {response.get('detail', 'Unknown error')}")
        
        # Get assets
        success, response = self.make_request('GET', 'assets', expected_status=200)
        self.log_test("Get Assets", success,
                     "" if success else f"Failed to get assets: {response.get('detail', 'Unknown error')}")
        
        # Get specific asset
        if asset_id:
            success, response = self.make_request('GET', f'assets/{asset_id}', expected_status=200)
            self.log_test("Get Specific Asset", success,
                         "" if success else f"Failed to get asset: {response.get('detail', 'Unknown error')}")
            
            # Update asset
            update_data = {
                "status": "maintenance"
            }
            success, response = self.make_request('PUT', f'assets/{asset_id}', update_data, 200)
            self.log_test("Update Asset", success,
                         "" if success else f"Failed to update asset: {response.get('detail', 'Unknown error')}")

    def test_pm_schedules(self):
        """Test preventive maintenance schedules"""
        print("\n🔍 Testing PM Schedules...")
        
        # Need an asset first
        if not self.created_resources['assets']:
            self.log_test("Create PM Schedule", False, "No assets available for PM schedule")
            return
        
        asset_id = self.created_resources['assets'][0]['id']
        
        # Create PM schedule
        pm_data = {
            "title": "Monthly HVAC Maintenance",
            "description": "Monthly maintenance check for HVAC unit",
            "asset_id": asset_id,
            "frequency": "monthly",
            "next_due_date": (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            "checklist": ["Check filters", "Inspect belts", "Test controls"]
        }
        
        success, response = self.make_request('POST', 'pm-schedules', pm_data, 200)
        pm_id = None
        if success:
            pm_id = response.get('id')
            self.created_resources['pm_schedules'].append(response)
        
        self.log_test("Create PM Schedule", success,
                     "" if success else f"Failed to create PM schedule: {response.get('detail', 'Unknown error')}")
        
        # Get PM schedules
        success, response = self.make_request('GET', 'pm-schedules', expected_status=200)
        self.log_test("Get PM Schedules", success,
                     "" if success else f"Failed to get PM schedules: {response.get('detail', 'Unknown error')}")
        
        # Complete PM task
        if pm_id:
            success, response = self.make_request('POST', f'pm-schedules/{pm_id}/complete', {}, 200)
            self.log_test("Complete PM Task", success,
                         "" if success else f"Failed to complete PM task: {response.get('detail', 'Unknown error')}")

    def test_inventory(self):
        """Test inventory CRUD operations"""
        print("\n🔍 Testing Inventory...")
        
        # Create inventory item
        inv_data = {
            "name": "Test Air Filter",
            "description": "20x25 HEPA filter for testing",
            "category": "Filters",
            "sku": "FILTER-001-TEST",
            "quantity": 50,
            "min_quantity": 10,
            "unit": "pcs",
            "location": "Warehouse A - Shelf 1",
            "unit_cost": 15.99
        }
        
        success, response = self.make_request('POST', 'inventory', inv_data, 200)
        inv_id = None
        if success:
            inv_id = response.get('id')
            self.created_resources['inventory'].append(response)
        
        self.log_test("Create Inventory Item", success,
                     "" if success else f"Failed to create inventory item: {response.get('detail', 'Unknown error')}")
        
        # Get inventory
        success, response = self.make_request('GET', 'inventory', expected_status=200)
        self.log_test("Get Inventory", success,
                     "" if success else f"Failed to get inventory: {response.get('detail', 'Unknown error')}")
        
        # Update inventory (trigger low stock)
        if inv_id:
            update_data = {
                "quantity": 5  # Below min_quantity to trigger alert
            }
            success, response = self.make_request('PUT', f'inventory/{inv_id}', update_data, 200)
            self.log_test("Update Inventory (Low Stock)", success,
                         "" if success else f"Failed to update inventory: {response.get('detail', 'Unknown error')}")

    def test_notifications(self):
        """Test notifications system"""
        print("\n🔍 Testing Notifications...")
        
        # Get notifications
        success, response = self.make_request('GET', 'notifications', expected_status=200)
        self.log_test("Get Notifications", success,
                     "" if success else f"Failed to get notifications: {response.get('detail', 'Unknown error')}")
        
        # Mark all as read
        success, response = self.make_request('PUT', 'notifications/read-all', {}, 200)
        self.log_test("Mark All Notifications Read", success,
                     "" if success else f"Failed to mark notifications as read: {response.get('detail', 'Unknown error')}")

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n🔍 Testing Dashboard Stats...")
        
        success, response = self.make_request('GET', 'dashboard/stats', expected_status=200)
        self.log_test("Get Dashboard Stats", success,
                     "" if success else f"Failed to get dashboard stats: {response.get('detail', 'Unknown error')}")

    def test_reports(self):
        """Test reports functionality"""
        print("\n🔍 Testing Reports...")
        
        success, response = self.make_request('GET', 'reports/work-orders', expected_status=200)
        self.log_test("Get Work Order Report", success,
                     "" if success else f"Failed to get work order report: {response.get('detail', 'Unknown error')}")

    def test_user_management(self):
        """Test user management (admin only)"""
        print("\n🔍 Testing User Management...")
        
        # Get all users
        success, response = self.make_request('GET', 'users', expected_status=200)
        self.log_test("Get All Users", success,
                     "" if success else f"Failed to get users: {response.get('detail', 'Unknown error')}")
        
        # Get technicians
        success, response = self.make_request('GET', 'users/technicians', expected_status=200)
        self.log_test("Get Technicians", success,
                     "" if success else f"Failed to get technicians: {response.get('detail', 'Unknown error')}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting CMMS Backend API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Authentication tests
        if not self.test_user_registration():
            print("❌ User registration failed. Stopping tests.")
            return False
        
        self.test_user_login()
        self.test_get_current_user()
        
        # Core functionality tests
        self.test_work_orders()
        self.test_assets()
        self.test_pm_schedules()
        self.test_inventory()
        self.test_notifications()
        self.test_dashboard_stats()
        self.test_reports()
        self.test_user_management()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CMSSTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())