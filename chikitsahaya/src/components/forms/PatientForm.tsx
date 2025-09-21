import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  FileText, 
  Heart,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PatientFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phone: string;
  dateOfBirth: string;
  
  // Physical Info
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  Height: number;
  Weight: number;
  
  // Lifestyle
  isSmoker: boolean;
  isDrunkard: boolean;
  Execises: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  
  // Medical Info
  chronicDiseases: string;
  allergies: string;
  currentMeds: string;
  familyHistory: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Terms (for signup only)
  agreeToTerms?: boolean;
}

interface PatientFormProps {
  initialData?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => Promise<void>;
  submitButtonText?: string;
  showPasswordFields?: boolean;
  showTermsCheckbox?: boolean;
  isLoading?: boolean;
  mode?: 'signup' | 'profile';
}

export const PatientForm = ({
  initialData = {},
  onSubmit,
  submitButtonText = 'Save',
  showPasswordFields = false,
  showTermsCheckbox = false,
  isLoading = false,
  mode = 'profile'
}: PatientFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    Age: 0,
    Gender: 'Male',
    Height: 0,
    Weight: 0,
    isSmoker: false,
    isDrunkard: false,
    Execises: 'rarely',
    chronicDiseases: '',
    allergies: '',
    currentMeds: '',
    familyHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    agreeToTerms: false,
    ...initialData,
  });

  const totalSteps = mode === 'signup' ? 4 : 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof PatientFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  // Step 1: Basic Information (including auth fields for signup)
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        {showPasswordFields && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="Min. 6 characters"
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
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              placeholder="+1-555-0123"
              required
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
              required
            />
          </div>
        </div>

      </div>
    </div>
  );

  // Step 2: Physical & Lifestyle Information
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min="0"
            max="120"
            value={formData.Age || ''}
            onChange={(e) => updateFormData('Age', parseInt(e.target.value) || 0)}
            placeholder="Enter your age"
            required
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.Gender} onValueChange={(value) => updateFormData('Gender', value as PatientFormData['Gender'])}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height">Height (cm) *</Label>
          <Input
            id="height"
            type="number"
            min="0"
            max="400"
            value={formData.Height || ''}
            onChange={(e) => updateFormData('Height', parseInt(e.target.value) || 0)}
            placeholder="Enter your height in cm"
            required
          />
        </div>
        <div>
          <Label htmlFor="weight">Weight (kg) *</Label>
          <Input
            id="weight"
            type="number"
            min="0"
            max="400"
            value={formData.Weight || ''}
            onChange={(e) => updateFormData('Weight', parseInt(e.target.value) || 0)}
            placeholder="Enter your weight in kg"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="exercise">Exercise Frequency *</Label>
        <Select value={formData.Execises} onValueChange={(value) => updateFormData('Execises', value as PatientFormData['Execises'])}>
          <SelectTrigger>
            <SelectValue placeholder="How often do you exercise?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Never</SelectItem>
            <SelectItem value="rarely">Rarely</SelectItem>
            <SelectItem value="sometimes">Sometimes</SelectItem>
            <SelectItem value="often">Often</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Lifestyle Habits</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="smoker" className="text-sm">Do you smoke?</Label>
            <Select value={formData.isSmoker.toString()} onValueChange={(value) => updateFormData('isSmoker', value === 'true')}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="alcohol" className="text-sm">Do you drink alcohol?</Label>
            <Select value={formData.isDrunkard.toString()} onValueChange={(value) => updateFormData('isDrunkard', value === 'true')}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Medical History
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="allergies">Known Allergies</Label>
        <Textarea
          id="allergies"
          value={formData.allergies}
          onChange={(e) => updateFormData('allergies', e.target.value)}
          placeholder="List any known allergies (medications, foods, environmental)"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="medications">Current Medications</Label>
        <Textarea
          id="medications"
          value={formData.currentMeds}
          onChange={(e) => updateFormData('currentMeds', e.target.value)}
          placeholder="List all current medications, supplements, and dosages"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="conditions">Chronic Diseases</Label>
        <Textarea
          id="conditions"
          value={formData.chronicDiseases}
          onChange={(e) => updateFormData('chronicDiseases', e.target.value)}
          placeholder="List any chronic conditions or diseases"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="family-history">Family Medical History</Label>
        <Textarea
          id="family-history"
          value={formData.familyHistory}
          onChange={(e) => updateFormData('familyHistory', e.target.value)}
          placeholder="Describe relevant family medical history"
          rows={3}
        />
      </div>
    </div>
  );

  // Step 4: Emergency Contact & Terms (for signup mode)
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Emergency Contact</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergencyName">Contact Name</Label>
            <Input
              id="emergencyName"
              value={formData.emergencyContactName}
              onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <Label htmlFor="emergencyPhone">Contact Phone</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
              placeholder="+1-555-0456"
            />
          </div>
        </div>
      </div>

      {showTermsCheckbox && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => updateFormData('agreeToTerms', checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm">
            I agree to the Terms of Service and Privacy Policy
          </Label>
        </div>
      )}
    </div>
  );

  const getStepIcon = (step: number) => {
    if (mode === 'signup') {
      switch (step) {
        case 1: return User;
        case 2: return FileText;
        case 3: return Heart;
        case 4: return CheckCircle;
        default: return User;
      }
    } else {
      switch (step) {
        case 1: return User;
        case 2: return FileText;
        case 3: return Heart;
        default: return User;
      }
    }
  };

  const getStepTitle = (step: number) => {
    if (mode === 'signup') {
      switch (step) {
        case 1: return 'Basic Information';
        case 2: return 'Physical & Lifestyle';
        case 3: return 'Medical History';
        case 4: return 'Emergency Contact';
        default: return 'Step';
      }
    } else {
      switch (step) {
        case 1: return 'Personal Information';
        case 2: return 'Physical & Lifestyle';
        case 3: return 'Medical History';
        default: return 'Step';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2 sm:space-x-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
            const Icon = getStepIcon(step);
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            
            return (
              <div
                key={step}
                className={`flex flex-col items-center space-y-1 sm:space-y-2 ${
                  isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <span className="text-xs font-medium text-center max-w-16 sm:max-w-20 leading-tight">
                  {getStepTitle(step)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {(() => {
              const Icon = getStepIcon(currentStep);
              return <Icon className="h-5 w-5 mr-2" />;
            })()}
            {getStepTitle(currentStep)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="order-2 sm:order-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext} className="order-1 sm:order-2">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="order-1 sm:order-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            {submitButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};
