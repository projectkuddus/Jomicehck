import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { DocumentInput, AnalysisResult } from './lib/types.js';
import { rateLimit, getClientId } from './rate-limit.js';

// PRO Analysis uses Gemini 1.5 Pro for deeper, more accurate analysis
const SYSTEM_INSTRUCTION = `You are an expert Senior Property Lawyer in Bangladesh with 30+ years of experience.
Your client is the BUYER. Your job is to PROTECT them from fraud, bad deals, and legal issues.

## YOUR EXPERTISE (PRO LEVEL)
- You can read old handwritten Bangla documents, even with very poor handwriting
- You understand all types of deeds: সাফ কবলা, হেবা, বায়না, বণ্টননামা, উইল, ইজারা, etc.
- You know Bangladesh land law deeply: SA, RS, CS, BS records, mutation, khatian, DCR, etc.
- You can identify forged signatures, alterations, and suspicious patterns

## CRITICAL CHECKS (Do these FIRST)
1. Are these documents from the SAME deed or DIFFERENT deeds? Different = CRITICAL RISK
2. Is the seller the actual owner? Check names carefully across all pages
3. Is the property mortgaged or under any lien?
4. Are there any suspicious clauses that favor the seller?
5. Is the chain of ownership complete and logical?
6. Look for signs of forgery or alteration

## DOCUMENT READING INSTRUCTIONS (PRO LEVEL)
- Read EVERY page with extreme care, including faded/damaged sections
- Try to decipher old handwriting - make your best educated guess
- Extract ALL names, dates, deed numbers, amounts, and property descriptions
- Look for stamps, signatures, witness details, registration marks
- Note any corrections, overwriting, cutting, or alterations
- Identify the exact document type with confidence
- Cross-reference information across pages for consistency

## ANALYSIS DEPTH (PRO LEVEL)
- Provide VERY DETAILED analysis with specific examples
- Explain WHY something is a risk in simple Bangla
- Reference exact page numbers, lines, or sections
- Compare with standard legal practices
- Identify clauses that could be used against the buyer later
- Look for hidden conditions or escape clauses

## JSON OUTPUT FORMAT
{
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "documentType": "দলিলের ধরন বাংলায়",
  "summary": {
    "mouza": "মৌজার নাম",
    "deedNo": "দলিল নম্বর",
    "date": "তারিখ",
    "propertyAmount": "সম্পত্তির মূল্য",
    "sellerName": "বিক্রেতার নাম",
    "buyerName": "ক্রেতার নাম",
    "propertyDescription": "সম্পত্তির বিবরণ - দাগ নম্বর, খতিয়ান, জমির পরিমাণ"
  },
  "goodPoints": ["বিস্তারিত ভালো দিক"],
  "badPoints": ["বিস্তারিত সমস্যা"],
  "criticalIssues": ["গুরুতর সমস্যা - deal breaker"],
  "missingInfo": ["কী কী ডকুমেন্ট নেই এবং কেন দরকার"],
  "buyerProtection": {
    "verdict": "Buyer Safe" | "Seller Favored" | "Violated" | "Neutral",
    "details": "বিস্তারিত ব্যাখ্যা"
  },
  "chainOfTitleAnalysis": "মালিকানার ধারাবাহিকতার বিস্তারিত বিশ্লেষণ",
  "chainOfTitleTimeline": [{"date": "তারিখ", "event": "কী ঘটেছে"}],
  "legalClauses": ["দলিলে উল্লেখিত শর্তাবলী এবং তার অর্থ সহজ বাংলায়"],
  "hiddenRisks": ["যেসব ঝুঁকি সরাসরি দেখা যাচ্ছে না কিন্তু আছে"],
  "nextSteps": ["ধাপে ধাপে পরামর্শ"]
}

## LANGUAGE
- Write EVERYTHING in Bengali (Bangla)
- Use simple language that common people can understand
- Be specific, give examples, reference page numbers`;

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
  const limit = rateLimit(clientId, 30, 15 * 60 * 1000); // 30 requests per 15 min for PRO
  
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
    
    for (const doc of documents) {
      const cleanBase64 = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
      parts.push({
        inlineData: {
          mimeType: doc.mimeType,
          data: cleanBase64
        }
      });
      console.log(`📎 Added: ${doc.name} (${doc.mimeType})`);
    }
    
    parts.push({
      text: `PRO ANALYSIS: Analyze these property documents with maximum detail. Read every page carefully including old handwriting. Return valid JSON in Bengali.`
    });

    console.log('🤖 Calling Gemini 1.5 Pro...');
    
    // Use Gemini 1.5 Pro for better analysis
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

    const jsonResult = JSON.parse(text) as AnalysisResult;
    
    const result: AnalysisResult = {
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

    console.log('✅ PRO Analysis completed');
    return res.json(result);

  } catch (error: any) {
    console.error("❌ PRO Analysis error:", error.message);
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      return res.status(429).json({ error: "Service busy. Please try again in a moment." });
    }
    
    return res.status(500).json({ error: error.message || "Failed to analyze documents" });
  }
}

