import React, { useState, useEffect } from 'react';
import { getClinicalTemplates, getClinicalNotes, createClinicalNote } from '../services/api';
import { useDialog } from '../context/DialogContext';
import DynamicClinicalForm from './forms/DynamicClinicalForm';
import MedicalCertificatePrintView from './MedicalCertificatePrintView';

const ClinicalNotesManager = ({ patientId, patient, activeTenant }) => {
    const { alert } = useDialog();
    const [notes, setNotes] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [printCertNote, setPrintCertNote] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [notesData, templatesData] = await Promise.all([
                    getClinicalNotes(patientId),
                    getClinicalTemplates()
                ]);
                setNotes(notesData);
                setTemplates(templatesData);
            } catch (err) {
                console.error('Error fetching clinical data:', err);
                setError('Failed to load clinical notes.');
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchData();
        }
    }, [patientId]);

    const handleFieldChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveNote = async () => {
        try {
            const payload = {
                patient_id: patientId,
                template_id: selectedTemplate?.id || null,
                note_type: selectedTemplate ? 'TEMPLATE' : 'SOAP',
                content: formData,
                status: 'SIGNED'
            };

            const newNote = await createClinicalNote(payload);
            setNotes([newNote, ...notes]);
            setIsAdding(false);
            setFormData({});
            setSelectedTemplate(null);
        } catch (err) {
            console.error('Error saving clinical note:', err);
            await alert({
                title: 'Storage Error',
                message: 'Failed to synchronize clinical encounter data. Please check required fields.'
            });
        }
    };

    if (loading) return <div className="p-4 text-slate-500">Loading clinical history...</div>;
    if (error) return <div className="p-4 text-rose-500">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800">Clinical Encounters & Notes</h3>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                    >
                        + New Encounter Note
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-300">
                    <div className="flex justify-between mb-4">
                        <h4 className="font-bold text-slate-700 underline">Record New Clinical Note</h4>
                        <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-slate-800">Cancel</button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Select Specialty Template:</label>
                        <select
                            className="w-full p-2 border rounded-md bg-white text-slate-900"
                            onChange={(e) => {
                                const t = templates.find(temp => temp.id === parseInt(e.target.value));
                                setSelectedTemplate(t);
                                setFormData({});
                            }}
                        >
                            <option value="">-- Generic SOAP Note --</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <div className="sm:hidden mt-2 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedTemplate(null);
                                    setFormData({});
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                    !selectedTemplate
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-slate-700 border-slate-300'
                                }`}
                            >
                                Generic SOAP Note
                            </button>
                            {templates.map((t) => (
                                <button
                                    key={`mobile-template-${t.id}`}
                                    type="button"
                                    onClick={() => {
                                        setSelectedTemplate(t);
                                        setFormData({});
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                                        selectedTemplate?.id === t.id
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-slate-700 border-slate-300'
                                    }`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                        {selectedTemplate && <p className="text-xs text-slate-500 mt-1 italic">{selectedTemplate.description}</p>}
                    </div>

                    {selectedTemplate ? (
                        <DynamicClinicalForm
                            schema={selectedTemplate.schema}
                            formData={formData}
                            onChange={handleFieldChange}
                        />
                    ) : (
                        <div className="flex flex-col gap-4">
                            <textarea
                                placeholder="Enter free-text SOAP or progress note here..."
                                className="w-full p-3 border rounded-md min-h-[150px]"
                                onChange={(e) => setFormData(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={handleSaveNote}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 font-bold"
                        >
                            Sign & Save Note
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {notes.length === 0 ? (
                    <p className="text-center text-slate-400 py-10">No clinical notes recorded yet for this patient.</p>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="bg-white p-5 rounded-lg border border-slate-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3 border-b pb-2">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 mr-2">
                                        {note.template?.name || note.note_type}
                                    </span>
                                    <span className="text-sm text-slate-500">{new Date(note.created_at).toLocaleString()}</span>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <div>
                                        <p className="text-xs font-medium text-slate-700">Author: {note.author?.name}</p>
                                        <span className={`text-[10px] font-bold px-1.5 rounded ${note.status === 'SIGNED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {note.status}
                                        </span>
                                    </div>
                                    {note.status === 'SIGNED' && (
                                        <button
                                            onClick={() => setPrintCertNote(note)}
                                            className="text-[10px] font-black uppercase tracking-widest text-his-green-600 hover:text-his-green-700 bg-his-green-50 px-3 py-1.5 rounded-lg border border-his-green-100 transition-colors flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                            Issue Certificate
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="text-slate-700 whitespace-pre-wrap">
                                {typeof note.content === 'object' ? (
                                    <div className="flex flex-col gap-4">
                                        {Object.entries(note.content).map(([key, val]) => {
                                            // Specialized SDE Renderer
                                            if (key === 'sde_content' && typeof val === 'object') {
                                                return (
                                                    <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <span className="text-[10px] uppercase text-indigo-500 font-extrabold tracking-widest block mb-2">
                                                            Review of Systems (SDE)
                                                        </span>
                                                        <div className="space-y-3">
                                                            {Object.entries(val).map(([systemId, systemData]) => {
                                                                // Handle WNL (Within Normal Limits)
                                                                if (systemData.wnl) {
                                                                    return (
                                                                        <div key={systemId} className="flex items-center gap-2 py-1">
                                                                            <span className="text-[10px] font-bold text-slate-800 uppercase min-w-[120px]">
                                                                                {systemId.replace(/_/g, ' ')}
                                                                            </span>
                                                                            <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1.5 uppercase tracking-tighter">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                                                Within Normal Limits
                                                                            </span>
                                                                            {systemData.remarks && (
                                                                                <span className="text-[10px] text-slate-400 italic ml-2">
                                                                                    ({systemData.remarks})
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }

                                                                const symptoms = Object.entries(systemData.symptoms || {})
                                                                    .map(([sId, sData]) => {
                                                                        const mods = Object.entries(sData.modifiers || {})
                                                                            .map(([mId, mVal]) => mVal)
                                                                            .join(', ');
                                                                        return `${sId.replace(/_/g, ' ')}${mods ? ` (${mods})` : ''}`;
                                                                    });
                                                                
                                                                if (symptoms.length === 0 && !systemData.remarks) return null;

                                                                return (
                                                                    <div key={systemId} className="flex flex-col py-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-bold text-slate-800 uppercase min-w-[120px]">
                                                                                {systemId.replace(/_/g, ' ')}
                                                                            </span>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {symptoms.map(s => (
                                                                                    <span key={s} className="text-[10px] text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200 font-semibold shadow-sm italic">
                                                                                        {s}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        {systemData.remarks && (
                                                                            <p className="text-[11px] text-slate-500 italic mt-1 ml-[120px]">
                                                                                Note: {systemData.remarks}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">{key.replace(/_/g, ' ')}</span>
                                                    <span className="text-sm font-medium text-slate-800">{typeof val === 'object' ? JSON.stringify(val) : val.toString()}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed">{note.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Print Modal Overlay */}
            {printCertNote && (
                <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:block">
                    <div className="relative bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl print:max-w-none print:max-h-none print:overflow-visible print:rounded-none print:shadow-none">
                        <button
                            onClick={() => setPrintCertNote(null)}
                            className="sticky top-6 float-right mr-6 p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors print:hidden"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <MedicalCertificatePrintView 
                            note={printCertNote} 
                            patient={patient} 
                            activeTenant={activeTenant} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicalNotesManager;
