import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Patient, AIInsight } from "@/lib/types";
import { getInsights } from "@/lib/api";
import { FeatureChips } from "@/components/feature/FeatureChips";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  AlertTriangle, 
  MessageCircle,
  FileText,
  Stethoscope,
  Brain,
  Heart,
  Thermometer,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientSummaryModalProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientSummaryModal({ patient, open, onOpenChange }: PatientSummaryModalProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (patient && open) {
      setLoading(true);
      getInsights(patient.id)
        .then(setInsights)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [patient, open]);

  if (!patient) return null;

  const getUrgencyColor = (score: number) => {
    if (score >= 80) return "urgency-critical";
    if (score >= 60) return "urgency-high";
    if (score >= 40) return "urgency-moderate";
    return "urgency-low";
  };

  const formatAge = (dateOfBirth: string) => {
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return `${age} years old`;
  };

  const handleOpenChat = () => {
    navigate(`/doctor/chat/${patient.id}`);
    onOpenChange(false);
  };

  const handleOpenEncounter = () => {
    navigate(`/doctor/encounter/new?patientId=${patient.id}`);
    onOpenChange(false);
  };

  const handleAddConversation = () => {
    navigate(`/doctor/add-conversation?patientId=${patient.id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            {patient.firstName} {patient.lastName}
            {patient.hasAIInsights && (
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                <Brain className="h-3 w-3 mr-1" />
                AI Insights
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Demographics & Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatAge(patient.dateOfBirth)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Gender:</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.contactNumber}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground">MRN:</span>
                <span className="ml-2 font-mono">{patient.medicalRecordNumber}</span>
              </div>
            </CardContent>
          </Card>

          {/* Chief Complaint & Triage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Current Visit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.chiefComplaint && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Chief Complaint</h4>
                  <p className="text-sm">{patient.chiefComplaint}</p>
                </div>
              )}
              
              {patient.lastTriageScore && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Triage Score</h4>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border ${getUrgencyColor(patient.lastTriageScore)}`}>
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">{patient.lastTriageScore}/100</span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Status</h4>
                <Badge 
                  variant={patient.status === 'waiting' ? 'secondary' : 
                          patient.status === 'in-progress' ? 'default' : 'outline'}
                  className="capitalize"
                >
                  {patient.status.replace('-', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleOpenChat} className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Open Chat
              </Button>
              <Button onClick={handleOpenEncounter} variant="secondary" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Open Encounter
              </Button>
              <Button onClick={handleAddConversation} variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Add Conversation
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Medical History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allergies & Medications */}
          <div className="space-y-4">
            {patient.allergies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="bg-warning/20 text-warning-foreground">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {patient.currentMedications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patient.currentMedications.map((med, index) => (
                      <div key={index} className="text-sm border-l-2 border-primary/20 pl-3">
                        <div className="font-medium">{med.name}</div>
                        <div className="text-muted-foreground">
                          {med.dosage} - {med.frequency}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Prescribed by {med.prescribedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Insights
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2"></div>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div 
                      key={insight.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        insight.severity === 'critical' ? 'border-destructive bg-destructive/5' :
                        insight.severity === 'warning' ? 'border-warning bg-warning/5' :
                        'border-accent bg-accent/5'
                      }`}
                    >
                      <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{insight.content}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                        {!insight.isAcknowledged && (
                          <Badge variant="secondary" className="text-xs bg-accent/20">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No AI insights available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Features/Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Features & Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureChips patientId={patient.id} />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}