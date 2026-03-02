import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Reports = () => {
  const { getAuthHeader } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      let url = `${API}/reports/work-orders`;
      const params = new URLSearchParams();
      if (dateRange.start_date) params.append('start_date', dateRange.start_date);
      if (dateRange.end_date) params.append('end_date', dateRange.end_date);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await axios.get(url, getAuthHeader());
      setReport(response.data);
    } catch (error) {
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    fetchReport();
  };

  const COLORS = ['#001F3F', '#D32F2F', '#FFC107', '#2E7D32', '#9C27B0'];

  const statusData = report?.by_status ? Object.entries(report.by_status).map(([name, value]) => ({
    name: name.replace('_', ' ').charAt(0).toUpperCase() + name.replace('_', ' ').slice(1),
    value
  })) : [];

  const priorityData = report?.by_priority ? Object.entries(report.by_priority).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

  return (
    <div className="space-y-6 animate-slide-in" data-testid="reports-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">Work order analytics and insights</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200 rounded-sm shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                data-testid="report-start-date"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                data-testid="report-end-date"
              />
            </div>
            <Button 
              className="bg-[#001F3F] hover:bg-[#003366]"
              onClick={handleFilter}
              data-testid="apply-filter-btn"
            >
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading report...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="report-total-wo">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Work Orders</p>
                    <p className="text-3xl font-bold text-[#001F3F] mt-1">{report?.total || 0}</p>
                  </div>
                  <div className="p-3 bg-[#001F3F]/10 rounded-sm">
                    <BarChart3 className="h-6 w-6 text-[#001F3F]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="report-completed">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Completed</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{report?.completed || 0}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-sm">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="report-completion-rate">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Completion Rate</p>
                    <p className="text-3xl font-bold text-[#001F3F] mt-1">{report?.completion_rate || 0}%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-sm">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#001F3F] text-white rounded-sm shadow-sm" data-testid="report-pending">
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-300 font-medium">Pending</p>
                  <p className="text-3xl font-bold mt-1">{(report?.total || 0) - (report?.completed || 0)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="status-chart">
              <CardHeader className="border-b border-gray-200 p-4">
                <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  Work Orders by Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {statusData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="priority-chart">
              <CardHeader className="border-b border-gray-200 p-4">
                <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                  Work Orders by Priority
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {priorityData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px'
                        }}
                      />
                      <Bar dataKey="value" fill="#001F3F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Table */}
          <Card className="bg-white border border-gray-200 rounded-sm shadow-sm" data-testid="summary-table">
            <CardHeader className="border-b border-gray-200 p-4">
              <CardTitle className="text-lg tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                Summary Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {statusData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-[#001F3F]">{item.value}</span>
                      <span className="text-sm text-gray-500">
                        ({report?.total ? ((item.value / report.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Reports;
