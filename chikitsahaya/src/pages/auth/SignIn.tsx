import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stethoscope, 
  Heart, 
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { authAPI, LoginRequest } from '@/services/api';

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState<'doctor' | 'patient' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('patient');

  // Set active tab based on URL parameter
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'doctor' || roleParam === 'patient') {
      setActiveTab(roleParam);
    }
  }, [searchParams]);

  const [doctorForm, setDoctorForm] = useState({
    email: '',
    password: '',
  });

  const [patientForm, setPatientForm] = useState({
    email: '',
    password: '',
  });

  const handleDoctorSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('doctor');
    
    try {
      // Validation
      if (!doctorForm.email || !doctorForm.password) {
        throw new Error('Please fill in all fields');
      }

      const loginData: LoginRequest = {
        email: doctorForm.email,
        password: doctorForm.password,
      };

      console.log('Doctor Login - Form Data:', doctorForm);
      console.log('Doctor Login - API Payload:', loginData);

      const response = await authAPI.doctorLogin(loginData);
      
      console.log('Doctor Login - API Response:', response);
      
      if (response.success) {
        console.log('Doctor Login - Success, setting user and navigating to dashboard');
        
        // Create a mock user object for the auth context
        const mockUser = {
          id: 'doctor-' + Date.now(),
          role: 'doctor' as const,
          token: 'mock-token',
          name: 'Dr. User', // We don't have the actual name from backend
          email: doctorForm.email,
          onboardingComplete: true,
        };
        
        setUser(mockUser);
        localStorage.setItem('auth-user', JSON.stringify(mockUser));
        navigate('/doctor/dashboard');
      } else {
        console.error('Doctor Login - Failed:', response.error);
        throw new Error(response.error || 'Login failed');
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in as doctor",
      });
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handlePatientSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('patient');
    
    try {
      // Validation
      if (!patientForm.email || !patientForm.password) {
        throw new Error('Please fill in all fields');
      }

      const loginData: LoginRequest = {
        email: patientForm.email,
        password: patientForm.password,
      };

      console.log('Patient Login - Form Data:', patientForm);
      console.log('Patient Login - API Payload:', loginData);

      const response = await authAPI.patientLogin(loginData);
      
      console.log('Patient Login - API Response:', response);
      
      if (response.success) {
        console.log('Patient Login - Success, setting user and navigating to dashboard');
        
        // Create a mock user object for the auth context
        const mockUser = {
          id: 'patient-' + Date.now(),
          role: 'patient' as const,
          token: 'mock-token',
          name: 'Patient User', // We don't have the actual name from backend
          email: patientForm.email,
          onboardingComplete: true,
        };
        
        setUser(mockUser);
        localStorage.setItem('auth-user', JSON.stringify(mockUser));
        navigate('/patient/dashboard');
      } else {
        console.error('Patient Login - Failed:', response.error);
        throw new Error(response.error || 'Login failed');
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in as patient",
      });
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        // variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your ChikitsaHaya account</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="patient" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="doctor" className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Doctor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patient" className="space-y-4">
                <form onSubmit={handlePatientSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      placeholder="Enter your email"
                      value={patientForm.email}
                      onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="patient-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={patientForm.password}
                        onChange={(e) => setPatientForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading === 'patient'}
                  >
                    {isLoading === 'patient' ? 'Signing In...' : 'Sign In as Patient'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="doctor" className="space-y-4">
                <form onSubmit={handleDoctorSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email</Label>
                    <Input
                      id="doctor-email"
                      type="email"
                      placeholder="Enter your email"
                      value={doctorForm.email}
                      onChange={(e) => setDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="doctor-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={doctorForm.password}
                        onChange={(e) => setDoctorForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading === 'doctor'}
                  >
                    {isLoading === 'doctor' ? 'Signing In...' : 'Sign In as Doctor'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to={`/signup?role=${activeTab}`} className="text-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignIn;
