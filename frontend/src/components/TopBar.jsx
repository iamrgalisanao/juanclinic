import React from 'react';
import { useSyncStatus } from '../services/syncService';

const TopBar = ({ activeTenant, tenants, onTenantChange, activeBranch, branches, onBranchChange, currentUser, onSidebarToggle, isSidebarSlim, onSlimToggle, onLogout, searchTerm, onSearch }) => {
    const { isOnline, lastSync } = useSyncStatus(activeTenant?.id);

    return (
        <div className="h-20 md:h-24 flex items-center justify-between px-6 md:px-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30">
            <div className="flex items-center gap-4 flex-1 mr-4">
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
                <div className="flex items-center gap-6 flex-1">
                    <div className="max-w-xl relative hidden sm:block flex-1">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search clinical data..."
                            value={searchTerm || ''}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full bg-his-slate-100/50 border-none rounded-2xl py-3.5 pl-14 pr-6 text-sm focus:ring-2 focus:ring-his-green-500/10 transition-all outline-none text-slate-700 font-semibold placeholder:text-slate-400"
                        />
                    </div>

                    {/* Sync Status Badge */}
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
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3 py-2 px-4 bg-his-green-50 rounded-2xl border border-his-green-100/50">
                    <div className="w-2 h-2 rounded-full bg-his-green-500 animate-pulse" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {currentUser.tenant_id ? 'System Managed' : 'Tenant'}
                    </span>
                    <select
                        value={activeTenant?.id || ''}
                        disabled={!!currentUser.tenant_id}
                        onChange={(e) => {
                            const tenant = tenants.find(t => t.id === parseInt(e.target.value));
                            if (tenant) onTenantChange(tenant);
                        }}
                        className={`bg-transparent border-none text-his-green-600 text-[11px] font-black uppercase tracking-widest outline-none py-0.5 ${currentUser.tenant_id ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:text-his-green-700 transition-colors'}`}
                    >
                        {tenants.map(t => (
                            <option key={t.id} value={t.id} className="bg-white text-slate-900 font-sans normal-case tracking-normal">{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* Branch Switcher */}
                <div className="flex items-center gap-3 py-2 px-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {currentUser.branch_id ? 'Fixed Facility' : 'Facility'}
                    </span>
                    <select
                        value={activeBranch?.id || ''}
                        disabled={!!currentUser.branch_id || branches.length === 0}
                        onChange={(e) => {
                            const branch = branches.find(b => b.id === parseInt(e.target.value));
                            if (branch) onBranchChange(branch);
                        }}
                        className={`bg-transparent border-none text-blue-600 text-[11px] font-black uppercase tracking-widest outline-none py-0.5 ${currentUser.branch_id || branches.length === 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:text-blue-700 transition-colors'}`}
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

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900 leading-none">{currentUser.name}</p>
                            <p className="text-[10px] font-bold text-his-green-500 uppercase tracking-widest mt-1.5">{currentUser.role} Control</p>
                        </div>
                        <div className="group relative">
                            <div className="w-12 h-12 rounded-2xl bg-his-slate-100 border border-slate-100 overflow-hidden shadow-sm cursor-pointer hover:ring-2 hover:ring-his-green-500/20 transition-all">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}&background=f8fafc&color=22c55e&bold=true`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                            </div>
                            {/* Simple Tooltip-style Logout */}
                            <button
                                onClick={onLogout}
                                className="absolute top-14 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 whitespace-nowrap"
                            >
                                Terminate Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
