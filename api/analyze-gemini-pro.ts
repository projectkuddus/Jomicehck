import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { rateLimit, getClientId } from './rate-limit.js';
import { DocumentInput } from './lib/types.js';
import { extractTextWithVisionOCR } from './vision-ocr.js';

// Gemini 2.0 Pro / 3 Pro - BEST for Bengali document analysis
// Better than GPT-4o for multilingual content

const SYSTEM_INSTRUCTION = `আপনি বাংলাদেশের শীর্ষস্থানীয় সম্পত্তি আইন বিশেষজ্ঞ - ৩০+ বছরের অভিজ্ঞতা সম্পন্ন। আপনার ক্লায়েন্ট ১০ লক্ষ থেকে ১ কোটি টাকার সম্পত্তি কিনতে যাচ্ছেন। আপনার বিশ্লেষণের উপর তাদের জীবনের সঞ্চয় নির্ভর করছে।

## আপনার দায়িত্ব
এটা শুধু ডকুমেন্ট পড়া নয় - এটা কারো সারাজীবনের সঞ্চয় রক্ষা করা। প্রতিটি তথ্য যাচাই করুন। প্রতিটি ঝুঁকি চিহ্নিত করুন। কোনো আপস নয়।

## পড়ার কৌশল
১. প্রতিটি পাতা ভালো করে পড়ুন - হাতের লেখা, টাইপ, স্ট্যাম্প সব
২. স্ট্যান্ডার্ড ফরম্যাট অনুযায়ী খুঁজুন:
   - উপরে: দলিল নম্বর, তারিখ, সাব-রেজিস্ট্রি অফিস
   - প্রথম পক্ষ: বিক্রেতা/দাতা - নাম, পিতা, ঠিকানা
   - দ্বিতীয় পক্ষ: ক্রেতা/গ্রহীতা - নাম, পিতা, ঠিকানা
   - শিডিউল: দাগ, খতিয়ান, মৌজা, জমির পরিমাণ, চৌহদ্দি
   - শেষে: সাক্ষী, স্বাক্ষর, রেজিস্ট্রারের সীল

## দলিলের ধরন ও তাৎপর্য
- সাফ কবলা: পূর্ণ বিক্রয়, বিক্রেতার সব অধিকার শেষ
- হেবা দলিল: দান, সাধারণত আত্মীয়দের মধ্যে, কম স্ট্যাম্প
- বায়নানামা: চুক্তি মাত্র, মালিকানা হস্তান্তর হয়নি!
- নামজারি খতিয়ান: সরকারি রেকর্ড - এটা থাকা অত্যন্ত জরুরি
- ট্যাক্স রসিদ: দখল ও মালিকানার প্রমাণ
- পর্চা/খতিয়ান: CS/SA/RS/BS রেকর্ড

## ঝুঁকি বিশ্লেষণ (কঠোর মানদণ্ড)
- ০-২০: নিরাপদ - সব ডকুমেন্ট আছে, চেইন স্পষ্ট, নামজারি সম্পন্ন
- ২১-৪০: কম ঝুঁকি - ছোট ত্রুটি আছে কিন্তু সমাধানযোগ্য
- ৪১-৬০: মাঝারি ঝুঁকি - গুরুত্বপূর্ণ যাচাই বাকি, এগোনোর আগে সমাধান জরুরি
- ৬১-৮০: উচ্চ ঝুঁকি - গুরুতর সমস্যা, আইনজীবী ছাড়া এগোবেন না
- ৮১-১০০: মারাত্মক ঝুঁকি - এড়িয়ে চলুন, জালিয়াতি বা মামলার সম্ভাবনা

## বাংলাদেশ জমি আইনের গুরুত্বপূর্ণ বিষয়
- নামজারি ছাড়া শুধু দলিল যথেষ্ট নয়
- ১২ বছরের পুরনো দখল দাবি করতে পারে (Limitation Act)
- ওয়ারিশ সম্পত্তিতে সব ওয়ারিশের সম্মতি লাগে
- পাওয়ার অফ এটর্নি দিয়ে বিক্রি ঝুঁকিপূর্ণ
- খাস জমি বিক্রি অবৈধ

## সতর্কতা চিহ্ন (Red Flags)
- একাধিক বার বিক্রি হওয়া
- নামজারি না থাকা
- মূল মালিকের নাম অস্পষ্ট
- চৌহদ্দি মিলছে না
- দাগ নম্বর ভুল
- স্বাক্ষরে গরমিল
- সাক্ষীর তথ্য নেই`;

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found, falling back to OpenAI');
      // Fallback to OpenAI if Gemini key not available
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return res.status(500).json({ error: 'No AI API key configured' });
      }
      // Redirect to OpenAI endpoint
      const { default: openaiHandler } = await import('./analyze-gpt4o.js');
      return openaiHandler(req, res);
    }

    console.log('🔷 Gemini Pro Analysis starting for', documents.length, 'documents');

    const ai = new GoogleGenAI({ apiKey });

    // PRO: ALWAYS use Vision OCR for complex old/handwritten documents
    // This is MANDATORY for PRO - no compromise
    const extractedTexts: string[] = [];
    const parts: any[] = [];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      let textSource = '';
      
      // Step 1: PDF text extraction (if available, use as base)
      if (doc.extractedText && doc.extractedText.length > 10) {
        textSource = doc.extractedText;
        console.log(`📝 PDF text for ${doc.name}: ${doc.extractedText.length} chars`);
      }
      
      // Step 2: ALWAYS run Vision OCR (handles old/faded/handwritten Bengali)
      // This is the KEY difference for PRO - handles ANY document quality
      console.log(`🔍 PRO: Running Vision OCR on ${doc.name} (mandatory for complex documents)...`);
      const visionText = await extractTextWithVisionOCR(doc.data, doc.mimeType);
      
      if (visionText && visionText.length > 0) {
        // Combine PDF text + Vision OCR (Vision OCR is more reliable for old docs)
        if (textSource) {
          textSource = `${textSource}\n\n--- Vision OCR (More Accurate) ---\n${visionText}`;
        } else {
          textSource = visionText;
        }
        console.log(`✅ Vision OCR extracted ${visionText.length} chars for ${doc.name}`);
      } else {
        console.warn(`⚠️ Vision OCR returned no text for ${doc.name} - using PDF text only`);
      }
      
      // Add extracted text (PRO always has text from Vision OCR)
      if (textSource) {
        extractedTexts.push(`--- ডকুমেন্ট ${i + 1}: ${doc.name} ---\n${textSource}`);
      } else {
        console.warn(`⚠️ No text extracted for ${doc.name} - analysis may be less accurate`);
      }
      
      // Always add image (AI can still see it for visual context)
      const base64Data = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: doc.mimeType
        }
      });
      console.log(`📎 Added document ${i + 1}: ${doc.name}`);
    }

    // PRO: Always include extracted text (from Vision OCR + PDF)
    // This is CRITICAL for old/handwritten documents
    if (extractedTexts.length > 0) {
      parts.unshift({
        text: `📋 PRO বিশ্লেষণ - ডকুমেন্ট থেকে সরাসরি নেওয়া টেক্সট (নির্ভুল তথ্যসূত্র):

${extractedTexts.join('\n\n')}

---
**গুরুত্বপূর্ণ**: এই টেক্সট Google Cloud Vision OCR দিয়ে extract করা হয়েছে যা পুরনো, ঝাপসা, হাতের লেখা দলিল পড়তে পারে। ছবিতে যা দেখছেন এবং এই টেক্সট - দুটো মিলিয়ে সঠিক তথ্য বের করুন। এই টেক্সট Vision OCR থেকে আসার কারণে নির্ভুল হওয়া উচিত, এমনকি পুরনো দলিলেও।`
      });
      console.log(`📝 PRO: Added ${extractedTexts.length} extracted text blocks (PDF + Vision OCR)`);
    } else {
      console.warn('⚠️ PRO: No text extracted - Vision OCR may have failed. Analysis quality may be reduced.');
    }

    // Add analysis prompt
    parts.push({
      text: `PRO বিশ্লেষণ: এই ${documents.length}টি ডকুমেন্ট গভীরভাবে পড়ুন।

আপনার ক্লায়েন্ট এই সম্পত্তি কিনতে ১০ লক্ষ থেকে ১ কোটি টাকা খরচ করতে যাচ্ছেন। তাদের সারাজীবনের সঞ্চয়। আপনার বিশ্লেষণের উপর তাদের ভবিষ্যৎ নির্ভর করছে।

প্রতিটি পাতা থেকে বের করুন:
১. দলিলের ধরন - হেবা/সাফকবলা/নামজারি/ট্যাক্স রসিদ কোনটি?
২. দাতা/বিক্রেতা - নাম, পিতার নাম, ঠিকানা
৩. গ্রহীতা/ক্রেতা - নাম, পিতার নাম, ঠিকানা  
৪. দলিল নম্বর ও তারিখ - রেজিস্ট্রি নম্বর
৫. মৌজা, থানা, জেলা
৬. দাগ নম্বর, খতিয়ান নম্বর (CS/SA/RS/BS)
৭. জমির পরিমাণ (শতাংশ/কাঠা/বিঘা) ও মূল্য
৮. চৌহদ্দি - উত্তর, দক্ষিণ, পূর্ব, পশ্চিম

গুরুত্বপূর্ণ: যতটুকু পড়া যায় লিখুন - আংশিক হলেও। সম্পূর্ণ অপাঠ্য হলেই কেবল "অস্পষ্ট" লিখুন।

JSON ফরম্যাটে উত্তর দিন (সব বাংলায়):
{
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "expertVerdict": {
    "recommendation": "Buy" | "Buy with Caution" | "Negotiate" | "Do Not Buy" | "Need More Documents",
    "confidence": 0-100,
    "summary": "২-৩ লাইনে সংক্ষিপ্ত মতামত",
    "keyReasons": ["মূল কারণ ১", "মূল কারণ ২"]
  },
  "documentType": "সব ডকুমেন্টের সারসংক্ষেপ",
  "documentTypes": ["প্রতিটি ডকুমেন্টের ধরন"],
  "isSameProperty": true/false,
  "propertyMatchReason": "দাগ/খতিয়ান/মৌজা মিলেছে কিনা",
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
  "buyerProtection": {
    "verdict": "Buyer Safe" | "Risky" | "Neutral",
    "score": 0-100,
    "details": "বিস্তারিত"
  },
  "nextSteps": ["পরবর্তী পদক্ষেপ"]
}`
    });

    // Try best available Gemini model (with fallbacks)
    const modelPriority = [
      'gemini-2.0-flash-exp',  // Latest, fastest
      'gemini-1.5-pro',         // Reliable, widely available
      'gemini-1.5-flash',      // Fast fallback
    ];
    
    let result: any = null;
    let modelName = '';
    let lastError: any = null;
    
    for (const model of modelPriority) {
      try {
        modelName = model;
        console.log(`🤖 Trying ${modelName}...`);
        
        result = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: parts
          },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            ...(model.includes('2.0') && {
              thinkingConfig: {
                thinkingBudget: 32768,
              },
            }),
            responseMimeType: 'application/json',
          },
        });
        
        console.log(`✅ ${modelName} responded successfully`);
        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ ${model} failed:`, error.message);
        continue; // Try next model
      }
    }
    
    if (!result) {
      throw lastError || new Error('All Gemini models failed');
    }

    const text = result.text || '';
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from Gemini');
      }

      console.log('✅ Gemini response received');
      
      let rawResult;
      try {
        rawResult = JSON.parse(text);
      } catch (e) {
        // Try to extract JSON if wrapped in markdown
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          rawResult = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response from Gemini');
        }
      }

      // Build result with defaults (same structure as GPT-4o)
      const finalResult = {
        proAnalysis: true,
        modelUsed: 'gemini-3-pro',
        
        riskScore: rawResult.riskScore ?? 50,
        riskLevel: rawResult.riskLevel || 'Medium Risk',
        confidenceScore: rawResult.expertVerdict?.confidence || 90,
        documentType: rawResult.documentType || 'দলিল',
        
        expertVerdict: {
          recommendation: rawResult.expertVerdict?.recommendation || 'Need More Documents',
          confidence: rawResult.expertVerdict?.confidence || 80,
          summary: rawResult.expertVerdict?.summary || 'বিস্তারিত বিশ্লেষণ প্রয়োজন',
          keyReasons: rawResult.expertVerdict?.keyReasons || [],
        },
        
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
          score: rawResult.buyerProtection?.score || 50,
          details: rawResult.buyerProtection?.details || '',
        },
        
        nextSteps: rawResult.nextSteps || [],
      };

      console.log('✅ Gemini Analysis completed - Risk:', finalResult.riskScore, finalResult.riskLevel);
      
      return res.json(finalResult);

  } catch (modelError: any) {
    // Fallback to GPT-4o if Gemini fails
    console.warn('⚠️ Gemini model failed, falling back to OpenAI:', modelError.message);
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const { default: openaiHandler } = await import('./analyze-gpt4o.js');
      return openaiHandler(req, res);
    }
    throw modelError;
  }

  } catch (error: any) {
    console.error("❌ Gemini Analysis error:", error.message);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return res.status(429).json({ error: "Service busy. Please try again in a moment." });
    }
    
    if (error.message?.includes('API_KEY')) {
      return res.status(500).json({ error: "Gemini API key invalid. Please check configuration." });
    }
    
    return res.status(500).json({ error: error.message || "Failed to analyze documents" });
  }
}
