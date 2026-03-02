import React, { useState, useEffect } from 'react';
import { getPatientHistory } from '../services/api';

const PatientProfile = ({ patientId, onBack }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (patientId) {
            fetchHistory();
        }
    }, [patientId]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const historyData = await getPatientHistory(patientId);
            setData(historyData);
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">Loading Longitudinal Record...</div>;
    if (!data) return <div className="p-20 text-center text-rose-500 font-black">Patient not found or access denied.</div>;

    const { patient, history } = data;
    const timeline = [
        ...history.orders.map(o => ({ ...o, type: 'ORDER', date: o.created_at })),
        ...history.appointments.map(a => ({ ...a, type: 'APPOINTMENT', date: a.appointment_at }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Demographics */}
            <header className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-his-slate-50 text-slate-400 flex items-center justify-center hover:bg-his-green-50 hover:text-his-green-500 transition-all group">
                        <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{patient.first_name} {patient.last_name}</h2>
                            <span className="px-3 py-1 bg-his-slate-50 text-slate-400 text-[10px] font-mono font-bold rounded-md border border-slate-100">{patient.patient_external_id}</span>
                        </div>
                        <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>{patient.gender === 'M' ? 'Male' : 'Female'}</span>
                            <span>•</span>
                            <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Contact: {patient.contact}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white text-slate-600 text-xs font-black rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        Edit Profile
                    </button>
                    <button className="px-6 py-3 bg-his-green-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-widest">
                        New Order
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Timeline */}
                <div className="xl:col-span-2 space-y-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 px-4">
                        <div className="w-2 h-2 rounded-full bg-his-green-500" />
                        Longitudinal Timeline
                    </h3>

                    <div className="space-y-6 relative before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-[2px] before:bg-his-slate-100">
                        {timeline.map((event, idx) => (
                            <div key={idx} className="flex gap-8 group">
                                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-500 group-hover:scale-110 ${event.type === 'ORDER' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                    {event.type === 'ORDER' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    )}
                                </div>
                                <div className="flex-1 bg-white rounded-3xl p-6 border border-his-slate-50 shadow-sm group-hover:shadow-md transition-all duration-300">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-black text-slate-900 text-sm">
                                            {event.type === 'ORDER' ? `Diagnostic Order: ${event.order_type}` : 'Clinic Appointment'}
                                        </h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        {event.type === 'ORDER' ? `Order #${event.id} - ${event.status}` : `Appointment scheduled with ${event.doctor?.name || 'Staff'}`}
                                    </p>

                                    {event.type === 'ORDER' && event.status === 'COMPLETED' && (
                                        <button
                                            onClick={() => setSelectedOrder(event)}
                                            className="mt-4 px-4 py-2 bg-his-slate-50 text-his-green-600 text-[10px] font-black rounded-xl hover:bg-his-green-50 transition-all uppercase tracking-widest border border-his-green-100/30"
                                        >
                                            View Finalized Findings
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Result Viewer */}
                <div className="space-y-8">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 px-4">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        Finding Details
                    </h3>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-his-slate-100 shadow-sleek min-h-[400px]">
                        {selectedOrder ? (
                            <div className="animate-in fade-in duration-500">
                                <div className="flex justify-between items-start mb-8 border-b border-slate-50 pb-6">
                                    <div>
                                        <h4 className="font-black text-slate-900 text-base">Results for Order #{selectedOrder.id}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Verified on {new Date(selectedOrder.updated_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase">Finalized</span>
                                </div>

                                <div className="space-y-4">
                                    {Object.entries(selectedOrder.result_data || {}).map(([key, value], idx) => (
                                        <div key={idx} className="flex justify-between p-4 bg-his-slate-50/50 rounded-2xl border border-his-slate-50 group hover:bg-white hover:border-his-green-100 transition-all">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{key}</span>
                                            <span className="text-xs font-black text-slate-900">{value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 pt-10 border-t border-dashed border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-his-slate-100 flex items-center justify-center text-xs font-black text-slate-400">SIG</div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Digitally Signed By</p>
                                            <p className="text-xs font-bold text-his-green-500 mt-0.5">Dr. Specialist Approver</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                                <svg className="w-16 h-16 text-slate-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                <p className="text-sm font-bold text-slate-400">Select a finalized order<br />to view structured results.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfile;
