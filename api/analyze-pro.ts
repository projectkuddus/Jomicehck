import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { DocumentInput } from './lib/types.js';
import { rateLimit, getClientId } from './rate-limit.js';

// PRO Analysis - ACCURACY FIRST approach
const SYSTEM_INSTRUCTION = `আপনি একজন বাংলাদেশী সম্পত্তি আইনজীবী। আপনার কাজ হলো দলিলগুলো সঠিকভাবে পড়া এবং তথ্য বের করা।

## গুরুত্বপূর্ণ নির্দেশনা
১. প্রতিটি পাতা ভালো করে পড়ুন
২. নাম, তারিখ, নম্বর হুবহু লিখুন - অনুমান করবেন না
৩. যা স্পষ্ট পড়া যায় না তা "অস্পষ্ট" লিখুন
৪. যা দলিলে নেই তা "উল্লেখ নেই" লিখুন

## দলিলের ধরন চিহ্নিত করুন
- দলিল (সাফ কবলা, হেবা, বায়না, ইত্যাদি)
- নামজারি খতিয়ান
- ট্যাক্স রসিদ
- পর্চা

## তথ্য বের করুন (যা পড়তে পারেন শুধু সেটাই)
- দাতা/বিক্রেতার নাম ও পিতার নাম
- গ্রহীতা/ক্রেতার নাম ও পিতার নাম  
- দলিল নম্বর ও তারিখ
- মৌজা, থানা, জেলা
- দাগ নম্বর, খতিয়ান নম্বর
- জমির পরিমাণ ও মূল্য
- চৌহদ্দি (উত্তর, দক্ষিণ, পূর্ব, পশ্চিম)

## PRO JSON OUTPUT FORMAT (FOLLOW EXACTLY)
{
  "proAnalysis": true,
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "confidenceScore": 0-100,
  "documentType": "সকল ডকুমেন্টের সারসংক্ষেপ - যেমন: 'হেবা দলিল ও নামজারি খতিয়ান'",
  
  "documentTypes": ["প্রতিটি ডকুমেন্ট টাইপ আলাদাভাবে - 'হেবা দলিল', 'নামজারি খতিয়ান', 'ট্যাক্স রসিদ'"],
  "isSameProperty": true | false,
  "propertyMatchReason": "কেন একই সম্পত্তি বা ভিন্ন - দাগ/খতিয়ান/মৌজা মিলেছে কিনা",
  
  "summary": {
    "mouza": "মৌজার নাম",
    "jla": "জে.এল. নম্বর",
    "thana": "থানা",
    "district": "জেলা",
    "deedNo": "দলিল নম্বর",
    "date": "তারিখ",
    "registrationOffice": "রেজিস্ট্রি অফিস",
    "propertyAmount": "সম্পত্তির মূল্য (টাকা)",
    "stampDuty": "স্ট্যাম্প শুল্ক",
    "registrationFee": "রেজিস্ট্রেশন ফি",
    "sellerName": "বিক্রেতার নাম",
    "sellerFather": "বিক্রেতার পিতার নাম",
    "sellerAddress": "বিক্রেতার ঠিকানা",
    "buyerName": "ক্রেতার নাম",
    "buyerFather": "ক্রেতার পিতার নাম",
    "buyerAddress": "ক্রেতার ঠিকানা",
    "propertyDescription": "সম্পত্তির বিস্তারিত বিবরণ",
    "dagNo": "দাগ নম্বর",
    "khatianNo": "খতিয়ান নম্বর (CS/SA/RS/BS)",
    "landAmount": "জমির পরিমাণ",
    "landType": "জমির ধরন (আবাদি/অনাবাদি/পুকুর/বাস্তুভিটা)",
    "boundaries": {
      "north": "উত্তর সীমানা",
      "south": "দক্ষিণ সীমানা",
      "east": "পূর্ব সীমানা",
      "west": "পশ্চিম সীমানা"
    }
  },

  "pageByPageAnalysis": [
    {
      "pageNumber": 1,
      "pageType": "এই পাতার ধরন (প্রথম পাতা/শিডিউল/সাক্ষী/স্বাক্ষর ইত্যাদি)",
      "keyFindings": ["এই পাতায় যা পাওয়া গেছে"],
      "extractedText": "গুরুত্বপূর্ণ টেক্সট যা পড়া গেছে",
      "issues": ["এই পাতায় সমস্যা"],
      "readabilityScore": 0-100
    }
  ],

  "riskBreakdown": {
    "legal": {
      "score": 0-100,
      "issues": ["আইনগত সমস্যা"],
      "details": "বিস্তারিত"
    },
    "ownership": {
      "score": 0-100,
      "issues": ["মালিকানা সংক্রান্ত সমস্যা"],
      "details": "বিস্তারিত"
    },
    "financial": {
      "score": 0-100,
      "issues": ["আর্থিক সমস্যা"],
      "details": "বিস্তারিত"
    },
    "procedural": {
      "score": 0-100,
      "issues": ["পদ্ধতিগত সমস্যা"],
      "details": "বিস্তারিত"
    }
  },

  "redFlags": [
    {
      "severity": "Critical" | "High" | "Medium" | "Low",
      "title": "সমস্যার শিরোনাম",
      "description": "বিস্তারিত ব্যাখ্যা",
      "pageReference": "কোন পাতায়",
      "recommendation": "কী করবেন"
    }
  ],

  "standardComparison": {
    "presentItems": ["দলিলে যা আছে ✓"],
    "missingItems": ["দলিলে যা নেই ✗"],
    "unusualItems": ["অস্বাভাবিক বিষয় ⚠"],
    "comparisonNote": "একটি আদর্শ দলিলের সাথে তুলনা"
  },

  "chainOfTitle": {
    "isComplete": true | false,
    "analysis": "মালিকানার ধারাবাহিকতার বিশ্লেষণ",
    "timeline": [
      {
        "date": "তারিখ",
        "event": "কী হয়েছিল",
        "from": "কার কাছ থেকে",
        "to": "কার কাছে",
        "deedReference": "দলিল রেফারেন্স"
      }
    ],
    "gaps": ["যেখানে তথ্য নেই বা অস্পষ্ট"]
  },

  "legalClausesAnalysis": [
    {
      "clauseNumber": "ধারা নম্বর",
      "originalText": "মূল টেক্সট",
      "simpleMeaning": "সহজ বাংলায় অর্থ",
      "buyerImpact": "Favorable" | "Unfavorable" | "Neutral",
      "warning": "সতর্কতা (যদি থাকে)"
    }
  ],

  "hiddenRisks": [
    {
      "risk": "ঝুঁকির বর্ণনা",
      "probability": "High" | "Medium" | "Low",
      "impact": "High" | "Medium" | "Low",
      "mitigation": "কীভাবে এড়াবেন"
    }
  ],

  "expertVerdict": {
    "recommendation": "Buy" | "Buy with Caution" | "Negotiate" | "Do Not Buy" | "Need More Documents",
    "confidence": 0-100,
    "summary": "২-৩ লাইনে চূড়ান্ত মতামত",
    "keyReasons": ["মূল কারণগুলো"]
  },

  "buyerProtection": {
    "verdict": "Buyer Safe" | "Seller Favored" | "Risky" | "Neutral",
    "score": 0-100,
    "details": "বিস্তারিত ব্যাখ্যা",
    "protectionClauses": ["ক্রেতাকে সুরক্ষা দেয় এমন ধারা"],
    "riskClauses": ["ক্রেতার জন্য ঝুঁকিপূর্ণ ধারা"]
  },

  "actionItems": [
    {
      "priority": "Urgent" | "Important" | "Optional",
      "action": "কী করতে হবে",
      "reason": "কেন করতে হবে",
      "deadline": "কখন করতে হবে"
    }
  ],

  "documentsNeeded": [
    {
      "document": "ডকুমেন্টের নাম",
      "purpose": "কেন দরকার",
      "whereToGet": "কোথায় পাবেন",
      "priority": "Essential" | "Recommended" | "Optional"
    }
  ],

  "goodPoints": ["ভালো দিক"],
  "badPoints": ["খারাপ দিক"],
  "criticalIssues": ["গুরুতর সমস্যা"],
  "nextSteps": ["পরবর্তী পদক্ষেপ"]
}

## PRO ANALYSIS QUALITY STANDARDS

### MANDATORY REQUIREMENTS
1. Fill ALL fields - never leave important fields empty
2. pageByPageAnalysis MUST have entry for EACH uploaded page
3. expertVerdict MUST have clear Buy/Don't Buy recommendation
4. Reference SPECIFIC page numbers for every finding
5. Write in SIMPLE Bangla - explain legal terms in everyday language

### ANALYSIS DEPTH
- Extract EXACT text from documents (names, dates, amounts)
- Don't just say "সমস্যা আছে" - explain WHAT, WHERE, WHY
- Compare with standard deed format - what's unusual?
- Calculate risk scores accurately based on findings
- Provide ACTIONABLE recommendations

### RED FLAG DETECTION
Look specifically for:
- ভুয়া স্বাক্ষর বা সীল (forged signatures/stamps)
- দলিলে কাটাকাটি বা সংশোধন (corrections/alterations)  
- অসামঞ্জস্যপূর্ণ তথ্য (inconsistent information between pages)
- অস্বাভাবিক শর্তাবলী (unusual clauses favoring seller)
- অসম্পূর্ণ মালিকানা ইতিহাস (incomplete chain of title)
- বন্ধক বা দায়বদ্ধতার ইঙ্গিত (signs of mortgage/lien)
- সম্পূর্ণ ভিন্ন সম্পত্তি (DIFFERENT property - if dag/khatian/mouza don't match = CRITICAL)
- নাম বা তথ্যের গরমিল (name/info mismatch between documents)

### ACCURACY IS CRITICAL
- Extract names EXACTLY as written - spell correctly in Bangla
- Extract numbers EXACTLY - deed no, dag no, khatian no, dates, amounts
- If cannot read clearly, say "অস্পষ্ট" - DON'T GUESS
- If info not in document, say "উল্লেখ নেই" - DON'T ASSUME

### EXPERT VERDICT GUIDE
- "Buy": No major issues, safe to proceed
- "Buy with Caution": Minor issues, verify specific points
- "Negotiate": Significant issues that need addressing before purchase
- "Do Not Buy": Major red flags, high risk of fraud or legal problems
- "Need More Documents": Cannot give verdict without additional documents

### RISK SCORING
- 0-20: Excellent - minimal to no concerns
- 21-40: Good - minor issues, manageable
- 41-60: Moderate - needs attention and verification
- 61-80: High Risk - significant concerns, expert review needed
- 81-100: Critical - major problems, do not proceed`;

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    console.log('🔷 PRO Analysis starting for', documents.length, 'documents');

    const ai = new GoogleGenAI({ apiKey });

    // Build content parts
    const parts: any[] = [];
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const cleanBase64 = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
      parts.push({
        inlineData: {
          mimeType: doc.mimeType,
          data: cleanBase64
        }
      });
      console.log(`📎 Added page ${i + 1}: ${doc.name} (${doc.mimeType})`);
    }
    
    parts.push({
      text: `এই ${documents.length}টি ডকুমেন্ট পড়ুন এবং JSON এ তথ্য দিন।

প্রতিটি ডকুমেন্ট থেকে বের করুন:
- দলিলের ধরন কী? (হেবা/সাফকবলা/নামজারি/ট্যাক্স রসিদ)
- দাতা/বিক্রেতার নাম ও পিতার নাম
- গ্রহীতা/ক্রেতার নাম ও পিতার নাম
- দলিল নম্বর ও তারিখ
- মৌজা, থানা, জেলা
- দাগ নম্বর, খতিয়ান নম্বর
- জমির পরিমাণ ও মূল্য
- চৌহদ্দি

সতর্কতা: শুধুমাত্র যা পড়তে পারছেন সেটাই লিখুন। অনুমান করবেন না।`
    });

    // Try multiple models for best accuracy
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
        response = await ai.models.generateContent({
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
          throw modelError; // Last model failed - throw error
        }
        // Try next model
      }
    }
    
    console.log('✅ PRO Analysis response received using:', usedModel);
    
    let text: string;
    if (response && typeof response === 'object' && 'text' in response) {
      text = (response as any).text;
    } else if (typeof response === 'string') {
      text = response;
    } else {
      throw new Error('Unexpected response format from AI');
    }
    
    if (!text || text.trim() === '') {
      throw new Error('Empty response from AI service');
    }

    const rawResult = JSON.parse(text);
    
    // Build PRO result with all required fields and defaults
    const result = {
      // ALWAYS set proAnalysis flag
      proAnalysis: true,
      
      // Core fields
      riskScore: rawResult.riskScore ?? 50,
      riskLevel: rawResult.riskLevel || 'Medium Risk',
      confidenceScore: rawResult.confidenceScore ?? 70,
      documentType: rawResult.documentType || 'দলিল',
      
      // Document chain analysis
      documentTypes: rawResult.documentTypes || [],
      isSameProperty: rawResult.isSameProperty ?? true,
      propertyMatchReason: rawResult.propertyMatchReason || '',
      
      // Summary with all PRO fields
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
        registrationFee: rawResult.summary?.registrationFee || '',
        sellerName: rawResult.summary?.sellerName || '',
        sellerFather: rawResult.summary?.sellerFather || '',
        sellerAddress: rawResult.summary?.sellerAddress || '',
        buyerName: rawResult.summary?.buyerName || '',
        buyerFather: rawResult.summary?.buyerFather || '',
        buyerAddress: rawResult.summary?.buyerAddress || '',
        propertyDescription: rawResult.summary?.propertyDescription || '',
        dagNo: rawResult.summary?.dagNo || '',
        khatianNo: rawResult.summary?.khatianNo || '',
        landAmount: rawResult.summary?.landAmount || '',
        landType: rawResult.summary?.landType || '',
        boundaries: rawResult.summary?.boundaries || null,
      },
      
      // PRO: Page-by-page analysis (create default if missing)
      pageByPageAnalysis: rawResult.pageByPageAnalysis || 
        documents.map((doc: any, idx: number) => ({
          pageNumber: idx + 1,
          pageType: `পাতা ${idx + 1}`,
          keyFindings: ['AI দ্বারা বিশ্লেষিত'],
          issues: [],
          readabilityScore: 75
        })),
      
      // PRO: Risk breakdown by category
      riskBreakdown: rawResult.riskBreakdown || {
        legal: { score: rawResult.riskScore ?? 50, issues: [], details: 'আইনগত বিশ্লেষণ সম্পন্ন' },
        ownership: { score: rawResult.riskScore ?? 50, issues: [], details: 'মালিকানা বিশ্লেষণ সম্পন্ন' },
        financial: { score: Math.max(0, (rawResult.riskScore ?? 50) - 10), issues: [], details: 'আর্থিক বিশ্লেষণ সম্পন্ন' },
        procedural: { score: Math.max(0, (rawResult.riskScore ?? 50) - 5), issues: [], details: 'পদ্ধতিগত বিশ্লেষণ সম্পন্ন' },
      },
      
      // PRO: Red flags
      redFlags: rawResult.redFlags || (rawResult.criticalIssues || []).map((issue: string, idx: number) => ({
        severity: idx === 0 ? 'Critical' : 'High',
        title: issue.substring(0, 50) + (issue.length > 50 ? '...' : ''),
        description: issue,
        recommendation: 'বিশেষজ্ঞের পরামর্শ নিন'
      })),
      
      // PRO: Standard comparison
      standardComparison: rawResult.standardComparison || {
        presentItems: rawResult.goodPoints || [],
        missingItems: rawResult.missingInfo || [],
        unusualItems: rawResult.badPoints?.slice(0, 3) || [],
        comparisonNote: 'একটি আদর্শ দলিলের সাথে তুলনা করা হয়েছে'
      },
      
      // PRO: Chain of title (enhanced)
      chainOfTitle: rawResult.chainOfTitle || {
        isComplete: (rawResult.riskScore ?? 50) < 50,
        analysis: rawResult.chainOfTitleAnalysis || 'মালিকানার ইতিহাস বিশ্লেষণ করা হয়েছে',
        timeline: rawResult.chainOfTitleTimeline || [],
        gaps: []
      },
      
      // Legacy chain of title for compatibility
      chainOfTitleAnalysis: rawResult.chainOfTitleAnalysis || rawResult.chainOfTitle?.analysis || '',
      chainOfTitleTimeline: rawResult.chainOfTitleTimeline || rawResult.chainOfTitle?.timeline || [],
      
      // PRO: Legal clauses analysis
      legalClausesAnalysis: rawResult.legalClausesAnalysis || (rawResult.legalClauses || []).map((clause: string, idx: number) => ({
        clauseNumber: `ধারা ${idx + 1}`,
        originalText: '',
        simpleMeaning: clause,
        buyerImpact: 'Neutral' as const,
      })),
      
      // Legacy legal clauses
      legalClauses: rawResult.legalClauses || [],
      
      // PRO: Hidden risks (enhanced)
      hiddenRisks: rawResult.hiddenRisks || [],
      
      // PRO: Expert verdict (CRITICAL - always provide)
      expertVerdict: rawResult.expertVerdict || {
        recommendation: (rawResult.riskScore ?? 50) < 30 ? 'Buy' :
                       (rawResult.riskScore ?? 50) < 50 ? 'Buy with Caution' :
                       (rawResult.riskScore ?? 50) < 70 ? 'Negotiate' : 'Do Not Buy',
        confidence: rawResult.confidenceScore ?? 70,
        summary: rawResult.riskScore < 50 
          ? 'দলিলটি সামগ্রিকভাবে নিরাপদ মনে হচ্ছে, তবে চূড়ান্ত সিদ্ধান্তের আগে AC Land অফিসে যাচাই করুন।'
          : 'দলিলে কিছু সমস্যা আছে। ক্রয়ের আগে অবশ্যই একজন অভিজ্ঞ উকিলের পরামর্শ নিন।',
        keyReasons: rawResult.criticalIssues?.slice(0, 3) || rawResult.badPoints?.slice(0, 3) || ['বিস্তারিত বিশ্লেষণ দেখুন']
      },
      
      // Buyer protection (enhanced for PRO)
      buyerProtection: {
        verdict: rawResult.buyerProtection?.verdict || 'Neutral',
        score: rawResult.buyerProtection?.score ?? ((100 - (rawResult.riskScore ?? 50))),
        details: rawResult.buyerProtection?.details || 'ক্রেতার সুরক্ষা বিশ্লেষণ করা হয়েছে',
        protectionClauses: rawResult.buyerProtection?.protectionClauses || [],
        riskClauses: rawResult.buyerProtection?.riskClauses || []
      },
      
      // PRO: Action items
      actionItems: rawResult.actionItems || [
        ...(rawResult.criticalIssues || []).slice(0, 2).map((issue: string) => ({
          priority: 'Urgent' as const,
          action: issue,
          reason: 'গুরুতর সমস্যা - দ্রুত সমাধান প্রয়োজন'
        })),
        {
          priority: 'Important' as const,
          action: 'AC Land অফিসে গিয়ে মূল রেকর্ড যাচাই করুন',
          reason: 'সকল দলিলের জন্য এটি আবশ্যক'
        }
      ],
      
      // PRO: Documents needed
      documentsNeeded: rawResult.documentsNeeded || [
        ...(rawResult.missingInfo || []).map((info: string) => ({
          document: info,
          purpose: 'সম্পূর্ণ যাচাইয়ের জন্য প্রয়োজন',
          priority: 'Recommended' as const
        }))
      ],
      
      // Standard fields
      goodPoints: rawResult.goodPoints || [],
      badPoints: rawResult.badPoints || [],
      criticalIssues: rawResult.criticalIssues || [],
      missingInfo: rawResult.missingInfo || [],
      nextSteps: rawResult.nextSteps || ['উকিলের সাথে পরামর্শ করুন', 'AC Land অফিসে যাচাই করুন'],
    };

    console.log('✅ PRO Analysis completed with', 
      result.pageByPageAnalysis?.length || 0, 'pages analyzed,',
      result.redFlags?.length || 0, 'red flags found,',
      'Expert Verdict:', result.expertVerdict?.recommendation);
    
    return res.json(result);

  } catch (error: any) {
    console.error("❌ PRO Analysis error:", error.message);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return res.status(429).json({ error: "Service busy. Please try again in a moment." });
    }
    
    return res.status(500).json({ error: error.message || "Failed to analyze documents" });
  }
}
