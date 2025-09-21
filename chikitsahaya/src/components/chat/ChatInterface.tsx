import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TriageResults } from './TriageResults';
import { ChatAPITest } from './ChatAPITest';
import { TroubleshootingGuide } from './TroubleshootingGuide';
import { 
  MessageSquare, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Stethoscope,
  Settings,
  AlertTriangle
} from 'lucide-react';

export const ChatInterface: React.FC = () => {
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
  const [showAPITest, setShowAPITest] = React.useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-start session on component mount if no session exists
  useEffect(() => {
    if (!currentSession && !isLoading) {
      startNewSession();
    }
  }, [currentSession, isLoading, startNewSession]);

  const handleStartNewSession = () => {
    clearChat();
    startNewSession();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Medical Triage Assistant</h2>
          {currentSession && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Active Session
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasEnoughInfo && !triageComplete && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
              Analyzing...
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAPITest(!showAPITest)}
          >
            <Settings className="w-4 h-4 mr-1" />
            {showAPITest ? 'Hide' : 'Debug'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartNewSession}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            New Session
          </Button>
        </div>
      </div>

      {/* Error Alert */}
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

      {/* API Test Panel */}
      {showAPITest && (
        <div className="p-4 border-b bg-muted/30">
          <ChatAPITest />
        </div>
      )}

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {!currentSession && !isLoading ? (
          // Welcome Screen
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="max-w-md text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  Welcome to Medical Triage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  I'm here to help assess your symptoms and provide guidance on the appropriate level of care you may need.
                </p>
                <Button onClick={startNewSession} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Start Triage Assessment'
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
                  <div className="flex items-center gap-2 p-4 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Assistant is thinking...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Triage Results */}
            {triageComplete && triageResult && (
              <>
                <Separator />
                <div className="p-4 bg-muted/30">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Triage Assessment Complete
                  </h3>
                  <TriageResults result={triageResult} />
                </div>
              </>
            )}

            {/* Chat Input */}
            {!triageComplete && (
              <ChatInput
                onSendMessage={sendMessage}
                isLoading={isLoading}
                disabled={!currentSession}
                placeholder={
                  hasEnoughInfo 
                    ? "Please wait while I analyze your symptoms..."
                    : "Describe your symptoms or how you're feeling..."
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
