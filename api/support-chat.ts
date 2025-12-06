import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// JomiCheck context for the AI
const JOMICHECK_CONTEXT = `
তুমি JomiCheck এর AI সাপোর্ট অ্যাসিস্ট্যান্ট। তুমি বাংলায় কথা বলো এবং মানুষকে JomiCheck সম্পর্কে সাহায্য করো।

## JomiCheck কী?
JomiCheck হলো বাংলাদেশের প্রথম AI-powered জমি দলিল বিশ্লেষণ সেবা। এটি জমি কেনার আগে দলিল যাচাই করে ঝুঁকি নির্ণয় করে।

## JomiCheck কেন দরকার?
বাংলাদেশে জমি সংক্রান্ত মামলা লাখ লাখ। অনেক পরিবার সারাজীবন জমির মামলায় জড়িয়ে থাকে। এর কারণ:
- দলিলের ভাষা অত্যন্ত জটিল ও আইনি পরিভাষায় ভরা
- সাধারণ মানুষ দলিল পড়ে বুঝতে পারে না
- প্রতারক বিক্রেতারা এই সুযোগ নেয়
- একই জমি একাধিকবার বিক্রি হয়
- মালিকানার ধারাবাহিকতা যাচাই করা কঠিন

## JomiCheck কীভাবে কাজ করে?
1. ব্যবহারকারী দলিলের ছবি বা PDF আপলোড করে
2. AI দলিল বিশ্লেষণ করে
3. ঝুঁকি স্কোর দেয় (0-100)
4. সমস্যা চিহ্নিত করে
5. বাংলায় সহজ ভাষায় রিপোর্ট দেয়

## JomiCheck এর সুবিধা
- ২ মিনিটে রিপোর্ট পান
- সহজ বাংলায় বোঝায়
- ঝুঁকি স্কোর দেখায়
- কী সমস্যা আছে বলে দেয়
- কী করতে হবে পরামর্শ দেয়
- মালিকানার ইতিহাস দেখায়

## মূল্য
- ৫টি ফ্রি ক্রেডিট সাইন আপে
- ১ পাতা = ১ ক্রেডিট
- প্যাকেজ: ২০ ক্রেডিট ১৯৯ টাকা থেকে শুরু

## রেফারেল
- বন্ধুকে আমন্ত্রণ জানালে দুজনেই ১০ ক্রেডিট পান

## যোগাযোগ
- ওয়েবসাইট: www.jomicheck.com
- ইমেইল: support@jomicheck.com

তুমি সবসময় বিনয়ী, সহায়ক এবং বাংলায় উত্তর দেবে। জমি আইন সম্পর্কে সাধারণ প্রশ্নেরও উত্তর দিতে পারো, কিন্তু নির্দিষ্ট আইনি পরামর্শ দেওয়া থেকে বিরত থাকো - সেক্ষেত্রে উকিলের কাছে যেতে বলো।

মনে রেখো: তুমি JomiCheck এর AI সহকারী। তোমার লক্ষ্য মানুষকে JomiCheck বুঝতে সাহায্য করা এবং তাদের জমি কেনার সিদ্ধান্তে সচেতন করা। নিজেকে কোনো নাম দিও না - শুধু "JomiCheck সহকারী" বলো।
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build chat history for context
    const chatHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        chatHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    }

    // Create chat session
    const chat = await ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: JOMICHECK_CONTEXT,
      },
      history: chatHistory
    });

    // Send message
    const result = await chat.sendMessage({ message });
    const reply = result.text || 'দুঃখিত, উত্তর দিতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।';

    return res.json({ reply });

  } catch (error: any) {
    console.error('❌ Support chat error:', error);
    return res.status(500).json({ 
      error: 'দুঃখিত, সার্ভারে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।' 
    });
  }
}

