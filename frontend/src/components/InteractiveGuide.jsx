import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronRight, CheckCircle2, X } from 'lucide-react';

const guideContent = {
    dashboard: {
        title: "Clinic Dashboard",
        description: "Your daily mission control for clinic operations and patient throughput.",
        steps: [
            { id: 'db1', text: "Monitor real-time patient traffic through the Stats Bar above." },
            { id: 'db2', text: "Review the 'Patient Registry' for a quick glance at active records." },
            { id: 'db3', text: "Use 'Ingest HL7' to simulate incoming diagnostic orders from Lab/Rad." },
            { id: 'db4', text: "Click 'New Patient' to register walk-ins without leaving the dashboard." }
        ]
    },
    patients: {
        title: "Patient Management",
        description: "Search, filter, and manage your clinic's patient records securely.",
        steps: [
            { id: 'p1', text: "Use the search bar to find patients by Name or ID system." },
            { id: 'p2', text: "Click 'Register Patient' to add a new record with DPA compliance checks." },
            { id: 'p3', text: "Select a patient row to view their full Clinical Profile and history." }
        ]
    },
    patient_profile: {
        title: "Clinical Profile",
        description: "A comprehensive view of a patient's medical history and active orders.",
        steps: [
            { id: 'pp1', text: "Review 'Past Prescriptions' to check medication adherence." },
            { id: 'pp2', text: "Click 'Add Clinical Note' to document a new consultation." },
            { id: 'pp3', text: "Start a 'New Prescription' using the medicine autocomplete feature." }
        ]
    },
    pharmacy: {
        title: "Pharmacy Dispatch",
        description: "Process and dispense medications from active clinical orders.",
        steps: [
            { id: 'ph1', text: "Check the Pharmacy Worklist for new 'ACTIVE' prescriptions." },
            { id: 'ph2', text: "Review dosage and physician instructions before dispensing." },
            { id: 'ph3', text: "Update the status of prepared medications to maintain the audit trail." }
        ]
    },
    medicine_management: {
        title: "Medicine Inventory",
        description: "Manage your clinic's local medicines and search the PNF master list.",
        steps: [
            { id: 'mm1', text: "Search the PNF (Philippine National Formulary) for standard drugs." },
            { id: 'mm2', text: "Click 'Add Custom Med' for medications unique to your clinic." },
            { id: 'mm3', text: "Ensure 'Generic Name' and 'Strength' are accurately documented for clinicians." }
        ]
    },
    worklist: {
        title: "Clinical Worklist",
        description: "Real-time feed of diagnostic orders requiring attention.",
        steps: [
            { id: 'wl1', text: "Track 'LAB' and 'RAD' orders across all departments." },
            { id: 'wl2', text: "Filter by 'Priority' to address STAT orders immediately." },
            { id: 'wl3', text: "Click an order to update its status from PENDING to COMPLETED." }
        ]
    }
};

const InteractiveGuide = ({ activeView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [completedSteps, setCompletedSteps] = useState(() => {
        const saved = localStorage.getItem('juanclinic_guide_progress');
        return saved ? JSON.parse(saved) : {};
    });

    const content = guideContent[activeView] || {
        title: "Help Guide",
        description: "This module is currently being initialized according to HIS protocols.",
        steps: [{ id: 'default', text: "Explore the navigation menu to discover other modules." }]
    };

    useEffect(() => {
        localStorage.setItem('juanclinic_guide_progress', JSON.stringify(completedSteps));
    }, [completedSteps]);

    const toggleStep = (id) => {
        setCompletedSteps(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-8 right-8 z-[60] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-[2rem] shadow-2xl shadow-his-green-500/20 hover:scale-105 active:scale-95 transition-all duration-300 group border border-white/10 ${isOpen ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-his-green-400 rounded-full animate-ping opacity-25" />
                    <HelpCircle className="w-5 h-5 text-his-green-400 relative z-10" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">Help Guide</span>
            </button>

            {/* Guide Drawer */}
            <div className={`fixed inset-y-0 right-0 w-80 z-[70] transition-all duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Backdrop Blur Layer */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl border-l border-white/10" />
                
                <div className="relative h-full flex flex-col p-8 text-white">
                    <div className="flex justify-between items-start mb-10">
                        <div className="w-12 h-12 bg-his-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-his-green-500/20">
                            <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-all group"
                        >
                            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                            <h2 className="text-2xl font-black tracking-tight leading-tight mb-3">{content.title}</h2>
                            <p className="text-xs font-bold text-slate-400 leading-relaxed">{content.description}</p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-his-green-500 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-his-green-500" />
                                Recommended Workflow
                            </h3>

                            <div className="space-y-3">
                                {content.steps.map((step, idx) => {
                                    const isDone = completedSteps[step.id];
                                    return (
                                        <div 
                                            key={step.id}
                                            onClick={() => toggleStep(step.id)}
                                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${isDone 
                                                ? 'bg-his-green-500/10 border-his-green-500/20' 
                                                : 'bg-white/5 border-white/5 hover:border-his-green-500/30'}`}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-his-green-500 text-white' : 'bg-white/10 text-slate-400 group-hover:bg-his-green-500/20 group-hover:text-his-green-400'}`}>
                                                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                                                </div>
                                                <p className={`text-xs font-bold leading-relaxed transition-colors ${isDone ? 'text-slate-300 line-through' : 'text-slate-100'}`}>
                                                    {step.text}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 bg-his-blue-500/10 border border-his-blue-500/20 rounded-2xl space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-his-blue-400 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-his-blue-400" />
                                Pro Tip
                            </h4>
                            <p className="text-[11px] font-bold text-slate-300 leading-relaxed italic">
                                "Keep your clinical sessions efficient by following the HL7 standards for automated diagnostic data exchange."
                            </p>
                        </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-white/10">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            <span>SOP V2.1 Compliance</span>
                            <span className="text-his-green-500">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InteractiveGuide;
