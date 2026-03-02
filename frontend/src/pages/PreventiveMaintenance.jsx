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
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { Plus, Calendar as CalendarIcon, CheckCircle, Clock, Wrench, Trash2 } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PreventiveMaintenance = () => {
  const { user, getAuthHeader } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    asset_id: '',
    frequency: 'monthly',
    next_due_date: '',
    assigned_to: '',
    checklist: ''
  });

  useEffect(() => {
    fetchSchedules();
    fetchAssets();
    fetchTechnicians();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${API}/pm-schedules`, getAuthHeader());
      setSchedules(response.data);
    } catch (error) {
      toast.error('Failed to fetch PM schedules');
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
      const payload = {
        ...formData,
        checklist: formData.checklist ? formData.checklist.split('\n').filter(item => item.trim()) : []
      };
      await axios.post(`${API}/pm-schedules`, payload, getAuthHeader());
      toast.success('PM schedule created successfully');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', asset_id: '', frequency: 'monthly', next_due_date: '', assigned_to: '', checklist: '' });
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create PM schedule');
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.post(`${API}/pm-schedules/${id}/complete`, {}, getAuthHeader());
      toast.success('PM task marked as complete');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete PM task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PM schedule?')) return;
    try {
      await axios.delete(`${API}/pm-schedules/${id}`, getAuthHeader());
      toast.success('PM schedule deleted');
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete PM schedule');
    }
  };

  const getFrequencyColor = (freq) => {
    switch (freq) {
      case 'daily': return 'bg-red-100 text-red-800';
      case 'weekly': return 'bg-orange-100 text-orange-800';
      case 'biweekly': return 'bg-yellow-100 text-yellow-800';
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'yearly': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const schedulesForDate = schedules.filter(pm => {
    try {
      const dueDate = pm.next_due_date ? parseISO(pm.next_due_date) : new Date();
      return isSameDay(dueDate, selectedDate);
    } catch {
      return false;
    }
  });

  const dueDates = schedules.map(pm => {
    try {
      return pm.next_due_date ? parseISO(pm.next_due_date) : new Date();
    } catch {
      return null;
    }
  }).filter(Boolean);

  const canEdit = user?.role !== 'requester';

  return (
    <div className="space-y-6 animate-slide-in" data-testid="pm-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Preventive Maintenance
          </h1>
          <p className="text-sm text-gray-500 mt-1">Schedule and track recurring maintenance tasks</p>
        </div>
        {canEdit && (
          <Button
            className="bg-[#001F3F] hover:bg-[#003366] text-white font-semibold uppercase tracking-wide"
            onClick={() => setShowCreateModal(true)}
            data-testid="create-pm-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            New PM Schedule
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-5 bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="pm-calendar">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Maintenance Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border w-full"
              modifiers={{
                hasPM: dueDates
              }}
              modifiersStyles={{
                hasPM: {
                  backgroundColor: '#D32F2F20',
                  fontWeight: 'bold',
                  color: '#D32F2F'
                }
              }}
            />
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 rounded bg-[#D32F2F20]"></div>
              <span>Days with scheduled maintenance</span>
            </div>
          </CardContent>
        </Card>

        {/* Schedules for Selected Date */}
        <Card className="lg:col-span-7 bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="pm-schedules-list">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {schedulesForDate.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No maintenance scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedulesForDate.map((pm) => (
                  <div key={pm.id} className="p-4 border border-gray-200 rounded-sm hover:border-[#001F3F]/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-sm">
                          <Wrench className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-[#001F3F]">{pm.title}</h4>
                          <p className="text-sm text-gray-500">{pm.asset_name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getFrequencyColor(pm.frequency)}>{pm.frequency}</Badge>
                            {pm.assigned_to_name && (
                              <span className="text-xs text-gray-400">Assigned: {pm.assigned_to_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleComplete(pm.id)}
                            data-testid={`complete-pm-${pm.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All PM Schedules */}
      <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="all-pm-schedules">
        <CardHeader className="border-b border-gray-200 p-4">
          <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            All PM Schedules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading schedules...</div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No PM schedules created yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {schedules.map((pm) => (
                <div key={pm.id} className="p-4 hover:bg-gray-50 transition-colors" data-testid={`pm-row-${pm.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-sm ${pm.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Wrench className={`h-4 w-4 ${pm.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#001F3F]">{pm.title}</h4>
                        <p className="text-sm text-gray-500">{pm.asset_name}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge className={getFrequencyColor(pm.frequency)}>{pm.frequency}</Badge>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Next: {pm.next_due_date}
                          </span>
                          {pm.last_completed && (
                            <span className="text-gray-500">
                              Last: {pm.last_completed ? format(parseISO(pm.last_completed), 'MMM d') : '-'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleComplete(pm.id)}
                            data-testid={`complete-pm-list-${pm.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          {user?.role === 'admin' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(pm.id)}
                              data-testid={`delete-pm-${pm.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              Create PM Schedule
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Monthly HVAC Filter Change"
                data-testid="pm-title-input"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Details about the maintenance task"
                rows={2}
                data-testid="pm-description-input"
              />
            </div>
            <div>
              <Label htmlFor="asset">Asset *</Label>
              <Select value={formData.asset_id} onValueChange={(v) => setFormData({ ...formData, asset_id: v })}>
                <SelectTrigger data-testid="pm-asset-select">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger data-testid="pm-frequency-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="next_due_date">Next Due Date *</Label>
                <Input
                  id="next_due_date"
                  type="date"
                  value={formData.next_due_date}
                  onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                  data-testid="pm-due-date-input"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select value={formData.assigned_to || "unassigned"} onValueChange={(v) => setFormData({ ...formData, assigned_to: v === "unassigned" ? "" : v })}>
                <SelectTrigger data-testid="pm-assignee-select">
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
            <div>
              <Label htmlFor="checklist">Checklist (one item per line)</Label>
              <Textarea
                id="checklist"
                value={formData.checklist}
                onChange={(e) => setFormData({ ...formData, checklist: e.target.value })}
                placeholder="Check filter condition&#10;Replace if dirty&#10;Test airflow"
                rows={4}
                data-testid="pm-checklist-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button
              className="bg-[#001F3F] hover:bg-[#003366]"
              onClick={handleCreate}
              disabled={!formData.title || !formData.asset_id || !formData.next_due_date}
              data-testid="submit-pm-btn"
            >
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreventiveMaintenance;
