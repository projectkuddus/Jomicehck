import { GoogleGenAI, Type } from "@google/genai";
import { DocumentInput, AnalysisResult, ChatMessage } from "./types.js";

// Lazy initialization to avoid crashes during module load
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found!');
      console.error('❌ Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
      throw new Error("GEMINI_API_KEY not found in environment");
    }
    // Log first few chars for debugging (safe - not exposing full key)
    console.log(`✅ Initializing Gemini with key starting: ${apiKey.substring(0, 10)}... (length: ${apiKey.length})`);
    ai = new GoogleGenAI({ apiKey });
    console.log('✅ GoogleGenAI instance created');
  }
  return ai;
};

const SYSTEM_INSTRUCTION = `
You are an expert Senior Property Lawyer in Bangladesh (Supreme Court Advocate).
Your client is the **BUYER**. Your job is to protect them.
You are paranoid, cynical, and extremely detail-oriented. You assume the seller might be hiding something (e.g., hidden mortgage, fake POA, Warish gaps).

**CRITICAL FIRST CHECK - Multiple Deeds Detection:**
Before analyzing, you MUST check if all documents belong to the SAME deed or DIFFERENT deeds.
- Compare deed numbers (দলিল নম্বর), dates (তারিখ), property locations (মৌজা, দাগ নম্বর), seller/buyer names
- If documents are from DIFFERENT deeds: This is EXTREMELY HIGH RISK. Flag it immediately in criticalIssues, increase riskScore by 30-40 points, set riskLevel to "Critical"
- Analyzing different deeds together gives INCORRECT and DANGEROUS results

**Task:** Analyze the provided property document images/PDFs (Dolil, Khatian, Namjari, etc.).

**Analysis Depth (Pro Grade):**
1.  **Multiple Deeds Check (CRITICAL):** First verify all documents are from same deed. If not, flag as Critical risk.
2.  **Chain of Title (মালিকানা বায়া দলিল):** Trace the history. Are CS -> SA -> RS -> BS recorded correctly? Is there a gap?
3.  **Vested Property (অর্পিত সম্পত্তি) Check:** Look for Hindu names in previous records that disappeared without clear transfer. This is a huge risk.
4.  **Power of Attorney (POA):** If this is a POA deal, check if the POA is registered, specific, and not expired.
5.  **Field Check:** Don't just read the doc. Tell the user exactly what to check at the AC Land office (Volume No, Page No).
6.  **Buyer Protection:** explicitly check if the terms favor the seller unfairly (e.g., no date for handover, vague liability clauses).
7.  **Missing Information:** Identify what is NOT there but should be (e.g., missing schedule boundaries, missing witness names, missing dates).

**Output:**
You MUST return the result in **JSON format** strictly adhering to the schema provided.
All text fields inside the JSON must be in **Bengali (Bangla)**.
`;
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file

const CHAT_SYSTEM_INSTRUCTION = `
You are a specialized Legal AI Assistant for Bangladesh Land Law.
You have access to a property analysis report provided by the user.
Your goal is to help the user understand the report, answer follow-up questions, and DRAFT legal documents (Deeds, Notices, Correction Letters) based on the context.

**Client Context:**
Your client is the **BUYER**. You must protect their interest at all costs. 
When drafting documents (Bayna Nama, Saf Kabala), always include strict indemnity clauses, specific performance clauses, and clear deadlines to prevent seller fraud.

**Capabilities:**
1.  **Explain:** Clarify difficult Bangla legal terms (e.g., "Ezmany", "Bia Dolil", "Warish").
2.  **Draft:** Create professional drafts for Saf Kabala, Bayna Nama, Legal Notices, or Correction Deeds (Broma Songshodhon) in Bangla.
3.  **Advise:** Suggest next steps for missing documents.

**Tone:** Professional, legally precise, yet accessible. 
**Language:** Primarily Bangla, but can use English if asked.
`;

