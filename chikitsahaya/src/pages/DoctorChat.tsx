import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChatThread, ChatMessage } from "@/lib/types";
import { getChatThreads, getChatMessages, sendMessage } from "@/lib/api";
import { InsightsPanel } from "@/components/ai/InsightsPanel";
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  MoreHorizontal,
  User,
  Bot,
  Menu,
  X,
  Search,
  Brain
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function DoctorChat() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [insightsPanelOpen, setInsightsPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();
  const { threadId } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (threadId && threads.length > 0) {
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        setSelectedThread(thread);
        loadMessages(threadId);
      }
    }
  }, [threadId, threads]);

  const loadThreads = async () => {
    try {
      const data = await getChatThreads('doc1'); // TODO: Get from auth context
      setThreads(data);
    } catch (error) {
      console.error('Failed to load chat threads:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const data = await getChatMessages(threadId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread || sending) return;

    setSending(true);
    try {
      const message = await sendMessage({
        threadId: selectedThread.id,
        senderId: 'doc1', // TODO: Get from auth context
        senderType: 'doctor',
        content: newMessage.trim(),
        messageType: 'text',
        isRead: true
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSenderIcon = (senderType: ChatMessage['senderType']) => {
    switch (senderType) {
      case 'doctor': return User;
      case 'ai-assistant': return Bot;
      case 'patient': return User;
      default: return MessageCircle;
    }
  };

  const getSenderColor = (senderType: ChatMessage['senderType']) => {
    switch (senderType) {
      case 'doctor': return 'bg-primary text-primary-foreground';
      case 'ai-assistant': return 'bg-accent text-accent-foreground';
      case 'patient': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r bg-card/50 overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Conversations</h2>
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </div>

          {/* Thread List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {threads.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <Card
                    key={thread.id}
                    className={`cursor-pointer medical-transition ${
                      selectedThread?.id === thread.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedThread(thread);
                      navigate(`/doctor/chat/${thread.id}`);
                      loadMessages(thread.id);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm truncate">{thread.title}</h4>
                        {thread.unreadCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {thread.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {thread.lastMessage && (
                        <div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {thread.lastMessage.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(thread.lastMessage.timestamp)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                <div>
                  <h1 className="text-xl font-bold">
                    {selectedThread ? selectedThread.title : 'Chat'}
                  </h1>
                  {selectedThread && (
                    <p className="text-sm text-muted-foreground">
                      {selectedThread.participants.length} participant{selectedThread.participants.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInsightsPanelOpen(!insightsPanelOpen)}
                  className={insightsPanelOpen ? 'bg-accent' : ''}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
                <Button variant="outline" onClick={() => navigate('/doctor/dashboard')}>
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedThread ? (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
                        <p className="text-muted-foreground">Send a message to begin chatting</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const SenderIcon = getSenderIcon(message.senderType);
                        const isDoctor = message.senderType === 'doctor';
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex gap-3 ${isDoctor ? 'flex-row-reverse' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getSenderColor(message.senderType)}`}>
                              <SenderIcon className="h-4 w-4" />
                            </div>
                            <div className={`flex-1 max-w-[70%] ${isDoctor ? 'text-right' : ''}`}>
                              <div className={`inline-block p-3 rounded-lg ${
                                isDoctor 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-3">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sending}
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      Quick Response
                    </Button>
                    <Button variant="outline" size="sm">
                      Schedule Follow-up
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
                  <p className="text-muted-foreground">Choose a conversation from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Insights Sidebar */}
          {insightsPanelOpen && selectedThread && (
            <div className="w-80 border-l">
              <InsightsPanel 
                patientId={selectedThread.patientId}
                defaultOpen={true}
                className="h-full border-0"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}