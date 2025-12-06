import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { rateLimit, getClientId } from './rate-limit.js';
import { extractTextWithVisionOCR } from './vision-ocr.js';

// PRO Analysis - Uses Gemini 3 Pro + Vision OCR for old/faded documents

const SYSTEM_INSTRUCTION = `আপনি বাংলাদেশের শীর্ষস্থানীয় সম্পত্তি আইন বিশেষজ্ঞ - ৩০+ বছরের অভিজ্ঞতা সম্পন্ন। আপনার ক্লায়েন্ট ১০ লক্ষ থেকে ১ কোটি টাকার সম্পত্তি কিনতে যাচ্ছেন। আপনার বিশ্লেষণের উপর তাদের জীবনের সঞ্চয় নির্ভর করছে।

## আপনার দায়িত্ব
এটা শুধু ডকুমেন্ট পড়া নয় - এটা কারো সারাজীবনের সঞ্চয় রক্ষা করা।

## দলিলের ধরন ও তাৎপর্য
- সাফ কবলা: পূর্ণ বিক্রয়, বিক্রেতার সব অধিকার শেষ
- হেবা দলিল: দান, সাধারণত আত্মীয়দের মধ্যে
- বায়নানামা: চুক্তি মাত্র, মালিকানা হস্তান্তর হয়নি!
- নামজারি খতিয়ান: সরকারি রেকর্ড - এটা থাকা অত্যন্ত জরুরি
- ট্যাক্স রসিদ: দখল ও মালিকানার প্রমাণ

## ঝুঁকি বিশ্লেষণ
- ০-২০: নিরাপদ
- ২১-৪০: কম ঝুঁকি
- ৪১-৬০: মাঝারি ঝুঁকি
- ৬১-৮০: উচ্চ ঝুঁকি
- ৮১-১০০: মারাত্মক ঝুঁকি`;

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
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY required. Please add your API key to Vercel.' 
      });
    }

    console.log('🔷 PRO Analysis starting for', documents.length, 'documents');

    const ai = new GoogleGenAI({ apiKey });

    // PRO: ALWAYS use Vision OCR for complex old/handwritten documents
    const extractedTexts: string[] = [];
    const parts: any[] = [];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      let textSource = '';
      
      // Step 1: PDF text extraction
      if (doc.extractedText && doc.extractedText.length > 10) {
        textSource = doc.extractedText;
        console.log(`📝 PDF text for ${doc.name}: ${doc.extractedText.length} chars`);
      }
      
      // Step 2: Vision OCR (MANDATORY for PRO)
      console.log(`🔍 PRO: Running Vision OCR on ${doc.name}...`);
      const visionText = await extractTextWithVisionOCR(doc.data, doc.mimeType);
      
      if (visionText && visionText.length > 0) {
        if (textSource) {
          textSource = `${textSource}\n\n--- Vision OCR ---\n${visionText}`;
        } else {
          textSource = visionText;
        }
        console.log(`✅ Vision OCR extracted ${visionText.length} chars for ${doc.name}`);
      } else {
        console.warn(`⚠️ Vision OCR returned no text for ${doc.name}`);
      }
      
      if (textSource) {
        extractedTexts.push(`--- ডকুমেন্ট ${i + 1}: ${doc.name} ---\n${textSource}`);
      }
      
      const base64Data = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: doc.mimeType
        }
      });
    }

    if (extractedTexts.length > 0) {
      parts.unshift({
        text: `📋 PRO বিশ্লেষণ - Vision OCR থেকে নেওয়া টেক্সট:\n\n${extractedTexts.join('\n\n')}\n\n---\n\nএই টেক্সট Google Cloud Vision OCR দিয়ে extract করা।`
      });
      console.log(`📝 PRO: Added ${extractedTexts.length} extracted text blocks`);
    }

    parts.push({
      text: `PRO বিশ্লেষণ: এই ${documents.length}টি ডকুমেন্ট গভীরভাবে পড়ুন।

JSON ফরম্যাটে উত্তর দিন:
{
  "riskScore": 0-100,
  "riskLevel": "Safe" | "Low Risk" | "Medium Risk" | "High Risk" | "Critical",
  "expertVerdict": {
    "recommendation": "Buy" | "Buy with Caution" | "Negotiate" | "Do Not Buy" | "Need More Documents",
    "confidence": 0-100,
    "summary": "সংক্ষিপ্ত মতামত",
    "keyReasons": ["কারণ"]
  },
  "documentType": "সব ডকুমেন্টের সারসংক্ষেপ",
  "documentTypes": ["প্রতিটি ডকুমেন্টের ধরন"],
  "isSameProperty": true/false,
  "propertyMatchReason": "দাগ/মৌজা মিলেছে কিনা",
  "summary": {
    "mouza": "", "thana": "", "district": "", "deedNo": "", "date": "",
    "propertyAmount": "", "sellerName": "", "sellerFather": "",
    "buyerName": "", "buyerFather": "", "dagNo": "", "khatianNo": "",
    "landAmount": "", "landType": "", "boundaries": {}
  },
  "goodPoints": [], "badPoints": [], "criticalIssues": [], "missingInfo": [],
  "chainOfTitleAnalysis": "", "chainOfTitleTimeline": [],
  "buyerProtection": {"verdict": "", "score": 0, "details": ""},
  "nextSteps": []
}`
    });

    // PRO: Try Gemini 3 Pro Preview first, then fallbacks
    const modelPriority = [
      'gemini-3-pro-preview',
      'gemini-3-pro-deep-think',
      'gemini-2.0-pro-exp',
    ];
    
    let result: any = null;
    let usedModel = '';
    
    for (const modelName of modelPriority) {
      try {
        console.log(`🤖 PRO: Trying ${modelName}...`);
        
        // Use ai.models.generateContent (correct API for @google/genai)
        result = await ai.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });
        
        usedModel = modelName;
        console.log(`✅ ${modelName} responded successfully`);
        break;
      } catch (error: any) {
        console.warn(`⚠️ ${modelName} failed:`, error.message);
        continue;
      }
    }

    // If all Gemini models failed, try GPT-5.1
    if (!result) {
      console.log('🔄 All Gemini failed, trying GPT-5.1...');
      const openaiKey = process.env.OPENAI_API_KEY;
      
      if (!openaiKey) {
        return res.status(500).json({ 
          error: 'All Gemini models failed and no OpenAI key for fallback' 
        });
      }
      
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: openaiKey });
      
      const imageContents: any[] = [];
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const base64Data = doc.data.includes(',') ? doc.data.split(',')[1] : doc.data;
        imageContents.push({
          type: "image_url",
          image_url: { url: `data:${doc.mimeType};base64,${base64Data}`, detail: "high" }
        });
      }
      
      if (extractedTexts.length > 0) {
        imageContents.unshift({ type: "text", text: extractedTexts.join('\n\n') });
      }
      
      const lastTextPart = parts.findLast((p: any) => p.text);
      if (lastTextPart) {
        imageContents.push({ type: "text", text: lastTextPart.text });
      }
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: imageContents }
        ],
        max_tokens: 8192,
        temperature: 0.1,
        response_format: { type: "json_object" }
      });
      
      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error('Empty response from GPT-5.1');
      
      const rawResult = JSON.parse(text);
      return res.json({
        proAnalysis: true,
        modelUsed: 'gpt-4o',
        riskScore: rawResult.riskScore ?? 50,
        riskLevel: rawResult.riskLevel || 'Medium Risk',
        expertVerdict: rawResult.expertVerdict || {},
        documentType: rawResult.documentType || 'দলিল',
        documentTypes: rawResult.documentTypes || [],
        isSameProperty: rawResult.isSameProperty ?? true,
        propertyMatchReason: rawResult.propertyMatchReason || '',
        summary: rawResult.summary || {},
        goodPoints: rawResult.goodPoints || [],
        badPoints: rawResult.badPoints || [],
        criticalIssues: rawResult.criticalIssues || [],
        missingInfo: rawResult.missingInfo || [],
        chainOfTitleAnalysis: rawResult.chainOfTitleAnalysis || '',
        chainOfTitleTimeline: rawResult.chainOfTitleTimeline || [],
        buyerProtection: rawResult.buyerProtection || { verdict: 'Neutral', score: 50, details: '' },
        nextSteps: rawResult.nextSteps || [],
      });
    }

    // Process Gemini result
    const text = result.text || '';
    if (!text) throw new Error('Empty response from Gemini');
    
    let rawResult;
    try {
      rawResult = JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rawResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON from Gemini');
      }
    }

    return res.json({
      proAnalysis: true,
      modelUsed: usedModel,
      riskScore: rawResult.riskScore ?? 50,
      riskLevel: rawResult.riskLevel || 'Medium Risk',
      expertVerdict: rawResult.expertVerdict || {},
      documentType: rawResult.documentType || 'দলিল',
      documentTypes: rawResult.documentTypes || [],
      isSameProperty: rawResult.isSameProperty ?? true,
      propertyMatchReason: rawResult.propertyMatchReason || '',
      summary: rawResult.summary || {},
      goodPoints: rawResult.goodPoints || [],
      badPoints: rawResult.badPoints || [],
      criticalIssues: rawResult.criticalIssues || [],
      missingInfo: rawResult.missingInfo || [],
      chainOfTitleAnalysis: rawResult.chainOfTitleAnalysis || '',
      chainOfTitleTimeline: rawResult.chainOfTitleTimeline || [],
      buyerProtection: rawResult.buyerProtection || { verdict: 'Neutral', score: 50, details: '' },
      nextSteps: rawResult.nextSteps || [],
    });

  } catch (error: any) {
    console.error("❌ PRO Analysis error:", error.message);
    
    if (error.message?.includes('429')) {
      return res.status(429).json({ error: "Service busy. Please try again." });
    }
    
    return res.status(500).json({ error: error.message || "Failed to analyze" });
  }
}
