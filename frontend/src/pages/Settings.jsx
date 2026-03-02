import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Users, Shield, Plus, Trash2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Settings = () => {
  const { user, getAuthHeader } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'requester'
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`, getAuthHeader());
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      await axios.post(`${API}/auth/register`, newUser, getAuthHeader());
      toast.success('User created successfully');
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'requester' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-[#D32F2F] text-white';
      case 'technician': return 'bg-[#001F3F] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return Shield;
      case 'technician': return User;
      default: return Users;
    }
  };

  return (
    <div className="space-y-6 animate-slide-in" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="profile-card">
            <CardHeader className="border-b border-gray-200 p-4">
              <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-[#001F3F] flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-semibold text-[#001F3F]">{user?.name}</h3>
                <p className="text-gray-500">{user?.email}</p>
                <Badge className={`mt-3 ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Badge>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Account Status</Label>
                  <p className="font-medium text-green-600">Active</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Role Permissions</Label>
                  <div className="mt-1 text-sm text-gray-600">
                    {user?.role === 'admin' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Manage all work orders</li>
                        <li>Manage assets & inventory</li>
                        <li>Manage users</li>
                        <li>View reports</li>
                      </ul>
                    )}
                    {user?.role === 'technician' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>View & update work orders</li>
                        <li>Manage assets</li>
                        <li>Update inventory</li>
                        <li>Complete PM tasks</li>
                      </ul>
                    )}
                    {user?.role === 'requester' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Create work orders</li>
                        <li>View own work orders</li>
                        <li>View assets</li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management (Admin only) */}
        <div className="lg:col-span-2">
          {user?.role === 'admin' ? (
            <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="user-management-card">
              <CardHeader className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                    User Management
                  </CardTitle>
                  <Button 
                    className="bg-[#001F3F] hover:bg-[#003366]"
                    onClick={() => setShowAddUserModal(true)}
                    data-testid="add-user-btn"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : (
                  <Table className="table-dense">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs uppercase tracking-wider">User</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Email</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Role</TableHead>
                        <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => {
                        const RoleIcon = getRoleIcon(u.role);
                        return (
                          <TableRow key={u.id} className="hover:bg-gray-50" data-testid={`user-row-${u.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{u.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">{u.email}</TableCell>
                            <TableCell>
                              <Badge className={getRoleBadgeColor(u.role)}>
                                <RoleIcon className="h-3 w-3 mr-1" />
                                {u.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {u.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="system-info-card">
              <CardHeader className="border-b border-gray-200 p-4">
                <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Application</Label>
                  <p className="font-medium">Spartans CMMS</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Version</Label>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Organization</Label>
                  <p className="font-medium">Spartans Facility Management</p>
                </div>
                <Separator />
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    For administrative access or to modify your account settings, please contact your system administrator.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Add New User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="John Smith"
                data-testid="new-user-name-input"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@spartansfm.com"
                data-testid="new-user-email-input"
              />
            </div>
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
                data-testid="new-user-password-input"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger data-testid="new-user-role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requester">Requester</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserModal(false)}>Cancel</Button>
            <Button 
              className="bg-[#001F3F] hover:bg-[#003366]" 
              onClick={handleAddUser}
              disabled={!newUser.name || !newUser.email || !newUser.password}
              data-testid="submit-new-user-btn"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
