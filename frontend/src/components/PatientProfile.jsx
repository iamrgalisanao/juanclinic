import React, { useState, useEffect } from 'react';
import { getPatientHistory, updatePatient } from '../services/api';
import PrescriptionForm from './PrescriptionForm';
import AttachmentManager from './AttachmentManager';

const PatientProfile = ({ patientId, onBack }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [timelineFilter, setTimelineFilter] = useState('ALL'); // ALL | ORDERS | APPOINTMENTS | PRESCRIPTIONS
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [activeTab, setActiveTab] = useState('TIMELINE'); // TIMELINE | ATTACHMENTS | NOTES

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
        ...history.appointments.map(a => ({ ...a, type: 'APPOINTMENT', date: a.appointment_at })),
        ...history.prescriptions.map(p => ({ ...p, type: 'PRESCRIPTION', date: p.created_at }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const filteredTimeline = timeline.filter((event) => {
        if (timelineFilter === 'ORDERS' && event.type !== 'ORDER') return false;
        if (timelineFilter === 'APPOINTMENTS' && event.type !== 'APPOINTMENT') return false;
        if (timelineFilter === 'PRESCRIPTIONS' && event.type !== 'PRESCRIPTION') return false;
        return true;
    });

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Demographics */}
            <header className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sleek border border-his-slate-100 flex flex-col lg:flex-row justify-between lg:items-center gap-6 md:gap-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                    <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-his-slate-50 text-slate-400 flex items-center justify-center hover:bg-his-green-50 hover:text-his-green-500 transition-all group shrink-0">
                        <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 md:mb-2">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{patient.first_name} {patient.last_name}</h2>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-his-green-50 text-his-green-600 text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest border border-his-green-100/30">
                                    ID: {patient.patient_external_id}
                                </span>
                                <span className="px-3 py-1 bg-his-slate-50 text-slate-400 text-[9px] md:text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-100">
                                    {window.location.hostname.split('.')[0] || 'Default'} Tenant
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-900">{patient.gender === 'M' ? 'Male' : 'Female'}</span>
                                <span className="text-slate-200">•</span>
                                <span className="text-slate-900">DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                            </div>
                            <span className="hidden md:inline text-slate-200">•</span>
                            <span className="text-slate-900">Contact: {patient.contact}</span>
                            <span className="flex items-center gap-2 text-his-green-500 bg-his-green-50 px-2 py-0.5 rounded-lg border border-his-green-100/30 w-fit">
                                <div className="w-1.5 h-1.5 rounded-full bg-his-green-500 animate-pulse" />
                                PHI Access Logged: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-white text-slate-600 text-[10px] md:text-xs font-black rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all uppercase tracking-widest text-center"
                    >
                        Edit Profile
                    </button>
                    <div className="relative group/menu w-full sm:w-auto">
                        <button className="w-full px-6 py-3 bg-his-green-500 text-white text-[10px] md:text-xs font-black rounded-2xl shadow-xl shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                            New Order
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-full sm:w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-30">
                            <button 
                                onClick={() => setShowPrescriptionForm(true)}
                                className="w-full text-left px-6 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-his-green-50 hover:text-his-green-600 transition-colors flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-purple-400" />
                                Medication Prescription
                            </button>
                            <button className="w-full text-left px-6 py-3 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-his-green-50 hover:text-his-green-600 transition-colors flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                Diagnostic Order (LAB)
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {isEditing && (
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sleek border border-his-slate-100">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Edit Demographics</h3>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (isSubmitting) return;
                            
                            setIsSubmitting(true);
                            const formData = new FormData(e.target);
                            const payload = {
                                first_name: formData.get('first_name') || undefined,
                                last_name: formData.get('last_name') || undefined,
                                dob: formData.get('dob') || undefined,
                                gender: formData.get('gender') || undefined,
                                contact: formData.get('contact') || undefined,
                            };
                            try {
                                await updatePatient(patient.id, payload);
                                await fetchHistory();
                                setIsEditing(false);
                            } catch (err) {
                                console.error('Failed to update patient', err);
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div className="space-y-2">
                            <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">First Name</label>
                            <input
                                name="first_name"
                                defaultValue={patient.first_name}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Last Name</label>
                            <input
                                name="last_name"
                                defaultValue={patient.last_name}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                defaultValue={patient.dob}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Gender</label>
                            <select
                                name="gender"
                                defaultValue={patient.gender}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[12px] font-black uppercase tracking-widest text-slate-500 ml-2">Contact</label>
                            <input
                                name="contact"
                                defaultValue={patient.contact}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 outline-none transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-3 bg-slate-100 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-6 py-3 text-white text-xs font-black rounded-xl transition-all uppercase tracking-widest shadow-xl ${isSubmitting ? 'bg-slate-300 shadow-none cursor-not-allowed' : 'bg-his-green-500 hover:bg-his-green-600 shadow-his-green-500/20'}`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Privacy Management / DPA Section */}
            <section className="bg-his-slate-50/50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-his-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                            <svg className="w-4 h-4 text-his-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Privacy & DPA Management
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 sm:px-7">RA 10173 Compliance Controls</p>
                    </div>
                    <span className="px-3 py-1 bg-white text-slate-400 text-[9px] font-black rounded-full border border-slate-100 uppercase tracking-widest w-fit">Privacy level: standard</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-his-green-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-his-green-50 text-his-green-500 flex items-center justify-center shrink-0 group-hover:bg-his-green-500 group-hover:text-white transition-all">
                                <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <h4 className="text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-tight">Right to Object</h4>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5">Discontinue processing for specific purposes.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => window.confirm("Initiate Right to Object request? This will require administrative approval.")}
                            className="px-4 py-2 bg-his-slate-50 text-slate-400 text-[9px] md:text-[10px] font-black rounded-xl hover:bg-slate-100 transition-all border border-slate-100 min-h-[44px]"
                        >
                            Request Access
                        </button>
                    </div>

                    <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <div>
                                <h4 className="text-[11px] md:text-xs font-black text-slate-900 uppercase tracking-tight">Right to Erasure</h4>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5">Request removal of PHI data from system.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => window.confirm("CRITICAL: Initiate Right to Erasure? This launches a formal data removal workflow under RA 10173.")}
                            className="px-4 py-2 bg-rose-50 text-rose-400 text-[9px] md:text-[10px] font-black rounded-xl hover:bg-rose-100 transition-all border border-rose-100 min-h-[44px]"
                        >
                            Formal Request
                        </button>
                    </div>
                </div>
            </section>

            {showPrescriptionForm && (
                <PrescriptionForm 
                    patientId={patient.id}
                    prescription={selectedPrescription}
                    onSuccess={() => {
                        setShowPrescriptionForm(false);
                        setSelectedPrescription(null);
                        fetchHistory();
                    }}
                    onCancel={() => {
                        setShowPrescriptionForm(false);
                        setSelectedPrescription(null);
                    }}
                />
            )}

            <div className="flex gap-4 border-b border-slate-100 px-4">
                <button
                    onClick={() => setActiveTab('TIMELINE')}
                    className={`pb-4 px-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'TIMELINE' ? 'text-his-green-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-his-green-500' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Longitudinal History
                </button>
                <button
                    onClick={() => setActiveTab('ATTACHMENTS')}
                    className={`pb-4 px-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'ATTACHMENTS' ? 'text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Clinical Folders
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                {/* Timeline */}
                {activeTab === 'TIMELINE' && (
                    <>
                        <div className="lg:col-span-2 space-y-6 md:space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 md:px-4">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-his-green-500" />
                                    Longitudinal Timeline
                                </h3>
                                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
                                    <button
                                        type="button"
                                        onClick={() => setTimelineFilter('ALL')}
                                        className={`px-4 py-2 rounded-full border min-h-[44px] text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${timelineFilter === 'ALL' ? 'bg-his-green-500 text-white border-his-green-500 shadow-lg shadow-his-green-500/20' : 'bg-white text-slate-400 border-his-slate-100'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTimelineFilter('ORDERS')}
                                        className={`px-4 py-2 rounded-full border min-h-[44px] text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${timelineFilter === 'ORDERS' ? 'bg-his-green-500 text-white border-his-green-500 shadow-lg shadow-his-green-500/20' : 'bg-white text-slate-400 border-his-slate-100'}`}
                                    >
                                        Orders
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTimelineFilter('APPOINTMENTS')}
                                        className={`px-4 py-2 rounded-full border min-h-[44px] text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${timelineFilter === 'APPOINTMENTS' ? 'bg-his-green-500 text-white border-his-green-500 shadow-lg shadow-his-green-500/20' : 'bg-white text-slate-400 border-his-slate-100'}`}
                                    >
                                        Appts
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTimelineFilter('PRESCRIPTIONS')}
                                        className={`px-4 py-2 rounded-full border min-h-[44px] text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${timelineFilter === 'PRESCRIPTIONS' ? 'bg-his-green-500 text-white border-his-green-500 shadow-lg shadow-his-green-500/20' : 'bg-white text-slate-400 border-his-slate-100'}`}
                                    >
                                        Meds
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6 relative before:absolute before:left-[19px] md:before:left-[23px] before:top-2 before:bottom-2 before:w-[2px] before:bg-his-slate-100">
                                {filteredTimeline.map((event, idx) => (
                                    <div key={idx} className="flex gap-4 md:gap-8 group">
                                        <div className={`relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-500 group-hover:scale-110 ${
                                            event.type === 'ORDER' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                                            event.type === 'APPOINTMENT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            {event.type === 'ORDER' && (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                            )}
                                            {event.type === 'APPOINTMENT' && (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            )}
                                            {event.type === 'PRESCRIPTION' && (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 102.828 2.828l2.387-2.387a2 2 0 011.022-.547l2.387-.477a6 6 0 013.86-.517l.318-.158a6 6 0 003.86-.517l2.387.477a2 2 0 011.022.547l2.387 2.387a2 2 0 102.828-2.828l-2.387-2.387z" /></svg>
                                            )}
                                        </div>
                                        <div className="flex-1 bg-white rounded-3xl p-4 md:p-6 border border-his-slate-50 shadow-sm group-hover:shadow-md transition-all duration-300">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2 gap-2">
                                                <h4 className="font-black text-slate-900 text-[13px] md:text-sm">
                                                    {event.type === 'ORDER' ? `Order: ${event.order_type}` : 
                                                     event.type === 'APPOINTMENT' ? 'Clinic Appointment' : 
                                                     `Prescription: ${event.medication_name}`}
                                                </h4>
                                                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed font-medium">
                                                    {event.type === 'ORDER' ? `ID #${event.id}` : 
                                                     event.type === 'APPOINTMENT' ? `With ${event.doctor?.name || 'Staff'}` :
                                                     `${event.dosage} • ${event.frequency}`}
                                                </p>
                                                {(event.type === 'ORDER' || event.type === 'PRESCRIPTION') && (
                                                    <span className={`ml-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                        event.status === 'COMPLETED' || event.status === 'ACTIVE'
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : event.status === 'IN_PROGRESS' || event.status === 'PRELIMINARY'
                                                                ? 'bg-amber-50 text-amber-600'
                                                                : 'bg-slate-50 text-slate-400'
                                                    }`}>
                                                        {event.status}
                                                    </span>
                                                )}
                                            </div>

                                            {event.type === 'ORDER' && event.status === 'COMPLETED' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(event);
                                                        setSelectedPrescription(null);
                                                    }}
                                                    className="mt-4 px-4 py-2 bg-his-slate-50 text-his-green-600 text-[10px] font-black rounded-xl hover:bg-his-green-50 transition-all uppercase tracking-widest border border-his-green-100/30"
                                                >
                                                    View Finalized Findings
                                                </button>
                                            )}

                                            {event.type === 'PRESCRIPTION' && (
                                                <div className="flex gap-2 mt-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPrescription(event);
                                                            setSelectedOrder(null);
                                                        }}
                                                        className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl hover:bg-emerald-100 transition-all uppercase tracking-widest border border-emerald-100/30"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPrescription(event);
                                                            setShowPrescriptionForm(true);
                                                        }}
                                                        className="px-4 py-2 bg-his-slate-50 text-slate-400 text-[10px] font-black rounded-xl hover:bg-his-slate-100 transition-all uppercase tracking-widest border border-slate-100"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
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

                            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-his-slate-100 shadow-sleek min-h-[300px] md:min-h-[400px]">
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
                                ) : selectedPrescription ? (
                                    <div className="animate-in fade-in duration-500">
                                        <div className="flex justify-between items-start mb-8 border-b border-slate-50 pb-6">
                                            <div>
                                                <h4 className="font-black text-slate-900 text-base">{selectedPrescription.medication_name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Prescribed on {new Date(selectedPrescription.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase">{selectedPrescription.status}</span>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-his-slate-50/50 rounded-2xl border border-his-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dosage</p>
                                                    <p className="text-sm font-black text-slate-900">{selectedPrescription.dosage}</p>
                                                </div>
                                                <div className="p-4 bg-his-slate-50/50 rounded-2xl border border-his-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Frequency</p>
                                                    <p className="text-sm font-black text-slate-900">{selectedPrescription.frequency}</p>
                                                </div>
                                                <div className="p-4 bg-his-slate-50/50 rounded-2xl border border-his-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                                                    <p className="text-sm font-black text-slate-900">{selectedPrescription.duration}</p>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-his-green-50/30 rounded-3xl border border-his-green-100/50">
                                                <p className="text-[9px] font-black text-his-green-600 uppercase tracking-widest mb-2">Instructions</p>
                                                <p className="text-xs font-bold text-slate-700 leading-normal italic">
                                                    "{selectedPrescription.instructions || 'No additional instructions provided.'}"
                                                </p>
                                            </div>

                                            {selectedPrescription.amendments?.length > 0 && (
                                                <div className="mt-8">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Clinical Amendment History</p>
                                                    <div className="space-y-3">
                                                        {selectedPrescription.amendments.map((am, i) => (
                                                            <div key={i} className="text-[10px] p-3 border-l-2 border-amber-400 bg-amber-50/50 rounded-r-xl">
                                                                <p className="font-black text-amber-700 underline uppercase tracking-tight">{am.reason}</p>
                                                                <p className="text-slate-400 mt-1 font-bold">By {am.actor?.name} on {new Date(am.created_at).toLocaleString()}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                                        <svg className="w-16 h-16 text-slate-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        <p className="text-sm font-bold text-slate-400">Select a finalized order or prescription<br />to view clinical details.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Attachments */}
                {activeTab === 'ATTACHMENTS' && (
                    <div className="lg:col-span-3">
                        <AttachmentManager patientId={patient.id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientProfile;
