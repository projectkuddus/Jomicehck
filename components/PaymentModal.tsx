
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
  const { user, refreshProfile } = useAuth();
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'sslcommerz'>('bkash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [showTransactionInput, setShowTransactionInput] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(() => {
    // Auto-select the best package for user's needs
    const recommended = creditPackages.find(p => p.credits >= creditsNeeded) || creditPackages[1];
    return recommended.credits;
  });

  if (!isOpen) return null;

  const currentPackage = creditPackages.find(p => p.credits === selectedPackage)!;
  const packageId = creditPackages.findIndex(p => p.credits === selectedPackage) === 0 ? 'starter' :
                    creditPackages.findIndex(p => p.credits === selectedPackage) === 1 ? 'popular' :
                    creditPackages.findIndex(p => p.credits === selectedPackage) === 2 ? 'pro' : 'agent';

  const handlePay = async () => {
    if (!user) {
      setError('Please login to make a payment');
      return;
    }

    // For bKash/Nagad, require transaction ID
    if ((method === 'bkash' || method === 'nagad') && !transactionId.trim()) {
      setShowTransactionInput(true);
      setError('Please enter your transaction ID');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
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

      // Check if response is ok before parsing
      if (!response.ok) {
        let errorMessage = 'Payment failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server. Please try again.');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      if (data.status === 'pending_verification') {
        // Manual verification needed
        setError(null);
        alert(`Payment submitted! Your ${data.credits} credits will be added after verification. Payment ID: ${data.paymentId}`);
        // Refresh profile to get updated credits (if any were added)
        try {
          await refreshProfile();
        } catch (err) {
          console.error('Profile refresh error:', err);
          // Don't block - payment was submitted successfully
        }
        onConfirm();
        onClose();
      } else if (data.paymentUrl) {
        // SSLCommerz redirect
        window.location.href = data.paymentUrl;
      } else {
        // Success
        try {
          await refreshProfile();
        } catch (err) {
          console.error('Profile refresh error:', err);
        }
        onConfirm();
        onClose();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again or contact support.');
      setIsProcessing(false);
    }
  };

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setTransactionId('');
      setError(null);
      setShowTransactionInput(false);
    }
  }, [isOpen]);

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
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div 
              onClick={() => { setMethod('bkash'); setShowTransactionInput(true); }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${method === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="w-10 h-10 rounded-lg bg-pink-600 flex items-center justify-center text-white font-bold text-xs">bKash</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">bKash</p>
              </div>
              {method === 'bkash' && <CheckCircle size={16} className="text-pink-600" />}
            </div>

            <div 
              onClick={() => { setMethod('nagad'); setShowTransactionInput(true); }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${method === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs">Nagad</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Nagad</p>
              </div>
              {method === 'nagad' && <CheckCircle size={16} className="text-orange-600" />}
            </div>

            <div 
              onClick={() => { setMethod('sslcommerz'); setShowTransactionInput(false); }}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${method === 'sslcommerz' ? 'border-green-500 bg-green-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-xs">Card</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Card</p>
              </div>
              {method === 'sslcommerz' && <CheckCircle size={16} className="text-green-600" />}
            </div>
          </div>

          {/* Transaction ID Input for bKash/Nagad */}
          {(showTransactionInput && (method === 'bkash' || method === 'nagad')) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">Payment Instructions:</p>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Step 1:</strong> Send <strong>৳{currentPackage.price}</strong> to:
                  </p>
                  <p className="text-lg font-bold text-blue-900 mb-1">
                    {method === 'bkash' ? 'bKash: 01613078101' : 'Nagad: 01613078101'}
                  </p>
                  <p className="text-xs text-blue-600">
                    Send money and copy the transaction ID from your {method === 'bkash' ? 'bKash' : 'Nagad'} app
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Transaction ID ({method === 'bkash' ? 'bKash' : 'Nagad'})
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={`Enter your ${method === 'bkash' ? 'bKash' : 'Nagad'} transaction ID`}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  <strong>Step 2:</strong> After sending payment, enter the transaction ID from your {method === 'bkash' ? 'bKash' : 'Nagad'} app.
                </p>
              </div>
            </div>
          )}

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
            <span>Secure payment via {method === 'bkash' ? 'bKash' : 'Nagad'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
