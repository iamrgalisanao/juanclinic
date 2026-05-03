import React, { useState } from 'react';
import { createOrder, checkSafetyStatus } from '../services/api';
import { useDialog } from '../context/DialogContext';

const OrderForm = ({ patientId, type = 'LAB', onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [priority, setPriority] = useState('ROUTINE');
    const [testName, setTestName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [modality, setModality] = useState('X-RAY');
    const [bodyPart, setBodyPart] = useState('');
    const { alert } = useDialog();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Safety Critical Check
            const { data: safety } = await checkSafetyStatus(patientId);
            if (safety.has_unacknowledged_criticals) {
                await alert({
                    title: 'Safety Alert',
                    message: `This patient has ${safety.vitals_count + safety.labs_count} unacknowledged critical finding(s). You must review and acknowledge these findings in the Clinical Chronicle before placing new orders.`
                });
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error("Safety check failed", err);
        }

        const payload = {
            patient_id: patientId,
            order_type: type,
            priority: priority,
            request_details: {
                test_name: testName,
                instructions: instructions,
                modality: type === 'RAD' ? modality : undefined,
                body_part: type === 'RAD' ? bodyPart : undefined,
                ordered_at: new Date().toISOString()
            }
        };

        try {
            await createOrder(payload);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create diagnostic order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sleek border border-his-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
                <div className="w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-2">
                        <span className="px-3 py-1 bg-his-green-50 text-his-green-600 text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest border border-his-green-100/30">
                            ID: {patientId}
                        </span>
                        <span className={`px-3 py-1 text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest border ${type === 'LAB' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                            {type} Diagnostic
                        </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-tight">
                        New {type === 'LAB' ? 'Laboratory' : 'Radiology'} Request
                    </h3>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Clinical Order Entry System</p>
                </div>
                <button 
                    onClick={onCancel}
                    className="absolute top-6 right-6 sm:static w-10 h-10 rounded-xl bg-his-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${type === 'RAD' ? 'md:col-span-1' : 'md:col-span-2'} space-y-2`}>
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">{type === 'LAB' ? 'Procedure / Test Name' : 'Imaging Procedure'}</label>
                    <input
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        required
                        placeholder={type === 'LAB' ? "e.g. CBC, Lipid Profile, Glucose" : "e.g. Chest X-Ray, CT Scan"}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                    />
                </div>

                {type === 'RAD' && (
                    <div className="space-y-2">
                        <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Modality</label>
                        <select
                            value={modality}
                            onChange={(e) => setModality(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all appearance-none"
                        >
                            <option value="X-RAY">X-RAY (Digital Radiology)</option>
                            <option value="CT">CT (Computed Tomography)</option>
                            <option value="MRI">MRI (Magnetic Resonance Imaging)</option>
                            <option value="US">Ultrasound</option>
                            <option value="MAMMO">Mammography</option>
                            <option value="DEXA">DEXA (Bone Density)</option>
                        </select>
                    </div>
                )}

                {type === 'RAD' && (
                    <div className="md:col-span-1 space-y-2">
                        <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Body Part / Laterality</label>
                        <input
                            value={bodyPart}
                            onChange={(e) => setBodyPart(e.target.value)}
                            required
                            placeholder="e.g. Left Knee, Chest, Abdomen"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Priority Level</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setPriority('ROUTINE')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${priority === 'ROUTINE' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                        >
                            Routine
                        </button>
                        <button
                            type="button"
                            onClick={() => setPriority('STAT')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${priority === 'STAT' ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:bg-rose-50'}`}
                        >
                            STAT / Urgent
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Clinical Instructions</label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Additional clinical notes or specific instructions for the technician..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all min-h-[100px]"
                    />
                </div>

                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-8 py-4 bg-his-slate-100 text-slate-600 text-[11px] md:text-xs font-black rounded-2xl hover:bg-his-slate-200 transition-all uppercase tracking-widest min-h-[48px]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full sm:w-auto px-8 py-4 bg-his-green-500 text-white text-[11px] md:text-xs font-black rounded-2xl shadow-xl shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 min-h-[48px] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Transmitting Order...' : 'Dispatch Diagnostic Order'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OrderForm;
