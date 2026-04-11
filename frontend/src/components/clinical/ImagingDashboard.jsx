import React, { useState, useEffect } from 'react';
import { getPatientImaging, uploadDicom } from '../../services/api';
import DICOMViewer from './DICOMViewer';

const ImagingDashboard = ({ patientId, patient }) => {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedStudy, setSelectedStudy] = useState(null);
    
    // Check if the current user is a System Admin or has the feature enabled
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    const isSystemAdmin = user.tenant_id === 888;
    
    // For this prototype, we'll assume the entitlement check happens on the backend
    // and returns a 403 if locked.
    
    useEffect(() => {
        fetchStudies();
    }, [patientId]);

    const fetchStudies = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPatientImaging(patientId);
            setStudies(data);
        } catch (err) {
            console.error("Failed to fetch imaging studies", err);
            setError(err.response?.data?.message || "Failed to load imaging studies.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('dicom_file', file);
        formData.append('patient_id', patientId);

        try {
            await uploadDicom(formData);
            await fetchStudies();
            alert("DICOM image ingested successfully into PACS.");
        } catch (err) {
            alert(err.response?.data?.message || "Ingestion failed.");
        } finally {
            setIsUploading(false);
        }
    };

    if (error && error.includes('Upgrade to Enterprise')) {
        return (
            <div className="bg-white rounded-[2.5rem] p-12 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 relative">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                    <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-rose-500/20 uppercase tracking-widest">Locked</div>
                </div>
                <div className="max-w-md space-y-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise RIS/PACS Module</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        Securely view and manage DICOM imaging (X-Ray, CT, MRI, Ultrasound) directly within the patient profile. Direct integration with internal modalities and external imaging networks.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <button className="flex-1 px-8 py-4 bg-his-green-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-his-green-500/20 hover:bg-his-green-600 transition-all uppercase tracking-widest">
                        Upgrade to Enterprise
                    </button>
                    <button className="flex-1 px-8 py-4 bg-white text-slate-400 text-xs font-black rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all uppercase tracking-widest">
                        Contact Support
                    </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Complies with DICOM PS3.0 and Philippines DPA Security Standards
                </p>
            </div>
        );
    }

    if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse">Syncing with PACS Gateway...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {selectedStudy && (
                <DICOMViewer study={selectedStudy} onClose={() => setSelectedStudy(null)} />
            )}

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        Radiology Information System (RIS)
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{studies.length} Diagnostic Studies Found</p>
                </div>
                <label className={`px-6 py-3 bg-purple-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all uppercase tracking-widest cursor-pointer flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    {isUploading ? 'Processing DICOM...' : 'Ingest Study File'}
                    <input type="file" className="hidden" accept=".dcm" onChange={handleFileUpload} disabled={isUploading} />
                </label>
            </header>

            {studies.length === 0 ? (
                <div className="bg-slate-50/50 rounded-[2.5rem] p-16 border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-slate-200 border border-slate-100 italic font-black shadow-sm">Empty</div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No medical imaging records for this patient.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {studies.map((study) => (
                        <div key={study.id} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-purple-500/30">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs shadow-inner">
                                    {study.modality}
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                                    {new Date(study.study_date).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 mb-1 group-hover:text-purple-600 transition-colors uppercase tracking-tight">{study.study_description || 'Untitled Study'}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Acc: {study.accession_number || 'N/A'}</p>
                            
                            <div className="mb-6">
                                {study.is_finalized ? (
                                    <div className="flex items-center gap-2 text-emerald-500">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Final Report Available</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-orange-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Interpretation Pending</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    {study.instances?.length || 0} Frames
                                </span>
                                <button 
                                    onClick={() => setSelectedStudy(study)}
                                    className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black rounded-xl hover:bg-purple-600 transition-all uppercase tracking-widest shadow-lg shadow-slate-900/10"
                                >
                                    {study.is_finalized ? 'View Report' : 'Open Viewer'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImagingDashboard;
