import React, { useState } from 'react';
import { registerPatient } from '../services/api';
import { addToSyncQueue, saveToLocal } from '../services/db';
import { useDialog } from '../context/DialogContext';

const RegisterPatientForm = ({ onPatientAdded, onClose, activeTenant }) => {
    const { alert } = useDialog();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        dob: '',
        gender: 'M',
        gestational_weeks: '',
        birth_weight_g: '',
        apgar_score: '',
        contact: '',
        email: '',
        preferred_language: 'en',
        receive_email_reminders: !!activeTenant?.email_enabled,
        receive_sms_reminders: !!activeTenant?.sms_enabled,
        patient_external_id: 'PAT-' + Date.now().toString(36).toUpperCase(),
    });
    const [isPediatric, setIsPediatric] = useState(false);
    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    const steps = [
        { id: 1, name: 'Demographics', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { id: 2, name: 'Contact & Preferences', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
        { id: 3, name: 'Insurance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        const tenantId = activeTenant?.id;

        // Validation for Contact (RA 10173 Compliance)
        const contactRegex = /^(09|\+639)\d{9}$/;
        if (!contactRegex.test(formData.contact)) {
            setErrors({ contact: ['Invalid mobile number. Use +639XX-XXX-XXXX format.'] });
            setStep(2); // Jump back to contact step
            setLoading(false);
            return;
        }

        try {
            const registeredPatient = await registerPatient({
                ...formData,
                tenant_id: tenantId
            });
            onPatientAdded(registeredPatient);
            // Also cache locally for faster subsequent loads
            await saveToLocal('patients', { ...registeredPatient, tenant_id: tenantId });
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
                // Auto-jump to clinical demographics if error is there
                if (err.response.data.errors.first_name || err.response.data.errors.last_name || err.response.data.errors.dob) setStep(1);
                else if (err.response.data.errors.contact || err.response.data.errors.email) setStep(2);
            } else if (err.response && err.response.status === 409) {
                await alert({
                    title: 'Credential Clash',
                    message: "Critical: Potential duplicate patient detected in the secure clinical registry. This operation has been flagged for audit review."
                });
            } else {
                await alert({
                    title: 'Registry Failure',
                    message: `Registration Failed: ${err.message || 'Server connection error.'}`
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDobChange = (dob) => {
        setFormData({ ...formData, dob });
        if (dob) {
            const birthDate = new Date(dob);
            const ageInMonths = (new Date() - birthDate) / (1000 * 60 * 60 * 24 * 30.44);
            setIsPediatric(ageInMonths < 24); // Show supplement for children under 2 years
        } else {
            setIsPediatric(false);
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
                            {errors.first_name && <p className="text-[10px] font-bold text-rose-500 mt-2 italic px-1">{errors.first_name[0]}</p>}
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
                            {errors.last_name && <p className="text-[10px] font-bold text-rose-500 mt-2 italic px-1">{errors.last_name[0]}</p>}
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Date of Birth</label>
                            <input
                                type="date"
                                required
                                value={formData.dob}
                                onChange={e => handleDobChange(e.target.value)}
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

                        {isPediatric && (
                            <div className="col-span-2 mt-4 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 space-y-6 animate-in zoom-in-95 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Neonatal Supplement</h4>
                                        <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Required for gestational age correction</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 px-1">Gestational Weeks</label>
                                        <input
                                            type="number"
                                            placeholder="40"
                                            value={formData.gestational_weeks}
                                            onChange={e => setFormData({ ...formData, gestational_weeks: e.target.value })}
                                            className="w-full bg-white border border-blue-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 px-1">Birth Weight (g)</label>
                                        <input
                                            type="number"
                                            placeholder="3200"
                                            value={formData.birth_weight_g}
                                            onChange={e => setFormData({ ...formData, birth_weight_g: e.target.value })}
                                            className="w-full bg-white border border-blue-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 px-1">APGAR Score</label>
                                        <input
                                            placeholder="9/10"
                                            value={formData.apgar_score}
                                            onChange={e => setFormData({ ...formData, apgar_score: e.target.value })}
                                            className="w-full bg-white border border-blue-100 rounded-xl p-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Mobile Contact</label>
                            <input
                                required
                                value={formData.contact}
                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                                placeholder="+63 9xx xxx xxxx"
                            />
                            {errors.contact && <p className="text-[10px] font-bold text-rose-500 mt-2 italic px-1">{errors.contact[0]}</p>}
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Email (Reminders)</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                                placeholder="patient@example.com"
                            />
                            {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-2 italic px-1">{errors.email[0]}</p>}
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Preferred Language</label>
                            <select
                                value={formData.preferred_language}
                                onChange={e => setFormData({ ...formData, preferred_language: e.target.value })}
                                className="w-full bg-his-slate-50 border-2 border-transparent focus:border-his-green-500/10 focus:bg-white rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none transition-all"
                            >
                                <option value="en">English</option>
                                <option value="tl">Tagalog (Filipino)</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">System ID</label>
                            <input
                                disabled
                                value={formData.patient_external_id}
                                className="w-full bg-his-slate-100 border-2 border-his-slate-200 rounded-2xl p-4 text-sm font-black text-slate-500 outline-none italic cursor-not-allowed"
                            />
                        </div>

                        {(activeTenant?.email_enabled || activeTenant?.sms_enabled) && (
                            <div className="col-span-2 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Notification Preferences</h4>
                                <div className="flex gap-6">
                                    {activeTenant?.email_enabled && (
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${formData.receive_email_reminders ? 'bg-his-green-500' : 'bg-slate-200'}`}
                                                onClick={() => setFormData({...formData, receive_email_reminders: !formData.receive_email_reminders})}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-all ${formData.receive_email_reminders ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Email</span>
                                        </label>
                                    )}
                                    {activeTenant?.sms_enabled && (
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-10 h-6 rounded-full p-1 transition-all ${formData.receive_sms_reminders ? 'bg-his-green-500' : 'bg-slate-200'}`}
                                                onClick={() => setFormData({...formData, receive_sms_reminders: !formData.receive_sms_reminders})}>
                                                <div className={`w-4 h-4 bg-white rounded-full transition-all ${formData.receive_sms_reminders ? 'translate-x-4' : 'translate-x-0'}`} />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">SMS</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}
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
                                Ready to finalize registration. All demographic and engagement preferences have been validated.
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
