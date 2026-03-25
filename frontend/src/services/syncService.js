import { useState, useEffect } from 'react';
import { db, saveToLocal } from './db';
import { pullSync, pushSync } from './api';

const LAST_SYNC_KEY = 'juan_clinic_last_sync';

export const useSyncStatus = (tenantId) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastSync, setLastSync] = useState(localStorage.getItem(`${LAST_SYNC_KEY}_${tenantId}`));

    useEffect(() => {
        const handleStatusChange = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);

        const interval = setInterval(() => {
            setLastSync(localStorage.getItem(`${LAST_SYNC_KEY}_${tenantId}`));
        }, 5000);

        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
            clearInterval(interval);
        };
    }, [tenantId]);

    return { isOnline, lastSync };
};

export const syncAll = async (tenantId) => {
    if (!tenantId) return;
    console.log('Starting sync for tenant:', tenantId);

    try {
        // 1. Push local changes first
        await pushLocalChanges(tenantId);

        // 2. Pull changes from server
        await pullServerChanges(tenantId);

        console.log('Sync completed successfully');
    } catch (error) {
        // Axios interceptor handles 401s by reloading, 
        // but we catch other errors here to prevent console noise.
        console.error('Sync failed:', error.message);
    }
};

const pushLocalChanges = async (tenantId) => {
    const queue = await db.sync_queue
        .where('tenant_id').equals(tenantId)
        .toArray();

    if (queue.length === 0) return;

    console.log(`Pushing ${queue.length} items to server...`);

    try {
        const response = await pushSync(queue);

        // Process results and remove successful items from queue
        for (const result of response.results) {
            if (result.status === 'success' || result.status === 'skipped') {
                await db.sync_queue.delete(result.id);
            }
        }
    } catch (error) {
        console.error('Failed to push changes:', error);
        throw error;
    }
};

const pullServerChanges = async (tenantId) => {
    const lastSyncAt = localStorage.getItem(`${LAST_SYNC_KEY}_${tenantId}`) || '1970-01-01 00:00:00';

    const response = await pullSync(lastSyncAt);

    if (response.data) {
        // Update local DB tables for all returned models
        for (const [table, items] of Object.entries(response.data)) {
            if (items && items.length > 0) {
                await saveToLocal(table, items);
            }
        }

        // Update last sync timestamp
        localStorage.setItem(`${LAST_SYNC_KEY}_${tenantId}`, response.server_time);
    }
};

// Check if online and trigger sync
export const startAutoSync = (tenantId, intervalMs = 60000) => {
    if (!tenantId) return null;

    const interval = setInterval(() => {
        if (navigator.onLine) {
            syncAll(tenantId);
        }
    }, intervalMs);

    // Initial sync
    if (navigator.onLine) syncAll(tenantId);

    return () => clearInterval(interval);
};
