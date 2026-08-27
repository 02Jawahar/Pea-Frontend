# PEA e-Exam 2.0 — Frontend

Frontend for the Puducherry Examining Authority's integrated e-Recruitment and
end-to-end Examination Management System.

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router 7 · Recharts

---

## What this is

A complete, runnable frontend for all eight portals in the RFP, backed by a
seeded in-memory mock API. Every screen renders real data — there are no
placeholder pages.

| Portal | Route root | Primary persona |
| --- | --- | --- |
| Candidate | `/candidate` | Candidate |
| Exam delivery | `/exam` | Candidate on exam day |
| Department | `/department` | Department Officer, Nodal Officer, HoD |
| Exam Admin | `/exam-admin` | Exam Officer, Merit Officer |
| Evaluator | `/evaluator` | Evaluator, Moderator, Evaluation Admin |
| Admin | `/admin` | Super Admin, System Admin |
| Centre Functionary | `/invigilator` | Centre Supervisor, Invigilator |
| Helpdesk | `/helpdesk` | Helpdesk Agent |
| Finance | `/finance` | Finance Concurrence |

### Role-based access control

RBAC is enforced, not cosmetic. `src/rbac/` defines 16 roles across 4 role
families, ~90 permissions and 8 portals. The same grant hides a navigation
entry, blocks a route and disables an action button — nothing is hidden with
CSS while remaining reachable.

Sign in at `/login` for staff or `/candidate/login` for candidates. The staff
login lists one demo account per role; **the OTP for every account is `123456`**.

| Employee ID | Role | Lands on |
| --- | --- | --- |
| `PEA0001` | Super Admin | Admin Portal |
| `PEA0002` | System Admin | Admin Portal |
| `REV1041` | Department Officer | Department Portal |
| `REV1002` | HoD Approver | Department Portal |
| `FIN2010` | Finance Concurrence | Finance inbox |
| `PEA0114` | Exam Officer | Exam Admin Portal |
| `MERIT001` | Merit Officer | Exam Admin Portal |
| `EVAL0001` | Evaluator | Evaluator Portal |
| `EVAL0044` | Moderator | Evaluator Portal |
| `PEA0207` | Evaluation Admin | Evaluator Portal |
| `CS00231` | Centre Supervisor | Centre Functionary Portal |
| `INV01188` | Invigilator | Centre Functionary Portal |
| `HD0031` | Helpdesk Agent | Helpdesk Console |
| `RPT0007` | Reports Officer | Exam Admin Portal |

Signing in as a Department Officer and then as a Super Admin is the quickest way
to see the gating: the same dashboard renders 6 Quick Action tiles for one and
12 for the other.

### Mock data

`src/mock/seed.ts` generates deterministic data from a fixed PRNG, so the same
figures appear on every machine. They match `PEA System_Demo.pptx` — 45,612
candidates, 24 examinations, 12,458 applications, 62% evaluation progress.

Writes go through `src/mock/api.ts` and persist to `localStorage`, so a demo
survives a page reload. **Reset demo data** at the bottom of any staff sidebar
restores the seeded state.

---

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 (falls forward if taken) |
| `npm run build` | `tsc -b` then `vite build` — a type error fails the build |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript only |
| `npm run format` | Prettier |

---

## Docker

The image is a two-stage build: Node compiles the bundle, nginx serves it.

```bash
docker build -t pea-frontend .
docker run --rm -p 8080:80 pea-frontend
# http://localhost:8080
```

Or with compose:

```bash
docker compose up --build
# http://localhost:8080
```

### Build arguments

Vite inlines `import.meta.env.VITE_*` **at build time**, so these are Docker
build args, not runtime environment variables. Changing one requires a rebuild.

| Build arg | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Base URL of the backend API |
| `VITE_APP_NAME` | `PEA` | App name shown in the header and titles |

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.pea.pondi.gov.in/api \
  --build-arg VITE_APP_NAME=PEA \
  -t pea-frontend .
```

If a build arg is omitted the app falls back to the default and logs a warning —
it will not white-screen.

### nginx

`nginx.conf` handles the three things a React Router SPA needs in production:

- unmatched paths fall back to `index.html`, so refreshing on
  `/exam-admin/dashboard` does not 404
- hashed assets under `/assets/` are cached for a year and marked immutable
- `index.html` is never cached, so a deploy cannot leave a client on a stale
  bundle whose assets have already been replaced

`/healthz` returns `200 ok` for health probes.

---

## Deploying to Dokploy

1. **Create the application** — Dokploy → *Create Application* → source
   **GitHub**, repository `02Jawahar/Pea-Frontend`, branch `main`.
2. **Build type** — choose **Dockerfile**. Leave the path as `./Dockerfile`.
3. **Build args** — add `VITE_API_BASE_URL` (and `VITE_APP_NAME` if you want a
   different label) under *Build Arguments*. These must be build args; setting
   them as runtime environment variables has no effect on a Vite bundle.
4. **Port** — the container listens on **80**.
5. **Domain** — add your domain and enable HTTPS. Dokploy's Traefik proxy
   terminates TLS in front of nginx.
6. **Deploy.** Subsequent pushes to `main` redeploy if you enable auto-deploy.

Health check path: `/healthz`.

---

## Project structure

```
src/
  components/
    charts/       Recharts wrappers on the shared palette
    common/       DataTable, KpiCard, StatusPill, StepperWizard, Modal,
                  OtpModal, DigitalSignModal, WorkflowTrail, ApprovalBar,
                  DocumentUpload, AuditTrailPanel, GrievanceLauncher
    layout/       Shell A (public/candidate), Shell B (staff), navigation
  config/         Typed environment access
  constants/      Route map, storage keys
  context/        Auth (staff and candidate are separate identities), UI prefs
  hooks/          useAuth, useCan, useAsync, useUi
  mock/           Seed data and the mock API
  pages/          One folder per portal
  rbac/           Permissions, roles, access helpers
  routes/         Route tree and guards
  types/          Domain types
```

### Conventions worth knowing

- **Status vocabulary is fixed.** `StatusPill` accepts only the strings defined
  in the spec; they appear across portals and must not drift.
- **Marks carry 4 decimal places** everywhere — evaluation, merit, scorecard.
  Rounding is a merit-ranking decision, not a formatting one.
- **Workflow tasks address offices, never people.** A user inherits their
  position from the office they are mapped to.
- **Every screen defines five states** — loading (skeletons, never spinners on
  tables), empty, error, partial and read-only.
- **Nine digital-signature checkpoints** all route through `DigitalSignModal`.

---

## Accessibility

WCAG 2.1 AA. Font resize (`A- A A+`) and the high-contrast toggle persist across
sessions. Language switcher covers English, Tamil, Malayalam and Telugu.
Exam delivery supports scribe mode and compensatory time as visible, announced
states.

---

## Status

This is a frontend against mock data. The API layer (`src/lib/axios.ts`) is
wired with auth-token and error interceptors but the screens read from
`src/mock/api.ts`. Swapping in a real backend means replacing that module.
