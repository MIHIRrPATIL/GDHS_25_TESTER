import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Patient, Encounter } from "@/lib/types";
import { getPatient } from "@/lib/api";
import { FeatureChips } from "@/components/feature/FeatureChips";
import { InsightsPanel } from "@/components/ai/InsightsPanel";
import { ExportSummaryModal } from "@/components/modals/ExportSummaryModal";
import { ConversationCard } from "@/components/conversation/ConversationCard";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { 
  User, 
  Stethoscope, 
  FileText, 
  Download,
  Clock,
  Activity,
  Heart,
  Thermometer,
  AlertTriangle,
  MessageCircle,
  Save
} from "lucide-react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const triageSchema = z.object({
  chiefComplaint: z.string().min(1, "Chief complaint is required"),
  presentingSymptoms: z.string().min(1, "Presenting symptoms are required"),
  painLevel: z.coerce.number().min(0).max(10).optional(),
  temperature: z.coerce.number().optional(),
  bloodPressureSystolic: z.coerce.number().optional(),
  bloodPressureDiastolic: z.coerce.number().optional(),
  heartRate: z.coerce.number().optional(),
  respiratoryRate: z.coerce.number().optional(),
  oxygenSaturation: z.coerce.number().optional(),
  triageLevel: z.enum(['low', 'moderate', 'high', 'critical']),
  assessmentNotes: z.string(),
  planNotes: z.string(),
  disposition: z.enum(['home', 'admitted', 'transferred', 'observation'])
});

type TriageFormData = z.infer<typeof triageSchema>;

