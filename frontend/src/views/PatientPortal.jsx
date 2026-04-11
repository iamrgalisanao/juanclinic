import React, { useState, useEffect } from 'react';
import { authorizePortal, getPortalSummary } from '../services/api';

const PatientPortal = () => {
    const [step, setStep] = useState('pin'); // 'pin' | 'summary'
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'growth' | 'vaccines' | 'diagnostics'

    // Extract patient_id from URL (e.g. #portal?id=5)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const patientId = urlParams.get('id');

    const handlePinSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const auth = await authorizePortal(patientId, pin);
            const data = await getPortalSummary(auth.access_key);
            setSummary(data);
            setStep('summary');
        } catch (err) {
            setError(err.response?.data?.message || "Invalid PIN. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!patientId) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="bg-white rounded-[3rem] p-12 shadow-sleek max-w-md w-full">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 font-black text-2xl">!</div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Invalid Portal Link</h2>
                    <p className="text-sm font-medium text-slate-500">The link you followed is missing a patient identifier. Please contact your clinic for a valid portal link.</p>
                </div>
            </div>
        );
    }

    if (step === 'pin') {
        return (
            <div className="min-h-screen bg-his-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
                {/* Visual Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-his-green-500 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-[3rem] p-10 md:p-16 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] max-w-xl w-full relative z-10 animate-in fade-in zoom-in-95 duration-700">
                    <div className="text-center mb-12">
                        <div className="inline-block px-4 py-2 bg-his-green-50 text-his-green-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">Secure Patient Gateway</div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">JuanClinic<br />Health Records</h1>
                        <p className="text-sm font-medium text-slate-500 mt-4 px-6 leading-relaxed">Please enter the security PIN provided by your healthcare provider (usually your Date of Birth in <span className="text-slate-900 font-bold">YYYY-MM-DD</span> format).</p>
                    </div>

                    <form onSubmit={handlePinSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Security PIN (DOB)</label>
                            <input 
                                type="text"
                                placeholder="YYYY-MM-DD"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-5 text-xl font-black text-slate-900 placeholder:text-slate-300 focus:border-his-green-500 focus:ring-0 transition-all text-center tracking-widest"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 text-rose-600 p-5 rounded-2xl text-xs font-bold text-center border-l-4 border-rose-500 animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button 
                            disabled={loading}
                            className="w-full py-6 bg-his-slate-900 text-white text-xs font-black rounded-[2rem] shadow-2xl shadow-slate-900/30 hover:bg-his-green-500 transition-all uppercase tracking-[0.3em] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                    Unlock Records
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t border-slate-100 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-loose">
                            Protected by juanclinic HIS 256-bit isolation<br />
                            Complies with Philippines Data Privacy Act (RA 10173)
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 animate-in fade-in duration-700">
            {/* Mobile Header */}
            <header className="bg-white border-b border-slate-100 p-6 sticky top-0 z-30 shadow-sm md:hidden">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-900 italic">juanclinic</h2>
                    <div className="w-10 h-10 rounded-full bg-his-green-500 text-white flex items-center justify-center font-black text-xs">
                        {summary.patient.name[0]}
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-8 md:py-16 space-y-12 pb-32">
                {/* Desktop Header */}
                <div className="hidden md:flex justify-between items-end mb-16">
                    <div>
                        <p className="text-[10px] font-black text-his-green-500 uppercase tracking-[0.3em] mb-4">Patient Portal Gateway</p>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Records for {summary.patient.name}</h1>
                        <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">{summary.clinic.name} • {summary.clinic.branch}</p>
                    </div>
                    <button className="px-8 py-4 bg-white text-slate-900 text-[10px] font-black rounded-2xl border border-slate-100 shadow-sm hover:bg-rose-50 hover:text-rose-500 transition-all uppercase tracking-widest" onClick={() => window.location.reload()}>
                        Secure Logout
                    </button>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {[
                        { label: 'External ID', value: summary.patient.external_id, color: 'text-blue-500' },
                        { label: 'Gender', value: summary.patient.gender === 'M' ? 'Male' : 'Female', color: 'text-purple-500' },
                        { label: 'Date of Birth', value: summary.patient.dob, color: 'text-his-green-500' },
                        { label: 'Status', value: 'Verified', color: 'text-emerald-500' },
                    ].map((info, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{info.label}</p>
                            <p className={`text-sm md:text-lg font-black tracking-tight ${info.color}`}>{info.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto gap-4 pb-4 md:pb-0 scrollbar-hide no-scrollbar">
                    {[
                        { id: 'overview', label: 'Overview', icon: 'M4 6h16M4 12h16M4 18h16' },
                        { id: 'growth', label: 'Growth & Vitals', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                        { id: 'vaccines', label: 'Vaccine Card', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                        { id: 'diagnostics', label: 'Diagnostics', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-none px-8 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-300 ${activeTab === tab.id ? 'bg-his-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 shadow-sm'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-700">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Summary Card */}
                            <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Health Status</h3>
                                <div className="space-y-8">
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-his-green-50 text-his-green-500 flex items-center justify-center shrink-0">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Immunization is Up to Date</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{summary.immunizations.length} Records Verified</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v11a1 1 0 102 0v-7l5 5 5-5V8a1 1 0 00-2 0v2l-3-3a1 1 0 00-1.414 0l-3 3V5a1 1 0 011-1h5a1 1 0 100-2H4a1 1 0 00-1 1z" clipRule="evenodd" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Normal Growth Pattern</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Z-Score Analytics Synchronized</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clinic Info Card */}
                            <div className="bg-his-slate-900 rounded-[3rem] p-10 md:p-12 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-10">
                                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black mb-10 tracking-tight">Your Healthcare Provider</h3>
                                    <div className="space-y-6 mb-12">
                                        <div>
                                            <p className="text-[10px] font-black text-his-green-500 uppercase tracking-widest mb-1">Clinic Name</p>
                                            <p className="text-lg font-black">{summary.clinic.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-his-green-500 uppercase tracking-widest mb-1">Branch Location</p>
                                            <p className="text-md font-bold text-slate-300">{summary.clinic.branch}</p>
                                        </div>
                                    </div>
                                    <button className="w-full py-5 bg-white text-slate-900 text-xs font-black rounded-2xl hover:bg-his-green-500 hover:text-white transition-all uppercase tracking-widest">
                                        Request Appointment
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'growth' && (
                        <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-slate-100 overflow-x-auto">
                            <h3 className="text-xl font-black text-slate-900 mb-10 tracking-tight">Pediatric Growth Log</h3>
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-50">
                                        <th className="pb-6">Date</th>
                                        <th className="pb-6">Weight (kg)</th>
                                        <th className="pb-6">Height (cm)</th>
                                        <th className="pb-6">Head Circ. (cm)</th>
                                        <th className="pb-6">BMI</th>
                                        <th className="pb-6 text-right">Analysis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.vitals.length > 0 ? summary.vitals.map(v => (
                                        <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="py-6 text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date(v.created_at).toLocaleDateString()}</td>
                                            <td className="py-6 text-sm font-black text-slate-900">{v.weight_kg || '-'}</td>
                                            <td className="py-6 text-sm font-black text-slate-900">{v.height_cm || '-'}</td>
                                            <td className="py-6 text-sm font-black text-slate-900">{v.head_circumference_cm || '-'}</td>
                                            <td className="py-6 text-sm font-black text-slate-900">{v.bmi || '-'}</td>
                                            <td className="py-6 text-right">
                                                <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full uppercase tracking-widest">Normal</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" className="py-12 text-center text-slate-300 font-black italic">No growth records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'vaccines' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {summary.immunizations.length > 0 ? summary.immunizations.map(v => (
                                <div key={v.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group border-t-4 border-t-emerald-500">
                                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl">
                                                {new Date(v.administered_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 mb-2">{v.vaccine_name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-6">Batch: {v.batch_number || 'N/A'}</p>
                                        <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Administered By</span>
                                            <span className="text-slate-900">{v.administered_by || 'Verified Clinician'}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 text-center text-slate-300 font-black italic uppercase tracking-widest">No vaccination records confirmed.</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'diagnostics' && (
                        <div className="space-y-6">
                            {summary.diagnostic_summary.length > 0 ? summary.diagnostic_summary.map(order => (
                                <div key={order.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:border-his-green-500 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center font-black text-xs uppercase">
                                            {order.order_type}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 group-hover:text-his-green-500 transition-colors uppercase tracking-tight text-md">{order.request_details?.test_name || 'Medical Test'}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Report Ref: {order.order_id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl">
                                            Finalized {new Date(order.updated_at).toLocaleDateString()}
                                        </span>
                                        <button className="flex-1 md:flex-none px-6 py-3 bg-his-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-his-green-500 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10">
                                            Download Report
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-20 text-center text-slate-300 font-black italic uppercase tracking-widest">No diagnostic summaries finalized.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-lg border-t border-white/10 p-8 z-40">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-his-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        End-to-End Cryptographic Isolation: Active
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center md:text-right">
                        © 2026 JuanClinic HIS • Specialized Pediatric & Clinical Intelligence Platform
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PatientPortal;
