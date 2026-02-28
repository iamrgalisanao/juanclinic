import React from 'react';

const Reports = () => {
    const stats = [
        { label: 'Patient Admissions', value: '1,284', trend: '+12.5%', color: 'his-green' },
        { label: 'Total Revenue', value: '$124,500', trend: '+8.3%', color: 'blue' },
        { label: 'Order Completion', value: '94.2%', trend: '+2.1%', color: 'purple' },
    ];

    return (
        <div className="p-10 space-y-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reports & Analytics</h2>
                    <p className="text-sm font-bold text-slate-400 mt-2">Comprehensive overview of clinical and financial performance.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest border border-slate-100 shadow-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Last 30 Days
                    </button>
                    <button className="px-6 py-3 bg-his-green-500 text-white text-xs font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map(s => (
                    <div key={s.label} className="bg-white p-8 rounded-[2rem] shadow-sleek border border-his-slate-100 group transition-all duration-500 hover:shadow-2xl">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{s.label}</p>
                        <div className="flex justify-between items-end">
                            <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
                            <span className="text-[11px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{s.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 min-h-[400px] flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Patient Admissions</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly distribution across active clinics</p>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-4 mt-10">
                        {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="flex-1 bg-his-slate-50 rounded-xl relative group cursor-pointer overflow-hidden" style={{ height: `${h}%` }}>
                                <div className="absolute inset-0 bg-his-green-500 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Order Distribution</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">LAB vs RAD volume analysis</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-his-green-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Lab</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Rad</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-56 h-56 rounded-full border-[24px] border-slate-100 relative group">
                            <div className="absolute inset-0 rounded-full border-[24px] border-his-green-500 border-r-transparent border-b-transparent -rotate-45 group-hover:rotate-12 transition-transform duration-1000" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-slate-900 leading-none">64%</span>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Laboratory</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table Preview */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-[0.1em]">Raw Performance Data</h3>
                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Download CSV</button>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between items-center py-6 border-b border-his-slate-50 last:border-0 group cursor-default">
                            <div className="flex gap-4 items-center">
                                <div className="w-10 h-10 rounded-xl bg-his-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-his-green-50 group-hover:text-his-green-500 transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">Performance_Report_Feb_0{i}.pdf</p>
                                    <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">HL7 Bridge Analytics • 4.2 MB</p>
                                </div>
                            </div>
                            <button className="px-5 py-2.5 bg-his-slate-50 text-slate-500 text-[10px] font-black rounded-xl hover:bg-his-slate-100 hover:text-slate-900 transition-all uppercase tracking-widest">Download</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;