export default function EncounterSession() {
  const { encounterId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('assessment');
  const [identifiedSymptoms, setIdentifiedSymptoms] = useState<string[]>([]);

  const patientId = searchParams.get('patientId');
  const isNewEncounter = encounterId === 'new';

  const form = useForm<TriageFormData>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      chiefComplaint: '',
      presentingSymptoms: '',
      painLevel: 0,
      triageLevel: 'moderate',
      assessmentNotes: '',
      planNotes: '',
      disposition: 'home'
    }
  });

  useEffect(() => {
    if (patientId) {
      loadPatient();
    } else if (encounterId && !isNewEncounter) {
      // Load existing encounter
      // TODO: Implement load encounter
    }
  }, [patientId, encounterId]);

  const loadPatient = async () => {
    if (!patientId) return;
    
    try {
      const data = await getPatient(patientId);
      setPatient(data);
      
      if (data?.chiefComplaint) {
        form.setValue('chiefComplaint', data.chiefComplaint);
      }
    } catch (error) {
      console.error('Failed to load patient:', error);
      toast({
        title: "Error",
        description: "Failed to load patient information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TriageFormData) => {
    setSaving(true);
    try {
      // TODO: Save encounter data
      console.log('Saving encounter:', data);
      
      toast({
        title: "Encounter saved",
        description: "Patient encounter has been successfully saved"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save encounter",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSymptomsIdentified = (symptoms: string[]) => {
    setIdentifiedSymptoms(symptoms);
  };

  const getTriageColor = (level: string) => {
    switch (level) {
      case 'critical': return 'urgency-critical';
      case 'high': return 'urgency-high';
      case 'moderate': return 'urgency-moderate';
      case 'low': return 'urgency-low';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading encounter...</p>
        </div>
      </div>
    );
  }

  if (!patient && isNewEncounter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-warning" />
          <h2 className="text-xl font-semibold">Patient Required</h2>
          <p className="text-muted-foreground">Please select a patient to start a new encounter</p>
          <Button onClick={() => navigate('/doctor/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 w-full">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  {isNewEncounter ? 'New Encounter' : 'Encounter Session'}
                </h1>
                {patient && (
                  <p className="text-sm text-muted-foreground">
                    Patient: {patient.firstName} {patient.lastName} ({patient.medicalRecordNumber})
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setExportModalOpen(true)}
                variant="outline"
                disabled={!patient}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Summary
              </Button>
              <Button onClick={() => navigate('/doctor/dashboard')} variant="outline">
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        {/* Full Width Conversation Card */}
        <div className="mb-6">
          <ConversationCard
            patientId={patient?.id}
            onSymptomsIdentified={handleSymptomsIdentified}
          />
        </div>

        {/* Desktop: 3-Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 min-h-[calc(100vh-12rem)]">
          {/* Column A: Patient Info & History */}
          <div className="col-span-3 space-y-6">
            {patient && (
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{patient.firstName} {patient.lastName}</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {patient.medicalRecordNumber}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Age:</span>
                      <span>{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="capitalize">{patient.gender}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline">{patient.status}</Badge>
                    </div>
                  </div>
                  
                  {patient.allergies.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-warning" />
                          Allergies
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive" className="bg-warning/20 text-warning-foreground text-xs">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Features & Symptoms
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // TODO: Implement save symptoms to database
                      toast({
                        title: "Symptoms Saved",
                        description: "Symptoms have been saved to the database"
                      });
                    }}
                  >
                    Save Symptoms
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {identifiedSymptoms.length > 0 && (
                  <div className="mb-4 p-3 bg-accent/10 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">AI Identified Symptoms:</h4>
                    <div className="flex flex-wrap gap-1">
                      {identifiedSymptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="bg-accent/20">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <FeatureChips 
                  patientId={patient?.id || ''} 
                  encounterId={encounterId !== 'new' ? encounterId : undefined}
                />
              </CardContent>
            </Card>
          </div>

          {/* Column B: Notes/Chat */}
          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Clinical Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full overflow-hidden">
                <Tabs defaultValue="notes" className="h-full flex flex-col">
                  <TabsList>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="chat">Patient Chat</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="notes" className="flex-1">
                    <div className="space-y-4 h-full">
                      <div>
                        <label className="text-sm font-medium">Assessment</label>
                        <RichTextEditor
                          content={form.watch('assessmentNotes')}
                          onChange={(content) => form.setValue('assessmentNotes', content)}
                          placeholder="Clinical assessment notes..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Plan</label>
                        <RichTextEditor
                          content={form.watch('planNotes')}
                          onChange={(content) => form.setValue('planNotes', content)}
                          placeholder="Treatment plan and next steps..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="chat" className="flex-1">
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Patient chat will appear here</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Column C: Triage Assessment Form */}
          <div className="col-span-5">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Triage Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
                      {/* Chief Complaint */}
                      <FormField
                        control={form.control}
                        name="chiefComplaint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chief Complaint</FormLabel>
                            <FormControl>
                              <Input placeholder="Patient's primary concern..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Presenting Symptoms */}
                      <FormField
                        control={form.control}
                        name="presentingSymptoms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Presenting Symptoms</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe the symptoms..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Vital Signs */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Vital Signs
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="temperature"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Temperature (°F)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" placeholder="98.6" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="painLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pain Level (0-10)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" max="10" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="bloodPressureSystolic"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>BP Systolic</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="120" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="bloodPressureDiastolic"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>BP Diastolic</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="80" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="heartRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Heart Rate (bpm)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="72" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="oxygenSaturation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>O2 Sat (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" max="100" placeholder="98" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Triage Level */}
                      <FormField
                        control={form.control}
                        name="triageLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Triage Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low Priority</SelectItem>
                                <SelectItem value="moderate">Moderate Priority</SelectItem>
                                <SelectItem value="high">High Priority</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Disposition */}
                      <FormField
                        control={form.control}
                        name="disposition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Disposition</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="home">Discharge Home</SelectItem>
                                <SelectItem value="admitted">Admit to Hospital</SelectItem>
                                <SelectItem value="transferred">Transfer to Facility</SelectItem>
                                <SelectItem value="observation">Observation</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={saving} className="w-full">
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Encounter
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile: Tabbed Layout */}
        <div className="lg:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="patient" className="space-y-4">
              {/* Patient info content */}
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Assessment</label>
                  <RichTextEditor
                    content={form.watch('assessmentNotes')}
                    onChange={(content) => form.setValue('assessmentNotes', content)}
                    placeholder="Clinical assessment notes..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Plan</label>
                  <RichTextEditor
                    content={form.watch('planNotes')}
                    onChange={(content) => form.setValue('planNotes', content)}
                    placeholder="Treatment plan and next steps..."
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="assessment" className="space-y-4">
              {/* Assessment form content */}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI Insights - Fixed position */}
      <div className="fixed bottom-6 right-6 w-80 z-50 hidden xl:block">
        <InsightsPanel 
          patientId={patient?.id}
          encounterId={encounterId !== 'new' ? encounterId : undefined}
          defaultOpen={false}
        />
      </div>

      {/* Export Modal */}
      {patient && (
        <ExportSummaryModal
          encounterId={encounterId || 'new'}
          patientName={`${patient.firstName} ${patient.lastName}`}
          open={exportModalOpen}
          onOpenChange={setExportModalOpen}
        />
      )}
    </div>
  );
}