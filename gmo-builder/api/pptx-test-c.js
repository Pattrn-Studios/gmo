/**
 * Test C: With pptxgenjs static import
 * Tests if pptxgenjs module loads at all
 */
import PptxGenJS from 'pptxgenjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    test: 'C',
    success: true,
    message: 'PptxGenJS module loaded',
    pptxType: typeof PptxGenJS
  });
}
