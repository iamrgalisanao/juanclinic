import React, { useState, useEffect } from 'react';
import { getDashboardReports } from '../services/api';

const Reports = ({ activeTenant, activeBranch }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const data = await getDashboardReports();
                setReportData(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch reports:", err);
                setError("Unable to load performance data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [activeTenant, activeBranch]);

    const stats = [
        {
            label: 'Total Patients',
            value: reportData?.stats?.total_patients?.toLocaleString() || '0',
            trend: 'Live Registry',
            color: 'his-green'
        },
        {
            label: 'Total Revenue',
            value: reportData?.stats?.total_revenue ? `₱${reportData.stats.total_revenue.toLocaleString()}` : '₱0',
            trend: 'Cash Collected',
            color: 'blue'
        },
        {
            label: 'Order Completion',
            value: reportData?.stats?.completion_rate ? `${reportData.stats.completion_rate}%` : '0%',
            trend: 'Efficiency',
            color: 'purple'
        },
    ];

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-his-green-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aggregating Global Metrics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[400px]">
                <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 text-center">
                    <h3 className="text-xl font-black text-red-600 mb-2">Sync Error</h3>
                    <p className="text-sm font-bold text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 space-y-10 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reports & Analytics</h2>
                    <p className="text-sm font-bold text-slate-400 mt-2">Comprehensive overview of clinical and financial performance.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white text-slate-600 text-xs font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest border border-slate-100 shadow-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Last 30 Days
                    </button>
                    <button className="px-6 py-3 bg-his-green-500 text-white text-xs font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map(s => (
                    <div key={s.label} className="bg-white p-8 rounded-[2rem] shadow-sleek border border-his-slate-100 group transition-all duration-500 hover:shadow-2xl">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{s.label}</p>
                        <div className="flex justify-between items-end">
                            <h3 className="text-3xl font-black text-slate-900">{s.value}</h3>
                            <span className="text-[11px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{s.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 min-h-[400px] flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Patient Admissions</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth trend over the last 7 days</p>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-4 mt-10 min-h-[200px]">
                        {reportData?.trends?.admissions?.length > 0 ? (
                            reportData.trends.admissions.map((trend, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                    <div
                                        className="w-full bg-his-slate-50 rounded-xl relative group cursor-pointer overflow-hidden transition-all duration-500"
                                        style={{ height: `${Math.max((trend.count / Math.max(...reportData.trends.admissions.map(d => d.count), 1)) * 100, 10)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-his-green-500 origin-bottom scale-y-100 group-hover:bg-his-green-600 transition-colors duration-300" />
                                        <div className="absolute inset-x-0 top-0 p-2 text-center">
                                            <span className="text-[9px] font-black text-white">{trend.count}</span>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">
                                        {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-200 uppercase font-black text-xs tracking-widest border-2 border-dashed border-slate-50 rounded-3xl">
                                No recent data
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Order Distribution</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">LAB vs RAD volume analysis</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            {reportData?.distribution?.orders?.map(d => (
                                <div key={d.order_type} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${d.order_type === 'LAB' ? 'bg-his-green-500' : 'bg-blue-400'}`} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{d.order_type}: {d.count}</span>
                                </div>
                            )) || <span className="text-[9px] font-black text-slate-300">No Orders</span>}
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-56 h-56 rounded-full border-[24px] border-slate-100 relative group flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-[24px] border-his-green-500 border-r-transparent border-b-transparent -rotate-45" />
                            <div className="text-center">
                                <span className="text-4xl font-black text-slate-900 leading-none">
                                    {reportData?.stats?.total_orders || 0}
                                </span>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Total Orders</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Disclaimer */}
            <div className="flex justify-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Metrics aggregate from all branches under {reportData?.tenant_name || 'Active Tenant'} • Last updated: {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};

export default Reports;
