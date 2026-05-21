import React from 'react';
import { Loader2, Check, AlertCircle, X } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: number;
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  currentOperation?: string;
  details?: {
    linesProcessed?: number;
    bytesProcessed?: number;
    estimatedTime?: number;
  };
  theme: 'light' | 'dark';
  onCancel?: () => void;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress, status, message, currentOperation, details, theme, onCancel,
}) => {
  if (status === 'idle') return null;

  const dark = theme === 'dark';

  const palette = {
    processing: {
      wrap: dark ? 'bg-[#111]/90 border-white/12' : 'bg-white/95 border-slate-200',
      bar: 'bg-blue-500',
      icon: <Loader2 size={16} className="animate-spin text-blue-400" />,
      label: dark ? 'text-white' : 'text-slate-900',
    },
    success: {
      wrap: dark ? 'bg-[#111]/90 border-emerald-500/25' : 'bg-white/95 border-emerald-300',
      bar: 'bg-emerald-500',
      icon: <Check size={16} className="text-emerald-400" />,
      label: dark ? 'text-white' : 'text-slate-900',
    },
    error: {
      wrap: dark ? 'bg-[#111]/90 border-red-500/30' : 'bg-white/95 border-red-300',
      bar: 'bg-red-500',
      icon: <AlertCircle size={16} className="text-red-400" />,
      label: dark ? 'text-white' : 'text-slate-900',
    },
  }[status] ?? {
    wrap: '', bar: '', icon: null, label: '',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 w-72 rounded-2xl border shadow-2xl backdrop-blur-xl p-4
      animate-fade-in ${palette.wrap}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{palette.icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold leading-tight ${palette.label}`}>
              {currentOperation ?? 'Processing JSON'}
            </p>
            {onCancel && status === 'processing' && (
              <button
                onClick={onCancel}
                className={`shrink-0 p-1 rounded-lg transition
                  ${dark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400'}`}
                title="Cancel"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {message && (
            <p className={`text-xs mt-0.5 ${dark ? 'text-white/50' : 'text-slate-500'}`}>
              {message}
            </p>
          )}

          {status === 'processing' && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] mb-1.5 opacity-60">
                <span>{progress}%</span>
                {details?.estimatedTime && <span>~{Math.ceil(details.estimatedTime)}s</span>}
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-slate-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${palette.bar}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {details && (details.linesProcessed || details.bytesProcessed) && (
            <div className={`flex gap-4 mt-2 text-[10px] ${dark ? 'text-white/40' : 'text-slate-400'}`}>
              {details.linesProcessed ? (
                <span>{details.linesProcessed.toLocaleString()} lines</span>
              ) : null}
              {details.bytesProcessed ? (
                <span>{(details.bytesProcessed / 1024 / 1024).toFixed(1)} MB</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
