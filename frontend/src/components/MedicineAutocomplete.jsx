import React, { useState, useEffect, useRef } from 'react';
import { getMedicines } from '../services/api';

const MedicineAutocomplete = ({ value, onChange, onSelect, placeholder = "Search medication..." }) => {
    const [search, setSearch] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const listRef = useRef(null);
    const debounceTimer = useRef(null);

    useEffect(() => {
        setSearch(value || '');
    }, [value]);

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
            setSuggestions([]);
            setActiveIndex(-1);
            return;
        }
        setLoading(true);
        try {
            const results = await getMedicines({ search: query });
            // Handle Laravel pagination or direct array
            const medsArray = results.data || results;
            setSuggestions(Array.isArray(medsArray) ? medsArray : []);
            setActiveIndex(-1);
            setShowDropdown(true);
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearch(query);
        onChange(query); // Allow custom entry

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    };

    const handleSelect = (form) => {
        const medicine = form.medicine || {};
        const displayName = medicine.brand_name 
            ? `${medicine.generic_name} (${medicine.brand_name})` 
            : medicine.generic_name;
        
        const fullValue = `${displayName} ${form.form_name || ''} ${form.strength || ''}`.trim();
        setSearch(fullValue);
        onChange(fullValue);
        if (onSelect) onSelect(form);
        setShowDropdown(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                e.preventDefault();
                handleSelect(suggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            setActiveIndex(-1);
        }
    };

    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const activeElement = listRef.current.children[activeIndex];
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'start'
                });
            }
        }
    }, [activeIndex]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => search.trim().length >= 2 && setShowDropdown(true)}
                    placeholder={placeholder}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all pr-12"
                />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-his-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {showDropdown && (suggestions.length > 0 || loading) && (
                <div className="absolute z-[60] left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-his-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto" ref={listRef}>
                        {suggestions.length > 0 ? (
                            suggestions.map((form, index) => {
                                const medicine = form.medicine || {};
                                const stock = form.inventories?.[0]?.stock ?? 0;
                                
                                return (
                                    <button
                                        key={form.id}
                                        type="button"
                                        onClick={() => handleSelect(form)}
                                        onMouseMove={() => setActiveIndex(index)}
                                        className={`w-full text-left px-6 py-4 transition-all border-b border-his-slate-50 last:border-0 group flex items-center gap-4 ${activeIndex === index ? 'bg-his-green-50/50' : 'hover:bg-slate-50/50'}`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className={`text-sm font-black transition-colors ${activeIndex === index ? 'text-his-green-600' : 'text-slate-900'}`}>
                                                    {medicine.generic_name}
                                                </p>
                                                {!medicine.is_system && (
                                                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-black rounded-md uppercase tracking-tighter shrink-0 ml-2">Tenant Local</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                {medicine.brand_name && (
                                                    <span className="text-[10px] font-black text-his-green-500 uppercase tracking-widest">
                                                        {medicine.brand_name}
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-bold text-slate-400 italic">
                                                    {form.form_name} {form.strength && `• ${form.strength}`}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    Stock: {stock}
                                                </span>
                                            </div>
                                        </div>
                                        {activeIndex === index && (
                                            <div className="text-his-green-500 animate-in slide-in-from-left-2 duration-200">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        ) : loading ? (
                            <div className="p-10 text-center">
                                <div className="w-8 h-8 border-3 border-his-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consulting Pharmacy Index...</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicineAutocomplete;
