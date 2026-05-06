// JuanClinic HIS - Modernized with Global Dialog System
import React, { useState, useEffect, useRef } from 'react';
import { getPatients, getTenants, setTenantToken, getOrders, ingestHL7, updateOrder, getAuditLogs, getPrescriptions, getBranches, setBranchToken, getDashboardReports, getDoctors, getSystemVersion } from './services/api';
import echo from './services/echo';
import { startAutoSync } from './services/syncService';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatCard from './components/StatCard';
import Worklist from './components/Worklist';
import ClinicalWorklist from './views/ClinicalWorklist';
import RadiologyWorklist from './views/RadiologyWorklist';
import RegisterPatientForm from './components/RegisterPatientForm';
import Reports from './components/Reports';
import Messages from './components/Messages';
import Appointments from './components/Appointments';
import PatientProfile from './components/PatientProfile';
import AuditLogExplorer from './components/AuditLogExplorer';
import Patients from './components/Patients';
import Doctors from './components/Doctors';
import MedicineManagement from './views/MedicineManagement';
import InteractiveGuide from './components/InteractiveGuide';
import PharmacyWorklist from './components/PharmacyWorklist';
import CashierDashboard from './components/CashierDashboard';
import Referrals from './components/Referrals';
import BranchManagement from './views/BranchManagement';
import TenantManagement from './views/TenantManagement';
import NotificationSettings from './views/settings/NotificationSettings';
import SettingsGovernance from './views/SettingsGovernance';
import SuperAdminDashboard from './views/admin/SuperAdminDashboard';
import HelpCenter from './views/HelpCenter';
import HL7OutboxViewer from './components/admin/HL7OutboxViewer';
import Login from './views/Login';
import PatientPortal from './views/PatientPortal';
import api from './services/api';
import { DialogProvider } from './context/DialogContext';
import GlobalDialog from './components/GlobalDialog';
import DrugDiscovery from './pages/DrugDiscovery';
import TerminologyReviewDashboard from './components/admin/TerminologyReviewDashboard';
import MobileNav from './components/MobileNav';


// Authentication persistence helpers
const getInitialAuthUser = () => {
    const savedUser = localStorage.getItem('auth_user');
    return savedUser ? JSON.parse(savedUser) : null;
};

