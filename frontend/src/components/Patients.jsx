import React, { useEffect, useState } from 'react';
import { getPatients } from '../services/api';

const Patients = ({ onOpenPatient, onNewPatient }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getPatients();
                setPatients(data);
            } catch (err) {
                console.error('Failed to load patients', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const normalizedSearch = search.trim().toLowerCase();
    const filteredPatients = patients.filter((p) => {
        if (!normalizedSearch) return true;
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
        const mrn = (p.patient_external_id || '').toLowerCase();
        return fullName.includes(normalizedSearch) || mrn.includes(normalizedSearch);
    });

    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 flex flex-col gap-8">
            <div className="flex justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patients</h1>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">
                        Registry of all patients in this tenant
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or MRN..."
                            className="w-64 bg-slate-50 border border-his-slate-100 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-700 focus:ring-2 focus:ring-his-green-500/20 focus:border-his-green-400 outline-none"
                        />
                    </div>
                    {onNewPatient && (
                        <button
                            type="button"
                            onClick={onNewPatient}
                            className="px-5 py-2.5 bg-his-green-500 text-white text-[10px] font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            New Patient
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="p-10 text-center text-xs font-bold text-slate-400 animate-pulse">
                    Loading patients...
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="p-10 text-center text-xs font-bold text-slate-400">
                    No patients match the current filter.
                </div>
            ) : (
                <div className="overflow-x-auto -mx-10 px-10">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="pb-6 pl-2">Patient Details</th>
                                <th className="pb-6">Gender</th>
                                <th className="pb-6">DOB</th>
                                <th className="pb-6">ID System</th>
                                <th className="pb-6 text-right pr-2">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredPatients.map((p) => (
                                <tr
                                    key={p.id}
                                    onClick={() => {
                                        if (onOpenPatient) {
                                            onOpenPatient(p.id);
                                        }
                                    }}
                                    className="group hover:bg-his-slate-100/30 transition-all duration-300 cursor-pointer"
                                >
                                    <td className="py-6 pl-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-his-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-his-green-50 group-hover:text-his-green-500 transition-colors duration-300">
                                                {(p.first_name || '?')[0]}{(p.last_name || '?')[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-slate-900 leading-tight">{p.first_name} {p.last_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Medical Record</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
                                        {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                                    </td>
                                    <td className="py-6 text-xs text-slate-500 font-bold uppercase tracking-widest">{p.dob}</td>
                                    <td className="py-6">
                                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-his-slate-50 px-2 py-1 rounded-md border border-slate-100 italic">
                                            {p.patient_external_id || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-6 text-right pr-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Patients;
