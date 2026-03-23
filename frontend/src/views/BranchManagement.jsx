import React, { useState, useEffect } from 'react';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../services/api';

const BranchManagement = ({ activeTenant, tenants }) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        is_active: true,
        tenant_id: activeTenant?.id || ''
    });

    useEffect(() => {
        fetchBranches();
    }, [activeTenant]);

    useEffect(() => {
        if (!editingBranch && activeTenant) {
            setFormData(prev => ({ ...prev, tenant_id: activeTenant.id }));
        }
    }, [activeTenant, editingBranch]);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const data = await getBranches();
            setBranches(data);
        } catch (error) {
            console.error('Error fetching branches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (branch = null) => {
        setErrors({});
        if (branch) {
            setEditingBranch(branch);
            setFormData({
                name: branch.name,
                address: branch.address || '',
                phone: branch.phone || '',
                email: branch.email || '',
                is_active: branch.is_active,
                tenant_id: branch.tenant_id
            });
        } else {
            setEditingBranch(null);
            setFormData({
                name: '',
                address: '',
                phone: '',
                email: '',
                is_active: true,
                tenant_id: activeTenant?.id || (tenants.length > 0 ? tenants[0].id : '')
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        try {
            if (editingBranch) {
                await updateBranch(editingBranch.id, formData);
            } else {
                await createBranch(formData);
            }
            setShowModal(false);
            fetchBranches();
        } catch (error) {
            console.error('Error saving branch:', error);
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                alert('An unexpected error occurred while saving.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            try {
                await deleteBranch(id);
                fetchBranches();
            } catch (error) {
                console.error('Error deleting branch:', error);
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Branch Management</h2>
                    <p className="text-sm font-bold text-slate-400 mt-2">
                        {activeTenant ? `Managing outlets for ${activeTenant.name}` : 'Global Facility Management'}
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 bg-his-green-500 text-white text-xs font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    New Branch
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-4 border-his-green-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {branches.map(branch => (
                            <div key={branch.id} className="group relative bg-his-slate-50 border border-his-slate-100 rounded-[2rem] p-8 hover:bg-white hover:shadow-2xl hover:shadow-his-slate-200/50 transition-all duration-500">
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={() => handleOpenModal(branch)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-his-green-500 shadow-sm border border-slate-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(branch.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${branch.is_active ? 'bg-his-green-50 text-his-green-500' : 'bg-slate-100 text-slate-400'}`}>
                                        {branch.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 leading-tight">{branch.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${branch.is_active ? 'bg-his-green-500' : 'bg-slate-300'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {branch.is_active ? 'Operative' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {!activeTenant && (
                                        <div className="flex items-center gap-3">
                                            <svg className="w-4 h-4 text-his-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            <p className="text-[10px] font-black text-his-green-600 uppercase tracking-widest">
                                                {tenants.find(t => t.id === branch.tenant_id)?.name || 'Unknown Tenant'}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <svg className="w-4 h-4 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <p className="text-xs font-bold text-slate-500 leading-relaxed">{branch.address || 'No address provided'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        <p className="text-xs font-bold text-slate-500">{branch.phone || 'No phone'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {branches.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-his-slate-100 rounded-[2.5rem]">
                                <div className="w-20 h-20 bg-his-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">No Branches Found</h3>
                                <p className="text-sm font-bold text-slate-400 mt-2">Initialize your organization by creating your first primary location.</p>
                            </div>
                        )}
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
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingBranch ? 'Edit' : 'New'} Branch</h2>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Configuration Panel</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {!editingBranch && !activeTenant && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        Assigned Tenant <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className={`w-full px-6 py-4 bg-his-slate-50 border ${errors.tenant_id ? 'border-rose-300' : 'border-his-slate-100'} rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-his-green-500 focus:ring-4 focus:ring-his-green-500/10 transition-all outline-none`}
                                        value={formData.tenant_id}
                                        onChange={e => setFormData({ ...formData, tenant_id: e.target.value })}
                                    >
                                        <option value="">Select Target Organization</option>
                                        {tenants.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    {errors.tenant_id && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.tenant_id[0]}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Branch Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full px-6 py-4 bg-his-slate-50 border ${errors.name ? 'border-rose-300' : 'border-his-slate-100'} rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-his-green-500 focus:ring-4 focus:ring-his-green-500/10 transition-all outline-none`}
                                    placeholder="e.g. Wellness - Downtown Center"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                                {errors.name && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-4 bg-his-slate-50 border border-his-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-his-green-500 focus:ring-4 focus:ring-his-green-500/10 transition-all outline-none"
                                    placeholder="Complete address details"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-his-slate-50 border border-his-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-his-green-500 focus:ring-4 focus:ring-his-green-500/10 transition-all outline-none"
                                        placeholder="Contact no."
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                    <div className="flex bg-his-slate-50 p-1.5 rounded-2xl border border-his-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: true })}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${formData.is_active ? 'bg-white text-his-green-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Active
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, is_active: false })}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${!formData.is_active ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Inactive
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-his-green-500 text-white text-xs font-black rounded-[1.5rem] hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-2xl shadow-his-green-500/20 mt-4"
                            >
                                {editingBranch ? 'Save Changes' : 'Create Branch Instance'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
