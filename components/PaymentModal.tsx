
import React, { useState } from 'react';
import { X, CheckCircle, Lock, Sparkles, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  creditsNeeded?: number;
}

const creditPackages = [
  { credits: 20, price: 199, perPage: 10 },
  { credits: 50, price: 399, perPage: 8, popular: true },
  { credits: 100, price: 699, perPage: 7 },
  { credits: 250, price: 1499, perPage: 6 },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, amount, creditsNeeded = 0 }) => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This is a React rule - hooks must be called in the same order every render
  const { user, refreshProfile } = useAuth();
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(50); // Default to popular

  // Set recommended package on mount
  React.useEffect(() => {
    if (creditsNeeded > 0) {
      const recommended = creditPackages.find(p => p.credits >= creditsNeeded);
      if (recommended) {
        setSelectedPackage(recommended.credits);
      }
    }
  }, [creditsNeeded]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setTransactionId('');
      setError(null);
    }
  }, [isOpen]);

  // NOW we can check if modal should be shown
  if (!isOpen) return null;

  const currentPackage = creditPackages.find(p => p.credits === selectedPackage) || creditPackages[1];
  const packageIndex = creditPackages.findIndex(p => p.credits === selectedPackage);
  const packageId = ['starter', 'popular', 'pro', 'agent'][packageIndex] || 'popular';

  const handlePay = async () => {
    if (!user) {
      setError('Please login to make a payment');
      return;
    }

    // Require transaction ID
    if (!transactionId.trim()) {
      setError('Please enter your transaction ID after sending payment');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('💳 Payment request:', {
        userId: user.id,
        packageId,
        method,
        transactionId: transactionId || 'none',
      });

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          packageId: packageId,
          paymentMethod: method,
          transactionId: transactionId || undefined,
        }),
      });

      console.log('💳 Payment response status:', response.status);

      // Check if response is ok before parsing
      if (!response.ok) {
        let errorMessage = 'Payment failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ Payment error response:', errorData);
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
          console.error('❌ Payment error - could not parse response');
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
        console.log('✅ Payment response:', data);
      } catch (parseError) {
        console.error('❌ Payment parse error:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      // All payments are manual verification
      if (data.status === 'pending_verification' || data.success) {
        setError(null);
        // Show success message
        alert(`✅ Payment submitted successfully!\n\nYour ${data.credits} credits will be added after admin verification (usually within 24 hours).\n\nPayment ID: ${data.paymentId}\n\nYou can check your payment status in the admin panel.`);
        // Refresh profile
        try {
          await refreshProfile();
        } catch (err) {
          console.error('Profile refresh error:', err);
        }
        onConfirm();
        onClose();
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment failed. Please try again or contact support.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5 text-white relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Buy Credits</h3>
              <p className="text-sm text-white/80">You need {creditsNeeded} credits for this analysis</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* Credit Packages */}
          <div className="mb-6">
            <div className="text-sm font-semibold text-slate-700 mb-3">Select Credit Package</div>
            <div className="grid grid-cols-2 gap-3">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.credits}
                  onClick={() => setSelectedPackage(pkg.credits)}
                  className={`
                    relative p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${selectedPackage === pkg.credits 
                      ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-200' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                    }
                  `}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={10} /> Best
                    </div>
                  )}
                  <div className="font-bold text-slate-900">{pkg.credits} Credits</div>
                  <div className="text-xl font-extrabold text-slate-900">৳{pkg.price}</div>
                  <div className="text-xs text-slate-500">৳{pkg.perPage}/page</div>
                  {selectedPackage === pkg.credits && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={18} className="text-brand-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Selected Package</span>
              <span className="font-bold text-slate-900">{currentPackage.credits} Credits</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Credits Needed Now</span>
              <span className="font-bold text-brand-600">-{creditsNeeded}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-sm text-slate-600">Remaining Credits</span>
              <span className="font-bold text-green-600">+{currentPackage.credits - creditsNeeded}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              💡 Extra credits never expire. Use for future analyses!
            </p>
          </div>

          {/* Payment Methods */}
          <div className="text-sm font-semibold text-slate-700 mb-3">Payment Method</div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div 
              onClick={() => setMethod('bkash')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${method === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center text-white font-bold text-xs">bKash</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">bKash</p>
              </div>
              {method === 'bkash' && <CheckCircle size={16} className="text-pink-600" />}
            </div>

            <div 
              onClick={() => setMethod('nagad')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${method === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs">Nagad</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Nagad</p>
              </div>
              {method === 'nagad' && <CheckCircle size={16} className="text-orange-600" />}
            </div>
          </div>

          {/* Payment Instructions and Transaction ID Input - Always shown */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">📱 Payment Instructions:</p>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Step 1:</strong> Send <strong className="text-lg">৳{currentPackage.price}</strong> to:
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <p className="text-2xl font-bold text-blue-900 text-center">
                      {method === 'bkash' ? 'bKash: 01613078101' : 'Nagad: 01613078101'}
                    </p>
                  </div>
                  <p className="text-xs text-blue-600 mb-2">
                    💡 Open your {method === 'bkash' ? 'bKash' : 'Nagad'} app and send the money
                  </p>
                  <p className="text-xs text-blue-600">
                    📋 Copy the transaction ID from your {method === 'bkash' ? 'bKash' : 'Nagad'} app after sending
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <strong>Step 2:</strong> Enter Transaction ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  placeholder={`Enter ${method === 'bkash' ? 'bKash' : 'Nagad'} transaction ID`}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-center text-lg"
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  ⏳ After submission, admin will verify and add credits within 24 hours
                </p>
              </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className={`w-full py-4 px-4 rounded-xl font-bold text-lg text-white shadow-xl shadow-brand-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]
              ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ৳${currentPackage.price} for ${currentPackage.credits} Credits`
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
            <Lock size={12} />
            <span>Manual verification - Credits added after admin approval</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
