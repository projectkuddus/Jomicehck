import type { VercelRequest, VercelResponse } from '@vercel/node';
import { chatMessage } from './lib/geminiService.js';
import { ChatMessage, AnalysisResult } from './lib/types.js';

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

  try {
    const { history, input, analysisContext } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: "Invalid request: 'input' string is required" });
    }

    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: "Invalid request: 'history' array is required" });
    }

    // Validate history structure
    for (const msg of history) {
      if (!msg.role || !msg.text || (msg.role !== 'user' && msg.role !== 'model')) {
        return res.status(400).json({ error: "Invalid history format: each message must have 'role' ('user' or 'model') and 'text' fields" });
      }
    }

    const result = await chatMessage(
      history as ChatMessage[],
      input,
      analysisContext as AnalysisResult | undefined
    );

    return res.json(result);

  } catch (error: any) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

