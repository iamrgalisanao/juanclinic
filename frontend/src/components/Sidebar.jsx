import React from 'react';

const Sidebar = ({ activeTenant, activeView, setActiveView, currentUser }) => {
    const allItems = [
        { id: 'dashboard', name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK'] },
        { id: 'worklist', name: 'Worklist', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', roles: ['ADMIN', 'TECH', 'DIAGNOSTIC_APPROVER'] },
        { id: 'messages', name: 'Message', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['ADMIN', 'DOCTOR'] },
        { id: 'appointments', name: 'Appointment', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK'] },
        { id: 'patients', name: 'Patients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK'] },
        { id: 'doctors', name: 'Doctors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: ['ADMIN'] },
        { id: 'reports', name: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['ADMIN', 'DOCTOR'] },
    ];

    const menuItems = allItems.filter(item => item.roles.includes(currentUser.role));

    return (
        <div className="w-64 bg-slate-900 min-h-screen flex flex-col p-6 fixed z-20">
            <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group" onClick={() => setActiveView('dashboard')}>
                <div className="w-10 h-10 bg-his-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-his-green-500/20 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" /></svg>
                </div>
                <div>
                    <h1 className="font-black text-xl tracking-tight text-white leading-none">JUAN</h1>
                    <p className="text-[10px] font-bold text-his-green-500 tracking-[0.2em] uppercase">Clinical System</p>
                </div>
            </div>

            <nav className="flex-1 space-y-1.5">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${activeView === item.id
                            ? 'bg-his-green-500 text-white shadow-lg shadow-his-green-500/10'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <svg className={`w-5 h-5 transition-colors ${activeView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-his-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                        {item.name}
                    </button>
                ))}
            </nav>

            <div className="pt-6 mt-6 border-t border-white/5">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout System
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
