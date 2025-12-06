// Types for API requests and responses

export interface DocumentInput {
  name: string;
  mimeType: string;
  data: string; // Base64 encoded data (without data URL prefix)
}

export interface AnalysisResult {
  riskScore: number;
  riskLevel: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical';
  documentType: string;
  summary: {
    mouza: string;
    deedNo: string;
    date: string;
    propertyAmount: string;
    sellerName?: string;
    buyerName?: string;
    propertyDescription?: string;
  };
  goodPoints: string[];
  badPoints: string[];
  criticalIssues: string[];
  missingInfo: string[];
  buyerProtection: {
    verdict: string;
    details: string;
  };
  nextSteps: string[];
  chainOfTitleAnalysis: string;
  chainOfTitleTimeline: {
    date: string;
    event: string;
  }[];
  legalClauses?: string[];
  hiddenRisks?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

