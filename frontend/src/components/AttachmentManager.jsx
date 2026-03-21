import React, { useState, useEffect } from 'react';
import { getAttachments, uploadAttachment, downloadAttachment, deleteAttachment } from '../services/api';

const AttachmentManager = ({ patientId }) => {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (patientId) {
            fetchAttachments();
        }
    }, [patientId]);

    // Clear transient errors after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const fetchAttachments = async () => {
        setLoading(true);
        try {
            const data = await getAttachments(patientId);
            setAttachments(data);
        } catch (err) {
            console.error("Failed to fetch attachments", err);
            setError("Could not load clinical folders.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("File size exceeds 5MB limit.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('patient_id', patientId);
        formData.append('description', `Uploaded on ${new Date().toLocaleDateString()}`);

        setUploading(true);
        setError(null);
        try {
            await uploadAttachment(formData);
            await fetchAttachments();
        } catch (err) {
            console.error("Upload failed", err);
            const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to secure document.";
            const validationErrors = err.response?.data?.errors;
            const detailedMsg = validationErrors ? Object.values(validationErrors).flat().join(' ') : errorMsg;
            console.log("Setting UI Error State:", detailedMsg);
            setError(detailedMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL: Permanently delete this clinical document? This action is logged.")) return;
        
        try {
            await deleteAttachment(id);
            setAttachments(attachments.filter(a => a.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to remove document.");
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest text-[10px]">Accessing Vault...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        Clinical Attachments
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Encrypted PHI Storage</p>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">MAX 5MB • PDF, JPG, PNG</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {error && (
                        <div id="upload-error-tag" className="animate-in slide-in-from-right-4 fade-in duration-300 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest">{error}</p>
                        </div>
                    )}
                    
                    <label className={`relative flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-xl ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20'}`}>
                        <svg className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                        {uploading ? 'Securing...' : 'Upload Doc'}
                        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                </div>
            </div>

            {attachments.length === 0 ? (
                <div className="bg-his-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                        <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No clinical attachments found for this patient.<br/><span className="text-[10px] opacity-60">Upload lab results, scans, or referral letters.</span></p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {attachments.map((attachment) => (
                        <div key={attachment.id} className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sleek hover:border-blue-500/30 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${attachment.file_type.includes('pdf') ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {attachment.file_type.includes('pdf') ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002-2z" /></svg>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(attachment.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                                <h4 className="text-[13px] font-black text-slate-800 line-clamp-1 mb-1">{attachment.file_name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(attachment.file_size / 1024 / 1024).toFixed(2)} MB • {attachment.file_type.split('/')[1].toUpperCase()}</p>
                                <p className="text-[11px] font-medium text-slate-500 mt-3 line-clamp-2 italic leading-relaxed">
                                    "{attachment.description || 'No notes provided.'}"
                                </p>
                            </div>

                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(attachment.created_at).toLocaleDateString()}</span>
                                <button 
                                    onClick={() => downloadAttachment(attachment.id, attachment.file_name)}
                                    className="px-4 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-xl hover:bg-blue-100 transition-all uppercase tracking-widest border border-blue-100/30 flex items-center gap-2 shadow-sm"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Get Copy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttachmentManager;
