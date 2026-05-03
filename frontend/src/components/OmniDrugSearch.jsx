import React, { useState, useEffect, useRef } from 'react';
import { discoverySearch, getDiseaseMedicines } from '../services/api';

const OmniDrugSearch = ({ onSelect, placeholder = "Search by Disease, Brand, or Generic..." }) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState({ indications: [], brands: [], generics: [] });
    const [diseaseResults, setDiseaseResults] = useState(null); // Medicines for selected disease
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selectedContext, setSelectedContext] = useState(null); // Track if we are in "Disease-to-Drug" mode
    
    const dropdownRef = useRef(null);
    const listRef = useRef(null);
    const debounceTimer = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (query) => {
        if (query.trim().length < 2) {
            setResults({ indications: [], brands: [], generics: [] });
            setShowDropdown(false);
            return;
        }
        setLoading(true);
        try {
            const data = await discoverySearch({ q: query });
            setResults(data);
            setDiseaseResults(null);
            setSelectedContext(null);
            setShowDropdown(true);
            setActiveIndex(-1);
        } catch (error) {
            console.error('Omni-Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearch(query);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => fetchSuggestions(query), 300);
    };

    // Flatten results for unified keyboard indexing
    const getFlatResults = () => {
        if (selectedContext?.type === 'disease') {
            return (diseaseResults || []).map(m => ({ ...m, _type: 'medicine' }));
        }
        return [
            ...results.indications.map(i => ({ ...i, _type: 'indication' })),
            ...results.brands.map(b => ({ ...b, _type: 'brand' })),
            ...results.generics.map(g => ({ ...g, _type: 'generic' }))
        ];
    };

    const handleSelect = (item, type) => {
        if (type === 'indication') {
            handleDiseaseSelect(item);
        } else if (type === 'brand' || type === 'medicine') {
            handleMedicineSelect(item);
        } else if (type === 'generic') {
            handleGenericSelect(item);
        }
    };

    const handleKeyDown = (e) => {
        if (!showDropdown) return;

        const flatResults = getFlatResults();
        if (flatResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < flatResults.length) {
                const selected = flatResults[activeIndex];
                handleSelect(selected, selected._type);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const activeItem = listRef.current.children[activeIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIndex]);

    const handleDiseaseSelect = async (disease) => {
        setLoading(true);
        setSearch(disease.name); // Sync search box with selection
        setSelectedContext({ type: 'disease', item: disease });
        try {
            const meds = await getDiseaseMedicines(disease.id);
            setDiseaseResults(meds.data || meds);
            setActiveIndex(-1);
            setShowDropdown(true);
        } catch (error) {
            console.error('Failed to fetch medicines for disease:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMedicineSelect = (medicine) => {
        onSelect({ 
            type: 'medicine', 
            item: medicine, 
            context: selectedContext 
        });
        setShowDropdown(false);
        setSearch('');
        setSelectedContext(null);
    };

    const handleGenericSelect = (generic) => {
        // Pivot search to this generic name
        setSearch(generic.generic_name);
        fetchSuggestions(generic.generic_name);
    };

    const renderSuggestionItem = (item, type, index) => {
        const isActive = activeIndex === index;
        
        if (type === 'indication') {
            return (
                <button
                    key={`ind-${item.id}`}
                    onClick={() => handleDiseaseSelect(item)}
                    className={`w-full text-left px-5 py-3 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors ${isActive ? 'bg-his-green-500 text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-orange-50'}`}>
                        <svg className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-400'}`}>{item.code} • INDICATION</p>
                    </div>
                </button>
            );
        }

        if (type === 'brand') {
            return (
                <button
                    key={`brand-${item.id}`}
                    onClick={() => handleMedicineSelect(item)}
                    className={`w-full text-left px-5 py-3 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors ${isActive ? 'bg-his-green-500 text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-blue-50'}`}>
                        <svg className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{item.brand_name}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white/70' : 'text-his-green-500'}`}>{item.generic_name}</p>
                    </div>
                </button>
            );
        }

        if (type === 'generic') {
            return (
                <button
                    key={`gen-${item.generic_name}`}
                    onClick={() => handleGenericSelect(item)}
                    className={`w-full text-left px-5 py-3 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors ${isActive ? 'bg-his-green-500 text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-emerald-50'}`}>
                        <svg className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{item.generic_name}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-400'}`}>GENERIC GROUP</p>
                    </div>
                </button>
            );
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => search.length >= 2 && setShowDropdown(true)}
                    placeholder={placeholder}
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all shadow-sm pl-14"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {loading && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-his-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {showDropdown && (
                <div className="absolute z-[100] left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[450px] overflow-y-auto" ref={listRef}>
                        {selectedContext?.type === 'disease' ? (
                            <div className="p-0">
                                <div className="bg-orange-50/50 px-5 py-3 flex items-center justify-between border-b border-orange-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Drugs for {selectedContext.item.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedContext(null)} 
                                        className="text-[9px] font-black text-orange-500 uppercase hover:underline"
                                    >
                                        Back to Suggestions
                                    </button>
                                </div>
                                {diseaseResults?.length > 0 ? (
                                    diseaseResults.map((med, idx) => {
                                        const isActive = activeIndex === idx;
                                        return (
                                            <button
                                                key={`disease-med-${med.id}`}
                                                onClick={() => handleMedicineSelect(med)}
                                                className={`w-full text-left px-5 py-3 border-b border-slate-50 last:border-0 flex items-center justify-between group transition-colors ${isActive ? 'bg-his-green-500 text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                                            >
                                                <div>
                                                    <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>{med.brand_name || med.generic_name}</p>
                                                    {med.brand_name && <p className={`text-[10px] font-bold uppercase ${isActive ? 'text-white/80' : 'text-his-green-500'}`}>{med.generic_name}</p>}
                                                    <p className={`text-[10px] italic line-clamp-1 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>{med.therapeutic_class}</p>
                                                </div>
                                                <div className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    <svg className={`w-5 h-5 ${isActive ? 'text-white' : 'text-his-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="p-10 text-center text-slate-400 italic text-xs">No specific mappings found for this indication.</div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {results.indications.length > 0 && (
                                    <>
                                        <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-50">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Suggested Indications</span>
                                        </div>
                                        {results.indications.map((item, idx) => renderSuggestionItem(item, 'indication', idx))}
                                    </>
                                )}
                                
                                {results.brands.length > 0 && (
                                    <>
                                        <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-50 mt-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Matching Brands</span>
                                        </div>
                                        {results.brands.map((item, idx) => renderSuggestionItem(item, 'brand', results.indications.length + idx))}
                                    </>
                                )}

                                {results.generics.length > 0 && (
                                    <>
                                        <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-50 mt-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Generic Groups</span>
                                        </div>
                                        {results.generics.map((item, idx) => renderSuggestionItem(item, 'generic', results.indications.length + results.brands.length + idx))}
                                    </>
                                )}

                                {Object.values(results).every(arr => arr.length === 0) && !loading && (
                                    <div className="p-12 text-center">
                                        <p className="text-sm font-bold text-slate-300">No clinical matches found.</p>
                                        <p className="text-[10px] font-medium text-slate-400 mt-1">Try a different symptom or brand name.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OmniDrugSearch;
