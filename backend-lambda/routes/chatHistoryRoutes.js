const express = require('express');
const router = express.Router();
const {
  createChatSession,
  addMessageToSession,
  getPatientChatSessions,
  getChatSession,
  updateSessionTitle,
  archiveChatSession
} = require('../services/dynamoDBService');

/**
 * Create a new chat session
 * POST /api/chat-history/sessions
 */
router.post('/sessions', async (req, res) => {
  try {
    const { patientId, title } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    const session = await createChatSession(patientId, title);
    res.json(session);
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

/**
 * Get all chat sessions for a patient
 * GET /api/chat-history/sessions/:patientId
 */
router.get('/sessions/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const sessions = await getPatientChatSessions(patientId);
    res.json(sessions);
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    res.status(500).json({ error: 'Failed to get chat sessions' });
  }
});

/**
 * Get a specific chat session
 * GET /api/chat-history/session/:sessionId
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await getChatSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({ error: 'Failed to get chat session' });
  }
});

/**
 * Add a message to a chat session
 * POST /api/chat-history/session/:sessionId/message
 */
router.post('/session/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' });
    }

    const result = await addMessageToSession(sessionId, { role, content });
    res.json(result);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

/**
 * Update chat session title
 * PUT /api/chat-history/session/:sessionId/title
 */
router.put('/session/:sessionId/title', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await updateSessionTitle(sessionId, title);
    res.json(result);
  } catch (error) {
    console.error('Error updating session title:', error);
    res.status(500).json({ error: 'Failed to update session title' });
  }
});

/**
 * Archive a chat session
 * DELETE /api/chat-history/session/:sessionId
 */
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await archiveChatSession(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error archiving session:', error);
    res.status(500).json({ error: 'Failed to archive session' });
  }
});

module.exports = router;
