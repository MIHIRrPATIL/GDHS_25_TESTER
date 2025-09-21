import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import { DoctorTriageChat } from '@/components/chat/DoctorTriageChat';

const DoctorTriage = () => {
  return (
    <div className="h-full flex flex-col">
      <ChatProvider>
        <DoctorTriageChat />
      </ChatProvider>
    </div>
  );
};

export default DoctorTriage;
