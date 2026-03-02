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
import { Plus, Search, Package, AlertTriangle, Edit2, Trash2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Inventory = () => {
  const { user, getAuthHeader } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    quantity: 0,
    min_quantity: 0,
    unit: 'pcs',
    location: '',
    unit_cost: 0
  });

  const categories = ['Filters', 'Electrical', 'Plumbing', 'HVAC', 'Safety', 'Tools', 'Lubricants', 'Fasteners', 'Other'];
  const units = ['pcs', 'boxes', 'kg', 'liters', 'meters', 'sets'];

  useEffect(() => {
    fetchInventory();
  }, [categoryFilter, lowStockOnly]);

  const fetchInventory = async () => {
    try {
      let url = `${API}/inventory`;
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (lowStockOnly) params.append('low_stock', 'true');
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url, getAuthHeader());
      setItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API}/inventory`, formData, getAuthHeader());
      toast.success('Item added to inventory');
      setShowCreateModal(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add item');
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      await axios.put(`${API}/inventory/${selectedItem.id}`, formData, getAuthHeader());
      toast.success('Item updated');
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`${API}/inventory/${id}`, getAuthHeader());
      toast.success('Item deleted');
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete item');
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      sku: item.sku || '',
      quantity: item.quantity,
      min_quantity: item.min_quantity,
      unit: item.unit,
      location: item.location,
      unit_cost: item.unit_cost
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      sku: '',
      quantity: 0,
      min_quantity: 0,
      unit: 'pcs',
      location: '',
      unit_cost: 0
    });
  };

  const isLowStock = (item) => item.quantity <= item.min_quantity;

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canEdit = user?.role !== 'requester';

  const lowStockCount = items.filter(isLowStock).length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);

  return (
    <div className="space-y-6 animate-slide-in" data-testid="inventory-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage spare parts and supplies</p>
        </div>
        {canEdit && (
          <Button 
            className="bg-[#001F3F] hover:bg-[#003366] text-white font-semibold uppercase tracking-wide"
            onClick={() => setShowCreateModal(true)}
            data-testid="add-inventory-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="inventory-total-items">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-[#001F3F]">{items.length}</p>
              </div>
              <Package className="h-8 w-8 text-[#001F3F]/20" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-white border rounded-sm shadow-sm ${lowStockCount > 0 ? 'border-red-300' : 'border-gray-200'}`} data-testid="inventory-low-stock">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock Alerts</p>
                <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-[#D32F2F]' : 'text-[#001F3F]'}`}>{lowStockCount}</p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${lowStockCount > 0 ? 'text-[#D32F2F]/30' : 'text-gray-200'}`} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="inventory-total-value">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-[#001F3F]">${totalValue.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 rounded-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-inventory"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40" data-testid="inventory-category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant={lowStockOnly ? "default" : "outline"}
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={lowStockOnly ? "bg-[#D32F2F] hover:bg-[#B71C1C]" : ""}
              data-testid="low-stock-filter"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
        <Table className="table-dense">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs uppercase tracking-wider">Item</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">SKU</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-xs uppercase tracking-wider">Location</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Quantity</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Unit Cost</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Loading inventory...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={`hover:bg-gray-50 ${isLowStock(item) ? 'bg-red-50' : ''}`}
                  data-testid={`inventory-row-${item.id}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{item.name}</div>
                      {isLowStock(item) && (
                        <Badge className="bg-red-100 text-red-800">Low Stock</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">{item.sku || '-'}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-sm text-gray-600">{item.location}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${isLowStock(item) ? 'text-[#D32F2F]' : ''}`}>
                      {item.quantity}
                    </span>
                    <span className="text-gray-400 text-sm"> / {item.min_quantity} {item.unit}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">${item.unit_cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {canEdit && (
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(item)} data-testid={`edit-inv-${item.id}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {user?.role === 'admin' && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-700" data-testid={`delete-inv-${item.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Add Inventory Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Air Filter 20x25"
                data-testid="inv-name-input"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Item details"
                rows={2}
                data-testid="inv-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger data-testid="inv-category-select">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Optional"
                  data-testid="inv-sku-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  data-testid="inv-quantity-input"
                />
              </div>
              <div>
                <Label htmlFor="min_quantity">Min Qty</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                  data-testid="inv-min-qty-input"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                  <SelectTrigger data-testid="inv-unit-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Storage Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Warehouse/Shelf"
                  data-testid="inv-location-input"
                />
              </div>
              <div>
                <Label htmlFor="unit_cost">Unit Cost ($)</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                  data-testid="inv-cost-input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</Button>
            <Button 
              className="bg-[#001F3F] hover:bg-[#003366]" 
              onClick={handleCreate}
              disabled={!formData.name || !formData.category || !formData.location}
              data-testid="submit-inventory-btn"
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Edit Inventory Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="edit-inv-name-input"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  data-testid="edit-inv-quantity-input"
                />
              </div>
              <div>
                <Label htmlFor="edit-min_quantity">Min Qty</Label>
                <Input
                  id="edit-min_quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                  data-testid="edit-inv-min-qty-input"
                />
              </div>
              <div>
                <Label htmlFor="edit-unit_cost">Unit Cost ($)</Label>
                <Input
                  id="edit-unit_cost"
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                  data-testid="edit-inv-cost-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-location">Storage Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                data-testid="edit-inv-location-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditModal(false); setSelectedItem(null); resetForm(); }}>Cancel</Button>
            <Button 
              className="bg-[#001F3F] hover:bg-[#003366]" 
              onClick={handleUpdate}
              data-testid="update-inventory-btn"
            >
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
