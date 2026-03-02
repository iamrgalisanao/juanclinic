import React from 'react';

const TopBar = ({ activeTenant, tenants, onTenantChange, currentUser, onUserSwitch, availableUsers }) => {
    return (
        <div className="h-24 flex items-center justify-between px-10 bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30">
            <div className="flex-1 max-w-xl relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input
                    type="text"
                    placeholder="Search patients, doctors, or reports..."
                    className="w-full bg-his-slate-100/50 border-none rounded-2xl py-3.5 pl-14 pr-6 text-sm focus:ring-2 focus:ring-his-green-500/10 transition-all outline-none text-slate-700 font-semibold placeholder:text-slate-400"
                />
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

                <div className="flex items-center gap-4">
                    {/* Dev User Switcher */}
                    <select
                        className="text-[10px] font-black uppercase bg-his-slate-100 border-none rounded-lg px-2 py-1 outline-none text-slate-500 hover:text-his-green-600 transition-colors cursor-pointer"
                        value={currentUser.id}
                        onChange={(e) => {
                            const user = availableUsers.find(u => u.id === parseInt(e.target.value));
                            if (user) onUserSwitch(user);
                        }}
                    >
                        {availableUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.role}: {u.name}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900 leading-none">{currentUser.name}</p>
                            <p className="text-[10px] font-bold text-his-green-500 uppercase tracking-widest mt-1.5">{currentUser.role} Control</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-his-slate-100 border border-slate-100 overflow-hidden shadow-sm group cursor-pointer">
                            <img
                                src={`https://ui-avatars.com/api/?name=${currentUser.name.replace(' ', '+')}&background=f8fafc&color=22c55e&bold=true`}
                                alt="Avatar"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
