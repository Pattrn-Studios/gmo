/**
 * Test B: With @sanity/client import
 * Tests if Sanity client loads correctly
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'mb7v1vpy',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    test: 'B',
    success: true,
    message: 'Sanity client loaded',
    clientType: typeof client
  });
}
