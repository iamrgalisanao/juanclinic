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

    if (loading && !refreshing) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="h-32 bg-slate-100 dark:bg-white/5 rounded-[3rem]" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-80 bg-slate-50 dark:bg-white/5 rounded-[3rem]" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 lg:pb-20">
            {/* WDS Nerve Center - Sticky System Awareness */}
            <div className="sticky top-0 z-40 -mx-4 px-4 py-3 mb-8 lg:mb-10">
                <div className="glass-hub rounded-3xl lg:rounded-[2.5rem] p-4 lg:p-6 shadow-2xl border-white/20 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 lg:gap-6">
                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-his-green-400 blur-lg opacity-20 animate-pulse" />
                            <div className="relative w-12 h-12 lg:w-16 lg:h-16 bg-his-slate-900 rounded-xl lg:rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                <span className="material-symbols-outlined text-his-green-400 text-2xl lg:text-3xl">settings_input_component</span>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg lg:text-2xl font-black text-his-slate-900 dark:text-on-surface tracking-tighter leading-tight italic truncate">
                                JuanClinic <span className="text-his-green-400 not-italic">Governance</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-his-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-his-green-400"></span>
                                </span>
                                <p className="text-[9px] lg:text-[10px] font-black text-his-slate-500 uppercase tracking-widest truncate">
                                    Command Center • Secure Node
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-8 px-4 lg:px-8 py-3 lg:py-4 bg-his-slate-900/5 dark:bg-white/5 rounded-2xl lg:rounded-3xl border border-his-slate-900/5 dark:border-white/5">
                        <div className="text-center min-w-[60px] lg:min-w-[80px]">
                            <p className="text-[8px] lg:text-[10px] font-black text-his-slate-400 uppercase tracking-widest mb-0.5">Envs</p>
                            <p className="text-xl lg:text-3xl font-black text-his-slate-900 dark:text-on-surface tracking-tighter leading-none">{tenants?.length ?? 0}</p>
                        </div>
                        <div className="w-px h-8 lg:h-10 bg-his-slate-200 dark:bg-white/10 shrink-0" />
                        <div className="text-center min-w-[60px] lg:min-w-[80px]">
                            <p className="text-[8px] lg:text-[10px] font-black text-his-green-400/60 uppercase tracking-widest mb-0.5">Uptime</p>
                            <p className="text-xl lg:text-3xl font-black text-his-slate-900 dark:text-on-surface tracking-tighter leading-none">99.9<span className="text-xs lg:text-sm text-his-green-400">%</span></p>
                        </div>
                        <div className="w-px h-8 lg:h-10 bg-his-slate-200 dark:bg-white/10 shrink-0" />
                        <button 
                            onClick={() => fetchData(true)}
                            disabled={refreshing}
                            className={`flex flex-col items-center group transition-all shrink-0 ${refreshing ? 'opacity-50' : 'hover:scale-110 active:scale-95'}`}
                        >
                            <span className={`material-symbols-outlined text-xl lg:text-2xl transition-transform duration-700 ${refreshing ? 'animate-spin text-his-green-400' : 'text-his-slate-400 group-hover:text-his-green-400'}`}>sync</span>
                            <span className="text-[7px] lg:text-[8px] font-black text-his-slate-500 uppercase tracking-tighter mt-0.5">{refreshing ? 'Syncing' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-6 rounded-[2rem] flex items-center gap-5 animate-in slide-in-from-top-4 duration-500 shadow-lg shadow-rose-500/5">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-rose-500 text-xl">error</span>
                    </div>
                    <div>
                        <p className="text-xs font-black text-rose-900 dark:text-rose-400 uppercase tracking-widest">Connectivity Alert</p>
                        <p className="text-[11px] font-bold text-rose-600/80 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* WDS Orchestration Pod Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {tenants.map((tenant, idx) => (
                    <div 
                        key={tenant.id} 
                        className="group relative bg-white dark:bg-surface-container rounded-[2.5rem] border border-his-slate-100 dark:border-white/5 shadow-sleek transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        {/* Vitality Gradient Accent */}
                        <div className={`absolute top-0 inset-x-0 h-1 transition-all duration-500 ${
                            tenant.plan_tier === 'GOLD' ? 'bg-gradient-to-r from-amber-400 via-tertiary to-amber-600 opacity-80' : 
                            tenant.plan_tier === 'SUSPENDED' ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 opacity-80' : 
                            'bg-gradient-to-r from-his-green-400 via-his-green-500 to-his-green-600 opacity-80'
                        }`} />

                        <div className="p-6 lg:p-8 pb-4">
                            <div className="flex justify-between items-start mb-6 gap-3 lg:gap-4">
                                <div className="space-y-2 lg:space-y-3 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] shadow-sm border whitespace-nowrap ${
                                            tenant.plan_tier === 'GOLD' ? 'bg-amber-50 text-tertiary border-amber-100' : 
                                            tenant.plan_tier === 'SUSPENDED' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                            'bg-his-green-50 text-his-green-600 border-his-green-100'
                                        }`}>
                                            {tenant.plan_tier}
                                        </span>
                                        {tenant.is_enterprise && (
                                            <span className="px-2 py-1 rounded-lg bg-his-slate-900 dark:bg-white/10 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                                <div className="w-1.5 h-1.5 bg-his-green-400 rounded-full animate-pulse" />
                                                ENT
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl lg:text-2xl font-black text-his-slate-900 dark:text-on-surface tracking-tight leading-none group-hover:text-his-green-400 transition-colors truncate">
                                        {tenant.name}
                                    </h3>
                                    <p className="text-[10px] lg:text-xs font-black text-his-slate-400 uppercase tracking-widest font-mono truncate opacity-80">
                                        {tenant.slug}.juanclinic.pro
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleImpersonate(tenant);
                                    }}
                                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-his-slate-50 dark:bg-white/5 text-his-slate-500 flex items-center justify-center hover:bg-his-slate-900 hover:text-white transition-all shadow-sm border border-his-slate-100 dark:border-white/10 group-hover:rotate-[-8deg] shrink-0"
                                    title="Security Bypass Impersonation"
                                >
                                    <span className="material-symbols-outlined text-xl lg:text-2xl">vpn_key</span>
                                </button>
                            </div>

                            {/* Feature Ecosystem Pod */}
                            <div className="bg-his-slate-50/50 dark:bg-white/5 rounded-3xl p-5 mb-6 border border-his-slate-100 dark:border-white/5">
                                <p className="text-[10px] font-black text-his-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-his-green-400 rounded-full"></span>
                                    Module Topology
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { key: 'pediatrics_enabled', label: 'PED', color: 'text-his-green-600 bg-his-green-600/10' },
                                        { key: 'laboratory_enabled', label: 'LAB', color: 'text-his-green-500 bg-his-green-500/10' },
                                        { key: 'radiology_enabled', label: 'RAD', color: 'text-rose-500 bg-rose-500/10' },
                                        { key: 'pharmacy_enabled', label: 'RX', color: 'text-blue-500 bg-blue-500/10' },
                                        { key: 'billing_enabled', label: 'PAY', color: 'text-indigo-500 bg-indigo-500/10' },
                                        { key: 'telehealth_enabled', label: 'TELE', color: 'text-cyan-500 bg-cyan-500/10' },
                                        { key: 'portal_enabled', label: 'PORT', color: 'text-his-slate-900 bg-his-slate-900/10 dark:text-white dark:bg-white/10' }
                                    ].map(feat => tenant[feat.key] && (
                                        <span key={feat.key} className={`px-2.5 py-1 rounded-md ${feat.color} text-[8px] font-black tracking-widest border border-current/10 whitespace-nowrap`}>
                                            {feat.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Pod Context Zone */}
                        <div className="px-6 lg:px-8 py-5 lg:py-6 bg-his-slate-50/30 dark:bg-white/2 mt-auto border-t border-his-slate-50 dark:border-white/5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white dark:bg-white/5 rounded-xl border border-his-slate-100 dark:border-white/10 flex items-center justify-center text-his-slate-500 shrink-0">
                                    <span className="material-symbols-outlined text-lg lg:text-xl">corporate_fare</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[7px] lg:text-[8px] font-black text-his-slate-400 uppercase tracking-[0.2em] mb-0.5 truncate">Active Nodes</p>
                                    <p className="text-lg lg:text-xl font-black text-his-slate-900 dark:text-on-surface leading-none italic truncate">{tenant.branches_count}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    setSelectedTenant(tenant);
                                    setStagedTenant({ ...tenant });
                                }}
                                className="h-10 lg:h-11 px-6 lg:px-8 bg-his-slate-900 dark:bg-his-green-400 text-white dark:text-on-primary text-[9px] lg:text-[10px] font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] rounded-xl hover:bg-his-green-500 hover:scale-105 transition-all shadow-lg shadow-his-slate-900/10 dark:shadow-his-green-400/20 active:scale-95 shrink-0"
                            >
                                Orchestrate
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedTenant && (
                <div className="fixed inset-0 z-[100] bg-his-slate-950/60 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-500 overflow-hidden overscroll-behavior-contain">
                    <div className="glass-hub rounded-[2.5rem] lg:rounded-[3.5rem] max-w-5xl w-full shadow-2xl relative flex flex-col h-[92vh] max-h-[92vh] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500 transform-gpu">
                        {/* Vitality Background Accents */}
                        <div className="absolute -top-32 -right-32 w-96 h-96 bg-his-green-400/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-tertiary/5 rounded-full blur-[100px] pointer-events-none" />
                        
                        {/* WDS Orchestration Header */}
                        <header className="p-6 lg:p-10 lg:pb-8 relative z-30 shrink-0 border-b border-his-slate-100 dark:border-white/5 bg-white/80 dark:bg-his-slate-900/80 backdrop-blur-md">
                            <div className="relative">
                                {/* Close Button - Absolute Positioning for Collision Prevention */}
                                <button 
                                    onClick={() => {
                                        setSelectedTenant(null);
                                        setStagedTenant(null);
                                    }}
                                    className="absolute -top-1 -right-1 lg:top-0 lg:right-0 w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-his-slate-100 dark:bg-white/5 text-his-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center shrink-0 border border-his-slate-200/50 dark:border-white/10 group z-50"
                                >
                                    <span className="material-symbols-outlined text-xl lg:text-2xl transition-transform duration-300 group-hover:rotate-90">close</span>
                                </button>

                                <div className="space-y-4 pr-12 lg:pr-16">
                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-his-green-400/10 border border-his-green-400/20 max-w-full">
                                        <span className="w-1.5 h-1.5 bg-his-green-400 rounded-full status-pulse-badge shrink-0"></span>
                                        <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-his-green-400 truncate">Governance Orchestration</span>
                                    </div>
                                    <h2 className="text-2xl lg:text-4xl font-black text-his-slate-900 dark:text-on-surface tracking-tighter leading-none italic break-words lg:truncate">
                                        Governance <span className="text-his-green-400 not-italic">Control</span>
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-his-slate-400 font-bold tracking-widest text-[9px] uppercase shrink-0">Target:</span>
                                            <span className="px-2 py-0.5 bg-his-slate-900 dark:bg-white/10 rounded-md text-his-slate-900 dark:text-on-surface font-mono text-[10px] lg:text-xs font-black italic truncate">
                                                {selectedTenant.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-his-slate-400 font-bold tracking-widest text-[9px] uppercase shrink-0">Node:</span>
                                            <span className="font-mono text-[10px] lg:text-xs text-his-green-400 font-black truncate">#ID-{String(selectedTenant.id).slice(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Scrollable Content Zone */}
                        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative z-10 touch-pan-y overscroll-contain">
                            <div className="p-6 lg:p-10 space-y-12 pb-16">
                                {/* Orchestration Lifecycle Pod */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-[10px] font-black tracking-[0.3em] text-his-slate-400 uppercase whitespace-nowrap">Subscription Lifecycle</h3>
                                        <div className="flex-1 h-px bg-his-slate-100 dark:bg-white/5" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        {[
                                            { id: 'GOLD', label: 'GOLD Tier', icon: 'workspace_premium', color: 'text-tertiary', accent: 'plan-card-gold', desc: 'Enterprise SLA & Multi-region sync.' },
                                            { id: 'TRIAL', label: 'TRIAL Mode', icon: 'hourglass_top', color: 'text-amber-500', accent: 'plan-card-amber', desc: '30-day sandbox evaluation window.' },
                                            { id: 'SUSPENDED', label: 'SUSPENDED', icon: 'dangerous', color: 'text-rose-500', accent: 'plan-card-rose', desc: 'Restricted vault-only data access.' }
                                        ].map(plan => (
                                            <label key={plan.id} className="relative group cursor-pointer h-full">
                                                <input 
                                                    type="radio" 
                                                    name="plan" 
                                                    value={plan.id}
                                                    checked={stagedTenant.plan_tier === plan.id}
                                                    onChange={() => setStagedTenant({ ...stagedTenant, plan_tier: plan.id })}
                                                    className="sr-only peer" 
                                                />
                                                <div className={`glass-hub p-6 rounded-[2rem] transition-all border-white/5 h-full relative overflow-hidden flex flex-col ${plan.accent} ${stagedTenant.plan_tier === plan.id ? 'border-his-green-400 bg-his-green-400/5 ring-1 ring-his-green-400/20 scale-[1.02]' : 'opacity-60 hover:opacity-100 hover:bg-white dark:hover:bg-white/5'}`}>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className={`material-symbols-outlined text-3xl ${plan.color}`}>{plan.icon}</span>
                                                        <div className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${stagedTenant.plan_tier === plan.id ? 'bg-his-green-400 border-his-green-400 shadow-lg shadow-his-green-400/40' : 'border-his-slate-300'}`}></div>
                                                    </div>
                                                    <h4 className={`text-base lg:text-lg font-black italic ${plan.color} mb-1 tracking-tight truncate`}>{plan.label}</h4>
                                                    <p className="text-his-slate-500 dark:text-his-slate-400 text-xs font-bold leading-tight flex-1">{plan.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    {/* Trial Governance (Conditional) */}
                                    <div className={`p-6 rounded-[2rem] bg-his-slate-50 dark:bg-white/5 border border-his-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 ${stagedTenant.plan_tier === 'TRIAL' ? 'opacity-100 translate-y-0' : 'opacity-30 blur-[1px] pointer-events-none translate-y-2'}`}>
                                        <div className="flex gap-4 items-center min-w-0">
                                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                                                <span className="material-symbols-outlined text-2xl">auto_delete</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="font-black text-his-slate-900 dark:text-on-surface text-sm italic uppercase tracking-tighter truncate">Data Purge Grace Period</h5>
                                                <p className="text-[10px] text-his-slate-400 font-bold uppercase tracking-widest truncate">Cleanup cycle after trial expiration</p>
                                            </div>
                                        </div>
                                        <div className="relative w-full md:max-w-[160px] shrink-0">
                                            <input 
                                                type="number" 
                                                value={stagedTenant.purge_after_days || 15}
                                                onChange={(e) => setStagedTenant({ ...stagedTenant, purge_after_days: parseInt(e.target.value, 10) || null })}
                                                className="w-full bg-white dark:bg-white/5 border-his-slate-200 dark:border-white/10 rounded-xl px-5 py-3 font-mono text-base text-his-green-400 focus:ring-his-green-400 focus:border-his-green-400 outline-none transition-all" 
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-his-slate-400 text-[10px] font-black uppercase tracking-widest pointer-events-none">Days</span>
                                        </div>
                                    </div>
                                </section>

                                {/* WDS Feature Entitlement Pod */}
                                <section className="space-y-8">
                                    <div className="flex items-center justify-between gap-4">
                                        <h3 className="text-[10px] font-black tracking-[0.3em] text-his-slate-400 uppercase flex items-center gap-4 flex-1">
                                            <span className="whitespace-nowrap">Feature Entitlement Matrix</span>
                                            <div className="flex-1 h-px bg-his-slate-100 dark:bg-white/5" />
                                        </h3>
                                        <span className="text-[10px] text-his-green-400 font-black uppercase tracking-[0.2em] shrink-0">{Object.values(stagedTenant).filter(v => v === true).length} ACTIVE MODULES</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            {
                                                category: "Clinical Core",
                                                features: [
                                                    { key: 'pediatrics_enabled', label: 'Pediatrics' },
                                                    { key: 'laboratory_enabled', label: 'Laboratory' },
                                                    { key: 'radiology_enabled', label: 'Radiology' },
                                                    { key: 'pacs_enabled', label: 'PACS/DICOM' }
                                                ]
                                            },
                                            {
                                                category: "Ops Engine",
                                                features: [
                                                    { key: 'billing_enabled', label: 'Billing' },
                                                    { key: 'pharmacy_enabled', label: 'Pharmacy' },
                                                    { key: 'inventory_enabled', label: 'Inventory' },
                                                    { key: 'workforce_enabled', label: 'Workforce' }
                                                ]
                                            },
                                            {
                                                category: "Engagement",
                                                features: [
                                                    { key: 'portal_enabled', label: 'Patient Portal' },
                                                    { key: 'telehealth_enabled', label: 'Telehealth' },
                                                    { key: 'sms_enabled', label: 'SMS Alerts' },
                                                    { key: 'email_enabled', label: 'Email Sync' }
                                                ]
                                            },
                                            {
                                                category: "Interoperability",
                                                features: [
                                                    { key: 'empi_enabled', label: 'EMPI Master' },
                                                    { key: 'referrals_enabled', label: 'Referrals' },
                                                    { key: 'claims_enabled', label: 'eClaims' },
                                                    { key: 'analytics_enabled', label: 'Analytics BI' }
                                                ]
                                            }
                                        ].map(cat => (
                                            <div key={cat.category} className="space-y-3">
                                                <label className="text-[10px] font-black tracking-[0.25em] text-his-slate-400 uppercase pl-1 whitespace-nowrap">{cat.category}</label>
                                                <div className="space-y-2">
                                                    {cat.features.map(feat => (
                                                        <div 
                                                            key={feat.key}
                                                            onClick={() => setStagedTenant({ ...stagedTenant, [feat.key]: !stagedTenant[feat.key] })}
                                                            className={`glass-hub p-3.5 rounded-xl border-white/5 flex items-center justify-between group cursor-pointer transition-all ${stagedTenant[feat.key] ? 'border-his-green-400/40 bg-his-green-400/10' : 'opacity-60 hover:opacity-100 hover:bg-white dark:hover:bg-white/5'}`}
                                                        >
                                                            <span className={`font-black italic text-[10px] lg:text-xs uppercase tracking-tight transition-colors truncate pr-2 ${stagedTenant[feat.key] ? 'text-his-green-400' : 'text-his-slate-500'}`}>{feat.label}</span>
                                                            <div className={`led-indicator transition-all duration-500 scale-125 shrink-0 ${stagedTenant[feat.key] ? 'text-his-green-400 bg-his-green-400' : 'text-his-slate-300 bg-his-slate-200 dark:bg-white/10'}`}></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* WDS Action Footer */}
                        <footer className="p-6 lg:p-10 lg:pt-8 shrink-0 relative z-30 border-t border-his-slate-100 dark:border-white/5 bg-white/80 dark:bg-his-slate-900/80 backdrop-blur-md shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)]">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                                <div className="flex items-center gap-3 lg:gap-4 text-his-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] lg:tracking-[0.15em] leading-relaxed w-full lg:w-auto">
                                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-his-slate-50 dark:bg-white/5 flex items-center justify-center border border-his-slate-100 dark:border-white/10 shrink-0">
                                        <span className="material-symbols-outlined text-base lg:text-lg">verified_user</span>
                                    </div>
                                    <p className="flex-1 break-words">Immutable Ledger Record signature required for orchestration.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto">
                                    <button 
                                        onClick={() => {
                                            setSelectedTenant(null);
                                            setStagedTenant(null);
                                        }}
                                        className="px-6 lg:px-8 py-3 lg:py-3.5 rounded-xl border border-his-slate-200 dark:border-his-slate-700 font-black hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 transition-all text-his-slate-500 dark:text-his-slate-300 uppercase tracking-[0.2em] text-[9px] lg:text-[10px] whitespace-nowrap order-2 sm:order-1"
                                    >
                                        Abort
                                    </button>
                                    <button 
                                        onClick={handleUpdatePlan}
                                        disabled={isUpdating}
                                        className="px-8 lg:px-12 py-3 lg:py-3.5 rounded-xl bg-his-green-400 text-on-primary font-black uppercase tracking-[0.2em] text-[10px] lg:text-[11px] flex items-center justify-center gap-3 lg:gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-his-green-400/30 disabled:opacity-50 relative overflow-hidden group/btn whitespace-nowrap order-1 sm:order-2"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                                        {isUpdating ? (
                                            <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                        ) : (
                                            <span className="material-symbols-outlined text-lg lg:text-xl shrink-0">published_with_changes</span>
                                        )}
                                        <span className="truncate">{isUpdating ? 'Syncing...' : 'Confirm Orchestration'}</span>
                                    </button>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            )}

            {/* High-Security Impersonation Guardrail */}
            {pendingImpersonation && (
                <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[4rem] p-12 lg:p-16 max-w-2xl w-full shadow-2xl border-4 border-amber-400 relative overflow-hidden animate-in zoom-in-95 duration-500">
                        {/* Security Patterns */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 opacity-10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-900 opacity-5 blur-[40px] rounded-full translate-y-1/2 -translate-x-1/2" />
                        
                        <div className="flex flex-col items-center text-center mb-10 relative z-10">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/10">
                                <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.4em] mb-3">Governance Clearance Required</p>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Environmental<br /><span className="text-amber-500">Impersonation</span></h2>
                        </div>

                        <div className="bg-slate-50 rounded-[2.5rem] p-10 mb-10 border border-slate-100 relative group transition-all hover:bg-white hover:border-amber-100">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Environment</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-tight">{pendingImpersonation.name}</p>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-200/50 w-full" />
                                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                                    "You are entering a live clinical environment. Your actions will be digitally signed and stored in the <span className="text-amber-600 font-black">Global Audit Ledger</span>. Non-compliance with RA 10173 protocols will be flagged."
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <button
                                onClick={() => setPendingImpersonation(null)}
                                disabled={isImpersonating}
                                className="flex-1 py-6 rounded-[2rem] bg-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                Abort Mission
                            </button>
                            <button
                                onClick={confirmImpersonate}
                                disabled={isImpersonating}
                                className="flex-1 py-6 rounded-[2rem] bg-amber-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isImpersonating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Bypassing...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                        Enter Context
                                    </>
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

