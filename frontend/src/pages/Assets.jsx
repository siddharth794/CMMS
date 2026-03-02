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
import { Plus, Search, Eye, Edit2, Trash2, Box, Wrench, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Assets = () => {
  const { user, getAuthHeader } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    serial_number: '',
    manufacturer: '',
    model: '',
    purchase_date: '',
    warranty_expiry: ''
  });

  const categories = ['HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Elevator', 'Security', 'IT Equipment', 'Other'];

  useEffect(() => {
    fetchAssets();
  }, [statusFilter, categoryFilter]);

  const fetchAssets = async () => {
    try {
      let url = `${API}/assets`;
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url, getAuthHeader());
      setAssets(response.data);
    } catch (error) {
      toast.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API}/assets`, formData, getAuthHeader());
      toast.success('Asset created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', category: '', location: '', serial_number: '', manufacturer: '', model: '', purchase_date: '', warranty_expiry: '' });
      fetchAssets();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create asset');
    }
  };

  const handleUpdate = async (id, updateData) => {
    try {
      await axios.put(`${API}/assets/${id}`, updateData, getAuthHeader());
      toast.success('Asset updated');
      fetchAssets();
      if (selectedAsset?.id === id) {
        const response = await axios.get(`${API}/assets/${id}`, getAuthHeader());
        setSelectedAsset(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update asset');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await axios.delete(`${API}/assets/${id}`, getAuthHeader());
      toast.success('Asset deleted');
      fetchAssets();
      setShowDetailModal(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete asset');
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await axios.get(`${API}/assets/${id}`, getAuthHeader());
      setSelectedAsset(response.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Failed to load asset details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canEdit = user?.role !== 'requester';

  return (
    <div className="space-y-6 animate-slide-in" data-testid="assets-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Assets
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage facility equipment and assets</p>
        </div>
        {canEdit && (
          <Button 
            className="bg-[#001F3F] hover:bg-[#003366] text-white font-semibold uppercase tracking-wide"
            onClick={() => setShowCreateModal(true)}
            data-testid="create-asset-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 rounded-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-assets"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="asset-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="asset-category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Box className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No assets found</p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <Card 
              key={asset.id} 
              className="bg-white border border-gray-200 rounded-sm shadow-sm card-hover cursor-pointer"
              onClick={() => viewDetails(asset.id)}
              data-testid={`asset-card-${asset.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#001F3F]/10 rounded-sm">
                      <Box className="h-5 w-5 text-[#001F3F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#001F3F]">{asset.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{asset.category}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(asset.status)}>{asset.status.replace('_', ' ')}</Badge>
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  <p className="text-gray-600"><span className="text-gray-400">Location:</span> {asset.location}</p>
                  {asset.serial_number && (
                    <p className="font-mono text-xs text-gray-400">SN: {asset.serial_number}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Add New Asset
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., HVAC Unit - Building A"
                data-testid="asset-name-input"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Asset details and specifications"
                rows={2}
                data-testid="asset-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger data-testid="asset-category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Building/Floor/Room"
                  data-testid="asset-location-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="Optional"
                  data-testid="asset-serial-input"
                />
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="Optional"
                  data-testid="asset-manufacturer-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Optional"
                  data-testid="asset-model-input"
                />
              </div>
              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  data-testid="asset-purchase-date-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
              <Input
                id="warranty_expiry"
                type="date"
                value={formData.warranty_expiry}
                onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                data-testid="asset-warranty-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button 
              className="bg-[#001F3F] hover:bg-[#003366]" 
              onClick={handleCreate}
              disabled={!formData.name || !formData.category || !formData.location}
              data-testid="submit-asset-btn"
            >
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight uppercase text-[#001F3F] flex items-center gap-2" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Asset Details
            </DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#001F3F]/10 rounded-sm">
                    <Box className="h-6 w-6 text-[#001F3F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-[#001F3F]">{selectedAsset.name}</h3>
                    <p className="text-sm text-gray-500">{selectedAsset.category}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(selectedAsset.status)}>{selectedAsset.status.replace('_', ' ')}</Badge>
              </div>

              {selectedAsset.description && (
                <p className="text-gray-600">{selectedAsset.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Location:</span>
                  <p className="font-medium">{selectedAsset.location}</p>
                </div>
                {selectedAsset.serial_number && (
                  <div>
                    <span className="text-gray-500">Serial Number:</span>
                    <p className="font-mono">{selectedAsset.serial_number}</p>
                  </div>
                )}
                {selectedAsset.manufacturer && (
                  <div>
                    <span className="text-gray-500">Manufacturer:</span>
                    <p className="font-medium">{selectedAsset.manufacturer}</p>
                  </div>
                )}
                {selectedAsset.model && (
                  <div>
                    <span className="text-gray-500">Model:</span>
                    <p className="font-medium">{selectedAsset.model}</p>
                  </div>
                )}
                {selectedAsset.purchase_date && (
                  <div>
                    <span className="text-gray-500">Purchase Date:</span>
                    <p className="font-medium">{selectedAsset.purchase_date}</p>
                  </div>
                )}
                {selectedAsset.warranty_expiry && (
                  <div>
                    <span className="text-gray-500">Warranty Expiry:</span>
                    <p className="font-medium">{selectedAsset.warranty_expiry}</p>
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="border-t pt-4">
                  <Label>Update Status</Label>
                  <Select 
                    value={selectedAsset.status} 
                    onValueChange={(v) => handleUpdate(selectedAsset.id, { status: v })}
                  >
                    <SelectTrigger className="w-full md:w-60" data-testid="update-asset-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Under Maintenance</SelectItem>
                      <SelectItem value="out_of_service">Out of Service</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Maintenance History */}
              {selectedAsset.maintenance_history && selectedAsset.maintenance_history.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-[#001F3F] mb-3 flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Maintenance History
                  </h4>
                  <div className="space-y-2">
                    {selectedAsset.maintenance_history.slice(0, 5).map((wo) => (
                      <div key={wo.id} className="p-3 bg-gray-50 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{wo.title}</span>
                          <Badge className={getStatusColor(wo.status)}>{wo.status}</Badge>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{format(parseISO(wo.created_at), 'MMM d, yyyy')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="border-t pt-4">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDelete(selectedAsset.id)}
                    data-testid="delete-asset-btn"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Asset
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assets;
