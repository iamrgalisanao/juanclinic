import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const LAB_LOOKUPS = {
    'CBC': [
        { key: 'Hemoglobin', unit: 'g/dL', ref_range: '13.5 - 17.5', info: 'The protein in your blood that carries oxygen.' },
        { key: 'RBC Count', unit: 'x10^6/uL', ref_range: '4.5 - 5.9', info: 'Red Blood Cells which carry oxygen throughout your body.' },
        { key: 'WBC Count', unit: 'x10^3/uL', ref_range: '4.5 - 11.0', info: 'White Blood Cells that help your body fight infections.' },
        { key: 'Platelet Count', unit: 'x10^3/uL', ref_range: '150 - 450', info: 'Small blood cells that help your blood clot to stop bleeding.' },
        { key: 'Hematocrit', unit: '%', ref_range: '41 - 50', info: 'The proportion of your blood that is made up of red blood cells.' },
        { key: 'MCV', unit: 'fL', ref_range: '80 - 100', info: 'The average size of your red blood cells.' },
        { key: 'MCH', unit: 'pg', ref_range: '27 - 33', info: 'The average amount of hemoglobin in each red blood cell.' },
        { key: 'MCHC', unit: 'g/dL', ref_range: '32 - 36', info: 'The concentration of hemoglobin in a given volume of red blood cells.' },
        { key: 'Neutrophils', unit: '%', ref_range: '40 - 70', info: 'A type of white blood cell that is the first line of defense against bacteria.' },
        { key: 'Lymphocytes', unit: '%', ref_range: '20 - 40', info: 'A type of white blood cell that helps your immune system remember past infections.' },
        { key: 'Monocytes', unit: '%', ref_range: '2 - 8', info: 'A type of white blood cell that helps remove dead or damaged tissues.' },
        { key: 'Eosinophils', unit: '%', ref_range: '1 - 4', info: 'A type of white blood cell often involved in allergic reactions and fighting parasites.' },
        { key: 'Basophils', unit: '%', ref_range: '0.5 - 1', info: 'A type of white blood cell involved in inflammatory reactions.' }
    ],
    'LIPID PROFILE': [
        { key: 'Total Cholesterol', unit: 'mg/dL', ref_range: '< 200', info: 'Overall amount of cholesterol in your blood.' },
        { key: 'Triglycerides', unit: 'mg/dL', ref_range: '< 150', info: 'A type of fat in your blood; high levels can increase heart disease risk.' },
        { key: 'HDL Cholesterol', unit: 'mg/dL', ref_range: '> 40', info: "The 'good' cholesterol that helps remove other forms of cholesterol." },
        { key: 'LDL Cholesterol', unit: 'mg/dL', ref_range: '< 100', info: "The 'bad' cholesterol that can build up in your arteries." }
    ],
    'LIVER FUNCTION': [
        { key: 'ALT (SGPT)', unit: 'U/L', ref_range: '7 - 55', info: 'An enzyme found mostly in the liver; high levels suggest liver damage.' },
        { key: 'AST (SGOT)', unit: 'U/L', ref_range: '8 - 48', info: 'An enzyme found in the liver and heart; used to check for liver health.' },
        { key: 'ALP', unit: 'U/L', ref_range: '40 - 129', info: 'Alkaline Phosphatase; high levels can indicate liver or bone issues.' },
        { key: 'Albumin', unit: 'g/dL', ref_range: '3.5 - 5.0', info: 'A protein made by the liver that keeps fluid from leaking out of blood vessels.' },
        { key: 'Total Bilirubin', unit: 'mg/dL', ref_range: '0.1 - 1.2', info: 'A substance produced during the breakdown of red blood cells; processed by the liver.' }
    ]
};

