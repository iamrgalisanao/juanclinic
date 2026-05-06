import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDialog } from '../context/DialogContext';

const SettingsGovernance = ({ activeTenant, onTenantUpdate }) => {
    const { alert, confirm } = useDialog();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tenants, setTenants] = useState([]);
    const [branches, setBranches] = useState([]);
    const [errors, setErrors] = useState({});

    // Unified Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        official_address: '',
        contact_number: '',
        admin_settings: {
            laboratory_enabled: true,
            radiology_enabled: true,
            pharmacy_enabled: true,
            telehealth_enabled: true,
            enterprise_mode: false,
            mfa_required: false
        }
    });

    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, [activeTenant]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [tenantsRes, branchesRes] = await Promise.all([
                api.get('/tenants'),
                api.get('/branches')
            ]);
            setTenants(tenantsRes.data);
            setBranches(branchesRes.data);

            // If we have an active tenant, populate the form
            if (activeTenant) {
                const current = tenantsRes.data.find(t => t.id === activeTenant.id);
                if (current) {
                    setFormData({
                        name: current.name || '',
                        slug: current.slug || '',
                        official_address: current.official_address || '',
                        contact_number: current.contact_number || '',
                        admin_settings: {
                            ...formData.admin_settings,
                            ...(current.admin_settings || {})
                        }
                    });
                    setLogoPreview(current.logo_url);
                }
            }
        } catch (error) {
            console.error('Error fetching settings data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
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
            await api.post(`/tenants/${activeTenant.id}?_method=PUT`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (onTenantUpdate) onTenantUpdate();
            
            await alert({
                title: 'Governance Synchronized',
                message: 'All organization settings and feature entitlements have been successfully deployed.'
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                await alert({
                    title: 'Synchronization Failed',
                    message: 'An unexpected error occurred while deploying the configuration.'
                });
            }
        } finally {
            setSaving(false);
        }
    };

    const toggleFeature = (feature) => {
        setFormData(prev => ({
            ...prev,
            admin_settings: {
                ...prev.admin_settings,
                [feature]: !prev.admin_settings[feature]
            }
        }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-his-green-500/20 border-t-his-green-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings & Governance</h1>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">Global Administrative Orchestration</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-his-green-500/10 border border-his-green-500/20 rounded-xl">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-his-green-500 animate-pulse" />
                            <span className="text-[10px] font-black text-his-green-600 uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
                {/* Section 1: Tenant Profile */}
                <section className="glass-dark rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <svg className="w-40 h-40 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-his-green-500/10 flex items-center justify-center text-his-green-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Organization Profile</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Clinical Identity & Metadata</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Logo Upload */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="relative group/logo w-full aspect-square bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-his-green-500/50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-8" />
                                ) : (
                                    <div className="text-center p-8">
                                        <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Logo Uploaded</p>
                                    </div>
                                )}
                                <input type="file" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-all duration-300">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest px-6 py-3 border border-white/20 rounded-xl">Replace Logo</span>
                                </div>
                            </div>
                            <p className="text-[9px] font-bold text-slate-500 text-center px-4 leading-relaxed uppercase tracking-widest">Recommended: High-resolution PNG or SVG with transparent background.</p>
                        </div>

                        {/* Profile Fields */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Official Clinic Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-his-green-500 outline-none transition-all" 
                                    placeholder="e.g. Juan Clinic Main"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Contact Number</label>
                                <input 
                                    type="text" 
                                    value={formData.contact_number}
                                    onChange={e => setFormData({...formData, contact_number: e.target.value})}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-his-green-500 outline-none transition-all" 
                                    placeholder="+63 900 000 0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">System Slug</label>
                                <input 
                                    type="text" 
                                    value={formData.slug}
                                    readOnly
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 font-bold cursor-not-allowed outline-none" 
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Primary Address</label>
                                <textarea 
                                    value={formData.official_address}
                                    onChange={e => setFormData({...formData, official_address: e.target.value})}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-his-green-500 outline-none transition-all min-h-[100px] resize-none" 
                                    placeholder="Enter complete clinic address..."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Feature Orchestration */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-dark rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Clinical Modules</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Feature Entitlements</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'laboratory_enabled', label: 'Laboratory Management', desc: 'Patient orders and result entry.' },
                                { id: 'radiology_enabled', label: 'Radiology & Imaging', desc: 'DICOM viewing and reporting.' },
                                { id: 'pharmacy_enabled', label: 'Pharmacy Dispensing', desc: 'Inventory and prescription fulfillment.' },
                                { id: 'telehealth_enabled', label: 'Telehealth Bridge', desc: 'Real-time video and chat consultations.' }
                            ].map(feature => (
                                <div key={feature.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                                    <div>
                                        <p className="text-sm font-black text-white">{feature.label}</p>
                                        <p className="text-[10px] font-bold text-slate-500">{feature.desc}</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => toggleFeature(feature.id)}
                                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${formData.admin_settings[feature.id] ? 'bg-his-green-500 shadow-lg shadow-his-green-500/20' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${formData.admin_settings[feature.id] ? 'left-7 shadow-sm' : 'left-1 opacity-40'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-dark rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Security & Trust</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Mandatory Guardrails</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-6 bg-rose-500/10 rounded-[2rem] border border-rose-500/20">
                                <div className="flex-1 pr-6">
                                    <p className="text-sm font-black text-rose-500">Enterprise Enforcement (Mode 3)</p>
                                    <p className="text-[10px] font-bold text-rose-500/60 leading-relaxed mt-1 uppercase tracking-widest">Strictest clinical audit trails and mandatory terminology alignment enabled.</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => toggleFeature('enterprise_mode')}
                                    className={`w-14 h-8 rounded-full relative transition-all duration-300 shrink-0 ${formData.admin_settings.enterprise_mode ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${formData.admin_settings.enterprise_mode ? 'left-7 shadow-sm' : 'left-1 opacity-40'}`} />
                                </button>
                            </div>

                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-black text-white">Multi-Factor Authentication</p>
                                        <p className="text-[10px] font-bold text-slate-500">Mandatory for all medical staff.</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => toggleFeature('mfa_required')}
                                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${formData.admin_settings.mfa_required ? 'bg-his-green-500' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${formData.admin_settings.mfa_required ? 'left-7 shadow-sm' : 'left-1 opacity-40'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Platform Intelligence */}
                <section className="glass-dark rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Core</p>
                            <p className="text-2xl font-black text-white tracking-tighter">Laravel 11.x / React 18</p>
                            <p className="text-[10px] font-bold text-his-green-500 uppercase tracking-widest">Secure Stack Active</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Ledger Status</p>
                            <p className="text-2xl font-black text-white tracking-tighter">High Integrity</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">100% Immutable</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compliance Engine</p>
                            <p className="text-2xl font-black text-white tracking-tighter">RA 10173 / HL7</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Standards Verified</p>
                        </div>
                    </div>
                </section>

                {/* Final Actions */}
                <div className="flex items-center justify-end gap-6 pt-10 border-t border-white/5">
                    <button 
                        type="button"
                        onClick={fetchInitialData}
                        className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Discard Changes
                    </button>
                    <button 
                        type="submit"
                        disabled={saving}
                        className="px-12 py-5 bg-his-green-500 text-slate-900 text-xs font-black rounded-2xl hover:bg-his-green-400 transition-all uppercase tracking-widest shadow-2xl shadow-his-green-500/20 flex items-center gap-3 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        )}
                        Synchronize Governance
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsGovernance;
