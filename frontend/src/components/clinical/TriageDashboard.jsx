import React, { useState, useEffect } from 'react';
import { 
    Activity, 
    Thermometer, 
    Wind, 
    Heart, 
    Scale, 
    Ruler, 
    AlertCircle, 
    Save, 
    History,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Droplet,
    Dna
} from 'lucide-react';
import api, { storeVital } from '../../services/api';

const TriageDashboard = ({ patientId, onVitalSaved }) => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [formData, setFormData] = useState({
        weight_kg: '',
        height_cm: '',
        temp_c: '',
        bp_systolic: '',
        bp_diastolic: '',
        pulse_rate: '',
        resp_rate: '',
        spo2: '',
        pain_score: 0,
        blood_glucose_mgdl: '',
        head_circumference_cm: '',
        oxygen_source: 'Room Air',
        bp_position: 'Sitting',
        bp_arm: 'Left',
        remarks: '',
        recorded_at: new Date().toISOString().slice(0, 16)
    });

    const [bmi, setBmi] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [patientId]);

    useEffect(() => {
        if (formData.weight_kg && formData.height_cm) {
            const hpd = formData.height_cm / 100;
            const res = (formData.weight_kg / (hpd * hpd)).toFixed(2);
            setBmi(res);
        } else {
            setBmi(null);
        }
    }, [formData.weight_kg, formData.height_cm]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/patients/${patientId}/vitals`);
            setHistory(res.data.data);
            if (res.data.data.length > 0) {
                setStats(res.data.data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch vitals history", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, patient_id: patientId };
            const res = await storeVital(payload);
            const newVital = res.vital;
            setHistory([newVital, ...history]);
            setStats(newVital);
            if (onVitalSaved) onVitalSaved(newVital);
            // Clear specific fields but keep metadata
            setFormData(prev => ({
                ...prev,
                weight_kg: '',
                height_cm: '',
                temp_c: '',
                bp_systolic: '',
                bp_diastolic: '',
                pulse_rate: '',
                resp_rate: '',
                spo2: '',
                pain_score: '0',
                blood_glucose_mgdl: '',
                head_circumference_cm: '',
                remarks: '',
                recorded_at: new Date().toISOString().slice(0, 16)
            }));
        } catch (err) {
            console.error("Failed to save vitals", err);
        } finally {
            setLoading(false);
        }
    };

    const getBmiCategory = (v) => {
        if (!v) return null;
        if (v < 18.5) return { label: 'Underweight', color: 'text-amber-500' };
        if (v < 25) return { label: 'Normal', color: 'text-his-green-500' };
        if (v < 30) return { label: 'Overweight', color: 'text-orange-500' };
        return { label: 'Obese', color: 'text-red-500' };
    };

    return (
        <div className="flex gap-8 px-4 py-6 h-full overflow-hidden bg-his-slate-50/30">
            {/* Triage Form (Nurse Mode) */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Triage</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Universal Vitals Capture</p>
                    </div>
                    <div className="bg-his-green-50 px-4 py-2 rounded-2xl border border-his-green-100 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-his-green-600" />
                        <span className="text-[10px] font-black text-his-green-700 uppercase">Tenant 1 Branch Verified</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Primary Physical Metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Scale size={14} className="text-blue-500" /> Weight (kg)
                            </label>
                            <input 
                                name="weight_kg" value={formData.weight_kg} onChange={handleInputChange} type="number" step="0.01" 
                                className="w-full text-3xl font-black text-slate-800 outline-none bg-transparent" placeholder="0.00"
                            />
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Ruler size={14} className="text-his-green-500" /> Height (cm)
                            </label>
                            <input 
                                name="height_cm" value={formData.height_cm} onChange={handleInputChange} type="number" step="0.1" 
                                className="w-full text-3xl font-black text-slate-800 outline-none bg-transparent" placeholder="0.0"
                            />
                        </div>
                        <div className="bg-his-green-50/50 p-6 rounded-[2rem] border-2 border-dashed border-his-green-200 space-y-3 flex flex-col justify-center">
                            <label className="text-[10px] font-black text-his-green-600 uppercase tracking-widest">Body Mass Index</label>
                            <div>
                                <span className="text-3xl font-black text-his-green-700">{bmi || '--.--'}</span>
                                {bmi && <p className={`text-[10px] font-bold ${getBmiCategory(bmi)?.color} mt-1`}>{getBmiCategory(bmi)?.label}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Cardiovascular & Respiratory */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-4 gap-8">
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Activity size={14} className="text-rose-500" /> Blood Pressure
                            </label>
                            <div className="flex items-center gap-2">
                                <input name="bp_systolic" value={formData.bp_systolic} onChange={handleInputChange} placeholder="SYS" className="w-16 text-2xl font-black text-slate-800 outline-none" />
                                <span className="text-2xl font-bold text-slate-200">/</span>
                                <input name="bp_diastolic" value={formData.bp_diastolic} onChange={handleInputChange} placeholder="DIA" className="w-16 text-2xl font-black text-slate-800 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Heart size={14} className="text-rose-400" /> Pulse (bpm)
                            </label>
                            <input name="pulse_rate" value={formData.pulse_rate} onChange={handleInputChange} type="number" className="w-full text-2xl font-black text-slate-800 outline-none" placeholder="72" />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Wind size={14} className="text-sky-500" /> Respiration
                            </label>
                            <input name="resp_rate" value={formData.resp_rate} onChange={handleInputChange} type="number" className="w-full text-2xl font-black text-slate-800 outline-none" placeholder="18" />
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Droplet size={14} className="text-sky-400" /> SpO2 (%)
                            </label>
                            <input name="spo2" value={formData.spo2} onChange={handleInputChange} type="number" className="w-full text-2xl font-black text-slate-800 outline-none" placeholder="98" />
                        </div>
                    </div>

                    {/* Clinical Specialties */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Thermometer size={14} className="text-orange-500" /> Temp (°C)
                                </label>
                                <input name="temp_c" value={formData.temp_c} onChange={handleInputChange} type="number" step="0.1" className="text-2xl font-black text-slate-800 outline-none" placeholder="36.5" />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pain Scale (0-10)</label>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                        formData.pain_score >= 7 ? 'bg-rose-100 text-rose-600' :
                                        formData.pain_score >= 4 ? 'bg-amber-100 text-amber-600' :
                                        'bg-his-green-100 text-his-green-600'
                                    }`}>
                                        {formData.pain_score == 0 ? 'No Pain' : 
                                         formData.pain_score <= 3 ? 'Mild' :
                                         formData.pain_score <= 6 ? 'Moderate' : 
                                         formData.pain_score <= 9 ? 'Severe' : 'Worst Possible'}
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" max="10" 
                                    value={formData.pain_score}
                                    onChange={(e) => setFormData({...formData, pain_score: parseInt(e.target.value)})}
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-his-green-500"
                                />
                                <div className="flex justify-between px-2 text-[8px] font-black text-slate-300 uppercase">
                                    <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-6 rounded-[2rem] shadow-xl space-y-4">
                            <div className="flex justify-between items-start">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Dna size={14} className="text-his-green-400" /> Specialized Capture
                                </label>
                                <span className="text-[8px] font-black text-slate-500 uppercase px-2 py-1 bg-white/5 rounded-lg border border-white/10">Clinical Context</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Blood Glucose (mg/dL)</p>
                                    <input name="blood_glucose_mgdl" value={formData.blood_glucose_mgdl} onChange={handleInputChange} type="number" className="w-full bg-transparent text-xl font-black text-white outline-none" placeholder="85" />
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Head Circ. (cm)</p>
                                    <input name="head_circumference_cm" value={formData.head_circumference_cm} onChange={handleInputChange} type="number" step="0.1" className="w-full bg-transparent text-xl font-black text-his-green-400 outline-none" placeholder="34.5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                         <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Oxygen Source</label>
                             <select name="oxygen_source" value={formData.oxygen_source} onChange={handleInputChange} className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none">
                                <option value="Room Air">Room Air</option>
                                <option value="Nasal Cannula">Nasal Cannula</option>
                                <option value="Face Mask">Face Mask</option>
                                <option value="CPAP">CPAP/BiPAP</option>
                             </select>
                         </div>
                         <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BP Position</label>
                             <select name="bp_position" value={formData.bp_position} onChange={handleInputChange} className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none">
                                <option value="Sitting">Sitting</option>
                                <option value="Standing">Standing</option>
                                <option value="Supine">Supine (Lying Down)</option>
                             </select>
                         </div>
                         <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Record Time</label>
                             <input type="datetime-local" name="recorded_at" value={formData.recorded_at} onChange={handleInputChange} className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none" />
                         </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-his-green-500 hover:bg-his-green-600 disabled:bg-slate-200 text-white font-black uppercase text-sm p-6 rounded-3xl transition-all shadow-xl shadow-his-green-500/20 flex items-center justify-center gap-3"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Save size={18} />
                                Commit Triage to Patient Record
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Vitals History & Trends */}
            <div className="w-[380px] space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-500">
                        <History size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Historical Trends</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Clinical Baseline Data</p>
                    </div>

                    {stats ? (
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Avg Blood Pressure</p>
                                <p className="text-lg font-black text-slate-700 mt-1">{stats.bp_systolic}/{stats.bp_diastolic}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Latest Temp</p>
                                <p className="text-lg font-black text-orange-500 mt-1">{stats.temp_c}°C</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm font-bold text-slate-300 py-4 italic">No trend data available yet</p>
                    )}
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Encounter Timeline</h4>
                        <span className="text-[8px] font-bold text-slate-400 px-2 py-1 bg-slate-50 rounded-lg uppercase">Recent 5</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-3">
                        {history.length > 0 ? history.map((vital, idx) => (
                            <div key={vital.id} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all flex items-center justify-between group">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-700">{vital.bp_systolic}/{vital.bp_diastolic} mmHg</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                        {new Date(vital.recorded_at).toLocaleDateString()} at {new Date(vital.recorded_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-his-green-600">{vital.weight_kg}kg</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">{vital.temp_c}°C</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-40 flex flex-col items-center justify-center text-slate-300">
                                <AlertCircle size={24} className="mb-2 opacity-50" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No entries recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TriageDashboard;
