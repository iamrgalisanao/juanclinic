import React, { useEffect, useState } from 'react';
import { getPatients } from '../services/api';
import { getFromLocal } from '../services/db';

const Patients = ({ onOpenPatient, onNewPatient, activeTenant, refreshTrigger }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(20);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (navigator.onLine) {
                    const response = await getPatients({
                        page: pagination.currentPage,
                        search: search.trim(),
                        per_page: perPage
                    });
                    
                    setPatients(response.data || []);
                    setPagination({
                        currentPage: response.current_page,
                        lastPage: response.last_page,
                        total: response.total
                    });
                } else {
                    throw new Error('Offline');
                }
            } catch (err) {
                console.warn('Failed to load patients from API, falling back to local DB:', err);
                if (activeTenant?.id) {
                    const localData = await getFromLocal('patients', activeTenant.id);
                    setPatients(localData);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [activeTenant, pagination.currentPage, search, perPage, refreshTrigger]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePerPageChange = (e) => {
        setPerPage(parseInt(e.target.value, 10));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const filteredPatients = patients;

    return (
        <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-4 md:p-10 shadow-sleek border border-his-slate-100 flex flex-col gap-6 md:gap-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight italic">Patients</h1>
                        <span className="px-3 py-1 bg-his-green-50 text-his-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-his-green-100/50">
                            Central Registry
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            Managing {pagination.total} lives in this tenant
                        </p>
                        <span className="inline-flex items-center gap-2 text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100/30 text-[9px] font-black uppercase tracking-widest w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            DPA Compliant Access
                        </span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-80">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search clinical records..."
                            className="w-full bg-his-slate-50 border border-his-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-slate-700 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-400 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                        />
                    </div>
                    {onNewPatient && (
                        <button
                            type="button"
                            onClick={onNewPatient}
                            disabled={loading}
                            className={`px-8 py-4 text-white text-[11px] font-black rounded-2xl transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 ${loading ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-his-green-500 hover:bg-his-green-600 shadow-his-green-500/30 hover:-translate-y-0.5 active:translate-y-0'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                            Register
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-his-green-500/20 border-t-his-green-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing patient database...</p>
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="py-20 text-center bg-his-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p className="text-sm font-black text-slate-900 tracking-tight">No Patients Found</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Try adjusting your search criteria</p>
                </div>
            ) : (
                <>
                    {/* Mobile Card List */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredPatients.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => onOpenPatient && onOpenPatient(p.id)}
                                className="bg-his-slate-50/50 p-6 rounded-[2rem] border border-his-slate-100 active:scale-98 transition-all hover:bg-white hover:shadow-xl hover:shadow-his-slate-200/50"
                            >
                                <div className="flex items-center gap-5 mb-5">
                                    <div className="w-14 h-14 rounded-[1.25rem] bg-white border border-slate-100 flex items-center justify-center text-his-green-500 font-black text-base shadow-sm">
                                        {(p.first_name || '?')[0]}{(p.last_name || '?')[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-black text-base text-slate-900 tracking-tight">{p.first_name} {p.last_name}</p>
                                            <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-2 py-0.5 rounded-lg">
                                                <span className="text-[8px] font-black uppercase tracking-widest">Active</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            MRN: {p.patient_external_id || 'PENDING'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-100/50">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Gender</p>
                                        <p className="text-[11px] font-black text-slate-600 uppercase">
                                            {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Date of Birth</p>
                                        <p className="text-[11px] font-black text-slate-600 uppercase">{formatDate(p.dob)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto -mx-10 px-10">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">
                                    <th className="pb-8 pl-4 font-black">Patient Identity</th>
                                    <th className="pb-8 font-black">Sex/Gender</th>
                                    <th className="pb-8 font-black">Date of Birth</th>
                                    <th className="pb-8 font-black">Clinical ID</th>
                                    <th className="pb-8 text-right pr-4 font-black">Record Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPatients.map((p) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => onOpenPatient && onOpenPatient(p.id)}
                                        className="group hover:bg-his-slate-50/50 transition-all duration-500 cursor-pointer"
                                    >
                                        <td className="py-6 pl-4">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-[1.5rem] bg-his-slate-50 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-his-green-500 group-hover:text-white transition-all duration-500 border border-slate-100 group-hover:border-his-green-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-lg group-hover:shadow-his-green-500/20">
                                                    {(p.first_name || '?')[0]}{(p.last_name || '?')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-slate-900 leading-tight group-hover:text-his-green-600 transition-colors">{p.first_name} {p.last_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">HL7 Verified Record</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.gender === 'M' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                                            </span>
                                        </td>
                                        <td className="py-6 text-[11px] text-slate-500 font-black uppercase tracking-widest">
                                            {formatDate(p.dob)}
                                        </td>
                                        <td className="py-6">
                                            <span className="text-[11px] font-mono font-black text-slate-400 bg-his-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 group-hover:border-his-green-200 group-hover:text-his-green-500 transition-all">
                                                {p.patient_external_id || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="py-6 text-right pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-2 h-2 rounded-full bg-his-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                                <span className="text-[10px] font-black uppercase text-his-green-600 tracking-widest">Authenticated</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <div className="mt-4 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Display:</span>
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="bg-his-slate-50 border border-slate-100 rounded-xl text-[11px] font-black px-4 py-2 outline-none focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-400 transition-all cursor-pointer"
                        >
                            <option value={10}>10 records</option>
                            <option value={20}>20 records</option>
                            <option value={50}>50 records</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1 || loading}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 disabled:opacity-30 hover:bg-his-slate-50 transition-all hover:text-his-green-500"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        
                        <div className="flex items-center gap-1.5 px-2">
                            {[...Array(Math.min(5, pagination.lastPage))].map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${pagination.currentPage === pageNum ? 'bg-his-green-500 text-white shadow-xl shadow-his-green-500/30 scale-110' : 'text-slate-400 hover:bg-his-slate-50 hover:text-slate-600'}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.lastPage || loading}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 disabled:opacity-30 hover:bg-his-slate-50 transition-all hover:text-his-green-500"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden lg:block">
                        Page {pagination.currentPage} of {pagination.lastPage}
                    </p>
                    <button className="flex items-center gap-3 text-slate-400 hover:text-his-green-600 transition-all group bg-his-slate-50 px-6 py-3 rounded-2xl border border-slate-100 hover:border-his-green-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">DPA Audited</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Patients;
