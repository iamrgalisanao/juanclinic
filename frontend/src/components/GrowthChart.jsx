import React, { useMemo } from 'react';

const GrowthChart = ({ notes = [] }) => {
    const chartData = useMemo(() => {
        return notes
            .filter(n => n.template?.name === 'Pediatric Growth Checklist')
            .map(n => ({
                id: n.id,
                date: new Date(n.created_at).toLocaleDateString(),
                age: parseFloat(n.content.age_months || 0),
                weight: parseFloat(n.content.weight_kg || 0),
                height: parseFloat(n.content.height_cm || 0)
            }))
            .sort((a, b) => a.age - b.age);
    }, [notes]);

    if (chartData.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sleek text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-2">No Growth Data Found</h3>
                <p className="text-sm font-bold text-slate-400">Add "Pediatric Growth Checklist" notes to begin tracking development.</p>
            </div>
        );
    }

    // Chart constants for SVG
    const width = 600;
    const height = 400;
    const padding = 50;

    const maxAge = Math.max(...chartData.map(d => d.age), 24); // Show at least up to 24 months
    const maxWeight = Math.max(...chartData.map(d => d.weight), 15);
    const maxHeight = Math.max(...chartData.map(d => d.height), 100);

    const getX = (age) => padding + (age / maxAge) * (width - 2 * padding);
    const getYWeight = (w) => height - padding - (w / maxWeight) * (height - 2 * padding);
    const getYHeight = (h) => height - padding - (h / maxHeight) * (height - 2 * padding);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-his-slate-100 shadow-sleek overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <svg className="w-64 h-64 text-his-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Pediatric Growth Trajectory</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Longitudinal Development Monitoring</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-his-green-500 shadow-lg shadow-his-green-500/20" />
                            <span className="text-[10px] font-black text-slate-600 uppercase">Weight (kg)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20" />
                            <span className="text-[10px] font-black text-slate-600 uppercase">Height (cm)</span>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-2xl">
                        {/* Grid Lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map(p => (
                            <React.Fragment key={p}>
                                <line
                                    x1={padding} y1={padding + p * (height - 2 * padding)}
                                    x2={width - padding} y2={padding + p * (height - 2 * padding)}
                                    className="stroke-slate-100" strokeWidth="1" strokeDasharray="4 4"
                                />
                                <line
                                    x1={padding + p * (width - 2 * padding)} y1={padding}
                                    x2={padding + p * (width - 2 * padding)} y2={height - padding}
                                    className="stroke-slate-100" strokeWidth="1" strokeDasharray="4 4"
                                />
                            </React.Fragment>
                        ))}

                        {/* Axis Labels */}
                        <text x={width / 2} y={height - 10} textAnchor="middle" className="fill-slate-400 text-[12px] font-black uppercase tracking-widest">Age (Months)</text>

                        {/* Weight Path */}
                        <path
                            d={`M ${chartData.map(d => `${getX(d.age)} ${getYWeight(d.weight)}`).join(' L ')}`}
                            fill="none" stroke="currentColor" strokeWidth="3" className="text-his-green-500 transition-all duration-1000"
                        />

                        {/* Height Path */}
                        <path
                            d={`M ${chartData.map(d => `${getX(d.age)} ${getYHeight(d.height)}`).join(' L ')}`}
                            fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-500 transition-all duration-1000"
                        />

                        {/* Points */}
                        {chartData.map((d, i) => (
                            <React.Fragment key={i}>
                                <circle
                                    cx={getX(d.age)} cy={getYWeight(d.weight)} r="5"
                                    className="fill-white stroke-his-green-500 cursor-help" strokeWidth="3"
                                >
                                    <title>{`Weight: ${d.weight}kg at ${d.age}mo`}</title>
                                </circle>
                                <circle
                                    cx={getX(d.age)} cy={getYHeight(d.height)} r="5"
                                    className="fill-white stroke-blue-500 cursor-help" strokeWidth="3"
                                >
                                    <title>{`Height: ${d.height}cm at ${d.age}mo`}</title>
                                </circle>
                            </React.Fragment>
                        ))}
                    </svg>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Recorded Weight</p>
                    <p className="text-2xl font-black text-slate-900">{chartData[chartData.length - 1].weight} <span className="text-sm text-slate-400">kg</span></p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Recorded Height</p>
                    <p className="text-2xl font-black text-slate-900">{chartData[chartData.length - 1].height} <span className="text-sm text-slate-400">cm</span></p>
                </div>
            </div>
        </div>
    );
};

export default GrowthChart;
