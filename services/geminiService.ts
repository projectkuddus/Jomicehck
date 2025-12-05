import { FileWithPreview, AnalysisResult } from "../types";

// API Configuration
// In production on Vercel, use relative URLs (same domain)
// In development, use localhost or the env variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:4000');

// Internal state for chat session management
let analysisContext: AnalysisResult | null = null;
let chatHistory: Array<{ role: 'user' | 'model'; text: string }> = [];

// Vercel Hobby plan has 4.5MB body limit
// Average document image is ~300-500KB in base64
// Batch size of 5-7 should stay under limit for most files
const MAX_BATCH_SIZE = 7;
const MAX_PAYLOAD_SIZE = 4 * 1024 * 1024; // 4MB to stay safely under 4.5MB limit

/**
 * Analyze a single batch of documents
 */
const analyzeBatch = async (documents: Array<{ name: string; mimeType: string; data: string }>): Promise<AnalysisResult> => {
  // Add metadata about document count for detection
  const requestBody = {
    documents,
    metadata: {
      totalDocuments: documents.length,
      documentNames: documents.map(d => d.name),
    }
  };

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error("Files too large. Please try with fewer or smaller files.");
    }
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  return await response.json() as AnalysisResult;
};

/**
 * Merge multiple analysis results into one comprehensive result
 * CRITICAL: Check if results indicate different deeds were analyzed
 */
const mergeAnalysisResults = (results: AnalysisResult[]): AnalysisResult => {
  if (results.length === 0) {
    throw new Error("No results to merge");
  }

  if (results.length === 1) {
    return results[0];
  }

  // CRITICAL CHECK: Detect if different batches analyzed different deeds
  // Compare deed numbers, dates, and locations from summaries
  const deedIdentifiers = results.map(r => ({
    deedNo: r.summary?.deedNo || '',
    date: r.summary?.date || '',
    mouza: r.summary?.mouza || '',
  }));

  const uniqueDeeds = new Set(
    deedIdentifiers
      .filter(d => d.deedNo || d.date || d.mouza) // Only count if has identifier
      .map(d => `${d.deedNo}|${d.date}|${d.mouza}`)
  );

  const hasMultipleDeeds = uniqueDeeds.size > 1;

  // CRITICAL: If multiple different deeds detected, add warning and increase risk
  if (hasMultipleDeeds) {
    console.warn('⚠️ CRITICAL: Multiple different deeds detected in analysis!');
    allCriticalIssues.add('⚠️ সতর্কতা: একাধিক ভিন্ন দলিল একসাথে আপলোড করা হয়েছে। এটি অত্যন্ত ঝুঁকিপূর্ণ। প্রতিটি দলিল আলাদাভাবে বিশ্লেষণ করা উচিত। ভিন্ন দলিল একসাথে বিশ্লেষণ করলে ভুল ফলাফল পাওয়া যায় যা আইনি সমস্যা সৃষ্টি করতে পারে।');
  }

  // Aggregate all results
  const allGoodPoints = new Set<string>();
  const allBadPoints = new Set<string>();
  const allCriticalIssues = new Set<string>();
  const allMissingInfo = new Set<string>();
  const allNextSteps = new Set<string>();
  const allTimelineEvents: Array<{ date: string; event: string }> = [];

  let totalRiskScore = 0;
  let maxRiskLevel: AnalysisResult['riskLevel'] = 'Safe';
  const riskLevelOrder = { 'Safe': 0, 'Low Risk': 1, 'Medium Risk': 2, 'High Risk': 3, 'Critical': 4 };

  results.forEach(result => {
    result.goodPoints.forEach(p => allGoodPoints.add(p));
    result.badPoints.forEach(p => allBadPoints.add(p));
    result.criticalIssues.forEach(p => allCriticalIssues.add(p));
    result.missingInfo.forEach(p => allMissingInfo.add(p));
    result.nextSteps.forEach(p => allNextSteps.add(p));
    allTimelineEvents.push(...result.chainOfTitleTimeline);
    totalRiskScore += result.riskScore;
    
    if (riskLevelOrder[result.riskLevel] > riskLevelOrder[maxRiskLevel]) {
      maxRiskLevel = result.riskLevel;
    }
  });

  // Use the first result as base, but aggregate all data
  const baseResult = results[0];
  let avgRiskScore = Math.round(totalRiskScore / results.length);
  
  // CRITICAL: If multiple deeds detected, significantly increase risk score
  if (hasMultipleDeeds) {
    avgRiskScore = Math.min(100, avgRiskScore + 35); // Add 35 points for mixed deeds
    maxRiskLevel = 'Critical'; // Force to Critical level
    console.warn('⚠️ Risk score increased due to multiple deeds:', avgRiskScore);
  }

  return {
    ...baseResult,
    riskScore: avgRiskScore,
    riskLevel: maxRiskLevel,
    documentType: results.length > 1 ? `${results.length} Documents` : baseResult.documentType,
    goodPoints: Array.from(allGoodPoints),
    badPoints: Array.from(allBadPoints),
    criticalIssues: Array.from(allCriticalIssues),
    missingInfo: Array.from(allMissingInfo),
    nextSteps: Array.from(allNextSteps),
    chainOfTitleTimeline: allTimelineEvents,
    chainOfTitleAnalysis: results.map(r => r.chainOfTitleAnalysis).join('\n\n'),
  };
};

