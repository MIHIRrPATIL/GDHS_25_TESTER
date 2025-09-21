import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Stethoscope, 
  Heart, 
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PatientForm, PatientFormData } from '@/components/forms/PatientForm';
import { authAPI, DoctorSignUpRequest, PatientSignUpRequest } from '@/services/api';

const SignUp = () => {
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
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  // Patient form is now handled by PatientForm component


  const handleDoctorSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading('doctor');
    
    try {
      // Validation
      if (!doctorForm.firstName || !doctorForm.lastName || !doctorForm.email || 
          !doctorForm.password) {
        throw new Error('Please fill in all required fields');
      }

      if (doctorForm.password !== doctorForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (doctorForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!doctorForm.agreeToTerms) {
        throw new Error('Please agree to the terms and conditions');
      }

      // Register the doctor using API directly
      const doctorSignUpData: DoctorSignUpRequest = {
        firstName: doctorForm.firstName,
        lastName: doctorForm.lastName,
        email: doctorForm.email,
        password: doctorForm.password,
      };

      console.log('Doctor SignUp - Form Data:', doctorForm);
      console.log('Doctor SignUp - API Payload:', doctorSignUpData);

      const response = await authAPI.doctorSignUp(doctorSignUpData);
      
      console.log('Doctor SignUp - API Response:', response);
      
      if (response.success) {
        console.log('Doctor SignUp - Success, setting user and navigating to dashboard');
        
        // Create a mock user object for the auth context
        const mockUser = {
          id: 'doctor-' + Date.now(),
          role: 'doctor' as const,
          token: 'mock-token',
          name: `Dr. ${doctorForm.firstName} ${doctorForm.lastName}`,
          email: doctorForm.email,
          onboardingComplete: true,
        };
        
        setUser(mockUser);
        localStorage.setItem('auth-user', JSON.stringify(mockUser));
        navigate('/doctor/dashboard');
      } else {
        console.error('Doctor SignUp - Failed:', response.error);
        throw new Error(response.error || 'Registration failed');
      }

      toast({
        title: "Welcome to ChikitsaHaya!",
        description: "Your doctor account has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handlePatientSignUp = async (data: PatientFormData) => {
    setIsLoading('patient');
    
    try {
      // Validation
      if (!data.firstName || !data.lastName || !data.email || 
          !data.password || !data.phone || !data.dateOfBirth || 
          !data.Gender) {
        throw new Error('Please fill in all required fields');
      }

      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (data.password && data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!data.agreeToTerms) {
        throw new Error('Please agree to the terms and conditions');
      }

      // Create comprehensive patient signup data
      const patientSignUpData: PatientSignUpRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password || '',
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        Gender: data.Gender,
        age: data.Age,
        height: data.Height,
        weight: data.Weight,
        occupation: 'Student', // Default value - backend expects this
        gender: data.Gender.toLowerCase(), // Backend expects lowercase gender field
        isSmoker: data.isSmoker,
        isDrunkard: data.isDrunkard,
        exercise: data.Execises,
        chronicDiseases: data.chronicDiseases,
        allergies: data.allergies,
        currentMeds: data.currentMeds,
        familyHistory: data.familyHistory,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone
      };

      console.log('Patient SignUp - Form Data:', data);
      console.log('Patient SignUp - API Payload:', patientSignUpData);

      const response = await authAPI.patientSignUp(patientSignUpData);
      
      console.log('Patient SignUp - API Response:', response);
      
      if (response.success) {
        console.log('Patient SignUp - Success, setting user and navigating to dashboard');
        
        // Create a mock user object for the auth context
        const mockUser = {
          id: 'patient-' + Date.now(),
          role: 'patient' as const,
          token: 'mock-token',
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          onboardingComplete: true,
        };
        
        setUser(mockUser);
        localStorage.setItem('auth-user', JSON.stringify(mockUser));
        navigate('/patient/dashboard');
      } else {
        console.error('Patient SignUp - Failed:', response.error);
        throw new Error(response.error || 'Registration failed');
      }

      toast({
        title: "Welcome to ChikitsaHaya!",
        description: "Your patient account has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please try again",
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
        className="w-full max-w-2xl"
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Join ChikitsaHaya</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl">Create Account</CardTitle>
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
                <PatientForm
                  onSubmit={handlePatientSignUp}
                  submitButtonText="Create Patient Account"
                  showPasswordFields={true}
                  showTermsCheckbox={true}
                  isLoading={isLoading === 'patient'}
                  mode="signup"
                />
              </TabsContent>

              <TabsContent value="doctor" className="space-y-4">
                <form onSubmit={handleDoctorSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-firstName">First Name *</Label>
                      <Input
                        id="doctor-firstName"
                        placeholder="Dr. John"
                        value={doctorForm.firstName}
                        onChange={(e) => setDoctorForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-lastName">Last Name *</Label>
                      <Input
                        id="doctor-lastName"
                        placeholder="Smith"
                        value={doctorForm.lastName}
                        onChange={(e) => setDoctorForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-email">Email *</Label>
                    <Input
                      id="doctor-email"
                      type="email"
                      placeholder="dr.smith@hospital.com"
                      value={doctorForm.email}
                      onChange={(e) => setDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="doctor-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6 characters"
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
                    <div className="space-y-2">
                      <Label htmlFor="doctor-confirmPassword">Confirm Password *</Label>
                      <Input
                        id="doctor-confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={doctorForm.confirmPassword}
                        onChange={(e) => setDoctorForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {/* <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-phone">Phone Number *</Label>
                      <Input
                        id="doctor-phone"
                        type="tel"
                        placeholder="+1-555-0123"
                        value={doctorForm.phone}
                        onChange={(e) => setDoctorForm(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-license">License Number *</Label>
                      <Input
                        id="doctor-license"
                        placeholder="MD123456"
                        value={doctorForm.licenseNumber}
                        onChange={(e) => setDoctorForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        required
                      />
                    </div>
                  </div> */}

                  {/* <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-specialty">Specialty *</Label>
                      <Select
                        value={doctorForm.specialty}
                        onValueChange={(value) => setDoctorForm(prev => ({ ...prev, specialty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty} value={specialty.toLowerCase()}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-department">Department</Label>
                      <Select
                        value={doctorForm.department}
                        onValueChange={(value) => setDoctorForm(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department.toLowerCase()}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div> */}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="doctor-terms"
                      checked={doctorForm.agreeToTerms}
                      onCheckedChange={(checked) => setDoctorForm(prev => ({ ...prev, agreeToTerms: checked as boolean }))}
                    />
                    <Label htmlFor="doctor-terms" className="text-sm">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading === 'doctor'}
                  >
                    {isLoading === 'doctor' ? 'Creating Account...' : 'Create Doctor Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to={`/signin?role=${activeTab}`} className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignUp;
