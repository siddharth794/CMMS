import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Search, Filter, Eye, Edit2, Trash2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WorkOrders = () => {
  const { user, getAuthHeader } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedWO, setSelectedWO] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    location: '',
    asset_id: '',
    due_date: ''
  });

  useEffect(() => {
    fetchWorkOrders();
    fetchAssets();
    fetchTechnicians();
  }, [statusFilter, priorityFilter]);

  const fetchWorkOrders = async () => {
    try {
      let url = `${API}/work-orders`;
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await axios.get(url, getAuthHeader());
      setWorkOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch work orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${API}/assets`, getAuthHeader());
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await axios.get(`${API}/users/technicians`, getAuthHeader());
      setTechnicians(response.data);
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API}/work-orders`, formData, getAuthHeader());
      toast.success('Work order created successfully');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', priority: 'medium', location: '', asset_id: '', due_date: '' });
      fetchWorkOrders();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create work order');
    }
  };

  const handleUpdate = async (id, updateData) => {
    try {
      await axios.put(`${API}/work-orders/${id}`, updateData, getAuthHeader());
      toast.success('Work order updated');
      fetchWorkOrders();
      if (selectedWO?.id === id) {
        const response = await axios.get(`${API}/work-orders/${id}`, getAuthHeader());
        setSelectedWO(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update work order');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work order?')) return;
    try {
      await axios.delete(`${API}/work-orders/${id}`, getAuthHeader());
      toast.success('Work order deleted');
      fetchWorkOrders();
      setShowDetailModal(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete work order');
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await axios.get(`${API}/work-orders/${id}`, getAuthHeader());
      setSelectedWO(response.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load work order details');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = workOrders.filter(wo =>
    wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wo.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-in" data-testid="work-orders-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Work Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage maintenance requests and tasks</p>
        </div>
        <Button
          className="bg-[#001F3F] hover:bg-[#003366] text-white font-semibold uppercase tracking-wide"
          onClick={() => setShowCreateModal(true)}
          data-testid="create-work-order-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 rounded-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-work-orders"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="priority-filter">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <Table className="table-dense">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs uppercase tracking-wider">ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Title</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Location</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Priority</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Created</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Assigned To</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Loading work orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No work orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((wo) => (
                <TableRow key={wo.id} className="hover:bg-gray-50" data-testid={`work-order-row-${wo.id}`}>
                  <TableCell className="font-mono text-xs text-gray-500">#{wo.id.slice(0, 8)}</TableCell>
                  <TableCell className="font-medium">{wo.title}</TableCell>
                  <TableCell className="text-sm text-gray-600">{wo.location}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(wo.status)}>{wo.status.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {wo.created_at ? format(parseISO(wo.created_at), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-sm">{wo.assigned_to_name || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => viewDetails(wo.id)} data-testid={`view-wo-${wo.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user?.role !== 'requester' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(wo.id)} className="text-red-600 hover:text-red-700" data-testid={`delete-wo-${wo.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Create Work Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description of the issue"
                data-testid="wo-title-input"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the work needed"
                rows={3}
                data-testid="wo-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger data-testid="wo-priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  data-testid="wo-due-date-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Building, floor, room number"
                data-testid="wo-location-input"
              />
            </div>
            <div>
              <Label htmlFor="asset">Related Asset (Optional)</Label>
              <Select value={formData.asset_id || "none"} onValueChange={(v) => setFormData({ ...formData, asset_id: v === "none" ? "" : v })}>
                <SelectTrigger data-testid="wo-asset-select">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button
              className="bg-[#001F3F] hover:bg-[#003366]"
              onClick={handleCreate}
              disabled={!formData.title || !formData.description || !formData.location}
              data-testid="submit-work-order-btn"
            >
              Create Work Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight uppercase text-[#001F3F] flex items-center gap-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Work Order Details
              <span className="font-mono text-sm text-gray-400">#{selectedWO?.id?.slice(0, 8)}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedWO && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(selectedWO.priority)}>{selectedWO.priority}</Badge>
                <Badge className={getStatusColor(selectedWO.status)}>{selectedWO.status.replace('_', ' ')}</Badge>
              </div>

              <div>
                <h3 className="font-semibold text-lg text-[#001F3F]">{selectedWO.title}</h3>
                <p className="text-gray-600 mt-2">{selectedWO.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p className="font-medium">{selectedWO.location}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created By:</span>
                  <p className="font-medium">{selectedWO.created_by_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-medium">{selectedWO.created_at ? format(parseISO(selectedWO.created_at), 'MMM d, yyyy h:mm a') : '-'}</p>
                </div>
                {selectedWO.due_date && (
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <p className="font-medium">{selectedWO.due_date}</p>
                  </div>
                )}
                {selectedWO.asset_name && (
                  <div>
                    <span className="text-gray-500">Related Asset:</span>
                    <p className="font-medium">{selectedWO.asset_name}</p>
                  </div>
                )}
              </div>

              {user?.role !== 'requester' && (
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-[#001F3F]">Update Work Order</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={selectedWO.status}
                        onValueChange={(v) => handleUpdate(selectedWO.id, { status: v })}
                      >
                        <SelectTrigger data-testid="update-status-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Assign To</Label>
                      <Select
                        value={selectedWO.assigned_to || 'unassigned'}
                        onValueChange={(v) => handleUpdate(selectedWO.id, { assigned_to: v === 'unassigned' ? null : v })}
                      >
                        <SelectTrigger data-testid="assign-to-select">
                          <SelectValue placeholder="Select technician" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {technicians.map(tech => (
                            <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrders;
