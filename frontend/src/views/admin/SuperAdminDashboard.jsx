import React, { useState, useEffect } from 'react';
import { getSATenants, updateSAPlan, impersonateTenant } from '../../services/api';
import { useDialog } from '../../context/DialogContext';

const SuperAdminDashboard = () => {
    const { alert } = useDialog();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [stagedTenant, setStagedTenant] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [pendingImpersonation, setPendingImpersonation] = useState(null);
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);
        setError(null);
        try {
            const data = await getSATenants();
            setTenants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Master data fetch failed", err);
            setError("Failed to synchronize with Platform Node. Access to orchestration ledger is currently restricted.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleUpdatePlan = async () => {
        if (!stagedTenant) return;
        setIsUpdating(true);
        try {
            await updateSAPlan(stagedTenant.id, stagedTenant);
            await fetchData();
            setSelectedTenant(null);
            setStagedTenant(null);
        } catch (err) {
            await alert({
                title: "Orchestration failed",
                message: err.message
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleImpersonate = (tenant) => {
        // Use React modal — native window.confirm() is suppressed by PWA service worker updates
        setPendingImpersonation(tenant);
    };

    const confirmImpersonate = async () => {
        if (!pendingImpersonation) return;
        setIsImpersonating(true);
        try {
            const data = await impersonateTenant(pendingImpersonation.id);
            localStorage.setItem('impersonation_token', data.token);
            localStorage.setItem('impersonation_origin_token', localStorage.getItem('auth_token'));
            localStorage.setItem('impersonation_origin_user', localStorage.getItem('auth_user'));
            localStorage.setItem('impersonated_tenant', JSON.stringify(data.tenant));
            localStorage.setItem('auth_token', data.token);
            window.location.hash = '#dashboard';
            window.location.reload();
        } catch (err) {
            await alert({
                title: "Context switch failed",
                message: err.response?.data?.message || err.message
            });
            setIsImpersonating(false);
            setPendingImpersonation(null);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Master Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Platform Command Center</h1>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-his-green-500 animate-pulse block" />
                        Global Governance Active • Node: Hostinger KVM 2
                    </p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => fetchData(true)}
                        disabled={refreshing || loading}
                        className={`bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3 transition-all hover:bg-his-slate-50 ${refreshing ? 'animate-pulse' : ''}`}
                    >
                        <svg className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{refreshing ? 'Syncing...' : 'Refresh Status'}</span>
                    </button>

                    <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase">Live Environments</p>
                            <p className="text-xl font-black text-slate-900">{tenants?.length ?? 0}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100" />
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase">System Uptime</p>
                            <p className="text-xl font-black text-emerald-500 tracking-tight">99.9%</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border-2 border-rose-100 p-8 rounded-[2rem] flex items-center gap-6 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-rose-200 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm font-black text-rose-900">Synchronization Error</p>
                        <p className="text-xs font-bold text-rose-600 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Tenant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tenants.map(tenant => (
                    <div key={tenant.id} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sleek transition-all hover:shadow-2xl group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 ${tenant.plan_tier === 'GOLD' ? 'bg-amber-500' : 'bg-his-green-500'}`} />
                        
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${tenant.plan_tier === 'GOLD' ? 'bg-amber-50 text-amber-600 border-amber-100' : tenant.plan_tier === 'SUSPENDED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                    {tenant.plan_tier} Plan
                                </span>
                                <h3 className="text-2xl font-black text-slate-900 mt-3">{tenant.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{tenant.slug}.juanclinic.pro</p>
                            </div>
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleImpersonate(tenant);
                                }}
                                title="Impersonate tenant environment"
                                className="w-12 h-12 rounded-2xl bg-his-slate-50 text-slate-400 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-sm border border-slate-100 group-hover:rotate-[-5deg] cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Feature Tags */}
                        <div className="flex flex-wrap gap-2 mb-10 min-h-[48px]">
                            {tenant.pediatrics_enabled && <span className="px-2 py-0.5 rounded-lg bg-his-green-50 text-his-green-600 text-[8px] font-black uppercase tracking-widest border border-his-green-100/30">Pediatrics</span>}
                            {tenant.laboratory_enabled && <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100/30">Lab</span>}
                            {tenant.radiology_enabled && <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-widest border border-rose-100/30">Rad</span>}
                            {tenant.pacs_enabled && <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-600 text-[8px] font-black uppercase tracking-widest border border-purple-100/30">PACS</span>}
                            {tenant.billing_enabled && <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100/30">Billing</span>}
                            {tenant.inventory_enabled && <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 text-[8px] font-black uppercase tracking-widest border border-slate-200">Inv</span>}
                            {tenant.pharmacy_enabled && <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-100/30">Rx</span>}
                            {tenant.portal_enabled && <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest">Portal</span>}
                            {tenant.telehealth_enabled && <span className="px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-600 text-[8px] font-black uppercase tracking-widest border border-cyan-100/30">Tele</span>}
                            {tenant.sms_enabled && <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-100/30">SMS</span>}
                            {tenant.email_enabled && <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-500 text-[8px] font-black uppercase tracking-widest border border-slate-200">Email</span>}
                            {tenant.empi_enabled && <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest border border-orange-100/30">EMPI</span>}
                            {tenant.offline_sync_enabled && <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest border border-slate-200">Sync</span>}
                            {tenant.referrals_enabled && <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest border border-emerald-100/30">Ref</span>}
                            {tenant.claims_enabled && <span className="px-2 py-0.5 rounded-lg bg-his-green-50 text-his-green-700 text-[8px] font-black uppercase tracking-widest border border-his-green-100/30">Claims</span>}
                        </div>

                        <div className="flex gap-4 pt-8 border-t border-slate-50">
                            <div className="flex-1">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Active Branches</p>
                                <p className="text-sm font-black text-slate-900">{tenant.branches_count}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedTenant(tenant);
                                    setStagedTenant({ ...tenant });
                                }}
                                className="px-6 py-2.5 bg-his-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg"
                            >
                                Manage Orchestration
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orchestration Modal */}
            {selectedTenant && (
                <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Commercial Orchestration</h2>
                                <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Target: {selectedTenant.name}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedTenant(null);
                                    setStagedTenant(null);
                                }}
                                className="w-12 h-12 rounded-2xl bg-his-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center shrink-0"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-8 overflow-y-auto pr-4 flex-1">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subscription Tier</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {['TRIAL', 'BRONZE', 'SILVER', 'GOLD', 'SUSPENDED'].map(tier => (
                                        <button 
                                            key={tier}
                                            onClick={() => setStagedTenant({ ...stagedTenant, plan_tier: tier })}
                                            className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${stagedTenant.plan_tier === tier ? 'bg-his-slate-900 border-his-slate-900 text-white shadow-xl rotate-[-2deg]' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            {tier}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`space-y-4 pt-4 border-t border-slate-50 transition-opacity ${stagedTenant.plan_tier === 'TRIAL' ? 'opacity-100' : 'opacity-50'}`}>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Purge Grace Period (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={stagedTenant.purge_after_days || stagedTenant.admin_settings?.purge_after_days || ''}
                                    onChange={(e) => setStagedTenant({ ...stagedTenant, purge_after_days: parseInt(e.target.value, 10) || null })}
                                    disabled={stagedTenant.plan_tier !== 'TRIAL'}
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none text-sm font-bold text-slate-900 focus:ring-2 focus:ring-his-slate-900 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    placeholder="Fallback to default (90 days)"
                                />
                            </div>

                            <div className="space-y-6 pt-6 border-t border-slate-50">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enterprise Feature Matrix</label>
                                
                                {[
                                    {
                                        title: "Clinical Specialties",
                                        features: [
                                            { key: 'pediatrics_enabled', label: 'Pediatric Suite', color: 'bg-his-green-500' },
                                            { key: 'laboratory_enabled', label: 'Laboratory System', color: 'bg-emerald-500' },
                                            { key: 'radiology_enabled', label: 'Radiology Suite', color: 'bg-rose-500' },
                                            { key: 'pacs_enabled', label: 'DICOM / PACS', color: 'bg-purple-500' },
                                        ]
                                    },
                                    {
                                        title: "Operations & Finance",
                                        features: [
                                            { key: 'billing_enabled', label: 'Billing & Payments', color: 'bg-blue-600' },
                                            { key: 'inventory_enabled', label: 'Inventory Logic', color: 'bg-slate-700' },
                                            { key: 'pharmacy_enabled', label: 'Pharmacy Engine', color: 'bg-blue-400' },
                                            { key: 'workforce_enabled', label: 'Staff Scheduling', color: 'bg-amber-500' },
                                            { key: 'queue_enabled', label: 'Queue Management', color: 'bg-indigo-500' },
                                        ]
                                    },
                                    {
                                        title: "Patient Engagement",
                                        features: [
                                            { key: 'portal_enabled', label: 'Patient Portal', color: 'bg-his-slate-900' },
                                            { key: 'telehealth_enabled', label: 'Telehealth/Messaging', color: 'bg-cyan-500' },
                                            { key: 'sms_enabled', label: 'SMS Notification', color: 'bg-his-green-500' },
                                            { key: 'email_enabled', label: 'Email Notification', color: 'bg-his-slate-700' }
                                        ]
                                    },
                                    {
                                        title: "Enterprise Connectivity",
                                        features: [
                                            { key: 'empi_enabled', label: 'EMPI Device Sync', color: 'bg-orange-500' },
                                            { key: 'offline_sync_enabled', label: 'Offline Sync', color: 'bg-slate-500' },
                                            { key: 'referrals_enabled', label: 'Referral Network', color: 'bg-emerald-600' },
                                            { key: 'claims_enabled', label: 'PhilHealth / eClaims', color: 'bg-his-green-600' },
                                            { key: 'analytics_enabled', label: 'Advanced Analytics', color: 'bg-violet-600' },
                                        ]
                                    }
                                ].map(category => (
                                    <div key={category.title} className="space-y-3">
                                        <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">{category.title}</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {category.features.map(feature => (
                                                <div key={feature.key} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic">{feature.label}</span>
                                                    <button 
                                                        onClick={() => setStagedTenant({ ...stagedTenant, [feature.key]: !stagedTenant[feature.key] })}
                                                        className={`w-10 h-5 rounded-full relative transition-all duration-500 ${stagedTenant[feature.key] ? feature.color : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-500 ${stagedTenant[feature.key] ? 'right-0.5' : 'left-0.5'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-slate-100 mt-6 shrink-0">
                                <button 
                                    onClick={() => {
                                        setSelectedTenant(null);
                                        setStagedTenant(null);
                                    }}
                                    className="flex-1 py-4 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdatePlan}
                                    disabled={isUpdating}
                                    className="flex-1 py-4 bg-his-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-his-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
                                >
                                    {isUpdating ? 'Saving Changes...' : 'Save Orchestration'}
                                </button>
                            </div>
                    </div>
                </div>
            )}

            {/* Impersonation Confirmation Modal — replaces window.confirm() */}
            {pendingImpersonation && (
                <div className="fixed inset-0 z-[70] bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-6">
                    <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl border-2 border-amber-200 relative overflow-hidden">
                        {/* Amber Warning Glow */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400 opacity-5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="flex items-start gap-6 mb-8">
                            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Critical Governance Action</p>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Enter Tenant Environment</h2>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-3xl p-6 mb-8 border border-amber-100">
                            <p className="text-sm font-bold text-slate-700 leading-relaxed">
                                You are about to impersonate a <strong>live tenant environment</strong>. All actions performed will be logged to the Global Audit Ledger with <strong>your identity</strong>.
                            </p>
                            <div className="mt-4 pt-4 border-t border-amber-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Tenant</p>
                                <p className="text-lg font-black text-slate-900 mt-1">{pendingImpersonation.name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{pendingImpersonation.slug}.juanclinic.pro</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setPendingImpersonation(null)}
                                disabled={isImpersonating}
                                className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmImpersonate}
                                disabled={isImpersonating}
                                className="flex-1 py-4 rounded-2xl bg-amber-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isImpersonating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Initiating...
                                    </>
                                ) : (
                                    'Confirm & Enter'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;

