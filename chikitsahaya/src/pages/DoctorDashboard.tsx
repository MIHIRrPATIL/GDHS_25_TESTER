import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/lib/types";
import { getPatients } from "@/lib/api";
import { PatientSummaryModal } from "@/components/modals/PatientSummaryModal";
import { InsightsPanel } from "@/components/ai/InsightsPanel";
import { User, Clock, AlertTriangle, Activity, Plus, Search, Filter, Brain, MessageCircle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
export default function DoctorDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const navigate = useNavigate();
  useEffect(() => {
    loadPatients();
  }, []);
  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchQuery === '' || `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || patient.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  const getUrgencyLevel = (score?: number): 'low' | 'moderate' | 'high' | 'critical' => {
    if (!score) return 'low';
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    return 'low';
  };
  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'urgency-critical';
      case 'high':
        return 'urgency-high';
      case 'moderate':
        return 'urgency-moderate';
      case 'low':
        return 'urgency-low';
      default:
        return '';
    }
  };
  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'waiting':
        return 'bg-warning/30 text-black border border-warning/50 hover:bg-warning/40 transition-colors';
      case 'in-progress':
        return 'bg-primary/30 text-white border border-primary/50 hover:bg-primary/40 transition-colors';
      case 'completed':
        return 'bg-success/30 text-white border border-success/50 hover:bg-success/40 transition-colors';
      case 'no-show':
        return 'bg-destructive/30 text-white border border-destructive/50 hover:bg-destructive/40 transition-colors';
      default:
        return 'bg-muted/30 text-foreground border border-muted/50 hover:bg-muted/40 transition-colors';
    }
  };
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading patient dashboard...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
              <p className="text-muted-foreground">
                {filteredPatients.length} patients • {formatTimeAgo(new Date().toISOString())}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/doctor/patient-schedule')}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Filters & Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search patients by name or MRN..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <div className="flex gap-2">
                    {['all', 'waiting', 'in-progress', 'completed'].map(status => <Button key={status} variant={filterStatus === status ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(status)} className="capitalize">
                        {status === 'all' ? 'All' : status.replace('-', ' ')}
                      </Button>)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatients.map(patient => {
              const urgencyLevel = getUrgencyLevel(patient.lastTriageScore);
              return <Card key={patient.id} className="patient-card-hover cursor-pointer medical-transition" onClick={() => setSelectedPatient(patient)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {patient.firstName} {patient.lastName}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground font-mono">
                              {patient.medicalRecordNumber}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status.replace('-', ' ')}
                          </Badge>
                          {patient.hasAIInsights && <Badge variant="secondary" className="bg-accent/40 text-black hover:bg-accent/60 transition-colors">
                              <Brain className="h-3 w-3 mr-1" />
                              AI
                            </Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      {patient.chiefComplaint && <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Chief Complaint
                          </h4>
                          <p className="text-sm line-clamp-2">{patient.chiefComplaint}</p>
                        </div>}
                      
                      <div className="flex items-center justify-between">
                        {patient.lastTriageScore && <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs border-2 ${getUrgencyColor(urgencyLevel)}`}>
                          <Activity className="h-3 w-3 text-black" />
                          <span className="text-slate-950">Triage: {patient.lastTriageScore}/100</span>
                        </div>}
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(patient.updatedAt)}</span>
                        </div>
                      </div>
                      
                      {patient.allergies.length > 0 && <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-warning" />
                          <span className="text-xs text-warning">
                            {patient.allergies.length} allergie{patient.allergies.length !== 1 ? 's' : ''}
                          </span>
                        </div>}
                    </CardContent>
                  </Card>;
            })}
            </div>

            {filteredPatients.length === 0 && <Card>
                <CardContent className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No patients found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterStatus !== 'all' ? 'Try adjusting your search or filters' : 'Patients will appear here as they are registered'}
                  </p>
                  {searchQuery && <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear search
                    </Button>}
                </CardContent>
              </Card>}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Waiting</span>
                  <Badge variant="outline" className="bg-warning/20 text-warning-foreground">
                    {patients.filter(p => p.status === 'waiting').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <Badge variant="outline" className="bg-primary/20 text-primary-foreground">
                    {patients.filter(p => p.status === 'in-progress').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge variant="outline" className="bg-success/20 text-success-foreground">
                    {patients.filter(p => p.status === 'completed').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">High Priority</span>
                  <Badge variant="outline" className="urgency-high">
                    {patients.filter(p => (p.lastTriageScore || 0) >= 60).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Panel */}
            <InsightsPanel patientId={selectedPatient?.id} className="min-h-[400px]" defaultOpen={false} />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/doctor/chat')}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  View All Conversations
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/doctor/doctor-schedule')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  My Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Patient Summary Modal */}
      <PatientSummaryModal patient={selectedPatient} open={!!selectedPatient} onOpenChange={open => !open && setSelectedPatient(null)} />
    </div>;
}