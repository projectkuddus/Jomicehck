// Types for API requests and responses

export interface DocumentInput {
  name: string;
  mimeType: string;
  data: string; // Base64 encoded data (without data URL prefix)
  extractedText?: string; // Text directly extracted from PDF (more reliable than OCR)
}

// Base analysis result (shared by PLUS and PRO)
export interface AnalysisResult {
  // PRO flag
  proAnalysis?: boolean;
  
  // Model info
  modelUsed?: string;
  
  // Core scores
  riskScore: number;
  riskLevel: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical';
  confidenceScore?: number;
  documentType: string;
  
  // Document chain analysis
  documentTypes?: string[];
  isSameProperty?: boolean;
  propertyMatchReason?: string;
  
  // Summary (expanded for PRO)
  summary: {
    mouza: string;
    jla?: string;
    thana?: string;
    district?: string;
    deedNo: string;
    date: string;
    registrationOffice?: string;
    propertyAmount: string;
    marketValue?: string;
    stampDuty?: string;
    registrationFee?: string;
    sellerName?: string;
    sellerFather?: string;
    sellerAddress?: string;
    buyerName?: string;
    buyerFather?: string;
    buyerAddress?: string;
    witnesses?: string[];
    propertyDescription?: string;
    dagNo?: string;
    khatianNo?: string;
    landAmount?: string;
    landType?: string;
    boundaries?: {
      north?: string;
      south?: string;
      east?: string;
      west?: string;
    };
  };
  
  // Verification checklist
  verificationChecklist?: {
    item: string;
    where: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];

  // PRO: Page-by-page analysis
  pageByPageAnalysis?: {
    pageNumber: number;
    pageType: string;
    keyFindings: string[];
    extractedText?: string;
    issues: string[];
    readabilityScore?: number;
  }[];

  // PRO: Risk breakdown by category
  riskBreakdown?: {
    legal: {
      score: number;
      issues: string[];
      details: string;
    };
    ownership: {
      score: number;
      issues: string[];
      details: string;
    };
    // New fields
    documentation?: {
      score: number;
      issues: string[];
      details: string;
    };
    possession?: {
      score: number;
      issues: string[];
      details: string;
    };
    // Legacy fields for backward compatibility
    financial?: {
      score: number;
      issues: string[];
      details: string;
    };
    procedural?: {
      score: number;
      issues: string[];
      details: string;
    };
  };

  // PRO: Red flags with severity
  redFlags?: {
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    description: string;
    pageReference?: string;
    recommendation: string;
  }[];

  // PRO: Standard comparison
  standardComparison?: {
    presentItems: string[];
    missingItems: string[];
    unusualItems: string[];
    comparisonNote: string;
  };

  // Chain of title (expanded for PRO)
  chainOfTitle?: {
    isComplete: boolean;
    analysis: string;
    timeline: {
      date: string;
      event: string;
      from?: string;
      to?: string;
      deedReference?: string;
    }[];
    gaps: string[];
  };
  
  // Legacy chain of title fields (for PLUS compatibility)
  chainOfTitleAnalysis?: string;
  chainOfTitleTimeline?: {
    date: string;
    event: string;
  }[];

  // PRO: Detailed legal clauses analysis
  legalClausesAnalysis?: {
    clauseNumber?: string;
    originalText: string;
    simpleMeaning: string;
    buyerImpact: 'Favorable' | 'Unfavorable' | 'Neutral';
    warning?: string;
  }[];
  
  // Legacy legal clauses (for PLUS)
  legalClauses?: string[];

  // PRO: Hidden risks with probability
  hiddenRisks?: {
    risk: string;
    probability: 'High' | 'Medium' | 'Low';
    impact: 'High' | 'Medium' | 'Low';
    mitigation: string;
  }[] | string[];

  // PRO: Expert verdict
  expertVerdict?: {
    recommendation: 'Buy' | 'Buy with Caution' | 'Negotiate' | 'Do Not Buy' | 'Need More Documents';
    confidence: number;
    summary: string;
    keyReasons: string[];
  };

  // Buyer protection (expanded for PRO)
  buyerProtection: {
    verdict: string;
    score?: number;
    details: string;
    protectionClauses?: string[];
    riskClauses?: string[];
  };

  // PRO: Action items
  actionItems?: {
    priority: 'Urgent' | 'Important' | 'Optional';
    action: string;
    reason: string;
    deadline?: string;
  }[];

  // PRO: Documents needed
  documentsNeeded?: {
    document: string;
    purpose: string;
    whereToGet?: string;
    priority: 'Essential' | 'Recommended' | 'Optional';
  }[];

  // PRO: Legal advice
  legalAdvice?: string;

  // Standard fields
  goodPoints: string[];
  badPoints: string[];
  criticalIssues: string[];
  missingInfo: string[];
  nextSteps: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
