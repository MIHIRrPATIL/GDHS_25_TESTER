// Message storage service for persistent chat history
export interface StoredMessage {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  session_id: string;
}

export interface MessageStorage {
  messages: StoredMessage[];
  lastMessageId: number;
  currentSessionId: string | null;
}

const STORAGE_KEY = 'chikitsahaya_message_history';

class MessageStorageService {
  private storage: MessageStorage;

  constructor() {
    this.storage = this.loadFromStorage();
  }

  // Load storage from localStorage
  private loadFromStorage(): MessageStorage {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded message storage:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading message storage:', error);
    }

    // Default empty storage
    return {
      messages: [],
      lastMessageId: 0,
      currentSessionId: null
    };
  }

  // Save storage to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.storage));
      console.log('Saved message storage:', this.storage);
    } catch (error) {
      console.error('Error saving message storage:', error);
    }
  }

  // Start a new session
  startNewSession(sessionId: string): void {
    this.storage.currentSessionId = sessionId;
    this.saveToStorage();
    console.log(`Started new session: ${sessionId}`);
  }

  // Add a message to storage
  addMessage(type: 'user' | 'bot', content: string, sessionId: string): StoredMessage {
    const messageId = this.storage.lastMessageId + 1;
    const message: StoredMessage = {
      id: messageId,
      type,
      content,
      timestamp: new Date().toISOString(),
      session_id: sessionId
    };

    this.storage.messages.push(message);
    this.storage.lastMessageId = messageId;
    this.storage.currentSessionId = sessionId;
    
    this.saveToStorage();
    
    console.log(`Added message ${messageId}: [${type}] ${content.substring(0, 50)}...`);
    return message;
  }

  // Get all messages for current session
  getCurrentSessionMessages(): StoredMessage[] {
    if (!this.storage.currentSessionId) return [];
    
    return this.storage.messages.filter(
      msg => msg.session_id === this.storage.currentSessionId
    );
  }

  // Get all messages (across all sessions)
  getAllMessages(): StoredMessage[] {
    return this.storage.messages;
  }

  // Get message history formatted for AI backend
  getFormattedHistoryForAI(): Array<{type: 'user' | 'bot', content: string}> {
    const currentMessages = this.getCurrentSessionMessages();
    return currentMessages.map(msg => ({
      type: msg.type,
      content: msg.content
    }));
  }

  // Get numbered message history (1:, 2:, 3:, etc.)
  getNumberedHistory(): string {
    const currentMessages = this.getCurrentSessionMessages();
    return currentMessages
      .map(msg => `${msg.id}: [${msg.type}] ${msg.content}`)
      .join('\n');
  }

  // Get numbered history as array of strings
  getNumberedHistoryArray(): string[] {
    const currentMessages = this.getCurrentSessionMessages();
    return currentMessages.map(msg => `${msg.id}: [${msg.type}] ${msg.content}`);
  }

  // Clear all messages
  clearAllMessages(): void {
    this.storage = {
      messages: [],
      lastMessageId: 0,
      currentSessionId: null
    };
    this.saveToStorage();
    console.log('Cleared all message storage');
  }

  // Clear current session messages only
  clearCurrentSession(): void {
    if (!this.storage.currentSessionId) return;
    
    this.storage.messages = this.storage.messages.filter(
      msg => msg.session_id !== this.storage.currentSessionId
    );
    this.storage.currentSessionId = null;
    this.saveToStorage();
    console.log('Cleared current session messages');
  }

  // Get storage stats
  getStorageStats(): {
    totalMessages: number;
    currentSessionMessages: number;
    lastMessageId: number;
    currentSessionId: string | null;
  } {
    return {
      totalMessages: this.storage.messages.length,
      currentSessionMessages: this.getCurrentSessionMessages().length,
      lastMessageId: this.storage.lastMessageId,
      currentSessionId: this.storage.currentSessionId
    };
  }

  // Export storage as JSON
  exportAsJSON(): string {
    return JSON.stringify(this.storage, null, 2);
  }

  // Import storage from JSON
  importFromJSON(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      this.storage = imported;
      this.saveToStorage();
      console.log('Imported message storage:', imported);
      return true;
    } catch (error) {
      console.error('Error importing message storage:', error);
      return false;
    }
  }
}

// Create singleton instance
export const messageStorage = new MessageStorageService();
export default messageStorage;
