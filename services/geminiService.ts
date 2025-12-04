import { FileWithPreview, AnalysisResult } from "../types";

// API Configuration
// In production on Vercel, use relative URLs (same domain)
// In development, use localhost or the env variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:4000');

// Internal state for chat session management
let analysisContext: AnalysisResult | null = null;
let chatHistory: Array<{ role: 'user' | 'model'; text: string }> = [];

const BATCH_SIZE = 50; // Process files in batches to avoid API limits and memory issues

/**
 * Analyze a single batch of documents
 */
const analyzeBatch = async (documents: Array<{ name: string; mimeType: string; data: string }>): Promise<AnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documents }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  return await response.json() as AnalysisResult;
};

/**
 * Merge multiple analysis results into one comprehensive result
 */
const mergeAnalysisResults = (results: AnalysisResult[]): AnalysisResult => {
  if (results.length === 0) {
    throw new Error("No results to merge");
  }

  if (results.length === 1) {
    return results[0];
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
  const avgRiskScore = Math.round(totalRiskScore / results.length);

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

    // For small batches, process directly
    if (allDocuments.length <= BATCH_SIZE) {
      return await analyzeBatch(allDocuments);
    }

    // For large batches, process in chunks
    const batches: Array<{ name: string; mimeType: string; data: string }[]> = [];
    for (let i = 0; i < allDocuments.length; i += BATCH_SIZE) {
      batches.push(allDocuments.slice(i, i + BATCH_SIZE));
    }

    const results: AnalysisResult[] = [];
    const totalBatches = batches.length;

    // Process batches sequentially to avoid overwhelming the API
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const currentBatch = i + 1;
      const currentFiles = (i * BATCH_SIZE) + batch.length;
      
      // Report progress
      if (onProgress) {
        onProgress(currentFiles, allDocuments.length, currentBatch, totalBatches);
      }

      try {
        const batchResult = await analyzeBatch(batch);
        results.push(batchResult);
      } catch (error: any) {
        console.error(`Batch ${currentBatch} failed:`, error);
        // Continue with other batches even if one fails
        // You might want to handle this differently based on requirements
      }

      // Small delay between batches to avoid rate limiting
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
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
