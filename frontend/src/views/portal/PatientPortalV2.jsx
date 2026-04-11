import React, { useState, useEffect } from 'react';

const PatientPortalV2 = ({ patientId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('SUMMARY'); // SUMMARY, GROWTH, VACCINES, LABS

    // Mock data for UI development
    const mockData = {
        patient: { name: 'Julian Juan', dob: 'September 12, 2025', gender: 'M', external_id: 'JC-90210' },
        clinic: { name: 'JuanClinic Main', branch: 'Metropolis Branch' },
        vitals: [
            { weight_kg: 3.2, recorded_at: '2025-09-12' },
            { weight_kg: 5.1, recorded_at: '2025-11-12' },
            { weight_kg: 7.4, recorded_at: '2026-02-12' },
        ],
        immunizations: [
            { vaccine: 'BCG', administered_at: '2025-09-15' },
            { vaccine: 'Hepatitis B', administered_at: '2025-09-15' },
        ],
        upcoming: [
            { vaccine: 'DPT Booster', due_age: '18 Months', status: 'UPCOMING' },
            { vaccine: 'MMR Dose 2', due_age: '4 Years', status: 'WAITING' },
        ]
    };

    const ProgressBar = ({ label, value, status }) => (
        <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${status === 'DONE' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {status}
            </span>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 sm:pb-0">
            {/* Responsive Fixed Sidebar / Bottom Nav */}
            <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 flex sm:flex-col sm:w-20 sm:h-full sm:border-r sm:border-t-0 p-2 sm:p-4 gap-2 justify-around sm:justify-center">
                {['SUMMARY', 'GROWTH', 'VACCINES', 'LABS'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveSection(tab)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${activeSection === tab ? 'bg-slate-900 text-white shadow-xl rotate-[-4deg]' : 'text-slate-400 hover:bg-slate-100'}`}
                    >
                        <div className="text-[10px] font-black tracking-tighter uppercase">{tab.charAt(0)}</div>
                        <span className="text-[7px] font-black uppercase tracking-widest mt-1 sm:hidden">{tab}</span>
                    </button>
                ))}
            </nav>

            {/* Main Content Area */}
            <main className="sm:ml-20 p-6 md:p-12 max-w-6xl mx-auto space-y-10">
                
                {/* Header Card (Adaptive Gradient) */}
                <header className="relative bg-his-slate-900 rounded-[3rem] p-10 md:p-16 text-white overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-his-green-500 opacity-20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">Hello, {mockData.patient.name}</h1>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Personal Health Portal v2.0</p>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-black text-his-green-500">BRANCH: {mockData.clinic.branch}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {mockData.patient.external_id}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 md:pt-10 border-t border-white/5">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase">Birth Date</p>
                                <p className="text-sm font-black mt-1">{mockData.patient.dob}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase">Gender</p>
                                <p className="text-sm font-black mt-1">{mockData.patient.gender === 'M' ? 'Male' : 'Female'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Adaptive Grid for Clinical Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Growth Analytics (Wait, Weight Chart) */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sleek">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-slate-900 italic tracking-tight">Growth Surveillance</h2>
                                <span className="text-[10px] font-black text-his-green-500 uppercase tracking-widest px-3 py-1 bg-his-green-50 rounded-lg">Weight Chart</span>
                            </div>
                            
                            {/* SVG Chart Container (Responsive) */}
                            <div className="h-64 w-full bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden">
                                <svg className="w-full h-full p-4" viewBox="0 0 400 200">
                                    <path d="M 0,180 Q 200,100 400,20" fill="none" stroke="#e2e8f0" strokeWidth="20" strokeLinecap="round" />
                                    <path d="M 0,180 Q 200,150 400,120" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeDasharray="5,5" />
                                    <circle cx="20" cy="180" r="5" fill="#1e293b" />
                                    <circle cx="200" cy="120" r="5" fill="#1e293b" />
                                    <circle cx="380" cy="40" r="8" fill="#10b981" />
                                </svg>
                            </div>
                            <div className="mt-8 flex justify-between">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DOB (Birth)</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</p>
                            </div>
                        </div>
                    </section>

                    {/* Immunization Sidebar (Adaptive Stack) */}
                    <aside className="space-y-6">
                        <div className="bg-his-green-500 text-white rounded-[2.5rem] p-10 shadow-2xl">
                            <h2 className="text-xl font-black italic tracking-tight mb-8">Vaccination Card</h2>
                            <div className="space-y-4">
                                {mockData.immunizations.map(im => (
                                    <div key={im.vaccine} className="p-4 bg-white/20 rounded-2xl border border-white/10 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-black">{im.vaccine}</p>
                                            <p className="text-[9px] font-bold text-white/60 mt-1 uppercase italic">{im.administered_at}</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-his-green-500">
                                            <svg className="w-3 h-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-8 border-t border-white/10 mt-8">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Upcoming Protection</p>
                                <div className="space-y-2 opacity-80">
                                    <ProgressBar label="DPT Booster (18mo)" status="LATER" />
                                    <ProgressBar label="MMR Dose 2 (4yr)" status="WAITING" />
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>

                {/* Patient Responsibility Disclaimer (Responsive Footer) */}
                <footer className="pt-10 border-t border-slate-200">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Cloud Security Protocol</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                                Data is retrieved securely from JuanClinic HIS. No patient data is stored on this device.
                            </p>
                        </div>
                        <button className="px-8 py-3 bg-slate-100 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                            Revoke Portal Access
                        </button>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default PatientPortalV2;
