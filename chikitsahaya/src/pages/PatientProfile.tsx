import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Edit,
  Save,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Activity,
  AlertTriangle,
  Users,
  FileText,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { PatientForm, PatientFormData } from '@/components/forms/PatientForm';

const PatientProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock patient data - in real app, this would come from API/Database
  // This structure is designed to work directly with database imports
  const [profileData, setProfileData] = useState<PatientFormData>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    dateOfBirth: '1990-05-15',
    Age: 34,
    Gender: 'Male',
    Height: 175,
    Weight: 70,
    isSmoker: false,
    isDrunkard: false,
    Execises: 'sometimes',
    chronicDiseases: 'Hypertension diagnosed in 2020. Regular monitoring required.',
    allergies: 'Penicillin, Shellfish, Latex',
    currentMeds: 'Lisinopril 10mg - Once daily (prescribed by Dr. Smith)\nVitamin D3 1000IU - Daily supplement',
    familyHistory: 'Father had coronary heart disease at age 65. Mother has Type 2 diabetes diagnosed at age 58. Maternal grandmother had breast cancer.',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+1-555-0456'
  });

  // Function to load profile data from database (placeholder for real implementation)
  const loadProfileFromDatabase = async (userId: string) => {
    try {
      // In real implementation, this would be:
      // const response = await fetch(`/api/patients/${userId}`);
      // const data = await response.json();
      // setProfileData(data);
      
      // For now, we use the mock data above
      console.log('Loading profile for user:', userId);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Load profile data when component mounts
    if (user?.id) {
      loadProfileFromDatabase(user.id);
    }
  }, [user?.id]);

  const handleSave = async (data: PatientFormData) => {
    setIsSaving(true);
    try {
      // Mock API call - in real app, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save profile changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Helper functions
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'Not specified';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return 'Not calculated';
    const heightInM = height / 100;
    const bmi = weight / (heightInM * heightInM);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: string) => {
    const bmiNum = parseFloat(bmi);
    if (isNaN(bmiNum)) return '';
    if (bmiNum < 18.5) return 'Underweight';
    if (bmiNum < 25) return 'Normal';
    if (bmiNum < 30) return 'Overweight';
    return 'Obese';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your personal and medical information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <PatientForm
          initialData={profileData}
          onSubmit={handleSave}
          submitButtonText="Save Changes"
          showPasswordFields={false}
          showTermsCheckbox={false}
          isLoading={isSaving}
          mode="profile"
        />
      ) : (
        <div className="space-y-8">
          {/* Personal Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="text-lg font-semibold">{profileData.firstName} {profileData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p className="text-lg">{calculateAge(profileData.dateOfBirth)} years</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p className="text-lg">{profileData.Gender}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-lg">{formatDate(profileData.dateOfBirth)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="text-lg">{profileData.email}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </p>
                  <p className="text-lg">{profileData.phone}</p>
                </div>

              </CardContent>
            </Card>

            {/* Physical & Lifestyle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Physical & Lifestyle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Height</p>
                    <p className="text-lg">{profileData.Height ? `${profileData.Height} cm` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Weight</p>
                    <p className="text-lg">{profileData.Weight ? `${profileData.Weight} kg` : 'Not specified'}</p>
                  </div>
                </div>

                {profileData.Height && profileData.Weight && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">BMI</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg">{calculateBMI(profileData.Height, profileData.Weight)}</p>
                      <Badge variant={getBMICategory(calculateBMI(profileData.Height, profileData.Weight)) === 'Normal' ? 'default' : 'secondary'}>
                        {getBMICategory(calculateBMI(profileData.Height, profileData.Weight))}
                      </Badge>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exercise Frequency</p>
                  <p className="text-lg capitalize">{profileData.Execises}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Smoking</p>
                    <Badge variant={profileData.isSmoker ? 'destructive' : 'default'}>
                      {profileData.isSmoker ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alcohol</p>
                    <Badge variant={profileData.isDrunkard ? 'secondary' : 'default'}>
                      {profileData.isDrunkard ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileData.emergencyContactName ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                    <p className="text-lg">{profileData.emergencyContactName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="text-lg">{profileData.emergencyContactPhone}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No emergency contact information provided</p>
              )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.allergies ? (
                  <div className="space-y-2">
                    {profileData.allergies.split(',').map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="mr-2 mb-2">
                        {allergy.trim()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No known allergies</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.currentMeds ? (
                  <div className="space-y-2">
                    <p className="text-sm leading-relaxed">{profileData.currentMeds}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No current medications</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medical History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chronic Diseases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.chronicDiseases ? (
                  <p className="text-sm leading-relaxed">{profileData.chronicDiseases}</p>
                ) : (
                  <p className="text-muted-foreground">No chronic diseases reported</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Family Medical History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.familyHistory ? (
                  <p className="text-sm leading-relaxed">{profileData.familyHistory}</p>
                ) : (
                  <p className="text-muted-foreground">No family medical history provided</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
