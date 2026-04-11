import React, { useState } from 'react';

const StaffScheduler = ({ branches }) => {
    const [viewMode, setViewMode] = useState('CALENDAR'); // CALENDAR, LIST
    const [activeBranch, setActiveBranch] = useState(branches?.[0]?.id || 1);

    // Mock data for UI build
    const shifts = [
        { id: 1, name: 'Dr. Sarah Juan', role: 'DOCTOR', time: '08:00 - 16:00', branch: 'Main', status: 'ACTIVE' },
        { id: 2, name: 'Juan Dela Cruz', role: 'TECH', time: '10:00 - 18:00', branch: 'Metropolis', status: 'SWAP_PENDING' },
        { id: 3, name: 'Dr. Arvin Galisanao', role: 'DOCTOR', time: '14:00 - 22:00', branch: 'Main', status: 'ACTIVE' },
    ];

    const RoleBadge = ({ role }) => (
        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-tighter ${role === 'DOCTOR' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-blue-50 text-blue-500 border border-blue-100'}`}>
            {role}
        </span>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Workforce Logistics</h2>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Cross-Branch Clinical Shift Optimization</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <button 
                        onClick={() => setViewMode('CALENDAR')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'CALENDAR' ? 'bg-his-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        Calendar
                    </button>
                    <button 
                        onClick={() => setViewMode('LIST')}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'LIST' ? 'bg-his-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                    >
                        List View
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                
                {/* Branch Navigation & Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sleek space-y-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Select Branch</p>
                            <div className="space-y-3">
                                {['Main Branch', 'Metropolis Branch', 'Remote Clinic'].map(b => (
                                    <button 
                                        key={b}
                                        className={`w-full text-left p-4 rounded-2xl text-xs font-black transition-all border-2 ${activeBranch === b ? 'bg-his-green-50 border-his-green-500 text-his-green-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                                        onClick={() => setActiveBranch(b)}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <button className="w-full py-4 bg-his-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                                Post New Shift
                            </button>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 space-y-4">
                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Active Swap Requests</p>
                        <div className="p-4 bg-white/50 rounded-2xl border border-amber-200">
                            <p className="text-[10px] font-black text-amber-700">Juan D. (Tech)</p>
                            <p className="text-[9px] font-bold text-amber-500 uppercase mt-1">Requested Swap: Sarah J. (Doc)</p>
                            <div className="flex gap-2 mt-4">
                                <button className="flex-1 py-2 bg-amber-500 text-white text-[8px] font-black uppercase rounded-lg">Approve</button>
                                <button className="flex-1 py-2 bg-white text-amber-500 text-[8px] font-black uppercase rounded-lg border border-amber-200">Reject</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Schedule View */}
                <div className="lg:col-span-3 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sleek min-h-[600px]">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all font-black">&lt;</button>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">September 2026</h3>
                            <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all font-black">&gt;</button>
                        </div>
                        <div className="px-5 py-2.5 bg-his-green-50 rounded-2xl border border-his-green-100">
                            <span className="text-[10px] font-black text-his-green-700 uppercase tracking-widest">88% Coverage Optimized</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {shifts.map(shift => (
                            <div key={shift.id} className="group flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white transition-all duration-300">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl font-black text-slate-300 group-hover:text-his-green-500 transition-colors">
                                        {shift.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-black text-slate-900">{shift.name}</p>
                                            <RoleBadge role={shift.role} />
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{shift.time}</p>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{shift.branch} Station</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${shift.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white'}`}>
                                        {shift.status.replace('_', ' ')}
                                    </span>
                                    <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100">
                                        ...
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-his-slate-900 rounded-[2.5rem] border border-white/5 flex items-center justify-between text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-his-green-500 rounded-2xl flex items-center justify-center font-black italic">!</div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest">Scheduling Integrity Alert</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">No cross-branch conflicts detected for 14 active staff.</p>
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Enterprise Workforce v1.29</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffScheduler;
