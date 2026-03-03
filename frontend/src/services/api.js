import axios from 'axios';

const API_BASE = 'http://localhost:8001/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setTenantToken = (tenantId) => {
    api.defaults.headers.common['X-Tenant-ID'] = tenantId;
};

export const setSimulatedUser = (userId) => {
    api.defaults.headers.common['X-Simulated-User'] = userId;
};

export const getPatients = async () => {
    const response = await api.get('/patients');
    return response.data;
};

export const getPatientHistory = async (patientId) => {
    const response = await api.get(`/patients/${patientId}/history`);
    return response.data;
};

export const getOrders = async () => {
    const response = await api.get('/orders');
    return response.data;
};

export const getTenants = async () => {
    const response = await api.get('/tenants');
    return response.data;
};

export const registerPatient = async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
};

export const updatePatient = async (patientId, data) => {
    const response = await api.put(`/patients/${patientId}`, data);
    return response.data;
};

export const ingestHL7 = async (hl7Message) => {
    const response = await api.post('/hl7/ingest', { hl7_message: hl7Message });
    return response.data;
};

export const updateOrder = async (orderId, updateData) => {
    const response = await api.put(`/orders/${orderId}`, updateData);
    return response.data;
};

// Appointments API
export const getAppointments = async () => {
    const response = await api.get('/appointments');
    return response.data;
};

export const createAppointment = async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
};

export const updateAppointment = async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
};

export const deleteAppointment = async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
};

// Doctors / Staff API
export const getDoctors = async () => {
    const response = await api.get('/users');
    return response.data;
};

export const createDoctor = async (data) => {
    const response = await api.post('/users', data);
    return response.data;
};

export const updateDoctor = async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

export const deleteDoctor = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

// Messaging API
export const getMessageThreads = async () => {
    const response = await api.get('/messages');
    return response.data;
};

export const getMessageHistory = async (conversationId) => {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
};

export const sendMessage = async (data) => {
    // data: { conversation_id, content } OR { receiver_id, content }
    const response = await api.post('/messages', data);
    return response.data;
};

export const createGroupChat = async (name, userIds) => {
    const response = await api.post('/messages/groups', { name, user_ids: userIds });
    return response.data;
};

// Audit Logs API
export const getAuditLogs = async (params = {}) => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
};

export default api;