const ResultEntryForm = ({ order, onSubmit, onCancel }) => {
    // Determine initial rows based on order details
    const getInitialRows = () => {
        const testName = (order.request_details?.test_name || '').toUpperCase();
        
        // Find if we have a lookup for this test name (searching for substring)
        const match = Object.keys(LAB_LOOKUPS).find(k => testName.includes(k));
        
        if (match) {
            return LAB_LOOKUPS[match].map((p, idx) => ({
                id: Date.now() + idx,
                key: p.key,
                value: '',
                ref_range: p.ref_range,
                unit: p.unit,
                info: p.info
            }));
        }

        return [{ id: Date.now(), key: '', value: '', ref_range: '', unit: '', info: '' }];
    };

    const [rows, setRows] = useState(getInitialRows());
    const [amendmentReason, setAmendmentReason] = useState('Initial result entry');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddRow = () => {
        setRows([...rows, { id: Date.now(), key: '', value: '', ref_range: '', unit: '' }]);
    };

    const handleRemoveRow = (id) => {
        setRows(rows.filter(row => row.id !== id));
    };

    const handleRowChange = (id, field, newValue) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: newValue } : row));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Convert the array of objects into a single JSON dictionary
        // Storing as objects for professional reporting
        const resultData = rows.reduce((acc, row) => {
            if (row.key.trim() !== '') {
                acc[row.key.trim()] = {
                    value: row.value.trim(),
                    ref_range: row.ref_range.trim() || 'N/A',
                    unit: row.unit.trim() || '-'
                };
            }
            return acc;
        }, {});

        try {
            await onSubmit(order.id, resultData, amendmentReason);
        } catch (error) {
            console.error("Failed to submit results", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">Enter Structured Clinical Results</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Recording professional-grade findings for {order.order_type} Order #{order.id}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col max-h-[calc(100vh-200px)]">
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="space-y-4">
                        {/* Headers - Fixed at top of scroll area */}
                        <div className="flex gap-4 px-2 mb-2">
                            <div className="w-[30%] text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Parameter</div>
                            <div className="w-[20%] text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-center">Result</div>
                            <div className="w-[25%] text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 text-center">Ref. Range</div>
                            <div className="w-[20%] text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Unit</div>
                            <div className="w-[5%]"></div>
                        </div>

                        {/* Scrollable Container for Dynamic Rows */}
                        <div className="overflow-y-auto pr-2 space-y-3 max-h-[400px] custom-scrollbar">
                            {rows.map((row, index) => (
                                <div key={row.id} className="flex gap-4 items-center group bg-slate-50/50 p-2 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/20 transition-all">
                                    <div className="w-[30%] relative flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g., Hemoglobin"
                                            value={row.key}
                                            onChange={(e) => handleRowChange(row.id, 'key', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            required
                                        />
                                        {row.info && (
                                            <div className="relative group/info">
                                                <InformationCircleIcon className="w-4 h-4 text-slate-300 hover:text-blue-500 cursor-help transition-colors" />
                                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 font-medium leading-relaxed">
                                                    {row.info}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-[20%]">
                                        <input
                                            type="text"
                                            placeholder="Value"
                                            value={row.value}
                                            onChange={(e) => handleRowChange(row.id, 'value', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-black text-center"
                                        />
                                    </div>
                                    <div className="w-[25%]">
                                        <input
                                            type="text"
                                            placeholder="e.g. 13 - 17"
                                            value={row.ref_range}
                                            onChange={(e) => handleRowChange(row.id, 'ref_range', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-center italic"
                                        />
                                    </div>
                                    <div className="w-[20%]">
                                        <input
                                            type="text"
                                            placeholder="Unit"
                                            value={row.unit}
                                            onChange={(e) => handleRowChange(row.id, 'unit', e.target.value)}
                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="w-[5%] flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRow(row.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Remove row"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={handleAddRow}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[3]" />
                        Add Test Parameter
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Reason for entry / amendment</label>
                    <input
                        type="text"
                        placeholder="e.g., Routine entry, Verified by Tech..."
                        value={amendmentReason}
                        onChange={(e) => setAmendmentReason(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none italic"
                        required
                    />
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[50%] leading-relaxed">
                        Data will be committed to the <span className="text-emerald-500 underline underline-offset-4 decoration-2">Clinical Longitudinal Record</span> as a standard finding.
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || rows.length === 0 || !rows[0].key}
                        className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all shadow-slate-900/20 active:scale-95"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Authorizing...</span>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-5 h-5" />
                                Save & Transmit
                            </>
                        )}
                    </button>
                </div>
            </form>
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </div>
    );
};

export default ResultEntryForm;
