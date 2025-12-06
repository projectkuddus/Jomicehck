
import React, { useCallback, useRef } from 'react';
import { Upload, X, FileImage, Plus, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { FileWithPreview } from '../types';

interface FileUploadProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  disabled: boolean;
}

const MAX_FILES = 5000;
const BATCH_SIZE = 50;

// Image compression settings
const MAX_IMAGE_DIMENSION = 1600; // Max width/height in pixels
const JPEG_QUALITY = 0.8; // 80% quality - good balance of size and clarity
const MAX_FILE_SIZE_MB = 2; // Target max size per file after compression

/**
 * Compress an image file to reduce size while maintaining readability
 */
const compressImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      try {
        let { width, height } = img;
        
        // Scale down if larger than max dimension
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw with white background (for transparent PNGs)
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(0, 0, width, height);
        ctx!.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG for better compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        
        console.log(`🗜️ Compressed: ${file.name} - ${(file.size / 1024).toFixed(0)}KB → ${(compressedBase64.length * 0.75 / 1024).toFixed(0)}KB`);
        
        resolve(compressedBase64);
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Read file as base64 without compression
 */
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

/**
 * Count PDF pages using a simple approach without external worker
 */
const countPdfPages = async (file: File): Promise<number> => {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string for regex search (only first and last 50KB for efficiency)
    const decoder = new TextDecoder('latin1');
    const text = decoder.decode(uint8Array);
    
    // Method 1: Search for /Count in catalog (most reliable)
    const countMatch = text.match(/\/Count\s+(\d+)/);
    if (countMatch) {
      const count = parseInt(countMatch[1], 10);
      if (count > 0 && count < 10000) {
        console.log(`📄 PDF "${file.name}" has ${count} pages (Count method)`);
        return count;
      }
    }
    
    // Method 2: Count /Type /Page occurrences
    const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
    if (pageMatches && pageMatches.length > 0) {
      console.log(`📄 PDF "${file.name}" has ${pageMatches.length} pages (Page count method)`);
      return pageMatches.length;
    }
    
    // Method 3: Estimate from file size (last resort)
    const fileSizeMB = file.size / (1024 * 1024);
    const estimatedPages = Math.max(1, Math.ceil(fileSizeMB * 2)); // ~500KB per page estimate
    console.log(`📄 PDF "${file.name}" estimated ${estimatedPages} pages (size-based)`);
    return estimatedPages;
    
  } catch (error: any) {
    console.warn(`⚠️ PDF page count failed for ${file.name}:`, error.message);
    // Conservative fallback
    return 5;
  }
};

const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File): Promise<FileWithPreview> => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
    
    let base64Data: string;
    let mimeType = file.type || (isHeic ? 'image/heic' : 'application/octet-stream');
    
    // Compress images to reduce payload size
    if (isImage && !isHeic && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      try {
        base64Data = await compressImage(file);
        mimeType = 'image/jpeg'; // Compression converts to JPEG
      } catch (err) {
        console.warn('⚠️ Compression failed, using original:', err);
        base64Data = await readFileAsBase64(file);
      }
    } else if (isImage && !isHeic) {
      // Small images: still compress if larger than 500KB
      if (file.size > 500 * 1024) {
        try {
          base64Data = await compressImage(file);
          mimeType = 'image/jpeg';
        } catch (err) {
          base64Data = await readFileAsBase64(file);
        }
      } else {
        base64Data = await readFileAsBase64(file);
      }
    } else {
      // PDFs and HEIC: read as-is
      base64Data = await readFileAsBase64(file);
    }

    // Preview URL for images
    let previewUrl: string | null = null;
    if (isImage && !isHeic) {
      previewUrl = URL.createObjectURL(file);
    }

    // Count PDF pages
    let estimatedPages = 1;
    if (isPdf) {
      estimatedPages = await countPdfPages(file);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      preview: previewUrl,
      base64Data: base64Data,
      mimeType: mimeType,
      estimatedPages
    };
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    if (!input.files || input.files.length === 0) return;

    if (files.length + input.files.length > MAX_FILES) {
      alert(`System Protection: You can only upload up to ${MAX_FILES} documents at a time.`);
      input.value = '';
      return;
    }

    const filesToProcess = Array.from(input.files);
    
    // Process files in batches
    const batches: File[][] = [];
    for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
      batches.push(filesToProcess.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      try {
        const batchFiles = await Promise.all(batch.map(processFile));
        setFiles((prev) => [...prev, ...batchFiles]);
      } catch (error: any) {
        console.error('❌ Error processing file batch:', error);
      }
    }

    input.value = '';
  }, [files.length, setFiles]);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const triggerUpload = () => {
    if (files.length >= MAX_FILES) {
      alert(`Maximum limit of ${MAX_FILES} files reached.`);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const renderFilePreview = (file: FileWithPreview) => {
    const isPdf = file.mimeType === 'application/pdf';
    const isHeic = file.mimeType === 'image/heic' || file.file.name.toLowerCase().endsWith('.heic');

    if (file.preview) {
      return (
        <img 
          src={file.preview} 
          alt="Document Preview" 
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        {isPdf ? (
          <FileText className="text-red-500 mb-2" size={32} />
        ) : isHeic ? (
          <ImageIcon className="text-blue-500 mb-2" size={32} />
        ) : (
          <FileImage className="text-slate-400 mb-2" size={32} />
        )}
        <span className="text-xs text-slate-500 font-medium break-all line-clamp-2">
          {file.file.name}
        </span>
        <span className="text-[10px] text-slate-400 mt-1">
          {isPdf ? `~${file.estimatedPages} Page${file.estimatedPages !== 1 ? 's' : ''}` : 'HEIC Image'}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif, application/pdf"
        disabled={disabled}
      />

      {files.length === 0 ? (
        <div 
          onClick={disabled ? undefined : triggerUpload}
          className={`
            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200
            ${disabled ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'}
          `}
        >
          <div className="bg-slate-100 p-4 rounded-full mb-3">
            <Upload className="text-slate-500 w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Upload Property Documents</h3>
          <p className="text-slate-500 mt-1 text-sm max-w-xs leading-relaxed">
            <span className="font-semibold text-brand-600">Tip:</span> Upload a <strong className="text-slate-700">Draft Deed</strong> before signing, or a final signed copy for verification.
          </p>
          <p className="text-xs text-slate-400 mt-3">
            Supports PDF, JPG, PNG, HEIC (Max {MAX_FILES} files)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{files.length} / {MAX_FILES} files attached</span>
            {files.length >= MAX_FILES && <span className="text-amber-600 font-bold flex items-center gap-1"><AlertCircle size={12}/> Limit Reached</span>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-[3/4] bg-white shadow-sm hover:shadow-md transition-shadow">
                {renderFilePreview(file)}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                  <button 
                    onClick={() => removeFile(file.id)}
                    disabled={disabled}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform scale-90 hover:scale-100 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {files.length < MAX_FILES && (
              <button 
                onClick={triggerUpload}
                disabled={disabled}
                className={`
                  aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors
                  ${disabled ? 'border-slate-200 cursor-not-allowed' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-500 hover:text-blue-600'}
                `}
              >
                <Plus size={24} />
                <span className="text-xs font-medium">Add Page</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
