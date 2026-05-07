const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/proxy-key-status', async (req, res) => {
  const key = req.query.key;
  if (!key) {
  return res.status(400).json({ error: 'Missing key parameter' });
  }

  const apiUrl = `https://api.opusmax.live/api/key-status?key=${encodeURIComponent(key)}`;

  const client = apiUrl.startsWith('https') ? https : http;

  client.get(apiUrl, (apiRes) => {
  let data = '';
  apiRes.on('data', chunk => data += chunk);
  apiRes.on('end', () => {
  try {
  const json = JSON.parse(data);
  res.json(json);
  } catch (e) {
  res.status(500).json({ error: 'Invalid JSON from upstream', raw: data });
  }
  });
  }).on('error', (err) => {
  res.status(500).json({ error: err.message });
  });
});

app.listen(PORT, () => {
  console.log(`OpusMax Dashboard running at http://localhost:${PORT}`);
});
