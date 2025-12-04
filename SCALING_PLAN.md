# Scaling Plan: 5000+ Files Support

## Current Limitations:
- ❌ MAX_FILES = 30 (too low)
- ❌ All files loaded in memory as base64 (will crash with 5000 files)
- ❌ No batching/chunking
- ❌ No progress tracking
- ❌ Single API call for all files (will timeout)

## Solution Architecture:

### 1. Frontend Changes:
- ✅ Increase limit to 5000+ files
- ✅ Process files in chunks (50-100 at a time)
- ✅ Stream files instead of loading all in memory
- ✅ Progress tracking UI
- ✅ Batch API calls (send 50-100 files per request)
- ✅ Virtual scrolling for file list

### 2. Backend Changes:
- ✅ Batch processing API (accept chunks)
- ✅ Queue system for large batches
- ✅ Progress tracking endpoint
- ✅ Memory-efficient processing
- ✅ Rate limiting protection

### 3. Implementation Strategy:
1. **Chunked Upload**: Process files in batches of 50-100
2. **Progressive Analysis**: Show results as batches complete
3. **Memory Management**: Only keep current batch in memory
4. **Progress UI**: Real-time progress bar and batch status
5. **Error Recovery**: Retry failed batches automatically

## Files to Modify:
- `components/FileUpload.tsx` - Chunked processing
- `services/geminiService.ts` - Batch API calls
- `api/analyze.ts` - Batch processing endpoint
- `backend/src/services/geminiService.ts` - Chunked Gemini calls
- `App.tsx` - Progress tracking state

