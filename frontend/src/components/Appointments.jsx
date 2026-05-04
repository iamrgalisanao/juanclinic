import React, { useState, useEffect } from 'react';
import { getPatients, getDoctors, getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../services/api';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    User,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Timer,
    X,
    Activity,
    Stethoscope,
    FlaskConical
} from 'lucide-react';

const Appointments = ({ activeTenant, currentUser }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewType, setViewType] = useState(window.innerWidth < 1024 ? 'day' : 'week');
    const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
    const [viewYear, setViewYear] = useState(currentDate.getFullYear());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Handle resize to switch viewType automatically if needed (optional, but good for testing)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && viewType === 'week') {
                // setViewType('day'); // Don't force it, but good to know
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [viewType]);

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
    const [doctorsList, setDoctorsList] = useState([]);
    const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: string }

    const fetchAppointments = async () => {
        try {
            const data = await getAppointments();
            setAppointments(data.map(dbA => ({
                id: dbA.id,
                patient_id: dbA.patient_id,
                patient: dbA.patient ? `${dbA.patient.first_name} ${dbA.patient.last_name}` : 'Unknown Patient',
                doctor_id: dbA.doctor_id,
                doctor: dbA.doctor ? dbA.doctor.name : 'Unknown Doctor',
                date: dbA.appointment_date.split('T')[0],
                hour: parseInt(dbA.start_time.split(':')[0], 10),
                type: dbA.visit_type,
                status: dbA.status
            })));
        } catch (err) { console.error('Failed to fetch appointments', err); }
    };

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await getPatients({ per_page: 100 });
                setPatientsList(response.data || []);
            } catch (err) { console.error('Failed to fetch patients', err); }
        };

        const fetchDoctors = async () => {
            try {
                const data = await getDoctors({ role: 'DOCTOR' });
                setDoctorsList(data);
            } catch (err) { console.error('Failed to fetch doctors', err); }
        };

        if (activeTenant) {
            console.log(`Switching to Tenant: ${activeTenant.id} - Fetching clinical data...`);
            fetchPatients();
            fetchDoctors();
            fetchAppointments();
        }
    }, [activeTenant?.id]);

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

    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        if (viewType === 'day') {
            newDate.setDate(currentDate.getDate() + 1);
        } else {
            newDate.setDate(currentDate.getDate() + 7);
        }
        setCurrentDate(newDate);
    };

    const handlePrevWeek = () => {
        const newDate = new Date(currentDate);
        if (viewType === 'day') {
            newDate.setDate(currentDate.getDate() - 1);
        } else {
            newDate.setDate(currentDate.getDate() - 7);
        }
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

    const showNotify = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const getWeekOfMonth = (date) => {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const pastDaysOfMonth = date.getDate() - 1;
        return Math.ceil((pastDaysOfMonth + firstDayOfMonth.getDay() + 1) / 7) || 1;
    };

    const getDaysInMonth = (year, month) => {
        const date = new Date(year, month, 1);
        const days = [];
        const firstDay = date.getDay(); // 0 for Sun, 1 for Mon...

        // Padding for the start of the week (assuming week starts on Sunday for simplified view)
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        const lastDay = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= lastDay; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const handleMonthChange = (direction) => {
        if (direction === 'prev') {
            if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear(viewYear - 1);
            } else {
                setViewMonth(viewMonth - 1);
            }
        } else {
            if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear(viewYear + 1);
            } else {
                setViewMonth(viewMonth + 1);
            }
        }
    };

    // --- Styling Helpers ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'bg-emerald-50';
            case 'IN_PROGRESS': return 'bg-amber-50';
            case 'CHECKED_IN': return 'bg-sky-50';
            case 'CANCELLED': return 'bg-rose-50';
            case 'SCHEDULED': return 'bg-his-green-100/60';
            default: return 'bg-slate-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="w-3 h-3" />;
            case 'IN_PROGRESS': return <Timer className="w-3 h-3" />;
            case 'CHECKED_IN': return <Activity className="w-3 h-3" />;
            case 'CANCELLED': return <XCircle className="w-3 h-3" />;
            case 'SCHEDULED': return <Clock className="w-3 h-3" />;
            default: return null;
        }
    };

    const handleStatusChange = async (appt, newStatus) => {
        try {
            await updateAppointment(appt.id, { status: newStatus });
            showNotify('success', `Status updated to ${newStatus.replace('_', ' ')}`);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to update appointment status', err);
            showNotify('error', 'Failed to update status');
        }
    };

    const todayStr = formatDate(new Date());
    const doctorFilterId = currentUser?.role === 'DOCTOR' ? currentUser.id : null;
    const todaysAppointments = appointments.filter((a) => {
        if (a.date !== todayStr) return false;
        if (doctorFilterId && a.doctor_id !== doctorFilterId) return false;
        return true;
    });

    const formatHour = (h) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        return `${displayHour}:00 ${period}`;
    };

    const formatHourRange = (h) => {
        const sPeriod = h >= 12 ? 'PM' : 'AM';
        const sHour = h % 12 === 0 ? 12 : h % 12;
        const nextH = h + 1;
        const ePeriod = (nextH >= 12 && nextH < 24) ? 'PM' : 'AM';
        const eHour = nextH % 12 === 0 ? 12 : nextH % 12;

        if (sPeriod === ePeriod) {
            return `${sHour}-${eHour} ${sPeriod}`;
        }
        return `${sHour} ${sPeriod} - ${eHour} ${ePeriod}`;
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
            await updateAppointment(apptId, {
                appointment_date: dropDateStr,
                start_time: `${String(dropHour).padStart(2, '0')}:00:00`,
                end_time: `${String(dropHour + 1).padStart(2, '0')}:00:00`
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
            doctor_id: formData.get('doctor_id'),
            visit_type: formData.get('type'),
            status: formData.get('status'),
            appointment_date: formData.get('date'),
            start_time: `${String(formData.get('hour')).padStart(2, '0')}:00:00`,
            end_time: `${String(parseInt(formData.get('hour'), 10) + 1).padStart(2, '0')}:00:00`
        };

        try {
            if (editingAppt) {
                await updateAppointment(editingAppt.id, payload);
                showNotify('success', 'Appointment updated successfully');
            } else {
                await createAppointment(payload);
                showNotify('success', 'New appointment booked');
            }
            fetchAppointments();
        } catch (err) {
            console.error("Failed to save appointment", err);
            showNotify('error', 'Failed to save appointment');
        }

        setShowModal(false);
    };

    const handleDelete = async () => {
        if (!editingAppt) return;
        try {
            await deleteAppointment(editingAppt.id);
            showNotify('success', 'Appointment cancelled');
            fetchAppointments();
        } catch (err) {
            console.error("Failed to delete appointment", err);
            showNotify('error', 'Failed to cancel appointment');
        }
        setShowModal(false);
    };

    const renderMobilePicker = () => {
        const monthDays = getDaysInMonth(viewYear, viewMonth);
        const monthName = new Date(viewYear, viewMonth).toLocaleString('en-US', { month: 'long' });
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDateStr = formatDate(currentDate);
        const dayAppointments = appointments.filter(a => a.date === selectedDateStr);

        return (
            <div className="space-y-6 md:hidden pb-20">
                {/* Monthly Calendar Picker */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex justify-between items-center mb-8 px-2">
                        <h3 className="text-xl font-black text-slate-900">{monthName} {viewYear}</h3>
                        <div className="flex gap-2">
                            <button onClick={() => handleMonthChange('prev')} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-his-green-600 hover:bg-his-green-50 transition-all active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => handleMonthChange('next')} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-his-green-600 hover:bg-his-green-50 transition-all active:scale-90"><ChevronRight className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-y-2 text-center">
                        {dayNames.map(d => (
                            <span key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{d}</span>
                        ))}
                        {monthDays.map((dateObj, i) => {
                            if (!dateObj) return <div key={`empty-${i}`} />;
                            const isSelected = formatDate(dateObj) === selectedDateStr;
                            const isToday = formatDate(dateObj) === formatDate(new Date());

                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setCurrentDate(dateObj);
                                        // Also update picker month/year if jumping via click
                                        setViewMonth(dateObj.getMonth());
                                        setViewYear(dateObj.getFullYear());
                                    }}
                                    className={`relative w-10 h-10 mx-auto flex items-center justify-center text-sm font-black rounded-2xl transition-all ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110 z-10' : isToday ? 'bg-his-green-50 text-his-green-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {dateObj.getDate()}
                                    {isSelected && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Selection Button */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowTimePicker(true)}
                        className="flex-1 flex items-center gap-4 bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm active:scale-[0.98] transition-all group"
                    >
                        <div className="w-14 h-14 bg-slate-50 group-hover:bg-his-green-50 transition-colors rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-his-green-500">
                            <Clock className="w-7 h-7" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment Time</p>
                            <p className="text-base font-black text-slate-900">Choose Available Slot</p>
                        </div>
                    </button>
                </div>

                {/* Daily Appointments List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Daily Schedule</h4>
                        <span className="text-[10px] font-bold text-his-green-600 bg-his-green-50 px-2 py-1 rounded-lg">{dayAppointments.length} Booked</span>
                    </div>
                    {dayAppointments.length > 0 ? (
                        dayAppointments.map(appt => (
                            <div key={appt.id} onClick={(e) => handleApptClick(e, appt)} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-12 rounded-full ${getStatusColor(appt.status).split(' ')[0].replace('bg-', 'bg-')}`} />
                                    <div>
                                        <p className="text-xs font-black text-slate-900">{appt.patient}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{formatHourRange(appt.hour)} • {appt.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${getStatusColor(appt.status)}`}>{appt.status}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-4">
                                <CalendarIcon className="w-8 h-8" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">No appointments for this day</p>
                            <button onClick={() => setShowTimePicker(true)} className="mt-4 text-his-green-600 text-[10px] font-black uppercase tracking-widest hover:underline">Book New</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="md:p-6 p-4 space-y-6 animate-fade-in relative z-0 pb-24 md:pb-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Appointments</h1>
                    <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Drag and Drop Scheduling</p>
                </div>
                <button
                    onClick={handleNewBooking}
                    className="flex items-center gap-2 bg-his-green-500 hover:bg-his-green-600 active:scale-95 text-white px-4 md:px-5 py-2.5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm transition-all shadow-xl shadow-his-green-500/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Book <span className="hidden md:inline">Appointment</span></span>
                </button>
            </div>

            {/* Mobile View Branch */}
            {renderMobilePicker()}

            {/* Today's Schedule Strip - Desktop Only */}
            <div className="hidden md:block">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today's Schedule</p>
                        <p className="text-sm font-black text-slate-900">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            {currentUser?.role === 'DOCTOR' && (
                                <span className="text-slate-400 text-xs font-bold ml-2">for {currentUser.name}</span>
                            )}
                        </p>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {todaysAppointments.length} appt{todaysAppointments.length === 1 ? '' : 's'} today
                    </div>
                </div>

                {todaysAppointments.length === 0 ? (
                    <div className="text-xs font-medium text-slate-400 py-2">
                        No appointments scheduled today in this tenant.
                    </div>
                ) : (
                    <div className="flex gap-3 overflow-x-auto pt-1 pb-1 pr-1 -mr-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {todaysAppointments.map((appt) => {
                            const actions = [];
                            if (appt.status === 'SCHEDULED') {
                                actions.push({ label: 'Check In', next: 'CHECKED_IN' });
                            }
                            if (appt.status === 'CHECKED_IN') {
                                actions.push({ label: 'Start Visit', next: 'IN_PROGRESS' });
                            }
                            if (appt.status === 'IN_PROGRESS') {
                                actions.push({ label: 'Complete', next: 'COMPLETED' });
                            }
                            if (['SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS'].includes(appt.status)) {
                                actions.push({ label: 'Cancel', next: 'CANCELLED', variant: 'danger' });
                            }

                            return (
                                <div
                                    key={appt.id}
                                    className={`min-w-[260px] rounded-2xl px-4 py-3 flex flex-col gap-2 border border-slate-100 ${getStatusColor(appt.status)}`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
                                                {getStatusIcon(appt.status)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 leading-tight truncate">{appt.patient}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {formatHourRange(appt.hour)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-white/70 text-slate-500">
                                            {appt.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <p className="text-[10px] font-medium text-slate-500 truncate flex items-center gap-1">
                                            <Stethoscope className="w-3 h-3" /> {appt.doctor}
                                        </p>
                                        <div className="flex gap-1">
                                            {actions.map((action) => (
                                                <button
                                                    key={action.label}
                                                    type="button"
                                                    onClick={() => handleStatusChange(appt, action.next)}
                                                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                        action.variant === 'danger'
                                                            ? 'border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100'
                                                            : 'border-his-green-200 text-his-green-600 bg-white hover:bg-his-green-50'
                                                    }`}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            </div>

            {/* Calendar Grid Section - Desktop Only */}
            <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden select-none">
                {/* Calendar Nav */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
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
                            <h2 className="text-base md:text-lg font-black text-slate-900 group-hover:text-his-green-600 transition-colors">
                                {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </h2>
                            {viewType === 'week' && (
                                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-2 py-0.5 rounded-lg">Wk {getWeekOfMonth(currentDate)}</span>
                            )}
                        </div>
                        <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                            <button onClick={handlePrevWeek} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-900"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={handleNextWeek} className="p-1.5 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-900"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-slate-200/50 p-1 rounded-xl w-full sm:w-auto">
                        <button
                            onClick={() => setViewType('day')}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'day' ? 'bg-white text-his-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Day
                        </button>
                        <button
                            onClick={() => setViewType('week')}
                            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'week' ? 'bg-white text-his-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Week
                        </button>
                    </div>
                </div>

                {/* Schedule View Grid */}
                <div className={`grid ${viewType === 'week' ? 'grid-cols-8' : 'grid-cols-2'} divide-x divide-slate-100 bg-white`}>
                    {/* Time Column */}
                    <div className="col-span-1 border-b border-slate-100 bg-slate-50/30">
                        <div className="h-14 border-b border-slate-100 flex items-center justify-center font-black uppercase text-slate-300 text-[9px] md:text-xs tracking-widest">TIME</div>
                        {hours.map(hour => (
                            <div key={`label-${hour}`} className="h-24 p-2 text-right pr-4 flex items-center justify-end text-[9px] md:text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-widest">
                                {formatHour(hour)}
                            </div>
                        ))}
                    </div>

                    {/* Day Column(s) */}
                    {(viewType === 'week' ? days : [days[currentDate.getDay()]]).map((day, idx) => {
                        const dateObj = viewType === 'week' ? weekDates[idx] : currentDate;
                        const dayName = viewType === 'week' ? day : days[currentDate.getDay()];
                        const dateNum = dateObj.getDate();
                        const isToday = new Date().toDateString() === dateObj.toDateString();

                        return (
                            <div key={`${dayName}-${idx}`} className="col-span-1 border-b border-slate-100">
                                {/* Day Header */}
                                <div className={`h-14 border-b border-slate-100 flex flex-col items-center justify-center ${isToday ? 'bg-his-green-50/50' : ''}`}>
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{dayName}</span>
                                    <span className={`text-base md:text-xl font-black ${isToday ? 'text-his-green-600' : 'text-slate-900'}`}>{dateNum}</span>
                                </div>

                                {/* Time Slots for the Day */}
                                {hours.map(hour => {
                                    const slotDateStr = formatDate(dateObj);
                                    // Find appointment(s) for this slot
                                    const slotAppointments = appointments.filter(a => a.date === slotDateStr && a.hour === hour);
                                    return (
                                        <div
                                            key={`${dayName}-${hour}`}
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
                                                    <p className="text-[9px] md:text-[10px] font-black leading-tight text-slate-800">{formatHourRange(appt.hour)}</p>
                                                    <p className="text-[10px] md:text-[11px] font-medium opacity-60 leading-tight truncate text-slate-800 mt-0.5">{appt.patient}</p>
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
                        <form onSubmit={handleModalSave} className="p-6 md:p-8 space-y-4 md:space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                                    <select
                                        name="doctor_id"
                                        required
                                        defaultValue={editingAppt?.doctor_id || ''}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="" disabled>Select a Doctor</option>
                                        {doctorsList.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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

            {/* Mobile Time Selection Modal */}
            {showTimePicker && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-slide-up shadow-2xl">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-his-green-500" /> Select Time
                            </h2>
                            <button onClick={() => setShowTimePicker(false)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 grid grid-cols-3 gap-3">
                            {hours.map(h => (
                                <button
                                    key={h}
                                    onClick={() => {
                                        setSelectedSlot({ date: formatDate(currentDate), hour: h });
                                        setEditingAppt(null);
                                        setShowModal(true);
                                        setShowTimePicker(false);
                                    }}
                                    className="py-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-his-green-500 hover:text-white transition-all text-xs font-black"
                                >
                                    {formatHour(h).replace(':00', '')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
