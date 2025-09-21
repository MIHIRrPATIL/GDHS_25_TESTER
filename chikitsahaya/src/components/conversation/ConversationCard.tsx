// Add global declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var webkitSpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  RotateCcw, 
  Save,
  User,
  Stethoscope,
  Clock,
  Volume2,
  ArrowLeftRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversationEntry {
  id: string;
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: Date;
}

interface ConversationCardProps {
  patientId?: string;
  onSymptomsIdentified?: (symptoms: string[]) => void;
}

export function ConversationCard({ patientId, onSymptomsIdentified }: ConversationCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'doctor' | 'patient'>('doctor');
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          toast({
            title: "Speech Recognition Error",
            description: "There was an issue with speech recognition. Please try again.",
            variant: "destructive"
          });
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [toast]);

  const startConversation = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive"
      });
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscript('');
      
      if (!sessionStartRef.current) {
        sessionStartRef.current = new Date();
        intervalRef.current = setInterval(() => {
          if (sessionStartRef.current) {
            const now = new Date();
            const diff = Math.floor((now.getTime() - sessionStartRef.current.getTime()) / 1000);
            setSessionDuration(diff);
          }
        }, 1000);
      }

      toast({
        title: `Recording Started`,
        description: `Now recording for ${currentSpeaker === 'doctor' ? 'Doctor' : 'Patient'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const switchSpeaker = () => {
    if (!isRecording) {
      toast({
        title: "Not Recording",
        description: "Please start recording first.",
        variant: "destructive"
      });
      return;
    }

    // Stop current recognition and save transcript if available
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (transcript.trim()) {
      const entry: ConversationEntry = {
        id: Date.now().toString(),
        speaker: currentSpeaker,
        text: transcript.trim(),
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, entry]);
      
      toast({
        title: "Speaker Switched",
        description: `${currentSpeaker === 'doctor' ? 'Doctor' : 'Patient'} entry saved. Now recording for ${currentSpeaker === 'doctor' ? 'Patient' : 'Doctor'}`
      });
    }
    
    // Switch speaker and restart recognition
    const newSpeaker = currentSpeaker === 'doctor' ? 'patient' : 'doctor';
    setCurrentSpeaker(newSpeaker);
    setTranscript('');
    
    // Restart recognition for new speaker
    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      }
    }, 100);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    if (transcript.trim()) {
      const entry: ConversationEntry = {
        id: Date.now().toString(),
        speaker: currentSpeaker,
        text: transcript.trim(),
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, entry]);
      
      toast({
        title: "Recording Stopped",
        description: `${currentSpeaker === 'doctor' ? 'Doctor' : 'Patient'} entry saved`
      });
    }
    
    setTranscript('');
  };

  const clearConversation = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    }
    
    setConversation([]);
    setSessionDuration(0);
    setCurrentSpeaker('doctor');
    setTranscript('');
    sessionStartRef.current = null;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    toast({
      title: "Conversation Cleared",
      description: "All conversation data has been cleared"
    });
  };

  const saveConversation = async () => {
    if (conversation.length === 0) {
      toast({
        title: "No Content",
        description: "No conversation to save",
        variant: "destructive"
      });
      return;
    }

    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }

    setIsProcessing(true);
    
    try {
      // Simulate AI processing to identify symptoms
      const conversationText = conversation.map(entry => 
        `${entry.speaker}: ${entry.text}`
      ).join('\n');
      
      // Mock symptom identification - in real implementation, this would call an AI service
      const mockSymptoms = [
        'Chest pain',
        'Shortness of breath',
        'Fatigue',
        'Palpitations'
      ];
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSymptomsIdentified) {
        onSymptomsIdentified(mockSymptoms);
      }

      toast({
        title: "Conversation Saved",
        description: `Conversation saved and ${mockSymptoms.length} symptoms identified`
      });

      // Clear the conversation after saving
      clearConversation();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save conversation and identify symptoms",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Conversation Recording
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{formatDuration(sessionDuration)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Speaker & Recording Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            {currentSpeaker === 'doctor' ? (
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                <span className="font-medium">Doctor Speaking</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                <span className="font-medium">Patient Speaking</span>
              </div>
            )}
            
            {isRecording && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="text-sm text-destructive">Recording...</span>
              </div>
            )}
          </div>
          
          {isRecording && (
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-150"
                  style={{ width: `${Math.min(volume * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Transcript */}
        {isRecording && transcript && (
          <div className="p-3 bg-accent/10 rounded-lg border-l-4 border-accent">
            <div className="text-xs text-muted-foreground mb-1">Live Transcript:</div>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {/* Conversation History */}
        {conversation.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <h4 className="text-sm font-medium">Conversation:</h4>
            {conversation.map((entry) => (
              <div 
                key={entry.id} 
                className={`p-3 rounded-lg text-sm ${
                  entry.speaker === 'doctor' 
                    ? 'bg-primary/10 border-l-4 border-primary' 
                    : 'bg-accent/10 border-l-4 border-accent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {entry.speaker === 'doctor' ? (
                    <Stethoscope className="h-3 w-3 text-primary" />
                  ) : (
                    <User className="h-3 w-3 text-accent" />
                  )}
                  <span className="text-xs font-medium capitalize">
                    {entry.speaker}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
          <Button
            onClick={startConversation}
            variant={isRecording ? "outline" : "default"}
            disabled={isRecording || isProcessing}
            className="flex items-center justify-center gap-2"
          >
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Start</span>
          </Button>
          
          <Button
            onClick={switchSpeaker}
            variant="secondary"
            disabled={!isRecording || isProcessing}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">Switch</span>
          </Button>
          
          <Button
            onClick={clearConversation}
            variant="outline"
            disabled={isProcessing}
            className="flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
          
          <Button
            onClick={saveConversation}
            variant="default"
            disabled={conversation.length === 0 || isProcessing}
            className="flex items-center justify-center gap-2 bg-success hover:bg-success/90"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                <span className="hidden sm:inline">Processing...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </Button>
        </div>

        {conversation.length === 0 && !isRecording && (
          <div className="text-center py-6 text-muted-foreground">
            <Mic className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversation recorded yet</p>
            <p className="text-xs mt-1">Click "Start" to begin recording. Use "Switch" to alternate between speakers.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}