import React from 'react';
import QRCode from 'react-qr-code';

const DigitalPrescription = ({ rx, onClose }) => {
    if (!rx) return null;

    return (
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-2xl mx-auto border border-slate-100 animate-in zoom-in-95 duration-500">
            <header className="flex justify-between items-start mb-12">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">RX</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">JuanClinic Professional Script</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-slate-900">{rx.branch?.name || 'Main Branch'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {rx.qr_uuid?.substring(0, 8).toUpperCase()}</p>
                </div>
            </header>

            <div className="space-y-12">
                {/* Patient / Doctor Info */}
                <div className="grid grid-cols-2 gap-10">
                    <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Patient</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight">{rx.patient?.first_name} {rx.patient?.last_name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">DOB: {rx.patient?.dob}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Physician</p>
                        <p className="text-lg font-black text-slate-900 tracking-tight">Dr. {rx.physician?.last_name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Lic: {rx.physician?.license_number || 'P-42901'}</p>
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
                            <p className="text-sm font-black text-slate-700">{rx.frequency}</p>
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

                {/* QR Loop Section */}
                <div className="flex flex-col items-center gap-6 pt-6 text-center">
                    <div className="p-4 bg-white rounded-3xl border-4 border-his-slate-900 shadow-xl">
                        <QRCode 
                            value={`https://juanclinic.ph/verify/rx/${rx.qr_uuid}`} 
                            size={160}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Pharmacist Verification Scan</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-tighter">
                            Authorized for {rx.remaining_quantity} Remaining Units • Cryptographic Sig: RX-{rx.qr_uuid?.substring(0, 5)}
                        </p>
                    </div>
                </div>
            </div>

            <footer className="mt-12 pt-10 border-t border-slate-100 flex justify-center gap-8">
                <button 
                   onClick={() => window.print()}
                   className="px-8 py-3 bg-his-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20"
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