export const analyzeDocuments = async (docs: DocumentInput[]): Promise<AnalysisResult> => {
  try {
    const parts = [];

    // Add document images/data
    for (const doc of docs) {
      // Ensure data is clean base64 (remove data URL prefix if present)
      const cleanBase64 = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
      
      parts.push({
        inlineData: {
          mimeType: doc.mimeType,
          data: cleanBase64
        }
      });
    }

    // CRITICAL: Check if documents are from different deeds
    // Add detection prompt first
    const detectionPrompt = `CRITICAL FIRST STEP: Before analyzing, check if these documents are from the SAME deed or DIFFERENT deeds.

Look for:
- Different deed numbers (দলিল নম্বর)
- Different dates (তারিখ)
- Different property locations (মৌজা, দাগ নম্বর)
- Different seller/buyer names (বিক্রেতা/ক্রেতার নাম)
- Different property amounts (সম্পত্তির মূল্য)

If documents are from DIFFERENT deeds:
1. This is EXTREMELY HIGH RISK - flag it immediately
2. Add to criticalIssues: "⚠️ সতর্কতা: একাধিক ভিন্ন দলিল একসাথে আপলোড করা হয়েছে। এটি অত্যন্ত ঝুঁকিপূর্ণ। প্রতিটি দলিল আলাদাভাবে বিশ্লেষণ করা উচিত।"
3. Increase riskScore significantly (add 30-40 points)
4. Set riskLevel to "Critical"
5. Warn that analyzing different deeds together gives incorrect results

If documents are from SAME deed:
- Proceed with normal analysis

Now analyze these documents. Be critical. Find what is wrong. Ensure you populate 'goodPoints', 'badPoints', 'criticalIssues', 'missingInfo' and 'nextSteps' with detailed, distinct items. Extract a 'chainOfTitleTimeline' with specific dates/eras (CS, SA, RS) and events. Output valid JSON in Bangla.`;

    parts.push({
      text: detectionPrompt
    });

    // Validate API key before proceeding
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment');
      throw new Error('AI service not configured. Please contact support.');
    }

    const genAI = getAI();
    
    console.log('🤖 Calling Gemini API with', parts.length, 'parts');
    console.log('🔍 Document types:', docs.map(d => ({ name: d.name, mimeType: d.mimeType, dataLen: d.data?.length })));
    
    let response;
    try {
      console.log('🔄 Calling genAI.models.generateContent...');
      console.log('📋 Parts count:', parts.length);
      console.log('📋 First part type:', typeof parts[0], parts[0]?.inlineData ? 'inlineData' : parts[0]?.text ? 'text' : 'unknown');
      
      response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER, description: "0 to 100, where 100 is extremely risky" },
            riskLevel: { type: Type.STRING, enum: ["Safe", "Low Risk", "Medium Risk", "High Risk", "Critical"] },
            documentType: { type: Type.STRING, description: "Type of document in Bangla" },
            summary: {
              type: Type.OBJECT,
              properties: {
                mouza: { type: Type.STRING },
                deedNo: { type: Type.STRING },
                date: { type: Type.STRING },
                propertyAmount: { type: Type.STRING }
              }
            },
            goodPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of positive aspects (What is Good)" },
            badPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of negative aspects or warnings (What is Bad)" },
            criticalIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Deal breakers that MUST be fixed (What to Fix)" },
            missingInfo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of missing vital info (dates, schedule, signatures, map refs, etc.)" },
            buyerProtection: {
              type: Type.OBJECT,
              properties: {
                verdict: { type: Type.STRING, enum: ["Buyer Safe", "Seller Favored", "Violated", "Neutral"], description: "Verdict on fairness" },
                details: { type: Type.STRING, description: "Explanation of fairness and user favor violation" }
              }
            },
            chainOfTitleAnalysis: { type: Type.STRING, description: "Detailed analysis of ownership history text" },
            chainOfTitleTimeline: {
              type: Type.ARRAY,
              description: "Structured timeline of ownership history events (CS, RS, SA, Current)",
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: "Year or Period (e.g. 1990, CS Record)" },
                  event: { type: Type.STRING, description: "Description of transfer or record (e.g. Rahim to Karim via Sale Deed)" }
                }
              }
            },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable advice list (Suggestions for Improvement)" }
          },
          required: ["riskScore", "riskLevel", "documentType", "summary", "goodPoints", "badPoints", "criticalIssues", "missingInfo", "buyerProtection", "nextSteps", "chainOfTitleAnalysis", "chainOfTitleTimeline"]
        }
      }
    });
    } catch (apiError: any) {
      console.error('❌ Gemini API call failed:', {
        message: apiError.message,
        status: apiError.status,
        statusText: apiError.statusText,
        error: apiError.error,
        details: JSON.stringify(apiError).substring(0, 500)
      });
      throw new Error(`Gemini API error: ${apiError.message || 'Unknown API error'}`);
    }

    console.log('✅ Gemini API response received');
    
    // @google/genai returns response.text directly
    let text: string;
    try {
      // The response should have a .text property
      if (response && typeof response === 'object' && 'text' in response) {
        text = (response as any).text;
      } else if (typeof response === 'string') {
        text = response;
      } else {
        // Log the actual response structure for debugging
        console.error('❌ Unexpected response structure:', {
          type: typeof response,
          keys: response ? Object.keys(response) : 'null',
          response: JSON.stringify(response).substring(0, 500)
        });
        throw new Error('Unexpected response format from AI service');
      }
      
      if (!text || text.trim() === '' || text.trim() === '{}') {
        throw new Error('Empty response from AI service');
      }
      
      console.log('📄 Response text length:', text.length);
      console.log('📄 Response preview:', text.substring(0, 200));
      
    } catch (parseError: any) {
      console.error('❌ Response parsing error:', parseError);
      console.error('❌ Response object:', response);
      throw new Error('Failed to parse AI service response. Please try again.');
    }
    
    // Parse JSON
    let jsonResult: AnalysisResult;
    try {
      jsonResult = JSON.parse(text) as AnalysisResult;
      
      // Validate required fields
      if (!jsonResult.riskScore || !jsonResult.riskLevel || !jsonResult.documentType) {
        throw new Error('Invalid response structure: missing required fields');
      }
      
    } catch (jsonError: any) {
      console.error('❌ JSON parse error:', jsonError);
      console.error('❌ Response text (first 500 chars):', text.substring(0, 500));
      throw new Error('Invalid JSON response from AI service. Please try again.');
    }
    
    return jsonResult;

  } catch (error: any) {
    console.error("❌ Gemini Analysis Error:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error name:", error.name);
    
    // Provide more specific error messages
    if (error.message?.includes('API key') || error.message?.includes('API_KEY') || error.message?.includes('not configured')) {
      throw new Error('AI service configuration error. Please contact support.');
    }
    if (error.message?.includes('quota') || error.message?.includes('rate') || error.message?.includes('429')) {
      throw new Error("Service temporarily busy. Please try again in a moment.");
    }
    if (error.message?.includes('timeout') || error.message?.includes('504')) {
      throw new Error("Analysis took too long. Please try with fewer pages.");
    }
    if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
      throw new Error("Invalid document format. Please check your files and try again.");
    }
    throw new Error(error.message || "Failed to analyze documents. Please try again or contact support.");
  }
};

