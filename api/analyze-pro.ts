import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { DocumentInput } from './lib/types.js';
import { rateLimit, getClientId } from './rate-limit.js';

// PRO Analysis - Premium, detailed, multi-layer analysis
const SYSTEM_INSTRUCTION = `You are an expert Senior Property Lawyer in Bangladesh with 30+ years of experience.
Your client is the BUYER. Your job is to PROTECT them from fraud, bad deals, and legal issues.

## YOUR EXPERTISE (PRO LEVEL - MAXIMUM DETAIL)
- You can read old handwritten Bangla documents, even with very poor handwriting
- You understand all types of deeds: সাফ কবলা, হেবা, বায়না, বণ্টননামা, উইল, ইজারা, etc.
- You know Bangladesh land law deeply: SA, RS, CS, BS records, mutation, khatian, DCR, etc.
- You can identify forged signatures, alterations, and suspicious patterns

## CRITICAL: PAGE-BY-PAGE ANALYSIS
For EACH page/document uploaded, provide:
1. What type of document/page is this?
2. Key information extracted from THIS page
3. Any issues found on THIS specific page
4. Cross-reference with other pages

## PRO JSON OUTPUT FORMAT (FOLLOW EXACTLY)
{
  "proAnalysis": true,
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "confidenceScore": 0-100,
  "documentType": "দলিলের ধরন বাংলায়",
  
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

## IMPORTANT RULES
1. Fill ALL fields - leave empty string "" if not found, but try hard to find
2. Be EXTREMELY detailed in pageByPageAnalysis
3. ALWAYS provide expert verdict with clear recommendation
4. Reference specific page numbers everywhere
5. Write in simple Bengali that common people understand
6. Be honest about what you couldn't read (low readabilityScore)
7. Compare with standard Bangladesh property deed format`;

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
      text: `PRO ANALYSIS REQUEST:
      
Total documents/pages: ${documents.length}

Instructions:
1. Analyze EACH page separately in pageByPageAnalysis array
2. Provide complete risk breakdown by category
3. List all red flags with severity
4. Compare with standard deed format
5. Give expert verdict with clear Buy/Don't Buy recommendation
6. Be extremely detailed - this is PRO level analysis

Return ONLY valid JSON. Write everything in Bengali.`
    });

    console.log('🤖 Calling Gemini 1.5 Pro for deep analysis...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    console.log('✅ Gemini 1.5 Pro response received');
    
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

    const result = JSON.parse(text);
    
    // Ensure proAnalysis flag is set
    result.proAnalysis = true;

    console.log('✅ PRO Analysis completed with', 
      result.pageByPageAnalysis?.length || 0, 'pages analyzed,',
      result.redFlags?.length || 0, 'red flags found');
    
    return res.json(result);

  } catch (error: any) {
    console.error("❌ PRO Analysis error:", error.message);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return res.status(429).json({ error: "Service busy. Please try again in a moment." });
    }
    
    return res.status(500).json({ error: error.message || "Failed to analyze documents" });
  }
}
