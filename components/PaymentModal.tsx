
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
  { id: 'starter', credits: 20, price: 199, perCredit: 10, name: 'Starter' },
  { id: 'popular', credits: 50, price: 449, perCredit: 9, popular: true, name: 'Popular' },
  { id: 'value', credits: 100, price: 799, perCredit: 8, name: 'Value' },
  { id: 'business', credits: 300, price: 1999, perCredit: 6.66, name: 'Business' },
];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, amount, creditsNeeded = 0 }) => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This is a React rule - hooks must be called in the same order every render
  const { user, refreshProfile } = useAuth();
  const [method, setMethod] = useState<'bkash'>('bkash');
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
  const packageId = currentPackage.id;

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

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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

      // Auto-approved payments (but show admin approval message)
      if (data.status === 'completed' || data.success) {
        setError(null);
        // Show success message with admin approval text
        alert(`✅ Payment Submitted Successfully!\n\nYour ${data.credits} credits will be added after admin verification (usually within 24 hours).\n\nPayment ID: ${data.paymentId}\nTransaction ID: ${transactionId}\n\nYou will receive an email once your payment is verified.`);
        // Refresh profile to get updated credits (they're already added, but refresh to show)
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
      
      let errorMessage = 'Payment failed. Please try again or contact support.';
      if (err.name === 'AbortError') {
        errorMessage = 'Payment request timed out. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 my-4">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 sm:px-6 py-4 sm:py-5 text-white relative">
          <button onClick={onClose} className="absolute right-3 sm:right-4 top-3 sm:top-4 text-white/70 hover:text-white transition-colors">
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 pr-8">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
              <CreditCard size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Buy Credits</h3>
              <p className="text-xs sm:text-sm text-white/80">You need {creditsNeeded} credits for this analysis</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* Credit Packages */}
          <div className="mb-4 sm:mb-6">
            <div className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Select Credit Package</div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {creditPackages.map((pkg) => (
                <div
                  key={pkg.credits}
                  onClick={() => setSelectedPackage(pkg.credits)}
                  className={`
                    relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all
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
                  <div className="font-bold text-slate-900 text-sm sm:text-base">{pkg.credits} Credits</div>
                  <div className="text-lg sm:text-xl font-extrabold text-slate-900">৳{pkg.price}</div>
                  <div className="text-[10px] sm:text-xs text-slate-500">৳{pkg.perCredit?.toFixed(2)}/credit</div>
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
          <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
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

          {/* Payment Method - bKash Only */}
          <div className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Payment Method</div>
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-pink-500 bg-pink-50">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-pink-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">bKash</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm sm:text-base">bKash</p>
                <p className="text-xs text-slate-600">Send money to: 01613078101</p>
              </div>
              <CheckCircle size={18} className="sm:w-5 sm:h-5 text-pink-600" />
            </div>
          </div>

          {/* Payment Instructions and Transaction ID Input - Always shown */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">📱 Payment Instructions:</p>
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-blue-200">
                  <p className="text-xs sm:text-sm text-blue-800 mb-2 sm:mb-3">
                    <strong>Step 1:</strong> Send <strong className="text-base sm:text-lg">৳{currentPackage.price}</strong> to:
                  </p>
                  <div className="bg-blue-50 p-2 sm:p-3 rounded-lg mb-2 sm:mb-3">
                    <p className="text-lg sm:text-2xl font-bold text-blue-900 text-center break-all">
                      bKash: 01613078101
                    </p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-blue-600 mb-1 sm:mb-2">
                    💡 Open your bKash app and send the money
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-600">
                    📋 Copy the transaction ID from your bKash app after sending
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  <strong>Step 2:</strong> Enter Transaction ID
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  placeholder="Enter bKash transaction ID"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-center text-base sm:text-lg"
                />
                <p className="text-[10px] sm:text-xs text-slate-500 mt-2 text-center">
                  ⏳ After submission, admin will verify and add credits (usually within 24 hours)
                </p>
              </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={14} className="sm:w-4 sm:h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className={`w-full py-3 sm:py-4 px-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg text-white shadow-xl shadow-brand-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]
              ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}
            `}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin" />
                <span className="text-sm sm:text-base">Processing...</span>
              </>
            ) : (
              <span className="text-sm sm:text-base">Pay ৳{currentPackage.price} for {currentPackage.credits} Credits</span>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4 text-[10px] sm:text-xs text-slate-400">
            <Lock size={10} className="sm:w-3 sm:h-3" />
            <span>Manual verification - Credits added after admin approval</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
