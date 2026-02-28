import React from 'react';

const StatCard = ({ title, value, percentage, isUp, icon, colorClass }) => {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sleek border border-his-slate-100 flex flex-col justify-between group hover:shadow-2xl hover:shadow-his-slate-200/40 transition-all duration-500 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-his-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
                    </svg>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} border ${isUp ? 'border-emerald-100' : 'border-rose-100'}`}>
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={isUp ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                        </svg>
                        {percentage}%
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.1em]">vs last month</span>
                </div>
            </div>

            <div className="relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2.5">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-his-green-600 transition-colors duration-500">{value}</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-his-green-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse mb-2" />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
