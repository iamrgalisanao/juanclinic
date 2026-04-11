import React, { useState, useEffect } from 'react';

const PatientChronicle = ({ historyData, trends }) => {
    const [range, setRange] = useState(12); // 5, 10, 12
    const [activeTab, setActiveTab] = useState('TIMELINE'); // TIMELINE, TRENDS

    if (!historyData) return null;

    const DeltaTag = ({ value, label }) => {
        const isPositive = value > 0;
        const color = isPositive ? 'text-rose-500 bg-rose-50' : 'text-emerald-500 bg-emerald-50';
        return (
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${color}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(value)}{label}
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header / Nav */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Clinical Chronicle</h2>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Longitudinal History & Trend Intelligence</p>
                </div>
                <div className="flex gap-4 p-1.5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('TIMELINE')}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'TIMELINE' ? 'bg-his-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        Timeline
                    </button>
                    <button 
                        onClick={() => setActiveTab('TRENDS')}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'TRENDS' ? 'bg-his-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        Trend Engine
                    </button>
                </div>
            </div>

            {activeTab === 'TRENDS' ? (
                <div className="space-y-10">
                    {/* Range Selector */}
                    <div className="flex justify-center gap-4">
                        {[5, 10, 12].map(r => (
                            <button 
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border-2 ${range === r ? 'bg-his-green-500 border-his-green-500 text-white shadow-xl rotate-[-2deg]' : 'bg-white border-slate-100 text-slate-400'}`}
                            >
                                Last {r} Months
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Weight Trend */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sleek space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Weight Trajectory</p>
                                    <h3 className="text-2xl font-black mt-2 text-slate-900">{trends.weight?.current} <span className="text-sm">KG</span></h3>
                                </div>
                                <DeltaTag value={trends.weight?.delta} label="%" />
                            </div>
                            <div className="h-24 w-full flex items-end gap-1">
                                {trends.weight?.history.slice(0, range).map((h, i) => (
                                    <div key={i} className="flex-1 bg-his-green-500 opacity-20 hover:opacity-100 transition-all rounded-t-lg" style={{ height: `${Math.max((h.val / trends.weight.current) * 100, 10)}%` }} />
                                ))}
                            </div>
                        </div>

                        {/* Pulse Trend */}
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sleek space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cardiac Rhythm</p>
                                    <h3 className="text-2xl font-black mt-2 text-slate-900">{trends.pulse?.current} <span className="text-sm">BPM</span></h3>
                                </div>
                                <DeltaTag value={trends.pulse?.delta} label=" bpm" />
                            </div>
                            <div className="h-24 w-full flex items-end gap-1">
                                {trends.pulse?.history.slice(0, range).map((h, i) => (
                                    <div key={i} className="flex-1 bg-his-slate-900 opacity-20 hover:opacity-100 transition-all rounded-t-lg" style={{ height: `${Math.max((h.val / trends.pulse.current) * 100, 10)}%` }} />
                                ))}
                            </div>
                        </div>

                        {/* BP Summary */}
                        <div className="bg-his-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-his-green-500 opacity-10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Latest BP Reading</p>
                            <h3 className="text-5xl font-black italic mb-4">{trends.bp?.current}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Previous: {trends.bp?.previous || '---'}</p>
                            <div className="mt-8 flex gap-2">
                                {trends.bp?.history.slice(0, 12).map((h, i) => (
                                    <div key={i} className={`w-1.5 h-8 rounded-full ${h.sys > 140 ? 'bg-rose-500' : 'bg-his-green-500'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 relative">
                    <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-100" />
                    
                    {/* Simplified Timeline Nodes */}
                    {Object.entries(historyData).map(([type, items]) => (
                        items.map((item, idx) => (
                            <div key={`${type}-${idx}`} className="relative pl-24 group">
                                <div className="absolute left-8 w-4 h-4 rounded-full bg-white border-4 border-his-slate-900 z-10 group-hover:scale-125 transition-all" />
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sleek flex justify-between items-center transition-all hover:bg-slate-50/50">
                                    <div className="flex gap-10">
                                        <div className="w-24">
                                            <p className="text-[10px] font-black text-slate-900 uppercase">{new Date(item.created_at || item.appointment_date).toLocaleDateString()}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{type.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">
                                                {item.medication_name || item.test_name || item.reason || 'Clinical Encounter'}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Authorized by Dr. {item.physician?.last_name || item.author?.last_name || 'Juan'}</p>
                                        </div>
                                    </div>
                                    <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors italic underline underline-offset-4">
                                        View Source Result
                                    </button>
                                </div>
                            </div>
                        ))
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientChronicle;
