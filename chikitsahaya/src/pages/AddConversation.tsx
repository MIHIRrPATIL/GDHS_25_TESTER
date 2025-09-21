import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DualMicPanel } from "@/components/audio/DualMicPanel";
import { ArrowLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Patient } from "@/lib/types";
import { getPatient } from "@/lib/api";

export default function AddConversation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('patientId');
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (patientId) {
      getPatient(patientId).then(setPatient).catch(console.error);
    }
  }, [patientId]);

  const handleSaveConversation = (conversationData: any) => {
    // TODO: Save conversation to patient record
    console.log('Conversation saved:', conversationData);
    
    // Navigate back to appropriate page
    if (patientId) {
      navigate(`/doctor/dashboard`);
    } else {
      navigate('/doctor/dashboard');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleClose = () => {
    navigate('/doctor/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div>
                <h1 className="text-xl font-bold">New Conversation</h1>
                {patient && (
                  <p className="text-sm text-muted-foreground">
                    Patient: {patient.firstName} {patient.lastName} ({patient.medicalRecordNumber})
                  </p>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-6">
        <DualMicPanel 
          patientId={patientId || undefined}
          onSaveConversation={handleSaveConversation}
        />
      </main>
    </div>
  );
}