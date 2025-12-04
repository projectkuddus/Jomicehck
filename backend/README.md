# JomiCheck Backend

Production-ready Node.js + TypeScript + Express server with Gemini AI integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** The `GEMINI_API_KEY` is required for the API to function.

## Scripts

- `npm run dev` - Start development server with hot reload (tsx)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server (requires build first)

## Development

Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:4000` (or the port specified in `.env`).

## API Endpoints

### Health Check
- `GET /health` - Returns `{ status: "ok" }`

### Document Analysis
- `POST /api/analyze`
  - **Request Body:**
    ```json
    {
      "documents": [
        {
          "name": "document.pdf",
          "mimeType": "application/pdf",
          "data": "base64_encoded_data_without_prefix"
        }
      ]
    }
    ```
  - **Response:** Analysis result with risk score, issues, recommendations, etc.
  - **Error:** Returns `500` with `{ error: "Something went wrong" }` on failure

### Chat Assistant
- `POST /api/chat`
  - **Request Body:**
    ```json
    {
      "history": [
        { "role": "user", "text": "Hello" },
        { "role": "model", "text": "Hi there!" }
      ],
      "input": "Explain the risks",
      "analysisContext": { /* optional: AnalysisResult from /api/analyze */ }
    }
    ```
  - **Response:**
    ```json
    {
      "reply": "AI response text",
      "updatedHistory": [ /* full conversation history */ ]
    }
    ```
  - **Error:** Returns `500` with `{ error: "Something went wrong" }` on failure

## Production

Build and run:
```bash
npm run build
npm start
```

## Security Notes

- API keys and model names are never exposed to the client
- All Gemini API calls are made server-side only
- Error messages are sanitized to prevent information leakage

