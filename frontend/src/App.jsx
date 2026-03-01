import React, { useState, useEffect } from 'react';
import { getPatients, getTenants, setTenantToken, getOrders, ingestHL7, updateOrder } from './services/api';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatCard from './components/StatCard';
import Worklist from './components/Worklist';
import RegisterPatientForm from './components/RegisterPatientForm';
import Reports from './components/Reports';
import Messages from './components/Messages';
import Appointments from './components/Appointments';

function App() {
    const [patients, setPatients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [activeTenant, setActiveTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [activeView, setActiveView] = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return ['dashboard', 'messages', 'message', 'appointments', 'appointment', 'patients', 'doctors', 'reports'].includes(hash) ? hash : 'dashboard';
    });

    // Hash sync: State -> URL
    useEffect(() => {
        window.location.hash = activeView;
    }, [activeView]);

    // Hash sync: URL -> State (Back/Forward buttons)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && hash !== activeView) {
                setActiveView(hash);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [activeView]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const tenantData = await getTenants();
            setTenants(tenantData);
            if (tenantData.length > 0) {
                handleTenantChange(tenantData[0]);
            }
        } catch (err) {
            console.error("Initialization failed", err);
        }
    };

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-900 scroll-smooth">
            <Sidebar activeTenant={activeTenant} activeView={activeView} setActiveView={setActiveView} />

            <main className="flex-1 ml-64 min-w-0">
                <TopBar
                    activeTenant={activeTenant}
                    tenants={tenants}
                    onTenantChange={handleTenantChange}
                />

                <div className="p-10 space-y-10 max-w-[1600px] mx-auto">
                    {/* Modern View Router */}
                    {(() => {
                        switch (activeView) {
                            case 'dashboard':
                                return (
                                    <>
                                        {/* Welcome Header */}
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
                                                <p className="text-sm font-bold text-slate-400 mt-2">Welcome back, <span className="text-his-green-500">Admin</span>. Here's what's happening today.</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={handleSimulateHL7} className="px-6 py-3 bg-white text-purple-600 text-xs font-black rounded-2xl hover:bg-purple-50 transition-all uppercase tracking-widest border border-purple-100 shadow-sm flex items-center gap-2 group">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse group-hover:bg-purple-600" />
                                                    Ingest HL7
                                                </button>
                                                <button onClick={() => setShowRegister(true)} className="px-6 py-3 bg-his-green-500 text-white text-xs font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                                    New Patient
                                                </button>
                                            </div>
                                        </div>

                                        {/* Stats Bar */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                            <StatCard
                                                title="Total Patients"
                                                value={patients.length}
                                                percentage="10.2"
                                                isUp={true}
                                                icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                colorClass="bg-blue-50 text-blue-500"
                                            />
                                            <StatCard
                                                title="Active Orders"
                                                value={orders.length}
                                                percentage="2.4"
                                                isUp={false}
                                                icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                                colorClass="bg-purple-50 text-purple-500"
                                            />
                                            <StatCard
                                                title="Available Doctors"
                                                value="84"
                                                percentage="8.3"
                                                isUp={true}
                                                icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                colorClass="bg-his-green-50 text-his-green-500"
                                            />
                                            <StatCard
                                                title="Total Invoices"
                                                value="$1,234"
                                                percentage="5.1"
                                                isUp={true}
                                                icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                colorClass="bg-orange-50 text-orange-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                                            <div className="xl:col-span-2 space-y-10">
                                                {/* Patient Registry Section */}
                                                <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 hover:shadow-2xl hover:shadow-his-slate-200/40 transition-all duration-500">
                                                    <div className="flex justify-between items-center mb-10">
                                                        <div>
                                                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Patient Registry</h2>
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Managing data for {activeTenant?.name}</p>
                                                        </div>
                                                        <button className="text-[10px] font-black text-his-green-500 uppercase tracking-widest border-b-2 border-his-green-500/10 pb-1 hover:border-his-green-500 transition-all">
                                                            View All Patients
                                                        </button>
                                                    </div>

                                                    <div className="overflow-x-auto -mx-10 px-10">
                                                        <table className="w-full text-left border-separate border-spacing-0">
                                                            <thead>
                                                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                                                    <th className="pb-6 pl-2">Patient Details</th>
                                                                    <th className="pb-6">Gender</th>
                                                                    <th className="pb-6">DOB</th>
                                                                    <th className="pb-6">ID System</th>
                                                                    <th className="pb-6 text-right pr-2">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-50">
                                                                {patients.map(p => (
                                                                    <tr key={p.id} className="group hover:bg-his-slate-100/30 transition-all duration-300 cursor-pointer">
                                                                        <td className="py-6 pl-2">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-12 h-12 rounded-2xl bg-his-slate-100 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-his-green-50 group-hover:text-his-green-500 transition-colors duration-300">
                                                                                    {p.first_name[0]}{p.last_name[0]}
                                                                                </div>
                                                                                <div>
                                                                                    <p className="font-black text-sm text-slate-900 leading-tight">{p.first_name} {p.last_name}</p>
                                                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Medical Record</p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-6 text-xs text-slate-500 font-bold uppercase tracking-widest">{p.gender === 'M' ? 'Male' : 'Female'}</td>
                                                                        <td className="py-6 text-xs text-slate-500 font-bold uppercase tracking-widest">{p.dob}</td>
                                                                        <td className="py-6">
                                                                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-his-slate-50 px-2 py-1 rounded-md border border-slate-100 italic">
                                                                                {p.patient_external_id}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-6 text-right pr-2">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active</span>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Clinical Worklist Section */}
                                                <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100 hover:shadow-2xl hover:shadow-his-slate-200/40 transition-all duration-500">
                                                    <div className="flex justify-between items-center mb-10">
                                                        <div>
                                                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Clinical Worklist</h2>
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Real-time HL7 Feed</p>
                                                        </div>
                                                        <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-his-green-50 hover:text-his-green-500 transition-all">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                        </button>
                                                    </div>
                                                    <Worklist
                                                        orders={orders}
                                                        loading={loading}
                                                        onStatusUpdate={async (id, status) => {
                                                            await updateOrder(id, { status });
                                                            const orderData = await getOrders();
                                                            setOrders(orderData);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Recent Activity / Side Panel */}
                                            <div className="space-y-10">
                                                <div className="bg-white rounded-[2.5rem] p-10 shadow-sleek border border-his-slate-100">
                                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 border-b border-his-slate-50 pb-6 flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-his-green-500" />
                                                        Recent Activity
                                                    </h3>
                                                    <div className="space-y-10 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-his-slate-50">
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div key={i} className="flex gap-6 relative z-10 transition-transform hover:translate-x-1 cursor-default group">
                                                                <div className="w-4 h-4 rounded-full bg-white border-4 border-his-green-500 shrink-0 group-hover:bg-his-green-500 transition-colors" />
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900 leading-tight">New clinical order received</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">2 mins ago • LAB-00{i}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button className="w-full mt-10 py-5 bg-his-slate-100/50 text-slate-500 text-[10px] font-black rounded-2xl hover:bg-his-slate-100 hover:text-slate-900 transition-all uppercase tracking-widest border border-transparent hover:border-his-slate-200">
                                                        Full Audit History
                                                    </button>
                                                </div>

                                                {activeTenant && (
                                                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                                            </svg>
                                                        </div>
                                                        <div className="relative z-10">
                                                            <div className="flex items-center gap-2 mb-6">
                                                                <div className="w-2 h-2 rounded-full bg-his-green-500 animate-pulse" />
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-his-green-500">Security Active</span>
                                                            </div>
                                                            <h3 className="text-2xl font-black leading-tight mb-4">Multi-Tenant<br />Isolation</h3>
                                                            <p className="text-xs text-slate-400 font-bold leading-relaxed mb-10">All clinical data is strictly cryptographically isolated for {activeTenant.name}.</p>
                                                            <div className="flex -space-x-3">
                                                                {[1, 2, 3, 4].map(i => (
                                                                    <div key={i} className="w-10 h-10 rounded-2xl border-4 border-slate-900 overflow-hidden shadow-xl">
                                                                        <img src={`https://ui-avatars.com/api/?name=User${i}&background=334155&color=fff`} className="w-full h-full object-cover" />
                                                                    </div>
                                                                ))}
                                                                <div className="w-10 h-10 rounded-2xl border-4 border-slate-900 bg-his-green-500 flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                                                                    +12
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                );
                            case 'reports':
                                return <Reports />;
                            case 'messages':
                            case 'message':
                                return <Messages />;
                            case 'appointments':
                            case 'appointment':
                                return <Appointments activeTenant={activeTenant} />;
                            default:
                                return (
                                    <div className="flex items-center justify-center p-20 bg-white rounded-[2.5rem] border border-his-slate-100 shadow-sleek">
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-his-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Component in Development</h3>
                                            <p className="text-sm font-bold text-slate-400 mt-2">The {activeView} module is being initialized according to the HIS SOPs.</p>
                                        </div>
                                    </div>
                                );
                        }
                    })()}
                </div>
            </main>

            {/* Registration Modal - Integrated with Multi-step Stepper */}
            {showRegister && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300">
                    <div className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={() => setShowRegister(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-his-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all group">
                                <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <RegisterPatientForm onPatientAdded={onPatientAdded} onClose={() => setShowRegister(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
