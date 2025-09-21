import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { chatAPI, ChatSession, ChatResponse, TriageResult } from '@/services/chat-api';
import { messageStorage, StoredMessage } from '@/services/message-storage';

// Message type for the chat
export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

// Chat context state
interface ChatContextState {
  // Session management
  currentSession: ChatSession | null;
  messages: Message[];
  storedMessages: StoredMessage[];
  numberedHistory: string[];
  isLoading: boolean;
  error: string | null;
  hasEnoughInfo: boolean;
  triageComplete: boolean;
  triageResult: TriageResult | null;
  startNewSession: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  getTriageResults: () => Promise<void>;
  clearChat: () => void;
  clearError: () => void;
  getStorageStats: () => any;
  exportHistory: () => string;
}

const ChatContext = createContext<ChatContextState | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [storedMessages, setStoredMessages] = useState<StoredMessage[]>([]);
  const [numberedHistory, setNumberedHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [triageComplete, setTriageComplete] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [hasEnoughInfo, setHasEnoughInfo] = useState(false);

  // Generate unique message ID
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Update stored messages and numbered history from storage
  const updateStoredMessages = useCallback(() => {
    const stored = messageStorage.getCurrentSessionMessages();
    const numbered = messageStorage.getNumberedHistoryArray();
    setStoredMessages(stored);
    setNumberedHistory(numbered);
  }, []);

  // Start a new triage session
  const startNewSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await chatAPI.startSession();
      
      if (response.success && response.data) {
        setCurrentSession(response.data);
        
        // Add the initial bot message
        const botMessage: Message = {
          id: generateMessageId(),
          type: 'bot',
          content: response.data.bot_message,
          timestamp: new Date(),
        };
        
        setMessages([botMessage]);
        
        // Store the initial bot message
        messageStorage.addMessage('bot', response.data.bot_message, response.data.session_id);
        updateStoredMessages();
      } else {
        setError(response.error || 'Failed to start session');
      }
    } catch (err) {
      setError('Network error: Unable to start session');
    } finally {
      setIsLoading(false);
    }
  }, [updateStoredMessages]);

  // Send a message in the chat
  const sendMessage = useCallback(async (messageContent: string) => {
    if (!currentSession || !messageContent.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Add user message immediately
    const userMessage: Message = {
      id: generateMessageId(),
      type: 'user',
      content: messageContent.trim(),
      timestamp: new Date(),
    };
    
    // Update messages state for UI
    setMessages(prev => [...prev, userMessage]);
    
    // Store user message in persistent storage
    messageStorage.addMessage('user', messageContent.trim(), currentSession.session_id);
    updateStoredMessages();
    
    try {
      // Get formatted history for API
      const formattedHistory = messageStorage.getFormattedHistoryForAI();
      
      console.log('Sending message with persistent storage:', {
        sessionId: currentSession.session_id,
        newMessage: messageContent.trim(),
        historyLength: formattedHistory.length,
        numberedHistory: messageStorage.getNumberedHistory(),
        messageHistory: formattedHistory
      });
      
      const response = await chatAPI.sendMessage(
        currentSession.session_id, 
        messageContent.trim(),
        formattedHistory
      );
      
      if (response.success && response.data) {
        const chatResponse = response.data as ChatResponse;
        
        // Add bot response
        const botMessage: Message = {
          id: generateMessageId(),
          type: 'bot',
          content: chatResponse.bot_message,
          timestamp: new Date(),
        };
        
        // Update UI messages
        setMessages(prev => [...prev, botMessage]);
        
        // Store bot response in persistent storage
        messageStorage.addMessage('bot', chatResponse.bot_message, currentSession.session_id);
        updateStoredMessages();
        
        // Update triage state
        setHasEnoughInfo(chatResponse.has_enough_info || false);
        setTriageComplete(chatResponse.triage_complete || false);
        
        // Check if we have enough information for triage
        if (chatResponse.has_enough_info && !triageComplete) {
          console.log('Enough information collected, fetching triage results...');
          await getTriageResults();
        }
      } else {
        setError(response.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error: Unable to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  // Get triage results
  const getTriageResults = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      const response = await chatAPI.getTriageResults(currentSession.session_id);
      
      if (response.success && response.data) {
        setTriageResult(response.data);
      } else {
        setError(response.error || 'Failed to get triage results');
      }
    } catch (err) {
      setError('Network error: Unable to get triage results');
    }
  }, [currentSession]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setStoredMessages([]);
    setNumberedHistory([]);
    setError(null);
    setHasEnoughInfo(false);
    setTriageComplete(false);
    setTriageResult(null);
    
    // Clear persistent storage
    messageStorage.clearCurrentSession();
  }, []);

  // Get storage statistics
  const getStorageStats = useCallback(() => {
    return messageStorage.getStorageStats();
  }, []);

  // Export history as JSON
  const exportHistory = useCallback(() => {
    return messageStorage.exportAsJSON();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ChatContextState = {
    currentSession,
    messages,
    storedMessages,
    numberedHistory,
    isLoading,
    error,
    triageComplete,
    triageResult,
    hasEnoughInfo,
    startNewSession,
    sendMessage,
    getTriageResults,
    clearChat,
    clearError,
    getStorageStats,
    exportHistory,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
