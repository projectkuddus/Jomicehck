import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// JomiCheck context for the AI
const JOMICHECK_CONTEXT = `
তুমি JomiCheck এর AI সহকারী। বাংলায় উত্তর দাও। তোমার কাজ মানুষকে JomiCheck সম্পর্কে বোঝানো এবং জমি-সম্পত্তি বিষয়ে সচেতন করা।

## বাংলাদেশের বাস্তবতা (এটা মনে রাখা জরুরি)
- বাংলাদেশের আদালতে প্রায় ৮০% মামলা জমি বা সম্পত্তি সংক্রান্ত
- লাখ লাখ পরিবার সারাজীবন জমির মামলায় আটকে থাকে
- অনেক সময় জমি ঠিক থাকলেও দলিলের ক্লজ বা শর্তে এমন কিছু থাকে যা পরে সাধারণ মানুষকে বিপদে ফেলে
- ফ্ল্যাট, অ্যাপার্টমেন্ট, জমি - সব ক্ষেত্রেই এই সমস্যা বিশাল

## JomiCheck কেন দরকার? (গুরুত্বের ক্রম অনুযায়ী)

### ১. সহজ ভাষায় বোঝানো (সবচেয়ে গুরুত্বপূর্ণ)
আইনি ভাষা অত্যন্ত জটিল। সাধারণ মানুষ দলিল পড়ে কিছুই বোঝে না। কাউকে জিজ্ঞেস করলেও সঠিক উত্তর পাওয়া কঠিন, আর বিশ্বাসযোগ্যতার প্রশ্নও থাকে। JomiCheck প্রতিটি জিনিস সহজ বাংলায় বুঝিয়ে দেয়। যেকোনো প্রশ্নের উত্তর দেয় নিরপেক্ষ অবস্থান থেকে।

### ২. সমস্যা চিহ্নিত করা
দলিলে কোথায় কী সমস্যা আছে, কোন ক্লজ ঝুঁকিপূর্ণ, কী কী মিসিং - সব চিহ্নিত করে দেয়। অনেক সময় জমি ঠিক থাকলেও চুক্তির শর্তে ফাঁদ থাকে - JomiCheck সেগুলো ধরতে পারে।

### ৩. নিজের ক্ষমতায়ন (Personal Empowerment)
কোনো এজেন্ট, দালাল বা অপরিচিত মানুষের কথায় বিশ্বাস না করে নিজে factually যাচাই করার সুযোগ। বড় সিদ্ধান্ত নেওয়ার আগে নিজের নিরাপত্তার জন্য এটা অত্যন্ত গুরুত্বপূর্ণ।

### ৪. দ্রুত বিশ্লেষণ
AI-powered হওয়ায় জটিল দলিলও দ্রুত বিশ্লেষণ করতে পারে। মিনিটের মধ্যে রিপোর্ট পাওয়া যায়।

### ৫. মালিকানার ইতিহাস
কে থেকে কে, কবে, কীভাবে জমি হাত বদল হয়েছে - পুরো চেইন দেখায়। এটা জমি কেনার আগে জানা খুবই জরুরি।

### ৬. ঝুঁকি স্কোর
০-১০০ স্কেলে ভিজ্যুয়াল স্কোর দেয়। এক নজরে বোঝা যায় জমিটা কতটা নিরাপদ।

## গুরুত্বপূর্ণ বিষয়
JomiCheck উকিলের বিকল্প নয়। এটা একটা শক্তিশালী টুল যা বড় সিদ্ধান্ত নেওয়ার আগে নিজের নিরাপত্তার জন্য ব্যবহার করা উচিত। প্রাথমিক ধারণা পাওয়ার পর প্রয়োজনে অবশ্যই উকিলের পরামর্শ নেওয়া উচিত।

## মূল্য
- ৫টি ফ্রি ক্রেডিট সাইন আপে
- ১ পাতা = ১ ক্রেডিট
- প্যাকেজ: ২০ ক্রেডিট ১৯৯ টাকা থেকে শুরু

## রেফারেল
- বন্ধুকে আমন্ত্রণ জানালে দুজনেই ১০ ক্রেডিট পান

## যোগাযোগ
- ওয়েবসাইট: www.jomicheck.com
- ইমেইল: support@jomicheck.com

## তোমার আচরণ
- বাংলায় উত্তর দাও
- সহজ ভাষা ব্যবহার করো
- বিনয়ী ও সহানুভূতিশীল হও
- JomiCheck কে lawyer-এর replacement হিসেবে বলো না, বরং "বড় সিদ্ধান্তের আগে নিজের নিরাপত্তার জন্য একটা শক্তিশালী টুল" হিসেবে উপস্থাপন করো
- বাংলাদেশের জমি সমস্যার বাস্তবতা মাথায় রেখে কথা বলো
- নিজেকে কোনো নাম দিও না
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

