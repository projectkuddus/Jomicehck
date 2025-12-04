import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { analyzeDocuments, chatMessage } from './services/geminiService.js';
import { DocumentInput, ChatMessage, AnalysisResult } from './types.js';

// Load environment variables
dotenv.config();

const app = express();

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'https://www.jomicheck.com',
    'https://jomicheck.com',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  // Allow Vercel preview URLs (for staging/preview deployments)
  const isVercelPreview = origin && origin.includes('.vercel.app');

  if (origin && (allowedOrigins.includes(origin) || isVercelPreview || process.env.NODE_ENV !== 'production')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Analyze documents route
app.post('/api/analyze', async (req: Request, res: Response) => {
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
    res.json(result);

  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Chat message route
app.post('/api/chat', async (req: Request, res: Response) => {
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

    res.json(result);

  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export app for testing
export default app;