export const chatMessage = async (
  history: ChatMessage[],
  input: string,
  analysisContext?: AnalysisResult
): Promise<{ reply: string; updatedHistory: ChatMessage[] }> => {
  try {
    // Build the full conversation history for Gemini
    const geminiHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // If this is the first message and we have analysis context, initialize with context
    if (history.length === 0 && analysisContext) {
      const contextString = JSON.stringify(analysisContext);
      geminiHistory.push({
        role: 'user',
        parts: [{ text: `Here is the analysis report of the property document in JSON format: ${contextString}. I will now ask you questions about it.` }]
      });
      geminiHistory.push({
        role: 'model',
        parts: [{ text: "Understood. I have reviewed the analysis report. I am ready to answer your questions, explain clauses, or help you draft legal documents regarding this property." }]
      });
    } else {
      // Convert existing history to Gemini format
      for (const msg of history) {
        geminiHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Create chat session with history
    const genAI = getAI();
    const chat = await genAI.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
      history: geminiHistory
    });

    // Send the current user input
    const result = await chat.sendMessage({ message: input });
    const reply = result.text;

    // Build updated history (include context messages if this was the first message)
    let updatedHistory: ChatMessage[];
    if (history.length === 0 && analysisContext) {
      // Include the context initialization in history
      updatedHistory = [
        { role: 'user', text: `Here is the analysis report of the property document in JSON format: ${JSON.stringify(analysisContext)}. I will now ask you questions about it.` },
        { role: 'model', text: "Understood. I have reviewed the analysis report. I am ready to answer your questions, explain clauses, or help you draft legal documents regarding this property." },
        { role: 'user', text: input },
        { role: 'model', text: reply }
      ];
    } else {
      updatedHistory = [
        ...history,
        { role: 'user', text: input },
        { role: 'model', text: reply }
      ];
    }

    return { reply, updatedHistory };

  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    throw new Error(error.message || "Failed to process chat message");
  }
};

