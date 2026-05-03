import React, { useState, useEffect } from 'react';
import axios from '../../services/api';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  AlertCircle, 
  ChevronRight,
  Filter,
  Save,
  Link as LinkIcon,
  Database,
  History,
  Info,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';

const TerminologyReviewDashboard = () => {
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [filters, setFilters] = useState({ 
        review_status: 'IMPORTED', 
        q: '', 
        source_system: '',
        mapped: ''
    });

    // Selection & Modal State
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [diseaseSearch, setDiseaseSearch] = useState('');
    const [diseaseResults, setDiseaseResults] = useState([]);
    const [targetDisease, setTargetDisease] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [isPreferred, setIsPreferred] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [debounceQ, setDebounceQ] = useState('');

    useEffect(() => {
        fetchTerms();
    }, [filters, pagination.current_page]);

    const fetchTerms = async () => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                page: pagination.current_page,
                limit: 15
            };
            const { data } = await axios.get('/admin/terminology/disease-terms', { params });
            setTerms(data.data);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total
            });
        } catch (err) {
            console.error("Failed to fetch discovery terms", err);
        } finally {
            setLoading(false);
        }
    };

    const searchDiseases = async (q) => {
        if (q.length < 2) return;
        try {
            const { data } = await axios.get('/admin/terminology/diseases/search', { params: { q } });
            setDiseaseResults(data);
        } catch (err) {
            console.error("Canonical search failed", err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, q: debounceQ, current_page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [debounceQ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (diseaseSearch) searchDiseases(diseaseSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [diseaseSearch]);

    const handleSelectTerm = (term) => {
        setSelectedTerm(term);
        setTargetDisease(term.disease || null);
        setReviewNotes(term.review_notes || '');
        setIsPreferred(term.is_preferred || false);
        setDiseaseSearch('');
        setDiseaseResults([]);
    };

    const handleSaveAction = async (status) => {
        if (!selectedTerm) return;
        setIsSaving(true);
        try {
            await axios.patch(`/admin/terminology/disease-terms/${selectedTerm.id}`, {
                review_status: status,
                disease_id: status === 'REJECTED' ? null : (targetDisease?.id || null),
                review_notes: reviewNotes,
                is_preferred: isPreferred
            });
            
            // Refresh list and clear selection
            fetchTerms();
            setSelectedTerm(null);
        } catch (err) {
            console.error("Failed to save governance action", err);
            alert("Error saving action. Check logs.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Database className="w-8 h-8 text-his-green-500" />
                        Terminology Governance
                    </h2>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                        Administrative Review Queue • <span className="text-his-green-500">{pagination.total} terms</span> detected
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-his-green-500 transition-colors" />
                        <select 
                            className="pl-11 pr-8 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-black appearance-none focus:ring-2 focus:ring-his-green-500 transition-all outline-none shadow-sm"
                            value={filters.review_status}
                            onChange={(e) => setFilters({...filters, review_status: e.target.value, page: 1})}
                        >
                            <option value="IMPORTED">IMPORTED</option>
                            <option value="MAPPED">MAPPED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                        </select>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-his-green-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Omni-Search terms..."
                            className="pl-11 pr-10 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-black focus:ring-2 focus:ring-his-green-500 transition-all outline-none shadow-sm min-w-[300px]"
                            value={debounceQ}
                            onChange={(e) => setDebounceQ(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Review Queue Table */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-4 shadow-sleek border border-his-slate-100 overflow-hidden min-h-[600px] flex flex-col">
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                                        <th className="p-6 text-left">Term / Discovery Label</th>
                                        <th className="p-6 text-left">Source Context</th>
                                        <th className="p-6 text-left">Mapped Mapping</th>
                                        <th className="p-6 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {loading ? (
                                        <tr><td colSpan="4" className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest animate-pulse">Synchronizing Queue...</td></tr>
                                    ) : terms.map(term => (
                                        <tr 
                                            key={term.id} 
                                            onClick={() => handleSelectTerm(term)}
                                            className={`group hover:bg-slate-50/80 transition-all duration-300 cursor-pointer ${selectedTerm?.id === term.id ? 'bg-his-green-50/50' : ''}`}
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${term.review_status === 'APPROVED' ? 'bg-emerald-500' : term.review_status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                                    <div>
                                                        <p className="font-black text-sm text-slate-900 group-hover:text-his-green-600 transition-colors">{term.term}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">NORM: {term.normalized_term}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded w-fit">{term.source_system}</span>
                                                    <span className="text-[9px] font-mono text-slate-400 italic">ID# {term.source_id || 'LOCAL'}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                {term.disease ? (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-700 leading-tight">{term.disease.name}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{term.disease.code} ({term.disease.coding_system})</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-300 italic">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Unmapped</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-his-green-500 group-hover:translate-x-1 transition-all inline" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination footer */}
                        <div className="p-6 bg-slate-50/50 flex justify-between items-center rounded-b-3xl">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {pagination.current_page} of {pagination.last_page}</p>
                             <div className="flex gap-2">
                                 <button 
                                    className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black disabled:opacity-30"
                                    disabled={pagination.current_page === 1}
                                    onClick={() => setPagination({...pagination, current_page: pagination.current_page - 1})}
                                 >PREV</button>
                                 <button 
                                    className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black disabled:opacity-30"
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => setPagination({...pagination, current_page: pagination.current_page + 1})}
                                 >NEXT</button>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Review Action Panel */}
                <div className="space-y-6">
                    {selectedTerm ? (
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-his-slate-100 sticky top-10 flex flex-col gap-8 animate-in slide-in-from-right-10 duration-500">
                             <div className="border-b border-slate-50 pb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Review Governance</h3>
                                <p className="text-[10px] font-black text-his-green-500 uppercase tracking-[0.2em] mt-1">TERM ID: {selectedTerm.id}</p>
                             </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Discovery Label</label>
                                <div className="p-5 bg-his-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                    <p className="font-black text-slate-900">{selectedTerm.term}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{selectedTerm.term_type} label</p>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between">
                                    <span>Canonical Mapping</span>
                                    {targetDisease && (
                                        <button onClick={() => setTargetDisease(null)} className="text-[9px] text-rose-500 hover:font-black transition-all">UNLINK</button>
                                    )}
                                </label>
                                
                                {targetDisease ? (
                                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-black text-emerald-900 leading-tight">{targetDisease.name}</p>
                                            <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">{targetDisease.code} • {targetDisease.coding_system}</p>
                                            <div className="flex gap-2 mt-3">
                                                <span className="text-[9px] font-black bg-emerald-200/50 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-tighter">{targetDisease.clinical_category || 'concept'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-his-green-500 transition-colors" />
                                            <input 
                                                type="text" 
                                                placeholder="Search canonical ICDnd concepts..."
                                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-black focus:ring-2 focus:ring-his-green-500 transition-all outline-none"
                                                value={diseaseSearch}
                                                onChange={(e) => setDiseaseSearch(e.target.value)}
                                            />
                                        </div>
                                        
                                        {diseaseResults.length > 0 && (
                                            <div className="bg-white border border-his-slate-100 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                                                {diseaseResults.map(d => (
                                                    <div 
                                                        key={d.id} 
                                                        onClick={() => { setTargetDisease(d); setDiseaseResults([]); setDiseaseSearch(''); }}
                                                        className="p-4 hover:bg-his-slate-50 cursor-pointer group transition-colors"
                                                    >
                                                        <p className="font-black text-xs text-slate-800 group-hover:text-his-green-600">{d.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{d.code} • {d.coding_system}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                             </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reviewer Notes / Clinical Context</label>
                                <textarea 
                                    className="w-full p-5 bg-white border border-slate-100 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-his-green-500 transition-all outline-none resize-none h-32"
                                    placeholder="Add notes for terminology audit trail..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                />
                             </div>

                             <div className="flex items-center gap-4 p-5 bg-his-slate-100/50 rounded-2xl border border-slate-100 cursor-pointer group" onClick={() => setIsPreferred(!isPreferred)}>
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isPreferred ? 'bg-his-green-500 border-his-green-500' : 'bg-white border-slate-200'}`}>
                                    {isPreferred && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Preferred Alias</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Set as the primary display label for this concept</p>
                                </div>
                             </div>

                             <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => handleSaveAction('APPROVED')}
                                        disabled={isSaving || !targetDisease}
                                        className="py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve & Map
                                    </button>
                                    <button 
                                        onClick={() => handleSaveAction('REJECTED')}
                                        disabled={isSaving}
                                        className="py-4 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject Term
                                    </button>
                                </div>
                                <button 
                                    onClick={() => handleSaveAction('MAPPED')}
                                    disabled={isSaving || !targetDisease}
                                    className="py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    Map (Review Pending)
                                </button>
                                <button 
                                    onClick={() => setSelectedTerm(null)}
                                    className="py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
                                >
                                    Cancel Review
                                </button>
                             </div>

                             {/* Metadata footer */}
                             {selectedTerm.reviewer && (
                                <div className="mt-4 p-4 rounded-xl bg-his-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <History className="w-3.5 h-3.5 text-slate-400" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            Last reviewed {new Date(selectedTerm.reviewed_at).toLocaleDateString()} by {selectedTerm.reviewer.name}
                                        </p>
                                    </div>
                                </div>
                             )}
                        </div>
                    ) : (
                        <div className="bg-his-slate-100/50 rounded-[2.5rem] p-20 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group">
                             <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-slate-300 mb-6 shadow-sm group-hover:scale-110 group-hover:text-his-green-500 transition-all duration-500">
                                <AlertCircle className="w-10 h-10" />
                             </div>
                             <h4 className="text-lg font-black text-slate-400 tracking-tight italic">Governance Selection Pending</h4>
                             <p className="text-xs text-slate-300 font-bold max-w-[200px] mt-2 uppercase tracking-widest leading-relaxed">Select an imported discovery term to initiate clinical review and mapping.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TerminologyReviewDashboard;
