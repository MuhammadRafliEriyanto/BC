# Teacher Assessment Class-Aware Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the teacher assessment popup use only the classes taught by the logged-in teacher, auto-select the teacher subject, and separate Tryout from UTS/UAS by class grade.

**Architecture:** Reuse the existing teacher classes endpoint as the source of truth for class choices. Keep the current tryout storage path for final-grade Tryout creation, while preventing non-final classes from being saved as Tryout in the UI and backend. UTS/UAS creation is represented in the popup guidance and routed to the existing class detail grade workflow until a dedicated CBT model for UTS/UAS is added.

**Tech Stack:** Next.js client component, Express/Mongoose backend, existing teacher class and teacher tryout APIs.

---

### Task 1: Add shared assessment classification helpers

**Files:**
- Modify: `src/components/dashboard-guru/sections/TryoutGuruSection.tsx`

- [ ] Add helper functions to derive grade, final-class status, and assessment mode from class names.
- [ ] Use these helpers consistently in filters, labels, and validation.

### Task 2: Load teacher profile and taught classes into the tryout section

**Files:**
- Modify: `src/components/dashboard-guru/sections/TryoutGuruSection.tsx`

- [ ] Extend the existing dashboard profile fetch to capture the logged-in teacher subject.
- [ ] Fetch `/api/teacher/me/classes`.
- [ ] Store class options with `id`, `branch`, `className`, `subject`, `assessmentMode`, and `jenjang`.

### Task 3: Change the add/edit popup to select taught class instead of manual jenjang/mapel

**Files:**
- Modify: `src/components/dashboard-guru/sections/TryoutGuruSection.tsx`

- [ ] Replace manual `Jenjang`, `Kelas`, and `Mapel` inputs with a class selector and read-only subject display.
- [ ] When a final class is selected, allow Tryout creation.
- [ ] When a non-final class is selected, show UTS/UAS guidance and block Tryout save.

### Task 4: Harden backend tryout creation against invalid classes

**Files:**
- Modify: `backend/src/controllers/teacherTryoutController.ts`

- [ ] Validate that the requested branch/class is actually taught by the authenticated teacher.
- [ ] Keep Tryout restricted to SD 6, SMP 9, and SMA 12.
- [ ] Auto-use teacher subject when the request subject is empty or different.

### Task 5: Verify

**Commands:**
- `npx tsc --noEmit`
- `npx eslint src/components/dashboard-guru/sections/TryoutGuruSection.tsx --max-warnings=0`
- `npm --prefix backend run build`
