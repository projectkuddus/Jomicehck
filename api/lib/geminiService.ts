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
- You understand all types of deeds: সাফ কবলা, হেবা, বায়না, বণ্টননামা, উইল, ইজারা, পাওয়ার অফ অ্যাটর্নি, etc.
- You know Bangladesh land law: SA, RS, CS, BS records, mutation, khatian, DCR, porcha, etc.
- You can identify forged documents, suspicious patterns, and legal loopholes

## CRITICAL FIRST CHECKS
1. SAME or DIFFERENT deed? Different deeds uploaded together = CRITICAL RISK (score 90+)
2. Seller verification: Is seller's name consistent across all pages?
3. Mortgage/Lien check: Any indication of bank loan, দায়বদ্ধতা, or encumbrance?
4. Suspicious clauses: Any unusual conditions favoring seller?
5. Chain of ownership: Complete and logical?

## DOCUMENT READING - BE THOROUGH
- Read EVERY page including faded/old handwriting
- Extract ALL: names, father's names, addresses, dates, deed numbers, amounts
- Note: stamps, signatures, witnesses, registration marks, corrections, alterations
- Identify document type with confidence
- Look for discrepancies between pages

## JSON OUTPUT FORMAT (PLUS Analysis)
{
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "documentType": "দলিলের ধরন বাংলায়",
  "summary": {
    "mouza": "মৌজার নাম",
    "jla": "জে.এল. নম্বর",
    "thana": "থানা/উপজেলা",
    "district": "জেলা",
    "deedNo": "দলিল নম্বর",
    "date": "তারিখ",
    "registrationOffice": "সাব-রেজিস্ট্রি অফিস",
    "propertyAmount": "দলিলে উল্লেখিত মূল্য (টাকা)",
    "marketValue": "আনুমানিক বাজার মূল্য (যদি বোঝা যায়)",
    "sellerName": "বিক্রেতা/দাতার নাম",
    "sellerFather": "বিক্রেতার পিতার নাম",
    "buyerName": "ক্রেতা/গ্রহীতার নাম",
    "buyerFather": "ক্রেতার পিতার নাম",
    "witnesses": ["সাক্ষীদের নাম"],
    "propertyDescription": "সম্পত্তির সংক্ষিপ্ত বিবরণ",
    "dagNo": "দাগ নম্বর (সব দাগ)",
    "khatianNo": "খতিয়ান নম্বর (CS/SA/RS/BS উল্লেখ সহ)",
    "landAmount": "জমির পরিমাণ (শতক/কাঠা/বিঘা)",
    "landType": "জমির ধরন (আবাদি/অনাবাদি/বাস্তুভিটা/পুকুর/ডোবা)",
    "boundaries": {
      "north": "উত্তরে",
      "south": "দক্ষিণে",
      "east": "পূর্বে",
      "west": "পশ্চিমে"
    }
  },
  "goodPoints": [
    "✅ [বিষয়]: [বিস্তারিত ব্যাখ্যা কেন এটি ভালো]"
  ],
  "badPoints": [
    "⚠️ [বিষয়]: [বিস্তারিত ব্যাখ্যা কেন এটি সমস্যা]"
  ],
  "criticalIssues": [
    "🚨 [গুরুতর সমস্যা]: [কেন এটি deal breaker এবং কী ক্ষতি হতে পারে]"
  ],
  "missingInfo": [
    "📋 [যা নেই]: [কেন এটি দরকার এবং কোথায় পাবেন]"
  ],
  "buyerProtection": {
    "verdict": "Buyer Safe" | "Seller Favored" | "Risky" | "Neutral",
    "score": 0-100,
    "details": "ক্রেতার সুরক্ষার বিস্তারিত বিশ্লেষণ"
  },
  "chainOfTitleAnalysis": "মালিকানার ইতিহাস - কে থেকে কে, কীভাবে, কখন",
  "chainOfTitleTimeline": [
    {"date": "তারিখ", "event": "কী হয়েছিল", "parties": "কে থেকে কে"}
  ],
  "legalClauses": [
    "📜 [ধারা/শর্ত]: [সহজ বাংলায় অর্থ এবং প্রভাব]"
  ],
  "hiddenRisks": [
    "👁️ [লুকানো ঝুঁকি]: [কেন এটি ঝুঁকি এবং কীভাবে এড়াবেন]"
  ],
  "nextSteps": [
    "1️⃣ [প্রথম পদক্ষেপ]: [কী করবেন, কোথায় যাবেন]",
    "2️⃣ [দ্বিতীয় পদক্ষেপ]: [বিস্তারিত]"
  ],
  "verificationChecklist": [
    {"item": "যা যাচাই করতে হবে", "where": "কোথায়", "priority": "High/Medium/Low"}
  ]
}

