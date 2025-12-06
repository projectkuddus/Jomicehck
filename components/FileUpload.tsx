
import React, { useCallback, useRef } from 'react';
import { Upload, X, FileImage, Plus, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { FileWithPreview } from '../types';

interface FileUploadProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  disabled: boolean;
}

const MAX_FILES = 5000; // Support for large batch processing
const BATCH_SIZE = 50; // Process files in batches to manage memory

const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File): Promise<FileWithPreview> => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
    
    // Read file as base64
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    // Determine preview URL
    let previewUrl: string | null = null;
    if (isImage && !isHeic) {
      previewUrl = URL.createObjectURL(file);
    }

    // CRITICAL FIX: Count actual PDF pages instead of hardcoded 5
    let estimatedPages = 1; // Default for images
    
    if (isPdf) {
      try {
        // Use PDF.js to count actual pages
        const pdfjsLib = await import('pdfjs-dist');
        // Set worker source for PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        // Load PDF from ArrayBuffer (more reliable than base64)
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        estimatedPages = pdf.numPages;
        console.log(`📄 PDF "${file.name}" has ${estimatedPages} actual pages`);
      } catch (pdfError: any) {
        console.warn('⚠️ Failed to count PDF pages:', pdfError.message);
        // Fallback: Conservative estimate - assume 5 pages if we can't read it
        // Better to undercharge than overcharge the user
        estimatedPages = 5;
        console.warn(`⚠️ Using fallback: ${estimatedPages} pages (couldn't read PDF)`);
      }
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      preview: previewUrl,
      base64Data: base64Data,
      mimeType: file.type || (isHeic ? 'image/heic' : 'application/octet-stream'),
      estimatedPages
    };
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    if (!input.files || input.files.length === 0) return;

    // Check limits
    if (files.length + input.files.length > MAX_FILES) {
      alert(`System Protection: You can only upload up to ${MAX_FILES} documents at a time to ensure analysis accuracy.`);
      input.value = '';
      return;
    }

    const filesToProcess = Array.from(input.files);
    
    // Process files in batches to manage memory
    const batches: File[][] = [];
    for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
      batches.push(filesToProcess.slice(i, i + BATCH_SIZE));
    }

    // Process batches sequentially to avoid memory issues
    const allNewFiles: FileWithPreview[] = [];
    for (const batch of batches) {
      try {
        const batchFiles = await Promise.all(batch.map(processFile));
        allNewFiles.push(...batchFiles);
        // Update state incrementally to show progress
        setFiles((prev) => [...prev, ...batchFiles]);
      } catch (error: any) {
        console.error('❌ Error processing file batch:', error);
        // Continue with other files even if one fails
      }
    }

    // Clear the input value to allow selecting the same file again
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
        // Critical Fix: Reset value BEFORE click to ensure change event fires even if same file is selected
        // and to clear any stale state
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

    // Fallback for non-previewable files
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
           {/* Limit Warning */}
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
