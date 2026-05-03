import React, { useState, useEffect } from 'react';
import { getPharmacyWorklist, dispenseMedication } from '../services/api';
import { useDialog } from '../context/DialogContext';

const PharmacyWorklist = ({ activeBranch, currentUser }) => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { alert } = useDialog();

    const fetchWorklist = async () => {
        try {
            setLoading(true);
            const data = await getPharmacyWorklist();
            setPrescriptions(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch pharmacy worklist:', err);
            setError('Failed to load pending prescriptions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeBranch) {
            fetchWorklist();
        }
    }, [activeBranch]);

    const handleDispense = async (id) => {
        try {
            await dispenseMedication(id);
            // Refresh worklist after successful dispensing
            fetchWorklist();
        } catch (err) {
            console.error('Dispensing failed:', err);
            await alert({
                title: 'Dispense Failed',
                message: 'Internal inventory error. Failed to dispense medication from clinical stocks.'
            });
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-his-slate-900 tracking-tight">Pharmacy Worklist</h2>
                    <p className="text-slate-500 text-sm font-medium">Pending prescriptions for fulfillment</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchWorklist}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-his-green-500 hover:bg-his-green-50 transition-all duration-300"
                        title="Refresh Worklist"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <span className="px-4 py-2 rounded-xl bg-his-green-50 text-his-green-600 text-xs font-black uppercase tracking-widest">
                        {prescriptions.length} Pending
                    </span>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-shake">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-slate-100">
                            <th className="pb-4">Prescription ID</th>
                            <th className="pb-4">Patient</th>
                            <th className="pb-4">Physician</th>
                            <th className="pb-4">Medication</th>
                            <th className="pb-4">Instructions</th>
                            <th className="pb-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="6" className="py-20 text-center text-slate-400 text-xs font-semibold animate-pulse uppercase tracking-[0.2em]">Synchronizing dispensing queue...</td></tr>
                        ) : prescriptions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Dispensing queue is currently clear</p>
                                    </div>
                                </td>
                            </tr>
                        ) : prescriptions.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="py-6 text-slate-400 text-[11px] font-mono font-bold tracking-tighter">
                                    #RX-{p.id.toString().padStart(5, '0')}
                                </td>
                                <td className="py-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-slate-900 leading-none mb-1">
                                            {p.patient ? `${p.patient.first_name} ${p.patient.last_name}` : 'Unknown Patient'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            PAT-{p.patient_id}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-6">
                                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
                                        Dr. {p.physician ? p.physician.name : 'Unknown'}
                                    </span>
                                </td>
                                <td className="py-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm text-his-slate-900 underline decoration-his-green-500/30 decoration-2 underline-offset-4 mb-1">
                                            {p.medicine ? p.medicine.generic_name : p.medication_name}
                                        </span>
                                        <span className="text-[10px] text-his-green-600 font-black uppercase tracking-[0.1em]">
                                            Qty: {p.quantity} • {p.dosage}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-6">
                                    <p className="text-xs text-slate-500 font-medium max-w-xs truncate" title={p.instructions || 'No special instructions'}>
                                        {p.instructions || 'Routine administration'}
                                    </p>
                                </td>
                                <td className="py-6 text-right">
                                    <button 
                                        onClick={() => handleDispense(p.id)}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-his-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-his-green-600 hover:shadow-lg hover:shadow-his-green-500/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                        Dispense
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PharmacyWorklist;
