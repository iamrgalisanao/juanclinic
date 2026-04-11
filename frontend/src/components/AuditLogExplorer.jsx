import React, { useEffect, useState } from 'react';
import { getAuditLogs, getDoctors } from '../services/api';

const AuditLogExplorer = ({ currentUser }) => {
    const [logResponse, setLogResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [eventFilter, setEventFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [users, setUsers] = useState([]);

    const fetchLogs = async (page = 1) => {
        if (!currentUser || !['ADMIN', 'GLOBAL_ADMIN'].includes(currentUser.role)) return;

        setLoading(true);
        try {
            const params = { page, per_page: 15 };
            if (eventFilter) params.event = eventFilter;
            if (userFilter) params.user_id = userFilter;
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;

            const data = await getAuditLogs(params);
            setLogResponse(data);
            setCurrentPage(page);
        } catch (err) {
            console.error('Failed to load audit logs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadInitial = async () => {
            if (!currentUser || !['ADMIN', 'GLOBAL_ADMIN'].includes(currentUser.role)) return;
            try {
                const userData = await getDoctors();
                setUsers(userData);
                await fetchLogs(1);
            } catch (err) {
                console.error('Failed to load initial audit data', err);
            }
        };
        loadInitial();
    }, [currentUser]);

    const handleFilter = (e) => {
        e.preventDefault();
        fetchLogs(1);
    };

    if (!currentUser || !['ADMIN', 'GLOBAL_ADMIN'].includes(currentUser.role)) {
        return (
            <div className="p-10 bg-white rounded-[2.5rem] shadow-sleek border border-his-slate-100 text-center text-sm font-bold text-rose-500">
                Audit Log Explorer is restricted to administrators.
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Audit Log Explorer</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Trace who did what and when</p>
                </div>
            </div>

            <form onSubmit={handleFilter} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <label className="mb-1">Event</label>
                    <select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                        <option value="">Any</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="deleted">Deleted</option>
                        <option value="HL7_IMPORT">HL7 Import</option>
                    </select>
                </div>
                <div className="flex flex-col text-xs font-bold text-slate-500 uppercase tracking-widest min-w-[160px]">
                    <label className="mb-1">User</label>
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                        <option value="">Any</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <label className="mb-1">From</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    />
                </div>
                <div className="flex flex-col text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <label className="mb-1">To</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                    />
                </div>
                <button
                    type="submit"
                    className="ml-auto px-5 py-2.5 bg-his-green-500 text-white text-xs font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20"
                >
                    Apply Filters
                </button>
            </form>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Ledger</span>
                    {logResponse && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Showing {logResponse.from}-{logResponse.to} of {logResponse.total} records
                        </span>
                    )}
                </div>
                {loading ? (
                    <div className="p-12 text-center">
                         <div className="w-8 h-8 border-4 border-his-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Orchestrating logs...</p>
                    </div>
                ) : !logResponse || logResponse.data.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No audit entries match filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                                <thead className="bg-white text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-black">Timestamp</th>
                                        <th className="px-6 py-4 text-left font-black">User</th>
                                        <th className="px-6 py-4 text-left font-black">Action</th>
                                        <th className="px-6 py-4 text-left font-black">Entity</th>
                                        <th className="px-6 py-4 text-left font-black text-right">Reference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logResponse.data.map((log) => (
                                        <tr key={log.id} className="border-b border-slate-50 hover:bg-his-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 align-top whitespace-nowrap text-[11px] font-semibold text-slate-600">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 align-top text-[11px] font-black text-slate-900">
                                                {log.user?.name || 'SYSTEM_CORE'}
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight ${
                                                    log.event === 'created' ? 'bg-emerald-50 text-emerald-600' :
                                                    log.event === 'updated' ? 'bg-blue-50 text-blue-600' :
                                                    log.event === 'deleted' ? 'bg-rose-50 text-rose-600' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {log.event}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 align-top text-[11px] font-bold text-slate-500">
                                                {log.auditable_type?.split('\\').pop()}
                                            </td>
                                            <td className="px-6 py-4 align-top text-[11px] font-mono text-slate-400 text-right">
                                                #{log.auditable_id}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchLogs(logResponse.current_page - 1)}
                                    disabled={logResponse.current_page === 1}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-his-green-500 hover:text-his-green-500 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => fetchLogs(logResponse.current_page + 1)}
                                    disabled={logResponse.current_page === logResponse.last_page}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-his-green-500 hover:text-his-green-500 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all shadow-sm"
                                >
                                    Next Page
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, logResponse.last_page) }, (_, i) => {
                                    // Simple logic to show near pages
                                    let pageNum = i + 1;
                                    if (logResponse.last_page > 5 && logResponse.current_page > 3) {
                                        pageNum = logResponse.current_page - 2 + i;
                                        if (pageNum > logResponse.last_page) pageNum = logResponse.last_page - (4 - i);
                                    }
                                    if (pageNum <= 0) return null;
                                    if (pageNum > logResponse.last_page) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => fetchLogs(pageNum)}
                                            className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                                                logResponse.current_page === pageNum
                                                    ? 'bg-his-green-500 text-white shadow-lg shadow-his-green-500/20'
                                                    : 'bg-white border border-slate-200 text-slate-400 hover:border-his-green-200 hover:text-slate-600 shadow-sm'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogExplorer;
