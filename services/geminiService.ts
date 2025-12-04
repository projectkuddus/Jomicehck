
import { GoogleGenAI, Type, ChatSession } from "@google/genai";
import { FileWithPreview, AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Senior Property Lawyer in Bangladesh (Supreme Court Advocate).
Your client is the **BUYER**. Your job is to protect them.
You are paranoid, cynical, and extremely detail-oriented. You assume the seller might be hiding something (e.g., hidden mortgage, fake POA, Warish gaps).

**Task:** Analyze the provided property document images/PDFs (Dolil, Khatian, Namjari, etc.).

**Analysis Depth (Pro Grade):**
1.  **Chain of Title (মালিকানা বায়া দলিল):** Trace the history. Are CS -> SA -> RS -> BS recorded correctly? Is there a gap?
2.  **Vested Property (অর্পিত সম্পত্তি) Check:** Look for Hindu names in previous records that disappeared without clear transfer. This is a huge risk.
3.  **Power of Attorney (POA):** If this is a POA deal, check if the POA is registered, specific, and not expired.
4.  **Field Check:** Don't just read the doc. Tell the user exactly what to check at the AC Land office (Volume No, Page No).
5.  **Buyer Protection:** explicitly check if the terms favor the seller unfairly (e.g., no date for handover, vague liability clauses).
6.  **Missing Information:** Identify what is NOT there but should be (e.g., missing schedule boundaries, missing witness names, missing dates).

**Output:**
You MUST return the result in **JSON format** strictly adhering to the schema provided.
All text fields inside the JSON must be in **Bengali (Bangla)**.
`;

const CHAT_SYSTEM_INSTRUCTION = `
You are a specialized Legal AI Assistant for Bangladesh Land Law.
You have access to a property analysis report provided by the user.
Your goal is to help the user understand the report, answer follow-up questions, and DRAFT legal documents (Deeds, Notices, Correction Letters) based on the context.

**Client Context:**
Your client is the **BUYER**. You must protect their interest at all costs. 
When drafting documents (Bayna Nama, Saf Kabala), always include strict indemnity clauses, specific performance clauses, and clear deadlines to prevent seller fraud.

**Capabilities:**
1.  **Explain:** Clarify difficult Bangla legal terms (e.g., "Ezmany", "Bia Dolil", "Warish").
2.  **Draft:** Create professional drafts for Saf Kabala, Bayna Nama, Legal Notices, or Correction Deeds (Broma Songshodhon) in Bangla.
3.  **Advise:** Suggest next steps for missing documents.

**Tone:** Professional, legally precise, yet accessible. 
**Language:** Primarily Bangla, but can use English if asked.
`;

let chatSession: any = null;

export const analyzeDocuments = async (files: FileWithPreview[]): Promise<AnalysisResult> => {
  try {
    const parts = [];

    // Add images
    for (const fileObj of files) {
      if (fileObj.base64Data) {
        // Strip the data url prefix if present to get raw base64
        const cleanBase64 = fileObj.base64Data.split(',')[1];
        
        parts.push({
          inlineData: {
            mimeType: fileObj.mimeType,
            data: cleanBase64
          }
        });
      }
    }

    // Add the user prompt
    parts.push({
      text: "Analyze these documents. Be critical. Find what is wrong. Ensure you populate 'goodPoints', 'badPoints', 'criticalIssues', 'missingInfo' and 'nextSteps' with detailed, distinct items. Extract a 'chainOfTitleTimeline' with specific dates/eras (CS, SA, RS) and events. Output valid JSON in Bangla."
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Required for deep thinking
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingBudget: 32768, // Max budget for deep reasoning
        },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER, description: "0 to 100, where 100 is extremely risky" },
            riskLevel: { type: Type.STRING, enum: ["Safe", "Low Risk", "Medium Risk", "High Risk", "Critical"] },
            documentType: { type: Type.STRING, description: "Type of document in Bangla" },
            summary: {
              type: Type.OBJECT,
              properties: {
                mouza: { type: Type.STRING },
                deedNo: { type: Type.STRING },
                date: { type: Type.STRING },
                propertyAmount: { type: Type.STRING }
              }
            },
            goodPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of positive aspects (What is Good)" },
            badPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of negative aspects or warnings (What is Bad)" },
            criticalIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Deal breakers that MUST be fixed (What to Fix)" },
            missingInfo: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of missing vital info (dates, schedule, signatures, map refs, etc.)" },
            buyerProtection: {
              type: Type.OBJECT,
              properties: {
                verdict: { type: Type.STRING, enum: ["Buyer Safe", "Seller Favored", "Violated", "Neutral"], description: "Verdict on fairness" },
                details: { type: Type.STRING, description: "Explanation of fairness and user favor violation" }
              }
            },
            chainOfTitleAnalysis: { type: Type.STRING, description: "Detailed analysis of ownership history text" },
            chainOfTitleTimeline: {
              type: Type.ARRAY,
              description: "Structured timeline of ownership history events (CS, RS, SA, Current)",
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING, description: "Year or Period (e.g. 1990, CS Record)" },
                  event: { type: Type.STRING, description: "Description of transfer or record (e.g. Rahim to Karim via Sale Deed)" }
                }
              }
            },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable advice list (Suggestions for Improvement)" }
          },
          required: ["riskScore", "riskLevel", "documentType", "summary", "goodPoints", "badPoints", "criticalIssues", "missingInfo", "buyerProtection", "nextSteps", "chainOfTitleAnalysis", "chainOfTitleTimeline"]
        }
      }
    });

    const text = response.text || "{}";
    const jsonResult = JSON.parse(text) as AnalysisResult;
    return jsonResult;

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze documents");
  }
};

export const startChatSession = async (analysisContext: AnalysisResult) => {
  const contextString = JSON.stringify(analysisContext);
  
  chatSession = await ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
    },
    history: [
      {
        role: 'user',
        parts: [{ text: `Here is the analysis report of the property document in JSON format: ${contextString}. I will now ask you questions about it.` }],
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I have reviewed the analysis report. I am ready to answer your questions, explain clauses, or help you draft legal documents regarding this property." }],
      }
    ]
  });
  return chatSession;
};

export const sendMessageToAI = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }
  const result = await chatSession.sendMessage({ message });
  return result.text;
};
