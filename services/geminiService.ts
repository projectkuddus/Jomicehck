import { FileWithPreview, AnalysisResult } from "../types";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:4000');

// Analysis Tiers
export type AnalysisTier = 'plus' | 'pro';

// Internal state for chat session management
let analysisContext: AnalysisResult | null = null;
let chatHistory: Array<{ role: 'user' | 'model'; text: string }> = [];

// Batch settings
const MAX_BATCH_SIZE = 8;
const MAX_PAYLOAD_SIZE = 4 * 1024 * 1024;
const MAX_SINGLE_FILE_SIZE = 3 * 1024 * 1024;

/**
 * Analyze a single batch of documents
 * @param tier - 'plus' for basic analysis, 'pro' for deep analysis with better AI
 */
const analyzeBatch = async (
  documents: Array<{ name: string; mimeType: string; data: string }>,
  tier: AnalysisTier = 'plus'
): Promise<AnalysisResult> => {
  const requestBody = {
    documents,
    metadata: {
      totalDocuments: documents.length,
      documentNames: documents.map(d => d.name),
    }
  };

  // Use different endpoint based on tier
  const endpoint = tier === 'pro' ? '/api/analyze-pro' : '/api/analyze';
  
  console.log(`🔷 Using ${tier.toUpperCase()} analysis (${endpoint})`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error("File too large for analysis. Please upload a smaller PDF (under 5MB) or take photos of individual pages and upload as images.");
    }
    if (response.status === 504 || response.status === 502) {
      throw new Error("Analysis timed out. Please try with fewer pages or wait a moment and try again.");
    }
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  return await response.json() as AnalysisResult;
};

/**
 * Merge multiple analysis results into one comprehensive result
 * SMART CHECK: Detect if results are from different PROPERTIES (not just different document types)
 */
const mergeAnalysisResults = (results: AnalysisResult[]): AnalysisResult => {
  if (results.length === 0) {
    throw new Error("No results to merge");
  }

  if (results.length === 1) {
    return results[0];
  }

  // Aggregate all results FIRST (before using them)
  const allGoodPoints = new Set<string>();
  const allBadPoints = new Set<string>();
  const allCriticalIssues = new Set<string>();
  const allMissingInfo = new Set<string>();
  const allNextSteps = new Set<string>();
  const allTimelineEvents: Array<{ date: string; event: string }> = [];
  const allDocumentTypes = new Set<string>();

  // SMART CHECK: Detect different PROPERTIES using property identifiers
  // Property is identified by: dagNo + khatianNo + mouza (NOT deed number or date)
  // Different document types (deed, mutation, tax) for SAME property is GOOD
  const propertyIdentifiers = results.map(r => ({
    dagNo: r.summary?.dagNo || '',
    khatianNo: r.summary?.khatianNo || '',
    mouza: r.summary?.mouza || '',
    isSameProperty: (r as any).isSameProperty,
  }));

  // Check if AI explicitly flagged different property
  const aiSaysDifferentProperty = results.some(r => (r as any).isSameProperty === false);

  // Check property identifiers - only flag if both dag and mouza are different
  const uniqueProperties = new Set(
    propertyIdentifiers
      .filter(p => p.dagNo || p.mouza) // Only count if has property identifier
      .map(p => `${p.dagNo}|${p.mouza}`) // Use dag + mouza (not khatian as it varies by record type)
  );

  // Only consider it different properties if:
  // 1. AI explicitly said so, OR
  // 2. More than one unique property AND they actually have different identifiers
  const hasDifferentProperties = aiSaysDifferentProperty || 
    (uniqueProperties.size > 1 && 
     propertyIdentifiers.every(p => p.dagNo) && // All have dag numbers
     [...uniqueProperties].some((p1, i, arr) => i > 0 && p1 !== arr[0])); // And they differ

  // Only add warning if TRULY different properties detected
  if (hasDifferentProperties) {
    console.warn('⚠️ Different properties detected in analysis');
    allCriticalIssues.add('⚠️ সতর্কতা: আপলোডকৃত ডকুমেন্টগুলো ভিন্ন ভিন্ন সম্পত্তির বলে মনে হচ্ছে। দাগ নম্বর বা মৌজা মিলছে না। প্রতিটি সম্পত্তির ডকুমেন্ট আলাদাভাবে বিশ্লেষণ করুন।');
  }

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
    
    // Collect document types
    const docTypes = (result as any).documentTypes;
    if (docTypes && Array.isArray(docTypes)) {
      docTypes.forEach((t: string) => allDocumentTypes.add(t));
    }
  });

  // Use the first result as base, but aggregate all data
  const baseResult = results[0];
  let avgRiskScore = Math.round(totalRiskScore / results.length);
  
  // Only increase risk if actually different PROPERTIES (not just different document types)
  if (hasDifferentProperties) {
    avgRiskScore = Math.min(100, avgRiskScore + 25); // Add 25 points for mixed properties
    maxRiskLevel = 'High Risk'; // Flag as high risk, but not automatic Critical
    console.warn('⚠️ Risk score increased due to different properties:', avgRiskScore);
  }

  // Merge PRO-specific fields from all results
  const allPageAnalysis = results.flatMap(r => r.pageByPageAnalysis || []);
  const allRedFlags = results.flatMap(r => r.redFlags || []);
  const allActionItems = results.flatMap(r => r.actionItems || []);
  const allDocumentsNeeded = results.flatMap(r => r.documentsNeeded || []);
  const allLegalClausesAnalysis = results.flatMap(r => r.legalClausesAnalysis || []);

  // Check if any result is PRO
  const isPro = results.some(r => r.proAnalysis === true);

  return {
    ...baseResult,
    // Preserve PRO flag
    proAnalysis: isPro,
    riskScore: avgRiskScore,
    riskLevel: maxRiskLevel,
    // Smart document type labeling
    documentType: allDocumentTypes.size > 0 
      ? Array.from(allDocumentTypes).join(' ও ')
      : (results.length > 1 ? `${results.length} Documents` : baseResult.documentType),
    documentTypes: Array.from(allDocumentTypes),
    isSameProperty: !hasDifferentProperties,
    goodPoints: Array.from(allGoodPoints),
    badPoints: Array.from(allBadPoints),
    criticalIssues: Array.from(allCriticalIssues),
    missingInfo: Array.from(allMissingInfo),
    nextSteps: Array.from(allNextSteps),
    chainOfTitleTimeline: allTimelineEvents,
    chainOfTitleAnalysis: results.map(r => r.chainOfTitleAnalysis).join('\n\n'),
    // PRO-specific merged fields
    pageByPageAnalysis: allPageAnalysis.length > 0 ? allPageAnalysis : undefined,
    redFlags: allRedFlags.length > 0 ? allRedFlags : undefined,
    actionItems: allActionItems.length > 0 ? allActionItems : undefined,
    documentsNeeded: allDocumentsNeeded.length > 0 ? allDocumentsNeeded : undefined,
    legalClausesAnalysis: allLegalClausesAnalysis.length > 0 ? allLegalClausesAnalysis : undefined,
    // Use first result's PRO fields if available
    riskBreakdown: results.find(r => r.riskBreakdown)?.riskBreakdown,
    standardComparison: results.find(r => r.standardComparison)?.standardComparison,
    expertVerdict: results.find(r => r.expertVerdict)?.expertVerdict,
    chainOfTitle: results.find(r => r.chainOfTitle)?.chainOfTitle,
    confidenceScore: results.find(r => r.confidenceScore)?.confidenceScore,
  };
};

