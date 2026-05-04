import React from 'react';
import { useSyncStatus } from '../services/syncService';

const TopBar = ({ activeTenant, impersonatedTenant, tenants, onTenantChange, activeBranch, branches, onBranchChange, currentUser, onSidebarToggle, isSidebarSlim, onSlimToggle, onLogout, searchTerm, onSearch }) => {
    const { isOnline, lastSync } = useSyncStatus(activeTenant?.id);

    const isDoctor = currentUser.role === 'DOCTOR';
    const showMenuDetails = isDoctor; // In this case, we hide from header and show in menu

    return (
        <div className="h-20 md:h-24 flex items-center justify-between px-6 md:px-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onSidebarToggle}
                    className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-his-slate-100 text-slate-500 hover:bg-his-green-50 hover:text-his-green-600 transition-all shrink-0"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                
                {/* Desktop Slim Toggle */}
                <button
                    onClick={onSlimToggle}
                    className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl bg-his-slate-100/50 text-slate-400 hover:bg-his-green-50 hover:text-his-green-600 transition-all shrink-0"
                    title={isSidebarSlim ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <svg className={`w-5 h-5 transition-transform duration-500 ${isSidebarSlim ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex items-center gap-6 flex-1 max-w-4xl">
                    <div className="relative hidden sm:block flex-1 group">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-his-green-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search patients, appointments, or clinical records..."
                            value={searchTerm || ''}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full bg-his-slate-100/50 border-2 border-transparent rounded-[2rem] py-4 pl-16 pr-8 text-base focus:bg-white focus:border-his-green-500/20 focus:ring-8 focus:ring-his-green-500/5 transition-all outline-none text-slate-700 font-bold placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                        />
                    </div>

                    {/* Sync Status Badge - Hidden for Doctors in Header */}
                    {!isDoctor && (
                        <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all duration-500 ${isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                    {isOnline ? 'Online' : 'Offline Mode'}
                                </span>
                                {lastSync && (
                                    <span className="text-[8px] font-bold opacity-60 mt-0.5">
                                        Last Sync: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Header Actions - Hidden for Doctors */}
                {!isDoctor && (
                    <>
                        <div className="flex items-center gap-2 md:gap-3 py-2 px-3 md:px-4 bg-his-green-50 rounded-2xl border border-his-green-100/50">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-his-green-500 animate-pulse" />
                            <span className="hidden xl:inline text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                {currentUser.role === 'GLOBAL_ADMIN' ? 'System Control' : 'Context'}
                            </span>
                            <select
                                value={activeTenant?.id || ''}
                                disabled={currentUser.role === 'GLOBAL_ADMIN' && !impersonatedTenant}
                                onChange={(e) => {
                                    const tenant = tenants.find(t => t.id === parseInt(e.target.value));
                                    if (tenant) onTenantChange(tenant);
                                }}
                                className={`bg-transparent border-none text-his-green-600 text-[10px] md:text-[11px] font-black uppercase tracking-widest outline-none py-0.5 max-w-[80px] md:max-w-none truncate ${currentUser.tenant_id ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:text-his-green-700 transition-colors'}`}
                            >
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id} className="bg-white text-slate-900 font-sans normal-case tracking-normal">{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Branch Switcher */}
                        <div className="flex items-center gap-2 md:gap-3 py-2 px-3 md:px-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="hidden xl:inline text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                {currentUser.role === 'GLOBAL_ADMIN' ? 'Site Node' : 'Facility'}
                            </span>
                            <select
                                value={activeBranch?.id || ''}
                                disabled={(currentUser.role === 'GLOBAL_ADMIN' && !impersonatedTenant) || branches.length === 0}
                                onChange={(e) => {
                                    const branch = branches.find(b => b.id === parseInt(e.target.value));
                                    if (branch) onBranchChange(branch);
                                }}
                                className={`bg-transparent border-none text-blue-600 text-[10px] md:text-[11px] font-black uppercase tracking-widest outline-none py-0.5 max-w-[80px] md:max-w-none truncate ${currentUser.branch_id || branches.length === 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:text-blue-700 transition-colors'}`}
                            >
                                {branches.length === 0 ? (
                                    <option value="" disabled className="bg-white text-slate-400 font-sans normal-case tracking-normal">No Facilities Found</option>
                                ) : (
                                    <>
                                        <option value="" disabled className="bg-white text-slate-400 font-sans normal-case tracking-normal">Select Facility...</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id} className="bg-white text-slate-900 font-sans normal-case tracking-normal">{b.name}</option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>
                    </>
                )}

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
                        {!isDoctor && (
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 leading-none">{currentUser.name}</p>
                                <p className="text-[10px] font-bold text-his-green-500 uppercase tracking-widest mt-1.5">{currentUser.role} Control</p>
                            </div>
                        )}
                        <div className="group relative">
                            <div className="flex items-center gap-3 cursor-pointer">
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-[1.25rem] bg-his-slate-100 border border-slate-100 overflow-hidden shadow-sm group-hover:ring-4 group-hover:ring-his-green-500/10 transition-all">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}&background=f8fafc&color=22c55e&bold=true`}
                                        alt="Avatar"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                {isDoctor && <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>}
                            </div>

                            {/* Refined Dropdown Menu */}
                            <div className="absolute top-full right-0 mt-4 w-72 bg-white border border-slate-100 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-6 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                                {/* User Profile Info */}
                                <div className="mb-6">
                                    <p className="text-base font-black text-slate-900 leading-tight">{currentUser.name}</p>
                                    <p className="text-[10px] font-bold text-his-green-500 uppercase tracking-widest mt-1">{currentUser.role} Account</p>
                                </div>

                                {/* Menu Details (Sync/Context/Facility for Doctors) */}
                                {showMenuDetails && (
                                    <div className="space-y-4 mb-6 pt-6 border-t border-slate-50">
                                        {/* Sync Status In-Menu */}
                                        <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isOnline ? 'bg-emerald-50 border-emerald-100/50' : 'bg-rose-50 border-rose-100/50'}`}>
                                            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {isOnline ? 'Cloud Synchronized' : 'Offline Mode'}
                                                </span>
                                                {lastSync && <span className="text-[9px] font-bold text-slate-400">Last: {new Date(lastSync).toLocaleTimeString()}</span>}
                                            </div>
                                        </div>

                                        {/* Context Switcher In-Menu */}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Clinic Context</label>
                                            <div className="relative">
                                                <select
                                                    value={activeTenant?.id || ''}
                                                    onChange={(e) => onTenantChange(tenants.find(t => t.id === parseInt(e.target.value)))}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 outline-none appearance-none"
                                                >
                                                    {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>

                                        {/* Facility Switcher In-Menu */}
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Active Facility</label>
                                            <div className="relative">
                                                <select
                                                    value={activeBranch?.id || ''}
                                                    onChange={(e) => onBranchChange(branches.find(b => b.id === parseInt(e.target.value)))}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 outline-none appearance-none"
                                                >
                                                    {branches.length === 0 ? (
                                                        <option disabled>No Facilities Found</option>
                                                    ) : (
                                                        branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
                                                    )}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={onLogout}
                                    className="w-full bg-slate-900 hover:bg-rose-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-slate-900/10 hover:shadow-rose-500/20"
                                >
                                    Terminate Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
