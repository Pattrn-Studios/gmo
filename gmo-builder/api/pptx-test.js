/**
 * Minimal test endpoint to check if pptxgenjs loads on Vercel
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Step 1: Test dynamic import of pptxgenjs
    console.log('[PPTX Test] Attempting to import pptxgenjs...');
    const pptxModule = await import('pptxgenjs');
    console.log('[PPTX Test] Import successful, module keys:', Object.keys(pptxModule));

    const PptxGenJS = pptxModule.default;
    console.log('[PPTX Test] PptxGenJS type:', typeof PptxGenJS);

    // Step 2: Create a minimal presentation
    console.log('[PPTX Test] Creating presentation...');
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = 'Test Presentation';

    // Step 3: Add a simple slide
    console.log('[PPTX Test] Adding slide...');
    const slide = pptx.addSlide();
    slide.addText('Hello World', { x: 1, y: 1, w: 5, h: 1, fontSize: 24 });

    // Step 4: Generate buffer
    console.log('[PPTX Test] Generating buffer...');
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    console.log('[PPTX Test] Buffer size:', buffer.length);

    return res.status(200).json({
      success: true,
      message: 'pptxgenjs works on Vercel!',
      bufferSize: buffer.length,
      moduleKeys: Object.keys(pptxModule)
    });

  } catch (error) {
    console.error('[PPTX Test] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 10)
    });
  }
}
