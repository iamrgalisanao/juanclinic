import React, { useRef } from 'react';
import { printIsolatedDocument } from '../utils/PrintManager';
import ClinicalDocumentWrapper from './ui/ClinicalDocumentWrapper';

/**
 * Internal content component for the Medical Certificate body.
 */
const MedicalCertificateContent = ({ normalized, patient, age }) => (
    <div className="space-y-12 text-slate-800 leading-relaxed text-justify py-8">
        <p className="font-black tracking-widest uppercase text-sm text-slate-900 border-b border-slate-100 pb-2">To Whom It May Concern:</p>

        <p className="text-xl leading-[1.8]">
            This is to certify that <span className="font-black uppercase tracking-wider text-2xl mx-1 border-b-2 border-slate-900 px-2 leading-none">
                {patient?.first_name} {patient?.last_name}
            </span>,
            a <span className="font-black text-2xl mx-1">{age}</span> year-old
            <span className="font-black text-2xl mx-1">{patient?.gender === 'M' ? 'Male' : (patient?.gender === 'F' ? 'Female' : 'Patient')}</span>
            was examined and managed by the undersigned at this facility on <span className="font-black text-2xl mx-1 border-b-2 border-slate-900">{new Date(normalized.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>.
        </p>

        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Diagnosis / Clinical Impression:</p>
                <p className="pl-6 uppercase font-black text-2xl tracking-tight text-slate-900 leading-tight">{normalized.diagnosis}</p>
            </div>

            <div className="space-y-2">
                <p className="font-black uppercase tracking-widest text-[10px] text-slate-400">Recommendations / Medical Management:</p>
                <p className="pl-6 text-xl font-bold text-slate-700 leading-relaxed">{normalized.recommendations}</p>
            </div>
        </div>

        {normalized.rest_days > 0 && (
            <div className="my-10 p-8 bg-slate-50 border-l-8 border-slate-900 rounded-r-3xl">
                <p className="text-xl font-bold">The patient is medically advised to rest for a period of <span className="font-black text-3xl mx-2 px-6 py-1 bg-white border-2 border-slate-900 rounded-2xl">{normalized.rest_days}</span> day(s).</p>
            </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 tracking-wide italic leading-relaxed max-w-2xl">
                This certification is issued upon the request of the patient for whatever valid and legal purpose it may serve, except for medico-legal purposes. The information contained herein is true and correct based on findings at the time of examination.
            </p>
        </div>
    </div>
);

const MedicalCertificatePrintView = ({ 
    note, 
    patient, 
    activeTenant = null,
    onClose
}) => {
    const printRef = useRef(null);
    const { content, author, created_at, id } = note;
    
    // Normalization Helper
    const normalizeContent = (raw) => {
        if (raw.diagnosis || raw.recommendations) {
            return {
                diagnosis: raw.diagnosis || 'N/A',
                recommendations: raw.recommendations || 'N/A',
                rest_days: raw.rest_days || 0,
                remarks: raw.remarks || '',
                date: raw.examination_date || created_at
            };
        }
        if (raw.assessment || raw.plan) {
            return {
                diagnosis: raw.assessment || 'Under Clinical Evaluation',
                recommendations: raw.plan || 'See attached SOAP plan',
                rest_days: 0,
                remarks: raw.subjective || raw.chief_complaint || '',
                date: created_at
            };
        }
        return {
            diagnosis: typeof raw === 'string' ? raw : 'Pending Clinical Assessment',
            recommendations: 'Follow up as advised during encounter.',
            rest_days: 0,
            remarks: '',
            date: created_at
        };
    };

    const normalized = normalizeContent(content);
    const dob = patient?.dob ? new Date(patient.dob) : new Date();
    const age = new Date().getFullYear() - dob.getFullYear();
    const verificationHash = `JC-${String(id || 'VERIFIED').substring(0, 8).toUpperCase()}`;

    const handlePrint = async () => {
        if (printRef.current) {
            await printIsolatedDocument(printRef.current.innerHTML, `CERT-${patient?.last_name}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[95vh] shadow-2xl rounded-[3rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Action Header */}
                <div className="px-8 py-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Certificate Preview</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Unified Clinical Engine v3.2</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handlePrint}
                            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Generate & Print
                        </button>
                    </div>
                </div>

                {/* Preview Surface */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-12 flex justify-center">
                    <div ref={printRef} className="shadow-2xl bg-white origin-top transform scale-[0.85] md:scale-100">
                        <ClinicalDocumentWrapper
                            title="Medical Certificate"
                            patient={patient}
                            activeTenant={activeTenant}
                            physician={author}
                            verificationHash={verificationHash}
                            date={created_at}
                        >
                            <MedicalCertificateContent 
                                normalized={normalized} 
                                patient={patient} 
                                age={age} 
                            />
                        </ClinicalDocumentWrapper>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalCertificatePrintView;
