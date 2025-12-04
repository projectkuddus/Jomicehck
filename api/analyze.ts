import type { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeDocuments } from '../backend/src/services/geminiService.js';
import { DocumentInput } from '../backend/src/types.js';

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
    return res.status(500).json({ error: "Something went wrong" });
  }
}

