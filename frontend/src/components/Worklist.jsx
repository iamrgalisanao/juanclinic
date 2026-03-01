import React from 'react';

const Worklist = ({ orders, loading, onStatusUpdate }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-slate-100">
                        <th className="pb-4">Order ID</th>
                        <th className="pb-4">Patient</th>
                        <th className="pb-4">Type</th>
                        <th className="pb-4">Priority</th>
                        <th className="pb-4 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {loading ? (
                        <tr><td colSpan="5" className="py-12 text-center text-slate-400 text-xs font-medium">Syncing clinical worklist...</td></tr>
                    ) : orders.length === 0 ? (
                        <tr><td colSpan="5" className="py-12 text-center text-slate-400 text-xs font-medium">No pending orders found.</td></tr>
                    ) : orders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-5 text-slate-400 text-[11px] font-mono">#ORD-{o.id.toString().padStart(4, '0')}</td>
                            <td className="py-5">
                                <span className="font-bold text-sm text-slate-900">
                                    {o.patient ? `${o.patient.first_name} ${o.patient.last_name}` : 'Unknown Patient'}
                                </span>
                            </td>
                            <td className="py-5">
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${o.order_type === 'LAB'
                                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                                    }`}>
                                    {o.order_type}
                                </span>
                            </td>
                            <td className="py-5">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${o.priority === 'STAT' ? 'text-rose-500 animate-pulse' : 'text-slate-400'
                                    }`}>
                                    {o.priority}
                                </span>
                            </td>
                            <td className="py-5 text-right">
                                <select
                                    value={o.status}
                                    onChange={(e) => onStatusUpdate(o.id, e.target.value)}
                                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all outline-none cursor-pointer ${o.status === 'PENDING' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                        o.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            o.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">Processing</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Worklist;
