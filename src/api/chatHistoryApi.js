import { API_BASE_URL } from '../config/constants';

export const chatHistoryApi = {
  // Create a new chat session
  createSession: async (patientId, title = 'New Conversation') => {
    const response = await fetch(`${API_BASE_URL}/api/chat-history/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId, title })
    });

    if (!response.ok) {
      throw new Error('Failed to create chat session');
    }

    return response.json();
  },

  // Get all chat sessions for a patient
  getSessions: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/api/chat-history/sessions/${patientId}`);

    if (!response.ok) {
      throw new Error('Failed to get chat sessions');
    }

    return response.json();
  },

  // Get a specific chat session
  getSession: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/api/chat-history/session/${sessionId}`);

    if (!response.ok) {
      throw new Error('Failed to get chat session');
    }

    return response.json();
  },

  // Add a message to a session
  addMessage: async (sessionId, role, content) => {
    const response = await fetch(`${API_BASE_URL}/api/chat-history/session/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role, content })
    });

    if (!response.ok) {
      throw new Error('Failed to add message');
    }

    return response.json();
  },

  // Update session title
  updateTitle: async (sessionId, title) => {
    const response = await fetch(`${API_BASE_URL}/api/chat-history/session/${sessionId}/title`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title })
    });

    if (!response.ok) {
      throw new Error('Failed to update session title');
    }

    return response.json();
  },

  // Archive a session
  archiveSession: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/api/chat-history/session/${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to archive session');
    }

    return response.json();
  }
};
