
import React, { useState } from 'react';
import { X, CheckCircle, Lock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, amount }) => {
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-center relative">
          <h3 className="text-lg font-bold text-slate-800">Secure Payment</h3>
          <button onClick={onClose} className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="text-center mb-8">
            <p className="text-sm text-slate-500 mb-2">Total Processing Fee</p>
            <div className="text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-1 font-sans tracking-tight">
              <span className="text-2xl text-slate-400">৳</span>
              <span>{amount}</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
              <Lock size={12} />
              SSL Secured
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div 
              onClick={() => setMethod('bkash')}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'bkash' ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-200' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="w-12 h-12 rounded-lg bg-pink-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">bKash</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">bKash</p>
                <p className="text-xs text-slate-500">Personal Account</p>
              </div>
              {method === 'bkash' && <div className="bg-pink-600 text-white rounded-full p-0.5"><CheckCircle size={16} /></div>}
            </div>

            <div 
              onClick={() => setMethod('nagad')}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === 'nagad' ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-200' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">Nagad</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">Nagad</p>
                <p className="text-xs text-slate-500">Personal Account</p>
              </div>
              {method === 'nagad' && <div className="bg-orange-600 text-white rounded-full p-0.5"><CheckCircle size={16} /></div>}
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className={`w-full py-4 px-4 rounded-xl font-bold text-lg text-white shadow-xl shadow-brand-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]
              ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}
            `}
          >
            {isProcessing ? 'Processing Payment...' : `Confirm Payment ৳${amount}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
