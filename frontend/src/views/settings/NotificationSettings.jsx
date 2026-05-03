import React, { useState, useEffect } from 'react';
import { getNotificationCadences, createNotificationCadence, updateNotificationCadence, deleteNotificationCadence, getBranches } from '../../services/api';
import { useDialog } from '../../context/DialogContext';

const NotificationSettings = () => {
    const { alert, confirm } = useDialog();
    const [cadences, setCadences] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCadence, setEditingCadence] = useState(null);
    const [formData, setFormData] = useState({
        branch_id: '',
        category: 'APPOINTMENT',
        trigger_type: 'BEFORE_DUE',
        days: 1,
        is_active: true,
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cadenceData, branchData] = await Promise.all([
                getNotificationCadences(),
                getBranches()
            ]);
            setCadences(cadenceData);
            setBranches(branchData);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (cadence = null) => {
        if (cadence) {
            setEditingCadence(cadence);
            setFormData({
                branch_id: cadence.branch_id || '',
                category: cadence.category,
                trigger_type: cadence.trigger_type,
                days: cadence.days,
                is_active: cadence.is_active,
                description: cadence.description || ''
            });
        } else {
            setEditingCadence(null);
            setFormData({
                branch_id: '',
                category: 'APPOINTMENT',
                trigger_type: 'BEFORE_DUE',
                days: 1,
                is_active: true,
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCadence) {
                await updateNotificationCadence(editingCadence.id, formData);
            } else {
                await createNotificationCadence(formData);
            }
            await alert({
                title: editingCadence ? 'Cadence Updated' : 'Cadence Created',
                message: 'Notification trigger rules have been synchronized.'
            });
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving cadence:', error);
            await alert({
                title: 'Storage Error',
                message: 'Failed to synchronize notification data.'
            });
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Delete Trigger?',
            message: 'Are you sure you want to remove this notification trigger? This will halt all associated patient outreach.',
            confirmText: 'Delete',
            cancelText: 'Retain'
        });
        if (!confirmed) return;

        try {
            await deleteNotificationCadence(id);
            fetchData();
        } catch (error) {
            console.error('Error deleting cadence:', error);
        }
    };

    const toggleStatus = async (cadence) => {
        try {
            await updateNotificationCadence(cadence.id, { is_active: !cadence.is_active });
            fetchData();
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const CadenceCard = ({ cadence }) => (
        <div className="group relative bg-white border border-slate-100 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-his-slate-200/50 transition-all duration-500">
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => handleOpenModal(cadence)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-his-slate-50 text-slate-400 hover:text-his-green-500 shadow-sm border border-slate-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button
                    onClick={() => handleDelete(cadence.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-his-slate-50 text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${cadence.category === 'APPOINTMENT' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {cadence.category === 'APPOINTMENT' ? '📅' : '💉'}
                </div>
                <div>
                    <h3 className="font-black text-slate-900 leading-tight">{cadence.days} {cadence.days === 1 ? 'Day' : 'Days'} {cadence.trigger_type.replace('_', ' ')}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {cadence.category} Trigger
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${cadence.is_active ? 'text-his-green-500' : 'text-rose-500'}`}>
                            {cadence.is_active ? 'Active' : 'Paused'}
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-xs font-bold text-slate-500 leading-relaxed min-h-[32px]">
                {cadence.description || `Automated outreach scheduled ${cadence.days} day(s) ${cadence.trigger_type.toLowerCase().replace('_', ' ')} the scheduled date.`}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {cadence.branch_id ? branches.find(b => b.id === cadence.branch_id)?.name : 'Global (All Branches)'}
                    </span>
                </div>
                <button 
                    onClick={() => toggleStatus(cadence)}
                    className={`w-10 h-5 rounded-full relative transition-all duration-500 ${cadence.is_active ? 'bg-his-green-500' : 'bg-slate-200'}`}
                >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-500 ${cadence.is_active ? 'right-0.5' : 'left-0.5'}`} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Clinical Notification Cadence</h2>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest leading-relaxed">
                        Orchestrating automated patient outreach windows
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-8 py-4 bg-his-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl flex items-center gap-3 group"
                >
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    New Outreach Trigger
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-[2.5rem] border border-slate-100">
                    <div className="w-10 h-10 border-4 border-his-slate-900 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Appointment Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Appointment Reminders</h3>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {cadences.filter(c => c.category === 'APPOINTMENT').map(cadence => (
                                <CadenceCard key={cadence.id} cadence={cadence} />
                            ))}
                            {cadences.filter(c => c.category === 'APPOINTMENT').length === 0 && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400">
                                    <p className="font-black uppercase text-[10px] tracking-widest">No custom appointment triggers defined</p>
                                    <p className="text-[10px] font-bold mt-1">System is using global 3d/1d defaults.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Vaccination Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Vaccination Outreach</h3>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {cadences.filter(c => c.category === 'VACCINATION').map(cadence => (
                                <CadenceCard key={cadence.id} cadence={cadence} />
                            ))}
                            {cadences.filter(c => c.category === 'VACCINATION').length === 0 && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400">
                                    <p className="font-black uppercase text-[10px] tracking-widest">No vaccination outreach rules defined</p>
                                    <p className="text-[10px] font-bold mt-1">Configure BEFORE_DUE, ON_DUE, or AFTER_DUE triggers.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-500">
                    <div className="bg-white rounded-[3rem] p-12 max-w-xl w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-his-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all group">
                                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mb-10">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingCadence ? 'Modify' : 'Initialize'} Outreach Window</h2>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Diagnostic Loop Configuration</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        className="w-full px-6 py-4 bg-his-slate-50 border border-his-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-his-green-500 focus:ring-4 focus:ring-his-green-500/10 transition-all outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        disabled={editingCadence}
                                    >
                                        <option value="APPOINTMENT">Appointment</option>
                                        <option value="VACCINATION">Vaccination</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Scope</label>
                                    <select
                                        className="w-full px-6 py-4 bg-his-slate-50 border border-his-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-his-green-500 focus:ring-4 focus:ring-his-green-500/10 transition-all outline-none"
                                        value={formData.branch_id}
                                        onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                                    >
                                        <option value="">Global (All Branches)</option>
                                        {branches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trigger Event</label>
                                    <select
                                        className="w-full px-6 py-4 bg-his-slate-50 border border-his-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-his-green-500 focus:ring-4 focus:ring-his-green-500/10 transition-all outline-none"
                                        value={formData.trigger_type}
                                        onChange={e => setFormData({ ...formData, trigger_type: e.target.value })}
                                    >
                                        <option value="BEFORE_DUE">Before Due Date</option>
                                        <option value="ON_DUE">On Due Date</option>
                                        <option value="AFTER_DUE">After Due Date (Overdue)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Offset (Days)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-6 py-4 bg-his-slate-50 border border-his-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-his-green-500 focus:ring-4 focus:ring-his-green-500/10 transition-all outline-none"
                                        value={formData.days}
                                        onChange={e => setFormData({ ...formData, days: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Description</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-his-slate-50 border border-his-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-his-green-500 focus:ring-4 focus:ring-his-green-500/10 transition-all outline-none min-h-[100px] resize-none"
                                    placeholder="Purpose of this outreach window..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-his-slate-900 text-white text-xs font-black rounded-2xl hover:bg-slate-800 transition-all uppercase tracking-widest shadow-2xl shadow-slate-900/20 mt-4"
                            >
                                {editingCadence ? 'Apply Outreach Rules' : 'Activate Outreach Trigger'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationSettings;
