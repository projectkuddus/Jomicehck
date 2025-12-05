import React from 'react';
import { Shield, FileText, AlertTriangle } from 'lucide-react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-slate-800">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-brand-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
        <p className="text-slate-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-8">
        
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-slate-700 leading-relaxed">
            By accessing and using JomiCheck ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Service Description</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            JomiCheck is an AI-powered property document analysis service that helps users identify potential risks and issues in property documents. 
            Our service:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
            <li>Analyzes property documents (deeds, khatian, mutation papers) using AI technology</li>
            <li>Provides risk assessment and ownership chain analysis</li>
            <li>Offers suggestions for improvement and missing information</li>
            <li>Generates reports in Bengali language</li>
          </ul>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">Important Disclaimer</p>
                <p className="text-sm text-amber-800">
                  JomiCheck is a <strong>screening tool</strong>, not a replacement for legal advice or physical verification. 
                  We analyze text content only and cannot verify physical documents, registry records, or guarantee document authenticity. 
                  Always consult with a qualified lawyer and verify documents at the registry office before making property decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts and Credits</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            To use JomiCheck, you must:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
            <li>Create an account with a valid email address</li>
            <li>Verify your email through OTP (One-Time Password)</li>
            <li>Purchase credits to analyze documents (credits are non-refundable)</li>
            <li>Maintain the security of your account credentials</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Credits are valid indefinitely and can be used for any analysis. Free trial credits are provided on signup and are subject to our free trial policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Payment and Refunds</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            Payment for credits can be made through:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
            <li>bKash</li>
            <li>Nagad</li>
            <li>Credit/Debit Cards (via SSLCommerz)</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            <strong>Refund Policy:</strong> Credits are non-refundable once purchased. If you experience technical issues preventing you from using the service, 
            please contact support@jomicheck.com for assistance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. User Responsibilities</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            You agree to:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
            <li>Upload only legitimate property documents that you own or have permission to analyze</li>
            <li>Not use the service for any illegal or unauthorized purpose</li>
            <li>Not attempt to gain unauthorized access to the service or its systems</li>
            <li>Not share your account credentials with others</li>
            <li>Comply with all applicable laws and regulations in Bangladesh</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
          <p className="text-slate-700 leading-relaxed">
            JomiCheck provides analysis based on AI interpretation of document text. We are not responsible for:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 mt-4">
            <li>Errors or omissions in the analysis</li>
            <li>Decisions made based on our reports</li>
            <li>Financial losses resulting from property transactions</li>
            <li>Physical verification of documents or registry records</li>
            <li>Legal consequences of property purchases</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            Our service is provided "as is" without warranties of any kind. Always consult with qualified professionals before making property decisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Intellectual Property</h2>
          <p className="text-slate-700 leading-relaxed">
            All content, features, and functionality of JomiCheck, including but not limited to text, graphics, logos, and software, 
            are the property of JomiCheck and are protected by copyright and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Privacy</h2>
          <p className="text-slate-700 leading-relaxed">
            Your use of JomiCheck is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding 
            the collection and use of your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Changes to Terms</h2>
          <p className="text-slate-700 leading-relaxed">
            We reserve the right to modify these terms at any time. We will notify users of any significant changes via email or through the service. 
            Continued use of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact Information</h2>
          <p className="text-slate-700 leading-relaxed">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p className="text-slate-700 leading-relaxed mt-2">
            <strong>Email:</strong> support@jomicheck.com<br />
            <strong>Website:</strong> https://www.jomicheck.com
          </p>
        </section>

      </div>
    </div>
  );
};

export default Terms;

