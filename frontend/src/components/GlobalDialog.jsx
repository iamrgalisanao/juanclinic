import React from 'react';
import { useDialog } from '../context/DialogContext';
import { AlertCircle, HelpCircle, Edit3, X, CheckCircle2, ChevronRight } from 'lucide-react';

const GlobalDialog = () => {
    const { dialog, closeDialog, setPromptValue } = useDialog();

    if (!dialog.isOpen) return null;

    const { type, title, message, confirmText, cancelText, inputValue } = dialog;

    const getIcon = () => {
        switch (type) {
            case 'ALERT': return <AlertCircle className="w-8 h-8 text-his-green-500" />;
            case 'CONFIRM': return <HelpCircle className="w-8 h-8 text-amber-500" />;
            case 'PROMPT': return <Edit3 className="w-8 h-8 text-blue-500" />;
            default: return <AlertCircle className="w-8 h-8 text-slate-400" />;
        }
    };

    const getBaseColorClass = () => {
        switch (type) {
            case 'ALERT': return 'bg-his-green-50 text-his-green-500 border-his-green-100';
            case 'CONFIRM': return 'bg-amber-50 text-amber-500 border-amber-100';
            case 'PROMPT': return 'bg-blue-50 text-blue-500 border-blue-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };

    const getButtonColorClass = () => {
        switch (type) {
            case 'ALERT': return 'bg-his-green-500 hover:bg-his-green-600 shadow-his-green-500/20';
            case 'CONFIRM': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20';
            case 'PROMPT': return 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20';
            default: return 'bg-slate-500 hover:bg-slate-600 shadow-slate-500/20';
        }
    };

    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] relative overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
                
                {/* Close Button */}
                <button 
                    onClick={() => closeDialog(type === 'CONFIRM' ? false : null)} 
                    className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100/50"
                >
                    <X className="w-4 h-4" />
                </button>
 
                <div className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 shadow-sm ${getBaseColorClass()}`}>
                        {getIcon()}
                    </div>
 
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                        {title}
                    </h3>
                    
                    <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-8 max-w-xs">
                        {message}
                    </p>
 
                    {type === 'PROMPT' && (
                        <div className="w-full mb-8">
                            <input
                                autoFocus
                                type="text"
                                value={inputValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') closeDialog(inputValue);
                                    if (e.key === 'Escape') closeDialog(null);
                                }}
                                className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500/20 focus:bg-white rounded-xl px-5 py-3.5 text-sm font-bold text-slate-700 transition-all outline-none shadow-inner"
                                placeholder="Enter your response..."
                            />
                        </div>
                    )}
 
                    <div className="flex items-center gap-3 w-full">
                        {type !== 'ALERT' && (
                            <button
                                onClick={() => closeDialog(type === 'PROMPT' ? null : false)}
                                className="flex-1 py-3.5 bg-slate-50 text-slate-500 text-[10px] font-black rounded-xl hover:bg-slate-100 transition-all uppercase tracking-[0.2em] border border-slate-200/50"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={() => closeDialog(type === 'PROMPT' ? inputValue : true)}
                            className={`flex-1 py-3.5 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg ${getButtonColorClass()}`}
                        >
                            <span>{confirmText}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalDialog;
