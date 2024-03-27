require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const validUrl = require('valid-url');

// Basic Configuration
const port = process.env.PORT || 3001;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Route handler for POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const { original_url } = req.body;

  // Validate the URL format
  if (!validUrl.isUri(original_url)) {
    return res.status(400).json({ error: 'invalid url' });
  }

  // Verify the existence of the URL
  const { hostname } = new URL(original_url);
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.status(400).json({ error: 'Invalid URL - Host not found' });
    }

    // Generate short URL
    const shortUrl = nextShortUrl++;
    urlMap.set(shortUrl, original_url);

    res.json({ original_url, short_url: shortUrl });
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
