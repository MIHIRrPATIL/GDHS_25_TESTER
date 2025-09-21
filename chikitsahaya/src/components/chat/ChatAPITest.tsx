import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { chatAPI } from '@/services/chat-api';
import { ServerStatus } from './ServerStatus';
import { MessageHistoryDebug } from './MessageHistoryDebug';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Wifi, 
  MessageSquare,
  Activity
} from 'lucide-react';

export const ChatAPITest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    connection: boolean | null;
    startSession: boolean | null;
    error?: string;
    sessionId?: string;
  }>({
    connection: null,
    startSession: null,
  });

  const runTests = async () => {
    setTesting(true);
    setResults({ connection: null, startSession: null });

    try {
      // Test 1: Connection
      console.log('Testing API connection...');
      const connectionTest = await chatAPI.testConnection();
      
      if (connectionTest.success) {
        setResults(prev => ({ ...prev, connection: true }));
        
        // Test 2: Start Session
        console.log('Testing start session...');
        const sessionTest = await chatAPI.startSession();
        
        if (sessionTest.success && sessionTest.data) {
          setResults(prev => ({ 
            ...prev, 
            startSession: true,
            sessionId: sessionTest.data?.session_id 
          }));
        } else {
          setResults(prev => ({ 
            ...prev, 
            startSession: false,
            error: sessionTest.error 
          }));
        }
      } else {
        setResults(prev => ({ 
          ...prev, 
          connection: false,
          error: connectionTest.error 
        }));
      }
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        connection: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    if (status === true) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Not Tested</Badge>;
    if (status === true) return <Badge className="bg-green-100 text-green-800">Success</Badge>;
    return <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Chat API Connection Test
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test connection to the hosted chat API at http://10.160.85.14:5000
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Server Status */}
        <ServerStatus />
        
        {/* Message History Debug */}
        <MessageHistoryDebug />
        
        {/* Test Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(results.connection)}
              <div>
                <p className="font-medium">API Connection</p>
                <p className="text-sm text-muted-foreground">Test basic connectivity</p>
              </div>
            </div>
            {getStatusBadge(results.connection)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(results.startSession)}
              <div>
                <p className="font-medium">Start Session</p>
                <p className="text-sm text-muted-foreground">Test session creation</p>
              </div>
            </div>
            {getStatusBadge(results.startSession)}
          </div>
        </div>

        {/* Session ID Display */}
        {results.sessionId && (
          <Alert>
            <MessageSquare className="w-4 h-4" />
            <AlertDescription>
              <strong>Session Created:</strong> {results.sessionId}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {results.error && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Error:</strong> {results.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Button */}
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Run API Tests
            </>
          )}
        </Button>

        {/* API Endpoints Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">API Endpoints Being Tested:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <code>GET /health</code> - Connection test</li>
            <li>• <code>POST /api/start-session</code> - Create new session</li>
            <li>• <code>POST /api/chat</code> - Send messages</li>
            <li>• <code>GET /api/session/&lt;id&gt;</code> - Get session details</li>
            <li>• <code>GET /api/session/&lt;id&gt;/triage</code> - Get triage results</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
