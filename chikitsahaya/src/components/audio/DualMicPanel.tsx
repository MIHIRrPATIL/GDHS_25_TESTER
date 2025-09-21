import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDualMic } from "@/hooks/useDualMic";
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  RefreshCw, 
  Save, 
  Trash2,
  User,
  Stethoscope,
  Clock,
  Volume2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DualMicPanelProps {
  patientId?: string;
  onSaveConversation?: (data: any) => void;
}

export function DualMicPanel({ patientId, onSaveConversation }: DualMicPanelProps) {
  const {
    state,
    startMic,
    stopMic,
    startBoth,
    stopBoth,
    swapSides,
    clearTranscripts,
    saveConversation,
    mockMode
  } = useDualMic();
  
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const conversationData = await saveConversation();
      onSaveConversation?.(conversationData);
      
      toast({
        title: "Conversation saved",
        description: "The conversation has been saved to the patient's record"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save conversation",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const MicCard = ({ 
    type, 
    micState, 
    title, 
    icon: Icon 
  }: { 
    type: 'doctor' | 'patient'; 
    micState: typeof state.doctor; 
    title: string;
    icon: any;
  }) => (
    <Card className={`h-full ${micState.isRecording ? 'ring-2 ring-destructive' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </div>
          <div className="flex items-center gap-2">
            {micState.isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                <div className="w-2 h-2 bg-current rounded-full mr-1" />
                Recording
              </Badge>
            )}
            {mockMode && (
              <Badge variant="outline" className="text-xs">
                Demo Mode
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mic Controls */}
        <div className="flex justify-center">
          <Button
            size="lg"
            variant={micState.isRecording ? "destructive" : "default"}
            className={`w-16 h-16 rounded-full ${micState.isRecording ? 'mic-recording' : ''}`}
            onClick={() => micState.isRecording ? stopMic(type) : startMic(type)}
            disabled={!micState.isSupported && !mockMode}
          >
            {micState.isRecording ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Status */}
        {micState.error && (
          <div className="text-center text-sm text-destructive bg-destructive/10 p-2 rounded">
            {micState.error}
          </div>
        )}

        {!micState.isSupported && !mockMode && (
          <div className="text-center text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            Speech recognition not supported in this browser
          </div>
        )}

        {/* Volume Indicator */}
        {micState.isRecording && (
          <div className="flex items-center justify-center gap-2">
            <Volume2 className="h-4 w-4" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-4 rounded ${
                    i < Math.floor(micState.volume * 5) 
                      ? 'bg-primary' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        <div className="min-h-[200px] bg-muted/30 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2 text-muted-foreground">Transcript</h4>
          <div className="text-sm leading-relaxed">
            {micState.transcript || (
              <span className="text-muted-foreground italic">
                {micState.isRecording ? 'Listening...' : 'Start recording to see transcript'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Dual Microphone Conversation</h2>
          {state.isConnected && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(state.sessionDuration)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={swapSides}
            variant="outline"
            size="sm"
            disabled={state.isConnected}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Swap Sides
          </Button>
          
          <Button
            onClick={clearTranscripts}
            variant="outline"
            size="sm"
            disabled={state.isConnected}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Master Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={startBoth}
              disabled={state.isConnected}
              size="lg"
              className="flex items-center gap-2"
            >
              <Play className="h-5 w-5" />
              Start Both Microphones
            </Button>
            
            <Button
              onClick={stopBoth}
              disabled={!state.isConnected}
              variant="destructive"
              size="lg"
              className="flex items-center gap-2"
            >
              <Square className="h-5 w-5" />
              Stop Both
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button
              onClick={handleSave}
              disabled={!state.doctor.transcript && !state.patient.transcript}
              variant="secondary"
              size="lg"
              className="flex items-center gap-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Save Conversation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dual Mic Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MicCard
          type="doctor"
          micState={state.doctor}
          title="Doctor"
          icon={Stethoscope}
        />
        
        <MicCard
          type="patient"
          micState={state.patient}
          title="Patient"
          icon={User}
        />
      </div>

      {/* Instructions */}
      {mockMode && (
        <Card className="bg-accent/10 border-accent/30">
          <CardContent className="p-4">
            <div className="text-sm text-center text-muted-foreground">
              <strong>Demo Mode:</strong> Speech recognition is not available. 
              Click "Start Both Microphones" to see simulated transcripts for demonstration purposes.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}