import React from 'react';

const MobileNav = ({ activeView, setActiveView, onOpenSidebar }) => {
    const navItems = [
        { id: 'dashboard', name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'patients', name: 'Patients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
        { id: 'worklist', name: 'Worklist', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { id: 'messages', name: 'Chat', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[60]">
            <div className="glass-dark rounded-3xl p-3 flex items-center justify-between shadow-2xl border border-white/5 backdrop-blur-2xl">
                {navItems.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                                isActive 
                                ? 'text-his-green-400 bg-his-green-500/10' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <svg className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                        </button>
                    );
                })}
                
                <button
                    onClick={onOpenSidebar}
                    className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-slate-500 hover:text-slate-300 transition-all"
                >
                    <div className="w-6 h-6 flex flex-col justify-center gap-1">
                        <div className="w-6 h-0.5 bg-current rounded-full"></div>
                        <div className="w-4 h-0.5 bg-current rounded-full"></div>
                        <div className="w-6 h-0.5 bg-current rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">More</span>
                </button>
            </div>
        </div>
    );
};

export default MobileNav;
