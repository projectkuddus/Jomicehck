import React from 'react';
import { Shield, Lock, Eye, Database } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-slate-800">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-8">
        
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
          <p className="text-slate-700 leading-relaxed">
            JomiCheck ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our service at www.jomicheck.com.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Database size={20} className="text-brand-600" />
              Personal Information
            </h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Email Address:</strong> Required for account creation and communication</li>
              <li><strong>Account Information:</strong> Credits, referral codes, and usage history</li>
              <li><strong>Payment Information:</strong> Transaction IDs and payment method (processed securely through third-party payment gateways)</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Eye size={20} className="text-brand-600" />
              Document Data
            </h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Property documents you upload (deeds, khatian, mutation papers)</li>
              <li>Analysis results and reports generated from your documents</li>
              <li>Chat history with our AI assistant</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <strong>Note:</strong> We process your documents to provide analysis services. Documents are stored securely and are only accessible to you and our AI processing systems.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Lock size={20} className="text-brand-600" />
              Technical Information
            </h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>IP address and browser information</li>
              <li>Device type and operating system</li>
              <li>Usage patterns and service interactions</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
          <p className="text-slate-700 leading-relaxed mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
            <li>Provide and maintain our service</li>
            <li>Process your document analysis requests</li>
            <li>Manage your account and credits</li>
            <li>Process payments and transactions</li>
            <li>Send you service-related communications</li>
            <li>Improve our service and develop new features</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Storage and Security</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We use industry-standard security measures to protect your information:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
            <li>Data encryption in transit (HTTPS/SSL)</li>
            <li>Secure database storage (Supabase with Row Level Security)</li>
            <li>Access controls and authentication</li>
            <li>Regular security audits and updates</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            However, no method of transmission over the internet or electronic storage is 100% secure. 
            While we strive to protect your data, we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Sharing and Disclosure</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We do not sell your personal information. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
            <li><strong>Service Providers:</strong> With trusted third-party services (Supabase, payment gateways, email services) that help us operate our service</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Your Rights and Choices</h2>
          <p className="text-slate-700 leading-relaxed mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
            <li>Access your personal information</li>
            <li>Update or correct your account information</li>
            <li>Delete your account and data (contact support@jomicheck.com)</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Cookies and Tracking</h2>
          <p className="text-slate-700 leading-relaxed mb-4">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
            <li>Maintain your login session</li>
            <li>Remember your preferences</li>
            <li>Analyze service usage (Google Analytics)</li>
            <li>Improve user experience</li>
          </ul>
          <p className="text-slate-700 leading-relaxed mt-4">
            You can control cookies through your browser settings. However, disabling cookies may affect service functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Data Retention</h2>
          <p className="text-slate-700 leading-relaxed">
            We retain your information for as long as your account is active or as needed to provide services. 
            When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Children's Privacy</h2>
          <p className="text-slate-700 leading-relaxed">
            Our service is not intended for users under the age of 18. We do not knowingly collect personal information from children. 
            If you believe we have collected information from a child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Changes to This Policy</h2>
          <p className="text-slate-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by email or through the service. 
            Your continued use of the service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Contact Us</h2>
          <p className="text-slate-700 leading-relaxed">
            If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
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

export default Privacy;

