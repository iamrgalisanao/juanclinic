import React from 'react';

const MedicalCertificatePrintView = ({ note, patient, clinicName = "JUANCLINIC HEALTH INFORMATION SYSTEM" }) => {
    const { content, author, created_at } = note;

    // Calculate age
    const dob = patient?.dob ? new Date(patient.dob) : new Date();
    const age = new Date().getFullYear() - dob.getFullYear();

    return (
        <div className="bg-white p-10 max-w-4xl mx-auto font-sans print:p-0 print:shadow-none text-slate-900">
            {/* Print action bar (hidden during actual print) */}
            <div className="flex justify-end mb-8 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-his-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Document
                </button>
            </div>

            <div className="border-[3px] border-slate-900 p-12 print:border-none print:p-0">
                {/* Header */}
                <div className="text-center border-b-2 border-slate-800 pb-8 mb-10">
                    <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-slate-900 leading-tight">{clinicName}</h1>
                    <p className="text-sm font-bold text-slate-600 tracking-[0.3em] mt-3 uppercase">Excellence in Healthcare Delivery</p>
                    <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">Medical District, Metro Manila, Philippines</p>
                </div>

                {/* Title */}
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-slate-900 underline underline-offset-8">Medical Certificate</h2>
                </div>

                {/* Date */}
                <div className="flex justify-end mb-10">
                    <p className="font-bold text-slate-800 text-sm tracking-widest uppercase">Date: <span className="font-black underline underline-offset-4 ml-3 border-b-2 border-slate-800 pb-1">{new Date(created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                </div>

                {/* Body */}
                <div className="space-y-8 text-slate-800 leading-loose font-medium text-justify">
                    <p className="font-black tracking-widest uppercase text-sm">To Whom It May Concern:</p>

                    <p className="text-lg leading-relaxed">
                        This is to certify that <span className="font-black uppercase tracking-wider text-xl mx-1 border-b-2 border-slate-800 px-2">{patient?.first_name} {patient?.last_name}</span>,
                        a <span className="font-black text-lg mx-1">{age}</span> year-old
                        <span className="font-black text-lg mx-1">{patient?.gender === 'M' ? 'Male' : (patient?.gender === 'F' ? 'Female' : 'Patient')}</span>
                        was examined and treated at this institution on <span className="font-black text-lg mx-1">{new Date(content?.examination_date || created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>.
                    </p>

                    <div className="my-10 space-y-3">
                        <p className="font-black uppercase tracking-widest text-sm text-slate-500">Diagnosis / Impression:</p>
                        <p className="pl-6 uppercase font-black text-xl tracking-wide">{content?.diagnosis || 'N/A'}</p>
                    </div>

                    <div className="my-10 space-y-3">
                        <p className="font-black uppercase tracking-widest text-sm text-slate-500">Recommendations / Medical Management:</p>
                        <p className="pl-6 text-lg font-bold">{content?.recommendations || 'N/A'}</p>
                    </div>

                    {content?.rest_days > 0 && (
                        <div className="my-10 p-6 bg-slate-50 border-2 border-slate-200 rounded-2xl print:border-none print:bg-transparent print:p-0">
                            <p className="text-lg">The patient is advised to rest for a period of <span className="font-black text-2xl mx-2 px-3 py-1 bg-white border-2 border-slate-300 rounded-xl print:border-none">{content.rest_days}</span> day(s).</p>
                        </div>
                    )}

                    {content?.remarks && (
                        <div className="my-10 space-y-3">
                            <p className="font-black uppercase tracking-widest text-sm text-slate-500">Additional Remarks:</p>
                            <p className="pl-6 font-bold italic text-slate-700">{content.remarks}</p>
                        </div>
                    )}

                    <p className="mt-12 text-sm font-bold text-slate-500 tracking-wide">
                        This certification is issued upon the request of the patient for whatever valid and legal purpose it may serve (except for medico-legal purposes).
                    </p>
                </div>

                {/* Signature */}
                <div className="mt-24 flex justify-end">
                    <div className="text-center">
                        <div className="w-64 border-b-2 border-slate-900 mb-3"></div>
                        <p className="font-black text-lg uppercase tracking-widest text-slate-900">{author?.name}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Attending Physician</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">Lic No. 120-XXXX-2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalCertificatePrintView;