## ANALYSIS QUALITY RULES
1. Be SPECIFIC - use exact names, numbers, dates from document
2. EXPLAIN why something is good/bad, don't just list
3. Use EMOJIS for visual clarity (✅ ⚠️ 🚨 📋 📜 👁️ 1️⃣)
4. Write in SIMPLE Bangla - avoid jargon, explain if needed
5. Reference PAGE NUMBERS when possible
6. Compare with STANDARD PRACTICES
7. Give ACTIONABLE next steps

## RISK SCORING GUIDE
- 0-20: Safe - all looks good, minor recommendations only
- 21-40: Low Risk - some minor issues, can proceed carefully
- 41-60: Medium Risk - notable concerns, need verification
- 61-80: High Risk - significant issues, proceed with caution
- 81-100: Critical - major red flags, do not proceed without expert review`;

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
    
    // Build comprehensive result with all fields
    return {
      riskScore: jsonResult.riskScore ?? 50,
      riskLevel: jsonResult.riskLevel || 'Medium Risk',
      documentType: jsonResult.documentType || 'দলিল',
      summary: {
        mouza: jsonResult.summary?.mouza || '',
        jla: jsonResult.summary?.jla || '',
        thana: jsonResult.summary?.thana || '',
        district: jsonResult.summary?.district || '',
        deedNo: jsonResult.summary?.deedNo || '',
        date: jsonResult.summary?.date || '',
        registrationOffice: jsonResult.summary?.registrationOffice || '',
        propertyAmount: jsonResult.summary?.propertyAmount || '',
        marketValue: jsonResult.summary?.marketValue || '',
        sellerName: jsonResult.summary?.sellerName || '',
        sellerFather: jsonResult.summary?.sellerFather || '',
        buyerName: jsonResult.summary?.buyerName || '',
        buyerFather: jsonResult.summary?.buyerFather || '',
        witnesses: jsonResult.summary?.witnesses || [],
        propertyDescription: jsonResult.summary?.propertyDescription || '',
        dagNo: jsonResult.summary?.dagNo || '',
        khatianNo: jsonResult.summary?.khatianNo || '',
        landAmount: jsonResult.summary?.landAmount || '',
        landType: jsonResult.summary?.landType || '',
        boundaries: jsonResult.summary?.boundaries || null,
      },
      goodPoints: jsonResult.goodPoints || [],
      badPoints: jsonResult.badPoints || [],
      criticalIssues: jsonResult.criticalIssues || [],
      missingInfo: jsonResult.missingInfo || [],
      buyerProtection: {
        verdict: jsonResult.buyerProtection?.verdict || 'Neutral',
        score: jsonResult.buyerProtection?.score,
        details: jsonResult.buyerProtection?.details || '',
      },
      chainOfTitleAnalysis: jsonResult.chainOfTitleAnalysis || '',
      chainOfTitleTimeline: jsonResult.chainOfTitleTimeline || [],
      legalClauses: jsonResult.legalClauses || [],
      hiddenRisks: jsonResult.hiddenRisks || [],
      nextSteps: jsonResult.nextSteps || [],
      verificationChecklist: jsonResult.verificationChecklist || [],
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
