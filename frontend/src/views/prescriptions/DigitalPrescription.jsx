import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { printIsolatedDocument } from '../../utils/PrintManager';
import ClinicalDocumentWrapper from '../../components/ui/ClinicalDocumentWrapper';
import { PrescriptionDocumentContent } from '../../components/PrescriptionPrintView';
import ReactDOMServer from 'react-dom/server';

const DigitalPrescription = ({ rx, onClose }) => {
    const printSurfaceRef = useRef(null);

    if (!rx) return null;

    // Formatting Helpers
    const formatFrequency = (val) => {
        if (!val) return 'AS DIRECTED';
        const num = parseFloat(val);
        if (!isNaN(num) && String(num) === String(val).trim()) {
            return `${num} X A DAY`;
        }
        return String(val).toUpperCase();
    };

    const formatDuration = (val) => {
        if (!val) return 'FOLLOW UP';
        const num = parseFloat(val);
        if (!isNaN(num) && String(num) === String(val).trim()) {
            return `${num} DAYS`;
        }
        return String(val).toUpperCase();
    };

    const handlePrint = async () => {
        // High-fidelity clinical document shell for print on A5
        const items = [{
            medication_name: rx.medication_name,
            dosage: rx.dosage,
            frequency: rx.frequency,
            quantity: rx.quantity,
            duration: rx.duration || 'N/A',
            instructions: rx.instructions
        }];

        const printHtml = ReactDOMServer.renderToString(
            <ClinicalDocumentWrapper
                title="Prescription Form"
                patient={rx.patient}
                activeTenant={rx.branch}
                physician={rx.physician}
                verificationHash={`RX-${rx.qr_uuid?.substring(0, 8).toUpperCase()}`}
                date={rx.created_at}
                size="A5"
            >
                <PrescriptionDocumentContent 
                    items={items} 
                    patient={rx.patient}
                    vitals={rx.vital_data || rx.vitals}
                    diagnosis={rx.diagnosis}
                    complaints={rx.complaints}
                    findings={rx.findings}
                    date={rx.created_at}
                    formatFrequency={formatFrequency} 
                    formatDuration={formatDuration} 
                    isA5={true}
                />
                
                {/* Specific Digital Verification QR */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col items-center gap-2 opacity-50">
                    <div className="p-1 border border-slate-300 rounded-lg">
                        <QRCode value={`https://juanclinic.ph/verify/rx/${rx.qr_uuid}`} size={60} />
                    </div>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Digital Verification Hash • {rx.qr_uuid?.substring(0, 8).toUpperCase()}
                    </p>
                </div>
            </ClinicalDocumentWrapper>
        );

        await printIsolatedDocument(printHtml, `RX-${rx.patient?.last_name || 'DOC'}`, 'A5');
    };

    return (
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-2xl mx-auto border border-slate-100 animate-in zoom-in-95 duration-500">
            <header className="flex justify-between items-start mb-12">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">RX</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">JuanClinic Professional Script</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{rx.branch?.name || 'Main Branch'}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        {rx.physician?.specialization || rx.physician?.title || ''}
                    </p>
                </div>
            </header>

            <div className="space-y-12">
                {/* Patient / Doctor Info */}
                <div className="grid grid-cols-2 gap-10">
                    <div>
                        <p className="text-lg font-black text-slate-900 tracking-tight">
                            {rx.patient?.first_name && rx.patient?.first_name !== 'undefined' ? rx.patient.first_name : ''} {rx.patient?.last_name && rx.patient?.last_name !== 'undefined' ? rx.patient.last_name : ''}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                            {rx.patient?.dob && rx.patient?.dob !== 'undefined' ? `DOB: ${rx.patient.dob}` : ''}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Physician</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight">
                            {rx.physician?.last_name && rx.physician?.last_name !== 'undefined' ? `Dr. ${rx.physician.last_name}` : ''}
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                            {rx.physician?.license_number && rx.physician.license_number !== '----------' ? `Lic: ${rx.physician.license_number}` : ''}
                        </p>
                    </div>
                </div>

                {/* Medication Details */}
                <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <div>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{rx.medication_name}</p>
                        <p className="text-sm font-bold text-sky-600 uppercase tracking-widest">{rx.dosage}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Frequency</p>
                            <p className="text-sm font-black text-slate-700">{formatFrequency(rx.frequency)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Quantity</p>
                            <p className="text-sm font-black text-slate-700">{rx.quantity} Units</p>
                        </div>
                    </div>

                    <div className="pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">Instructions</p>
                        <p className="text-sm font-bold text-slate-600 italic">"{rx.instructions}"</p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 pt-6 text-center">
                    <div className="p-4 bg-white rounded-3xl border-4 border-slate-900 shadow-xl">
                        <QRCode 
                            value={`https://juanclinic.ph/verify/rx/${rx.qr_uuid}`} 
                            size={120}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Pharmacist Verification Scan</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-tighter">
                            Authorized Unit Count: {rx.quantity || '1'} Units • Ref: {rx.qr_uuid?.substring(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            <footer className="mt-12 pt-10 border-t border-slate-100 flex justify-center gap-8">
                <button 
                   onClick={handlePrint}
                   className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20"
                >
                    Print Clinical Script
                </button>
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-white text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all"
                >
                    Close Portal
                </button>
            </footer>
        </div>
    );
};

export default DigitalPrescription;
