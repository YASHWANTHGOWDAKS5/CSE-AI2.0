const express = require('express');
const axios = require('axios');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

// Your n8n webhook URL
const N8N_WEBHOOK_URL = 'https://n8n-4ls9.onrender.com/webhook/faculty-agent';

router.post('/query', authenticateToken, async (req, res) => {
  const { message, name, date, subject } = req.body;  // ⬅️ Added subject here
  const userId = req.user?.email || 'anonymous';

  try {
    const n8nRes = await axios.post(N8N_WEBHOOK_URL, {
      message,
      userId,
      name,
      date,
      subject  // ⬅️ Included subject in the payload to n8n
    });

    console.log('💡 n8n raw response:', Res.data);

    let rawReply = '';

    if (typeof n8nRes.data === 'object' && Res.data.reply) {
      rawReply = n8nRes.data.reply;
    } else if (typeof n8nRes.data === 'string') {
      try {
        const parsed = JSON.parse(n8nRes.data);
        rawReply = parsed.reply || parsed.body?.reply || parsed.message || '⚠️ Agent returned empty.';
      } catch {
        rawReply = n8nRes.data;
      }
    } else {
      rawReply = '⚠️ Unexpected agent response.';
    }

    // Clean any double-string quotes if needed
    if (typeof rawReply === 'string' && rawReply.startsWith('"') && rawReply.endsWith('"')) {
      rawReply = JSON.parse(rawReply);
    }

    console.log('✅ Final reply to frontend:', rawReply);

    res.json({ reply: rawReply });
  } catch (err) {
    console.error('❌ n8n webhook error:', err.response?.data || err.message);
    res.status(500).json({ reply: '⚠️ Agent error: failed to respond.' });
  }
});

module.exports = router;
