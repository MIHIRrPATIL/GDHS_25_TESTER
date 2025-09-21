import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  FileText, 
  Server, 
  Terminal,
  CheckCircle
} from 'lucide-react';

export const TroubleshootingGuide: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          FAISS Index Error - Troubleshooting Guide
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <FileText className="w-4 h-4" />
          <AlertDescription>
            The server is missing the <code>guidelines_faiss.index</code> file required for medical triage processing.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Server-Side Fix Required
            </h4>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">1. Check Server Directory Structure:</p>
                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs">
                  your-server-directory/<br/>
                  ├── guidelines/<br/>
                  │   ├── guidelines_faiss.index<br/>
                  │   └── other_medical_files...<br/>
                  └── server.py (or your main server file)
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">2. Required Files:</p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Missing</Badge>
                    <code>guidelines/guidelines_faiss.index</code>
                  </li>
                  <li className="text-muted-foreground">This file contains the FAISS vector index for medical guidelines</li>
                </ul>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  3. Server Commands to Fix:
                </p>
                <div className="bg-black text-green-400 p-2 rounded font-mono text-xs space-y-1">
                  <div># Navigate to your server directory</div>
                  <div>cd /path/to/your/server</div>
                  <div></div>
                  <div># Create guidelines directory if it doesn't exist</div>
                  <div>mkdir -p guidelines</div>
                  <div></div>
                  <div># Add your FAISS index file</div>
                  <div># (You need to obtain or generate this file)</div>
                  <div>cp guidelines_faiss.index guidelines/</div>
                  <div></div>
                  <div># Restart your server</div>
                  <div>python server.py  # or your server start command</div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium mb-2 text-blue-800">4. Alternative Solutions:</p>
                <ul className="space-y-1 text-blue-700 text-sm">
                  <li>• Disable FAISS dependency in server code (temporary fix)</li>
                  <li>• Use a mock/dummy index file for testing</li>
                  <li>• Generate the index from your medical guidelines dataset</li>
                  <li>• Contact the original server developer for the missing files</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              After Fixing:
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>1. Restart your chat API server</li>
              <li>2. Click "Run API Tests" above to verify the fix</li>
              <li>3. Try starting a new triage session</li>
              <li>4. The error should be resolved</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
