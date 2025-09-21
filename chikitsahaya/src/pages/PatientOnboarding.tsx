import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  User, 
  Phone, 
  Calendar,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  firstName: string;
  lastName: string;
  Age: number;
  Gender: 'Male' | 'Female' | 'Other';
  Height: number;
  Weight: number;
  isSmoker: 'Yes' | 'No';
  isDrunkard: 'Yes' | 'No';
  Execises: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  'chronic diseases': string;
  allergies: string;
  'currrent medications': string;
  'Family medical history': string;
}

const PatientOnboarding = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    Age: 0,
    Gender: 'Male',
    Height: 0,
    Weight: 0,
    isSmoker: 'No',
    isDrunkard: 'No',
    Execises: 'rarely',
    'chronic diseases': '',
    allergies: '',
    'currrent medications': '',
    'Family medical history': '',
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

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

  const handleComplete = async () => {
    // Update user onboarding status
    if (user) {
      await login({ role: 'patient', onboardingComplete: true });
    }
    navigate('/patient/dashboard');
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
          <Select value={formData.Gender} onValueChange={(value) => updateFormData('Gender', value as FormData['Gender'])}>
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
        <div>
          <Label htmlFor="height">Height *</Label>
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
          <Label htmlFor="weight">Weight *</Label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="exercise">Exercise Frequency *</Label>
          <Select value={formData.Execises} onValueChange={(value) => updateFormData('Execises', value as FormData['Execises'])}>
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
          <div>
            <Label>Lifestyle Habits</Label>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="smoker" className="text-sm">Do you smoke?</Label>
                <Select value={formData.isSmoker} onValueChange={(value) => updateFormData('isSmoker', value as FormData['isSmoker'])}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="alcohol" className="text-sm">Do you drink alcohol?</Label>
                <Select value={formData.isDrunkard} onValueChange={(value) => updateFormData('isDrunkard', value as FormData['isDrunkard'])}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
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
          value={formData['currrent medications']}
          onChange={(e) => updateFormData('currrent medications', e.target.value)}
          placeholder="List all current medications, supplements, and dosages"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="conditions">Chronic Diseases</Label>
        <Textarea
          id="conditions"
          value={formData['chronic diseases']}
          onChange={(e) => updateFormData('chronic diseases', e.target.value)}
          placeholder="List any ongoing chronic diseases or conditions"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="familyHistory">Family Medical History</Label>
        <Textarea
          id="familyHistory"
          value={formData['Family medical history']}
          onChange={(e) => updateFormData('Family medical history', e.target.value)}
          placeholder="List any relevant family medical history"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-success" />
          <h3 className="text-lg font-semibold">Review Your Information</h3>
        </div>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
              <p><strong>Age:</strong> {formData.Age}</p>
              <p><strong>Gender:</strong> {formData.Gender}</p>
              <p><strong>Height:</strong> {formData.Height} cm</p>
              <p><strong>Weight:</strong> {formData.Weight} kg</p>
            </div>
            <div>
              <p><strong>Exercise:</strong> {formData.Execises}</p>
              <p><strong>Smoker:</strong> {formData.isSmoker}</p>
              <p><strong>Alcohol:</strong> {formData.isDrunkard}</p>
            </div>
          </div>
          {(formData.allergies || formData['chronic diseases'] || formData['currrent medications'] || formData['Family medical history']) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Medical Information:</h4>
              {formData.allergies && <p><strong>Allergies:</strong> {formData.allergies}</p>}
              {formData['chronic diseases'] && <p><strong>Chronic Diseases:</strong> {formData['chronic diseases']}</p>}
              {formData['currrent medications'] && <p><strong>Current Medications:</strong> {formData['currrent medications']}</p>}
              {formData['Family medical history'] && <p><strong>Family History:</strong> {formData['Family medical history']}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="bg-success/5 border border-success/20 rounded-lg p-4 sm:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="h-6 w-6 text-success" />
          <h3 className="text-lg font-semibold">Ready to Get Started!</h3>
        </div>
        <p className="text-muted-foreground mb-4">
          Your health profile is complete! Click "Complete Setup" to access your patient dashboard.
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 bg-success rounded-full mr-2" />
            View and schedule appointments
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 bg-success rounded-full mr-2" />
            Manage prescriptions
          </li>
          <li className="flex items-center">
            <div className="w-1.5 h-1.5 bg-success rounded-full mr-2" />
            Communicate with your care team
          </li>
        </ul>
      </div>
    </div>
  );

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return User;
      case 2: return FileText;
      case 3: return Heart;
      default: return User;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Personal & Lifestyle';
      case 2: return 'Medical History';
      case 3: return 'Review & Complete';
      default: return 'Step';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-accent mr-2 sm:mr-3" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Patient Onboarding</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Let's get your health information set up so we can provide you with the best care.
          </p>
        </div>

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
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex space-x-2 sm:space-x-4">
            {[1, 2, 3].map((step) => {
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

        {/* Form Card */}
        <Card className="mb-8">
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
            <Button onClick={handleComplete} className="bg-success text-success-foreground hover:bg-success/90 order-1 sm:order-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientOnboarding;