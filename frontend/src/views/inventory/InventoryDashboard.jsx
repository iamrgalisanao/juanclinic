import React, { useState, useEffect } from 'react';

const InventoryDashboard = ({ activeBranchId }) => {
    const [activeCategory, setActiveCategory] = useState('ALL'); // ALL, SUPPLY, REAGENT
    const [loading, setLoading] = useState(false);
    
    // Mock data for initial UI build
    const inventory = [
        { id: 1, name: 'Surgical Gloves (M)', sku: 'GLV-M-001', category: 'SUPPLY', unit: 'BOX', total_stock: 42, min_level: 10, status: 'NORMAL' },
        { id: 2, name: 'A+ Blood Grouping Reagent', sku: 'REG-ABO-A', category: 'REAGENT', unit: 'ML', total_stock: 5, min_level: 15, status: 'LOW' },
        { id: 3, name: 'Anti-D (Rh) Testing Solution', sku: 'REG-RH-01', category: 'REAGENT', unit: 'ML', total_stock: 12, min_level: 5, status: 'EXPIRING' },
    ];

    const batches = [
        { id: 101, item_name: 'Anti-D (Rh) Testing Solution', batch: 'BT-2026-X1', qty: 12, expiry: '2026-05-10', days_left: 30 },
        { id: 102, item_name: 'A+ Blood Grouping Reagent', batch: 'BT-2025-A2', qty: 5, expiry: '2026-11-20', days_left: 220 },
    ];

    const CategoryPill = ({ name, label }) => (
        <button
            onClick={() => setActiveCategory(name)}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === name ? 'bg-his-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-600'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Inventory Intelligence</h2>
                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Supply Chain & Reagent Integrity Control</p>
                </div>
                <div className="flex gap-4 p-1.5 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <CategoryPill name="ALL" label="Total Assets" />
                    <CategoryPill name="SUPPLY" label="Medical Supplies" />
                    <CategoryPill name="REAGENT" label="Lab Reagents" />
                </div>
            </div>

            {/* Critical Alerts Bar */}
            <div className="flex gap-6 overflow-x-auto pb-4 pt-2">
                <div className="min-w-[320px] bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl shadow-rose-500/5 transition-all hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white font-black animate-pulse">!</div>
                    <div>
                        <p className="text-[10px] font-black text-rose-900 uppercase tracking-widest">Critical Expiry</p>
                        <p className="text-xs font-bold text-rose-500 mt-1 uppercase">Anti-D Solution (30 Days Left)</p>
                    </div>
                </div>
                <div className="min-w-[320px] bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-6">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white font-black font-sans">#</div>
                    <div>
                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Low Stock Alert</p>
                        <p className="text-xs font-bold text-amber-500 mt-1 uppercase">A+ Reagent (5 ML Remaining)</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                
                {/* Master Stock Table */}
                <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-sleek border border-slate-100">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Clinical Stock Ledger</h3>
                    <div className="overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Item / SKU</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Category</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Available</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {inventory.map(item => (
                                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-6">
                                            <p className="text-sm font-black text-slate-900">{item.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.sku}</p>
                                        </td>
                                        <td className="py-6">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${item.category === 'REAGENT' ? 'bg-indigo-50 text-indigo-500 border border-indigo-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="py-6 font-black text-slate-900">
                                            {item.total_stock} <span className="text-[9px] text-slate-300">{item.unit}</span>
                                        </td>
                                        <td className="py-6">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'LOW' ? 'text-amber-500' : item.status === 'EXPIRING' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Batch Intelligence Sidebar */}
                <div className="bg-his-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col">
                    <h3 className="text-xl font-black tracking-tight mb-8 italic">Batch Monitoring</h3>
                    <div className="space-y-6 flex-1">
                        {batches.map(b => (
                            <div key={b.id} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{b.item_name}</p>
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${b.days_left < 60 ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                                        BATCH {b.batch}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-2xl font-black">{b.qty} <span className="text-xs text-slate-500">ML</span></p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Expiry: {b.expiry}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xl font-black ${b.days_left < 60 ? 'text-rose-500' : 'text-his-green-500'}`}>{b.days_left}</span>
                                        <p className="text-[8px] font-black text-slate-600 uppercase">Days Left</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${b.days_left < 60 ? 'bg-rose-500' : 'bg-his-green-500'}`} style={{ width: `${Math.min((b.days_left / 180) * 100, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Footer / v1.27 Branding */}
            <div className="pt-10 flex justify-center">
                <div className="flex items-center gap-6 px-8 py-4 bg-slate-50 border border-slate-100 rounded-3xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-his-green-500 flex items-center justify-center text-white italic font-black text-[10px]">v1</div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Clinical Stock Integrity Engine</span>
                    </div>
                    <div className="w-px h-4 bg-slate-200" />
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                        Stock deduction policy: Purchase-Driven (FIFO) • Multi-branch Isolated Secure Registry
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InventoryDashboard;
