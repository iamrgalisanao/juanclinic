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

export const setBranchToken = (branchId) => {
    if (branchId) {
        api.defaults.headers.common['X-Branch-ID'] = branchId;
    } else {
        delete api.defaults.headers.common['X-Branch-ID'];
    }
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

export const login = async (credentials) => {
    const response = await api.post('/auth/login', {
        ...credentials,
        device_name: 'web_browser'
    });
    if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
};

export const logout = async () => {
    try {
        await api.post('/auth/logout');
    } finally {
        localStorage.removeItem('auth_token');
        delete api.defaults.headers.common['Authorization'];
    }
};

export const getTenants = async () => {
    const response = await api.get('/tenants');
    return response.data;
};

export const createTenant = async (data) => {
    const response = await api.post('/tenants', data);
    return response.data;
};

export const updateTenant = async (id, data) => {
    const response = await api.put(`/tenants/${id}`, data);
    return response.data;
};

export const deleteTenant = async (id) => {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
};

export const getBranches = async () => {
    const response = await api.get('/branches');
    return response.data;
};

export const createBranch = async (data) => {
    const response = await api.post('/branches', data);
    return response.data;
};

export const updateBranch = async (id, data) => {
    const response = await api.put(`/branches/${id}`, data);
    return response.data;
};

export const deleteBranch = async (id) => {
    const response = await api.delete(`/branches/${id}`);
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

// Prescription API
export const getPrescriptions = async (patientId = null) => {
    const params = patientId ? { patient_id: patientId } : {};
    const response = await api.get('/prescriptions', { params });
    return response.data;
};

export const createPrescription = async (data) => {
    const response = await api.post('/prescriptions', data);
    return response.data;
};

export const updatePrescription = async (id, data) => {
    const response = await api.put(`/prescriptions/${id}`, data);
    return response.data;
};

// Medicine API
export const getMedicines = async (search = '') => {
    const response = await api.get('/medicines', { params: { search } });
    return response.data;
};

export const createMedicine = async (data) => {
    const response = await api.post('/medicines', data);
    return response.data;
};

// Attachment API
export const getAttachments = async (patientId) => {
    const response = await api.get(`/patients/${patientId}/attachments`);
    return response.data;
};

export const uploadAttachment = async (formData) => {
    const response = await api.post('/attachments', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const downloadAttachment = async (id, fileName) => {
    const response = await api.get(`/attachments/${id}/download`, {
        responseType: 'blob',
    });

    // Create a link to download the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};

export const deleteAttachment = async (id) => {
    const response = await api.delete(`/attachments/${id}`);
    return response.data;
};

// Pharmacy API
export const getPharmacyWorklist = async () => {
    const response = await api.get('/pharmacy/worklist');
    return response.data;
};

export const dispenseMedication = async (id) => {
    const response = await api.post(`/pharmacy/dispense/${id}`);
    return response.data;
};

// Billing API
export const getInvoices = async () => {
    const response = await api.get('/billing/invoices');
    return response.data;
};

export const createInvoice = async (data) => {
    const response = await api.post('/billing/invoices', data);
    return response.data;
};

export const processPayment = async (data) => {
    const response = await api.post('/billing/payments', data);
    return response.data;
};

// Referrals API
export const getReferrals = async () => {
    const response = await api.get('/referrals');
    return response.data;
};

export const createReferral = async (data) => {
    const response = await api.post('/referrals', data);
    return response.data;
};

export const acceptReferral = async (id) => {
    const response = await api.put(`/referrals/${id}/accept`);
    return response.data;
};

export const revokeReferral = async (id) => {
    const response = await api.delete(`/referrals/${id}`);
    return response.data;
};

// Clinical Templates & Notes API
export const getClinicalTemplates = async () => {
    const response = await api.get('/clinical-templates');
    return response.data;
};

export const getClinicalNotes = async (patientId) => {
    const response = await api.get('/clinical-notes', { params: { patient_id: patientId } });
    return response.data;
};

export const createClinicalNote = async (data) => {
    const response = await api.post('/clinical-notes', data);
    return response.data;
};

// Reports API
export const getDashboardReports = async (params = {}) => {
    const response = await api.get('/reports/dashboard', { params });
    return response.data;
};

export const getBranchBenchmarking = async (params = {}) => {
    const response = await api.get('/reports/benchmarking', { params });
    return response.data;
};

// Offline Sync
export const pullSync = async (lastSyncAt) => {
    const response = await api.get('/sync/pull', { params: { last_sync_at: lastSyncAt } });
    return response.data;
};

export const pushSync = async (queue) => {
    const response = await api.post('/sync/push', { queue });
    return response.data;
};

export default api;
