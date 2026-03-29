import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const ImmunizationLedger = ({ roadmap = [] }) => {
  if (roadmap.length === 0) {
    return (
      <div className="bg-slate-50/50 rounded-3xl p-10 text-center border border-slate-100 border-dashed">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Immunization roadmap not available.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ADMINISTERED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'OVERDUE': return 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ADMINISTERED': return <CheckCircle2 className="w-4 h-4" />;
      case 'OVERDUE': return <AlertTriangle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-his-green-500" />
          Mandatory Immunization Roadmap
        </h3>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-0.5 rounded-full">Source: PH DOH NIP</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roadmap.map((item, idx) => (
          <div 
            key={idx} 
            className={`p-5 rounded-3xl border transition-all duration-300 group hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${getStatusColor(item.status)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                 <div className={`p-1.5 rounded-lg bg-white/50 border border-white/20`}>
                   {getStatusIcon(item.status)}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">{item.status}</span>
              </div>
              <span className="text-[9px] font-black uppercase opacity-60">Dose {item.dose_number}</span>
            </div>
            
            <h4 className="text-sm font-black text-slate-900 leading-tight mb-1">{item.vaccine_name}</h4>
            <p className="text-[10px] font-bold text-slate-500 mb-4 opacity-80">
                {item.recommended_age_weeks !== null ? `${item.recommended_age_weeks} Weeks` : `${item.recommended_age_months} Months`} Old
            </p>

            <div className="flex justify-between items-center pt-3 border-t border-black/5">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-50">Due Date</span>
                    <span className="text-[11px] font-black text-slate-900">{new Date(item.due_date).toLocaleDateString()}</span>
                </div>
                {item.administered_at && (
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-tighter opacity-50 text-emerald-600">Administered On</span>
                        <span className="text-[11px] font-black text-emerald-700">{new Date(item.administered_at).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImmunizationLedger;
