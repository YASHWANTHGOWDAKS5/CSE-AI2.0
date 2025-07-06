const express = require('express');
const router = express.Router();
const { callGemini } = require('../utils/gemini'); // You'll create this too

router.post('/extract-entities', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const prompt = `
You are an AI assistant. Extract the student's name, date, and subject from the message below.

Message:
"${message}"

Return a JSON object in the format:
{
  "name": "Student Name or empty string",
  "date": "YYYY-MM-DD or empty string",
  "subject": "Subject Name or empty string"
}
Only return JSON.
`;

  try {
    const geminiResponse = await callGemini(prompt);
    const match = geminiResponse.match(/\{[\s\S]*?\}/); // extract JSON

    if (match) {
      const extracted = JSON.parse(match[0]);
      return res.json({
        name: extracted.name || '',
        date: extracted.date || '',
        subject: extracted.subject || '',
      });
    }

    return res.status(200).json({ name: '', date: '', subject: '' });
  } catch (err) {
    console.error('Entity extraction error:', err.message);
    return res.status(500).json({ error: 'Failed to extract entities' });
  }
});

module.exports = router;
