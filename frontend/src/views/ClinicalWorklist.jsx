import React, { useState, useEffect } from 'react';
import { useDialog } from '../context/DialogContext';
import ResultEntryForm from '../components/ResultEntryForm';
import RadiologyResultForm from '../components/RadiologyResultForm';
import ResultApprovalView from '../components/ResultApprovalView';
import api, { API_BASE } from '../services/api';

const Worklist = ({ currentUser, activeTenant, searchTerm }) => {
    const { alert } = useDialog();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

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
            const response = await fetch(`${API_BASE}/orders/worklist`, {
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
            await alert({
                title: 'Data Fetch Error',
                message: 'Internal error while retrieving clinical queue.'
            });
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
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
            const response = await fetch(`${API_BASE}/orders/${orderId}`, {
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
            await alert({
                title: 'Operation Failed',
                message: `Update failed: ${error.message}`
            });
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Worklist</h2>
                    <p className="text-slate-500 font-medium mt-1">
                        {currentUser.role === 'TECH' ? 'Pending Technical Analysis' : 'Pending Specialist Approval'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                        {filteredOrders.length} {searchTerm ? 'Matches' : 'Tasks'}
                    </span>
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
                                    <span className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        <span className={`w-2 h-2 rounded-full ${order.status === 'PENDING' ? 'bg-amber-400' : 'bg-blue-400 animate-pulse'}`}></span>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="px-4 py-2 bg-his-green-500 text-white text-xs font-black rounded-xl hover:bg-his-green-600 transition-colors shadow-lg shadow-his-green-500/10"
                                    >
                                        {currentUser.role === 'TECH' ? 'Enter Results' : 'Review & Approve'}
                                    </button>
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

export default Worklist;
