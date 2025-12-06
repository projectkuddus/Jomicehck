/**
 * PDF to Images Converter with Text Extraction
 * HYBRID APPROACH: Extract text directly + render images as backup
 * This solves the JPEG2000 codec issue that causes blank pages
 */

// Use PDF.js for rendering
import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ConvertedPage {
  pageNumber: number;
  imageData: string; // base64 JPEG
  width: number;
  height: number;
  extractedText?: string; // Direct text extraction for reliability
}

export interface ConversionResult {
  success: boolean;
  pages: ConvertedPage[];
  totalPages: number;
  extractedText?: string; // Full document text
  error?: string;
}

// Settings for MAXIMUM quality - document reading requires high clarity
const RENDER_SCALE = 3.0; // 3x scale for very sharp text
const JPEG_QUALITY = 0.95; // 95% quality for maximum clarity
const MAX_DIMENSION = 4000; // Larger dimension for details
const MIN_VALID_IMAGE_SIZE = 50 * 1024; // 50KB minimum - anything less is likely broken

/**
 * Extract text content from a PDF page
 */
async function extractPageText(page: any): Promise<string> {
  try {
    const textContent = await page.getTextContent();
    const textItems = textContent.items as TextItem[];
    
    // Sort by position (top to bottom, left to right)
    const sortedItems = textItems
      .filter((item: any) => item.str && item.str.trim())
      .sort((a: any, b: any) => {
        const yDiff = b.transform[5] - a.transform[5]; // Y position (top to bottom)
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.transform[4] - b.transform[4]; // X position (left to right)
      });
    
    let currentLine = '';
    let lastY = -1;
    const lines: string[] = [];
    
    for (const item of sortedItems) {
      const y = Math.round((item as any).transform[5]);
      const text = (item as any).str;
      
      if (lastY !== -1 && Math.abs(y - lastY) > 5) {
        // New line
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }
        currentLine = text;
      } else {
        currentLine += ' ' + text;
      }
      lastY = y;
    }
    
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    return lines.join('\n');
  } catch (e) {
    console.warn('Text extraction failed for page:', e);
    return '';
  }
}

/**
 * Convert a PDF file to an array of JPEG images with text extraction
 */
export async function convertPdfToImages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ConversionResult> {
  try {
    console.log(`📄 Converting PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Load PDF from ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      // Disable range requests for reliability
      disableRange: true,
      disableStream: true,
    }).promise;
    const totalPages = pdf.numPages;
    
    console.log(`📄 PDF has ${totalPages} pages`);
    
    const pages: ConvertedPage[] = [];
    const allExtractedText: string[] = [];
    let hasImageRenderingIssues = false;
    
    for (let i = 1; i <= totalPages; i++) {
      if (onProgress) {
        onProgress(i, totalPages);
      }
      
      const page = await pdf.getPage(i);
      
      // STEP 1: Extract text directly (more reliable than image OCR)
      const pageText = await extractPageText(page);
      if (pageText) {
        allExtractedText.push(`--- পৃষ্ঠা ${i} ---\n${pageText}`);
        console.log(`📝 Page ${i}: Extracted ${pageText.length} chars of text`);
      }
      
      // STEP 2: Render page as image
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      
      let width = Math.round(viewport.width);
      let height = Math.round(viewport.height);
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Create canvas with high quality settings
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { 
        alpha: false,
        willReadFrequently: false
      })!;
      
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      // Enable high quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Render page
      try {
        await page.render({
          canvasContext: ctx,
          viewport: page.getViewport({ 
            scale: RENDER_SCALE * (width / viewport.width) 
          }),
          intent: 'display'
        }).promise;
      } catch (renderError) {
        console.warn(`⚠️ Page ${i} rendering had issues:`, renderError);
        hasImageRenderingIssues = true;
      }
      
      // Convert to PNG first (lossless), then check quality
      let imageData = canvas.toDataURL('image/png');
      const pngSize = imageData.length;
      
      // If PNG is too small, the page didn't render properly
      if (pngSize < MIN_VALID_IMAGE_SIZE) {
        console.warn(`⚠️ Page ${i}: Image too small (${(pngSize/1024).toFixed(0)}KB) - likely rendering issue`);
        hasImageRenderingIssues = true;
        
        // Draw extracted text on canvas as fallback
        if (pageText) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.fillStyle = '#000000';
          ctx.font = '24px Arial, sans-serif';
          
          const lines = pageText.split('\n');
          let y = 50;
          for (const line of lines) {
            if (y > height - 50) break;
            ctx.fillText(line.substring(0, 100), 30, y);
            y += 30;
          }
          
          imageData = canvas.toDataURL('image/png');
          console.log(`📝 Page ${i}: Created text-based fallback image`);
        }
      }
      
      // Convert to JPEG for smaller size (only if PNG is valid)
      if (pngSize >= MIN_VALID_IMAGE_SIZE) {
        imageData = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      }
      
      pages.push({
        pageNumber: i,
        imageData,
        width,
        height,
        extractedText: pageText || undefined
      });
      
      const finalSize = (imageData.length / 1024).toFixed(0);
      console.log(`✅ Page ${i}/${totalPages} converted (${finalSize}KB)${pageText ? ` + ${pageText.length} chars text` : ''}`);
    }
    
    // Log warning if there were issues
    if (hasImageRenderingIssues) {
      console.warn('⚠️ Some pages had rendering issues. Text extraction was used as backup.');
    }
    
    return {
      success: true,
      pages,
      totalPages,
      extractedText: allExtractedText.length > 0 ? allExtractedText.join('\n\n') : undefined
    };
    
  } catch (error: any) {
    console.error('❌ PDF conversion failed:', error);
    return {
      success: false,
      pages: [],
      totalPages: 0,
      error: error.message || 'Failed to convert PDF'
    };
  }
}

/**
 * Check if PDF.js is available and working
 */
export async function isPdfJsAvailable(): Promise<boolean> {
  try {
    // Try to access pdfjsLib
    return typeof pdfjsLib.getDocument === 'function';
  } catch {
    return false;
  }
}

