import React, { useState, useEffect } from 'react';

const Sidebar = ({ activeTenant, impersonatedTenant, activeView, setActiveView, currentUser, isOpen, isSlim, setIsSlim, systemVersion, onClose, onLogout }) => {
    const [expandedMenus, setExpandedMenus] = useState([]);

    const allItems = [
        { id: 'dashboard', name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK'] },
        { id: 'worklist', name: 'Worklist', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['ADMIN', 'TECH', 'DIAGNOSTIC_APPROVER'] },
        { id: 'messages', name: 'Message', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK'] },
        { id: 'appointments', name: 'Appointment', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK'] },
        {
            id: 'pharmacy_parent',
            name: 'Pharmacy',
            icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.022.547l-2.387 2.387a2 2 0 102.828 2.828l2.387-2.387a2 2 0 011.022-.547l2.387-.477a6 6 0 013.86-.517l.318-.158a6 6 0 003.86-.517l2.387.477a2 2 0 011.022.547l2.387 2.387a2 2 0 102.828-2.828l-2.387-2.387z',
            roles: ['ADMIN', 'DOCTOR', 'TECH'],
            subItems: [
                { id: 'pharmacy', name: 'Dispensing' },
                { id: 'medicine_management', name: 'Medicines' },
                { id: 'drug_discovery', name: 'Discovery' },
            ]

        },
        { id: 'billing', name: 'Billing', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z', roles: ['ADMIN', 'FRONT_DESK'] },
        { id: 'clinical_notes', name: 'Clinical Notes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['ADMIN', 'DOCTOR'] },
        { id: 'patients', name: 'Patients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK', 'DIAGNOSTIC_APPROVER'] },
        { id: 'doctors', name: 'Doctors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', roles: ['ADMIN'] },
        { id: 'reports', name: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles: ['ADMIN', 'FRONT_DESK', 'DOCTOR', 'DIAGNOSTIC_APPROVER', 'GLOBAL_ADMIN'] },
        { id: 'referrals', name: 'Referrals', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK'] },
        { id: 'tenant_management', name: 'Organization Settings', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', roles: ['ADMIN', 'GLOBAL_ADMIN'], globalOnly: true },
        { id: 'branch_management', name: 'Branch Settings', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', roles: ['ADMIN'] },
        { id: 'notification_settings', name: 'Notification Rules', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', roles: ['ADMIN'] },
        { id: 'audit', name: 'Audit', icon: 'M9 17v-6a2 2 0 012-2h7m-7 0l-2-2m2 2l-2 2M5 19h14', roles: ['ADMIN', 'GLOBAL_ADMIN'] },
        { id: 'terminology_review', name: 'Terminology Review', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', roles: ['ADMIN', 'GLOBAL_ADMIN'] },
        { id: 'hl7_transport', name: 'HL7 Transport', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4 0v8m0 0l-3-3m3 3l3-3', roles: ['ADMIN', 'GLOBAL_ADMIN'] },
        { id: 'superadmin', name: 'Control Tower', icon: 'M13 10V3L4 14h7v7l9-11h-7z', roles: ['GLOBAL_ADMIN'] },
        { id: 'help', name: 'Help Center', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK', 'TECH'] },
    ];
    const categories = [
        { name: 'Overview', items: ['dashboard', 'messages', 'help'] },
        { name: 'Clinical Core', items: ['patients', 'appointments', 'clinical_notes', 'referrals', 'doctors'] },
        { name: 'Operations', items: ['worklist', 'pharmacy_parent', 'billing'] },
        { name: 'Governance', items: ['superadmin', 'terminology_review', 'reports', 'tenant_management', 'branch_management', 'notification_settings', 'audit', 'hl7_transport'] }
    ];

    const filteredItems = allItems.filter(item => {
        // Super Admin Clinical Visibility Bypass:
        // If GLOBAL_ADMIN is impersonating, show them ALL clinical tools
        // We check localStorage directly to avoid state race conditions during initial boot
        const effectiveImpersonation = impersonatedTenant || JSON.parse(localStorage.getItem('impersonated_tenant') || 'null');
        
        if (currentUser.role === 'GLOBAL_ADMIN' && effectiveImpersonation && item.roles.some(r => ['ADMIN', 'DOCTOR', 'TECH'].includes(r))) {
            return true;
        }

        if (!item.roles.includes(currentUser.role)) return false;
        
        // Organization Settings: Restricted to Global Admin at Home OR Local Admin in their tenant
        // If marked as globalOnly, it only shows if we are in the System context (tenant_id 888)
        if (item.globalOnly && currentUser.tenant_id !== 888 && currentUser.tenant_id !== null) return false;
        
        return true;
    });

    const groupedItems = categories.map(cat => ({
        ...cat,
        items: filteredItems.filter(item => cat.items.includes(item.id))
    })).filter(cat => cat.items.length > 0);

    useEffect(() => {
        if (isSlim) {
            setExpandedMenus([]);
        } else {
            filteredItems.forEach(item => {
                if (item.subItems && item.subItems.some(sub => sub.id === activeView)) {
                    if (!expandedMenus.includes(item.id)) {
                        setExpandedMenus(prev => [...prev, item.id]);
                    }
                }
            });
        }
    }, [activeView, filteredItems, isSlim]);

    const toggleMenu = (id) => {
        if (isSlim) {
            setIsSlim(false);
            setExpandedMenus([id]);
            return;
        }
        setExpandedMenus(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    return (
        <div className={`${isSlim ? 'w-20' : 'w-64'} bg-his-slate-900 h-screen flex flex-col p-4 fixed z-50 sidebar-transition lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-10 px-2 group">
                <div className="flex items-center gap-3 cursor-pointer overflow-hidden" onClick={() => setActiveView('dashboard')}>
                    <div className="w-10 h-10 bg-his-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-his-green-500/20 group-hover:scale-110 transition-transform duration-300 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 21c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" /></svg>
                    </div>
                    {!isSlim && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <h1 className="font-black text-xl tracking-tight text-white leading-none">JUAN</h1>
                            <p className="text-[10px] font-bold text-his-green-500 tracking-[0.2em] uppercase">Clinical System</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <nav className="flex-1 space-y-8 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
                {groupedItems.map((category) => (
                    <div key={category.name} className="space-y-3">
                        {!isSlim && (
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 animate-in fade-in duration-500">
                                {category.name}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {category.items.map((item) => {
                                const isExpanded = expandedMenus.includes(item.id);
                                const isActive = activeView === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeView));

                                return (
                                    <div key={item.id} className="space-y-1 relative group/item">
                                        <button
                                            onClick={() => item.subItems ? toggleMenu(item.id) : setActiveView(item.id)}
                                            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isActive && !item.subItems
                                                ? 'bg-his-green-500 text-white shadow-lg shadow-his-green-500/10'
                                                : isActive
                                                    ? 'text-white bg-white/5'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg className={`w-6 h-6 transition-colors shrink-0 ${isActive ? 'text-his-green-400' : 'text-slate-500 group-hover/item:text-his-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                                </svg>
                                                {!isSlim && <span className="animate-in fade-in duration-300 whitespace-nowrap">{item.name}</span>}
                                            </div>
                                            {!isSlim && item.subItems && (
                                                <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </button>

                                        {isSlim && (
                                            <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/5">
                                                {item.name}
                                            </div>
                                        )}

                                        {!isSlim && item.subItems && (
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
                        </div>
                    </div>
                ))}
            </nav>

            <div className="pt-6 mt-auto border-t border-white/5 space-y-2">
                {systemVersion && (
                    <div 
                        className={`px-3 py-2 text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${isSlim ? 'text-center text-his-green-500/40 hover:text-his-green-500' : 'text-slate-600 hover:text-slate-400'} cursor-help`}
                        title={systemVersion.full}
                    >
                        {isSlim ? systemVersion.platform.split('.')[0].slice(-2) : `v${systemVersion.platform}`}
                    </div>
                )}
                <button 
                    onClick={() => setIsSlim(!isSlim)}
                    className="w-full hidden lg:flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                    <svg className={`w-6 h-6 transition-transform duration-500 ${isSlim ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                    {!isSlim && <span className="animate-in fade-in duration-300">Minimize Menu</span>}
                </button>
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-200"
                >
                    <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    {!isSlim && <span className="animate-in fade-in duration-300">Logout System</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
