import React from 'react';
import { 
    Activity, 
    Calendar, 
    Clipboard, 
    Thermometer, 
    Droplets, 
    FileText,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';

const PatientChronicle = ({ data }) => {
    if (!data) return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Clipboard className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">No clinical data found for this patient.</p>
        </div>
    );

    const { vitals = [], orders = [], appointments = [], prescriptions = [] } = data;

    // Sort all events by date to create a unified timeline if needed
    // But here we show a dashboard-style summary "The Chronicle"

    const latestVitals = vitals[0] || {};
    const recentOrders = orders.slice(0, 5);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    Unified Clinical Chronicle
                </h3>
                <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                        <Search className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Vitals Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-rose-50 rounded-lg">
                        <Droplets className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Blood Pressure</p>
                        <p className="text-lg font-bold text-slate-800">
                            {latestVitals.bp_systolic ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` : '--/--'}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg">
                        <Thermometer className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Temperature</p>
                        <p className="text-lg font-bold text-slate-800">
                            {latestVitals.temp_c ? `${latestVitals.temp_c}°C` : '--'}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Heart Rate</p>
                        <p className="text-lg font-bold text-slate-800">
                            {latestVitals.pulse_rate ? `${latestVitals.pulse_rate} bpm` : '--'}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-lg">
                        <Droplets className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Oxygen Sat.</p>
                        <p className="text-lg font-bold text-slate-800">
                            {latestVitals.spo2 ? `${latestVitals.spo2}%` : '--'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Longitudinal Narrative / Timeline */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <h4 className="font-medium text-slate-700 flex items-center gap-2">
                                <Clipboard className="w-4 h-4 text-emerald-500" />
                                Clinical Milestones
                            </h4>
                            <span className="text-xs text-slate-400 font-mono">LATEST 5 ENTRIES</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {recentOrders.length > 0 ? recentOrders.map((order, idx) => (
                                <div key={order.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 cursor-pointer group">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${order.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-amber-400 pulse'}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {order.order_type === 'LAB' ? 'Laboratory Study' : 'Radiology Examination'}
                                            </p>
                                            <span className="text-[10px] font-mono text-slate-400">
                                                {new Date(order.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {JSON.stringify(order.request_details)}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            )) : (
                                <div className="p-8 text-center text-slate-400 italic text-sm">
                                    No recent clinical orders.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidecar: Appointments & Prescriptions */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            Next Appointment
                        </h4>
                        {appointments.filter(a => new Date(a.date) >= new Date()).length > 0 ? (
                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">UPCOMING</p>
                                <p className="text-sm font-bold text-slate-800">
                                    {new Date(appointments[0].date).toLocaleDateString()} at {appointments[0].time}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{appointments[0].reason}</p>
                            </div>
                        ) : (
                            <div className="text-center p-4 py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-xs text-slate-400">No scheduled visits</p>
                                <button className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700">SCHEDULE NOW</button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-rose-500" />
                            Active Prescriptions
                        </h4>
                        <div className="space-y-3">
                            {prescriptions.length > 0 ? prescriptions.slice(0, 3).map(p => (
                                <div key={p.id} className="flex flex-col gap-1 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                                    <p className="text-xs font-bold text-slate-700 uppercase">{p.medicine_name}</p>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-500">{p.dosage} — {p.frequency}</span>
                                        <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase">ACTIVE</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-400 italic">No active prescriptions</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientChronicle;
