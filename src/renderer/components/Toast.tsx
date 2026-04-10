import React, { useState, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[999] flex flex-col gap-3">
        {toasts.map(toast => (
          <div 
             key={toast.id}
             className={`
                flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-right-10
                ${toast.type === 'success' ? 'bg-[#1A1A1A] border-[#00E676]/30 text-white' : 'bg-[#1A1A1A] border-red-500/30 text-white'}
             `}
          >
             {toast.type === 'success' ? <CheckCircle className="text-[#00E676]" size={18} /> : <AlertCircle className="text-red-500" size={18} />}
             <span className="text-sm font-bold truncate max-w-[300px]">{toast.message}</span>
             <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-2 hover:opacity-50 transition-opacity">
                <X size={14} />
             </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
