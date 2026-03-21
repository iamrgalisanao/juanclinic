import React, { useState, useEffect } from 'react';
import { getReferrals, acceptReferral, revokeReferral } from '../services/api';

const Referrals = ({ activeTenant, activeBranch }) => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('INCOMING'); // INCOMING or OUTGOING

    const fetchReferrals = async () => {
        try {
            setLoading(true);
            const data = await getReferrals();
            setReferrals(data);
        } catch (err) {
            console.error("Failed to fetch referrals:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTenant) {
            fetchReferrals();
        }
    }, [activeTenant]);

    const handleAccept = async (id) => {
        try {
            await acceptReferral(id);
            fetchReferrals();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to accept referral");
        }
    };

    const handleRevoke = async (id) => {
        if (window.confirm("Are you sure you want to revoke this referral?")) {
            try {
                await revokeReferral(id);
                fetchReferrals();
            } catch (err) {
                alert("Failed to revoke referral");
            }
        }
    };

    const incoming = referrals.filter(r => r.target_tenant_id === activeTenant?.id);
    const outgoing = referrals.filter(r => r.source_tenant_id === activeTenant?.id);

    const displayList = activeTab === 'INCOMING' ? incoming : outgoing;

    return (
        <div className="p-10 space-y-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Referral Network</h2>
                    <p className="text-sm font-bold text-slate-400 mt-2">Manage cross-clinic patient transfers securely.</p>
                </div>
            </div>

            <div className="flex gap-4 border-b border-slate-200 pb-px">
                <button
                    onClick={() => setActiveTab('INCOMING')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'INCOMING' ? 'text-his-green-500 border-b-2 border-his-green-500' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Incoming ({incoming.length})
                </button>
                <button
                    onClick={() => setActiveTab('OUTGOING')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'OUTGOING' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Outgoing ({outgoing.length})
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sleek border border-his-slate-100">
                {loading ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-his-green-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Bridging Network...</span>
                    </div>
                ) : displayList.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 text-xs font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-3xl">
                        No {activeTab.toLowerCase()} referrals found
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayList.map(ref => (
                            <div key={ref.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group hover:bg-white hover:shadow-xl transition-all duration-300">

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${ref.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                ref.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                    'bg-rose-100 text-rose-700 border-rose-200'
                                            }`}>
                                            {ref.status}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">
                                            {new Date(ref.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">
                                            {ref.patient?.first_name} {ref.patient?.last_name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-slate-500">
                                                {activeTab === 'INCOMING' ? 'From:' : 'To:'}
                                            </span>
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded-md">
                                                {activeTab === 'INCOMING' ? ref.source_tenant?.name : ref.target_tenant?.name}
                                            </span>
                                            <span className="text-xs text-slate-400 ml-2">by Dr. {ref.referred_by?.name}</span>
                                        </div>
                                    </div>

                                    {ref.clinical_notes && (
                                        <div className="p-4 bg-white rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                                            "{ref.clinical_notes}"
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-max border border-emerald-100">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        DPA Consent: {ref.consent_proof}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    {activeTab === 'INCOMING' && ref.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleAccept(ref.id)}
                                            className="px-6 py-3 bg-his-green-500 text-white text-xs font-black rounded-xl hover:bg-his-green-600 transition-colors uppercase tracking-widest shadow-lg shadow-his-green-500/20"
                                        >
                                            Accept & Import
                                        </button>
                                    )}
                                    {activeTab === 'OUTGOING' && ref.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleRevoke(ref.id)}
                                            className="px-6 py-3 bg-white text-rose-500 text-xs font-black rounded-xl hover:bg-rose-50 border border-rose-100 transition-colors uppercase tracking-widest"
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Referrals;
