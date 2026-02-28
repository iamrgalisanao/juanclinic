import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    User,
    MoreVertical,
    CheckCircle2,
    Timer,
    X,
    Activity,
    Stethoscope,
    FlaskConical
} from 'lucide-react';

const Appointments = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - baseDate.getDay()); // Start of this week

    // UI State
    const [showModal, setShowModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMonth, setPickerMonth] = useState(currentDate.getMonth());
    const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());
    const [pickerWeek, setPickerWeek] = useState('');

    const [editingAppt, setEditingAppt] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [draggedApptId, setDraggedApptId] = useState(null);

    // Mock Data State -> DB State
    const [appointments, setAppointments] = useState([]);
    const [patientsList, setPatientsList] = useState([]);

    const API_URL = 'http://localhost:8000/api';
    const HEADERS = { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Tenant-ID': 1 };

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`${API_URL}/appointments`, { headers: HEADERS });
            if (res.ok) {
                const data = await res.json();
                setAppointments(data.map(dbA => ({
                    id: dbA.id,
                    patient_id: dbA.patient_id,
                    patient: dbA.patient ? `${dbA.patient.first_name} ${dbA.patient.last_name}` : 'Unknown Patient',
                    doctor_id: dbA.doctor_id,
                    doctor: dbA.notes || '', // Store doctor name in notes for MVP mock
                    date: dbA.appointment_date.split('T')[0],
                    hour: parseInt(dbA.start_time.split(':')[0], 10),
                    type: dbA.visit_type,
                    status: dbA.status
                })));
            }
        } catch (err) { console.error('Failed to fetch appointments', err); }
    };

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await fetch(`${API_URL}/patients`, { headers: HEADERS });
                if (res.ok) {
                    const data = await res.json();
                    setPatientsList(data);
                }
            } catch (err) { console.error('Failed to fetch patients', err); }
        };

        fetchPatients();
        fetchAppointments();
    }, []);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

    // --- Date Navigation Logic ---
    const getStartOfWeek = (date) => {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay());
        start.setHours(0, 0, 0, 0);
        return start;
    };

    const startOfWeek = getStartOfWeek(currentDate);
    const weekDates = days.map((_, idx) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + idx);
        return date;
    });

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const handleDatePickerApply = (e) => {
        e.preventDefault();
        const year = parseInt(pickerYear, 10);

        if (pickerWeek) {
            const week = parseInt(pickerWeek, 10);
            const monthStr = parseInt(pickerMonth, 10);
            const firstDayOfMonth = new Date(year, monthStr, 1);
            const daysToWeek = (week - 1) * 7;
            const targetDate = new Date(year, monthStr, 1 + daysToWeek - firstDayOfMonth.getDay());
            setCurrentDate(targetDate);
        } else {
            const month = parseInt(pickerMonth, 10);
            setCurrentDate(new Date(year, month, 1));
        }
        setShowDatePicker(false);
        setPickerWeek('');
    };

    const getWeekOfMonth = (date) => {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const pastDaysOfMonth = date.getDate() - 1;
        return Math.ceil((pastDaysOfMonth + firstDayOfMonth.getDay() + 1) / 7) || 1;
    };

    // --- Styling Helpers ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-rose-100'; // light pink
            case 'IN_PROGRESS': return 'bg-orange-50'; // light yellow/orange
            case 'SCHEDULED': return 'bg-his-green-100/60'; // light green
            default: return 'bg-slate-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="w-3 h-3" />;
            case 'IN_PROGRESS': return <Timer className="w-3 h-3" />;
            case 'SCHEDULED': return <Clock className="w-3 h-3" />;
            default: return null;
        }
    };

    const formatHour = (hour) => {
        return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
    };

    const formatHourRange = (hour) => {
        const start = hour > 12 ? hour - 12 : hour;
        const startSuffix = hour >= 12 ? 'PM' : 'AM';
        const nextHour = hour + 1;
        const end = nextHour > 12 ? nextHour - 12 : nextHour;
        const endSuffix = nextHour >= 12 ? 'PM' : 'AM';

        if (startSuffix === endSuffix) {
            return `${start}-${end} ${startSuffix}`;
        } else {
            return `${start} ${startSuffix} - ${end} ${endSuffix}`;
        }
    };

    // --- Drag and Drop Logic ---
    const handleDragStart = (e, appt) => {
        e.dataTransfer.setData('apptId', appt.id.toString());
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => setDraggedApptId(appt.id), 0); // Hide original immediately while dragging clone
    };

    const handleDragEnd = () => {
        setDraggedApptId(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, dropDateStr, dropHour) => {
        e.preventDefault();
        const apptId = parseInt(e.dataTransfer.getData('apptId'), 10);

        try {
            await fetch(`${API_URL}/appointments/${apptId}`, {
                method: 'PUT',
                headers: HEADERS,
                body: JSON.stringify({
                    appointment_date: dropDateStr,
                    start_time: `${String(dropHour).padStart(2, '0')}:00:00`,
                    end_time: `${String(dropHour + 1).padStart(2, '0')}:00:00`
                })
            });
            fetchAppointments();
        } catch (err) { console.error("Failed to move appointment", err); }

        setDraggedApptId(null);
    };

    // --- Click Handlers ---
    const handleSlotClick = (dateStr, hour) => {
        setSelectedSlot({ date: dateStr, hour });
        setEditingAppt(null); // Reset edit state
        setShowModal(true);
    };

    const handleApptClick = (e, appt) => {
        e.stopPropagation(); // prevent triggering the slot click underneath
        setEditingAppt(appt);
        setSelectedSlot(null);
        setShowModal(true);
    };

    const handleNewBooking = () => {
        setSelectedSlot(null);
        setEditingAppt(null);
        setShowModal(true);
    };

    const handleModalSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const payload = {
            patient_id: formData.get('patient_id'),
            notes: formData.get('doctorName'), // mock doctor_name via notes mapping
            visit_type: formData.get('type'),
            status: formData.get('status'),
            appointment_date: formData.get('date'),
            start_time: `${String(formData.get('hour')).padStart(2, '0')}:00:00`,
            end_time: `${String(parseInt(formData.get('hour'), 10) + 1).padStart(2, '0')}:00:00`
        };

        try {
            if (editingAppt) {
                await fetch(`${API_URL}/appointments/${editingAppt.id}`, {
                    method: 'PUT',
                    headers: HEADERS,
                    body: JSON.stringify(payload)
                });
            } else {
                await fetch(`${API_URL}/appointments`, {
                    method: 'POST',
                    headers: HEADERS,
                    body: JSON.stringify(payload)
                });
            }
            fetchAppointments();
        } catch (err) { console.error("Failed to save appointment", err); }

        setShowModal(false);
    };

    const handleDelete = async () => {
        if (!editingAppt) return;
        try {
            await fetch(`${API_URL}/appointments/${editingAppt.id}`, {
                method: 'DELETE',
                headers: HEADERS
            });
            fetchAppointments();
        } catch (err) { console.error("Failed to delete appointment", err); }
        setShowModal(false);
    };

    return (
        <div className="p-6 space-y-6 animate-fade-in relative z-0">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Drag and Drop Scheduling</p>
                </div>
                <button
                    onClick={handleNewBooking}
                    className="flex items-center gap-2 bg-his-green-500 hover:bg-his-green-600 active:scale-95 text-white px-5 py-2.5 rounded-2xl font-black text-sm transition-all shadow-xl shadow-his-green-500/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Book Appointment</span>
                </button>
            </div>

            {/* Calendar Grid Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden select-none">
                {/* Calendar Nav */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all select-none group"
                            onDoubleClick={() => {
                                setPickerMonth(currentDate.getMonth());
                                setPickerYear(currentDate.getFullYear());
                                setPickerWeek(getWeekOfMonth(currentDate));
                                setShowDatePicker(true);
                            }}
                            title="Double click to quickly select month or week"
                        >
                            <h2 className="text-lg font-black text-slate-900 group-hover:text-his-green-600 transition-colors">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-2 py-0.5 rounded-lg">Wk {getWeekOfMonth(currentDate)}</span>
                        </div>
                        <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                            <button onClick={handlePrevWeek} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-900"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={handleNextWeek} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-900"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Schedule View Grid */}
                <div className="grid grid-cols-8 divide-x divide-slate-100 bg-white">
                    {/* Time Column */}
                    <div className="col-span-1 border-b border-slate-100 bg-slate-50/30">
                        <div className="h-14 border-b border-slate-100 flex items-center justify-center font-black uppercase text-slate-300 text-xs tracking-widest">TIME</div>
                        {hours.map(hour => (
                            <div key={`label-${hour}`} className="h-24 p-2 text-right pr-4 flex items-center justify-end text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-widest">
                                {formatHour(hour)}
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {days.map((day, dayIdx) => {
                        const dateObj = weekDates[dayIdx];
                        const dateNum = dateObj.getDate();
                        const isToday = new Date().toDateString() === dateObj.toDateString();

                        return (
                            <div key={day} className="col-span-1 border-b border-slate-100">
                                {/* Day Header */}
                                <div className={`h-14 border-b border-slate-100 flex flex-col items-center justify-center ${isToday ? 'bg-his-green-50/50' : ''}`}>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{day}</span>
                                    <span className={`text-xl font-black ${isToday ? 'text-his-green-600' : 'text-slate-900'}`}>{dateNum}</span>
                                </div>

                                {/* Time Slots for the Day */}
                                {hours.map(hour => {
                                    const slotDateStr = formatDate(weekDates[dayIdx]);
                                    // Find appointment(s) for this slot
                                    const slotAppointments = appointments.filter(a => a.date === slotDateStr && a.hour === hour);
                                    return (
                                        <div
                                            key={`${day}-${hour}`}
                                            className="h-24 border-b border-slate-100 relative p-1.5 transition-colors hover:bg-slate-50/50 cursor-crosshair group flex flex-col gap-1.5 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, slotDateStr, hour)}
                                            onClick={(e) => {
                                                // Only trigger if clicking exactly on the slot bg, not the cards
                                                if (e.target === e.currentTarget || e.target.id === 'slot-hover-target') {
                                                    handleSlotClick(slotDateStr, hour);
                                                }
                                            }}
                                        >
                                            {/* Hover Overlay indicating click to add */}
                                            <div id="slot-hover-target" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                <Plus className="w-4 h-4 text-slate-300" />
                                            </div>

                                            {/* Render Appointments */}
                                            {slotAppointments.map(appt => (
                                                <div
                                                    key={appt.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, appt)}
                                                    onDragEnd={handleDragEnd}
                                                    onClick={(e) => handleApptClick(e, appt)}
                                                    className={`relative w-full shrink-0 px-2 py-1.5 rounded-sm cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] hover:z-20 z-10 ${getStatusColor(appt.status)} ${draggedApptId === appt.id ? 'opacity-40 scale-95 border-2 border-dashed border-slate-400' : 'opacity-100'}`}
                                                >
                                                    <p className="text-[10px] font-black leading-tight text-slate-800">{formatHourRange(appt.hour)}</p>
                                                    <p className="text-[11px] font-medium opacity-60 leading-tight truncate text-slate-800 mt-0.5">{appt.patient}</p>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Appointment Booking / Editing Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 cursor-default">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden animate-slide-up">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-his-green-50 text-his-green-500 flex items-center justify-center shadow-inner">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">{editingAppt ? 'Edit Appointment' : 'Book Appointment'}</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                        {editingAppt ? 'Modify Schedule Details' : 'Allocate New Time Slot'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={handleModalSave} className="p-8 space-y-6">

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <User className="w-3 h-3 text-his-green-500" /> Patient Name
                                    </label>
                                    <select
                                        name="patient_id"
                                        required
                                        defaultValue={editingAppt?.patient_id || ''}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="" disabled>Select a Patient</option>
                                        {patientsList.map(p => (
                                            <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.patient_external_id || 'NEW'})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Stethoscope className="w-3 h-3 text-blue-500" /> Assigner / Doctor
                                    </label>
                                    <input
                                        type="text"
                                        name="doctorName"
                                        required
                                        defaultValue={editingAppt?.doctor || ''}
                                        placeholder="e.g. Dr. Connor"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none placeholder:font-medium placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                                    <select
                                        name="date"
                                        required
                                        defaultValue={editingAppt ? editingAppt.date : (selectedSlot ? selectedSlot.date : formatDate(weekDates[3] || new Date()))}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 transition-all outline-none appearance-none"
                                    >
                                        {weekDates.map((dateObj, i) => (
                                            <option key={i} value={formatDate(dateObj)}>{days[i]} ({dateObj.getDate()})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Segment</label>
                                    <select
                                        name="hour"
                                        required
                                        defaultValue={editingAppt ? editingAppt.hour : (selectedSlot ? selectedSlot.hour : 9)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 focus:ring-4 focus:ring-his-green-500/10 focus:border-his-green-500 transition-all outline-none appearance-none"
                                    >
                                        {hours.map(h => (
                                            <option key={h} value={h}>{formatHour(h)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-purple-500" /> Visit Type
                                    </label>
                                    <select
                                        name="type"
                                        required
                                        defaultValue={editingAppt?.type || 'Consultation'}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="Consultation">Consultation</option>
                                        <option value="Follow-up">Follow-up</option>
                                        <option value="Lab Test">Lab Test</option>
                                        <option value="Imaging">Imaging</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-amber-500" /> Status
                                    </label>
                                    <select
                                        name="status"
                                        required
                                        defaultValue={editingAppt?.status || 'SCHEDULED'}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="SCHEDULED">Scheduled</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                                {editingAppt ? (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="px-6 py-3 text-xs font-black rounded-xl text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest"
                                    >
                                        Cancel Appt
                                    </button>
                                ) : (
                                    <div /> /* Spacer */
                                )}
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 bg-slate-100 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest shadow-sm"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-his-green-500 text-white text-xs font-black rounded-xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 active:scale-95 flex items-center gap-2"
                                    >
                                        {editingAppt ? 'Save Changes' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Fast Navigation Modal */}
            {showDatePicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden animate-slide-up">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-900">Jump to Date</h2>
                            <button
                                onClick={() => setShowDatePicker(false)}
                                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleDatePickerApply} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Select Year</label>
                                    <select
                                        value={pickerYear} onChange={(e) => setPickerYear(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 outline-none"
                                    >
                                        {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Select Month</label>
                                    <select
                                        value={pickerMonth} onChange={(e) => {
                                            setPickerMonth(e.target.value);
                                            setPickerWeek(''); // Clear week if choosing month
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 outline-none"
                                    >
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                            <option key={i} value={i}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="border-t border-slate-100 pt-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Specific Week of Month</label>
                                    <input
                                        type="number"
                                        min="1" max="6"
                                        value={pickerWeek} onChange={(e) => setPickerWeek(e.target.value)}
                                        placeholder="Week 1-6"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 outline-none placeholder:font-medium placeholder:text-slate-300"
                                    />
                                    <p className="text-[10px] font-medium text-slate-400 mt-2">Setting a week number will override the month selection.</p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-his-green-500 text-white text-xs font-black rounded-xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 active:scale-95"
                            >
                                Go To Date
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
