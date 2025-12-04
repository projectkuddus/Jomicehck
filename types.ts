
export interface FileWithPreview {
  id: string;
  file: File;
  preview: string | null; // Null for files we can't preview (HEIC/PDF)
  base64Data?: string;
  mimeType: string;
  estimatedPages: number;
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
  };
  goodPoints: string[];
  badPoints: string[];
  criticalIssues: string[]; // "What to Fix"
  missingInfo: string[]; // "What is Missing"
  buyerProtection: {
    verdict: string; // e.g., "Buyer Favored" or "Seller Favored"
    details: string;
  };
  nextSteps: string[];
  chainOfTitleAnalysis: string; // Specific paragraph about ownership history
  chainOfTitleTimeline: {
    date: string;
    event: string;
  }[];
}

export interface AnalysisState {
  isLoading: boolean;
  isStreaming: boolean;
  result: AnalysisResult | null;
  error: string | null;
  steps?: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  result: AnalysisResult;
}

export enum DocumentCategory {
  DEED = 'Deed / Dolil',
  TITLE = 'Title Document',
  MUTATION = 'Mutation / Namjari',
  TAX_RECEIPT = 'Tax Receipt / Khajna',
  LAYOUT_PLAN = 'Layout / Mouza Map',
  ENCUMBRANCE = 'Non-Encumbrance Cert',
  OTHER = 'Other Legal Paper'
}
