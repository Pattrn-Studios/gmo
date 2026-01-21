/**
 * Simple test endpoint to verify CORS works before Puppeteer loads
 * This endpoint has no dependencies that could fail during module load
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return simple JSON to confirm the endpoint works
  return res.status(200).json({
    success: true,
    message: 'CORS test passed',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
