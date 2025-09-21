import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ApiTest = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@example.com',
    password: 'password123'
  });

  const testPatientLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.patientLogin(testCredentials);
      
      if (response.success) {
        toast({
          title: "Patient Login Success",
          description: `Welcome ${response.data?.user.firstName}!`,
        });
      } else {
        toast({
          title: "Patient Login Failed",
          description: response.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to backend server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDoctorLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.doctorLogin(testCredentials);
      
      if (response.success) {
        toast({
          title: "Doctor Login Success",
          description: `Welcome Dr. ${response.data?.user.lastName}!`,
        });
      } else {
        toast({
          title: "Doctor Login Failed",
          description: response.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to backend server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testPatientSignUp = async () => {
    setIsLoading(true);
    try {
      const signUpData = {
        firstName: 'Test',
        lastName: 'Patient',
        email: testCredentials.email,
        password: testCredentials.password,
        phone: '+1-555-0123',
        dateOfBirth: '1990-01-01',
        Gender: 'Male' as const,
        Age: 34,
        Height: 175,
        Weight: 70,
        isSmoker: false,
        isDrunkard: false,
        Execises: 'sometimes' as const,
        chronicDiseases: '',
        allergies: '',
        currentMeds: '',
        familyHistory: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
      };

      const response = await authAPI.patientSignUp(signUpData);
      
      if (response.success) {
        toast({
          title: "Patient Sign Up Success",
          description: `Account created for ${response.data?.user.firstName}!`,
        });
      } else {
        toast({
          title: "Patient Sign Up Failed",
          description: response.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to backend server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDoctorSignUp = async () => {
    setIsLoading(true);
    try {
      const signUpData = {
        firstName: 'Test',
        lastName: 'Doctor',
        email: testCredentials.email,
        password: testCredentials.password,
        agreeToTerms: true
      };

      const response = await authAPI.doctorSignUp(signUpData);
      
      if (response.success) {
        toast({
          title: "Doctor Sign Up Success",
          description: `Account created for Dr. ${response.data?.user.lastName}!`,
        });
      } else {
        toast({
          title: "Doctor Sign Up Failed",
          description: response.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to backend server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Integration Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Test Email</Label>
          <Input
            id="email"
            type="email"
            value={testCredentials.email}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Test Password</Label>
          <Input
            id="password"
            type="password"
            value={testCredentials.password}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testPatientLogin} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Patient Login
          </Button>
          
          <Button 
            onClick={testDoctorLogin} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Doctor Login
          </Button>
          
          <Button 
            onClick={testPatientSignUp} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Patient SignUp
          </Button>
          
          <Button 
            onClick={testDoctorSignUp} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Doctor SignUp
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-4">
          <p><strong>Backend Expected:</strong> http://localhost:3000</p>
          <p><strong>Endpoints:</strong></p>
          <ul className="list-disc list-inside ml-2">
            <li>POST /patient/logIn</li>
            <li>POST /patient/signUp</li>
            <li>POST /doctor/logIn</li>
            <li>POST /doctor/signUp</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTest;
