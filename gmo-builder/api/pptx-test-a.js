/**
 * Test A: Bare minimum handler - no imports
 * Tests if basic Vercel function works
 * v2 - forced redeploy
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    test: 'A',
    success: true,
    message: 'Bare handler works'
  });
}
