import React, { useState } from 'react';

const EngagementSettings = () => {
    const [settings, setSettings] = useState({
        reminders_enabled: true,
        reminder_window_hours: 24,
        support_tl: true,
        support_en: true,
        email_confirmation_enabled: true,
        manual_override: false
    });

    const StatsCard = ({ label, value, trend, color = 'his-green' }) => (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sleek flex flex-col justify-between h-full">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
            <div className="mt-4 flex items-end justify-between">
                <span className="text-2xl font-black text-slate-900">{value}</span>
                <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${color === 'his-green' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>{trend}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Engagement Concierge</h2>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">Closing the clinical diagnostic loop</p>
                </div>
                <div className="flex items-center gap-4 px-4 py-2 bg-his-green-50 rounded-2xl border border-his-green-100">
                    <div className="w-2 h-2 rounded-full bg-his-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-his-green-700 uppercase tracking-widest">Reminders Active (v1.25)</span>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard label="Outreach Volume" value="1,240" trend="+12% MoM" />
                <StatsCard label="No-Show Rate" value="4.2%" trend="-28% Efficiency" color="blue" />
                <StatsCard label="Confirmation Rate" value="88%" trend="High Intent" />
            </div>

            {/* Settings Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Global Outreach Config */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-slate-100 space-y-8">
                    <header>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">Outreach Configuration</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Global parameters for automated patient messaging.
                        </p>
                    </header>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Master Reminder Switch</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Toggle all automated SMS/Email outreach</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, reminders_enabled: !settings.reminders_enabled})}
                                className={`w-14 h-8 rounded-full p-1.5 transition-all ${settings.reminders_enabled ? 'bg-his-green-500' : 'bg-slate-300'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-all ${settings.reminders_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Reminder Window</label>
                            <div className="grid grid-cols-3 gap-4">
                                {[24, 48, 72].map(hrs => (
                                    <button 
                                        key={hrs}
                                        onClick={() => setSettings({...settings, reminder_window_hours: hrs})}
                                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${settings.reminder_window_hours === hrs ? 'bg-his-slate-900 border-his-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >
                                        {hrs}h Before
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Templates & Localization */}
                <div className="bg-his-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col justify-between">
                    <div>
                        <header className="mb-8">
                            <h3 className="text-lg font-black tracking-tight mb-2 italic">Clinical Localization</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                Supporting the Philippines diversity in communication.
                            </p>
                        </header>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                                <span className="w-10 h-10 rounded-xl bg-his-green-500 flex items-center justify-center font-black text-xs">EN</span>
                                <div className="flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest">English Template</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Standard clinical concierge</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-his-green-500" />
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                                <span className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-black text-xs">TL</span>
                                <div className="flex-1">
                                    <p className="text-xs font-black uppercase tracking-widest">Tagalog Template</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Localized Patient Paalala v2</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-his-green-500" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-his-green-500 flex items-center justify-center text-white italic font-black">!</div>
                        <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">
                            All templates comply with RA 10173 (Data Privacy Act). No PHI is transmitted via SMS/Clear-text channels.
                        </p>
                    </div>
                </div>

            </div>

            {/* Footer / Info */}
            <div className="flex justify-center pt-6">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    juanclinic engagement engine v1.25 • Closing the Diagnostic Loop
                </p>
            </div>
        </div>
    );
};

export default EngagementSettings;
