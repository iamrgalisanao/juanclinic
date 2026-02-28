import React from 'react';

const TopBar = ({ activeTenant, tenants, onTenantChange }) => {
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
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Tenant</span>
                    <select
                        value={activeTenant?.id || ''}
                        onChange={(e) => {
                            const tenant = tenants.find(t => t.id === parseInt(e.target.value));
                            if (tenant) onTenantChange(tenant);
                        }}
                        className="bg-transparent border-none text-his-green-600 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:text-his-green-700 transition-colors py-0.5"
                    >
                        {tenants.map(t => (
                            <option key={t.id} value={t.id} className="bg-white text-slate-900 font-sans normal-case tracking-normal">{t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </button>
                    <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900 leading-none">Admin User</p>
                            <p className="text-[10px] font-bold text-his-green-500 uppercase tracking-widest mt-1.5">NIMI System</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-his-slate-100 border border-slate-100 overflow-hidden shadow-sm group cursor-pointer">
                            <img
                                src="https://ui-avatars.com/api/?name=Admin+User&background=f8fafc&color=22c55e&bold=true"
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
