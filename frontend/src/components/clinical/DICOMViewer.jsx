import React, { useEffect, useRef, useState } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';
import Hammer from 'hammerjs';
import { submitImagingReport, finalizeImagingStudy, API_BASE } from '../../services/api';
import { useDialog } from '../../context/DialogContext';

// Initialize Cornerstone WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

// Configure the image loader to include the auth token
const token = localStorage.getItem('auth_token');
cornerstoneWADOImageLoader.configure({
    beforeSend: function(xhr) {
        if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
    }
});

const DICOMViewer = ({ study: initialStudy, onClose }) => {
    const { confirm, alert } = useDialog();
    const viewerRef = useRef(null);
    const [study, setStudy] = useState(initialStudy);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Reporting State
    const [findings, setFindings] = useState(study.findings || '');
    const [impression, setImpression] = useState(study.impression || '');
    const [showReporting, setShowReporting] = useState(true);

    const instances = study.instances || [];
    const currentInstance = instances[currentIndex];

    useEffect(() => {
        const element = viewerRef.current;
        if (!element || !currentInstance) return;

        cornerstone.enable(element);

        const loadAndDisplayImage = async () => {
            setLoading(true);
            try {
                const imageId = `wadouri:${API_BASE}/imaging/instances/${currentInstance.id}`;
                const image = await cornerstone.loadImage(imageId);
                cornerstone.displayImage(element, image);
                cornerstone.setViewport(element, cornerstone.getDefaultViewportForImage(element, image));
            } catch (err) {
                console.error("Cornerstone Loading Error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAndDisplayImage();

        return () => {
            cornerstone.disable(element);
        };
    }, [currentIndex, currentInstance]);

    const handleSaveReport = async () => {
        setSaving(true);
        try {
            const response = await submitImagingReport(study.id, { findings, impression });
            setStudy(response.study);
            await alert({
                title: 'Report Saved',
                message: 'Preliminary report saved successfully.'
            });
        } catch (err) {
            await alert({
                title: 'Save Failed',
                message: err.response?.data?.message || "Failed to save report."
            });
        } finally {
            setSaving(false);
        }
    };

    const handleFinalize = async () => {
        const confirmed = await confirm({
            title: 'Finalize Study?',
            message: 'Are you sure you want to finalize this study? This will lock the report and complete the diagnostic order.',
            confirmText: 'Finalize',
            cancelText: 'Cancel'
        });
        
        if (!confirmed) return;
        
        setSaving(true);
        try {
            // Must save first if changed
            if (findings !== study.findings || impression !== study.impression) {
                await submitImagingReport(study.id, { findings, impression });
            }
            const response = await finalizeImagingStudy(study.id);
            setStudy(response.study);
            await alert({
                title: 'Study Finalized',
                message: 'Study finalized successfully.'
            });
        } catch (err) {
            await alert({
                title: 'Finalization Failed',
                message: err.response?.data?.message || "Failed to finalize study."
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-[70] flex flex-col animate-in fade-in duration-500">
            {/* Viewer Header */}
            <header className="p-6 bg-slate-900 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">{study.modality} • {study.study_description}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Study UID: {study.study_instance_uid}</p>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <button 
                        onClick={() => setShowReporting(!showReporting)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showReporting ? 'bg-his-green-500 text-white' : 'bg-white/5 text-slate-400'}`}
                    >
                        {showReporting ? 'Hide Reporting' : 'Show Reporting'}
                    </button>
                </div>
                <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 relative flex overflow-hidden">
                {/* Instance Sidebar */}
                <aside className="w-24 bg-slate-900/50 border-r border-white/5 overflow-y-auto custom-scrollbar p-2 hidden sm:block">
                    <div className="space-y-2">
                        {instances.map((inst, idx) => (
                            <button
                                key={inst.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-full aspect-square rounded-xl border flex items-center justify-center transition-all ${currentIndex === idx ? 'bg-his-green-500/20 border-his-green-500' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                            >
                                <span className={`text-[10px] font-black ${currentIndex === idx ? 'text-his-green-500' : 'text-slate-500'}`}>{idx + 1}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Viewport Area */}
                <main className="flex-1 relative bg-black flex items-center justify-center">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-his-green-500/20 border-t-his-green-500 rounded-full animate-spin" />
                                <span className="text-[10px] font-black text-his-green-500 uppercase tracking-widest">Rendering DICOM Stack...</span>
                            </div>
                        </div>
                    )}
                    <div 
                        ref={viewerRef} 
                        className="w-full h-full max-w-full max-h-full cursor-crosshair"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                    
                    <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 text-white pointer-events-none">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                            <span className="text-[9px] font-black text-slate-500 uppercase">Index</span>
                            <span className="text-[9px] font-bold text-his-green-500 uppercase">{currentIndex + 1} / {instances.length}</span>
                        </div>
                    </div>
                </main>

                {/* Radiology Reporting Panel */}
                {showReporting && (
                    <aside className="w-96 bg-slate-900 border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-8 border-b border-white/5">
                            <h4 className="text-xs font-black text-his-green-500 uppercase tracking-[0.2em] mb-4">Diagnostic Interpretation</h4>
                            {study.is_finalized ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-4 mb-6">
                                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase">Study Finalized</span>
                                </div>
                            ) : (
                                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-4 mb-6">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-orange-500 uppercase">Preliminary Status</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Findings</label>
                                <textarea
                                    value={findings}
                                    onChange={(e) => setFindings(e.target.value)}
                                    disabled={study.is_finalized}
                                    placeholder="Describe detailed observations..."
                                    className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium text-white placeholder:text-slate-600 focus:border-his-green-500/50 transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Impression</label>
                                <textarea
                                    value={impression}
                                    onChange={(e) => setImpression(e.target.value)}
                                    disabled={study.is_finalized}
                                    placeholder="Final diagnostic synthesis..."
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-bold text-white placeholder:text-slate-600 focus:border-his-green-500/50 transition-all resize-none"
                                />
                            </div>

                            {study.radiologist_id && (
                                <div className="pt-8 border-t border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Interpreted By</p>
                                    <p className="text-xs font-bold text-white uppercase italic">Digital Signature Verified</p>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1">{new Date(study.interpretation_date).toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        {!study.is_finalized && (
                            <div className="p-8 bg-slate-900 border-t border-white/5 space-y-4">
                                <button
                                    onClick={handleSaveReport}
                                    disabled={saving}
                                    className="w-full py-4 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                >
                                    {saving ? 'Processing...' : 'Save Preliminary'}
                                </button>
                                <button
                                    onClick={handleFinalize}
                                    disabled={saving || !findings || !impression}
                                    className="w-full py-4 bg-his-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-his-green-600 transition-all shadow-lg shadow-his-green-500/20 disabled:opacity-30 flex items-center justify-center gap-3"
                                >
                                    Finalize Report
                                </button>
                            </div>
                        )}
                    </aside>
                )}
            </div>

            {/* Viewer Footer */}
            <footer className="p-6 bg-slate-900 border-t border-white/5 flex justify-center gap-4">
                <button 
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="px-6 py-3 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    Previous Frame
                </button>
                <div className="flex items-center gap-3 px-6 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase">Frame {currentIndex + 1} / {instances.length}</span>
                </div>
                <button 
                    disabled={currentIndex === instances.length - 1}
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="px-6 py-3 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    Next Frame
                </button>
            </footer>
        </div>
    );
};

export default DICOMViewer;