/**
 * Analyze property documents with batch processing for large file sets
 */
export const analyzeDocuments = async (
  files: FileWithPreview[],
  onProgress?: (current: number, total: number, currentBatch: number, totalBatches: number) => void
): Promise<AnalysisResult> => {
  try {
    // Convert FileWithPreview[] to backend DocumentInput format
    const allDocuments = files
      .filter(file => file.base64Data)
      .map(file => {
        // Strip the data URL prefix if present to get raw base64
        const cleanBase64 = file.base64Data!.includes(',') 
          ? file.base64Data!.split(',')[1] 
          : file.base64Data!;
        
        return {
          name: file.file.name,
          mimeType: file.mimeType,
          data: cleanBase64
        };
      });

    if (allDocuments.length === 0) {
      throw new Error("No valid documents provided");
    }

    // Smart batching: group files by size to maximize throughput while staying under limit
    const batches: Array<{ name: string; mimeType: string; data: string }[]> = [];
    let currentBatch: Array<{ name: string; mimeType: string; data: string }> = [];
    let currentBatchSize = 0;

    for (const doc of allDocuments) {
      const docSize = doc.data.length; // Base64 string length ≈ bytes
      
      // If adding this doc would exceed limit OR batch is full, start new batch
      if (currentBatchSize + docSize > MAX_PAYLOAD_SIZE || currentBatch.length >= MAX_BATCH_SIZE) {
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
        }
        currentBatch = [doc];
        currentBatchSize = docSize;
      } else {
        currentBatch.push(doc);
        currentBatchSize += docSize;
      }
    }
    
    // Don't forget the last batch
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    const results: AnalysisResult[] = [];
    const totalBatches = batches.length;
    let processedFiles = 0;

    // Process batches with controlled concurrency (2 at a time for speed)
    const CONCURRENT_BATCHES = 2;
    
    for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
      const batchGroup = batches.slice(i, i + CONCURRENT_BATCHES);
      
      // Report progress
      if (onProgress) {
        onProgress(processedFiles, allDocuments.length, i + 1, totalBatches);
      }

      // Process batch group in parallel
      const batchPromises = batchGroup.map(async (batch, idx) => {
        try {
          const result = await analyzeBatch(batch);
          return { success: true, result, batchIndex: i + idx };
        } catch (error: any) {
          console.error(`Batch ${i + idx + 1} failed:`, error);
          return { success: false, error, batchIndex: i + idx };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const br of batchResults) {
        if (br.success && br.result) {
          results.push(br.result);
        }
        processedFiles += batches[br.batchIndex]?.length || 0;
      }

      // Small delay between batch groups to avoid rate limiting
      if (i + CONCURRENT_BATCHES < batches.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (results.length === 0) {
      throw new Error("All batches failed to process");
    }

    // Merge all batch results into one comprehensive result
    return mergeAnalysisResults(results);

  } catch (error: any) {
    console.error("Analysis error:", error);
    
    // Provide user-friendly error messages
    if (error.message) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Unable to connect to the server. Please check your connection and ensure the backend is running.");
    }
    
    throw new Error("Failed to analyze documents. Please try again.");
  }
};

/**
 * Initialize chat session with analysis context
 * This stores the context for subsequent chat messages
 * The backend will initialize the chat when the first message is sent
 */
export const startChatSession = async (context: AnalysisResult): Promise<void> => {
  analysisContext = context;
  chatHistory = [];
  // No API call needed - context will be sent with first message
};

/**
 * Send a message to the AI chat assistant
 * Maintains backward compatibility with existing component usage
 */
export const sendMessageToAI = async (message: string): Promise<string> => {
  try {
    if (!analysisContext) {
      throw new Error("Chat session not initialized. Please call startChatSession first.");
    }

    // Only send analysisContext on first message (when history is empty)
    const requestBody: {
      history: Array<{ role: 'user' | 'model'; text: string }>;
      input: string;
      analysisContext?: AnalysisResult;
    } = {
      history: chatHistory,
      input: message,
    };

    if (chatHistory.length === 0) {
      requestBody.analysisContext = analysisContext;
    }

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const result = await response.json();
    
    // Update internal history state
    chatHistory = result.updatedHistory;
    
    return result.reply;

  } catch (error: any) {
    console.error("Chat message error:", error);
    
    if (error.message) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Unable to connect to the server. Please check your connection and ensure the backend is running.");
    }
    
    throw new Error("Failed to send message. Please try again.");
  }
};
