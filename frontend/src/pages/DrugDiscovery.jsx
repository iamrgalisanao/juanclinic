import React, { useState } from 'react';
import OmniDrugSearch from '../components/OmniDrugSearch';
import { getMedicine } from '../services/api';

const DrugDiscovery = ({ onPrescribe }) => {
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [discoveryContext, setDiscoveryContext] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSelect = async (selection) => {
        setLoading(true);
        setDiscoveryContext(selection.context);
        try {
            // Load full details for the side panel
            const fullMed = await getMedicine(selection.item.id);
            setSelectedMedicine(fullMed);
        } catch (error) {
            console.error('Failed to load medicine details:', error);
        } finally {
            setLoading(false);
        }
    };

    const SectionCard = ({ title, icon, colorClass, content, highlight = false, badge = null, children = null }) => {
        if (!content && !children) return null;
        
        return (
            <div className={`p-8 rounded-3xl border-2 transition-all duration-500 ${highlight ? 'bg-orange-50/30 border-orange-200 ring-4 ring-orange-400/5' : 'bg-white border-slate-100/80 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                            {icon}
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
                    </div>
                    {badge}
                </div>
                {content && (
                    <div className={`prose prose-sm max-w-none leading-relaxed font-medium ${highlight ? 'text-slate-900' : 'text-slate-600'}`}>
                        {content}
                    </div>
                )}
                {children}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/40">
            {/* Header Area */}
            <div className="p-8 bg-white border-b border-slate-100 shadow-sm z-10">
                <div className="max-w-4xl mx-auto text-center mb-8">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Drug Discovery Center</h1>
                    <p className="text-slate-400 font-medium italic">Clinical Intelligence & Terminology Engine</p>
                </div>
                
                <div className="max-w-3xl mx-auto">
                    <OmniDrugSearch onSelect={handleSelect} />
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex gap-0">
                {/* Discovery Left Pane */}
                <div className="w-80 bg-white border-r border-slate-100 p-6 overflow-y-auto hidden lg:block shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Discovery Context</h3>
                    {discoveryContext ? (
                        <div className="p-5 bg-his-green-500 rounded-3xl text-white shadow-lg shadow-his-green-500/20 animate-in fade-in slide-in-from-left-4">
                            <span className="text-[8px] font-black opacity-60 uppercase tracking-widest block mb-1">Actively Analyzing</span>
                            <p className="text-sm font-bold leading-tight">{discoveryContext.item.name}</p>
                            <div className="mt-3 pt-3 border-t border-white/10 text-[9px] font-black uppercase tracking-widest opacity-80">
                                {discoveryContext.type === 'disease' ? 'Indication-Led Path' : 'Brand-Led Path'}
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                            <p className="text-[10px] font-bold text-slate-300 italic uppercase tracking-widest">Awaiting Input</p>
                        </div>
                    )}
                </div>

                {/* Detail Pane */}
                <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-his-green-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolving Clinical Data...</p>
                            </div>
                        </div>
                    ) : selectedMedicine ? (
                        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Medicine Header */}
                            <div className="flex items-start justify-between mb-12 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-3">
                                        <h2 className="text-4xl font-black text-slate-900 leading-none">{selectedMedicine.brand_name || selectedMedicine.generic_name}</h2>
                                        {selectedMedicine.brand_name && (
                                            <span className="px-3 py-1 bg-his-green-50 text-his-green-600 text-[10px] font-black rounded-full border border-his-green-100 uppercase tracking-widest">
                                                Proprietary
                                            </span>
                                        )}
                                        {selectedMedicine.classification === 'MEDICAL_DEVICE' && (
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-widest">
                                                Device
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xl font-bold text-his-green-500 italic mb-3">{selectedMedicine.brand_name ? selectedMedicine.generic_name : ''}</p>
                                    <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                                        <span>{selectedMedicine.company_name || 'Manufacturer Unspecified'}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span>{selectedMedicine.source_system || 'Local Catalog'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${selectedMedicine.prescription_class === 'Rx' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                        {selectedMedicine.prescription_class || 'OTC'} REQUIRED
                                    </span>
                                </div>
                            </div>

                            {/* Enriched Section Cards */}
                            <div className="grid grid-cols-1 gap-6 pb-20">
                                
                                <SectionCard 
                                    title="Indications"
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    colorClass={discoveryContext?.type === 'disease' ? 'bg-orange-100 text-orange-600' : 'bg-his-green-100 text-his-green-600'}
                                    content={selectedMedicine.indications_text}
                                    highlight={discoveryContext?.type === 'disease'}
                                    badge={discoveryContext?.type === 'disease' && (
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/></svg>
                                            Verified Match
                                        </span>
                                    )}
                                />

                                <SectionCard 
                                    title="Administration & Dosage"
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    colorClass="bg-blue-100 text-blue-600"
                                    content={selectedMedicine.dose_text}
                                />

                                <SectionCard 
                                    title="Contraindications"
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    colorClass="bg-rose-100 text-rose-600 font-black"
                                    content={selectedMedicine.contraindications_text}
                                />

                                <SectionCard 
                                    title="Special Precautions"
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    colorClass="bg-amber-100 text-amber-600"
                                    content={selectedMedicine.precautions_text}
                                />

                                <SectionCard 
                                    title="Drug Interactions"
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    colorClass="bg-purple-100 text-purple-600"
                                    content={selectedMedicine.drug_interactions_text}
                                />

                                <SectionCard 
                                    title="Packaging"
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    colorClass="bg-slate-100 text-slate-600"
                                    content={selectedMedicine.packaging_text}
                                />

                                {/* Availability / Variants - Always Show */}
                                <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Available Presentation Variants</h3>
                                    </div>
                                    <div className="overflow-hidden border border-slate-100 rounded-3xl">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50/50">
                                                <tr>
                                                    <th className="px-6 py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest">Presentation</th>
                                                    <th className="px-6 py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest">Strength</th>
                                                    <th className="px-6 py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-right">Base Price</th>
                                                    <th className="px-6 py-4 font-black text-slate-400 text-[9px] uppercase tracking-widest text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {selectedMedicine.forms?.length > 0 ? (
                                                    selectedMedicine.forms.map(form => (
                                                        <tr key={form.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                                            <td className="px-6 py-5 font-bold text-slate-900 group-hover:text-his-green-600 transition-colors">{form.form_name}</td>
                                                            <td className="px-6 py-5 font-medium text-slate-500">{form.strength || 'N/A'}</td>
                                                            <td className="px-6 py-5 font-black text-his-green-600 text-right">₱{form.price || '0.00'}</td>
                                                            <td className="px-6 py-5 text-right">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onPrescribe?.({
                                                                            medicine_id: selectedMedicine.id,
                                                                            medicine_form_id: form.id,
                                                                            generic_name: selectedMedicine.generic_name,
                                                                            brand_name: selectedMedicine.brand_name,
                                                                            form_name: form.form_name,
                                                                            strength: form.strength,
                                                                            discovery_context: {
                                                                                type: discoveryContext?.type,
                                                                                term: discoveryContext?.item?.name,
                                                                                indications: selectedMedicine.indications_text
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="px-4 py-2 bg-his-green-500 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-his-green-600 transition-all shadow-lg shadow-his-green-500/10 active:scale-95 flex items-center gap-2 ml-auto"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                                    Prescribe
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-medium italic">No variants cataloged.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-20">
                            <div className="w-40 h-40 mb-8 p-10 bg-white rounded-[3.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center animate-pulse">
                                <svg className="w-20 h-20 text-his-green-500 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Ready for Clinical Discovery</h2>
                            <p className="text-slate-400 font-medium max-w-sm mt-6 text-lg leading-relaxed">Select an indication or brand to analyze structured clinical data.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DrugDiscovery;
