import React, { useState, useEffect } from 'react';
import { getInvoices, processPayment } from '../services/api';

const CashierDashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await getInvoices();
            // Filter for non-paid invoices for the dashboard
            setInvoices(data.filter(inv => inv.status !== 'PAID'));
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!selectedInvoice || !paymentAmount) return;

        try {
            await processPayment({
                invoice_id: selectedInvoice.id,
                amount: parseFloat(paymentAmount),
                payment_method: paymentMethod,
            });
            setSelectedInvoice(null);
            setPaymentAmount('');
            fetchInvoices();
        } catch (err) {
            console.error('Payment processing failed:', err);
            alert('Failed to process payment. Please verify the amount.');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-his-slate-900 tracking-tight">Accounts Receivable</h2>
                        <p className="text-slate-500 text-sm font-medium">Manage pending invoices and collections</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.15em] border-b border-slate-100">
                                <th className="pb-4">Invoice #</th>
                                <th className="pb-4">Patient</th>
                                <th className="pb-4">Total</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 text-xs font-semibold animate-pulse uppercase tracking-[0.2em]">Retrieving billing records...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan="5" className="py-20 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">No outstanding balances found</td></tr>
                            ) : invoices.map(inv => (
                                <tr key={inv.id} className={`hover:bg-his-green-50/30 transition-all group ${selectedInvoice?.id === inv.id ? 'bg-his-green-50/50' : ''}`}>
                                    <td className="py-6 text-slate-400 text-[11px] font-mono font-bold tracking-tighter">
                                        {inv.invoice_number}
                                    </td>
                                    <td className="py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-900 leading-none mb-1">
                                                {inv.patient ? `${inv.patient.first_name} ${inv.patient.last_name}` : 'Unknown'}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                PAT-{inv.patient_id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className="font-black text-sm text-his-slate-900">
                                            ₱{parseFloat(inv.total_amount).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-6">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                            inv.status === 'UNPAID' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-6 text-right">
                                        <button 
                                            onClick={() => setSelectedInvoice(inv)}
                                            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-his-green-500 hover:bg-his-green-100 transition-all duration-300"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col min-h-[400px]">
                    <h3 className="text-xl font-black text-his-slate-900 tracking-tight mb-2">Process Settlement</h3>
                    {selectedInvoice ? (
                        <form onSubmit={handlePayment} className="flex-1 flex flex-col">
                            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Selected Account</div>
                                <div className="font-bold text-slate-900">{selectedInvoice.patient ? `${selectedInvoice.patient.first_name} ${selectedInvoice.patient.last_name}` : '#'+selectedInvoice.id}</div>
                                <div className="text-xl font-black text-his-green-600 mt-2">
                                    ₱{parseFloat(selectedInvoice.total_amount).toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Payment Amount</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Method</label>
                                    <select 
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 transition-all"
                                    >
                                        <option value="CASH">CASH</option>
                                        <option value="CARD">CREDIT/DEBIT</option>
                                        <option value="GCASH">GCASH</option>
                                        <option value="INSURANCE">HMO / INSURANCE</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-4 bg-his-green-500 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-his-green-600 hover:shadow-xl hover:shadow-his-green-500/20 transform hover:-translate-y-1 active:scale-95 transition-all duration-300 mt-auto"
                            >
                                Confirm Transaction
                            </button>
                            <button 
                                type="button"
                                onClick={() => setSelectedInvoice(null)}
                                className="w-full mt-3 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                            >
                                Cancel Selection
                            </button>
                        </form>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Select an invoice from the left to start processing a payment</p>
                        </div>
                    )}
                </div>

                <div className="bg-his-slate-900 rounded-3xl p-8 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-his-green-500 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest">Collections Info</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Goal</span>
                            <span className="font-black text-his-green-400">84%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">Payments are context-isolated per physical branch.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;
