import React from 'react';

const StatCard = ({ title, value, trend, icon, color = "bg-his-green-500" }) => {
    // Extract trend info if it exists (e.g. "+12%" or "Current shift")
    const isPositive = trend?.includes('+');
    const isNeutral = !trend?.includes('+') && !trend?.includes('-');
    const isGreenBg = color.includes('his-green');

    return (
        <div className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-sleek border border-his-slate-100 flex flex-col justify-between group hover:shadow-2xl hover:shadow-his-slate-200/40 transition-all duration-500 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 sm:w-24 sm:h-24 bg-his-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex justify-between items-start mb-5 sm:mb-8 relative z-10">
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl ${color} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg ${isGreenBg ? 'shadow-his-green-500/20' : 'shadow-slate-100'}`}>
                    <svg className={`w-5 h-5 sm:w-7 sm:h-7 ${isGreenBg ? 'text-white' : 'text-slate-400'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} />
                    </svg>
                </div>
                {trend && (
                    <div className="flex flex-col items-end gap-1">
                        <div className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black ${
                            isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            isNeutral ? 'bg-slate-50 text-slate-400 border-slate-100' : 
                            'bg-rose-50 text-rose-600 border-rose-100'
                        } border`}>
                            {isPositive && (
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                                </svg>
                            )}
                            {!isPositive && !isNeutral && (
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                            {trend.split(' ')[0]}
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-[0.1em]">
                            {trend.split(' ').slice(1).join(' ')}
                        </span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-2.5">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight group-hover:text-his-green-600 transition-colors duration-500">{value}</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-his-green-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse mb-2" />
                </div>
            </div>
        </div>
    );
};

export default StatCard;

