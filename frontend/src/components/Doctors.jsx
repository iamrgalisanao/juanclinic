import React, { useEffect, useState, useMemo } from 'react';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../services/api';

const ROLE_LABELS = {
    ADMIN: 'Admin',
    DOCTOR: 'Doctor',
    TECH: 'Technologist',
    DIAGNOSTIC_APPROVER: 'Diagnostic Approver',
    FRONT_DESK: 'Front Desk',
};

const Doctors = ({ tenants, currentUser }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'DOCTOR',
        tenant_id: '',
        password: '',
    });
    const [saving, setSaving] = useState(false);

    const tenantMap = useMemo(() => {
        const map = {};
        (tenants || []).forEach((t) => {
            map[t.id] = t.name;
        });
        return map;
    }, [tenants]);

    const loadDoctors = async () => {
        try {
            const data = await getDoctors();
            setDoctors(data || []);
        } catch (err) {
            console.error('Failed to load doctors', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const normalizedSearch = search.trim().toLowerCase();

    const filteredDoctors = doctors.filter((d) => {
        if (roleFilter !== 'ALL' && d.role !== roleFilter) return false;
        if (!normalizedSearch) return true;
        const name = (d.name || '').toLowerCase();
        const email = (d.email || '').toLowerCase();
        return name.includes(normalizedSearch) || email.includes(normalizedSearch);
    });

    const isAdmin = currentUser?.role === 'ADMIN';

    const openCreate = () => {
        setEditingDoctor(null);
        setForm({ name: '', email: '', role: 'DOCTOR', tenant_id: '', password: '' });
        setShowModal(true);
    };

    const openEdit = (doctor) => {
        setEditingDoctor(doctor);
        setForm({
            name: doctor.name || '',
            email: doctor.email || '',
            role: doctor.role || 'DOCTOR',
            tenant_id: doctor.tenant_id || '',
            password: '',
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                email: form.email,
                role: form.role,
                tenant_id: form.tenant_id || null,
            };

            if (!editingDoctor || form.password) {
                // For new users, password is required; for edits, only send if provided
                payload.password = form.password;
            }

            if (editingDoctor) {
                await updateDoctor(editingDoctor.id, payload);
            } else {
                await createDoctor(payload);
            }

            setShowModal(false);
            setSaving(false);
            setLoading(true);
            await loadDoctors();
        } catch (err) {
            console.error('Failed to save user', err);
            setSaving(false);
        }
    };

    const handleDelete = async (doctor) => {
        if (!isAdmin) return;
        if (!window.confirm(`Remove ${doctor.name} from the directory?`)) return;
        try {
            await deleteDoctor(doctor.id);
            setLoading(true);
            await loadDoctors();
        } catch (err) {
            console.error('Failed to delete user', err);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 flex flex-col gap-8">
            <div className="flex justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Doctors & Staff</h1>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">
                        Directory of clinical users across tenants
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-64 bg-slate-50 border border-his-slate-100 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-700 focus:ring-2 focus:ring-his-green-500/20 focus:border-his-green-400 outline-none"
                        />
                    </div>
                    <div className="flex gap-1 bg-slate-50 border border-his-slate-100 rounded-xl p-1">
                        {['ALL', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK', 'ADMIN'].map((role) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setRoleFilter(role)}
                                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.16em] transition-all ${
                                    roleFilter === role
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                                }`}
                            >
                                {role === 'ALL' ? 'All' : ROLE_LABELS[role] || role}
                            </button>
                        ))}
                    </div>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="px-4 py-2 bg-his-green-500 text-white text-[10px] font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                            New User
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="p-10 text-center text-xs font-bold text-slate-400 animate-pulse">
                    Loading directory...
                </div>
            ) : filteredDoctors.length === 0 ? (
                <div className="p-10 text-center text-xs font-bold text-slate-400">
                    No users match the current filters.
                </div>
            ) : (
                <div className="overflow-x-auto -mx-10 px-10">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <th className="pb-6 pl-2">Name</th>
                                <th className="pb-6">Role</th>
                                <th className="pb-6">Email</th>
                                <th className="pb-6">Tenant</th>
                                <th className="pb-6 text-right pr-2">{isAdmin ? 'Actions' : 'Status'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredDoctors.map((d) => (
                                <tr
                                    key={d.id}
                                    className="group hover:bg-his-slate-100/30 transition-all duration-300 cursor-default"
                                >
                                    <td className="py-6 pl-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-his-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-his-green-50 group-hover:text-his-green-500 transition-colors duration-300">
                                                {(d.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-slate-900 leading-tight">{d.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                    {ROLE_LABELS[d.role] || d.role || 'Unknown Role'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
                                        {ROLE_LABELS[d.role] || d.role || 'Unknown'}
                                    </td>
                                    <td className="py-6 text-xs text-slate-500 font-bold tracking-wide">
                                        {d.email}
                                    </td>
                                    <td className="py-6 text-xs text-slate-500 font-bold tracking-wide">
                                        {d.tenant_id ? tenantMap[d.tenant_id] || `Tenant #${d.tenant_id}` : 'System-wide'}
                                    </td>
                                    <td className="py-6 text-right pr-2">
                                        {isAdmin ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(d)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(d)}
                                                    className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isAdmin && showModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                                    {editingDoctor ? 'Edit User' : 'New User'}
                                </h2>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">
                                    Manage access for doctors and staff
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-his-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                    className="w-full bg-slate-50 border border-his-slate-100 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-700 focus:ring-2 focus:ring-his-green-500/20 focus:border-his-green-400 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                    className="w-full bg-slate-50 border border-his-slate-100 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-700 focus:ring-2 focus:ring-his-green-500/20 focus:border-his-green-400 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        className="w-full bg-slate-50 border border-his-slate-100 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-700 focus:ring-2 focus:ring-his-green-500/20 focus:border-his-green-400 outline-none"
                                    >
                                        {['DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK', 'ADMIN'].map((role) => (
                                            <option key={role} value={role}>
                                                {ROLE_LABELS[role] || role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                                        Tenant
                                    </label>
                                    <select
                                        value={form.tenant_id}
                                        onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
                                        className="w-full bg-slate-50 border border-his-slate-100 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-700 focus:ring-2 focus:ring-his-green-500/20 focus:border-his-green-400 outline-none"
                                    >
                                        <option value="">System-wide</option>
                                        {(tenants || []).map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                                    {editingDoctor ? 'Password (leave blank to keep)' : 'Initial Password'}
                                </label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-slate-50 border border-his-slate-100 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-700 focus:ring-2 focus:ring-his-green-500/20 focus:border-his-green-400 outline-none"
                                    required={!editingDoctor}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-his-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-his-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2.5 bg-his-green-500 text-white text-[10px] font-black rounded-2xl hover:bg-his-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : editingDoctor ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Doctors;
