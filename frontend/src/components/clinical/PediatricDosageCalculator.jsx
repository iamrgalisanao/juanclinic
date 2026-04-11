import React, { useState } from 'react';

const PediatricDosageCalculator = ({ patientWeight, onApply }) => {
    const [dosePerKg, setDosePerKg] = useState('');
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (!patientWeight || !dosePerKg) return;
        const total = parseFloat(patientWeight) * parseFloat(dosePerKg);
        setResult(total.toFixed(2));
    };

    return (
        <div className="bg-his-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl border border-white/5 space-y-6 animate-in slide-in-from-right duration-500">
            <header className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-his-green-500 flex items-center justify-center italic font-black text-xs shadow-xl shadow-his-green-500/20">PX</div>
                <div>
                    <h3 className="text-sm font-black tracking-tight uppercase italic">Pediatric Dosing Protocol</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ensuring Clinical Safety for Children</p>
                </div>
            </header>

            <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Weight</span>
                    <span className="text-lg font-black">{patientWeight || '0.00'} <span className="text-xs text-slate-500">KG</span></span>
                </div>

                <div className="space-y-2">
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Target Dosage (mg/kg)</label>
                    <input 
                        type="number"
                        placeholder="e.g. 15"
                        value={dosePerKg}
                        onChange={(e) => setDosePerKg(e.target.value)}
                        className="w-full bg-white/10 border border-white/5 rounded-2xl p-4 text-sm font-black focus:border-his-green-500/50 outline-none transition-all"
                    />
                </div>

                <button 
                    onClick={calculate}
                    className="w-full py-4 bg-his-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-his-green-500/20 active:scale-95 transition-all"
                >
                    Compute Total Dose
                </button>
            </div>

            {result && (
                <div className="pt-6 border-t border-white/5 text-center animate-in zoom-in-95 duration-300">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Recommended Clinical Load</p>
                    <p className="text-4xl font-black text-his-green-500 italic">
                        {result} <span className="text-sm text-white">MG</span>
                    </p>
                    <button 
                        onClick={() => onApply(result)}
                        className="mt-6 text-[9px] font-black text-slate-300 uppercase underline tracking-widest hover:text-white transition-colors"
                    >
                        Apply to Prescription Form
                    </button>
                </div>
            )}

            <footer className="pt-4 text-center">
                <p className="text-[8px] font-bold text-slate-600 uppercase leading-relaxed">
                    Calculation based on latest Vital capture. Always verify against clinical guidelines.
                </p>
            </footer>
        </div>
    );
};

export default PediatricDosageCalculator;
