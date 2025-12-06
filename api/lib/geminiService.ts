import { GoogleGenAI } from "@google/genai";
import { DocumentInput, AnalysisResult, ChatMessage } from "./types.js";

// Lazy initialization to avoid crashes during module load
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found!');
      throw new Error("GEMINI_API_KEY not found in environment");
    }
    console.log(`✅ Initializing Gemini with key starting: ${apiKey.substring(0, 10)}...`);
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const SYSTEM_INSTRUCTION = `You are an expert Senior Property Lawyer in Bangladesh.
Your client is the BUYER. Your job is to protect them.
Analyze the provided property documents and return a detailed risk assessment.

IMPORTANT: Check if documents are from SAME deed or DIFFERENT deeds. Different deeds = Critical Risk.

Return your analysis as JSON with these fields:
- riskScore (0-100)
- riskLevel ("Safe", "Low Risk", "Medium Risk", "High Risk", "Critical")
- documentType (in Bangla)
- summary: { mouza, deedNo, date, propertyAmount }
- goodPoints: array of positive aspects
- badPoints: array of warnings
- criticalIssues: array of deal breakers
- missingInfo: array of missing documents/info
- buyerProtection: { verdict: "Buyer Safe" | "Seller Favored" | "Violated" | "Neutral", details: string }
- chainOfTitleAnalysis: string
- chainOfTitleTimeline: array of { date, event }
- nextSteps: array of actionable advice

All text must be in Bengali (Bangla).`;

export const analyzeDocuments = async (docs: DocumentInput[]): Promise<AnalysisResult> => {
  console.log('📄 Starting analysis for', docs.length, 'documents');
  
  try {
    const genAI = getAI();
    
    // Build content parts
    const parts: any[] = [];
    
    for (const doc of docs) {
      const cleanBase64 = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
      parts.push({
        inlineData: {
          mimeType: doc.mimeType,
          data: cleanBase64
        }
      });
      console.log(`📎 Added document: ${doc.name} (${doc.mimeType})`);
    }
    
    // Add prompt
    parts.push({
      text: `Analyze these property documents. Check if they are from the SAME deed or DIFFERENT deeds first. Return valid JSON in Bengali.`
    });

    console.log('🤖 Calling Gemini API...');
    
    // Simple API call without complex schema
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    console.log('✅ Gemini API response received');
    
    // Extract text from response
    let text: string;
    if (response && typeof response === 'object' && 'text' in response) {
      text = (response as any).text;
    } else if (typeof response === 'string') {
      text = response;
    } else {
      console.error('❌ Unexpected response:', JSON.stringify(response).substring(0, 200));
      throw new Error('Unexpected response format from AI');
    }
    
    if (!text || text.trim() === '') {
      throw new Error('Empty response from AI service');
    }
    
    console.log('📄 Response length:', text.length);
    
    // Parse JSON
    const jsonResult = JSON.parse(text) as AnalysisResult;
    
    // Validate required fields with defaults
    return {
      riskScore: jsonResult.riskScore || 50,
      riskLevel: jsonResult.riskLevel || 'Medium Risk',
      documentType: jsonResult.documentType || 'দলিল',
      summary: jsonResult.summary || { mouza: '', deedNo: '', date: '', propertyAmount: '' },
      goodPoints: jsonResult.goodPoints || [],
      badPoints: jsonResult.badPoints || [],
      criticalIssues: jsonResult.criticalIssues || [],
      missingInfo: jsonResult.missingInfo || [],
      buyerProtection: jsonResult.buyerProtection || { verdict: 'Neutral', details: '' },
      chainOfTitleAnalysis: jsonResult.chainOfTitleAnalysis || '',
      chainOfTitleTimeline: jsonResult.chainOfTitleTimeline || [],
      nextSteps: jsonResult.nextSteps || []
    };

  } catch (error: any) {
    console.error("❌ Gemini Error:", error.message);
    console.error("❌ Stack:", error.stack?.split('\n').slice(0, 3).join('\n'));
    
    if (error.message?.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.');
    }
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error("Service busy. Please try again in a moment.");
    }
    
    throw new Error(error.message || "Failed to analyze documents");
  }
};

export const chatMessage = async (
  history: ChatMessage[],
  input: string,
  analysisContext?: AnalysisResult
): Promise<{ reply: string; updatedHistory: ChatMessage[] }> => {
  try {
    const genAI = getAI();
    
    const geminiHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (history.length === 0 && analysisContext) {
      geminiHistory.push({
        role: 'user',
        parts: [{ text: `Analysis report: ${JSON.stringify(analysisContext)}` }]
      });
      geminiHistory.push({
        role: 'model',
        parts: [{ text: "I have reviewed the analysis. How can I help?" }]
      });
    } else {
      for (const msg of history) {
        geminiHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    const chat = await genAI.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: "You are a Bangladesh Land Law expert. Help users understand property documents. Reply in Bengali when asked in Bengali."
      },
      history: geminiHistory
    });

    const result = await chat.sendMessage({ message: input });
    const reply = result.text;

    let updatedHistory: ChatMessage[];
    if (history.length === 0 && analysisContext) {
      updatedHistory = [
        { role: 'user', text: `Analysis report: ${JSON.stringify(analysisContext)}` },
        { role: 'model', text: "I have reviewed the analysis. How can I help?" },
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
    console.error("Chat Error:", error.message);
    throw new Error(error.message || "Failed to process chat message");
  }
};
