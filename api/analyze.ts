import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { rateLimit, getClientId } from './rate-limit.js';

// PLUS Analysis - Uses GPT-4o-mini (fast, accurate, cost-effective)
// No more Gemini hallucinations

const SYSTEM_INSTRUCTION = `আপনি একজন অভিজ্ঞ বাংলাদেশী সম্পত্তি আইনজীবী। আপনার কাজ হলো দলিল সঠিকভাবে পড়া।

## গুরুত্বপূর্ণ নিয়ম
১. প্রতিটি পাতা মনোযোগ দিয়ে পড়ুন
২. নাম, তারিখ, নম্বর হুবহু লিখুন - কোনো অনুমান নয়
৩. যা পড়া যাচ্ছে না = "অস্পষ্ট"
৪. যা নেই = "উল্লেখ নেই"

## দলিলের ধরন
- হেবা দলিল (দান) - স্বামী-স্ত্রী বা আত্মীয়দের মধ্যে
- সাফ কবলা (বিক্রয়)
- বায়নানামা
- নামজারি খতিয়ান
- ট্যাক্স/কর রসিদ

## ঝুঁকি মূল্যায়ন
- ০-২০: নিরাপদ
- ২১-৪০: কম ঝুঁকি
- ৪১-৬০: মাঝারি
- ৬১-৮০: উচ্চ ঝুঁকি
- ৮১-১০০: মারাত্মক`;

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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API not configured' });
    }

    console.log('🔷 PLUS Analysis (GPT-4o-mini) starting for', documents.length, 'documents');

    const openai = new OpenAI({ apiKey });

    // Build message content with images
    const imageContents: OpenAI.ChatCompletionContentPart[] = [];
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const base64Data = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
      
      imageContents.push({
        type: "image_url",
        image_url: {
          url: `data:${doc.mimeType};base64,${base64Data}`,
          detail: "high"
        }
      });
      console.log(`📎 Added document ${i + 1}: ${doc.name}`);
    }

    imageContents.push({
      type: "text",
      text: `এই ${documents.length}টি ডকুমেন্ট বিশ্লেষণ করুন।

প্রতিটি ডকুমেন্ট থেকে বের করুন:
- দলিলের ধরন
- দাতা/বিক্রেতার নাম ও পিতার নাম
- গ্রহীতা/ক্রেতার নাম ও পিতার নাম
- দলিল নম্বর ও তারিখ
- মৌজা, থানা, জেলা
- দাগ নম্বর, খতিয়ান নম্বর
- জমির পরিমাণ ও মূল্য

শুধু যা পড়তে পারছেন তাই লিখুন।

JSON ফরম্যাটে উত্তর দিন:
{
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "documentType": "দলিলের ধরন",
  "documentTypes": ["প্রতিটি ডকুমেন্টের ধরন"],
  "isSameProperty": true/false,
  "summary": {
    "mouza": "মৌজা",
    "thana": "থানা",
    "district": "জেলা",
    "deedNo": "দলিল নম্বর",
    "date": "তারিখ",
    "propertyAmount": "মূল্য",
    "sellerName": "দাতা/বিক্রেতার নাম",
    "sellerFather": "পিতার নাম",
    "buyerName": "গ্রহীতা/ক্রেতার নাম",
    "buyerFather": "পিতার নাম",
    "dagNo": "দাগ নম্বর",
    "khatianNo": "খতিয়ান নম্বর",
    "landAmount": "জমির পরিমাণ",
    "landType": "জমির ধরন",
    "boundaries": {"north": "", "south": "", "east": "", "west": ""}
  },
  "goodPoints": ["✅ ভালো দিক"],
  "badPoints": ["⚠️ সমস্যা"],
  "criticalIssues": ["🚨 গুরুতর সমস্যা"],
  "missingInfo": ["📋 যা নেই"],
  "chainOfTitleAnalysis": "মালিকানার ইতিহাস",
  "chainOfTitleTimeline": [{"date": "তারিখ", "event": "কী হয়েছিল"}],
  "buyerProtection": {"verdict": "Buyer Safe" | "Risky" | "Neutral", "details": ""},
  "nextSteps": ["পরবর্তী পদক্ষেপ"]
}`
    });

    console.log('🤖 Calling GPT-4o-mini...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast, accurate, cost-effective
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: imageContents }
      ],
      max_tokens: 4096,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    console.log('✅ GPT-4o-mini response received');
    
    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error('Empty response from GPT-4o-mini');
    }

    const rawResult = JSON.parse(text);
    
    const result = {
      modelUsed: 'gpt-4o-mini',
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
        witnesses: rawResult.summary?.witnesses || [],
        propertyDescription: rawResult.summary?.propertyDescription || '',
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

    console.log('✅ PLUS Analysis completed - Risk:', result.riskScore);
    return res.json(result);

  } catch (error: any) {
    console.error("❌ PLUS Analysis error:", error.message);
    
    if (error.message?.includes('429')) {
      return res.status(429).json({ error: "Service busy. Please try again." });
    }
    
    return res.status(500).json({ error: error.message || "Failed to analyze" });
  }
}
