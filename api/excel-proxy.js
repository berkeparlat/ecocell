// Vercel Serverless Function - Excel CORS Proxy
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS request için
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    // Firebase Storage'dan dosyayı indir
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Firebase error: ${response.status}` 
      });
    }

    const buffer = await response.buffer();

    // Excel MIME type ile gönder
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
