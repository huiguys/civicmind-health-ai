require('dotenv').config(); // THIS MUST BE LINE 1

const express = require('express');
const cors = require('cors');
const lambda = require('./index.js'); 

const app = express();
const PORT = 3001;

// Debugging check to PROVE it sees your keys
console.log("Checking AWS Keys...");
console.log("Access Key ID:", process.env.AWS_ACCESS_KEY_ID ? "✅ Loaded" : "❌ MISSING");
console.log("Secret Key:", process.env.AWS_SECRET_ACCESS_KEY ? "✅ Loaded" : "❌ MISSING");

app.use(cors());
app.use(express.json({ limit: '50mb' })); 

app.all('/api/*', async (req, res) => {
    try {
        console.log(`\n📥 Incoming Request: ${req.method} ${req.path}`);
        
        const event = {
            path: req.path,
            httpMethod: req.method,
            body: Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : null,
            headers: req.headers
        };

        const response = await lambda.handler(event);
        console.log(`✅ Response Status: ${response.statusCode}`);
        
        res.status(response.statusCode || 200).send(response.body);

    } catch (error) {
        console.error("❌ Local Server Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 CivicMind Backend running locally at http://localhost:${PORT}`);
});