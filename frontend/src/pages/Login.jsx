import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Wrench, Shield, Building2 } from 'lucide-react';

const Login = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'requester'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password, formData.role);
        toast.success('Account created successfully!');
      } else {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_facility-manager-19/artifacts/dxiig5gm_SFM%20logo.jpg" 
              alt="Spartans Facility Management" 
              className="h-20 mx-auto mb-4"
              data-testid="login-logo"
            />
            <h1 className="text-3xl tracking-tight uppercase text-[#001F3F]" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
              {isRegister ? 'Create Account' : 'Sign In to Portal'}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {isRegister ? 'Join the Spartans team' : 'Manage your facility operations'}
            </p>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      data-testid="register-name-input"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={isRegister}
                      className="h-11"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="login-email-input"
                    placeholder="you@spartansfm.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    data-testid="login-password-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                {isRegister && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger data-testid="register-role-select" className="h-11">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="requester">Requester</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  type="submit"
                  data-testid="login-submit-btn"
                  className="w-full h-11 bg-[#001F3F] hover:bg-[#003366] text-white font-semibold uppercase tracking-wide"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  data-testid="toggle-auth-mode"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-sm text-[#001F3F] hover:text-[#D32F2F] transition-colors"
                >
                  {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3">
              <Wrench className="h-6 w-6 mx-auto text-[#D32F2F] mb-2" />
              <p className="text-xs text-gray-500">Work Orders</p>
            </div>
            <div className="p-3">
              <Building2 className="h-6 w-6 mx-auto text-[#D32F2F] mb-2" />
              <p className="text-xs text-gray-500">Asset Tracking</p>
            </div>
            <div className="p-3">
              <Shield className="h-6 w-6 mx-auto text-[#D32F2F] mb-2" />
              <p className="text-xs text-gray-500">PM Schedules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-[#001F3F]/80 z-10" />
        <img
          src="https://images.unsplash.com/photo-1721937127582-ed331de95a04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHx3YXJlaG91c2UlMjBpbnZlbnRvcnklMjBzaGVsdmVzfGVufDB8fHx8MTc2ODU4MTgyMnww&ixlib=rb-4.1.0&q=85"
          alt="Facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
          <h2 className="text-4xl md:text-5xl tracking-tight uppercase text-center" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            Spartans Facility Management
          </h2>
          <p className="mt-4 text-lg text-gray-300 text-center max-w-md">
            Streamline your maintenance operations with our comprehensive CMMS solution
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
