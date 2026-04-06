// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware
app.use(cors()); // Allows frontend to connect
app.use(express.json()); // Parses incoming JSON data

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// API Endpoint for Digital Beti
app.post('/api/ask-beti', async (req, res) => {
    try {
        const userMessage = req.body.message;
        console.log("🗣️ User said:", userMessage); // Yeh terminal mein print hoga

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            systemInstruction: `You are 'Digital Beti', a voice assistant for Sanjeevni Hospital's 'CareLink' platform designed for elderly patients. 
            Respond kindly in simple Hindi/English. 
            ALWAYS return your response strictly as a JSON object with two keys:
            1. "reply": Your spoken response to the patient.
            2. "highlight_id": The exact HTML ID of the button to highlight (e.g., 'appointment-btn', 'sos-btn'). If no button needs highlighting, return null.
            Do not include any extra text, only the JSON.`
        });

        const result = await model.generateContent(userMessage);
        const responseText = result.response.text();
        
        console.log("🤖 Raw Gemini Output:", responseText); // Error yahan se pakda jayega!

        // BULLETPROOF JSON EXTRACTOR: Faltu text hata kar sirf {...} block nikalna
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("Gemini ne JSON format nahi bheja!");
        }

        const jsonResponse = JSON.parse(jsonMatch[0]);

        res.json(jsonResponse);

    } catch (error) {
        console.error("❌ CRITICAL ERROR:", error.message || error);
        res.status(500).json({ 
            reply: "Server mein issue hai, terminal check kijiye.", 
            highlight_id: null 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CareLink Backend is running securely on http://localhost:${PORT}`);
});