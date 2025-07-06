const axios = require('axios');
require('dotenv').config(); // Load .env

// Using frontend-style env var name (you asked not to rename it)
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// ✅ Use the working Gemini Flash 1.5 model endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Call Gemini API with a prompt and return its plain text reply
 */
async function callGemini(prompt) {
  try {
    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, body);
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    return '';
  }
}

module.exports = { callGemini };
