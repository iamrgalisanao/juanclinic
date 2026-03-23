import Dexie from 'dexie';

export const db = new Dexie('JuanClinicDB');

// Define the database schema
// Syntax: 'table_name': 'primary_key, index1, index2, ...'
db.version(1).stores({
    patients: 'id, tenant_id, [tenant_id+id], updated_at',
    orders: 'id, tenant_id, patient_id, [tenant_id+id], updated_at',
    clinical_notes: 'id, tenant_id, patient_id, [tenant_id+id], updated_at',
    prescriptions: 'id, tenant_id, patient_id, [tenant_id+id], updated_at',
    appointments: 'id, tenant_id, patient_id, [tenant_id+id], updated_at',
    sync_queue: '++id, tenant_id, method, url'
});

/**
 * Helper to save data to local DB
 */
export const saveToLocal = async (table, data) => {
    if (Array.isArray(data)) {
        return await db[table].bulkPut(data);
    }
    return await db[table].put(data);
};

/**
 * Helper to get data from local DB
 */
export const getFromLocal = async (table, tenantId, filter = {}) => {
    let collection = db[table].where('tenant_id').equals(tenantId);

    // Apply additional filters if needed
    if (filter.patient_id) {
        collection = collection.and(item => item.patient_id === filter.patient_id);
    }

    return await collection.toArray();
};

/**
 * Add an item to the sync queue (Outbox)
 */
export const addToSyncQueue = async (tenantId, method, url, data) => {
    return await db.sync_queue.add({
        tenant_id: tenantId,
        method,
        url,
        data,
        timestamp: new Date().toISOString()
    });
};
