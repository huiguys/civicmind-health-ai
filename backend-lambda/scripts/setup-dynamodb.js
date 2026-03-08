require('dotenv').config();
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

const TABLE_NAME = 'CivicMindChatHistory';

async function setupDynamoDB() {
  console.log('🔧 Setting up DynamoDB table for chat history...\n');

  try {
    // Check if table already exists
    try {
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      await client.send(describeCommand);
      console.log(`✅ Table "${TABLE_NAME}" already exists!`);
      return;
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
      // Table doesn't exist, create it
    }

    // Create table
    const createCommand = new CreateTableCommand({
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'sessionId', KeyType: 'HASH' } // Partition key
      ],
      AttributeDefinitions: [
        { AttributeName: 'sessionId', AttributeType: 'S' },
        { AttributeName: 'patientId', AttributeType: 'S' },
        { AttributeName: 'createdAt', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'PatientIdIndex',
          KeySchema: [
            { AttributeName: 'patientId', KeyType: 'HASH' },
            { AttributeName: 'createdAt', KeyType: 'RANGE' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    console.log(`📝 Creating table "${TABLE_NAME}"...`);
    await client.send(createCommand);
    
    console.log('⏳ Waiting for table to be active...');
    
    // Wait for table to be active
    let tableActive = false;
    while (!tableActive) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      const response = await client.send(describeCommand);
      tableActive = response.Table.TableStatus === 'ACTIVE';
      process.stdout.write('.');
    }
    
    console.log('\n\n✅ DynamoDB table created successfully!');
    console.log(`\nTable Details:`);
    console.log(`  Name: ${TABLE_NAME}`);
    console.log(`  Region: ${process.env.AWS_REGION || 'us-east-1'}`);
    console.log(`  Primary Key: sessionId (String)`);
    console.log(`  Global Secondary Index: PatientIdIndex (patientId, createdAt)`);
    console.log(`\n🎉 Chat history feature is ready to use!`);

  } catch (error) {
    console.error('\n❌ Error setting up DynamoDB:', error.message);
    process.exit(1);
  }
}

setupDynamoDB();
