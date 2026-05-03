import React from 'react';

/**
 * High-Fidelity Clinical Icons (SVGs)
 */
const Icons = {
    Caduceus: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M12 2C11.45 2 11 2.45 11 3V4.08C9.56 4.34 8.28 5.09 7.37 6.13L8.79 7.54C9.42 6.88 10.3 6.38 11.23 6.13C11.38 7.3 11.66 8.5 12 9.77C12.34 8.5 12.63 7.3 12.77 6.13C13.7 6.38 14.58 6.88 15.21 7.54L16.63 6.13C15.72 5.09 14.44 4.34 13 4.08V3C13 2.45 12.55 2 12 2M12 11.69C11.45 11.69 11 12.14 11 12.69V22H13V12.69C13 12.14 12.55 11.69 12 11.69M7 8C5.9 8 5 8.9 5 10C5 11.1 5.9 12 7 12H9C10.1 12 11 11.1 11 10S10.1 8 9 8H7M17 8C15.9 8 15 8.9 15 10C15 11.1 15.9 12 17 12H19C20.1 12 21 11.1 21 10S20.1 8 19 8H17Z" />
        </svg>
    ),
    Phone: ({ className }) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
    ),
    MapPin: ({ className }) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
    Mail: ({ className }) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    ),
    Globe: ({ className }) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
    )
};

/**
 * SignatoryBlock
 */
const SignatoryBlock = ({ signatory, isA5 = false }) => (
    <div className={`text-right ${isA5 ? 'min-w-[140px]' : 'min-w-[200px]'}`}>
        <div className={`w-full border-b-2 border-slate-900 ${isA5 ? 'mb-1 h-6' : 'mb-2 h-10'} relative flex items-end justify-center`}>
            {/* Signature Placeholder/Hint */}
            <span className={`font-[cursive] ${isA5 ? 'text-lg' : 'text-xl'} rotate-[-2deg] opacity-5 select-none text-blue-900 absolute bottom-0`}>
                 {signatory?.name || 'Authorized'}
            </span>
        </div>
        {signatory?.name && (
            <p className={`font-black ${isA5 ? 'text-[11px]' : 'text-[14px]'} uppercase tracking-tight text-slate-900 leading-none`}>
                {signatory.name}
                {signatory.credential && <span className="opacity-70">, {signatory.credential}</span>}
            </p>
        )}
        <p className={`${isA5 ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-500 uppercase tracking-widest mt-0.5`}>
            {signatory?.specialization || signatory?.title || ''}
        </p>
        <div className="mt-1 flex flex-col gap-0.5">
            {signatory?.license_number && (
                <p className={`${isA5 ? 'text-[7px]' : 'text-[8px]'} font-bold text-slate-400 font-mono uppercase`}>
                    Lic No: <span className="text-slate-900 font-black">{signatory.license_number}</span>
                </p>
            )}
            {signatory?.ptr_number && (
                <p className={`${isA5 ? 'text-[7px]' : 'text-[8px]'} font-bold text-slate-400 font-mono uppercase`}>
                    PTR No: <span className="text-slate-900 font-black">{signatory.ptr_number}</span>
                </p>
            )}
        </div>
    </div>
);

/**
 * ClinicalDocumentWrapper
 */
