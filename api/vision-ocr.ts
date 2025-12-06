import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DocumentInput } from './lib/types.js';

/**
 * Google Cloud Vision OCR - BEST for old/faded/handwritten documents
 * This extracts text from ANY image quality, even when PDF rendering fails
 */

export async function extractTextWithVisionOCR(
  imageData: string,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GOOGLE_CLOUD_VISION_API_KEY not set, skipping OCR');
    return '';
  }

  try {
    // Clean base64 data
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Data,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION', // Best for documents
                  maxResults: 1,
                },
              ],
              imageContext: {
                languageHints: ['bn', 'en'], // Bengali + English
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Vision API error:', error);
      return '';
    }

    const result = await response.json();
    const textAnnotations = result.responses?.[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      return '';
    }

    // First annotation is the full text
    const fullText = textAnnotations[0].description || '';
    console.log(`📝 Vision OCR extracted ${fullText.length} characters`);
    
    return fullText;
  } catch (error: any) {
    console.error('Vision OCR error:', error.message);
    return '';
  }
}

/**
 * Batch OCR for multiple images
 */
export async function extractTextFromDocuments(
  documents: DocumentInput[]
): Promise<Map<number, string>> {
  const results = new Map<number, string>();
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const text = await extractTextWithVisionOCR(doc.data, doc.mimeType);
    if (text) {
      results.set(i, text);
    }
  }
  
  return results;
}

