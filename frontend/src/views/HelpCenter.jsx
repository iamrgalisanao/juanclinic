import React, { useState } from 'react';

const HelpCenter = () => {
    const [activeTab, setActiveTab] = useState('provisioning');

    const steps = {
        provisioning: [
            {
                title: "Login as System Admin",
                description: "Ensure you are using the 'System Admin' profile from the user switcher (top right). Only global admins can manage organizations.",
                icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            },
            {
                title: "Navigate to Organization Settings",
                description: "Click on 'Organization Settings' in the sidebar to open the Tenant Management console.",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            },
            {
                title: "Provision New Instance",
                description: "Click '+ New Organization'. Enter a business name (e.g. 'City General Hospital') and a unique system slug.",
                icon: "M12 4v16m8-8H4"
            }
        ],
        branches: [
            {
                title: "Select Tenant Context",
                description: "Before creating a branch, select the target clinic from the top-bar tenant switcher.",
                icon: "M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14z"
            },
            {
                title: "Branch Configuration",
                description: "Go to 'Branch Settings'. Click '+ New Branch' and select the 'Assigned Tenant' if you are a global admin.",
                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            },
            {
                title: "Validation & Save",
                description: "Ensure all required fields (*) are filled. The system will provide real-time feedback for any errors.",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            }
        ]
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Help Center</h2>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Operational Manual & Best Practices</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Navigation */}
                <div className="lg:col-span-4 space-y-4">
                    <button
                        onClick={() => setActiveTab('provisioning')}
                        className={`w-full p-8 rounded-[2rem] border transition-all duration-500 text-left group overflow-hidden relative ${activeTab === 'provisioning' ? 'bg-slate-900 border-slate-900 shadow-2xl' : 'bg-white border-his-slate-100 hover:border-his-green-500 shadow-sleek'}`}
                    >
                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${activeTab === 'provisioning' ? 'text-his-green-500' : 'text-slate-400'}`}>Foundation</div>
                        <h3 className={`text-xl font-black ${activeTab === 'provisioning' ? 'text-white' : 'text-slate-900'}`}>Organization Setup</h3>
                        <p className={`text-xs mt-4 leading-relaxed font-bold ${activeTab === 'provisioning' ? 'text-slate-400' : 'text-slate-500'}`}>How to provision new healthcare instances and manage global entities.</p>

                        <div className={`absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-700 ${activeTab === 'provisioning' ? 'text-white' : 'text-slate-900'}`}>
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('branches')}
                        className={`w-full p-8 rounded-[2rem] border transition-all duration-500 text-left group overflow-hidden relative ${activeTab === 'branches' ? 'bg-slate-900 border-slate-900 shadow-2xl' : 'bg-white border-his-slate-100 hover:border-his-green-500 shadow-sleek'}`}
                    >
                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${activeTab === 'branches' ? 'text-his-green-500' : 'text-slate-400'}`}>Expansion</div>
                        <h3 className={`text-xl font-black ${activeTab === 'branches' ? 'text-white' : 'text-slate-900'}`}>Branch Integration</h3>
                        <p className={`text-xs mt-4 leading-relaxed font-bold ${activeTab === 'branches' ? 'text-slate-400' : 'text-slate-500'}`}>Manual for creating facilities and assigning them to active organizations.</p>

                        <div className={`absolute -bottom-6 -right-6 opacity-5 group-hover:scale-110 transition-transform duration-700 ${activeTab === 'branches' ? 'text-white' : 'text-slate-900'}`}>
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1h-1 4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                    </button>

                    <div className="bg-his-green-500/10 rounded-[2rem] p-8 border border-his-green-500/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-his-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-his-green-600 uppercase tracking-widest">Compliance Tip</span>
                        </div>
                        <p className="text-[11px] font-bold text-his-green-700 leading-relaxed">
                            Always ensure the unique slug matches the registered business identifier for tax and compliance reporting.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-8 bg-white rounded-[3rem] p-12 shadow-sleek border border-his-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 text-his-slate-50">
                        <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d={steps[activeTab][0].icon} /></svg>
                    </div>

                    <div className="relative z-10 space-y-12">
                        {steps[activeTab].map((step, index) => (
                            <div key={index} className="flex gap-8 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-his-slate-900 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-slate-900/10">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={step.icon} /></svg>
                                    </div>
                                    {index < steps[activeTab].length - 1 && (
                                        <div className="w-0.5 h-full bg-his-slate-100 my-4" />
                                    )}
                                </div>
                                <div className="pt-2">
                                    <h4 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        <span className="text-his-green-500 font-mono italic">0{index + 1}.</span>
                                        {step.title}
                                    </h4>
                                    <p className="text-slate-500 font-bold text-sm mt-3 leading-relaxed max-w-lg">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 pt-10 border-t border-his-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-his-slate-100 border-2 border-white" />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">35 other admins viewed this guide today</span>
                        </div>
                        <button className="flex items-center gap-2 text-his-green-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all group px-6 py-3 bg-his-green-50 rounded-xl">
                            Start Tutorial
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
