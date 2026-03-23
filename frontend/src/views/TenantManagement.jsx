import React, { useState, useEffect } from 'react';
import { getTenants, createTenant, updateTenant, deleteTenant } from '../services/api';

const TenantManagement = ({ onTenantUpdate }) => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        admin_settings: {}
    });

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const data = await getTenants();
            setTenants(data);
        } catch (error) {
            console.error('Error fetching tenants:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (tenant = null) => {
        setErrors({});
        if (tenant) {
            setEditingTenant(tenant);
            setFormData({
                name: tenant.name,
                slug: tenant.slug,
                admin_settings: tenant.admin_settings || {}
            });
        } else {
            setEditingTenant(null);
            setFormData({
                name: '',
                slug: '',
                admin_settings: {}
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            if (editingTenant) {
                await updateTenant(editingTenant.id, formData);
            } else {
                await createTenant(formData);
            }
            setShowModal(false);
            fetchTenants();
            if (onTenantUpdate) onTenantUpdate();
        } catch (error) {
            console.error('Error saving tenant:', error);
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                alert('An unexpected error occurred while saving.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tenant? All associated branches and users may be orphaned! Contine?')) {
            try {
                await deleteTenant(id);
                fetchTenants();
                if (onTenantUpdate) onTenantUpdate();
            } catch (error) {
                console.error('Error deleting tenant:', error);
            }
        }
    };

    const generateSlug = (name) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData({
            ...formData,
            name,
            slug: editingTenant ? formData.slug : generateSlug(name)
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Organization Management</h2>
                    <p className="text-sm font-bold text-slate-400 mt-2">Managing global tenants and their infrastructure.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-4 bg-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    New Organization
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tenants.map(tenant => (
                            <div key={tenant.id} className="group relative bg-his-slate-50 border border-his-slate-100 rounded-[2rem] p-8 hover:bg-white hover:shadow-2xl hover:shadow-his-slate-200/50 transition-all duration-500">
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => handleOpenModal(tenant)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-his-green-500 shadow-sm border border-slate-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tenant.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-black text-slate-900 border border-slate-200">
                                        {tenant.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 leading-tight">{tenant.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                            {tenant.slug}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-his-slate-100">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Branches</span>
                                        <span className="text-slate-900">—</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-500 animate-in fade-in">
                    <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-his-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all group">
                                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-10">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingTenant ? 'Configure' : 'Provision'} Organization</h2>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Global Resource Management</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization Name</label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-6 py-4 bg-his-slate-50 border ${errors.name ? 'border-rose-300' : 'border-his-slate-100'} rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none`}
                                    placeholder="e.g. St. Luke Medical Center"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                />
                                {errors.name && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.name[0]}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">System Identifier (Slug)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        className={`w-full px-6 py-4 bg-his-slate-50 border ${errors.slug ? 'border-rose-300' : 'border-his-slate-100'} rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none pr-12`}
                                        placeholder="st-luke"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6.172 13.828a4 4 0 015.656-0l4-4a4 4 0 115.656 5.656l-1.102 1.101" /></svg>
                                    </div>
                                </div>
                                {errors.slug && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.slug[0]}</p>}
                                <p className="text-[8px] font-bold text-slate-400 ml-1 uppercase tracking-widest leading-relaxed">Unique identifier used for multi-tenant isolation and routing.</p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-slate-900 text-white text-xs font-black rounded-[1.5rem] hover:bg-slate-800 transition-all uppercase tracking-widest shadow-2xl shadow-slate-900/20 mt-4 flex items-center justify-center gap-3"
                            >
                                {editingTenant ? 'Apply Configuration' : 'Provision Instance'}
                                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantManagement;
