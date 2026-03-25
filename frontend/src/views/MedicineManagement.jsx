import React, { useState, useEffect } from 'react';
import { getMedicines, createMedicine } from '../services/api';

const MedicineManagement = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [perPage, setPerPage] = useState(20);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMedicines();
    }, [searchQuery, pagination.currentPage, perPage]);

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const response = await getMedicines({
                search: searchQuery.trim(),
                page: pagination.currentPage,
                per_page: perPage
            });
            
            // Laravel Paginator returns { data: [], current_page: 1, last_page: x, total: y }
            setMedicines(response.data || []);
            setPagination({
                currentPage: response.current_page,
                lastPage: response.last_page,
                total: response.total
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on search
    };

    const handlePerPageChange = (e) => {
        setPerPage(parseInt(e.target.value, 10));
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on limit change
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const payload = {
            generic_name: formData.get('generic_name'),
            brand_name: formData.get('brand_name'),
            form: formData.get('form'),
            strength: formData.get('strength'),
        };

        try {
            await createMedicine(payload);
            setShowAddForm(false);
            setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to see new entry
            fetchMedicines();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add medicine.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Medicine Collection</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Manage PNF & Local Clinic Inventory</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="px-6 py-3 bg-his-green-500 text-white text-xs font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    New Medicine
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by Generic or Brand Name..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full bg-white border border-his-slate-100 rounded-3xl px-8 py-5 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-his-green-500/5 focus:border-his-green-500 outline-none transition-all shadow-sleek"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-his-slate-100 shadow-sleek overflow-hidden flex flex-col min-h-[500px]">
                <div className="flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-his-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Generic Name</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand Name</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Form / Strength</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Source</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-his-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-10 h-10 border-4 border-his-green-500 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updating Collection...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : medicines.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold italic">No medicines found matching your search.</td>
                                </tr>
                            ) : (
                                medicines.map((med) => (
                                    <tr key={med.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{med.generic_name}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-500 italic">{med.brand_name || 'N/A'}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                <span className="px-3 py-1 bg-his-slate-50 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest border border-slate-100">{med.form}</span>
                                                <span className="px-3 py-1 bg-his-green-50 text-his-green-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-his-green-100">{med.strength}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                med.is_system 
                                                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                                    : 'bg-purple-50 text-purple-600 border border-purple-100'
                                            }`}>
                                                {med.is_system ? 'PNF MASTER' : 'LOCAL CLINIC'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-8 py-6 bg-slate-50/30 border-t border-his-slate-100">
                    <div className="flex flex-col gap-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Showing {medicines.length} of {pagination.total} active records
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Per Page:</span>
                                <select
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                    className="bg-white border border-his-slate-100 rounded-lg text-[10px] font-black px-3 py-1.5 outline-none focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 transition-all cursor-pointer"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center gap-2 border-l border-his-slate-100 pl-4">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1 || loading}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl border border-his-slate-100 transition-all ${pagination.currentPage === 1 ? 'text-slate-200' : 'text-slate-400 hover:bg-white hover:text-his-green-500 hover:border-his-green-500 shadow-sm'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                
                                <div className="flex items-center gap-1.5">
                                    {[...Array(pagination.lastPage)].map((_, i) => {
                                        const pageNum = i + 1;
                                        if (pagination.lastPage > 5) {
                                            if (pageNum !== 1 && pageNum !== pagination.lastPage && (pageNum < pagination.currentPage - 1 || pageNum > pagination.currentPage + 1)) {
                                                if (pageNum === pagination.currentPage - 2 || pageNum === pagination.currentPage + 2) return <span key={pageNum} className="text-slate-300">...</span>;
                                                return null;
                                            }
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${pagination.currentPage === pageNum ? 'bg-his-green-500 text-white shadow-lg shadow-his-green-500/20' : 'text-slate-400 hover:bg-white hover:border border-his-slate-100'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.lastPage || loading}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl border border-his-slate-100 transition-all ${pagination.currentPage === pagination.lastPage ? 'text-slate-200' : 'text-slate-400 hover:bg-white hover:text-his-green-500 hover:border-his-green-500 shadow-sm'}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setShowAddForm(false)}
                            className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-2xl bg-his-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="mb-10">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Register New Medication</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2">This medicine will be available to all staff in your tenant.</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAddMedicine} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Generic Name</label>
                                <input name="generic_name" required placeholder="e.g. Ibuprofen" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-his-green-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Brand Name (Optional)</label>
                                <input name="brand_name" placeholder="e.g. Advil" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-his-green-500 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Form</label>
                                    <input name="form" required placeholder="e.g. Tablet" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-his-green-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Strength</label>
                                    <input name="strength" required placeholder="e.g. 200mg" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 outline-none focus:border-his-green-500 transition-all" />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-4 bg-his-slate-100 text-slate-600 text-xs font-black rounded-2xl hover:bg-his-slate-200 transition-all uppercase tracking-widest">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-his-green-500 text-white text-xs font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20">Add Medication</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MedicineManagement;
