import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { chatAPI } from '@/services/chat-api';
import { 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface ServerStatusProps {
  onStatusChange?: (isHealthy: boolean) => void;
}

export const ServerStatus: React.FC<ServerStatusProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<{
    isHealthy: boolean | null;
    lastChecked: Date | null;
    error?: string;
    checking: boolean;
  }>({
    isHealthy: null,
    lastChecked: null,
    checking: false
  });

  const checkServerStatus = async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    
    try {
      const result = await chatAPI.testConnection();
      const isHealthy = result.success;
      
      setStatus({
        isHealthy,
        lastChecked: new Date(),
        error: isHealthy ? undefined : result.error,
        checking: false
      });
      
      onStatusChange?.(isHealthy);
    } catch (error) {
      setStatus({
        isHealthy: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checking: false
      });
      
      onStatusChange?.(false);
    }
  };

  // Check status on mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  const getStatusColor = () => {
    if (status.isHealthy === null) return 'bg-gray-500';
    if (status.isHealthy) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusIcon = () => {
    if (status.checking) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (status.isHealthy === null) return <Server className="w-4 h-4" />;
    if (status.isHealthy) return <CheckCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (status.checking) return 'Checking...';
    if (status.isHealthy === null) return 'Unknown';
    if (status.isHealthy) return 'Online';
    return 'Offline';
  };

  const formatLastChecked = () => {
    if (!status.lastChecked) return 'Never';
    return status.lastChecked.toLocaleTimeString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            Chat API Server Status
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkServerStatus}
            disabled={status.checking}
          >
            <RefreshCw className={`w-3 h-3 ${status.checking ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Status Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-sm font-medium">{getStatusText()}</span>
            {getStatusIcon()}
          </div>
          <Badge variant={status.isHealthy ? 'default' : 'destructive'}>
            {status.isHealthy ? 'Healthy' : 'Error'}
          </Badge>
        </div>

        {/* Server Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Server: http://10.160.85.14:5000</div>
          <div>Last checked: {formatLastChecked()}</div>
        </div>

        {/* Error Details */}
        {status.error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-xs">
              <strong>Error:</strong> {status.error}
              
              {/* Specific guidance for FAISS errors */}
              {status.error.includes('faiss') && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-xs">
                  <strong>FAISS Error Detected:</strong>
                  <ul className="mt-1 ml-4 list-disc space-y-1">
                    <li>Missing guidelines_faiss.index file</li>
                    <li>Check server guidelines/ directory</li>
                    <li>Ensure FAISS index files are uploaded</li>
                    <li>Restart server after adding files</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        {!status.isHealthy && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Troubleshooting:</p>
            <div className="space-y-1 text-xs">
              <div>1. Check if server is running on port 5000</div>
              <div>2. Verify network connectivity</div>
              <div>3. Check server logs for errors</div>
              <div>4. Ensure all required files are present</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