/**
 * Analyze property documents with batch processing for large file sets
 */
/**
 * Analyze property documents
 * @param files - Array of files to analyze
 * @param tier - 'plus' for basic (1 credit/page), 'pro' for deep analysis (4 credits/page)
 * @param onProgress - Progress callback
 */
export const analyzeDocuments = async (
  files: FileWithPreview[],
  tier: AnalysisTier = 'plus',
  onProgress?: (current: number, total: number, currentBatch: number, totalBatches: number) => void
): Promise<AnalysisResult> => {
  try {
    console.log(`🚀 Starting ${tier.toUpperCase()} analysis for ${files.length} files`);
    
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

    // Check for oversized files and warn user
    const oversizedFiles = allDocuments.filter(doc => doc.data.length > MAX_SINGLE_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      console.warn(`⚠️ ${oversizedFiles.length} files exceed size limit:`, oversizedFiles.map(f => f.name));
      // For PDFs, we still try to process them but one at a time
    }

    // Smart batching: group files by size to maximize throughput while staying under limit
    const batches: Array<{ name: string; mimeType: string; data: string }[]> = [];
    let currentBatch: Array<{ name: string; mimeType: string; data: string }> = [];
    let currentBatchSize = 0;

    for (const doc of allDocuments) {
      const docSize = doc.data.length;
      
      // If single file is too large, put it in its own batch
      if (docSize > MAX_SINGLE_FILE_SIZE) {
        // Push current batch first if not empty
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
          currentBatch = [];
          currentBatchSize = 0;
        }
        // Put oversized file in its own batch (we'll try anyway)
        batches.push([doc]);
        console.log(`📦 Large file "${doc.name}" (${(docSize / 1024 / 1024).toFixed(1)}MB) in separate batch`);
        continue;
      }
      
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
    
    console.log(`📊 Created ${batches.length} batches from ${allDocuments.length} documents`);

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
          const result = await analyzeBatch(batch, tier);
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
