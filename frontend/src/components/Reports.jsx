import React, { useState, useEffect } from 'react';
import { getDashboardReports, getBranchBenchmarking } from '../services/api';

const Reports = ({ activeTenant, activeBranch }) => {
    const [reportData, setReportData] = useState(null);
    const [benchmarkingData, setBenchmarkingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'benchmarking'

    // Date Range State (Default to last 30 days)
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchData();
    }, [activeTenant, activeBranch, startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = { start_date: startDate, end_date: endDate };
            const [dashboard, benchmarking] = await Promise.all([
                getDashboardReports(params),
                getBranchBenchmarking(params)
            ]);
            setReportData(dashboard);
            setBenchmarkingData(benchmarking);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch analytical data:", err);
            setError("Unable to load performance data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: 'Total Patients',
            value: reportData?.stats?.total_patients?.toLocaleString() || '0',
            trend: 'New Registrations',
            color: 'his-green'
        },
        {
            label: 'Total Revenue',
            value: reportData?.stats?.total_revenue ? `₱${reportData.stats.total_revenue.toLocaleString()}` : '₱0',
            trend: 'Direct Collections',
            color: 'blue'
        },
        {
            label: 'Order Completion',
            value: reportData?.stats?.completion_rate ? `${reportData.stats.completion_rate}%` : '0%',
            trend: 'Workflow Efficiency',
            color: 'purple'
        },
    ];

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-his-green-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Parsing Enterprise Analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-10 space-y-10 animate-in fade-in duration-700">
            {/* Header with Date Range */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Advanced Analytics</h2>
                    <div className="flex items-center gap-4 mt-4 bg-his-slate-100/50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                        <div className="flex items-center gap-3 px-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-[11px] font-black uppercase text-slate-700 outline-none"
                            />
                        </div>
                        <div className="w-px h-4 bg-slate-200" />
                        <div className="flex items-center gap-3 px-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-[11px] font-black uppercase text-slate-700 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm self-start">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-his-green-500 text-white shadow-lg shadow-his-green-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('benchmarking')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'benchmarking' ? 'bg-his-green-500 text-white shadow-lg shadow-his-green-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Benchmarking
                    </button>
                </div>
            </div>

            {activeTab === 'dashboard' ? (
                <>
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
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Patient Admissions Trend</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Volume distribution over selected period</p>
                            </div>
                            <div className="flex-1 flex items-end justify-between gap-4 mt-10 min-h-[220px]">
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
                                                {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-slate-200 uppercase font-black text-xs tracking-widest border-2 border-dashed border-slate-50 rounded-3xl">
                                        No trend data for this range
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 min-h-[400px] flex flex-col">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Order Distribution</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service type utilization</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {reportData?.distribution?.orders?.map(d => (
                                        <div key={d.order_type} className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${d.order_type === 'LAB' ? 'bg-his-green-500' : 'bg-blue-400'}`} />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{d.order_type}: {d.count}</span>
                                        </div>
                                    )) || <span className="text-[9px] font-black text-slate-300">N/A</span>}
                                </div>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-56 h-56 rounded-full border-[24px] border-slate-100 relative group flex items-center justify-center">
                                    <div className="absolute inset-0 rounded-full border-[24px] border-his-green-500 border-r-transparent border-b-transparent -rotate-45" />
                                    <div className="text-center">
                                        <span className="text-4xl font-black text-slate-900 leading-none">
                                            {reportData?.stats?.total_orders || 0}
                                        </span>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Total Volume</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Cross-Branch Performance</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Benchmarking physical facilities across the enterprise</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black border border-blue-100/50">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" /> REVENUE
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-his-green-50 text-his-green-600 rounded-xl text-[10px] font-black border border-his-green-100/50">
                                    <div className="w-2 h-2 rounded-full bg-his-green-500" /> PATIENTS
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {benchmarkingData?.benchmarking?.map((branch) => (
                                <div key={branch.branch_id} className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{branch.branch_name}</span>
                                        <div className="flex items-end gap-10">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Total Revenue</p>
                                                <p className="text-lg font-black text-slate-900">₱{branch.revenue.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Clinical Orders</p>
                                                <p className="text-lg font-black text-slate-900">{branch.order_count}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-6 w-full bg-his-slate-50 rounded-full flex overflow-hidden shadow-inner font-black text-white text-[9px] leading-none">
                                        <div
                                            className="h-full bg-his-green-500 flex items-center justify-center transition-all duration-1000 border-r border-white/20"
                                            style={{ width: `${(branch.patient_count / (Math.max(...benchmarkingData.benchmarking.map(b => b.patient_count), 1))) * 100}%` }}
                                        >
                                            {branch.patient_count > 0 && branch.patient_count}
                                        </div>
                                        <div
                                            className="h-full bg-blue-400 flex items-center justify-center transition-all duration-1000"
                                            style={{ width: `${(branch.revenue / (Math.max(...benchmarkingData.benchmarking.map(b => b.revenue), 1))) * 100}%` }}
                                        >
                                        </div>
                                    </div>
                                    <div className="w-full h-px bg-slate-50" />
                                </div>
                            ))}

                            {(!benchmarkingData?.benchmarking || benchmarkingData.benchmarking.length === 0) && (
                                <div className="text-center py-20 border-2 border-dashed border-slate-50 rounded-[2.5rem]">
                                    <p className="text-sm font-black text-slate-200 uppercase tracking-[0.2em]">No facility data available for selection</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer / Disclaimer */}
            <div className="flex justify-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Enterprise analytics synced from all physical facilities • Last updated: {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};

export default Reports;
