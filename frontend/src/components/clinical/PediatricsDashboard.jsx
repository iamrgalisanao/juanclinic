import React, { useState, useEffect } from 'react';
import GrowthChart from './GrowthChart';
import ImmunizationLedger from './ImmunizationLedger';
import { getPediatricHistory, storeGrowthRecord, storeImmunizationRecord, getPatient } from '../../services/api';
import { Activity, Plus, TrendingUp, Shield, BarChart3, Baby } from 'lucide-react';

const PediatricsDashboard = ({ patientId, patient }) => {
  const [data, setData] = useState({ growth: [], immunization: { roadmap: [], history: [] } });
  const [loading, setLoading] = useState(true);
  const [showGrowthForm, setShowGrowthForm] = useState(false);
  const [activeView, setActiveView] = useState('GROWTH'); // GROWTH | IMMUNIZATION

  useEffect(() => {
    fetchPediatricData();
  }, [patientId, patient?.gender]);

  const fetchPediatricData = async () => {
    setLoading(true);
    try {
      const [growth, immunization] = await Promise.all([
        getPediatricHistory(patientId),
        getPediatricHistory(patientId, 'immunizations')
      ]);
      setData({ growth, immunization });
    } catch (err) {
      console.error("Failed to fetch pediatric data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrowthSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
        weight_kg: formData.get('weight_kg'),
        height_cm: formData.get('height_cm'),
        head_circumference_cm: formData.get('head_circumference_cm'),
        measured_at: formData.get('measured_at')
    };
    try {
        await storeGrowthRecord(patientId, payload);
        setShowGrowthForm(false);
        fetchPediatricData();
    } catch (err) {
        console.error("Failed to record growth", err);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse uppercase tracking-[0.2em] italic">Consolidating Pediatric Datasets...</div>;

  const latestGrowth = data.growth[data.growth.length - 1] || {};

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sleek relative overflow-hidden group hover:border-his-green-500/30 transition-all flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <Activity size={80} />
            </div>
            <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-his-green-500" />
                    Latest Vitals
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{latestGrowth.weight_kg || '--'}</span>
                    <span className="text-xs font-black text-slate-400 uppercase">kg</span>
                    <span className="text-slate-200 mx-2">/</span>
                    <span className="text-3xl font-black text-slate-900">{latestGrowth.height_cm || '--'}</span>
                    <span className="text-xs font-black text-slate-400 uppercase">cm</span>
                </div>
                {latestGrowth.head_circumference_cm && (
                    <p className="text-[10px] font-black text-slate-600 mt-2 uppercase tracking-widest">
                        HC: <span className="text-slate-900">{latestGrowth.head_circumference_cm} cm</span>
                    </p>
                )}
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">
                Recorded {latestGrowth.measured_at ? new Date(latestGrowth.measured_at).toLocaleDateString() : 'Never'}
            </p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sleek relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <BarChart3 size={80} />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Z-Score Analysis
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                    { label: 'Weight', z: latestGrowth.analysis?.weight_for_age_z, p: latestGrowth.analysis?.weight_for_age_percentile },
                    { label: 'Height', z: latestGrowth.analysis?.height_for_age_z, p: latestGrowth.analysis?.height_for_age_percentile },
                    { label: 'BMI', z: latestGrowth.analysis?.bmi_for_age_z, p: latestGrowth.analysis?.bmi_for_age_percentile },
                    { label: 'Head Circ.', z: latestGrowth.analysis?.head_circum_z, p: latestGrowth.analysis?.head_circum_percentile },
                ].map((m, idx) => (
                    <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                            <span className={`text-[10px] font-black ${Math.abs(Number(m.z || 0)) > 2 ? 'text-rose-500' : 'text-slate-900'}`}>{m.z ? Number(m.z).toFixed(1) : '--'}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${Math.abs(Number(m.z || 0)) > 2 ? 'bg-rose-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, (Number(m.p || 0)) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sleek relative overflow-hidden group hover:border-rose-500/30 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <Shield size={80} />
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Vaccination Status
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                    {data.immunization.roadmap.filter(i => i.status === 'OVERDUE').length}
                </span>
                <span className="text-rose-500 text-[10px] font-black uppercase tracking-widest">Overdue Doses</span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-his-green-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(data.immunization.roadmap.filter(i => i.status === 'ADMINISTERED').length / (data.immunization.roadmap.length || 1)) * 100}%` }}
                />
            </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex gap-4 border-b border-slate-100 px-4">
        <button
            onClick={() => setActiveView('GROWTH')}
            className={`pb-4 px-6 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeView === 'GROWTH' ? 'text-his-green-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-his-green-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <div className="flex items-center gap-2">
                <TrendingUp size={14} />
                Growth Charts
            </div>
        </button>
        <button
            onClick={() => setActiveView('IMMUNIZATION')}
            className={`pb-4 px-6 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeView === 'IMMUNIZATION' ? 'text-rose-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-rose-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <div className="flex items-center gap-2">
                <Shield size={14} />
                Immunization Ledger
            </div>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-his-slate-100 shadow-sleek min-h-[500px]">
        {activeView === 'GROWTH' ? (
            <div className="animate-in fade-in duration-500 slide-in-from-right-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-his-green-500" />
                        Longitudinal Development Lines
                    </h3>
                    <button 
                        onClick={() => setShowGrowthForm(true)}
                        className="p-3 bg-his-green-500 text-white rounded-2xl shadow-xl shadow-his-green-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <GrowthChart data={data.growth} type="weight" gender={patient?.gender || 'M'} />
                   <GrowthChart data={data.growth} type="height" gender={patient?.gender || 'M'} />
                   <GrowthChart data={data.growth} type="bmi" gender={patient?.gender || 'M'} />
                   <GrowthChart data={data.growth} type="head_circumference" gender={patient?.gender || 'M'} />
                </div>
            </div>
        ) : (
            <div className="animate-in fade-in duration-500 slide-in-from-left-2">
                <ImmunizationLedger roadmap={data.immunization.roadmap} />
            </div>
        )}
      </div>

      {showGrowthForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-his-green-500 text-white flex items-center justify-center shadow-lg shadow-his-green-500/20">
                          <Baby size={24} />
                      </div>
                      <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">Record Growth Vitals</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Capture Physiological Markers</p>
                      </div>
                  </div>

                  <form onSubmit={handleGrowthSubmit} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                              <input required type="number" step="0.01" name="weight_kg" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
                              <input required type="number" step="0.1" name="height_cm" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all" />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Head Circ. (cm)</label>
                          <input type="number" step="0.1" name="head_circumference_cm" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Measurement Date</label>
                          <input required type="date" name="measured_at" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all" />
                      </div>
                      <div className="flex gap-4 pt-4">
                          <button type="button" onClick={() => setShowGrowthForm(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 text-xs font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-[0.2em]">Cancel</button>
                          <button type="submit" className="flex-1 py-4 bg-his-green-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-[0.2em]">Save Markers</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default PediatricsDashboard;
