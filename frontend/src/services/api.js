import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setTenantToken = (tenantId) => {
    api.defaults.headers.common['X-Tenant-ID'] = tenantId;
};

export const getPatients = async () => {
    const response = await api.get('/patients');
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

export const ingestHL7 = async (hl7Message) => {
    const response = await api.post('/hl7/ingest', { hl7_message: hl7Message });
    return response.data;
};

export default api;