function App() {
    const [patients, setPatients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [activeTenant, setActiveTenant] = useState(null);
    const [impersonatedTenant, setImpersonatedTenant] = useState(() => {
        const stored = localStorage.getItem('impersonated_tenant');
        try {
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error("Failed to parse impersonated_tenant", e);
            return null;
        }
    });

    const [branches, setBranches] = useState([]);
    const [activeBranch, setActiveBranch] = useState(() => {
        const stored = localStorage.getItem('active_branch');
        try {
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(() => {
        const saved = localStorage.getItem('selected_patient_id');
        return saved ? parseInt(saved) : null;
    });
    const [prescriptions, setPrescriptions] = useState([]);
    const [currentUser, setCurrentUser] = useState(getInitialAuthUser);
    const [userToken, setUserToken] = useState(() => localStorage.getItem('auth_token'));
    const [dashboardStats, setDashboardStats] = useState(null);
    const [doctorsCount, setDoctorsCount] = useState(0);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarSlim, setIsSidebarSlim] = useState(() => {
        const saved = localStorage.getItem('sidebar_slim');
        if (saved !== null) return saved === 'true';
        // Auto-slim on tablets (iPad Pro 1024px) and below to save space
        return window.innerWidth <= 1024;
    });
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const contentRef = useRef(null);
    // const audioRef = useRef(new Audio('/hitech-scan.mp3'));
    const [systemVersion, setSystemVersion] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stagedPrescription, setStagedPrescription] = useState(null);



    // Sync currentUser to API Headers & LocalStorage
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('auth_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('auth_user');
        }
    }, [currentUser]);

    // Single-Domain Impersonation: inject tenant context if active
    // We do this immediately in the render body or during init to prevent race conditions 
    // where fetchInitialData() (useEffect []) fires before this context is set.
    if (impersonatedTenant) {
        setTenantToken(impersonatedTenant.id);
    }

    const exitImpersonation = () => {
        const originToken = localStorage.getItem('impersonation_origin_token');
        const originUser = localStorage.getItem('impersonation_origin_user');
        if (originToken) localStorage.setItem('auth_token', originToken);
        if (originUser) localStorage.setItem('auth_user', originUser);
        localStorage.removeItem('impersonation_token');
        localStorage.removeItem('impersonation_origin_token');
        localStorage.removeItem('impersonation_origin_user');
        localStorage.removeItem('impersonated_tenant');
        window.location.hash = '#superadmin';
        window.location.reload();
    };

    // Persist Slim Sidebar State
    useEffect(() => {
        localStorage.setItem('sidebar_slim', isSidebarSlim);
    }, [isSidebarSlim]);
    
    // Persist Patient & Branch Context
    useEffect(() => {
        if (selectedPatient) {
            localStorage.setItem('selected_patient_id', selectedPatient);
        } else {
            localStorage.removeItem('selected_patient_id');
        }
    }, [selectedPatient]);

    useEffect(() => {
        if (activeBranch) {
            localStorage.setItem('active_branch', JSON.stringify(activeBranch));
        } else {
            localStorage.removeItem('active_branch');
        }
    }, [activeBranch]);

    // Track sync state and prevent concurrent loops
    const syncLockRef = useRef({ userEmail: '', tenantId: null, isSyncing: false });

    // Sync simulated user with API headers and handle auto-tenant alignment
    useEffect(() => {
        if (!currentUser || tenants.length === 0) return;

        const handleSync = async () => {
            if (syncLockRef.current.isSyncing) return;

            // CIRCUIT BREAKER: Global Admin in Command Center has no clinical tenant to sync.
            // Bypassing handleTenantChange prevents the loading state cascade that unmounts modals.
            if (currentUser.role === 'GLOBAL_ADMIN' && !impersonatedTenant) {
                setIsTransitioning(false);
                return;
            }

            // Priority for Sync alignment:
            // 1. Explicit Impersonated context (highest priority to keep us in the clinic)
            // 2. Auth User's assigned home tenant (888 for Global Admin)
            const targetId = impersonatedTenant?.id || currentUser.tenant_id;
            let targetTenant = activeTenant;
            
            console.log(`[Tenant Sync] targetId: ${targetId}, currentUser.tenant_id: ${currentUser.tenant_id}, impersonated: ${impersonatedTenant?.id || 'NULL'}`);

            if (targetId) {
                const matched = tenants.find(t => t.id == targetId);
                if (matched && activeTenant?.id != matched.id) {
                    targetTenant = matched;
                } else if (!matched) {
                    console.error(`[Tenant Sync] CRITICAL: Could not find tenant with ID ${targetId} in the tenants list!`);
                }
            } else if (!activeTenant && tenants.length > 0 && currentUser.role === 'GLOBAL_ADMIN') {
                // Global Admin: default to first tenant if none active
                targetTenant = tenants[0];
                console.log(`[Tenant Sync] Global Admin fallback to first tenant: ${targetTenant.name}`);
            }

            // If we are already synced to the target, just clear the transition state
            if (targetTenant?.id && targetTenant.id == syncLockRef.current.tenantId) {
                console.log(`[Tenant Sync] Already synced to ${targetTenant.id}. Bypassing.`);
                setIsTransitioning(false);
                return;
            }

            // Only sync if actual change is needed
            if (targetTenant) {
                console.log(`[Tenant Sync] Initiating switch to: ${targetTenant.name} (ID: ${targetTenant.id})`);
                syncLockRef.current.isSyncing = true;
                setIsTransitioning(true);
                try {
                    setTenantToken(targetTenant.id);
                    await handleTenantChange(targetTenant);
                    syncLockRef.current.tenantId = targetTenant.id;
                    console.log(`[Tenant Sync] Successfully aligned to ${targetTenant.name}`);
                } catch (err) {
                    console.error("[Tenant Sync] Alignment failure", err);
                    // In case of total failure, we must release the transition lock
                    // so the user isn't stuck on the overlay forever.
                    setIsTransitioning(false);
                } finally {
                    syncLockRef.current.isSyncing = false;
                    setIsTransitioning(false);
                }
            } else {
                console.log(`[Tenant Sync] No alignment required or possible. targetTenant is NULL.`);
                setIsTransitioning(false);
            }
        };

        handleSync();
    // Note: doctorsCount removed intentionally — it was causing spurious re-syncs
    // that called handleTenantChange, cascading into loading state changes that
    // would reset the SuperAdminDashboard's modal state.
    }, [currentUser, tenants, impersonatedTenant]);

    // Handle Offline Sync Lifecycle
    useEffect(() => {
        // Only start sync if we have an active tenant AND a current user
        if (activeTenant?.id && currentUser) {
            const stopSync = startAutoSync(activeTenant.id);
            return () => stopSync && stopSync();
        }
    }, [activeTenant, currentUser]);


    const [activeView, setActiveView] = useState(() => {
        const hash = window.location.hash.replace('#', '').split('?')[0];
        return ['dashboard', 'worklist', 'messages', 'message', 'appointments', 'appointment', 'patients', 'doctors', 'reports', 'audit', 'patient_profile', 'pharmacy', 'billing', 'clinical_notes', 'medicine_management', 'referrals', 'branch_management', 'hl7_transport', 'portal', 'superadmin', 'drug_discovery', 'terminology_review', 'settings_governance'].includes(hash) ? hash : 'dashboard';
    });


    // Hash sync: State -> URL + Context-aware data fetching
    useEffect(() => {
        window.location.hash = activeView;
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
        
        // Wait for both tenant and branch to be aligned if we are on a contextual view
        if (activeView === 'pharmacy' && activeTenant && activeBranch) {
            fetchPrescriptions();
        }
    }, [activeView, activeTenant, activeBranch]);


    const fetchPrescriptions = async () => {
        try {
            const data = await getPrescriptions();
            setPrescriptions(data);
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [userToken]);

    const fetchInitialData = async () => {
        // Guard: Do not attempt to fetch protected data if no token exists
        // This prevents 401 interceptors from triggering reload loops during login
        if (!userToken) {
            setLoading(false);
            return;
        }

        try {
            const tenantData = await getTenants();
            setTenants(tenantData);
            
            // Fetch System Version
            const version = await getSystemVersion();
            setSystemVersion(version);
        } catch (err) {
            // Only log if it's not an abort error (which is expected on intentional navigation/reload)
            if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                console.error("Initialization failed", err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (user, token, tenant) => {
        // Immediately set the token in API service to prevent race conditions in subsequent requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setCurrentUser(user);
        setUserToken(token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('simulated_user_email', user.email);
    };

    const handlePrescribeFromDiscovery = (prescriptionData) => {
        if (!selectedPatient) {
            window.alert('Please select a patient from the Registry before initiating a high-fidelity prescription handoff.');
            setActiveView('patients');
            return;
        }
        setStagedPrescription(prescriptionData);
        setActiveView('patient_profile');
    };

    useEffect(() => {
        if (tenants.length > 0 && currentUser) {
            // Priority for Sync alignment:
            // 1. Explicit Impersonated context
            // 2. Auth User's assigned home tenant
            const targetId = impersonatedTenant?.id || currentUser.tenant_id;
            const targetTenant = tenants.find(t => t.id === targetId);
            
            if (targetTenant) {
                if (targetTenant.id !== activeTenant?.id) {
                    console.log(`[Tenant Sync] Aligning context to: ${targetTenant.name} (Source: ${impersonatedTenant ? 'Impersonation' : 'Home'})`);
                    setActiveTenant(targetTenant);
                }
            } else if (currentUser.role === 'GLOBAL_ADMIN' && !activeTenant && tenants.length > 0) {
                // Global Admin fallback only (to the first tenant in the list for orchestration)
                setActiveTenant(tenants[0]);
            }
        }
    }, [tenants, currentUser, impersonatedTenant]);

    useEffect(() => {
        if (activeTenant) {
            setTenantToken(activeTenant.id);
        }
    }, [activeTenant]);

    const handleLogout = () => {
        setCurrentUser(null);
        setUserToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('simulated_user_email');
        delete api.defaults.headers.common['Authorization'];
    };

    const handleTenantChange = async (tenant) => {
        setLoading(true);
        setActiveTenant(tenant);
        setTenantToken(tenant.id);
        try {
            // Fetch branches for this tenant
            const branchData = await getBranches();
            setBranches(branchData);

            // Set initial branch based on user or first available
            let initialBranch = null;
            if (currentUser.branch_id) {
                initialBranch = branchData.find(b => b.id === currentUser.branch_id);
            }
            if (!initialBranch && branchData.length > 0) {
                initialBranch = branchData[0];
            }
            setActiveBranch(initialBranch);
            setBranchToken(initialBranch?.id);

            // Role-based fetching to prevent 403s
            const fetchPromises = [];
            const canSeeOrders = ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER'].includes(currentUser.role);
            const canSeePatients = ['ADMIN', 'DOCTOR', 'FRONT_DESK', 'DIAGNOSTIC_APPROVER'].includes(currentUser.role);

            if (canSeeOrders) fetchPromises.push(getOrders());
            if (canSeePatients) fetchPromises.push(getPatients());

            const results = await Promise.all(fetchPromises);
            
            // Map results back to state based on what was fetched
            let resultIdx = 0;
            if (canSeeOrders) {
                setOrders(results[resultIdx++] || []);
            } else {
                setOrders([]);
            }

            if (canSeePatients) {
                setPatients(results[resultIdx++]?.data || []);
            } else {
                setPatients([]);
            }

            // Fetch Dashboard Analytics & Activity
            await fetchDashboardData();
        } catch (err) {
            console.error("Failed to fetch tenant/branch data", err);
            setPatients([]);
            setOrders([]);
            setBranches([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBranchChange = async (branch) => {
        setLoading(true);
        setActiveBranch(branch);
        setBranchToken(branch.id);
        try {
            const [orderData, patientData] = await Promise.all([
                getOrders(),
                ['ADMIN', 'DOCTOR', 'FRONT_DESK'].includes(currentUser.role) ? getPatients() : Promise.resolve([])
            ]);
            setOrders(orderData);
            setPatients(patientData?.data || []);
            await fetchDashboardData();
        } catch (err) {
            console.error("Failed to fetch branch data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const [stats, docs, logs] = await Promise.all([
                ['ADMIN', 'DOCTOR', 'FRONT_DESK'].includes(currentUser.role) ? getDashboardReports() : Promise.resolve(null),
                getDoctors(),
                ['ADMIN', 'DOCTOR'].includes(currentUser.role) ? getAuditLogs({ limit: 5 }) : Promise.resolve([])
            ]);
            setDashboardStats(stats);
            setDoctorsCount(docs.filter(u => u.role === 'DOCTOR').length);
            setRecentActivity(logs.length ? logs.slice(0, 5) : []);
        } catch (err) {
            console.error("Dashboard fetch failed", err);
        }
    };

    const onPatientAdded = (newPatient) => {
        setPatients([...patients, newPatient]);
        setRefreshTrigger(prev => prev + 1);
        setShowRegister(false);
    };

    // RBAC Guard — must be defined before early return (Rules of Hooks)
    const isRestricted = (view) => {
        if (!currentUser) return false;

        // HIS Multi-Tenant Context: Use the explicit impersonation flag for RBAC
        // Direct localStorage check prevents race conditions during initial mount hydration
        const effectiveImpersonation = impersonatedTenant || JSON.parse(localStorage.getItem('impersonated_tenant') || 'null');
        
        // Whitelist views that are dedicated to platform orchestration/governance
        const governanceViews = ['superadmin', 'audit', 'reports', 'hl7_transport', 'tenant_management', 'branch_management'];

        console.log(`[RBAC Check] View: ${view}, Role: ${currentUser.role}, Impersonated: ${effectiveImpersonation?.name || 'NULL'}`);

        // GLOBAL_ADMIN without impersonation: governance only
        if (currentUser.role === 'GLOBAL_ADMIN' && !effectiveImpersonation) {
            const restricted = !governanceViews.includes(view);
            if (restricted) console.warn(`[RBAC] GLOBAL_ADMIN restricted from clinical view [${view}] (No Active Impersonation)`);
            return restricted;
        }

        // GLOBAL_ADMIN while impersonating a tenant: full clinical access
        if (currentUser.role === 'GLOBAL_ADMIN' && effectiveImpersonation) {
            console.log(`[RBAC] Access GRANTED for Global Admin to ${view} (Managing: ${effectiveImpersonation.name})`);
            return false;
        }

        const rolePermissions = {
            'dashboard': { roles: ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK'] },
            'worklist': { roles: ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER'], feature: 'laboratory_enabled' },
            'messages': { roles: ['ADMIN', 'DOCTOR', 'TECH', 'DIAGNOSTIC_APPROVER', 'FRONT_DESK'], feature: 'telehealth_enabled' },
            'appointments': { roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK'] },
            'pharmacy': { roles: ['ADMIN', 'DOCTOR', 'TECH'], feature: 'pharmacy_enabled' },
            'medicine_management': { roles: ['ADMIN', 'DOCTOR', 'TECH'], feature: 'pharmacy_enabled' },
            'billing': { roles: ['ADMIN', 'FRONT_DESK'], feature: 'billing_enabled' },
            'clinical_notes': { roles: ['ADMIN', 'DOCTOR'] },
            'patients': { roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK', 'DIAGNOSTIC_APPROVER'] },
            'doctors': { roles: ['ADMIN', 'DOCTOR'] },
            'reports': { roles: ['ADMIN', 'FRONT_DESK', 'DOCTOR', 'DIAGNOSTIC_APPROVER'], feature: 'analytics_enabled' },
            'audit': { roles: ['ADMIN', 'DOCTOR'] },
            'tenant_management': { roles: ['ADMIN'] },
            'branch_management': { roles: ['ADMIN'] },
            'patient_profile': { roles: ['ADMIN', 'DOCTOR', 'FRONT_DESK', 'DIAGNOSTIC_APPROVER'] },
            'hl7_transport': { roles: ['ADMIN'] },
            'superadmin': { roles: ['GLOBAL_ADMIN'] },
            'terminology_review': { roles: ['ADMIN', 'GLOBAL_ADMIN'] },
            'settings_governance': { roles: ['ADMIN'] }
        };
        const config = rolePermissions[view];
        if (!config) return false;

        // Check Role
        const roleAllowed = config.roles.includes(currentUser.role);
        if (!roleAllowed) return true;

        // Check Feature Entitlement
        if (config.feature && activeTenant) {
            const isEntitled = activeTenant.entitlements?.[config.feature] ?? true;
            if (!isEntitled) {
                console.warn(`[RBAC] Feature Gate: ${view} requires ${config.feature} (Disabled for Tenant)`);
                return true;
            }
        }

        return false;
    };

    // Auto-redirect if unauthorized view (useEffect must be before early return)
    useEffect(() => {
        if (!currentUser) return;
        if (isRestricted(activeView)) {
            console.warn(`RBAC: Unauthorized access attempt to [${activeView}] by ${currentUser.role}. Redirecting.`);
            
            // Sync effective impersonation status for redirection target
            const effectiveImpersonation = impersonatedTenant || JSON.parse(localStorage.getItem('impersonated_tenant') || 'null');
            const governanceViews = ['superadmin', 'audit', 'reports', 'hl7_transport', 'tenant_management', 'branch_management'];
            
            // Determine best 'home' for this role/context
            const homeView = (currentUser.role === 'GLOBAL_ADMIN' && !effectiveImpersonation) 
                ? (governanceViews.includes(activeView) ? activeView : 'superadmin') 
                : 'dashboard';
                
            setActiveView(homeView);
        }
    }, [activeView, currentUser, impersonatedTenant]);

    if (!currentUser) {
        if (activeView === 'portal') return <PatientPortal />;
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <DialogProvider>
            <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* Impersonation Warning Banner */}
            {impersonatedTenant && (
                <div className="fixed top-0 left-0 right-0 z-[500] flex items-center justify-between px-6 py-2.5 bg-amber-500 text-white text-xs font-black uppercase tracking-widest shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>⚠ IMPERSONATING — {impersonatedTenant.name} (ID: {impersonatedTenant.id}) — All actions are logged to the Global Audit Ledger</span>
                    </div>
                    <button
                        onClick={exitImpersonation}
                        className="px-4 py-1.5 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        Exit Impersonation
                    </button>
                </div>
            )}
            {/* Push content below banner when impersonating */}
            {impersonatedTenant && <div className="fixed top-0 left-0 right-0 h-10 z-[99]" />}
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar
                activeTenant={activeTenant}
                impersonatedTenant={impersonatedTenant}
                activeView={activeView}
                setActiveView={(view) => {
                    setActiveView(view);
                    setIsSidebarOpen(false); // Auto-close on mobile
                }}
                currentUser={currentUser}
                isOpen={isSidebarOpen}
                isSlim={isSidebarSlim}
                setIsSlim={setIsSidebarSlim}
                systemVersion={systemVersion}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
            />

            <main className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ${isSidebarSlim ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <TopBar
                    activeTenant={activeTenant}
                    impersonatedTenant={impersonatedTenant}
                    tenants={tenants}
                    onTenantChange={handleTenantChange}
                    activeBranch={activeBranch}
                    branches={branches}
                    onBranchChange={handleBranchChange}
                    currentUser={currentUser}
                    onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarSlim={isSidebarSlim}
                    onSlimToggle={() => setIsSidebarSlim(!isSidebarSlim)}
                    onLogout={handleLogout}
                    searchTerm={searchTerm}
                    onSearch={setSearchTerm}
                />

                <div 
                    ref={contentRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden w-full custom-scrollbar scroll-smooth pb-44 lg:pb-0"
                >
                    <div className="p-4 sm:p-10 space-y-6 sm:space-y-10 max-w-[1600px] mx-auto min-h-full">
                    {(() => {
                        // Governance views that are stable even without a clinical tenant context
                        const isGovernanceView = ['superadmin', 'audit', 'hl7_transport'].includes(activeView);
                        
                        // SAFETY GATE: Ensure activeTenant matches currentUser's tenant_id (or impersonation) before rendering
                        // This prevents race-condition API calls to Tenant ID 1 during transition.
                        const expectedTenantId = impersonatedTenant?.id || currentUser?.tenant_id;
                        const isUnaligned = !impersonatedTenant && currentUser?.role !== 'GLOBAL_ADMIN' && activeTenant?.id != expectedTenantId;

                        const showLoadingOverlay = (loading || isTransitioning);
                        const showUnalignedOverlay = isUnaligned && !isGovernanceView;
                        
                        if (showLoadingOverlay || showUnalignedOverlay) {
                            return (
                                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] shadow-sleek">
                                    <div className="w-16 h-16 border-4 border-his-green-500 border-t-transparent rounded-full animate-spin mb-6" />
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight italic">
                                        {showUnalignedOverlay ? "Synchronizing Organization Context..." : (isTransitioning ? "Securing Tenant Environment..." : "Initializing juanclinic Secure Environment...")}
                                    </h3>
                                    {showUnalignedOverlay && <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">Enforcing Multi-Tenant Isolation Boundaries</p>}
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {/* Content View is rendered only when fully aligned and loaded */}
                    {(() => {
                        const isGovernanceView = ['superadmin', 'audit', 'hl7_transport'].includes(activeView);
                        const expectedTenantId = impersonatedTenant?.id || currentUser?.tenant_id;
                        const isUnaligned = !impersonatedTenant && currentUser?.role !== 'GLOBAL_ADMIN' && activeTenant?.id != expectedTenantId;
                        
                        // Hide content if loading or unaligned (unless it's a governance view)
                        if ((loading || isTransitioning || isUnaligned) && !isGovernanceView) {
                            return null;
                        }

                        return (
                            <div className="space-y-10">
                            {/* Modern View Router */}
                            {(() => {
                                switch (activeView) {
                                    case 'dashboard':
                                        return (
                                            <>
                                                {/* Welcome Header */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                                    <div>
                                                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
                                                        <p className="text-xs sm:text-sm font-bold text-slate-400 mt-2">Welcome back, <span className="text-his-green-500">{currentUser.name.split(' ')[currentUser.name.split(' ').length - 1]}</span>. Here's what's happening today.</p>
                                                    </div>
                                                    <div className="flex w-full sm:w-auto gap-3">
                                                        {!(currentUser.role === 'GLOBAL_ADMIN' && !impersonatedTenant) && (
                                                            <button onClick={() => setShowRegister(true)} className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 bg-his-green-500 text-white text-[10px] sm:text-xs font-black rounded-2xl hover:bg-his-green-600 transition-all uppercase tracking-widest shadow-xl shadow-his-green-500/20 flex items-center justify-center gap-2">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                                                                <span>Register Patient</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Dashboard Content */}
                                                <div className="space-y-6 sm:space-y-10">
                                                    {/* Stat Grid */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                                        <StatCard
                                                            title="Total Capacity"
                                                            value={patients.length}
                                                            trend="+12% vs last month"
                                                            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                        />
                                                        <StatCard
                                                            title="Doctors Active"
                                                            value={doctorsCount}
                                                            trend="Current shift"
                                                            icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                        />
                                                        <StatCard
                                                            title="Reports Generated"
                                                            value={dashboardStats?.stats?.total_revenue || 0}
                                                            trend="Statutory compliant"
                                                            icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                        <StatCard
                                                            title="HL7 Packets"
                                                            value={orders.length}
                                                            trend="Last 24h traffic"
                                                            icon="M13 10V3L4 14h7v7l9-11h-7z"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                                                        {/* Patient Registry Section */}
                                                        <div className="xl:col-span-2 space-y-10">
                                                            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sleek border border-his-slate-100 hover:shadow-2xl hover:shadow-his-slate-200/40 transition-all duration-500">
                                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                                                                    <div>
                                                                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Active Patient Registry</h2>
                                                                        <p className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Latest clinical admissions</p>
                                                                    </div>
                                                                    <div className="flex w-full sm:w-auto gap-3">
                                                                        <button onClick={() => setShowRegister(true)} className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 bg-his-green-500 hover:bg-his-green-600 active:scale-95 text-white rounded-2xl text-[9px] sm:text-[10px] font-black transition-all shadow-xl shadow-his-green-500/20 uppercase tracking-widest">Register Patient</button>
                                                                        <button onClick={() => setActiveView('patients')} className="flex-1 sm:flex-none px-6 py-3.5 sm:py-3 bg-his-slate-50 text-slate-400 rounded-2xl text-[9px] sm:text-[10px] font-black hover:bg-his-slate-100 transition-all uppercase tracking-widest border border-slate-100">View All</button>
                                                                    </div>
                                                                </div>
                                                                <div className="overflow-x-auto -mx-6 sm:mx-0">
                                                                     <div className="inline-block min-w-full align-middle px-6 sm:px-0">
                                                                         <table className="w-full">
                                                                             <thead>
                                                                                 <tr className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
                                                                                     <th className="pb-6 pl-2 text-left">Patient Details</th>
                                                                                     <th className="pb-6 text-left hidden md:table-cell">Gender</th>
                                                                                     <th className="pb-6 text-left hidden lg:table-cell">DOB</th>
                                                                                     <th className="pb-6 text-left hidden sm:table-cell">ID System</th>
                                                                                     <th className="pb-6 text-right pr-2">Status</th>
                                                                                 </tr>
                                                                             </thead>
                                                                             <tbody className="divide-y divide-slate-50">
                                                                                 {patients.map(p => (
                                                                                     <tr
                                                                                         key={p.id}
                                                                                         onClick={() => {
                                                                                             setSelectedPatient(p.id);
                                                                                             setActiveView('patient_profile');
                                                                                         }}
                                                                                         className="group hover:bg-his-slate-100/30 transition-all duration-300 cursor-pointer"
                                                                                     >
                                                                                         <td className="py-6 pl-2">
                                                                                             <div className="flex items-center gap-4 min-w-0">
                                                                                                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-his-slate-100 shrink-0 flex items-center justify-center text-slate-400 font-black text-xs sm:text-sm group-hover:bg-his-green-50 group-hover:text-his-green-500 transition-colors duration-300">
                                                                                                     {p.first_name[0]}{p.last_name[0]}
                                                                                                 </div>
                                                                                                 <div className="min-w-0 flex-1">
                                                                                                     <p className="font-black text-sm text-slate-900 leading-tight truncate">{p.first_name} {p.last_name}</p>
                                                                                                     <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest truncate">Medical Record</p>
                                                                                                 </div>
                                                                                             </div>
                                                                                         </td>
                                                                                         <td className="py-6 text-xs text-slate-500 font-bold uppercase tracking-widest hidden md:table-cell">{p.gender === 'M' ? 'Male' : 'Female'}</td>
                                                                                         <td className="py-6 text-xs text-slate-500 font-bold uppercase tracking-widest hidden lg:table-cell">{p.dob}</td>
                                                                                         <td className="py-6 hidden sm:table-cell">
                                                                                             <span className="text-[10px] font-mono font-bold text-slate-400 bg-his-slate-50 px-2 py-1 rounded-md border border-slate-100 italic">
                                                                                                 {p.patient_external_id}
                                                                                             </span>
                                                                                         </td>
                                                                                         <td className="py-6 text-right pr-2">
                                                                                             <div className="flex items-center justify-end gap-2">
                                                                                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                                                 <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-600 tracking-widest">Active</span>
                                                                                             </div>
                                                                                         </td>
                                                                                     </tr>
                                                                                 ))}
                                                                             </tbody>
                                                                         </table>
                                                                     </div>
                                                                 </div>
                                                            </div>

                                                            {/* Clinical Worklist Section */}
                                                            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sleek border border-his-slate-100 hover:shadow-2xl hover:shadow-his-slate-200/40 transition-all duration-500">
                                                                <div className="flex justify-between items-center mb-10">
                                                                    <div>
                                                                        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Clinical Worklist</h2>
                                                                        <p className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">Real-time HL7 Feed</p>
                                                                    </div>
                                                                    <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-his-green-50 hover:text-his-green-500 transition-all">
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
                                                                    {recentActivity.length > 0 ? recentActivity.map((log, i) => (
                                                                        <div key={log.id} className="flex gap-6 relative z-10 transition-transform hover:translate-x-1 cursor-default group">
                                                                            <div className="w-4 h-4 rounded-full bg-white border-4 border-his-green-500 shrink-0 group-hover:bg-his-green-500 transition-colors" />
                                                                            <div>
                                                                                <p className="text-xs font-black text-slate-900 leading-tight capitalize">
                                                                                    {log.event.replace('_', ' ')}: {log.auditable_type.split('\\').pop()}
                                                                                </p>
                                                                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                                                                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.user?.name || 'System'}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    )) : (
                                                                        <p className="text-[10px] font-bold text-slate-300 uppercase italic">No recent activity</p>
                                                                    )}
                                                                </div>
                                                                <button className="w-full mt-10 py-5 bg-his-slate-100/50 text-slate-500 text-[10px] font-black rounded-2xl hover:bg-his-slate-100 hover:text-slate-900 transition-all uppercase tracking-widest border border-transparent hover:border-his-slate-200">
                                                                    Full Audit History
                                                                </button>
                                                            </div>

                                                            {activeTenant && (
                                                                <div className="bg-slate-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                                                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                                                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="relative z-10">
                                                                        <div className="flex items-center gap-3 mb-6">
                                                                            <div className="w-2 h-2 rounded-full bg-his-green-500 animate-pulse" />
                                                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-his-green-500">Security Active</span>
                                                                        </div>
                                                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-4">Multi-Tenant<br />Isolation</h2>
                                                                        <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-[240px] truncate">
                                                                            All clinical data is strictly cryptographically isolated for <span className="text-white font-bold">{activeTenant.name}</span>.
                                                                        </p>
                                                                        <div className="mt-8 flex -space-x-4">
                                                                            {['US', 'UK', 'SG', 'JP', 'PH'].map((code, i) => (
                                                                                <div key={code} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-4 border-slate-900 flex items-center justify-center text-[10px] font-black tracking-tight ${i === 4 ? 'bg-his-green-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                                                    {code}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    case 'worklist':
                                        if (['TECH', 'DIAGNOSTIC_APPROVER'].includes(currentUser.role)) {
                                            return <RadiologyWorklist currentUser={currentUser} activeTenant={activeTenant?.id} searchTerm={searchTerm} />;
                                        }
                                        return <ClinicalWorklist currentUser={currentUser} activeTenant={activeTenant?.id} searchTerm={searchTerm} />;
                                    case 'reports':
                                        return <Reports activeTenant={activeTenant?.id} activeBranch={activeBranch?.id} />;
                                    case 'audit':
                                        return <AuditLogExplorer currentUser={currentUser} />;
                                    case 'patients':
                                        return (
                                            <Patients
                                                activeTenant={activeTenant}
                                                refreshTrigger={refreshTrigger}
                                                onOpenPatient={(id) => {
                                                    setSelectedPatient(id);
                                                    setActiveView('patient_profile');
                                                }}
                                                onNewPatient={() => setShowRegister(true)}
                                            />
                                        );
                                    case 'doctors':
                                        return <Doctors tenants={tenants} currentUser={currentUser} />;
                                    case 'messages':
                                    case 'message':
                                        return <Messages currentUser={currentUser} />;
                                    case 'appointments':
                                    case 'appointment':
                                        return <Appointments activeTenant={activeTenant} currentUser={currentUser} />;
                                    case 'pharmacy':
                                        return <PharmacyWorklist activeBranch={activeBranch} currentUser={currentUser} />;
                                    case 'medicine_management':
                                        return <MedicineManagement />;
                                    case 'billing':
                                        return <CashierDashboard />;
                                    case 'clinical_notes':
                                        return (
                                            <div className="flex items-center justify-center p-20 bg-white rounded-[2.5rem] border border-his-slate-100 shadow-sleek">
                                                <div className="text-center">
                                                    <div className="w-20 h-20 bg-his-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                        <svg className="w-10 h-10 text-his-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Clinical Documentation</h3>
                                                    <p className="text-sm font-bold text-slate-400 mt-2">Versioned medical notes with mandatory CDIM amendment tracking.</p>
                                                </div>
                                            </div>
                                        );
                                    case 'patient_profile':
                                        return <PatientProfile 
                                            patientId={selectedPatient} 
                                            onBack={() => {
                                                setSelectedPatient(null);
                                                setActiveView('dashboard');
                                            }} 
                                            activeTenant={activeTenant} 
                                            stagedPrescription={stagedPrescription}
                                            setStagedPrescription={setStagedPrescription}
                                        />;
                                    case 'referrals':
                                        return <Referrals activeTenant={activeTenant} activeBranch={activeBranch} />;
                                    case 'branch_management':
                                        return <BranchManagement activeTenant={activeTenant} tenants={tenants} />;
                                    case 'tenant_management':
                                        return <SettingsGovernance activeTenant={activeTenant} onTenantUpdate={fetchInitialData} />;
                                    case 'settings_governance':
                                        return <SettingsGovernance activeTenant={activeTenant} onTenantUpdate={fetchInitialData} />;
                                    case 'notification_settings':
                                        return <NotificationSettings />;
                                    case 'hl7_transport':
                                        return <HL7OutboxViewer />;
                                    case 'superadmin':
                                        return <SuperAdminDashboard />;
                                    case 'terminology_review':
                                        return <TerminologyReviewDashboard />;
                                    case 'drug_discovery':
                                        return <DrugDiscovery onPrescribe={handlePrescribeFromDiscovery} />;
                                    case 'help':
                                        return <HelpCenter />;

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
                        );
                    })()}
                    </div>
                </div>
            </main>

            <MobileNav 
                activeView={activeView} 
                setActiveView={setActiveView} 
                onOpenSidebar={() => setIsSidebarOpen(true)} 
            />

            {showRegister && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl transition-opacity duration-300">
                        <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-12 max-w-2xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 sm:p-8">
                                <button onClick={() => setShowRegister(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-his-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all group">
                                    <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <RegisterPatientForm
                                onPatientAdded={onPatientAdded}
                                onClose={() => setShowRegister(false)}
                                activeTenant={activeTenant}
                            />
                        </div>
                    </div>
                )}

                <InteractiveGuide activeView={activeView} />

                {/* Global Dialog Component */}
                <GlobalDialog />
            </div>
        </DialogProvider>
    );
}

export default App;
