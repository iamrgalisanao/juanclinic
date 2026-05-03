# UI Responsiveness Hardening & Clinical Safety Fix

This plan addresses UI layout issues on mobile devices (TopBar crowding, tab overflow) and fixes a 500 error in the EntitlementService that blocks clinical data visibility.

## User Review Required

> [!IMPORTANT]
> The TopBar on mobile will be refactored to hide the Tenant/Branch switchers by default, moving them into a secondary "Context" menu to prevent horizontal overflow and layout breaking.

## Proposed Changes

### Backend Hardening

#### [MODIFY] [EntitlementService.php](file:///Users/teamsolo/Documents/Dev/juanclinic/backend/app/Services/EntitlementService.php)
- Add `app()->bound('tenant')` check before resolving the `tenant` instance. This prevents 500 `BindingResolutionException` errors if an API request is made before the tenant context is fully established.

### Frontend Responsiveness

#### [MODIFY] [TopBar.jsx](file:///Users/teamsolo/Documents/Dev/juanclinic/frontend/src/components/TopBar.jsx)
- **Mobile Spacing**: Refactor the flex layout to prioritize the Sidebar toggle and Profile on small screens.
- **Context Switchers**: Hide Tenant/Branch switchers on `xs` and `sm` screens, or wrap them into a single "Context" badge that reveals them on click.
- **Padding/Gap Adjustment**: Reduce horizontal gaps and padding for mobile views.

#### [MODIFY] [PatientProfile.jsx](file:///Users/teamsolo/Documents/Dev/juanclinic/frontend/src/components/clinical/PatientProfile.jsx)
- **Tab Overflow**: Add `overflow-x-auto` and `scrollbar-hide` to the tab container to ensure all clinical tabs (General, Pediatrics, Vitals, etc.) are accessible on mobile.
- **Scroll Indicators**: (Optional) Add subtle fade-out edges to indicate horizontal scrolling.

## Verification Plan

### Automated Tests
- Run `php -l` on modified backend files.
- Use the browser subagent to:
    1. Verify the 500 error is resolved (Neonatal Dashboard loads).
    2. Verify TopBar items no longer overlap on 390px width.
    3. Verify Patient Profile tabs can be scrolled horizontally on mobile.

### Manual Verification
- Visual inspection of the "Context" switcher on mobile.
- Confirming "Corrected Age" displays correctly as an integer now that the 500 error is gone.
