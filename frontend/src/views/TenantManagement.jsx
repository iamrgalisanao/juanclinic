import React, { useState, useEffect } from 'react';
import { getTenants, createTenant, updateTenant, deleteTenant } from '../services/api';
import { useDialog } from '../context/DialogContext';

const TenantManagement = ({ onTenantUpdate }) => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        official_address: '',
        contact_number: '',
        admin_settings: {}
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const { alert, confirm } = useDialog();

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
                official_address: tenant.official_address || '',
                contact_number: tenant.contact_number || '',
                admin_settings: tenant.admin_settings || {}
            });
            setLogoPreview(tenant.logo_url);
            setLogoFile(null);
        } else {
            setEditingTenant(null);
            setFormData({
                name: '',
                slug: '',
                official_address: '',
                contact_number: '',
                admin_settings: {}
            });
            setLogoPreview(null);
            setLogoFile(null);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const data = new FormData();
        data.append('name', formData.name);
        data.append('slug', formData.slug);
        data.append('official_address', formData.official_address);
        data.append('contact_number', formData.contact_number);
        data.append('admin_settings', JSON.stringify(formData.admin_settings));
        if (logoFile) {
            data.append('logo', logoFile);
        }

        try {
            if (editingTenant) {
                await updateTenant(editingTenant.id, data);
            } else {
                await createTenant(data);
            }
            setShowModal(false);
            fetchTenants();
            if (onTenantUpdate) onTenantUpdate();
            await alert({
                title: editingTenant ? 'Organization Updated' : 'Organization Provisioned',
                message: editingTenant ? 'The organization configuration has been updated successfully.' : 'The new organization has been provisioned successfully.'
            });
        } catch (error) {
            console.error('Error saving tenant:', error);
            if (error.response && error.response.status === 422) {
                console.error('Validation Errors:', error.response.data.errors);
                setErrors(error.response.data.errors || {});
            } else {
                await alert({
                    title: 'Operation Failed',
                    message: 'An unexpected error occurred while saving.'
                });
            }
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Delete Organization?',
            message: 'Are you sure you want to delete this tenant? All associated branches and users may be orphaned! Continue?',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });

        if (confirmed) {
            try {
                await deleteTenant(id);
                fetchTenants();
                if (onTenantUpdate) onTenantUpdate();
            } catch (error) {
                console.error('Error deleting tenant:', error);
                await alert({
                    title: 'Delete Failed',
                    message: 'An error occurred while trying to delete the tenant.'
                });
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

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
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
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                                        {tenant.logo_url ? (
                                            <img src={tenant.logo_url} alt={tenant.name} className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xl font-black text-slate-900 uppercase">
                                                {tenant.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 leading-tight">{tenant.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                            {tenant.slug}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-start text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Infrastructure</span>
                                        <span className="text-slate-900">{tenant.branches_count || 0} Facilities</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Clinic Registry Details</p>
                                        <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <svg className="w-3.5 h-3.5 text-his-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                <span className="text-[10px] font-bold text-slate-600 line-clamp-1">{tenant.official_address || 'No Address Registered'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <svg className="w-3.5 h-3.5 text-his-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                <span className="text-[10px] font-bold text-slate-600">{tenant.contact_number || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {tenant.id === 888 && (
                                        <div className="mt-4 pt-4 border-t border-his-slate-100">
                                            <span className="px-3 py-1 bg-his-green-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-his-green-500/20">
                                                System Authority Node
                                            </span>
                                        </div>
                                    )}
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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Clinic Logo (High Fidelity)</label>
                                <div className="flex items-start gap-6 bg-his-slate-50 p-6 rounded-[2rem] border border-his-slate-100">
                                    <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm relative group">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        )}
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleLogoChange}
                                            accept="image/*"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-900 leading-tight">Upload organization logo</p>
                                        <p className="text-[8px] font-bold text-slate-400 mt-1 leading-relaxed">PNG, JPG or SVG. <br/>Max size: 2MB. Recommended: Landscape/Square.</p>
                                        <button 
                                            type="button"
                                            className="mt-3 text-[10px] font-black text-his-green-500 uppercase tracking-widest hover:text-his-green-600 transition-colors"
                                            onClick={() => document.querySelector('input[type="file"]').click()}
                                        >
                                            Change Logo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Contact Number</label>
                                    <input
                                        type="text"
                                        className={`w-full px-6 py-4 bg-his-slate-50 border ${errors.contact_number ? 'border-rose-300' : 'border-his-slate-100'} rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none`}
                                        placeholder="+63 900 000 0000"
                                        value={formData.contact_number}
                                        onChange={e => setFormData({ ...formData, contact_number: e.target.value })}
                                    />
                                    {errors.contact_number && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.contact_number[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">System Identifier (Slug)</label>
                                    <input
                                        type="text"
                                        required
                                        className={`w-full px-6 py-4 bg-his-slate-50 border ${errors.slug ? 'border-rose-300' : 'border-his-slate-100'} rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none pr-12`}
                                        placeholder="st-luke"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-xs">Official Clinic Address</label>
                                <textarea
                                    className={`w-full px-6 py-4 bg-his-slate-50 border ${errors.official_address ? 'border-rose-300' : 'border-his-slate-100'} rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none min-h-[100px] resize-none`}
                                    placeholder="e.g. 123 Medical Ave, Quezon City, Philippines"
                                    value={formData.official_address}
                                    onChange={e => setFormData({ ...formData, official_address: e.target.value })}
                                />
                                {errors.official_address && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.official_address[0]}</p>}
                                <p className="text-[8px] font-bold text-slate-400 ml-1 uppercase tracking-widest leading-relaxed">This address will appear in the header of all printed Medical Certificates and Prescriptions.</p>
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
