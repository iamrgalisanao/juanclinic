import React from 'react';

const Worklist = ({ orders, loading }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-slate-500 text-sm border-b border-white/10">
                        <th className="pb-4 font-medium">Order ID</th>
                        <th className="pb-4 font-medium">Patient</th>
                        <th className="pb-4 font-medium">Type</th>
                        <th className="pb-4 font-medium">Priority</th>
                        <th className="pb-4 font-medium">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        <tr><td colSpan="5" className="py-8 text-center text-slate-500">Syncing clinical worklist...</td></tr>
                    ) : orders.length === 0 ? (
                        <tr><td colSpan="5" className="py-8 text-center text-slate-500">No pending orders found.</td></tr>
                    ) : orders.map(o => (
                        <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                            <td className="py-4 text-slate-400 text-sm font-mono">#ORD-{o.id.toString().padStart(4, '0')}</td>
                            <td className="py-4 font-semibold">
                                {o.patient ? `${o.patient.first_name} ${o.patient.last_name}` : 'Unknown'}
                            </td>
                            <td className="py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.order_type === 'LAB' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {o.order_type}
                                </span>
                            </td>
                            <td className="py-4">
                                <span className={`text-[10px] font-bold ${o.priority === 'STAT' ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                                    {o.priority}
                                </span>
                            </td>
                            <td className="py-4">
                                <span className="px-2 py-1 rounded-md bg-white/5 text-slate-300 text-[10px] font-bold border border-white/10">
                                    {o.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Worklist;
