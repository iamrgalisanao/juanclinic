import React, { useState } from 'react';
import { registerPatient } from '../services/api';

const RegisterPatientForm = ({ onPatientAdded }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        dob: '',
        gender: 'M',
        patient_external_id: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newPatient = await registerPatient(formData);
            onPatientAdded(newPatient);
            setFormData({ first_name: '', last_name: '', dob: '', gender: 'M', patient_external_id: '' });
            alert("Patient registered successfully!");
        } catch (err) {
            console.error(err);
            alert("Registration failed. Please check logs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder="First Name"
                    className="glass p-3 rounded-xl bg-transparent outline-none border-white/10 text-sm"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    className="glass p-3 rounded-xl bg-transparent outline-none border-white/10 text-sm"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                />
            </div>
            <input
                type="date"
                className="w-full glass p-3 rounded-xl bg-transparent outline-none border-white/10 text-sm"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                required
            />
            <select
                className="w-full glass p-3 rounded-xl bg-transparent outline-none border-white/10 text-sm"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
                <option value="M" className="bg-slate-800">Male</option>
                <option value="F" className="bg-slate-800">Female</option>
                <option value="O" className="bg-slate-800">Other</option>
            </select>
            <input
                type="text"
                placeholder="External ID (Optional)"
                className="w-full glass p-3 rounded-xl bg-transparent outline-none border-white/10 text-sm"
                value={formData.patient_external_id}
                onChange={(e) => setFormData({ ...formData, patient_external_id: e.target.value })}
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
                {loading ? 'PROCESSING...' : 'COMPLETE REGISTRATION'}
            </button>
        </form>
    );
};

export default RegisterPatientForm;
