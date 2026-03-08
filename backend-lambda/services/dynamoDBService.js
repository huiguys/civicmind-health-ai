const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'CivicMindChatHistory';

/**
 * Create a new chat session
 */
async function createChatSession(patientId, title = 'New Conversation') {
  const sessionId = uuidv4();
  const timestamp = new Date().toISOString();

  const session = {
    sessionId,
    patientId,
    title,
    messages: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    isActive: true
  };

  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: session
    }));

    return session;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

/**
 * Add a message to a chat session
 */
async function addMessageToSession(sessionId, message) {
  const timestamp = new Date().toISOString();

  try {
    // Get current session
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { sessionId }
    }));

    if (!result.Item) {
      throw new Error('Session not found');
    }

    const messages = result.Item.messages || [];
    messages.push({
      ...message,
      timestamp
    });

    // Update session with new message
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { sessionId },
      UpdateExpression: 'SET messages = :messages, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':messages': messages,
        ':updatedAt': timestamp
      }
    }));

    return { sessionId, message: { ...message, timestamp } };
  } catch (error) {
    console.error('Error adding message to session:', error);
    throw error;
  }
}

/**
 * Get all chat sessions for a patient
 */
async function getPatientChatSessions(patientId) {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'PatientIdIndex',
      KeyConditionExpression: 'patientId = :patientId',
      ExpressionAttributeValues: {
        ':patientId': patientId
      },
      ScanIndexForward: false // Sort by newest first
    }));

    return result.Items || [];
  } catch (error) {
    console.error('Error getting patient chat sessions:', error);
    throw error;
  }
}

/**
 * Get a specific chat session with all messages
 */
async function getChatSession(sessionId) {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { sessionId }
    }));

    return result.Item || null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    throw error;
  }
}

/**
 * Update chat session title
 */
async function updateSessionTitle(sessionId, title) {
  try {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { sessionId },
      UpdateExpression: 'SET title = :title, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':title': title,
        ':updatedAt': new Date().toISOString()
      }
    }));

    return { sessionId, title };
  } catch (error) {
    console.error('Error updating session title:', error);
    throw error;
  }
}

/**
 * Mark session as inactive (soft delete)
 */
async function archiveChatSession(sessionId) {
  try {
    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { sessionId },
      UpdateExpression: 'SET isActive = :isActive, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':isActive': false,
        ':updatedAt': new Date().toISOString()
      }
    }));

    return { sessionId, archived: true };
  } catch (error) {
    console.error('Error archiving session:', error);
    throw error;
  }
}

module.exports = {
  createChatSession,
  addMessageToSession,
  getPatientChatSessions,
  getChatSession,
  updateSessionTitle,
  archiveChatSession
};
