import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Calendar, 
  Pill, 
  MessageCircle,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Scan
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  status: 'active' | 'completed';
  refillsLeft: number;
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    // Mock data
    setAppointments([
      {
        id: '1',
        date: '2024-01-15',
        time: '10:00 AM',
        doctor: 'Dr. Smith',
        type: 'General Checkup',
        status: 'upcoming'
      },
      {
        id: '2',
        date: '2024-01-10',
        time: '2:30 PM',
        doctor: 'Dr. Johnson',
        type: 'Follow-up',
        status: 'completed'
      }
    ]);

    setPrescriptions([
      {
        id: '1',
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        status: 'active',
        refillsLeft: 2
      },
      {
        id: '2',
        medication: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        status: 'active',
        refillsLeft: 0
      }
    ]);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">Here's an overview of your health information.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">Good</p>
                <p className="text-sm text-muted-foreground">Overall Health</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{appointments.filter(a => a.status === 'upcoming').length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Pill className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-foreground">{prescriptions.filter(p => p.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active Prescriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Triage Quick Access */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Stethoscope className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Need Medical Guidance?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Get instant triage assessment for your symptoms with our AI-powered medical assistant
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/patient/messages')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Triage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.filter(a => a.status === 'upcoming').map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(appointment.status)}
                    <div>
                      <p className="font-medium text-foreground">{appointment.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.date} at {appointment.time}
                      </p>
                      <p className="text-sm text-muted-foreground">with {appointment.doctor}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {appointment.status}
                  </Badge>
                </div>
              ))}
              {appointments.filter(a => a.status === 'upcoming').length === 0 && (
                <p className="text-center text-muted-foreground py-8">No upcoming appointments</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2 text-success" />
              Active Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescriptions.filter(p => p.status === 'active').map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{prescription.medication}</p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.dosage} - {prescription.frequency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.refillsLeft} refills remaining
                    </p>
                  </div>
                  <div className="text-right">
                    {prescription.refillsLeft === 0 ? (
                      <Badge variant="destructive">Refill Needed</Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-accent" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                <CheckCircle className="h-4 w-4 text-success" />
                <div>
                  <p className="font-medium text-foreground">Appointment completed</p>
                  <p className="text-sm text-muted-foreground">Follow-up with Dr. Johnson - Jan 10</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                <Pill className="h-4 w-4 text-success" />
                <div>
                  <p className="font-medium text-foreground">Prescription refilled</p>
                  <p className="text-sm text-muted-foreground">Lisinopril 10mg - Jan 8</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Schedule Appointment</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => navigate('/patient/messages')}>
                <MessageCircle className="h-6 w-6" />
                <span className="text-sm">Talk with AI</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => navigate('/patient/lab-scanner')}>
                <Scan className="h-6 w-6" />
                <span className="text-sm">Lab Scanner</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                <Pill className="h-6 w-6" />
                <span className="text-sm">Request Refill</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => navigate('/patient/prescriptions')}>
                <Activity className="h-6 w-6" />
                <span className="text-sm">View Results</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;