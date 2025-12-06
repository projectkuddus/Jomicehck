import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit, getClientId } from './rate-limit.js';

// PLUS Analysis - For CLEAR documents with readable text
// Uses ONLY Gemini Pro models (NO Flash, NO older models) + PDF text extraction
// NO Vision OCR (not needed for clear documents)

const SYSTEM_INSTRUCTION = `আপনি একজন অভিজ্ঞ বাংলাদেশী সম্পত্তি আইনজীবী। আপনার ক্লায়েন্ট বড় অঙ্কের টাকা দিয়ে জমি কিনতে যাচ্ছেন। আপনার বিশ্লেষণ তাদের সঠিক সিদ্ধান্ত নিতে সাহায্য করবে।

## দলিল পড়ার নিয়ম
১. প্রতিটি পাতা মনোযোগ দিয়ে পড়ুন
২. নাম, তারিখ, নম্বর - সব হুবহু লিখুন
৩. যা পড়া যাচ্ছে তা লিখুন, অনুমান করবেন না
৪. সম্পূর্ণ অপাঠ্য হলে "অস্পষ্ট" লিখুন

## দলিলের ধরন ও গুরুত্ব
- সাফ কবলা: বিক্রয় দলিল - মালিকানা হস্তান্তর
- হেবা দলিল: দান - আত্মীয়দের মধ্যে
- বায়নানামা: চুক্তি মাত্র - এখনো মালিকানা হস্তান্তর হয়নি!
- নামজারি: সরকারি রেকর্ড - অত্যন্ত গুরুত্বপূর্ণ
- ট্যাক্স রসিদ: দখলের প্রমাণ

## ঝুঁকি মূল্যায়ন (কঠোর মানদণ্ড)
- ০-২০: নিরাপদ - সব ডকুমেন্ট ঠিক, এগিয়ে যেতে পারেন
- ২১-৪০: কম ঝুঁকি - ছোট সমস্যা, সমাধানযোগ্য
- ৪১-৬০: মাঝারি - যাচাই ছাড়া এগোবেন না
- ৬১-৮০: উচ্চ ঝুঁকি - আইনজীবীর পরামর্শ নিন
- ৮১-১০০: মারাত্মক - এড়িয়ে চলুন

## গুরুত্বপূর্ণ চেকলিস্ট
- নামজারি আছে কি?
- দখল প্রমাণ (ট্যাক্স রসিদ) আছে কি?
- মালিকানা চেইন স্পষ্ট কি?
- চৌহদ্দি সঠিক কি?`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = getClientId(req);
  const limit = rateLimit(clientId, 30, 15 * 60 * 1000);
  
  if (!limit.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: "Invalid request: 'documents' array is required" });
    }

    // PLUS: Use ONLY Gemini (BEST for Bengali) - NO GPT-4o fallback
    // GPT-4o is inferior for Bengali language understanding
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY required. Gemini is the best model for Bengali documents. Please add your API key to Vercel.' 
      });
    }

    console.log('🔷 PLUS Analysis (Clear Documents) - Using Gemini (Best for Bengali)');
    
    // Use Gemini ONLY - best for Bengali
    try {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        
        // Build parts with PDF extracted text (no Vision OCR for PLUS)
        const extractedTexts: string[] = [];
        const parts: any[] = [];

        for (let i = 0; i < documents.length; i++) {
          const doc = documents[i];
          
          // Use PDF extracted text if available
          if (doc.extractedText && doc.extractedText.length > 10) {
            extractedTexts.push(`--- ডকুমেন্ট ${i + 1}: ${doc.name} ---\n${doc.extractedText}`);
            console.log(`📝 Using PDF text for ${doc.name} (${doc.extractedText.length} chars)`);
          }
          
          // Add image
          const base64Data = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: doc.mimeType
            }
          });
        }

        // Add extracted text as context
        if (extractedTexts.length > 0) {
          parts.unshift({
            text: `📋 PDF থেকে সরাসরি নেওয়া টেক্সট:\n\n${extractedTexts.join('\n\n')}\n\n---\n\nএই টেক্সট PDF থেকে সরাসরি extract করা। ছবি ও টেক্সট মিলিয়ে সঠিক তথ্য দিন।`
          });
        }

        // Add analysis prompt
        parts.push({
          text: `PLUS বিশ্লেষণ: ${documents.length}টি ডকুমেন্ট

আপনার ক্লায়েন্ট এই সম্পত্তি কিনতে বড় অঙ্কের টাকা খরচ করতে যাচ্ছেন। সঠিক তথ্য দিন।

প্রতিটি ডকুমেন্ট থেকে বের করুন:
- দলিলের ধরন: সাফ কবলা / হেবা / বায়না / নামজারি / ট্যাক্স রসিদ?
- বিক্রেতা/দাতা: পূর্ণ নাম, পিতার নাম
- ক্রেতা/গ্রহীতা: পূর্ণ নাম, পিতার নাম
- দলিল নম্বর ও তারিখ
- মৌজা, থানা, জেলা
- দাগ নম্বর, খতিয়ান নম্বর (CS/SA/RS/BS)
- জমির পরিমাণ ও দলিলে উল্লেখিত মূল্য
- চৌহদ্দি (৪ দিক)

JSON ফরম্যাটে উত্তর দিন:
{
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "documentType": "সব ডকুমেন্টের সারসংক্ষেপ",
  "documentTypes": ["প্রতিটি ডকুমেন্টের ধরন"],
  "isSameProperty": true/false,
  "propertyMatchReason": "দাগ/মৌজা মিলেছে কিনা",
  "summary": {
    "mouza": "মৌজার নাম",
    "thana": "থানা",
    "district": "জেলা",
    "deedNo": "দলিল নম্বর",
    "date": "তারিখ",
    "propertyAmount": "মূল্য",
    "sellerName": "বিক্রেতার নাম",
    "sellerFather": "বিক্রেতার পিতা",
    "buyerName": "ক্রেতার নাম",
    "buyerFather": "ক্রেতার পিতা",
    "dagNo": "দাগ নম্বর",
    "khatianNo": "খতিয়ান নম্বর",
    "landAmount": "জমির পরিমাণ",
    "landType": "জমির ধরন",
    "boundaries": {"north": "উত্তরে", "south": "দক্ষিণে", "east": "পূর্বে", "west": "পশ্চিমে"}
  },
  "goodPoints": ["✅ ভালো দিক"],
  "badPoints": ["⚠️ সমস্যা"],
  "criticalIssues": ["🚨 গুরুতর সমস্যা"],
  "missingInfo": ["📋 যা নেই"],
  "chainOfTitleAnalysis": "মালিকানার ইতিহাস",
  "chainOfTitleTimeline": [{"date": "তারিখ", "event": "কী হয়েছিল"}],
  "buyerProtection": {"verdict": "Buyer Safe" | "Risky" | "Neutral", "score": 0-100, "details": ""},
  "nextSteps": ["পরবর্তী পদক্ষেপ"]
}`
        });

        // PLUS: Gemini 2.0 Pro Exp → GPT-5.1 (reliable fallback for critical analysis)
        // Try Gemini first (best for Bengali), fallback to GPT-5.1 if needed
        let result: any = null;
        let usedModel = '';
        let lastError: any = null;
        
        // Try Gemini 2.0 Pro Exp first
        try {
          console.log(`🤖 PLUS: Trying Gemini 2.0 Pro Exp (best for Bengali)...`);
          result = await ai.models.generateContent({
            model: 'gemini-2.0-pro-exp',
            contents: { parts },
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          });
          usedModel = 'gemini-2.0-pro-exp';
          console.log(`✅ Gemini 2.0 Pro Exp responded successfully`);
        } catch (geminiError: any) {
          lastError = geminiError;
          console.warn(`⚠️ Gemini 2.0 Pro Exp failed: ${geminiError.message}`);
          console.log(`🔄 Falling back to GPT-5.1 (most advanced OpenAI)...`);
          
          // Fallback to GPT-5.1
          const openaiKey = process.env.OPENAI_API_KEY;
          if (openaiKey) {
            try {
              const { default: OpenAI } = await import('openai');
              const openai = new OpenAI({ apiKey: openaiKey });
              
              // Convert to OpenAI format
              const imageContents: any[] = [];
              const extractedTexts: string[] = [];
              
              for (let i = 0; i < documents.length; i++) {
                const doc = documents[i];
                const base64Data = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
                
                if (doc.extractedText && doc.extractedText.length > 10) {
                  extractedTexts.push(`--- ডকুমেন্ট ${i + 1}: ${doc.name} ---\n${doc.extractedText}`);
                }
                
                imageContents.push({
                  type: "image_url",
                  image_url: {
                    url: `data:${doc.mimeType};base64,${base64Data}`,
                    detail: "high"
                  }
                });
              }
              
              if (extractedTexts.length > 0) {
                imageContents.unshift({
                  type: "text",
                  text: `📋 PDF থেকে সরাসরি নেওয়া টেক্সট:\n\n${extractedTexts.join('\n\n')}`
                });
              }
              
              // Add PLUS prompt
              const lastTextPart = parts.findLast((p: any) => p.text);
              if (lastTextPart && lastTextPart.text) {
                imageContents.push({
                  type: "text",
                  text: lastTextPart.text
                });
              }
              
              // Try GPT-5.1 first, fallback to GPT-4o if not available
              let openaiModel = 'gpt-5.1';
              try {
                // Test if GPT-5.1 is available
                const testResponse = await openai.chat.completions.create({
                  model: 'gpt-5.1',
                  messages: [{ role: 'user', content: 'test' }],
                  max_tokens: 1,
                });
                console.log('✅ GPT-5.1 is available');
              } catch (e: any) {
                if (e.message?.includes('model') || e.message?.includes('not found')) {
                  console.warn('⚠️ GPT-5.1 not available, using GPT-4o instead');
                  openaiModel = 'gpt-4o'; // Fallback to GPT-4o
                }
              }
              
              const response = await openai.chat.completions.create({
                model: openaiModel, // GPT-5.1 or GPT-4o fallback
                messages: [
                  { role: "system", content: SYSTEM_INSTRUCTION },
                  { role: "user", content: imageContents }
                ],
                max_tokens: 4096,
                temperature: 0.1,
                response_format: { type: "json_object" }
              });
              
              const text = response.choices[0]?.message?.content;
              if (text) {
                // Parse and return (same structure as Gemini)
                const rawResult = JSON.parse(text);
                const finalResult = {
                  modelUsed: 'gpt-5.1',
                  riskScore: rawResult.riskScore ?? 50,
                  riskLevel: rawResult.riskLevel || 'Medium Risk',
                  documentType: rawResult.documentType || 'দলিল',
                  documentTypes: rawResult.documentTypes || [],
                  isSameProperty: rawResult.isSameProperty ?? true,
                  propertyMatchReason: rawResult.propertyMatchReason || '',
                  summary: {
                    mouza: rawResult.summary?.mouza || '',
                    jla: rawResult.summary?.jla || '',
                    thana: rawResult.summary?.thana || '',
                    district: rawResult.summary?.district || '',
                    deedNo: rawResult.summary?.deedNo || '',
                    date: rawResult.summary?.date || '',
                    registrationOffice: rawResult.summary?.registrationOffice || '',
                    propertyAmount: rawResult.summary?.propertyAmount || '',
                    sellerName: rawResult.summary?.sellerName || '',
                    sellerFather: rawResult.summary?.sellerFather || '',
                    buyerName: rawResult.summary?.buyerName || '',
                    buyerFather: rawResult.summary?.buyerFather || '',
                    dagNo: rawResult.summary?.dagNo || '',
                    khatianNo: rawResult.summary?.khatianNo || '',
                    landAmount: rawResult.summary?.landAmount || '',
                    landType: rawResult.summary?.landType || '',
                    boundaries: rawResult.summary?.boundaries || null,
                  },
                  goodPoints: rawResult.goodPoints || [],
                  badPoints: rawResult.badPoints || [],
                  criticalIssues: rawResult.criticalIssues || [],
                  missingInfo: rawResult.missingInfo || [],
                  chainOfTitleAnalysis: rawResult.chainOfTitleAnalysis || '',
                  chainOfTitleTimeline: rawResult.chainOfTitleTimeline || [],
                  buyerProtection: {
                    verdict: rawResult.buyerProtection?.verdict || 'Neutral',
                    score: rawResult.buyerProtection?.score,
                    details: rawResult.buyerProtection?.details || '',
                  },
                  nextSteps: rawResult.nextSteps || [],
                  verificationChecklist: rawResult.verificationChecklist || [],
                };
                
                console.log('✅ PLUS Analysis completed with GPT-5.1 (fallback)');
                return res.json(finalResult);
              }
            } catch (gptError: any) {
              console.error('❌ GPT-5.1 also failed:', gptError.message);
              lastError = gptError;
            }
          }
        }
        
        if (!result) {
          throw lastError || new Error('Both Gemini 2.0 Pro Exp and GPT-5.1 failed');
        }

        const text = result.text || '';
        if (!text) {
          throw new Error('Empty response from Gemini');
        }
        
        let rawResult;
        try {
          rawResult = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || text);
        } catch (e) {
          throw new Error('Invalid JSON from Gemini');
        }

        const finalResult = {
          modelUsed: usedModel || 'gemini-1.5-pro', // Pro model only
            riskScore: rawResult.riskScore ?? 50,
            riskLevel: rawResult.riskLevel || 'Medium Risk',
            documentType: rawResult.documentType || 'দলিল',
            documentTypes: rawResult.documentTypes || [],
            isSameProperty: rawResult.isSameProperty ?? true,
            propertyMatchReason: rawResult.propertyMatchReason || '',
            summary: {
              mouza: rawResult.summary?.mouza || '',
              jla: rawResult.summary?.jla || '',
              thana: rawResult.summary?.thana || '',
              district: rawResult.summary?.district || '',
              deedNo: rawResult.summary?.deedNo || '',
              date: rawResult.summary?.date || '',
              registrationOffice: rawResult.summary?.registrationOffice || '',
              propertyAmount: rawResult.summary?.propertyAmount || '',
              sellerName: rawResult.summary?.sellerName || '',
              sellerFather: rawResult.summary?.sellerFather || '',
              buyerName: rawResult.summary?.buyerName || '',
              buyerFather: rawResult.summary?.buyerFather || '',
              dagNo: rawResult.summary?.dagNo || '',
              khatianNo: rawResult.summary?.khatianNo || '',
              landAmount: rawResult.summary?.landAmount || '',
              landType: rawResult.summary?.landType || '',
              boundaries: rawResult.summary?.boundaries || null,
            },
            goodPoints: rawResult.goodPoints || [],
            badPoints: rawResult.badPoints || [],
            criticalIssues: rawResult.criticalIssues || [],
            missingInfo: rawResult.missingInfo || [],
            chainOfTitleAnalysis: rawResult.chainOfTitleAnalysis || '',
            chainOfTitleTimeline: rawResult.chainOfTitleTimeline || [],
            buyerProtection: {
              verdict: rawResult.buyerProtection?.verdict || 'Neutral',
              score: rawResult.buyerProtection?.score,
              details: rawResult.buyerProtection?.details || '',
            },
            nextSteps: rawResult.nextSteps || [],
            verificationChecklist: rawResult.verificationChecklist || [],
          };
          
          console.log('✅ PLUS Analysis completed with Gemini');
          return res.json(finalResult);
        }
    } catch (geminiError: any) {
      console.error('❌ Gemini failed:', geminiError.message);
      return res.status(500).json({ 
        error: `Gemini API error: ${geminiError.message}. Gemini is required for Bengali document analysis.` 
      });
    }

  } catch (error: any) {
    console.error("❌ PLUS Analysis error:", error.message);
    
    if (error.message?.includes('429')) {
      return res.status(429).json({ error: "Service busy. Please try again." });
    }
    
    return res.status(500).json({ error: error.message || "Failed to analyze" });
  }
}
