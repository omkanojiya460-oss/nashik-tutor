const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Yeh line important hai — index.html serve karta hai
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
  const { question, history = [] } = req.body;

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful tutor for school and college students in Nashik, India. Answer student doubts clearly in simple English. Give short explanations with examples. Be friendly and encouraging. Remember the conversation context and refer to previous messages when relevant.'
      },
      ...history,
      {
        role: 'user',
        content: question
      }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, something went wrong!";
    res.json({ reply });

  } catch (err) {
    res.status(500).json({ reply: "Server error. Please try again!" });
  }
});

module.exports = app;

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}