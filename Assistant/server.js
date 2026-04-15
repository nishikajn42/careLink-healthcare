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
        const requestedLanguage = req.body.language || 'hi'; // Default to Hindi if not specified
        
        console.log("🗣️ User said:", userMessage);
        console.log("🌐 Requested Language:", requestedLanguage);

        // Switch to a more stable/available model from your list
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest", // Changed from gemini-2.5-flash
            systemInstruction: `You are 'Digital Beti', a voice assistant for Sanjeevni Hospital's 'CareLink' platform designed for elderly patients. 
            You must reply in the following language: ${requestedLanguage === 'hi' ? 'Hindi (written in Latin script/Hinglish)' : 'English'}.
            Respond kindly and simply.
            ALWAYS return your response strictly as a JSON object with two keys:
            1. "reply": Your spoken response to the patient.
            2. "highlight_id": The exact HTML ID of the button to highlight (e.g., 'appointment-btn', 'sos-btn', 'patient-login-btn'). If no button needs highlighting, return null.
            Do not include any extra text, markdown, or explanation, only the JSON object.`
        });

        // The specific try-catch for the Gemini API call
        let result;
        try {
            result = await model.generateContent(userMessage);
        } catch (apiError) {
             console.error("Gemini API Error (e.g., 503):", apiError.message);
             // Return a safe response so the server doesn't crash and the UI doesn't break
             return res.status(200).json({ 
                 reply: requestedLanguage === 'hi' ? "Maaf kijiye, main abhi thoda busy hoon. Kripya ek minute baad fir koshish karein." : "I'm sorry, my servers are a bit busy right now. Please try again in a minute.", 
                 highlight_id: null 
             });
        }

        const responseText = result.response.text();
        console.log("🤖 Raw Gemini Output:", responseText); 

        // BULLETPROOF JSON EXTRACTOR: Faltu text hata kar sirf {...} block nikalna
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("Gemini did not return valid JSON format!");
        }

        const jsonResponse = JSON.parse(jsonMatch[0]);

        res.json(jsonResponse);

    } catch (error) {
        console.error("❌ CRITICAL ERROR IN BACKEND LOGIC:", error.message || error);
        res.status(500).json({ 
            reply: req.body.language === 'hi' ? "Server mein koi samasya aa gayi hai." : "There is an issue with the server.", 
            highlight_id: null 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CareLink Backend is running securely on http://localhost:${PORT}`);
});