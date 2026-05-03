import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Initial token restoration to prevent 401 race conditions
const initialToken = localStorage.getItem('auth_token');
if (initialToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

// Response interceptor for automatic 401 handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const url = error.config.url;
            // Only clear and redirect if not on the login call itself
            const isLoginRequest = url.includes('/auth/login');
            if (!isLoginRequest) {
                console.warn(`Unauthorized request to [${url}] detected. Clearing session and redirecting...`);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                delete api.defaults.headers.common['Authorization'];
                
                // We force a page reload to reset the app state to the login view
                // This is a robust way to ensure all background syncs and intervals stop
                if (typeof window !== 'undefined') {
                    window.location.hash = '#dashboard'; // Reset hash
                    window.location.reload();
                }
            }
        }
        return Promise.reject(error);
    }
);

export const setTenantToken = (tenantId) => {
    api.defaults.headers.common['X-Tenant-ID'] = tenantId;
    localStorage.setItem('last_tenant_id', tenantId);
};

export const setBranchToken = (branchId) => {
    if (branchId) {
        api.defaults.headers.common['X-Branch-ID'] = branchId;
    } else {
        delete api.defaults.headers.common['X-Branch-ID'];
    }
};



export const getPatients = async (params = {}) => {
    const response = await api.get('/patients', { params });
    return response.data;
};

