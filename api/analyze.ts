import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeDocuments } from './lib/geminiService.js';
import { DocumentInput } from './lib/types.js';
import { rateLimit, getClientId } from './rate-limit.js';

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

  // Rate limiting: 50 requests per 15 minutes per user/IP
  const clientId = getClientId(req);
  const limit = rateLimit(clientId, 50, 15 * 60 * 1000);
  
  if (!limit.allowed) {
    res.setHeader('X-RateLimit-Limit', '50');
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', new Date(limit.resetTime).toISOString());
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      resetTime: limit.resetTime 
    });
  }

  res.setHeader('X-RateLimit-Limit', '50');
  res.setHeader('X-RateLimit-Remaining', limit.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(limit.resetTime).toISOString());

  try {
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: "Invalid request: 'documents' array is required" });
    }

    // Validate document structure
    for (const doc of documents) {
      if (!doc.name || !doc.mimeType || !doc.data) {
        return res.status(400).json({ error: "Invalid document format: each document must have 'name', 'mimeType', and 'data' fields" });
      }
    }

    const result = await analyzeDocuments(documents as DocumentInput[]);
    return res.json(result);

  } catch (error: any) {
    console.error("Analysis error:", error);
    const errorMessage = error.message || "Something went wrong";
    return res.status(500).json({ error: errorMessage });
  }
}

