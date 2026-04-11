import React, { useState, useEffect } from 'react';
import ResultEntryForm from '../components/ResultEntryForm';
import RadiologyResultForm from '../components/RadiologyResultForm';
import ResultApprovalView from '../components/ResultApprovalView';

const RadiologyWorklist = ({ currentUser, activeTenant, searchTerm }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('RAD');

    useEffect(() => {
        fetchWorklist();
    }, [currentUser, activeTenant]);

    const fetchWorklist = async () => {
        // Guard: Prevent fetching if the user context is not yet aligned with the tenant
        if (!activeTenant || (currentUser.tenant_id && currentUser.tenant_id !== activeTenant)) {
            console.log("Worklist: Skipping fetch due to context mismatch");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:8001/api/orders/worklist', {
                headers: {
                    'Accept': 'application/json',
                    'X-Tenant-ID': activeTenant,
                    'X-Simulated-User': currentUser.email
                }
            });
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch worklist", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (order.order_type !== activeTab) return false;

        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        const patientName = `${order.patient?.first_name} ${order.patient?.last_name}`.toLowerCase();
        const orderId = order.id.toString();
        const externalId = order.patient?.patient_external_id?.toLowerCase() || '';
        
        return patientName.includes(search) || orderId.includes(search) || externalId.includes(search);
    });

    const submitOrderUpdate = async (orderId, payload, reason = null) => {
        const finalPayload = { ...payload };
        if (reason) finalPayload.amendment_reason = reason;

        try {
            const response = await fetch(`http://localhost:8001/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Tenant-ID': activeTenant,
                    'X-Simulated-User': currentUser.email
                },
                body: JSON.stringify(finalPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Update failed");
            }

            setSelectedOrder(null);
            fetchWorklist();
        } catch (error) {
            console.error("Update failed", error);
            alert(`Update failed: ${error.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Radiology Worklist</h2>
                        <p className="text-slate-500 font-medium mt-1">
                            {currentUser.role === 'TECH' ? 'Diagnostic Imaging Workflow' : 'Pending Specialist Approval'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                            {filteredOrders.length} {searchTerm ? 'Matches' : 'Tasks'}
                        </span>
                    </div>
                </div>
                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-100 pb-2">
                    <button 
                        onClick={() => setActiveTab('RAD')}
                        className={`text-sm font-black uppercase tracking-widest pb-4 border-b-2 transition-all ${activeTab === 'RAD' ? 'text-his-green-600 border-his-green-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Radiology Workflow
                    </button>
                    <button 
                        onClick={() => setActiveTab('LAB')}
                        className={`text-sm font-black uppercase tracking-widest pb-4 border-b-2 transition-all ${activeTab === 'LAB' ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                    >
                        Laboratory Tasks
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-5">Order ID</th>
                            <th className="px-8 py-5">Patient</th>
                            <th className="px-8 py-5">Test Type</th>
                            <th className="px-8 py-5">Priority</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-8 py-20 text-center">
                                    <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching orders found</div>
                                </td>
                            </tr>
                        ) : filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5 font-bold text-slate-900">#{order.id.toString().padStart(4, '0')}</td>
                                <td className="px-8 py-5">
                                    <div className="font-bold text-slate-900">{order.patient?.first_name} {order.patient?.last_name}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">PID: {order.patient?.patient_external_id}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${order.order_type === 'LAB' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {order.order_type}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`font-bold text-xs ${order.priority === 'STAT' ? 'text-rose-500' : 'text-slate-500'}`}>
                                        {order.priority}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center">
                                            {/* Pipeline visual */}
                                            <div title="Pending" className={`w-3 h-3 rounded-full ${['PENDING', 'IN_PROGRESS', 'PRELIMINARY', 'COMPLETED'].includes(order.status) ? 'bg-amber-400' : 'bg-slate-200'}`} />
                                            <div className={`w-6 h-1 ${['IN_PROGRESS', 'PRELIMINARY', 'COMPLETED'].includes(order.status) ? 'bg-amber-400' : 'bg-slate-200'}`} />
                                            <div title="Executing" className={`w-3 h-3 rounded-full ${['IN_PROGRESS', 'PRELIMINARY', 'COMPLETED'].includes(order.status) ? (order.status === 'IN_PROGRESS' ? 'bg-amber-400 animate-pulse' : 'bg-amber-400') : 'bg-slate-200'} ${['PRELIMINARY', 'COMPLETED'].includes(order.status) ? 'bg-blue-400 !animate-none' : ''}`} />
                                            <div className={`w-6 h-1 ${['PRELIMINARY', 'COMPLETED'].includes(order.status) ? 'bg-blue-400' : 'bg-slate-200'}`} />
                                            <div title="Pending Review" className={`w-3 h-3 rounded-full ${['PRELIMINARY', 'COMPLETED'].includes(order.status) ? 'bg-blue-400' : 'bg-slate-200'} ${order.status === 'COMPLETED' ? 'bg-his-green-500' : ''}`} />
                                            <div className={`w-6 h-1 ${order.status === 'COMPLETED' ? 'bg-his-green-500' : 'bg-slate-200'}`} />
                                            <div title="Finalized" className={`w-3 h-3 rounded-full ${order.status === 'COMPLETED' ? 'bg-his-green-500' : 'bg-slate-200'}`} />
                                        </div>
                                        <div className="ml-4">
                                            {order.status === 'PRELIMINARY' && (
                                                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-amber-200 shadow-sm animate-pulse">
                                                    Pending Review
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    {currentUser.role === 'TECH' && order.status === 'PENDING' && (
                                        <button
                                            onClick={() => submitOrderUpdate(order.id, { status: 'IN_PROGRESS' })}
                                            className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-colors"
                                        >
                                            Begin Analysis
                                        </button>
                                    )}
                                    {currentUser.role === 'TECH' && order.status === 'IN_PROGRESS' && (
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="px-4 py-2 bg-his-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-his-green-600 transition-colors shadow-lg shadow-his-green-500/10"
                                        >
                                            Enter Report
                                        </button>
                                    )}
                                    {currentUser.role === 'DIAGNOSTIC_APPROVER' && order.status === 'PRELIMINARY' && (
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                                        >
                                            Finalize & Sign
                                        </button>
                                    )}
                                    {(order.status === 'COMPLETED' || order.status === 'CANCELLED' || (currentUser.role === 'ADMIN' && order.status !== 'PRELIMINARY')) && (
                                         <button
                                            className="px-4 py-2 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl cursor-not-allowed"
                                            disabled
                                        >
                                            View Only
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
                    <div className="bg-transparent w-full max-w-2xl my-8 animate-in fade-in zoom-in duration-300">
                        {currentUser.role === 'TECH' ? (
                            selectedOrder.order_type === 'RAD' ? (
                                <RadiologyResultForm
                                    order={selectedOrder}
                                    onSubmit={(orderId, resultData, reason) => submitOrderUpdate(orderId, { status: 'PRELIMINARY', result_data: resultData }, reason)}
                                    onCancel={() => setSelectedOrder(null)}
                                />
                            ) : (
                                <ResultEntryForm
                                    order={selectedOrder}
                                    onSubmit={(orderId, resultData, reason) => submitOrderUpdate(orderId, { status: 'PRELIMINARY', result_data: resultData }, reason)}
                                    onCancel={() => setSelectedOrder(null)}
                                />
                            )
                        ) : (
                            <ResultApprovalView
                                order={selectedOrder}
                                onDecision={(orderId, status) => submitOrderUpdate(orderId, { status, result_data: selectedOrder.result_data }, 'Final approval/review')}
                                onCancel={() => setSelectedOrder(null)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RadiologyWorklist;
