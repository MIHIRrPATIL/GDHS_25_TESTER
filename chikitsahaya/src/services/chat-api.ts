// Chat API service for triage system
const CHAT_API_BASE_URL = 'http://10.160.85.14:5000/api';

// Types for chat system
export interface ChatSession {
  session_id: string;
  bot_message: string;
  status: 'active' | 'completed' | 'inactive';
}

export interface ChatMessage {
  session_id: string;
  message: string;
}

export interface ChatResponse {
  bot_message: string;
  symptom_dict?: Record<string, any>;
  has_enough_info: boolean;
  triage_complete: boolean;
}

export interface SessionDetails {
  session_id: string;
  status: string;
  created_at: string;
  messages: Array<{
    type: 'user' | 'bot';
    message: string;
    timestamp: string;
  }>;
}

export interface Symptom {
  name: string;
  duration: string | null;
  severity: string | null;
  additional_context: string | null;
}

export interface TriageResult {
  session_id: string;
  symptoms: Symptom[];
  urgency_level: 'Emergency' | 'Urgent' | 'Routine';
  has_enough_info: boolean;
  //recommendations?: string[];
  //suggested_actions?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Simple API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${CHAT_API_BASE_URL}${endpoint}`;
    
    console.log('Chat API Request:', {
      url,
      method: options.method || 'GET',
      body: options.body,
      headers: options.headers
    });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('Chat API Response Status:', response.status, response.statusText);

    const data = await response.json();
    console.log('Chat API Response Data:', data);

    if (!response.ok) {
      console.error('Chat API Error:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      // Handle specific server errors
      let errorMessage = data.message || data.error || `HTTP ${response.status}`;
      
      // Check for FAISS-related errors
      if (errorMessage.includes('faiss') || errorMessage.includes('guidelines_faiss.index')) {
        errorMessage = 'Server configuration error: Missing medical guidelines database. Please contact system administrator.';
      }
      
      // Check for file not found errors
      if (errorMessage.includes('No such file or directory')) {
        errorMessage = 'Server missing required files. Please check server configuration.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Chat API Network Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Chat API functions
export const chatAPI = {
  // Start a new triage session
  startSession: async (): Promise<ApiResponse<ChatSession>> => {
    return apiCall<ChatSession>('/start-session', {
      method: 'POST',
    });
  },

  // Send a message in the chat
  sendMessage: async (sessionId: string, message: string, messageHistory?: Array<{type: 'user' | 'bot', content: string}>): Promise<ApiResponse<ChatResponse>> => {
    const payload: any = {
      session_id: sessionId,
      message: message,
    };
    
    // Include message history if provided
    if (messageHistory && messageHistory.length > 0) {
      payload.message_history = messageHistory;
    }
    
    return apiCall<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Get session details
  getSession: async (sessionId: string): Promise<ApiResponse<SessionDetails>> => {
    return apiCall<SessionDetails>(`/session/${sessionId}`);
  },

  // Get triage results
  getTriageResults: async (sessionId: string): Promise<ApiResponse<TriageResult>> => {
    return apiCall<TriageResult>(`/session/${sessionId}/triage`);
  },

  // List all sessions (admin)
  getAllSessions: async (): Promise<ApiResponse<SessionDetails[]>> => {
    return apiCall<SessionDetails[]>('/sessions');
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse<{ status: string }>> => {
    return apiCall<{ status: string }>('/health');
  },

  // Test connection to the chat API
  testConnection: async (): Promise<ApiResponse<any>> => {
    console.log('Testing connection to chat API:', CHAT_API_BASE_URL);
    try {
      const response = await fetch(CHAT_API_BASE_URL.replace('/api', '') + '/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Connection test response:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: `Connection failed: ${response.status}` };
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  },
};

export default chatAPI;
