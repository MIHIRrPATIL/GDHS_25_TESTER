import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { ChatInterface } from '@/components/chat/ChatInterface';

const PatientMessages = () => {
  return (
    <div className="h-full flex flex-col">
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    </div>
  );
};

export default PatientMessages;