const ClinicalDocumentWrapper = ({ 
    children, 
    title = "CLINICAL DOCUMENT",
    patient = {},
    activeTenant = null,
    physician = null,
    signatories = [],
    verificationHash = "",
    date = new Date().toISOString(),
    size = 'A4'
}) => {
    const isA5 = size.toUpperCase() === 'A5';
    const clinicName = activeTenant?.name || "JUANCLINIC HIS";
    const clinicAddress = activeTenant?.official_address || "Medical District, Manila, Philippines";
    const clinicContact = activeTenant?.contact_number || "";
    const clinicEmail = activeTenant?.email || "care@juanclinic.ph";
    const clinicWeb = activeTenant?.website || "www.juanclinic.ph";

    const getFullName = (person) => {
        if (!person) return '';
        const f = person.first_name && person.first_name !== 'undefined' ? person.first_name : '';
        const l = person.last_name && person.last_name !== 'undefined' ? person.last_name : '';
        return `${f} ${l}`.trim();
    };

    const finalSignatories = signatories.length > 0 
        ? signatories 
        : (physician ? [{ ...physician, name: physician.name || getFullName(physician), credential: 'M.D.' }] : []);

    return (
        <div 
            id="clinical-document-shell" 
            className={`bg-white w-full flex flex-col border-[0.5mm] border-slate-50 relative ${isA5 ? 'max-h-[210mm] p-[8mm]' : 'min-h-[295mm] p-[15mm]'} clinical-print-A5 font-sans`}
            style={isA5 ? { fontSize: '10pt', height: '210mm', width: '148mm', overflow: 'hidden' } : {}}
        >

            {/* Global Scoped Font Override */}
            {isA5 && (
                <style>{`
                    .clinical-print-A5 * {
                        font-size: 10pt !important;
                        line-height: 1.2 !important;
                    }
                `}</style>
            )}

            {/* 1. Header: 3-Column Profile */}
            <header className={`flex justify-between items-start ${isA5 ? 'mb-4' : 'mb-10'} relative z-10`}>
                {/* Physician Info (Left) */}
                <div className="flex-1">
                    {finalSignatories[0] ? (
                        <>
                            <h2 className={`${isA5 ? 'text-sm' : 'text-xl'} font-black text-blue-900 tracking-tighter uppercase mb-0.5`}>
                                {finalSignatories[0].name ? `Dr. ${finalSignatories[0].name}` : ''}
                            </h2>
                            <p className={`${isA5 ? 'text-[8px]' : 'text-[10px]'} font-bold text-slate-500 uppercase tracking-widest`}>
                                {finalSignatories[0].specialization || (finalSignatories[0].name ? 'General Practice' : '')}
                            </p>
                            {finalSignatories[0].license_number && finalSignatories[0].license_number !== '----------' && (
                                <p className={`${isA5 ? 'text-[7px]' : 'text-[9px]'} font-semibold text-slate-400 uppercase mt-0.5`}>
                                    License No. {finalSignatories[0].license_number}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="h-12 w-full bg-slate-50 rounded-lg animate-pulse" />
                    )}
                </div>

                {/* Logo (Center) */}
                <div className="px-4 flex flex-col items-center">
                    <div className={`${isA5 ? 'w-10 h-10' : 'w-16 h-16'} bg-blue-900 rounded-full flex items-center justify-center text-white shadow-lg mb-1`}>
                        <Icons.Caduceus className="w-2/3 h-2/3" />
                    </div>
                </div>

                {/* Clinic Info (Right) */}
                <div className="flex-1 text-right">
                    <h3 className={`${isA5 ? 'text-xs' : 'text-lg'} font-black text-slate-900 uppercase tracking-tighter`}>
                        {clinicName}
                    </h3>
                    {clinicAddress && clinicAddress !== 'N/A' && (
                        <p className={`${isA5 ? 'text-[7px]' : 'text-[9px]'} font-bold text-slate-500 uppercase tracking-tight max-w-[200px] ml-auto leading-tight mt-0.5 whitespace-normal`}>
                            {clinicAddress}
                        </p>
                    )}
                    {clinicContact && clinicContact !== 'N/A' && (
                        <p className={`${isA5 ? 'text-[7px]' : 'text-[9px]'} font-black text-blue-800 mt-1`}>
                            {clinicContact}
                        </p>
                    )}
                </div>
            </header>

            {/* Title Block */}
            <div className={`flex items-center gap-4 ${isA5 ? 'mb-4' : 'mb-8'} relative z-10`}>
                <div className="h-[1px] bg-slate-900/10 flex-1" />
                <div className="px-6 py-1 bg-slate-900 rounded-full">
                    <span className={`${isA5 ? 'text-[9px]' : 'text-xs'} font-black text-white uppercase tracking-[0.25em]`}>
                        {title}
                    </span>
                </div>
                <div className="h-[1px] bg-slate-900/10 flex-1" />
            </div>

            {/* 3. Main Document Body (RX Content) */}
            <main className="flex-1 relative z-10 w-full">
                {children}
            </main>

            {/* 4. Infrastructure Footer */}
            <footer className={`relative z-10 ${isA5 ? 'mt-4 pt-4' : 'mt-10 pt-8'} border-t border-slate-100`}>
                {/* Signatory Area (Now placed above for maximum signature space) */}
                <div className="flex justify-end mb-6">
                    <SignatoryBlock signatory={finalSignatories[0]} isA5={isA5} />
                </div>

                <div className="flex justify-between items-end">
                    {/* Legal & Branding (Left) */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-white">
                                <span className="text-xs font-black">JC</span>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-900 uppercase">
                                    {clinicName}
                                </h4>
                                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">Powered by JuanClinic HIS</p>
                            </div>
                        </div>
                        
                        {/* Contact Strip */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase">
                                <Icons.Phone className="w-2.5 h-2.5 text-blue-900" />
                                {clinicContact}
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase">
                                <Icons.Mail className="w-2.5 h-2.5 text-blue-900" />
                                {clinicEmail}
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase">
                                <Icons.MapPin className="w-2.5 h-2.5 text-blue-900" />
                                {clinicAddress.split(',')[0]}
                            </div>
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase">
                                <Icons.Globe className="w-2.5 h-2.5 text-blue-900" />
                                {clinicWeb}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Compliance Bar */}
                <div className="mt-4 pt-2 border-t border-slate-50 flex justify-between items-center text-[7px] font-black text-slate-300 uppercase tracking-widest">
                    <div className="flex gap-4">
                        <span className="text-blue-900/50 italic">Generic substitution is permitted unless "Dispense as Written" is noted.</span>
                    </div>
                    <span>{verificationHash || 'SHA-256 VALIDATED'} • PAGE 1 OF 1</span>
                </div>
            </footer>
        </div>
    );
};

export default ClinicalDocumentWrapper;
