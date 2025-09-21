import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { 
  MessageSquare, 
  User, 
  Bot,
  Clock,
  Hash
} from 'lucide-react';

export const MessageHistoryDebug: React.FC = () => {
  const { messages, storedMessages, numberedHistory, currentSession, getStorageStats } = useChat();

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMessageIcon = (type: 'user' | 'bot') => {
    return type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />;
  };

  const getMessageColor = (type: 'user' | 'bot') => {
    return type === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  // Get storage stats
  const storageStats = getStorageStats();

  // The persistent message history that gets sent to the agent
  const currentMessageHistory = storedMessages.map(msg => ({
    type: msg.type,
    content: msg.content
  }));

  // This would be the complete history sent with the next user message
  const nextMessageHistory = [...currentMessageHistory, {
    type: 'user' as const,
    content: '[next_user_message]'
  }];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Message History Debug
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {storageStats.currentSessionMessages} stored
            </Badge>
            {currentSession && (
              <Badge variant="secondary" className="text-xs">
                Session: {currentSession.session_id.slice(-8)}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Storage Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Stored messages:</span>
            <span className="font-medium">{storageStats.currentSessionMessages}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last message ID:</span>
            <span className="font-medium">#{storageStats.lastMessageId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total messages:</span>
            <span className="font-medium">{storageStats.totalMessages}</span>
          </div>
        </div>

        {/* Numbered History Preview */}
        {numberedHistory.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Numbered message history (1:, 2:, 3:...):</h4>
            <ScrollArea className="h-48 border rounded-lg p-2">
              <div className="space-y-1">
                {numberedHistory.map((historyLine, index) => (
                  <div key={index} className="text-xs font-mono bg-muted/50 px-2 py-1 rounded">
                    {historyLine}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No messages in history yet
          </div>
        )}

        {/* JSON Preview */}
        {currentMessageHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Next message payload structure:</h4>
            <ScrollArea className="h-32 border rounded-lg">
              <pre className="text-xs p-2 font-mono">
{JSON.stringify({
  session_id: currentSession?.session_id || 'session_id',
  message: '[new_user_message]',
  message_history: nextMessageHistory
}, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <strong>Persistent Storage:</strong> Messages are stored in localStorage with numbered IDs (1:, 2:, 3:...). 
          This numbered format provides clear context to your AI backend, showing the exact sequence of conversation exchanges.
          Storage persists across browser sessions and page refreshes.
        </div>
      </CardContent>
    </Card>
  );
};
