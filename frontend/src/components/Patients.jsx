import React, { useEffect, useState } from 'react';
import { getPatients } from '../services/api';
import { getFromLocal } from '../services/db';

const Patients = ({ onOpenPatient, onNewPatient, activeTenant }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(20);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });

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
                    
                    // Laravel Paginator returns { data: [], current_page: 1, last_page: x, total: y }
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
    }, [activeTenant, pagination.currentPage, search, perPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on search
    };

    const handlePerPageChange = (e) => {
        setPerPage(parseInt(e.target.value, 10));
        setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on limit change
    };

    const filteredPatients = patients; // Filtering is now server-side

    return (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sleek border border-his-slate-100 flex flex-col gap-6 md:gap-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-4">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Patients</h1>
                        <span className="px-3 py-1 bg-his-slate-50 text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-100">
                            {window.location.hostname.split('.')[0] || 'Default'} Tenant
                        </span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                            Registry of all patients in this tenant
                        </p>
                        <span className="inline-flex items-center gap-2 text-his-green-500 bg-his-green-50 px-2 py-0.5 rounded-lg border border-his-green-100/30 text-[9px] font-black uppercase tracking-widest w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-his-green-500 animate-pulse" />
                            List Access Audited
                        </span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by name or MRN..."
                            className="w-full bg-slate-50 border border-his-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-400 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                    {onNewPatient && (
                        <button
                            type="button"
                            onClick={onNewPatient}
                            disabled={loading}
                            className={`px-5 py-3 text-white text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 ${loading ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-his-green-500 hover:bg-his-green-600 shadow-his-green-500/20'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            New Patient
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="p-10 text-center text-xs font-bold text-slate-400 animate-pulse">
                    Loading patients...
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="p-10 text-center text-xs font-bold text-slate-400">
                    No patients match the current filter.
                </div>
            ) : (
                <>
                    {/* Mobile Card List */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {filteredPatients.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => onOpenPatient && onOpenPatient(p.id)}
                                className="bg-slate-50 p-5 rounded-3xl border border-his-slate-100 active:scale-95 transition-all"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-his-green-500 font-black text-sm">
                                        {(p.first_name || '?')[0]}{(p.last_name || '?')[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-black text-sm text-slate-900 leading-tight">{p.first_name} {p.last_name}</p>
                                            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                <span className="text-[8px] font-black uppercase text-emerald-600 tracking-widest">Active</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                            ID: {p.patient_external_id || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                    <div>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Gender</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Date of Birth</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.dob}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto -mx-10 px-10">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
                                    <th className="pb-6 pl-2 font-black uppercase">Patient Details</th>
                                    <th className="pb-6 font-black uppercase">Gender</th>
                                    <th className="pb-6 font-black uppercase">DOB</th>
                                    <th className="pb-6 font-black uppercase">ID System</th>
                                    <th className="pb-6 text-right pr-2 font-black uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredPatients.map((p) => (
                                    <tr
                                        key={p.id}
                                        onClick={() => onOpenPatient && onOpenPatient(p.id)}
                                        className="group hover:bg-his-slate-100/30 transition-all duration-300 cursor-pointer"
                                    >
                                        <td className="py-4 pl-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-his-slate-50 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-his-green-50 group-hover:text-his-green-500 transition-colors duration-300 border border-slate-100">
                                                    {(p.first_name || '?')[0]}{(p.last_name || '?')[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-slate-900 leading-tight">{p.first_name} {p.last_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Medical Record</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
                                            {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                                        </td>
                                        <td className="py-4 text-xs text-slate-500 font-bold uppercase tracking-widest">{p.dob}</td>
                                        <td className="py-4">
                                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-his-slate-50 px-2 py-1 rounded-md border border-slate-100 italic">
                                                {p.patient_external_id || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-2 font-black uppercase">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            <div className="mt-4 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Showing {filteredPatients.length} of {pagination.total} active records
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Per Page:</span>
                            <select
                                value={perPage}
                                onChange={handlePerPageChange}
                                className="bg-his-slate-50 border border-slate-100 rounded-lg text-[10px] font-black px-2 py-1 outline-none focus:ring-2 focus:ring-his-green-500/20"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1 || loading}
                                className="p-2 rounded-lg border border-slate-100 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(pagination.lastPage)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${pagination.currentPage === i + 1 ? 'bg-his-green-500 text-white shadow-lg shadow-his-green-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.lastPage || loading}
                                className="p-2 rounded-lg border border-slate-100 text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-his-green-600 hover:text-his-green-700 transition-all group">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:underline">Privacy & DPA Management</span>
                </button>
            </div>
        </div>
    );
};

export default Patients;
