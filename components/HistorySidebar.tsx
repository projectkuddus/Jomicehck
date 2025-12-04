
import React from 'react';
import { HistoryItem } from '../types';
import { X, FileText, Clock, Trash2, ChevronRight } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onLoad, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Sidebar */}
      <div className="relative w-full max-w-sm bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
             <h3 className="font-bold text-slate-800 text-lg">My Reports</h3>
             <p className="text-xs text-slate-500">Local History</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Clock size={24} />
              </div>
              <h4 className="font-semibold text-slate-700">No History Yet</h4>
              <p className="text-sm text-slate-500 mt-2">Analyzed documents will appear here automatically.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-brand-300 transition-all cursor-pointer"
                onClick={() => {
                  onLoad(item);
                  onClose();
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <FileText size={16} className="text-brand-600" />
                     <span className="font-semibold text-sm text-slate-800 bangla-text line-clamp-1">
                       {item.result.documentType || "Unknown Doc"}
                     </span>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.result.riskScore > 50 
                      ? 'bg-red-50 text-red-700 border-red-100' 
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    Risk: {item.result.riskScore}
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-3 space-y-1">
                   <p>Mouza: <span className="bangla-text">{item.result.summary.mouza || "N/A"}</span></p>
                   <p>Date: {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                   <span className="text-xs text-brand-600 font-medium flex items-center gap-1 group-hover:underline">
                     View Report <ChevronRight size={12} />
                   </span>
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       onDelete(item.id);
                     }}
                     className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400">
            Data is saved locally on this device. Clearing cache will remove history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistorySidebar;
