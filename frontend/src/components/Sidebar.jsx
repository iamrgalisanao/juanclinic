import React, { useState, useEffect } from 'react';

const Sidebar = ({ activeTenant, activeView, setActiveView, currentUser, isOpen, onClose }) => {
    const [expandedMenus, setExpandedMenus] = useState([]);

    const allItems = [
        { id: 'dashboard', name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK'] },
        { id: 'worklist', name: 'Worklist', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['ADMIN', 'TECH', 'DIAGNOSTIC_APPROVER'] },
        { id: 'messages', name: 'Message', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['ADMIN', 'DOCTOR'] },
        { id: 'appointments', name: 'Appointment', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK'] },
        {
            id: 'pharmacy_parent',
            name: 'Pharmacy',
            icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 102.828 2.828l2.387-2.387a2 2 0 011.022-.547l2.387-.477a6 6 0 013.86-.517l.318-.158a6 6 0 003.86-.517l2.387.477a2 2 0 011.022.547l2.387 2.387a2 2 0 102.828-2.828l-2.387-2.387z',
            roles: ['ADMIN', 'DOCTOR', 'TECH'],
            subItems: [
                { id: 'pharmacy', name: 'Dispensing' },
                { id: 'medicine_management', name: 'Medicines' },
            ]
        },
        { id: 'billing', name: 'Billing', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z', roles: ['ADMIN', 'FRONT_DESK'] },
        { id: 'clinical_notes', name: 'Clinical Notes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['ADMIN', 'DOCTOR'] },
        { id: 'patients', name: 'Patients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK'] },
        { id: 'doctors', name: 'Doctors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: ['ADMIN'] },
        { id: 'reports', name: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['ADMIN', 'FRONT_DESK'] },
        { id: 'referrals', name: 'Referrals', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK'] },
        { id: 'audit', name: 'Audit', icon: 'M9 17v-6a2 2 0 012-2h7m-7 0l-2-2m2 2l-2 2M5 19h14', roles: ['ADMIN'] },
    ];
    const menuItems = allItems.filter(item => item.roles.includes(currentUser.role));

    useEffect(() => {
        // Auto-expand menu if active link is a sub-item
        menuItems.forEach(item => {
            if (item.subItems && item.subItems.some(sub => sub.id === activeView)) {
                if (!expandedMenus.includes(item.id)) {
                    setExpandedMenus(prev => [...prev, item.id]);
                }
            }
        });
    }, [activeView, menuItems]);

    const toggleMenu = (id) => {
        setExpandedMenus(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    return (
        <div className={`w-64 bg-his-slate-900 min-h-screen flex flex-col p-6 fixed z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-10 px-2 group">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
                    <div className="w-10 h-10 bg-his-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-his-green-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" /></svg>
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-tight text-white leading-none">JUAN</h1>
                        <p className="text-[10px] font-bold text-his-green-500 tracking-[0.2em] uppercase">Clinical System</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
                {menuItems.map((item) => {
                    const isExpanded = expandedMenus.includes(item.id);
                    const isActive = activeView === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeView));

                    return (
                        <div key={item.id} className="space-y-1">
                            <button
                                onClick={() => item.subItems ? toggleMenu(item.id) : setActiveView(item.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${isActive && !item.subItems
                                    ? 'bg-his-green-500 text-white shadow-lg shadow-his-green-500/10'
                                    : isActive
                                        ? 'text-white bg-white/5'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-his-green-400' : 'text-slate-500 group-hover:text-his-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                    </svg>
                                    <span className={isActive ? 'text-white' : ''}>{item.name}</span>
                                </div>
                                {item.subItems && (
                                    <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </button>

                            {item.subItems && (
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                    <div className="pl-12 space-y-1 py-1">
                                        {item.subItems.map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => setActiveView(sub.id)}
                                                className={`w-full text-left px-4 py-2 text-xs font-black uppercase tracking-widest transition-all duration-200 rounded-lg ${activeView === sub.id
                                                    ? 'text-his-green-400 translate-x-1'
                                                    : 'text-slate-500 hover:text-his-green-300 hover:translate-x-1'
                                                    }`}
                                            >
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
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
