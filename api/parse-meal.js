const Anthropic = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { description } = req.body || {};
  if (!description?.trim()) return res.status(400).json({ error: 'Description required' });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Estimate the nutritional content of this meal: "${description.trim()}"

Reply with ONLY valid JSON, no markdown, no explanation:
{"dish_name":"concise readable name for the dish","kcal":0,"protein":0,"carbs":0,"fat":0}

All numbers are integers (grams or kcal). If multiple items, sum them all.`
    }]
  });

  const raw = msg.content[0].text.trim();
  const match = raw.match(/\{[\s\S]*\}/);
  const data = JSON.parse(match ? match[0] : raw);
  res.json(data);
};
