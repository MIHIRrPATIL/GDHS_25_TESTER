import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TriageResults } from './TriageResults';
import { TroubleshootingGuide } from './TroubleshootingGuide';
import { 
  MessageSquare, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Stethoscope,
  User,
  Brain,
  Clock,
  Settings
} from 'lucide-react';

export const DoctorTriageChat: React.FC = () => {
  const {
    currentSession,
    messages,
    isLoading,
    error,
    triageComplete,
    triageResult,
    hasEnoughInfo,
    startNewSession,
    sendMessage,
    clearChat,
    clearError,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showDebug, setShowDebug] = React.useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartNewSession = () => {
    clearChat();
    startNewSession();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-500 text-white';
      case 'Urgent': return 'bg-orange-500 text-white';
      case 'Routine': return 'bg-green-500 text-white';
      // Legacy support
      case 'emergency': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Doctor Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Doctor Triage Console</h2>
              <p className="text-sm text-muted-foreground">AI-Assisted Patient Assessment</p>
            </div>
          </div>
          
          {currentSession && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Session Active
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ID: {currentSession.session_id.slice(-8)}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasEnoughInfo && !triageComplete && (
            <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800">
              <Brain className="w-3 h-3" />
              AI Analyzing...
            </Badge>
          )}
          
          {triageComplete && triageResult && (
            <Badge className={`flex items-center gap-1 ${getUrgencyColor(triageResult.urgency_level)}`}>
              <AlertCircle className="w-3 h-3" />
              {triageResult.urgency_level.toUpperCase()} Priority
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            <Settings className="w-4 h-4 mr-1" />
            {showDebug ? 'Hide Debug' : 'Debug'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartNewSession}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Error Alert with Troubleshooting */}
      {error && (
        <div className="m-4 space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
          
          {/* Show troubleshooting guide for FAISS errors */}
          {(error.includes('faiss') || error.includes('guidelines') || error.includes('Server configuration error')) && (
            <TroubleshootingGuide />
          )}
        </div>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <div className="p-4 border-b bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Doctor Debug Console</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Session Info</h4>
                <div className="text-sm space-y-1 bg-muted p-3 rounded">
                  <div>Session ID: {currentSession?.session_id || 'None'}</div>
                  <div>Messages: {messages.length}</div>
                  <div>Has Enough Info: {hasEnoughInfo ? 'Yes' : 'No'}</div>
                  <div>Triage Complete: {triageComplete ? 'Yes' : 'No'}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">API Status</h4>
                <div className="text-sm space-y-1 bg-muted p-3 rounded">
                  <div>Server: http://10.160.85.14:5000</div>
                  <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                  <div>Error: {error ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {!currentSession && !isLoading ? (
          // Welcome Screen for Doctor
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="max-w-lg text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <User className="w-6 h-6" />
                  Patient Triage Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Start a new AI-assisted triage session to help assess patient symptoms and determine appropriate care levels.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg text-sm text-left">
                  <h4 className="font-medium mb-2">This tool will help you:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Systematically collect patient symptoms</li>
                    <li>• Generate AI-powered triage recommendations</li>
                    <li>• Assess urgency levels and care priorities</li>
                    <li>• Document comprehensive patient interactions</li>
                  </ul>
                </div>
                <Button onClick={startNewSession} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Stethoscope className="w-4 h-4 mr-2" />
                      Begin Patient Assessment
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Chat Interface
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {isLoading && (
                  <div className="flex items-center gap-2 p-4 text-muted-foreground bg-muted/30 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Assistant is processing patient information...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Triage Results - Enhanced for Doctor View */}
            {triageComplete && triageResult && (
              <>
                <Separator />
                <div className="p-6 bg-muted/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Triage Assessment Complete
                    </h3>
                    <Badge className={`${getUrgencyColor(triageResult.urgency_level)} px-3 py-1`}>
                      {triageResult.urgency_level.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                  
                  <TriageResults result={triageResult} />
                  
                  {/* Doctor Actions */}
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium mb-3">Recommended Actions:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        Schedule Follow-up
                      </Button>
                      <Button variant="outline" size="sm">
                        Order Tests
                      </Button>
                      <Button variant="outline" size="sm">
                        Refer to Specialist
                      </Button>
                      <Button variant="outline" size="sm">
                        Export Report
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Chat Input - Enhanced for Doctor */}
            {!triageComplete && (
              <div className="border-t bg-background">
                <div className="p-4">
                  <div className="mb-2 text-sm text-muted-foreground">
                    {hasEnoughInfo 
                      ? "AI is analyzing symptoms. You can add additional questions or wait for results."
                      : "Ask the patient about their symptoms, or let the AI guide the conversation."
                    }
                  </div>
                  <ChatInput
                    onSendMessage={sendMessage}
                    isLoading={isLoading}
                    disabled={!currentSession}
                    placeholder={
                      hasEnoughInfo 
                        ? "Add follow-up questions or additional notes..."
                        : "Ask about symptoms, pain levels, duration, etc..."
                    }
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
