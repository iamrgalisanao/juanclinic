import React, { useEffect, useState } from 'react';
import { getAuditLogs, getDoctors } from '../services/api';

const AuditLogExplorer = ({ currentUser }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventFilter, setEventFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [logData, userData] = await Promise.all([
                    getAuditLogs({}),
                    getDoctors(),
                ]);
                setLogs(logData);
                setUsers(userData);
            } catch (err) {
                console.error('Failed to load audit logs', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleFilter = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const params = {};
            if (eventFilter) params.event = eventFilter;
            if (userFilter) params.user_id = userFilter;
            if (fromDate) params.from = fromDate;
            if (toDate) params.to = toDate;
            const data = await getAuditLogs(params);
            setLogs(data);
        } catch (err) {
            console.error('Failed to filter audit logs', err);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || currentUser.role !== 'ADMIN') {
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
                <div className="px-6 py-3 border-b border-slate-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Recent Activity (max 200)</span>
                </div>
                {loading ? (
                    <div className="p-6 text-center text-xs font-bold text-slate-400">Loading audit logs...</div>
                ) : logs.length === 0 ? (
                    <div className="p-6 text-center text-xs font-bold text-slate-400">No audit entries match the current filters.</div>
                ) : (
                    <div className="max-h-[520px] overflow-y-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-2 text-left font-black">When</th>
                                    <th className="px-4 py-2 text-left font-black">User</th>
                                    <th className="px-4 py-2 text-left font-black">Event</th>
                                    <th className="px-4 py-2 text-left font-black">Resource</th>
                                    <th className="px-4 py-2 text-left font-black">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                                        <td className="px-4 py-2 align-top whitespace-nowrap text-[11px] font-semibold text-slate-700">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 align-top text-[11px] font-semibold text-slate-700">
                                            {log.user?.name || 'System'}
                                        </td>
                                        <td className="px-4 py-2 align-top text-[10px] font-black uppercase tracking-widest">
                                            {log.event}
                                        </td>
                                        <td className="px-4 py-2 align-top text-[11px] font-semibold text-slate-700">
                                            {log.auditable_type?.split('\\').pop()}#{log.auditable_id}
                                        </td>
                                        <td className="px-4 py-2 align-top text-[11px] text-slate-600">
                                            {log.event === 'updated' && log.old_values && log.new_values ? (
                                                <span>
                                                    Changed {Object.keys(log.new_values).join(', ')}
                                                </span>
                                            ) : log.event === 'HL7_IMPORT' && log.new_values ? (
                                                <span>HL7 import for order with validation {log.new_values.validation_level}</span>
                                            ) : (
                                                <span>See payload in backend logs / DB</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogExplorer;
