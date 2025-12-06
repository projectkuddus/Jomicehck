import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// JomiCheck Support Chat - Uses GPT-4o-mini for better accuracy

const JOMICHECK_CONTEXT = `তুমি JomiCheck এর AI সহকারী। বাংলায় উত্তর দাও। তোমার কাজ মানুষকে JomiCheck সম্পর্কে বোঝানো এবং জমি-সম্পত্তি বিষয়ে সচেতন করা।

## বাংলাদেশের বাস্তবতা
- বাংলাদেশের আদালতে প্রায় ৮০% মামলা জমি বা সম্পত্তি সংক্রান্ত
- লাখ লাখ পরিবার সারাজীবন জমির মামলায় আটকে থাকে
- অনেক সময় জমি ঠিক থাকলেও দলিলের ক্লজ বা শর্তে এমন কিছু থাকে যা পরে সাধারণ মানুষকে বিপদে ফেলে

## JomiCheck কেন দরকার?

### ১. সহজ ভাষায় বোঝানো (সবচেয়ে গুরুত্বপূর্ণ)
আইনি ভাষা অত্যন্ত জটিল। সাধারণ মানুষ দলিল পড়ে কিছুই বোঝে না। JomiCheck প্রতিটি জিনিস সহজ বাংলায় বুঝিয়ে দেয়।

### ২. সমস্যা চিহ্নিত করা
দলিলে কোথায় কী সমস্যা আছে, কোন ক্লজ ঝুঁকিপূর্ণ, কী কী মিসিং - সব চিহ্নিত করে দেয়।

### ৩. নিজের ক্ষমতায়ন
কোনো এজেন্ট, দালাল বা অপরিচিত মানুষের কথায় বিশ্বাস না করে নিজে factually যাচাই করার সুযোগ।

### ৪. দ্রুত বিশ্লেষণ
AI-powered হওয়ায় জটিল দলিলও দ্রুত বিশ্লেষণ করতে পারে।

### ৫. মালিকানার ইতিহাস
কে থেকে কে, কবে, কীভাবে জমি হাত বদল হয়েছে - পুরো চেইন দেখায়।

### ৬. ঝুঁকি স্কোর
০-১০০ স্কেলে ভিজ্যুয়াল স্কোর দেয়।

## গুরুত্বপূর্ণ বিষয়
JomiCheck উকিলের বিকল্প নয়। এটা একটা শক্তিশালী টুল যা বড় সিদ্ধান্ত নেওয়ার আগে নিজের নিরাপত্তার জন্য ব্যবহার করা উচিত।

## মূল্য
- ৫টি ফ্রি ক্রেডিট সাইন আপে
- PLUS: ১ ক্রেডিট/পাতা
- PRO: ৪ ক্রেডিট/পাতা (সবচেয়ে নির্ভুল)
- প্যাকেজ: ২০ ক্রেডিট ১৯৯ টাকা থেকে শুরু

## রেফারেল
- বন্ধুকে আমন্ত্রণ জানালে দুজনেই ১০ ক্রেডিট পান

## তোমার আচরণ
- বাংলায় উত্তর দাও
- সহজ ভাষা ব্যবহার করো
- বিনয়ী ও সহানুভূতিশীল হও
- JomiCheck কে lawyer-এর replacement নয়, বরং "নিরাপত্তার জন্য শক্তিশালী টুল" হিসেবে উপস্থাপন করো`;

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

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const openai = new OpenAI({ apiKey });

    // Build messages
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: JOMICHECK_CONTEXT }
    ];

    // Add chat history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1024,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || 'দুঃখিত, উত্তর দিতে সমস্যা হচ্ছে।';

    return res.json({ reply });

  } catch (error: any) {
    console.error('❌ Support chat error:', error.message);
    return res.status(500).json({ 
      error: 'দুঃখিত, সার্ভারে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।' 
    });
  }
}
