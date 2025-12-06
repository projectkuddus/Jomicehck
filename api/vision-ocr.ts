import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DocumentInput } from './lib/types.js';

/**
 * Google Cloud Vision OCR - BEST for old/faded/handwritten documents
 * Uses multiple detection methods for maximum accuracy
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
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    // Try DOCUMENT_TEXT_DETECTION first (best for structured documents)
    let text = await callVisionAPI(base64Data, apiKey, 'DOCUMENT_TEXT_DETECTION');
    
    // If no text found, try TEXT_DETECTION (works better for handwritten/faded)
    if (!text || text.length < 20) {
      console.log('🔄 DOCUMENT_TEXT_DETECTION returned little text, trying TEXT_DETECTION...');
      const textDetectionResult = await callVisionAPI(base64Data, apiKey, 'TEXT_DETECTION');
      if (textDetectionResult && textDetectionResult.length > (text?.length || 0)) {
        text = textDetectionResult;
      }
    }
    
    if (text && text.length > 0) {
      console.log(`✅ Vision OCR extracted ${text.length} chars`);
      return text;
    }
    
    console.warn('⚠️ Vision OCR: No text found in image');
    return '';
  } catch (error: any) {
    console.error('❌ Vision OCR error:', error.message);
    return '';
  }
}

async function callVisionAPI(
  base64Data: string,
  apiKey: string,
  featureType: 'DOCUMENT_TEXT_DETECTION' | 'TEXT_DETECTION'
): Promise<string> {
  try {
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
                  type: featureType,
                  maxResults: 50, // Get more results for better accuracy
                },
              ],
              imageContext: {
                languageHints: ['bn', 'en'], // Bengali + English (many docs have both)
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(`Vision API ${featureType} error:`, error);
      return '';
    }

    const result = await response.json();
    
    // For DOCUMENT_TEXT_DETECTION, use fullTextAnnotation
    if (featureType === 'DOCUMENT_TEXT_DETECTION') {
      const fullText = result.responses?.[0]?.fullTextAnnotation?.text;
      if (fullText) return fullText;
    }
    
    // For TEXT_DETECTION or fallback, use textAnnotations
    const textAnnotations = result.responses?.[0]?.textAnnotations;
    if (textAnnotations && textAnnotations.length > 0) {
      return textAnnotations[0].description || '';
    }
    
    return '';
  } catch (error: any) {
    console.error(`Vision API ${featureType} call failed:`, error.message);
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
