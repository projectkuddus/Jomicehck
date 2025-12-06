import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { rateLimit, getClientId } from './rate-limit.js';

// GPT-4o - State of the art model for document analysis
// Lowest hallucination rate, best for critical applications

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
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not found, falling back to Gemini');
      return res.status(500).json({ error: 'OpenAI API not configured' });
    }

    console.log('🔷 GPT-4o PRO Analysis starting for', documents.length, 'documents');

    const openai = new OpenAI({ apiKey });

    // Collect any extracted text from PDFs (more reliable than OCR)
    const extractedTexts: string[] = [];
    
    // Build message content with images
    const imageContents: OpenAI.ChatCompletionContentPart[] = [];
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const base64Data = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
      
      // Check if we have extracted text (bypasses OCR issues)
      if (doc.extractedText && doc.extractedText.length > 10) {
        extractedTexts.push(`--- ডকুমেন্ট ${i + 1}: ${doc.name} ---\n${doc.extractedText}`);
        console.log(`📝 Using extracted text for ${doc.name} (${doc.extractedText.length} chars)`);
      }
      
      imageContents.push({
        type: "image_url",
        image_url: {
          url: `data:${doc.mimeType};base64,${base64Data}`,
          detail: "high" // High detail for document reading
        }
      });
      console.log(`📎 Added document ${i + 1}: ${doc.name}`);
    }
    
    // If we have extracted text, add it as a text block for reference
    if (extractedTexts.length > 0) {
      imageContents.unshift({
        type: "text",
        text: `📋 PDF থেকে সরাসরি নেওয়া টেক্সট (নির্ভুল তথ্যসূত্র হিসেবে ব্যবহার করুন):\n\n${extractedTexts.join('\n\n')}\n\n---\n\nএই টেক্সট PDF থেকে সরাসরি extract করা হয়েছে। ছবিতে যা দেখছেন এবং এই টেক্সট - দুটো মিলিয়ে সঠিক তথ্য বের করুন।`
      });
      console.log(`📝 Added ${extractedTexts.length} extracted text blocks as reference`);
    }

    // Add the prompt - comprehensive PRO analysis
    imageContents.push({
      type: "text",
      text: `🔴 PRO বিশ্লেষণ - ${documents.length}টি ডকুমেন্ট

আপনার ক্লায়েন্ট এই সম্পত্তি কিনতে ১০ লক্ষ থেকে ১ কোটি টাকা খরচ করতে যাচ্ছেন। তাদের সারাজীবনের সঞ্চয়। আপনার বিশ্লেষণের উপর তাদের ভবিষ্যৎ নির্ভর করছে।

## ধাপ ১: প্রতিটি ডকুমেন্ট চিহ্নিত করুন
- কোনটি মূল দলিল? (সাফ কবলা/হেবা/বায়না)
- কোনটি সরকারি রেকর্ড? (নামজারি/পর্চা/খতিয়ান)
- কোনটি সাপোর্টিং ডকুমেন্ট? (ট্যাক্স রসিদ/DCR)

## ধাপ ২: মূল তথ্য বের করুন (প্রতিটি হুবহু লিখুন)
বিক্রেতা/দাতা:
- পূর্ণ নাম (যেমন লেখা আছে)
- পিতার নাম
- গ্রাম, পোস্ট, থানা, জেলা

ক্রেতা/গ্রহীতা:
- পূর্ণ নাম
- পিতার নাম  
- ঠিকানা

সম্পত্তি:
- মৌজা নাম ও জে.এল. নম্বর
- থানা/উপজেলা ও জেলা
- দাগ নম্বর (সব দাগ)
- খতিয়ান নম্বর (CS/SA/RS/BS কোনটি উল্লেখ করুন)
- জমির পরিমাণ (শতাংশ/কাঠা/বিঘা/একর)
- চৌহদ্দি (৪ দিক)

দলিল:
- দলিল নম্বর
- তারিখ (বাংলা ও ইংরেজি)
- সাব-রেজিস্ট্রি অফিস
- মূল্য ও স্ট্যাম্প শুল্ক

## ধাপ ৩: গভীর বিশ্লেষণ
১. মালিকানা চেইন: এই সম্পত্তি কীভাবে বর্তমান মালিকের কাছে এসেছে?
২. আইনি বৈধতা: দলিল কি সঠিকভাবে রেজিস্ট্রি হয়েছে?
৩. দখল প্রমাণ: ট্যাক্স রসিদ বা DCR আছে?
৪. নামজারি: সরকারি রেকর্ডে নাম আছে?
৫. সীমানা: চৌহদ্দি স্পষ্ট ও যাচাইযোগ্য?

## ধাপ ৪: ঝুঁকি চিহ্নিতকরণ
- এই সম্পত্তিতে কী কী সমস্যা আছে?
- কী কী ডকুমেন্ট নেই যা থাকা উচিত?
- কোথায় কোথায় অসঙ্গতি আছে?
- ক্রেতার জন্য কী ঝুঁকি?

## ধাপ ৫: সুপারিশ
- কি কেনা উচিত? (হ্যাঁ/না/শর্তসাপেক্ষে)
- কেনার আগে কী কী করতে হবে?
- কোথায় কোথায় যাচাই করতে হবে?

JSON ফরম্যাট:
{
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "expertVerdict": {
    "recommendation": "Buy" | "Buy with Caution" | "Negotiate" | "Do Not Buy" | "Need More Documents",
    "confidence": 0-100,
    "summary": "২-৩ লাইনে সংক্ষিপ্ত মতামত - স্পষ্ট ভাষায়",
    "keyReasons": ["মূল কারণ ১", "মূল কারণ ২", "মূল কারণ ৩"]
  },
  "documentType": "সব ডকুমেন্টের সারসংক্ষেপ",
  "documentTypes": ["প্রতিটি ডকুমেন্টের ধরন"],
  "isSameProperty": true/false,
  "propertyMatchReason": "দাগ/খতিয়ান/মৌজা মিলেছে কিনা - বিস্তারিত যুক্তি",
  "summary": {
    "mouza": "মৌজার নাম",
    "jla": "জে.এল. নম্বর",
    "thana": "থানা/উপজেলা",
    "district": "জেলা",
    "deedNo": "দলিল নম্বর",
    "date": "তারিখ",
    "registrationOffice": "সাব-রেজিস্ট্রি অফিস",
    "propertyAmount": "দলিলে উল্লেখিত মূল্য",
    "stampDuty": "স্ট্যাম্প শুল্ক",
    "sellerName": "বিক্রেতার পূর্ণ নাম",
    "sellerFather": "বিক্রেতার পিতার নাম",
    "sellerAddress": "বিক্রেতার ঠিকানা",
    "buyerName": "ক্রেতার পূর্ণ নাম",
    "buyerFather": "ক্রেতার পিতার নাম",
    "buyerAddress": "ক্রেতার ঠিকানা",
    "dagNo": "দাগ নম্বর (সব)",
    "khatianNo": "খতিয়ান নম্বর (CS/SA/RS/BS সহ)",
    "landAmount": "জমির পরিমাণ",
    "landType": "জমির ধরন (আবাদি/বাস্তু/পুকুর)",
    "witnesses": ["সাক্ষী ১", "সাক্ষী ২"],
    "boundaries": {
      "north": "উত্তর - কার জমি/কী আছে",
      "south": "দক্ষিণ",
      "east": "পূর্ব",
      "west": "পশ্চিম"
    }
  },
  "chainOfTitle": {
    "isComplete": true/false,
    "analysis": "মালিকানা কীভাবে হস্তান্তর হয়েছে - বিস্তারিত",
    "timeline": [
      {"date": "তারিখ", "event": "কী হয়েছিল", "from": "কার কাছ থেকে", "to": "কার কাছে", "deedReference": "দলিল নম্বর"}
    ],
    "gaps": ["যেখানে তথ্য নেই বা অস্পষ্ট"]
  },
  "riskBreakdown": {
    "legal": {"score": 0-100, "issues": ["আইনি সমস্যা"], "details": "বিস্তারিত"},
    "ownership": {"score": 0-100, "issues": ["মালিকানা সমস্যা"], "details": "বিস্তারিত"},
    "documentation": {"score": 0-100, "issues": ["ডকুমেন্ট সমস্যা"], "details": "বিস্তারিত"},
    "possession": {"score": 0-100, "issues": ["দখল সমস্যা"], "details": "বিস্তারিত"}
  },
  "redFlags": [
    {"severity": "Critical/High/Medium/Low", "title": "সমস্যার শিরোনাম", "description": "বিস্তারিত ব্যাখ্যা", "impact": "ক্রেতার উপর প্রভাব", "recommendation": "কী করবেন"}
  ],
  "goodPoints": ["✅ ভালো দিক: বিস্তারিত ব্যাখ্যা কেন এটা ভালো"],
  "badPoints": ["⚠️ সমস্যা: কী সমস্যা, কেন সমস্যা, কী করবেন"],
  "criticalIssues": ["🚨 গুরুতর: এটা না সমাধান করে এগোবেন না কারণ..."],
  "missingInfo": ["📋 অনুপস্থিত: কী নেই, কেন দরকার, কোথায় পাবেন"],
  "buyerProtection": {
    "verdict": "Buyer Safe" | "Seller Favored" | "Risky" | "Neutral",
    "score": 0-100,
    "details": "ক্রেতার অবস্থান বিশ্লেষণ",
    "protectionClauses": ["ক্রেতাকে সুরক্ষা দেয় এমন ধারা"],
    "riskClauses": ["ক্রেতার জন্য ঝুঁকিপূর্ণ ধারা"]
  },
  "actionItems": [
    {"priority": "Urgent/Important/Optional", "action": "কী করতে হবে", "reason": "কেন", "where": "কোথায় যাবেন", "cost": "আনুমানিক খরচ"}
  ],
  "documentsNeeded": [
    {"document": "ডকুমেন্টের নাম", "purpose": "কেন দরকার", "whereToGet": "কোথায় পাবেন", "priority": "Essential/Recommended/Optional"}
  ],
  "legalAdvice": "একজন অভিজ্ঞ আইনজীবী হিসেবে আপনার পরামর্শ - ৩-৪ লাইনে",
  "nextSteps": ["১. প্রথমে এটা করুন", "২. তারপর এটা", "৩. শেষে এটা"]
}`
    });

    console.log('🤖 Calling GPT-4o (State-of-the-Art)...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Best model for document understanding
      messages: [
        {
          role: "system",
          content: SYSTEM_INSTRUCTION
        },
        {
          role: "user",
          content: imageContents
        }
      ],
      max_tokens: 8192, // More tokens for detailed analysis
      temperature: 0.2, // Slightly higher to encourage reading attempts
      response_format: { type: "json_object" }
    });

    console.log('✅ GPT-4o response received');
    
    const text = response.choices[0]?.message?.content;
    
    if (!text) {
      throw new Error('Empty response from GPT-4o');
    }

    console.log('📄 Response length:', text.length);
    
    const rawResult = JSON.parse(text);
    
    // Build comprehensive PRO result
    const result = {
      proAnalysis: true,
      modelUsed: 'gpt-4o',
      
      riskScore: rawResult.riskScore ?? 50,
      riskLevel: rawResult.riskLevel || 'Medium Risk',
      confidenceScore: rawResult.expertVerdict?.confidence || 90,
      documentType: rawResult.documentType || 'দলিল',
      
      // Expert verdict - the most important for PRO
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
        stampDuty: rawResult.summary?.stampDuty || '',
        sellerName: rawResult.summary?.sellerName || '',
        sellerFather: rawResult.summary?.sellerFather || '',
        sellerAddress: rawResult.summary?.sellerAddress || '',
        buyerName: rawResult.summary?.buyerName || '',
        buyerFather: rawResult.summary?.buyerFather || '',
        buyerAddress: rawResult.summary?.buyerAddress || '',
        witnesses: rawResult.summary?.witnesses || [],
        propertyDescription: rawResult.summary?.propertyDescription || '',
        dagNo: rawResult.summary?.dagNo || '',
        khatianNo: rawResult.summary?.khatianNo || '',
        landAmount: rawResult.summary?.landAmount || '',
        landType: rawResult.summary?.landType || '',
        boundaries: rawResult.summary?.boundaries || null,
      },
      
      // Chain of title - crucial for ownership verification
      chainOfTitle: {
        isComplete: rawResult.chainOfTitle?.isComplete ?? false,
        analysis: rawResult.chainOfTitle?.analysis || rawResult.chainOfTitleAnalysis || '',
        timeline: rawResult.chainOfTitle?.timeline || rawResult.chainOfTitleTimeline || [],
        gaps: rawResult.chainOfTitle?.gaps || [],
      },
      chainOfTitleAnalysis: rawResult.chainOfTitle?.analysis || rawResult.chainOfTitleAnalysis || '',
      chainOfTitleTimeline: rawResult.chainOfTitle?.timeline || rawResult.chainOfTitleTimeline || [],
      
      // Risk breakdown by category
      riskBreakdown: {
        legal: rawResult.riskBreakdown?.legal || { score: 50, issues: [], details: '' },
        ownership: rawResult.riskBreakdown?.ownership || { score: 50, issues: [], details: '' },
        documentation: rawResult.riskBreakdown?.documentation || { score: 50, issues: [], details: '' },
        possession: rawResult.riskBreakdown?.possession || { score: 50, issues: [], details: '' },
      },
      
      // Red flags with severity
      redFlags: rawResult.redFlags || [],
      
      goodPoints: rawResult.goodPoints || [],
      badPoints: rawResult.badPoints || [],
      criticalIssues: rawResult.criticalIssues || [],
      missingInfo: rawResult.missingInfo || [],
      
      buyerProtection: {
        verdict: rawResult.buyerProtection?.verdict || 'Neutral',
        score: rawResult.buyerProtection?.score || 50,
        details: rawResult.buyerProtection?.details || '',
        protectionClauses: rawResult.buyerProtection?.protectionClauses || [],
        riskClauses: rawResult.buyerProtection?.riskClauses || [],
      },
      
      // Actionable items
      actionItems: rawResult.actionItems || [],
      documentsNeeded: rawResult.documentsNeeded || [],
      
      // Legal advice
      legalAdvice: rawResult.legalAdvice || '',
      
      nextSteps: rawResult.nextSteps || [],
      verificationChecklist: rawResult.verificationChecklist || [],
    };

    console.log('✅ GPT-4o Analysis completed - Risk:', result.riskScore, result.riskLevel);
    
    return res.json(result);

  } catch (error: any) {
    console.error("❌ GPT-4o Analysis error:", error.message);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return res.status(429).json({ error: "Service busy. Please try again in a moment." });
    }
    
    if (error.message?.includes('invalid_api_key')) {
      return res.status(500).json({ error: "OpenAI API key invalid. Please check configuration." });
    }
    
    return res.status(500).json({ error: error.message || "Failed to analyze documents" });
  }
}

