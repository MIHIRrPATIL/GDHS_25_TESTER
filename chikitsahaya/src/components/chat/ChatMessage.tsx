import React from 'react';
import { cn } from '@/lib/utils';
import { Message } from '@/contexts/ChatContext';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.type === 'bot';
  
  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg",
      isBot ? "bg-muted/50" : "bg-primary/5 ml-8"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isBot ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
      )}>
        {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isBot ? 'ChikitsaHaya Assistant' : 'You'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        <div className="text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
};
