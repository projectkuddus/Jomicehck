# JomiCheck Development Roadmap

## Current Status: Level 1 (BASIC) ✅

---

## Level 1: BASIC (Current - Live)

### Features
- [x] Gemini 2.0 Flash AI analysis
- [x] PDF to image conversion
- [x] Risk score (0-100)
- [x] Basic document details extraction
- [x] Good/Bad points
- [x] Critical issues identification
- [x] Chain of title timeline
- [x] Buyer protection check
- [x] AI chat support
- [x] Referral system
- [x] bKash payment

### Tech Stack
- Gemini 2.0 Flash API
- Vercel Pro
- Supabase (Auth + DB)
- PDF.js for conversion

### Costs
- Gemini API: ~৳0.10-0.20/analysis
- Vercel: ~৳2000/month
- Supabase: Free tier

### Pricing
- **৳10/page** (1 credit = 1 page = ৳10)
- Margin: ~95%

---

## Level 2: STANDARD (Next Upgrade)

### New Features
- [ ] Gemini 1.5 Pro (1M token context)
- [ ] Google Cloud Vision OCR for old handwritten documents
- [ ] Better extraction of faded/damaged text
- [ ] More detailed analysis with page references
- [ ] Comparison with standard deed templates

### Tech Requirements
- Google Cloud Vision API integration
- Gemini 1.5 Pro API upgrade
- Enhanced prompt engineering

### Estimated Development Time
- 1-2 weeks

### Costs
- Gemini 1.5 Pro: ~৳1-2/analysis
- Google Cloud Vision: ~৳0.50/page
- Total: ~৳3-5/analysis

### Pricing
- **৳25-30/page**
- Margin: ~85%

---

## Level 3: PRO (Future)

### New Features
- [ ] Multi-document cross-check (Deed + Khatian + Mutation)
- [ ] Legal Knowledge Base with RAG
- [ ] Bangladesh Land Law references
- [ ] Case law citations
- [ ] Inconsistency detection across documents
- [ ] Advanced clause analysis
- [ ] Historical ownership verification

### Tech Requirements
- Vector database (Pinecone/Supabase pgvector)
- Legal text embeddings
- Multi-file upload and correlation
- Enhanced UI for document comparison

### Estimated Development Time
- 3-4 weeks

### Costs
- All Standard features: ~৳3-5
- Vector DB: ~৳2000/month
- Extra processing: ~৳2/analysis
- Total: ~৳8-12/analysis

### Pricing
- **৳50-75/page**
- Margin: ~80%

---

## Level 4: ULTRA PRO (Premium)

### New Features
- [ ] Expert Lawyer Review (Human verification)
- [ ] Government record verification (if API available)
- [ ] Dispute prediction ML model
- [ ] Legal validity certificate
- [ ] Priority 24-hour turnaround
- [ ] Direct lawyer consultation
- [ ] Physical document pickup option

### Tech Requirements
- Lawyer network partnership
- Review management system
- Certificate generation
- ML model training (if dispute data available)

### Estimated Development Time
- 2-3 months

### Costs
- All Pro features: ~৳12
- Lawyer review: ৳500-1000
- Certificate: ৳200
- Total: ~৳700-1200/document

### Pricing
- **৳1500-2500/document**
- Margin: ~50% (premium service)

---

## Website Pricing Display

```
┌─────────────────────────────────────────────────────────────────┐
│                        Choose Your Plan                          │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│   BASIC     │  STANDARD   │    PRO      │      ULTRA              │
│  ৳10/page   │  ৳25/page   │  ৳50/page   │    ৳1500/document       │
├─────────────┼─────────────┼─────────────┼─────────────────────────┤
│ ✓ AI Scan   │ ✓ All Basic │ ✓ All Std   │ ✓ All Pro               │
│ ✓ Risk Score│ ✓ Better OCR│ ✓ Multi-doc │ ✓ Lawyer Review         │
│ ✓ Report    │ ✓ Old docs  │ ✓ Legal refs│ ✓ Certificate           │
│ ✓ AI Chat   │ ✓ Templates │ ✓ Cross-chk │ ✓ Consultation          │
├─────────────┼─────────────┼─────────────┼─────────────────────────┤
│ Personal    │ Buyers      │ Investors   │ High-value/Legal        │
└─────────────┴─────────────┴─────────────┴─────────────────────────┘
```

---

## Implementation Priority

1. **Phase 1 (Now):** Polish Level 1 BASIC to perfection
2. **Phase 2 (Month 1-2):** Launch STANDARD with better OCR
3. **Phase 3 (Month 3-4):** Launch PRO with multi-doc
4. **Phase 4 (Month 5+):** Partner with lawyers for ULTRA

---

## Revenue Projections

| Users/Month | Basic | Standard | Pro | Ultra | Monthly Revenue |
|-------------|-------|----------|-----|-------|-----------------|
| 100 | 80% | 15% | 4% | 1% | ~৳15,000 |
| 500 | 70% | 20% | 8% | 2% | ~৳100,000 |
| 1000 | 60% | 25% | 12% | 3% | ~৳250,000 |
| 5000 | 50% | 30% | 15% | 5% | ~৳1,500,000 |

*Assuming average 5 pages per analysis*

---

## Notes

- Start with BASIC, prove the concept
- Upgrade based on user demand
- Keep BASIC affordable for mass adoption
- ULTRA is for serious property transactions
- Consider monthly subscription plans later

---

Last Updated: December 2024

