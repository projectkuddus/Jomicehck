import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Chat about analysis results - uses GPT-4o-mini

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
    const { history, input, analysisContext } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: "Invalid request: 'input' string is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API not configured' });
    }

    const openai = new OpenAI({ apiKey });

    // Build message history
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `আপনি একজন বাংলাদেশী সম্পত্তি আইন বিশেষজ্ঞ। ব্যবহারকারীকে তাদের দলিল বিশ্লেষণ সম্পর্কে সাহায্য করুন। বাংলায় উত্তর দিন।`
      }
    ];

    // Add analysis context if provided
    if (analysisContext && history.length === 0) {
      messages.push({
        role: "user",
        content: `এই দলিলের বিশ্লেষণ রিপোর্ট: ${JSON.stringify(analysisContext)}`
      });
      messages.push({
        role: "assistant",
        content: "আমি আপনার দলিলের বিশ্লেষণ দেখেছি। কীভাবে সাহায্য করতে পারি?"
      });
    }

    // Add chat history
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }
    }

    // Add current input
    messages.push({ role: "user", content: input });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1024,
      temperature: 0.7
    });

    const reply = response.choices[0]?.message?.content || "দুঃখিত, উত্তর দিতে পারছি না।";

    // Update history
    const updatedHistory = [
      ...(history || []),
      { role: 'user', text: input },
      { role: 'model', text: reply }
    ];

    return res.json({ reply, updatedHistory });

  } catch (error: any) {
    console.error("Chat error:", error.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
