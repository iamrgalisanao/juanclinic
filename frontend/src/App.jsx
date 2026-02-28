import Card from './components/Card';
import { getPatients, getTenants, setTenantToken, getOrders, ingestHL7 } from './services/api';
import RegisterPatientForm from './components/RegisterPatientForm';
import Worklist from './components/Worklist';
import { useState, useEffect } from 'react';

function App() {
    const [patients, setPatients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [activeTenant, setActiveTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRegister, setShowRegister] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const tenantData = await getTenants();
                setTenants(tenantData);
                if (tenantData.length > 0) {
                    handleTenantChange(tenantData[0]);
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
            }
        };
        init();
    }, []);

    const handleTenantChange = async (tenant) => {
        setLoading(true);
        setActiveTenant(tenant);
        setTenantToken(tenant.id);
        try {
            const [patientData, orderData] = await Promise.all([
                getPatients(),
                getOrders()
            ]);
            setPatients(patientData);
            setOrders(orderData);
        } catch (err) {
            console.error("Failed to fetch tenant data", err);
            setPatients([]);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const onPatientAdded = (newPatient) => {
        setPatients([...patients, newPatient]);
        setShowRegister(false);
    };

    const handleSimulateHL7 = async () => {
        if (!activeTenant || patients.length === 0) return;
        const targetPatient = patients[0];
        const mockHL7 = `MSH|^~\\&|SENDING_APP|SENDING_FACILITY|RECEIVING_APP|RECEIVING_FACILITY|202602282241||ORM^O01|MSGID123|P|2.3\rPID|1||${targetPatient.patient_external_id}||${targetPatient.last_name}^${targetPatient.first_name}||${targetPatient.dob}|M\rOBR|1|ORDER123||LAB_CBC^Complete Blood Count|||202602282241||||||||||||||||||STAT`;

        setLoading(true);
        try {
            await ingestHL7(mockHL7);
            const orderData = await getOrders();
            setOrders(orderData);
            alert("HL7 Message Ingested & Order Created!");
        } catch (err) {
            console.error(err);
            alert("HL7 Simulation Failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black p-8 text-slate-100">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                            System Pilot <span className="text-blue-500">HIS</span>
                        </h1>
                        <p className="text-slate-400">Multi-Tenant Clinic Control Center</p>
                    </div>
                    <div className="flex gap-4">
                        <select
                            className="glass px-4 py-2 rounded-xl text-xs font-bold bg-transparent border-white/20 outline-none"
                            value={activeTenant?.id || ''}
                            onChange={(e) => handleTenantChange(tenants.find(t => t.id == e.target.value))}
                        >
                            {tenants.map(t => (
                                <option key={t.id} value={t.id} className="bg-slate-800">{t.name}</option>
                            ))}
                        </select>
                        <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold tracking-widest uppercase">
                                {activeTenant ? activeTenant.name : 'Resolving...'}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card title={`Worklist: ${activeTenant?.name || 'Loading...'}`}>
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Patient Registry</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-slate-500 text-sm border-b border-white/10">
                                                    <th className="pb-4 font-medium">Name</th>
                                                    <th className="pb-4 font-medium">External ID</th>
                                                    <th className="pb-4 font-medium">DOB</th>
                                                    <th className="pb-4 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {loading ? (
                                                    <tr><td colSpan="4" className="py-8 text-center text-slate-500">Syncing multi-tenant data...</td></tr>
                                                ) : patients.length === 0 ? (
                                                    <tr><td colSpan="4" className="py-8 text-center text-slate-500">No patients found.</td></tr>
                                                ) : patients.map(p => (
                                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="py-4 font-semibold">{p.first_name} {p.last_name}</td>
                                                        <td className="py-4 text-slate-400 text-sm">{p.patient_external_id || 'N/A'}</td>
                                                        <td className="py-4 text-slate-400 text-sm">{p.dob}</td>
                                                        <td className="py-4">
                                                            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                                                ISOLATED
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Clinical Orders</h3>
                                    <Worklist orders={orders} loading={loading} />
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        <Card title={showRegister ? "Register New Patient" : "Quick Actions"}>
                            {showRegister ? (
                                <RegisterPatientForm onPatientAdded={onPatientAdded} />
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={() => setShowRegister(true)}
                                        className="w-full py-4 glass hover:bg-emerald-500/20 transition-all rounded-2xl font-bold text-sm tracking-wide text-emerald-400 border border-emerald-500/20">
                                        + REGISTER PATIENT
                                    </button>
                                    <button
                                        onClick={handleSimulateHL7}
                                        className="w-full py-4 glass hover:bg-purple-500/20 transition-all rounded-2xl font-bold text-sm tracking-wide text-purple-400 border border-purple-500/20">
                                        SIMULATE HL7 INGEST
                                    </button>
                                    <button className="w-full py-4 glass hover:bg-blue-500/20 transition-all rounded-2xl font-bold text-sm tracking-wide text-blue-400 border border-blue-500/20">
                                        NEW CLINICAL ORDER
                                    </button>
                                </div>
                            )}
                        </Card>

                        <Card title="Tenant Configuration">
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Isolation Mode</p>
                                    <p className="text-sm font-medium text-emerald-400">Deterministic Tenant Scoping (Active)</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">HL7 Validation</p>
                                    <p className="text-sm font-medium text-blue-400">
                                        {activeTenant?.admin_settings?.['hl7.validation.level']?.toUpperCase() || 'STANDARD'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
