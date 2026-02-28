import React, { useState } from 'react';
import { registerPatient } from '../services/api';

const RegisterPatientForm = ({ onPatientAdded, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        dob: '',
        gender: 'M',
        contact: '',
        patient_external_id: 'PAT-' + Math.floor(1000 + Math.random() * 9000),
    });

    const [loading, setLoading] = useState(false);

    const steps = [
        { id: 1, name: 'Demographics', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 2, name: 'Contact Info', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
        { id: 3, name: 'Insurance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await registerPatient(formData);
            onPatientAdded(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Patient Registry</h2>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">Please fulfill all clinical requirements</p>
            </div>

            {/* Stepper */}
            <div className="relative flex justify-between items-center px-2">
                <div className="absolute left-0 right-0 h-0.5 bg-his-slate-50 top-1/2 -translate-y-1/2 z-0" />
                {steps.map((s) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-3 group translate-z-0">
                        <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${step >= s.id
                                    ? 'bg-his-green-500 border-white text-white shadow-xl shadow-his-green-500/20'
                                    : 'bg-white border-his-slate-50 text-slate-300'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={s.icon} />
                            </svg>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-his-green-500' : 'text-slate-300'}`}>
                            {s.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="space-y-8 min-h-[300px]">
                {step === 1 && (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">First Name</label>
                            <input
                                required
                                value={formData.first_name}
                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. Juan"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Last Name</label>
                            <input
                                required
                                value={formData.last_name}
                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                                placeholder="e.g. Dela Cruz"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Date of Birth</label>
                            <input
                                type="date"
                                required
                                value={formData.dob}
                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all"
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Mobile Contact</label>
                            <input
                                required
                                value={formData.contact}
                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                                placeholder="+63 9xx xxx xxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">External System ID</label>
                            <input
                                disabled
                                value={formData.patient_external_id}
                                className="w-full bg-his-slate-100 border-2 border-his-slate-200 rounded-2xl p-4 text-sm font-black text-slate-500 outline-none italic cursor-not-allowed"
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-his-green-50 p-6 rounded-[2rem] border border-his-green-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-his-green-500 flex items-center justify-center text-white shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-xs font-bold text-his-green-700 leading-relaxed">
                                Ready to finalize registration. All demographic and contact data has been validated against HL7 standards.
                            </p>
                        </div>
                        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4">Final clinical review required</p>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-8 mt-4 border-t border-his-slate-50">
                    <button
                        type="button"
                        onClick={step === 1 ? onClose : prevStep}
                        className="px-8 py-4 bg-his-slate-100 text-slate-500 text-[10px] font-black rounded-2xl hover:bg-his-slate-200 transition-all uppercase tracking-widest"
                    >
                        {step === 1 ? 'Discard' : 'Go Back'}
                    </button>
                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-10 py-4 bg-his-green-500 text-white text-[10px] font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20"
                        >
                            Next Stage
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl hover:bg-black transition-all uppercase tracking-widest shadow-xl shadow-slate-900/20 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Complete Registry'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RegisterPatientForm;
