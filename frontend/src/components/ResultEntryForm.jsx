import React, { useState } from 'react';
import { PlusIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ResultEntryForm = ({ order, onSubmit, onCancel }) => {
    // Start with one empty row
    const [rows, setRows] = useState([{ id: Date.now(), key: '', value: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddRow = () => {
        setRows([...rows, { id: Date.now(), key: '', value: '' }]);
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
        // Ignore rows where the key is empty
        const resultData = rows.reduce((acc, row) => {
            if (row.key.trim() !== '') {
                acc[row.key.trim()] = row.value.trim();
            }
            return acc;
        }, {});

        try {
            await onSubmit(order.id, resultData);
        } catch (error) {
            console.error("Failed to submit results", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800 text-sm">Enter Clinical Results</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Defining structured JSON data for {order.order_type} Order #{order.id}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-3">
                    {/* Headers */}
                    <div className="flex gap-4 px-2">
                        <div className="w-1/3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parameter Name</div>
                        <div className="w-2/3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Result Value</div>
                    </div>

                    {/* Dynamic Rows */}
                    {rows.map((row, index) => (
                        <div key={row.id} className="flex gap-4 items-start group">
                            <div className="w-1/3">
                                <input
                                    type="text"
                                    placeholder="e.g., Hemoglobin"
                                    value={row.key}
                                    onChange={(e) => handleRowChange(row.id, 'key', e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="w-2/3 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g., 14.2 g/dL"
                                    value={row.value}
                                    onChange={(e) => handleRowChange(row.id, 'value', e.target.value)}
                                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                />
                                {rows.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRow(row.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Remove row"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex gap-4">
                    <button
                        type="button"
                        onClick={handleAddRow}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Parameter
                    </button>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        Results will be submitted as <span className="font-mono text-emerald-600">PRELIMINARY</span> pending standard verification.
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || rows.length === 0 || !rows[0].key}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-sm transition-all shadow-slate-900/10"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Saving Data...</span>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-5 h-5" />
                                Submit to Verifier
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResultEntryForm;
