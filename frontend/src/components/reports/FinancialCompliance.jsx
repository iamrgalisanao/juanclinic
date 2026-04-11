import React from 'react';
import { ShieldAlert } from 'lucide-react';

const FinancialCompliance = () => (
    <div className="flex flex-col items-center justify-center p-20 bg-his-slate-50 rounded-[2rem] border border-dashed border-his-slate-200">
        <ShieldAlert className="w-12 h-12 text-his-slate-300 mb-4" />
        <h3 className="text-lg font-black text-his-slate-900 uppercase tracking-tight">Analytical Module Protected</h3>
        <p className="text-xs font-bold text-his-slate-400 mt-2 uppercase tracking-widest text-center px-10">
            Automated BIR/VAT audit features are currently being synchronized for v1.40.0 orchestration.
        </p>
    </div>
);

export default FinancialCompliance;
