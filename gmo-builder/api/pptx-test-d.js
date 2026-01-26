/**
 * Test D: Full pptxgenjs runtime test
 * Creates a minimal presentation and returns buffer size
 */
import PptxGenJS from 'pptxgenjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    console.log('[Test D] Creating presentation...');
    const pptx = new PptxGenJS();
    pptx.title = 'Test Presentation';
    pptx.layout = 'LAYOUT_WIDE';

    console.log('[Test D] Adding slide...');
    const slide = pptx.addSlide();
    slide.addText('Hello World', { x: 1, y: 1, w: 5, h: 1, fontSize: 24 });

    console.log('[Test D] Generating buffer...');
    const buffer = await pptx.write({ outputType: 'nodebuffer' });

    console.log('[Test D] Success! Buffer size:', buffer.length);
    return res.status(200).json({
      test: 'D',
      success: true,
      message: 'Presentation created successfully',
      bufferSize: buffer.length
    });
  } catch (error) {
    console.error('[Test D] Error:', error);
    return res.status(500).json({
      test: 'D',
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
  }
}
