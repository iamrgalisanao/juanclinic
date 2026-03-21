import React, { useState, useEffect, useRef } from 'react';
import { getMedicines } from '../services/api';

const MedicineAutocomplete = ({ value, onChange, placeholder = "Search medication..." }) => {
    const [search, setSearch] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
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
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        setLoading(true);
        try {
            const results = await getMedicines(query);
            setSuggestions(results);
            setShowDropdown(true);
        } catch (error) {
            console.error('Failed to fetch medicines:', error);
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

    const handleSelect = (medicine) => {
        const displayName = medicine.brand_name 
            ? `${medicine.generic_name} (${medicine.brand_name})` 
            : medicine.generic_name;
        
        const fullValue = `${displayName} ${medicine.strength || ''} ${medicine.form || ''}`.trim();
        setSearch(fullValue);
        onChange(fullValue);
        setShowDropdown(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    onFocus={() => search.length >= 2 && setShowDropdown(true)}
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
                <div className="absolute z-[60] left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-his-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto">
                        {suggestions.map((med) => (
                            <button
                                key={med.id}
                                type="button"
                                onClick={() => handleSelect(med)}
                                className="w-full text-left px-6 py-4 hover:bg-slate-50 transition-colors border-b border-his-slate-50 last:border-0 group"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-black text-slate-900 group-hover:text-his-green-600 transition-colors">
                                            {med.generic_name} {med.strength && <span className="text-slate-400 font-bold ml-1">{med.strength}</span>}
                                        </p>
                                        {med.brand_name && (
                                            <p className="text-[10px] font-black text-his-green-500 uppercase tracking-widest mt-1">
                                                Brand: {med.brand_name}
                                            </p>
                                        )}
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 italic">{med.form}</p>
                                    </div>
                                    {!med.is_system && (
                                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-black rounded-md uppercase tracking-tighter">Tenant Local</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicineAutocomplete;
