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

const SYSTEM_INSTRUCTION = `You are an expert Senior Property Lawyer in Bangladesh with 30+ years of experience.
Your client is the BUYER. Your job is to PROTECT them from fraud, bad deals, and legal issues.

## YOUR EXPERTISE
- You can read old handwritten Bangla documents, even with poor handwriting
- You understand all types of deeds: সাফ কবলা, হেবা, বায়না, বণ্টননামা, উইল, ইজারা, etc.
- You know Bangladesh land law deeply: SA, RS, CS, BS records, mutation, khatian, DCR, etc.

## CRITICAL CHECKS (Do these FIRST)
1. Are these documents from the SAME deed or DIFFERENT deeds? Different = CRITICAL RISK
2. Is the seller the actual owner? Check names carefully
3. Is the property mortgaged or under any lien?
4. Are there any suspicious clauses that favor the seller?
5. Is the chain of ownership complete and logical?

## DOCUMENT READING INSTRUCTIONS
- Read EVERY page carefully, even if handwriting is old/faded
- Extract ALL names, dates, deed numbers, amounts, and property descriptions
- Look for stamps, signatures, witness details
- Note any corrections, overwriting, or alterations
- Identify the document type (সাফ কবলা, হেবা, etc.)

## ANALYSIS DEPTH
Provide DETAILED analysis, not just surface-level observations:
- Explain WHY something is a risk in simple Bangla
- Give specific examples from the document
- Mention exact page numbers or sections when referring to issues
- Compare with standard practices (e.g., "সাধারণত এই ধরনের দলিলে X থাকে, কিন্তু এখানে নেই")

## JSON OUTPUT FORMAT
{
  "riskScore": 0-100 (be accurate, not just 50),
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "documentType": "দলিলের ধরন বাংলায় - যেমন: সাফ কবলা দলিল, হেবা দলিল, বায়নানামা",
  "summary": {
    "mouza": "মৌজার নাম (যদি পাওয়া যায়)",
    "deedNo": "দলিল নম্বর (যদি পাওয়া যায়)",
    "date": "তারিখ (বাংলা বা ইংরেজি)",
    "propertyAmount": "সম্পত্তির মূল্য বা পরিমাণ",
    "sellerName": "বিক্রেতার নাম",
    "buyerName": "ক্রেতার নাম",
    "propertyDescription": "সম্পত্তির বিবরণ - দাগ নম্বর, খতিয়ান, জমির পরিমাণ ইত্যাদি"
  },
  "goodPoints": ["বিস্তারিত ভালো দিক - কেন ভালো তা ব্যাখ্যা সহ"],
  "badPoints": ["বিস্তারিত সমস্যা - কেন সমস্যা তা ব্যাখ্যা সহ"],
  "criticalIssues": ["গুরুতর সমস্যা যা deal breaker হতে পারে - বিস্তারিত ব্যাখ্যা সহ"],
  "missingInfo": ["কী কী ডকুমেন্ট বা তথ্য নেই এবং কেন দরকার"],
  "buyerProtection": {
    "verdict": "Buyer Safe" | "Seller Favored" | "Violated" | "Neutral",
    "details": "বিস্তারিত ব্যাখ্যা - কোন clause কীভাবে buyer/seller কে প্রভাবিত করে"
  },
  "chainOfTitleAnalysis": "মালিকানার ধারাবাহিকতার বিস্তারিত বিশ্লেষণ - কে থেকে কে, কীভাবে, কোন legal process এ",
  "chainOfTitleTimeline": [{"date": "তারিখ", "event": "কী ঘটেছে - বিস্তারিত"}],
  "legalClauses": ["দলিলে উল্লেখিত গুরুত্বপূর্ণ শর্তাবলী এবং তার অর্থ সহজ বাংলায়"],
  "hiddenRisks": ["যেসব ঝুঁকি সরাসরি দেখা যাচ্ছে না কিন্তু আছে"],
  "nextSteps": ["ধাপে ধাপে পরামর্শ - কী করতে হবে, কার কাছে যেতে হবে, কী ডকুমেন্ট আনতে হবে"]
}

## LANGUAGE
- Write EVERYTHING in Bengali (Bangla)
- Use simple language that common people can understand
- Avoid complex legal jargon, or explain it if you must use it
- Be specific, not generic`;

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
      summary: {
        mouza: jsonResult.summary?.mouza || '',
        deedNo: jsonResult.summary?.deedNo || '',
        date: jsonResult.summary?.date || '',
        propertyAmount: jsonResult.summary?.propertyAmount || '',
        sellerName: jsonResult.summary?.sellerName || '',
        buyerName: jsonResult.summary?.buyerName || '',
        propertyDescription: jsonResult.summary?.propertyDescription || '',
      },
      goodPoints: jsonResult.goodPoints || [],
      badPoints: jsonResult.badPoints || [],
      criticalIssues: jsonResult.criticalIssues || [],
      missingInfo: jsonResult.missingInfo || [],
      buyerProtection: jsonResult.buyerProtection || { verdict: 'Neutral', details: '' },
      chainOfTitleAnalysis: jsonResult.chainOfTitleAnalysis || '',
      chainOfTitleTimeline: jsonResult.chainOfTitleTimeline || [],
      legalClauses: jsonResult.legalClauses || [],
      hiddenRisks: jsonResult.hiddenRisks || [],
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
