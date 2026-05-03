import React, { useState, useEffect } from 'react';
import { getVitals, storeVital, deleteVital } from '../../services/api';
import { useDialog } from '../../context/DialogContext';
import { 
    Activity, 
    Plus, 
    Trash2, 
    ChevronDown, 
    ChevronUp, 
    AlertCircle,
    Thermometer,
    Heart,
    Wind,
    Droplets,
    Scale,
    Ruler
} from 'lucide-react';

const VitalsManager = ({ patient }) => {
    const { confirm, alert } = useDialog();
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        weight_kg: '',
        height_cm: '',
        temp_c: '',
        bp_systolic: '',
        bp_diastolic: '',
        pulse_rate: '',
        resp_rate: '',
        spo2: '',
        bp_position: 'Sitting',
        bp_arm: 'Left',
        recorded_at: new Date().toISOString().slice(0, 16),
        remarks: ''
    });

    useEffect(() => {
        if (patient?.id) {
            loadVitals();
        }
    }, [patient]);

    const loadVitals = async () => {
        try {
            setLoading(true);
            const data = await getVitals(patient.id);
            setVitals(data);
        } catch (error) {
            console.error('Failed to load vitals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateBMI = (w, h) => {
        if (!w || !h || h === 0) return null;
        const heightM = h / 100;
        return (w / (heightM * heightM)).toFixed(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await storeVital({
                ...formData,
                patient_id: patient.id
            });
            setShowForm(false);
            loadVitals();
            // Reset form
            setFormData({
                weight_kg: '',
                height_cm: '',
                temp_c: '',
                bp_systolic: '',
                bp_diastolic: '',
                pulse_rate: '',
                resp_rate: '',
                spo2: '',
                bp_position: 'Sitting',
                bp_arm: 'Left',
                recorded_at: new Date().toISOString().slice(0, 16),
                remarks: ''
            });
        } catch (error) {
            console.error('Failed to save vitals:', error);
            const message = error.response?.data?.message || 'Failed to save vitals. Please check the inputs.';
            const errors = error.response?.data?.errors;
            if (errors) {
                const detailedError = Object.values(errors).flat().join('\n');
                await alert({
                    title: 'Validation Error',
                    message: detailedError
                });
            } else {
                await alert({
                    title: 'Clinical Data Error',
                    message: message
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            title: 'Delete Vital Record?',
            message: 'Are you sure you want to permanently remove this clinical vital record?',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;
        try {
            await deleteVital(id);
            loadVitals();
        } catch (error) {
            console.error('Failed to delete vital:', error);
        }
    };

    const getBPStatus = (sys, dia) => {
        if (!sys || !dia) return null;
        if (sys >= 140 || dia >= 90) return { label: 'Hypertensive', color: 'text-red-600 bg-red-50' };
        if (sys >= 120 || dia >= 80) return { label: 'Elevated', color: 'text-yellow-600 bg-yellow-50' };
        return { label: 'Normal', color: 'text-green-600 bg-green-50' };
    };

    const getPediatricStatus = (vital) => {
        if (!patient?.dob) return {};
        const ageInMonths = Math.floor((new Date() - new Date(patient.dob)) / (1000 * 60 * 60 * 24 * 30.44));
        
        const pr = vital.pulse_rate;
        const rr = vital.resp_rate;
        const status = {};

        if (ageInMonths <= 12) { // Infant
            status.pulse = (pr >= 90 && pr <= 160) ? { label: 'Normal', color: 'text-green-600' } : { label: 'Critical', color: 'text-rose-600 animate-pulse' };
            status.resp = (rr >= 30 && rr <= 60) ? { label: 'Normal', color: 'text-green-600' } : { label: 'Critical', color: 'text-rose-600 animate-pulse' };
        } else if (ageInMonths <= 60) { // Preschool
            status.pulse = (pr >= 80 && pr <= 140) ? { label: 'Normal', color: 'text-green-600' } : { label: 'Critical', color: 'text-rose-600 animate-pulse' };
            status.resp = (rr >= 24 && rr <= 40) ? { label: 'Normal', color: 'text-green-600' } : { label: 'Critical', color: 'text-rose-600 animate-pulse' };
        } else { // Standard Child/Adult
            status.pulse = (pr >= 60 && pr <= 100) ? { label: 'Normal', color: 'text-green-600' } : { label: 'Abnormal', color: 'text-amber-600' };
            status.resp = (rr >= 12 && rr <= 20) ? { label: 'Normal', color: 'text-green-600' } : { label: 'Abnormal', color: 'text-amber-600' };
        }
        return status;
    };

    const bmi = calculateBMI(formData.weight_kg, formData.height_cm);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="text-blue-600" />
                    Vitals & Triage History
                </h2>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {showForm ? <ChevronUp size={18} /> : <Plus size={18} />}
                    {showForm ? 'Cancel' : 'Record New Vitals'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                <Scale size={14} /> Weight (kg)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="weight_kg"
                                value={formData.weight_kg}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                <Ruler size={14} /> Height (cm)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="height_cm"
                                min="30"
                                max="300"
                                value={formData.height_cm}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.0"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">BMI (Auto)</label>
                            <div className="w-full bg-gray-50 border rounded-lg p-2 font-mono text-gray-700">
                                {bmi || '--'}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                <Thermometer size={14} /> Temp (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                name="temp_c"
                                value={formData.temp_c}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="36.5"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                <Activity size={14} /> BP (Systolic)
                            </label>
                            <input
                                type="number"
                                name="bp_systolic"
                                value={formData.bp_systolic}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="120"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                <Activity size={14} /> BP (Diastolic)
                            </label>
                            <input
                                type="number"
                                name="bp_diastolic"
                                value={formData.bp_diastolic}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="80"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                <Heart size={14} /> Pulse (bpm)
                            </label>
                            <input
                                type="number"
                                name="pulse_rate"
                                value={formData.pulse_rate}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="72"
                            />
                        </div>
                         <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                <Wind size={14} /> Resp (bpm)
                            </label>
                            <input
                                type="number"
                                name="resp_rate"
                                value={formData.resp_rate}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="16"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                                <Droplets size={14} /> SpO2 (%)
                            </label>
                            <input
                                type="number"
                                name="spo2"
                                value={formData.spo2}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="98"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Recorded At</label>
                            <input
                                type="datetime-local"
                                name="recorded_at"
                                value={formData.recorded_at}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Remarks/Notes</label>
                            <input
                                type="text"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Patient feels slightly dizzy"
                            />
                        </div>

                        <div className="md:col-span-4 flex justify-end gap-3 mt-2">
                            <button 
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : 'Save Vitals'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date/Time</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Weight/Height</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">BP (sys/dia)</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Pulse/Resp</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Temp/SpO2</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400">Loading history...</td>
                                </tr>
                            ) : vitals.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-10 text-center text-gray-400">No records found. Perform triage to see history.</td>
                                </tr>
                            ) : vitals.map((vital) => {
                                const bpInfo = getBPStatus(vital.bp_systolic, vital.bp_diastolic);
                                return (
                                    <tr key={vital.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {new Date(vital.recorded_at).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(vital.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{vital.weight_kg ? `${vital.weight_kg} kg` : '--'}</div>
                                            <div className="text-xs text-gray-500">{vital.height_cm ? `${vital.height_cm} cm` : '--'}</div>
                                            {vital.bmi && (
                                                <div className="text-[10px] font-bold text-blue-500">BMI: {vital.bmi}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">{vital.bp_systolic}/{vital.bp_diastolic}</span>
                                                {bpInfo && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${bpInfo.color}`}>
                                                        {bpInfo.label}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-gray-400 italic">Position: {vital.bp_position}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${getPediatricStatus(vital).pulse?.color || 'text-gray-900'}`}>{vital.pulse_rate ? `${vital.pulse_rate} bpm` : '--'}</span>
                                                    {getPediatricStatus(vital).pulse?.label === 'Critical' && <AlertCircle size={10} className="text-rose-600" />}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs ${getPediatricStatus(vital).resp?.color || 'text-gray-500'}`}>{vital.resp_rate ? `${vital.resp_rate} rpm` : '--'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm ${vital.temp_c > 37.5 ? 'text-orange-600 font-bold' : 'text-gray-900'}`}>
                                                {vital.temp_c ? `${vital.temp_c}°C` : '--'}
                                            </div>
                                            <div className={`text-xs ${vital.spo2 < 95 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                                {vital.spo2 ? `SpO2: ${vital.spo2}%` : '--'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">{vital.author?.name || 'System'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDelete(vital.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete Record"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VitalsManager;
