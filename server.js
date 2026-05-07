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

  const options = {
  hostname: 'api.opusmax.live',
  port: 443,
  path: `/api/key-status?key=${encodeURIComponent(key)}`,
  method: 'GET',
  headers: {
  'User-Agent': 'OpusMax-Dashboard/1.0',
  'Accept': 'application/json'
  }
  };

  const apiReq = https.request(options, (apiRes) => {
  let data = '';
  apiRes.on('data', chunk => data += chunk);
  apiRes.on('end', () => {
  const contentType = apiRes.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
  return res.status(502).json({
  error: 'Upstream returned non-JSON',
  contentType: contentType,
  raw: data.slice(0, 2000)
  });
  }
  try {
  const json = JSON.parse(data);
  res.json(json);
  } catch (e) {
  res.status(500).json({
  error: 'Invalid JSON from upstream',
  raw: data.slice(0, 2000),
  parseError: e.message
  });
  }
  });
  });

  apiReq.on('error', (err) => {
  res.status(500).json({ error: err.message });
  });

  apiReq.end();
});

app.listen(PORT, () => {
  console.log(`OpusMax Dashboard running at http://localhost:${PORT}`);
});
