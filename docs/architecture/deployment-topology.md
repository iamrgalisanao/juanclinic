# Deployment Topology

This document describes the runtime architecture and network placement of JuanClinic HIS components across different tiers (Solo, Group, Enterprise).

## 1. Component Overview
*   **JuanClinic Cloud (SaaS)**: Centralized Laravel/MySQL/Redis stack hosting multiple tenants.
*   **Clinic Gateway (Optional)**: A local edge-server for high-availability diagnostics.
*   **Client Devices**: React PWAs running on Tablets, Mobile, and Desktop workstations.

## 2. Tiered Topology

### Tier 1 (Solo Clinic)
*   **Cloud-Only**: Client devices connect directly to the Cloud SaaS instance.
*   **Connectivity**: High dependency on stable internet.

### Tier 2 (Group / Multi-Branch)
*   **Multi-Branch Sync**: Individual branches connect to a shared Cloud tenant.
*   **Branch Edge**: Optional local cache for high-speed diagnostic throughput within each branch.

### Tier 3 (Hospital / Enterprise)
*   **Hybrid / On-Prem**: Support for dedicated local infrastructure with cloud backup.
*   **Integration Layer**: Centralized HL7/FHIR gateway for LIS/RIS/PACS connectivity.

## 3. Network Requirements
*   **HTTPS (443)**: All traffic between Client and Cloud is TLS 1.3 encrypted.
*   **WebSockets (8080/443)**: Real-time clinical events via Laravel Reverb.
*   **Local LAN**: Required for peripheral integration (Printers, Lab equipment) and Edge-to-Cloud sync.

## 4. Availability and Fallbacks
*   **Cloud Outage**: Client devices revert to **Offline Mode** (as defined in `offline-action-matrix.md`).
*   **Local Outage**: Mobile devices switch to LTE/5G for direct cloud access.
*   **Recovery**: Automated re-sync of queued actions upon connectivity restoration.

## 5. Security Perimeter
*   **WAF (Web Application Firewall)**: Protects the Cloud API from rate-limiting and OWASP Top 10 exploits.
*   **Device Fingerprinting**: Restricts access to authorized clinic IDs and known hardware profiles.
