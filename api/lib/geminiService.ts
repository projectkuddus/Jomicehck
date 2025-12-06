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

const SYSTEM_INSTRUCTION = `আপনি একজন বাংলাদেশী সম্পত্তি আইনজীবী। আপনার কাজ হলো দলিল সঠিকভাবে পড়া।

## মূল নিয়ম
১. প্রতিটি পাতা মনোযোগ দিয়ে পড়ুন
২. নাম, তারিখ, নম্বর হুবহু লিখুন - কোনো অনুমান নয়
৩. যা পড়া যাচ্ছে না = "অস্পষ্ট"
৪. যা নেই = "উল্লেখ নেই"

## দলিলের ধরন
- হেবা দলিল (দান)
- সাফ কবলা (বিক্রয়)
- বায়নানামা
- নামজারি খতিয়ান
- ট্যাক্স/কর রসিদ
- পর্চা

## কী কী বের করতে হবে
- দাতা/বিক্রেতার নাম ও পিতার নাম
- গ্রহীতা/ক্রেতার নাম ও পিতার নাম
- দলিল নম্বর ও তারিখ
- মৌজা, থানা, জেলা
- দাগ নম্বর ও খতিয়ান নম্বর
- জমির পরিমাণ ও মূল্য
- চৌহদ্দি (সীমানা)

## ঝুঁকি মূল্যায়ন
- ০-২০: নিরাপদ (সব ঠিক আছে)
- ২১-৪০: কম ঝুঁকি (ছোট সমস্যা)
- ৪১-৬০: মাঝারি (যাচাই দরকার)
- ৬১-৮০: উচ্চ ঝুঁকি (গুরুতর সমস্যা)
- ৮১-১০০: মারাত্মক (এড়িয়ে চলুন)

## JSON FORMAT
{
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "documentType": "দলিলের ধরন",
  "documentTypes": ["প্রতিটি ডকুমেন্টের ধরন"],
  "isSameProperty": true | false,
  "propertyMatchReason": "ব্যাখ্যা",
  
  "summary": {
    "mouza": "মৌজার নাম",
    "jla": "জে.এল. নম্বর",
    "thana": "থানা",
    "district": "জেলা",
    "deedNo": "দলিল নম্বর",
    "date": "তারিখ",
    "registrationOffice": "সাব-রেজিস্ট্রি অফিস",
    "propertyAmount": "মূল্য",
    "sellerName": "বিক্রেতা/দাতার নাম",
    "sellerFather": "বিক্রেতার পিতা",
    "buyerName": "ক্রেতা/গ্রহীতার নাম",
    "buyerFather": "ক্রেতার পিতা",
    "witnesses": ["সাক্ষী"],
    "propertyDescription": "সম্পত্তির বিবরণ",
    "dagNo": "দাগ নম্বর",
    "khatianNo": "খতিয়ান নম্বর",
    "landAmount": "জমির পরিমাণ",
    "landType": "জমির ধরন",
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

## গুরুত্বপূর্ণ
- ভালো দিক: ✅ দিয়ে শুরু করুন
- খারাপ দিক: ⚠️ দিয়ে শুরু করুন
- গুরুতর সমস্যা: 🚨 দিয়ে শুরু করুন`;

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
    
    // Add simple prompt - let the model focus on READING
    parts.push({
      text: `এই ${docs.length}টি ডকুমেন্ট পড়ুন।

প্রতিটি ডকুমেন্ট থেকে বের করুন:
- দলিলের ধরন (হেবা/সাফকবলা/নামজারি/ট্যাক্স রসিদ)
- দাতা/বিক্রেতার নাম ও পিতার নাম  
- গ্রহীতা/ক্রেতার নাম ও পিতার নাম
- দলিল নম্বর ও তারিখ
- মৌজা, থানা, জেলা
- দাগ নম্বর, খতিয়ান নম্বর
- জমির পরিমাণ ও মূল্য

শুধু যা পড়তে পারছেন তাই লিখুন। অনুমান করবেন না।
JSON ফরম্যাটে বাংলায় উত্তর দিন।`
    });

    // Try multiple models for better accuracy
    const MODELS_TO_TRY = [
      'gemini-2.0-flash-exp',  // Experimental - often better
      'gemini-1.5-pro',        // Best for document reading
      'gemini-2.0-flash',      // Fallback
    ];
    
    let response: any = null;
    let usedModel = '';
    
    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`🤖 Trying model: ${modelName}...`);
        response = await genAI.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
          }
        });
        usedModel = modelName;
        console.log(`✅ Success with model: ${modelName}`);
        break; // Success - exit loop
      } catch (modelError: any) {
        console.warn(`⚠️ Model ${modelName} failed:`, modelError.message);
        if (modelName === MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
          throw modelError; // Last model failed
        }
      }
    }

    console.log('✅ Gemini API response received using:', usedModel);
    
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
      documentTypes: jsonResult.documentTypes || [],
      isSameProperty: jsonResult.isSameProperty ?? true,
      propertyMatchReason: jsonResult.propertyMatchReason || '',
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
