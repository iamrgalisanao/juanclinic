import React from 'react';

const Worklist = ({ orders, loading, onStatusUpdate }) => {
    return (
        <div className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-6 sm:px-0">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-slate-100">
                            <th className="pb-4 hidden sm:table-cell">Order ID</th>
                            <th className="pb-4">Patient</th>
                            <th className="pb-4 hidden md:table-cell">Type</th>
                            <th className="pb-4 hidden lg:table-cell">Priority</th>
                            <th className="pb-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="5" className="py-12 text-center text-slate-400 text-xs font-medium italic animate-pulse">Synchronizing clinical worklist...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="5" className="py-12 text-center text-slate-400 text-xs font-medium">No pending orders found.</td></tr>
                        ) : orders
                            .sort((a, b) => {
                                // Smart Triage: STAT priority floats to absolute top
                                if (a.priority === 'STAT' && b.priority !== 'STAT') return -1;
                                if (b.priority === 'STAT' && a.priority !== 'STAT') return 1;
                                return 0;
                            })
                            .map(o => (
                            <tr key={o.id} className={`hover:bg-slate-50/50 transition-colors group relative ${o.priority === 'STAT' ? 'bg-rose-50/30' : ''}`}>
                                <td className="py-5 text-slate-400 text-[11px] font-mono hidden sm:table-cell">
                                    #ORD-{o.id.toString().padStart(4, '0')}
                                </td>
                                <td className="py-5">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            {o.priority === 'STAT' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse sm:hidden" />}
                                            <span className="font-black text-sm text-slate-900 italic tracking-tight">
                                                {o.patient ? `${o.patient.first_name} ${o.patient.last_name}` : 'Unknown Patient'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 sm:mt-1">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase sm:hidden">
                                                {o.order_type} • {o.priority}
                                            </span>
                                            {o.patient?.dob && (
                                                <span className="text-[9px] font-bold text-slate-400 uppercase hidden sm:inline">DOB: {o.patient.dob}</span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-5 hidden md:table-cell">
                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${o.order_type === 'LAB'
                                        ? 'bg-purple-900 text-white shadow-lg shadow-purple-500/20'
                                        : 'bg-blue-900 text-white shadow-lg shadow-blue-500/20'
                                        }`}>
                                        {o.order_type}
                                    </span>
                                </td>
                                <td className="py-5 hidden lg:table-cell">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${o.priority === 'STAT' 
                                        ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30' 
                                        : 'text-slate-400 border border-slate-100'
                                        }`}>
                                        {o.priority}
                                    </span>
                                </td>
                                <td className="py-5 text-right">
                                    <select
                                        value={o.status}
                                        onChange={(e) => onStatusUpdate(o.id, e.target.value)}
                                        className={`px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border-2 transition-all outline-none cursor-pointer appearance-none ${o.status === 'PENDING' ? 'bg-white text-slate-400 border-slate-100' :
                                            o.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' :
                                                o.status === 'COMPLETED' ? 'bg-his-green-500 text-white border-his-green-500 shadow-lg shadow-his-green-500/20' :
                                                    'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-500/20'
                                            }`}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="IN_PROGRESS">Executing</option>
                                        <option value="COMPLETED">Finalized</option>
                                        <option value="CANCELLED">Voided</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Worklist;
