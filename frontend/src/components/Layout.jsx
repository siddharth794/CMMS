import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import {
  LayoutDashboard,
  ClipboardList,
  Box,
  Calendar,
  Package,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/work-orders', icon: ClipboardList, label: 'Work Orders' },
  { path: '/assets', icon: Box, label: 'Assets' },
  { path: '/preventive-maintenance', icon: Calendar, label: 'PM Schedules' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ className = '', onNavClick = () => {} }) => {
  const location = useLocation();
  
  return (
    <div className={`flex flex-col h-full bg-[#0B1120] ${className}`}>
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <img 
          src="https://customer-assets.emergentagent.com/job_facility-manager-19/artifacts/dxiig5gm_SFM%20logo.jpg" 
          alt="SFM Logo" 
          className="h-12 mx-auto"
          data-testid="sidebar-logo"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavClick}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm font-medium ${
                isActive
                  ? 'bg-[#D32F2F] text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-gray-500 text-center">
          Spartans CMMS v1.0
        </p>
      </div>
    </div>
  );
};

const Layout = () => {
  const { user, logout, getAuthHeader } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`, getAuthHeader());
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/${id}/read`, {}, getAuthHeader());
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API}/notifications/read-all`, {}, getAuthHeader());
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-[#D32F2F] text-white';
      case 'technician': return 'bg-[#001F3F] text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]" data-testid="app-layout">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed h-full z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-[#0B1120] border-0">
          <Sidebar onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              data-testid="mobile-menu-btn"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search placeholder - can be implemented later */}
            <div className="flex-1 max-w-md mx-4">
              <div className="hidden md:block text-sm text-gray-500">
                Welcome back, <span className="font-semibold text-[#001F3F]">{user?.name}</span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" data-testid="notifications-btn">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#D32F2F] text-white text-xs flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <DropdownMenuItem
                          key={notif.id}
                          className={`p-3 cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''}`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-btn">
                    <div className="h-8 w-8 rounded-full bg-[#001F3F] flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-3 border-b">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <Badge className={`mt-2 ${getRoleBadgeColor(user?.role)}`}>
                      {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                    </Badge>
                  </div>
                  <DropdownMenuItem asChild>
                    <NavLink to="/settings" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer" data-testid="logout-btn">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 grid-bg min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
