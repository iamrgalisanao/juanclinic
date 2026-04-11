import React, { useState } from 'react';
import { getBIRSalesJournal } from '../../services/api';

const FinancialCompliance = ({ activeBranchId }) => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getBIRSalesJournal({
                branch_id: activeBranchId,
                start_date: startDate,
                end_date: endDate
            });
            setReportData(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate report.");
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!reportData) return;

        const headers = [
            'Date', 'Invoice #', 'Customer Name', 'Customer TIN', 'Description', 
            'VATable Sales', 'VAT (12%)', 'VAT-Exempt Sales', 'Zero-Rated Sales', 
            'Non-VAT Sales', 'Discount', 'Net Amount', 'Status'
        ];

        const rows = reportData.journal.map(row => [
            row.date,
            row.invoice_number,
            row.patient_name,
            row.patient_tin,
            row.description,
            row.vatable_sales,
            row.vat_amount,
            row.vat_exempt_sales,
            row.zero_rated_sales,
            row.non_vat_sales,
            row.discount_amount,
            row.net_amount,
            row.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Sales_Journal_${startDate}_to_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Control Panel */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-end">
                    <div className="flex-1 space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Start Date</label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex-1 space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">End Date</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button 
                            onClick={generateReport}
                            disabled={loading}
                            className="flex-1 md:flex-none px-10 py-4 bg-his-slate-900 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-his-green-500 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Generate Journal'}
                        </button>
                        {reportData && (
                            <button 
                                onClick={exportToCSV}
                                className="flex-1 md:flex-none px-10 py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black rounded-2xl hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest"
                            >
                                Export CSV
                            </button>
                        )}
                    </div>
                </div>
                
                {error && (
                    <div className="mt-8 p-4 bg-rose-50 text-rose-500 text-[11px] font-bold rounded-xl border-l-4 border-rose-500 uppercase tracking-widest">
                        {error}
                    </div>
                )}
            </div>

            {reportData && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                    {/* Header Info */}
                    <div className="bg-his-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <p className="text-[10px] font-black text-his-green-500 uppercase tracking-[0.3em] mb-4">Official Sales Register</p>
                                <h2 className="text-3xl font-black tracking-tight">{reportData.meta.registered_name}</h2>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">TIN: {reportData.meta.tin || 'NOT SET'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-8 pt-4 border-t border-white/5 md:border-t-0 md:pt-0">
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total VATable</p>
                                    <p className="text-xl font-black text-white">₱{reportData.summary.total_vatable.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total VAT (12%)</p>
                                    <p className="text-xl font-black text-indigo-400">₱{reportData.summary.total_vat.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">VAT-Exempt Sales</p>
                                    <p className="text-xl font-black text-emerald-400">₱{reportData.summary.total_exempt.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Net</p>
                                    <p className="text-xl font-black text-his-green-500">₱{reportData.summary.total_net.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Journal View */}
                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[1200px]">
                                <thead className="bg-slate-50/50">
                                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <th className="px-8 py-6">Date</th>
                                        <th className="px-6 py-6 font-indigo-500">Ref #</th>
                                        <th className="px-6 py-6">Customer / TIN</th>
                                        <th className="px-6 py-6 text-right">VATable Sales</th>
                                        <th className="px-6 py-6 text-right">VAT (12%)</th>
                                        <th className="px-6 py-6 text-right">VAT-Exempt</th>
                                        <th className="px-6 py-6 text-right">Total Net</th>
                                        <th className="px-8 py-6 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.journal.map((row, i) => (
                                        <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5 text-[11px] font-bold text-slate-500">{row.date}</td>
                                            <td className="px-6 py-5 text-[11px] font-black text-indigo-500">{row.invoice_number}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-slate-900">{row.patient_name}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">TIN: {row.patient_tin}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right text-[11px] font-bold text-slate-900">₱{row.vatable_sales.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right text-[11px] font-black text-indigo-500">₱{row.vat_amount.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right text-[11px] font-bold text-emerald-500">₱{row.vat_exempt_sales.toLocaleString()}</td>
                                            <td className="px-6 py-5 text-right text-[11px] font-black text-slate-900">₱{row.net_amount.toLocaleString()}</td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${row.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* BIR Compliance Footnote */}
                    <div className="flex justify-between items-center p-8 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 italic font-black text-xs">BIR</div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                This journal is generated in compliance with RR No. 9-2009 for CAS and RMO No. 29-2002 for Books of Accounts.<br />
                                All calculations are verified against sequential invoice numbering.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">End of Report</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialCompliance;
