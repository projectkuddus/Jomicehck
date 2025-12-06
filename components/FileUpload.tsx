
import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, FileImage, Plus, FileText, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { FileWithPreview } from '../types';
import { convertPdfToImages } from '../utils/pdfToImages';

interface FileUploadProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  disabled: boolean;
}

const MAX_FILES = 5000;
const BATCH_SIZE = 50;

// Image compression settings
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

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
        
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx!.fillStyle = '#FFFFFF';
        ctx!.fillRect(0, 0, width, height);
        ctx!.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        
        console.log(`🗜️ Compressed: ${file.name} - ${(file.size / 1024).toFixed(0)}KB → ${(compressedBase64.length * 0.75 / 1024).toFixed(0)}KB`);
        
        URL.revokeObjectURL(img.src);
        resolve(compressedBase64);
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const processImageFile = async (file: File): Promise<FileWithPreview> => {
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
    
    let base64Data: string;
    let mimeType = file.type || (isHeic ? 'image/heic' : 'application/octet-stream');
    
    // Compress images larger than 500KB
    if (!isHeic && file.size > 500 * 1024) {
      try {
        base64Data = await compressImage(file);
        mimeType = 'image/jpeg';
      } catch {
        base64Data = await readFileAsBase64(file);
      }
    } else {
      base64Data = await readFileAsBase64(file);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      preview: URL.createObjectURL(file),
      base64Data: base64Data,
      mimeType: mimeType,
      estimatedPages: 1
    };
  };

  const processPdfFile = async (file: File): Promise<FileWithPreview[]> => {
    setProcessingStatus(`Converting PDF: ${file.name}...`);
    
    // Convert PDF pages to images
    const result = await convertPdfToImages(file, (current, total) => {
      setProcessingStatus(`Converting page ${current}/${total}...`);
    });
    
    if (!result.success || result.pages.length === 0) {
      // Fallback: send PDF as-is (for small PDFs that fail conversion)
      console.warn('⚠️ PDF conversion failed, trying direct upload');
      const base64Data = await readFileAsBase64(file);
      
      return [{
        id: Math.random().toString(36).substr(2, 9),
        file: file,
        preview: null,
        base64Data: base64Data,
        mimeType: 'application/pdf',
        estimatedPages: 5 // Conservative estimate
      }];
    }
    
    // Log if we have extracted text
    if (result.extractedText) {
      console.log(`📝 Full PDF text extracted: ${result.extractedText.length} characters`);
    }
    
    // Create a FileWithPreview for each page, including extracted text
    return result.pages.map((page) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: new File([file], `${file.name}-page-${page.pageNumber}.jpg`, { type: 'image/jpeg' }),
      preview: page.imageData, // Use the image data as preview too
      base64Data: page.imageData,
      mimeType: 'image/jpeg',
      estimatedPages: 1,
      extractedText: page.extractedText, // Include extracted text per page
      originalPdfName: file.name,
      pageNumber: page.pageNumber,
      totalPages: result.totalPages
    }));
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    if (!input.files || input.files.length === 0) return;

    if (files.length + input.files.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed.`);
      input.value = '';
      return;
    }

    setIsProcessing(true);
    const filesToProcess = Array.from(input.files);
    
    try {
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const isPdf = file.type === 'application/pdf';
        
        setProcessingStatus(`Processing ${i + 1}/${filesToProcess.length}: ${file.name}`);
        
        if (isPdf) {
          // Convert PDF to images
          const pdfPages = await processPdfFile(file);
          setFiles(prev => [...prev, ...pdfPages]);
        } else {
          // Process as image
          const imageFile = await processImageFile(file);
          setFiles(prev => [...prev, imageFile]);
        }
      }
    } catch (error: any) {
      console.error('❌ Error processing files:', error);
      alert(`Error processing file: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
      input.value = '';
    }
  }, [files.length, setFiles]);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove && fileToRemove.preview && !fileToRemove.preview.startsWith('data:')) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const triggerUpload = () => {
    if (files.length >= MAX_FILES || isProcessing) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const renderFilePreview = (file: FileWithPreview) => {
    const isPdf = file.mimeType === 'application/pdf';
    const isHeic = file.mimeType === 'image/heic' || file.file.name.toLowerCase().endsWith('.heic');
    const pageInfo = (file as any).pageNumber ? `Page ${(file as any).pageNumber}/${(file as any).totalPages}` : null;

    if (file.preview) {
      return (
        <>
          <img 
            src={file.preview} 
            alt="Document Preview" 
            className="w-full h-full object-cover"
          />
          {pageInfo && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center">
              {pageInfo}
            </div>
          )}
        </>
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
          {isPdf ? `~${file.estimatedPages} Pages` : 'HEIC Image'}
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
        disabled={disabled || isProcessing}
      />

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-700 font-medium text-center">{processingStatus}</p>
            <p className="text-slate-500 text-sm text-center">
              PDFs are converted to images for reliable analysis
            </p>
          </div>
        </div>
      )}

      {/* Quality Tips Banner */}
      <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 rounded-full mt-0.5">
            <AlertCircle size={14} className="text-amber-600" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-amber-800 mb-1">সেরা ফলাফলের জন্য:</p>
            <ul className="text-amber-700 text-xs space-y-0.5">
              <li>✓ <strong>মূল স্ক্যান (JPEG/PNG)</strong> আপলোড করুন - PDF এর চেয়ে ভালো</li>
              <li>✓ <strong>উচ্চ রেজোলিউশন</strong> (300 DPI) স্ক্যান ব্যবহার করুন</li>
              <li>✓ পুরনো/ঝাপসা দলিল হলে <strong>PRO Analysis</strong> ব্যবহার করুন</li>
            </ul>
          </div>
        </div>
      </div>

      {files.length === 0 ? (
        <div 
          onClick={disabled || isProcessing ? undefined : triggerUpload}
          className={`
            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200
            ${disabled || isProcessing ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'}
          `}
        >
          <div className="bg-slate-100 p-4 rounded-full mb-3">
            <Upload className="text-slate-500 w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 bangla-text">দলিল আপলোড করুন</h3>
          <p className="text-slate-500 mt-1 text-sm max-w-xs leading-relaxed bangla-text">
            সাইন করার <strong className="text-slate-700">আগে</strong> ড্রাফট দলিল, অথবা সাইন করা দলিল যাচাই করতে আপলোড করুন
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">✓ JPEG/PNG সেরা</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">✓ PDF সাপোর্ট</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">✓ HEIC সাপোর্ট</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{files.length} / {MAX_FILES} files attached</span>
            {files.length >= MAX_FILES && (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <AlertCircle size={12}/> Limit Reached
              </span>
            )}
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
            
            {files.length < MAX_FILES && !isProcessing && (
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
