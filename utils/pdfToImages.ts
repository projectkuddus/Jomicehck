/**
 * PDF to Images Converter
 * Converts PDF pages to compressed JPEG images for reliable processing
 * This solves the large PDF file size issue permanently
 */

// Use PDF.js for rendering
import * as pdfjsLib from 'pdfjs-dist';

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
}

export interface ConversionResult {
  success: boolean;
  pages: ConvertedPage[];
  totalPages: number;
  error?: string;
}

// Settings for image quality vs size balance
const RENDER_SCALE = 1.5; // 1.5x scale for good readability
const JPEG_QUALITY = 0.85; // 85% quality
const MAX_DIMENSION = 2000; // Max width/height in pixels

/**
 * Convert a PDF file to an array of JPEG images
 */
export async function convertPdfToImages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ConversionResult> {
  try {
    console.log(`📄 Converting PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    
    // Load PDF from ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    
    console.log(`📄 PDF has ${totalPages} pages`);
    
    const pages: ConvertedPage[] = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (onProgress) {
        onProgress(i, totalPages);
      }
      
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      
      // Calculate dimensions (respect max dimension)
      let width = viewport.width;
      let height = viewport.height;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      // Render page
      await page.render({
        canvasContext: ctx,
        viewport: page.getViewport({ 
          scale: RENDER_SCALE * (width / viewport.width) 
        })
      }).promise;
      
      // Convert to JPEG
      const imageData = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      
      pages.push({
        pageNumber: i,
        imageData,
        width,
        height
      });
      
      console.log(`✅ Page ${i}/${totalPages} converted (${(imageData.length / 1024).toFixed(0)}KB)`);
    }
    
    return {
      success: true,
      pages,
      totalPages
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

