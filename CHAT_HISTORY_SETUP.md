# Chat History Feature - Setup Instructions

## Overview

This feature adds persistent chat history using AWS DynamoDB. Users can:
- Save all chat conversations automatically
- View chat history in a sidebar
- Start new conversations
- Load previous conversations
- Archive old conversations

## Prerequisites

- AWS Account with DynamoDB access
- AWS credentials configured in `backend-lambda/.env`

## Setup Steps

### Step 1: Install Dependencies

```bash
cd backend-lambda
npm install
```

This will install:
- `@aws-sdk/client-dynamodb` - DynamoDB client
- `@aws-sdk/lib-dynamodb` - DynamoDB document client
- `uuid` - For generating unique session IDs

### Step 2: Create DynamoDB Table

Run the setup script to create the required DynamoDB table:

```bash
cd backend-lambda
node scripts/setup-dynamodb.js
```

This will create a table named `CivicMindChatHistory` with:
- Primary Key: `sessionId` (String)
- Global Secondary Index: `PatientIdIndex` (patientId, createdAt)

**Expected Output:**
```
🔧 Setting up DynamoDB table for chat history...

📝 Creating table "CivicMindChatHistory"...
⏳ Waiting for table to be active...
.....

✅ DynamoDB table created successfully!

Table Details:
  Name: CivicMindChatHistory
  Region: us-east-1
  Primary Key: sessionId (String)
  Global Secondary Index: PatientIdIndex (patientId, createdAt)

🎉 Chat history feature is ready to use!
```

### Step 3: Verify AWS Permissions

Make sure your AWS IAM user/role has these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/CivicMindChatHistory*"
    }
  ]
}
```

### Step 4: Start Backend Server

```bash
cd backend-lambda
node server.js
```

### Step 5: Start Frontend

```bash
npm run dev
```

## How It Works

### Backend Architecture

**DynamoDB Table Structure:**
```javascript
{
  sessionId: "uuid",           // Primary key
  patientId: "ABHA-ID",        // GSI partition key
  title: "Conversation title",
  messages: [
    {
      role: "user" | "assistant",
      content: "message text",
      timestamp: "ISO date"
    }
  ],
  createdAt: "ISO date",       // GSI sort key
  updatedAt: "ISO date",
  isActive: true               // For soft delete
}
```

**API Endpoints:**
- `POST /api/chat-history/sessions` - Create new session
- `GET /api/chat-history/sessions/:patientId` - Get all sessions
- `GET /api/chat-history/session/:sessionId` - Get specific session
- `POST /api/chat-history/session/:sessionId/message` - Add message
- `PUT /api/chat-history/session/:sessionId/title` - Update title
- `DELETE /api/chat-history/session/:sessionId` - Archive session

### Frontend Integration

The chat history sidebar shows:
- List of all previous conversations
- Message count per conversation
- Time since last update
- New chat button
- Archive button (on hover)

## Usage

### For Users

1. **Start a new chat:**
   - Click "New Chat" button in sidebar
   - Chat automatically saves as you type

2. **View chat history:**
   - Click on any previous conversation in sidebar
   - All messages load instantly

3. **Archive old chats:**
   - Hover over a conversation
   - Click the trash icon
   - Confirm archival

### For Developers

**Create a new session:**
```javascript
import { chatHistoryApi } from './api/chatHistoryApi';

const session = await chatHistoryApi.createSession(
  'ABHA-1234-5678-9012-3456',
  'Health Questions'
);
```

**Add a message:**
```javascript
await chatHistoryApi.addMessage(
  sessionId,
  'user',
  'What are my medications?'
);
```

**Load sessions:**
```javascript
const sessions = await chatHistoryApi.getSessions(patientId);
```

## Testing

### Test DynamoDB Connection

```bash
cd backend-lambda
node -e "
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const client = new DynamoDBClient({ region: 'us-east-1' });
client.send(new ListTablesCommand({}))
  .then(data => console.log('✅ Tables:', data.TableNames))
  .catch(err => console.error('❌ Error:', err.message));
"
```

### Test API Endpoints

```bash
# Create session
curl -X POST http://localhost:3001/api/chat-history/sessions \
  -H "Content-Type: application/json" \
  -d '{"patientId":"ABHA-1234","title":"Test Chat"}'

# Get sessions
curl http://localhost:3001/api/chat-history/sessions/ABHA-1234
```

## Troubleshooting

### Error: "Table already exists"
- This is fine! The table was created previously
- You can skip the setup step

### Error: "AccessDeniedException"
- Check AWS credentials in `.env`
- Verify IAM permissions for DynamoDB
- Ensure region is correct

### Error: "ResourceNotFoundException"
- Run the setup script: `node scripts/setup-dynamodb.js`
- Wait for table to become ACTIVE

### Chat history not loading
- Check browser console for errors
- Verify backend is running on port 3001
- Check DynamoDB table exists in AWS Console

## Cost Estimation

**DynamoDB Pricing (us-east-1):**
- Free Tier: 25 GB storage, 25 read/write capacity units
- On-Demand: $1.25 per million write requests, $0.25 per million read requests

**Estimated Monthly Cost:**
- 1,000 users, 10 chats each = 10,000 sessions
- ~100 messages per session = 1M messages
- Storage: ~1 GB
- **Total: $0-5/month** (within free tier for testing)

## Production Considerations

1. **Switch to On-Demand Billing:**
   - Better for variable workloads
   - No capacity planning needed

2. **Enable Point-in-Time Recovery:**
   - Protects against accidental deletes
   - Costs ~$0.20 per GB per month

3. **Add TTL (Time To Live):**
   - Auto-delete old conversations
   - Reduce storage costs

4. **Enable Encryption:**
   - Use AWS KMS for encryption at rest
   - HIPAA compliance requirement

## Next Steps

- [ ] Integrate with PatientDashboard component
- [ ] Add search functionality
- [ ] Add export chat feature
- [ ] Add chat analytics
- [ ] Implement real-time sync

## Support

For issues or questions:
1. Check AWS CloudWatch logs
2. Verify DynamoDB table in AWS Console
3. Test API endpoints with curl
4. Check browser console for frontend errors

---

**Built with ❤️ by Team CivicMind**
