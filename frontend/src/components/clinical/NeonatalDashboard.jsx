import React, { useState, useEffect } from 'react';
import { 
  Baby, 
  Activity, 
  TrendingUp, 
  Thermometer, 
  Heart,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import { getNeonatalSummary } from '../../services/api';

const NeonatalDashboard = ({ patientId, patient }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNeonatalData();
  }, [patientId]);

  const fetchNeonatalData = async () => {
    setLoading(true);
    try {
      const data = await getNeonatalSummary(patientId);
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch neonatal summary", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-black text-slate-400 animate-pulse uppercase tracking-[0.2em]">Resolving Neonatal History...</div>;
  if (!summary) return null;

  const apgarScore = summary.apgar_score ? parseInt(summary.apgar_score) : null;
  const isHighRisk = (apgarScore !== null && apgarScore < 7) || summary.is_premature;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Stat Area */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <Baby size={160} />
        </div>
        
        <div className="relative z-10 flex items-center gap-6">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${isHighRisk ? 'bg-rose-500 shadow-rose-500/20 animate-pulse' : 'bg-his-green-500 shadow-his-green-500/20'}`}>
                <Baby size={40} />
            </div>
            <div>
                <h2 className="text-3xl font-black tracking-tighter">Neonatal Care Unit</h2>
                <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/10 rounded-full border border-white/10">
                        {Math.floor(summary.current_age_days)} Days Chronological
                    </span>
                    {summary.is_premature && (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-amber-500 rounded-full text-slate-900">
                            Preterm • GA {summary.gestational_weeks}w
                        </span>
                    )}
                </div>
            </div>
        </div>

        <div className="relative z-10 flex flex-col items-end">
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {summary.is_premature ? 'Corrected Age' : 'Clinical Status'}
                </p>
                <div className="flex items-baseline gap-2">
                    {summary.is_premature ? (
                        <>
                            <span className="text-4xl font-black">{Math.floor(summary.corrected_age_days)}</span>
                            <span className="text-xs font-black uppercase text-slate-400">Days</span>
                        </>
                    ) : (
                        <span className="text-xl font-black uppercase text-his-green-500 tracking-tighter">Full Term</span>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Grid of Specialized Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* APGAR Card */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sleek flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">APGAR Score</div>
                <Activity size={16} className={apgarScore < 7 ? 'text-rose-500' : 'text-his-green-500'} />
            </div>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${apgarScore < 7 ? 'text-rose-500' : 'text-slate-900'}`}>
                    {summary.apgar_score || '--'}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase">/ 10</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-4 leading-relaxed">
                {apgarScore >= 7 
                    ? "Normal adaptation to extrauterine life." 
                    : "Observation and monitoring required."}
            </p>
        </div>

        {/* Birth Weight Card */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sleek flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Birth Weight</div>
                <TrendingUp size={16} className="text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900">
                    {summary.birth_weight_g ? (summary.birth_weight_g / 1000).toFixed(2) : '--'}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase">kg</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-4 leading-relaxed">
                Initial delivery weight recorded at birth encounter.
            </p>
        </div>

        {/* Weight Velocity Card */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sleek flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight Velocity</div>
                <TrendingUp size={16} className={summary.weight_gain_g >= 0 ? 'text-his-green-300' : 'text-rose-300'} />
            </div>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${(summary.weight_gain_g || 0) >= 0 ? 'text-his-green-500' : 'text-rose-500'}`}>
                    {summary.weight_gain_g ? `+${summary.weight_gain_g.toFixed(0)}` : '--'}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase">g Total</span>
            </div>
            <div className="mt-2 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full ${summary.weight_gain_percent >= 10 ? 'bg-his-green-500' : 'bg-blue-400'}`}
                    style={{ width: `${Math.min(100, Math.abs(summary.weight_gain_percent || 0) * 5)}%` }}
                />
            </div>
        </div>

        {/* Status Alert Card */}
        <div className={`rounded-[2rem] p-6 border flex flex-col justify-between ${isHighRisk ? 'bg-rose-50 border-rose-100' : 'bg-his-green-50 border-his-green-100'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`text-[10px] font-black uppercase tracking-widest ${isHighRisk ? 'text-rose-600' : 'text-his-green-600'}`}>Risk Category</div>
                <AlertCircle size={16} className={isHighRisk ? 'text-rose-500' : 'text-his-green-500'} />
            </div>
            <div className="text-xl font-black uppercase tracking-tighter">
                <span className={isHighRisk ? 'text-rose-600' : 'text-his-green-600'}>
                    {isHighRisk ? 'High Surveillance' : 'Standard Routine'}
                </span>
            </div>
            <p className={`text-[9px] font-bold mt-4 leading-relaxed ${isHighRisk ? 'text-rose-400' : 'text-his-green-400'}`}>
                {isHighRisk ? 'Prioritize intensive vital sign frequency.' : 'Patient exhibiting typical newborn adaptation.'}
            </p>
        </div>
      </div>

      {/* APGAR Trend Box */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sleek">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                    <Activity size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Clinical Adaptation History</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">APGAR Chronology @ T-Intervals</p>
                </div>
            </div>

            {summary.apgar_history && summary.apgar_history.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {summary.apgar_history.map((record, i) => (
                        <div key={i} className="border-l-4 border-slate-900 pl-6 py-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{record.label}</p>
                             <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-900">{record.score}</span>
                                <span className="text-[10px] font-bold text-slate-400">/ 10</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tight">{record.remarks}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <FileText size={40} className="text-slate-200 mb-4" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No Historical APGAR Logs Detected</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Historical trends will populate once recorded in Birth encounters.</p>
                </div>
            )}
      </div>
    </div>
  );
};

export default NeonatalDashboard;
