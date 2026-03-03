# Blueprint: Task Plan

## Phase 1: B - Blueprint (Vision & Logic)
- [/] Answer Discovery Questions (partially captured in `findings.md` + SOPs)
- [/] Define JSON Data Schema in `gemini.md` (backend/FE use a working JSON shape; formal spec still needs consolidation)
- [x] Research helpful resources
- [/] Approve Blueprint (architecture is implemented, but spec cleanup remains)

## Phase 2: L - Link (Connectivity)
- [x] Verify API connections and `.env` credentials (`tools/verify_laravel_env.py`)
- [x] Build minimal handshake scripts in `tools/`
- [x] Establish tenant + simulated-user headers for local end-to-end testing (frontend ↔ backend)

## Phase 3: A - Architect (The 3-Layer Build)
- [x] Create Tech SOPs in `architecture/` (Initial)
- [x] Implement runtime navigation/context layer in Laravel:
	- Tenant resolution (`ResolveTenant`)
	- Dev auth bypass (`DevAuthentication`)
	- Tenant membership guard (`EnsureUserBelongsToTenant`)
	- Role middleware + policies
- [/] Central Navigator script exists (conceptual/demo) but is not the production router
- [/] Deterministic Python tools exist; a couple scripts need small fixes to run cleanly in all modes

## Phase 4: S - Stylize (Refinement & UI)
- [x] Format payload deliverables (see `mockup/payload_delivery_sample.md`)
- [x] Apply CSS/HTML and intuitive layouts (React SPA + Tailwind UI patterns)
- [/] Present stylized results for feedback (UI exists; needs validation pass + minor alignment fixes)

## Phase 5: T - Trigger (Deployment)
- [ ] Cloud transfer
- [ ] Set up automation triggers
- [ ] Finalize Maintenance Log in `gemini.md`

## Stabilization / Hardening (Next Up)
- [ ] Align order approval status values (frontend uses `FINAL`; backend expects `COMPLETED`)
- [ ] Fix Python tool runtime issues (`schema_validator.py` missing imports, `generate_sample_dataset.py` import placement)
- [ ] Normalize `tenant_id` types across tables (appointments currently uses `uuid` vs bigint tenants)
- [ ] Decide and enforce audit logging coverage for non-core models (appointments, messages, etc.)
