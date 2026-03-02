import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  AlertTriangle, 
  Box, 
  Package, 
  Calendar,
  Plus,
  ArrowRight,
  Wrench,
  Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { getAuthHeader } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, getAuthHeader());
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBorder = (priority) => {
    switch (priority) {
      case 'critical': return 'status-critical';
      case 'high': return 'status-high';
      case 'medium': return 'status-medium';
      case 'low': return 'status-low';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-[#001F3F]">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in" data-testid="dashboard-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Overview of facility operations</p>
        </div>
        <div className="flex gap-2">
          <Link to="/work-orders">
            <Button className="bg-[#001F3F] hover:bg-[#003366] text-white font-semibold uppercase tracking-wide" data-testid="new-work-order-btn">
              <Plus className="h-4 w-4 mr-2" />
              New Work Order
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards - Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Work Orders */}
        <Card className="bg-white border border-gray-200 rounded-sm shadow-sm card-hover" data-testid="kpi-total-wo">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Work Orders</p>
                <p className="text-3xl font-bold text-[#001F3F] mt-1">{stats?.work_orders?.total || 0}</p>
              </div>
              <div className="p-3 bg-[#001F3F]/10 rounded-sm">
                <ClipboardList className="h-6 w-6 text-[#001F3F]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <span className="text-blue-600">{stats?.work_orders?.open || 0} Open</span>
              <span className="text-yellow-600">{stats?.work_orders?.in_progress || 0} In Progress</span>
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card className="bg-white border border-gray-200 rounded-sm shadow-sm card-hover border-l-4 border-l-[#D32F2F]" data-testid="kpi-critical">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Critical Alerts</p>
                <p className="text-3xl font-bold text-[#D32F2F] mt-1">{stats?.work_orders?.critical || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-sm">
                <AlertTriangle className="h-6 w-6 text-[#D32F2F]" />
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">Require immediate attention</p>
          </CardContent>
        </Card>

        {/* Assets */}
        <Card className="bg-white border border-gray-200 rounded-sm shadow-sm card-hover" data-testid="kpi-assets">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Assets</p>
                <p className="text-3xl font-bold text-[#001F3F] mt-1">{stats?.assets?.total || 0}</p>
              </div>
              <div className="p-3 bg-[#001F3F]/10 rounded-sm">
                <Box className="h-6 w-6 text-[#001F3F]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs">
              <span className="text-green-600">{stats?.assets?.operational || 0} Operational</span>
              <span className="text-orange-600">{stats?.assets?.maintenance || 0} Maintenance</span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card className="bg-white border border-gray-200 rounded-sm shadow-sm card-hover" data-testid="kpi-inventory">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Low Stock Items</p>
                <p className="text-3xl font-bold text-[#ED6C02] mt-1">{stats?.inventory?.low_stock || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-sm">
                <Package className="h-6 w-6 text-[#ED6C02]" />
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500">{stats?.inventory?.total || 0} total items</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Work Orders - Spans 8 cols */}
        <Card className="lg:col-span-8 bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="recent-work-orders">
          <CardHeader className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Recent Work Orders
              </CardTitle>
              <Link to="/work-orders">
                <Button variant="ghost" size="sm" className="text-[#001F3F] hover:text-[#D32F2F]">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {stats?.recent_work_orders?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No work orders yet</p>
                <Link to="/work-orders">
                  <Button variant="outline" className="mt-4">Create First Work Order</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats?.recent_work_orders?.map((wo) => (
                  <div key={wo.id} className={`p-4 hover:bg-gray-50 transition-colors ${getStatusBorder(wo.priority)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-400">#{wo.id.slice(0, 8)}</span>
                          <Badge className={getPriorityColor(wo.priority)}>{wo.priority}</Badge>
                          <Badge className={getStatusColor(wo.status)}>{wo.status.replace('_', ' ')}</Badge>
                        </div>
                        <h4 className="font-semibold text-[#001F3F] mt-1 truncate">{wo.title}</h4>
                        <p className="text-sm text-gray-500 truncate">{wo.location}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>{wo.created_by_name}</p>
                        <p className="mt-1">{format(parseISO(wo.created_at), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Spans 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Maintenance */}
          <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="upcoming-maintenance">
            <CardHeader className="border-b border-gray-200 p-4">
              <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Upcoming PM
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.upcoming_maintenance?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No scheduled maintenance</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {stats?.upcoming_maintenance?.map((pm) => (
                    <div key={pm.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-sm">
                          <Wrench className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-[#001F3F] truncate">{pm.title}</h4>
                          <p className="text-xs text-gray-500">{pm.asset_name}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>Due: {pm.next_due_date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-[#001F3F] text-white rounded-sm shadow-sm" data-testid="quick-actions">
            <CardHeader className="border-b border-white/10 p-4">
              <CardTitle className="text-lg tracking-tight uppercase" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Link to="/work-orders" className="block">
                <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Work Order
                </Button>
              </Link>
              <Link to="/assets" className="block">
                <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0">
                  <Box className="h-4 w-4 mr-2" />
                  Add New Asset
                </Button>
              </Link>
              <Link to="/preventive-maintenance" className="block">
                <Button variant="secondary" className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-0">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule PM Task
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