export const getPatient = async (id) => {
    const response = await api.get(`/patients/${id}`);
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

export const createOrder = async (data) => {
    const response = await api.post('/orders', data);
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
    if (data instanceof FormData) {
        const response = await api.post('/tenants', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    const response = await api.post('/tenants', data);
    return response.data;
};

export const updateTenant = async (id, data) => {
    if (data instanceof FormData) {
        // Laravel requires _method=PUT for multipart updates
        data.append('_method', 'PUT');
        const response = await api.post(`/tenants/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
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

export const deletePatient = async (patientId, reason = '') => {
    const response = await api.delete(`/patients/${patientId}`, { data: { reason } });
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

// Notification Cadences API
export const getNotificationCadences = async (params = {}) => {
    const response = await api.get('/notification-cadences', { params });
    return response.data;
};

export const createNotificationCadence = async (data) => {
    const response = await api.post('/notification-cadences', data);
    return response.data;
};

export const updateNotificationCadence = async (id, data) => {
    const response = await api.put(`/notification-cadences/${id}`, data);
    return response.data;
};

export const deleteNotificationCadence = async (id) => {
    const response = await api.delete(`/notification-cadences/${id}`);
    return response.data;
};

// Doctors / Staff API
export const getDoctors = async (params = {}) => {
    const response = await api.get('/users', { params });
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

// Medicine & Discovery API
export const getMedicines = async (params = {}) => {
    const response = await api.get('/medicines', { params });
    return response.data;
};

export const createMedicine = async (data) => {
    const response = await api.post('/medicines', data);
    return response.data;
};

export const discoverySearch = (params) => api.get('/discovery/search', { params }).then(res => res.data);
export const getDiseaseMedicines = (diseaseId) => api.get(`/diseases/${diseaseId}/medicines`).then(res => res.data);
export const getMedicine = (id) => api.get(`/medicines/${id}`).then(res => res.data);


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
export const updateReferral = async (id, data) => {
    const response = await api.put(`/referrals/${id}`, data);
    return response.data;
};

export const searchExternalProviders = async (query) => {
    const response = await api.get('/external-providers/search', { params: { q: query } });
    return response.data;
};

export const createExternalReferral = async (data) => {
    const response = await api.post('/external-providers/refer', data);
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

// Pediatrics API
export const getPediatricHistory = async (patientId, type = 'growth', params = {}) => {
    const response = await api.get(`/patients/${patientId}/pediatrics/${type}`, { params });
    return response.data;
};

export const storeGrowthRecord = async (patientId, data) => {
    const response = await api.post(`/patients/${patientId}/pediatrics/growth`, data);
    return response.data;
};

export const storeImmunizationRecord = async (patientId, data) => {
    const response = await api.post(`/patients/${patientId}/pediatrics/immunizations`, data);
    return response.data;
};

export const lookupVaccines = async (tenantId) => {
    const response = await api.get(`/pediatrics/vaccines/lookup`, { params: { tenant_id: tenantId } });
    return response.data;
};

export const updateImmunizationRecord = async (patientId, recordId, data) => {
    const response = await api.put(`/patients/${patientId}/pediatrics/immunizations/${recordId}`, data);
    return response.data;
};

export const enrollCustomVaccine = async (patientId, data) => {
    const response = await api.post(`/patients/${patientId}/pediatrics/roadmap/enroll`, data);
    return response.data;
};

export const unenrollCustomVaccine = async (patientId, vaccineName) => {
    const response = await api.delete(`/patients/${patientId}/pediatrics/roadmap/${encodeURIComponent(vaccineName)}`);
    return response.data;
};

export const getPediatricStandards = async (params) => {
    const response = await api.get('/pediatrics/standards', { params });
    return response.data;
};

export const getOverdueMilestones = async (patientId) => {
    const response = await api.get(`/patients/${patientId}/pediatrics/overdue`);
    return response.data;
};

// Universal Vitals API
export const getVitals = async (patientId) => {
    const response = await api.get('/vitals', { params: { patient_id: patientId } });
    return response.data;
};

export const storeVital = async (data) => {
    const response = await api.post('/vitals', data);
    return response.data;
};

export const deleteVital = async (id) => {
    const response = await api.delete(`/vitals/${id}`);
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

// HL7 Outbox Management
export const getHL7Outbox = async (params = {}) => {
    const response = await api.get('/admin/hl7/outbox', { params });
    return response.data;
};

export const retryHL7Message = async (id) => {
    const response = await api.post(`/admin/hl7/outbox/${id}/retry`);
    return response.data;
};

export const processHL7Outbox = async () => {
    const response = await api.post('/admin/hl7/outbox/process');
    return response.data;
};

export const getNeonatalSummary = async (patientId) => {
    const response = await api.get(`/patients/${patientId}/neonatal/summary`);
    return response.data;
};

export const getSystemVersion = () => api.get('/version').then(res => res.data);


// RIS/PACS (Imaging) API
export const getPatientImaging = async (patientId) => {
    const response = await api.get(`/imaging/patients/${patientId}`);
    return response.data;
};

export const uploadDicom = async (formData) => {
    const response = await api.post('/imaging/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const submitImagingReport = async (studyId, data) => {
    const response = await api.post(`/imaging/studies/${studyId}/report`, data);
    return response.data;
};

export const finalizeImagingStudy = async (studyId) => {
    const response = await api.post(`/imaging/studies/${studyId}/finalize`);
    return response.data;
};

// Super Admin / Platform Management API
export const getSATenants = async () => {
    const response = await api.get('/sa/tenants');
    return response.data;
};

export const toggleSAFeature = async (tenantId, feature, enabled) => {
    const response = await api.patch(`/sa/tenants/${tenantId}/features`, { feature, enabled });
    return response.data;
};

export const updateSAPlan = async (tenantId, payload) => {
    const response = await api.patch(`/sa/tenants/${tenantId}/plan`, payload);
    return response.data;
};

export const impersonateTenant = async (tenantId) => {
    const response = await api.post(`/sa/tenants/${tenantId}/impersonate`);
    return response.data;
};

// Patient Portal (Public Gateway) API
export const authorizePortal = async (patientId, pin) => {
    const response = await api.post('/portal/authorize', { patient_id: patientId, pin });
    return response.data;
};

export const getPortalSummary = async (accessKey) => {
    const response = await api.get('/portal/summary', {
        headers: {
            'X-Portal-Access-Key': accessKey
        }
    });
    return response.data;
};

// Safety Governance
export const checkSafetyStatus = (patientId) => api.get(`/safety/status/${patientId}`);
export const acknowledgeVital = (id) => api.post(`/safety/vitals/${id}/acknowledge`);
export const acknowledgeResult = (id) => api.post(`/safety/results/${id}/acknowledge`);

export default api;
