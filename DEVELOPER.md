# KubeAssist — Developer Reference

This document is the technical companion to the main README. It covers the full system architecture, data flow, component breakdown, API contracts, and design decisions. Start here when contributing new features or debugging the platform.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Backend Deep Dive](#2-backend-deep-dive)
   - [Entry Point & Express App](#21-entry-point--express-app)
   - [Kubernetes API Layer](#22-kubernetes-api-layer)
   - [Multi-Namespace Strategy](#23-multi-namespace-strategy)
   - [AI Service Pipeline](#24-ai-service-pipeline)
   - [Kube Exec Service](#25-kube-exec-service)
   - [MongoDB Models](#26-mongodb-models)
   - [Routes Reference](#27-routes-reference)
3. [Frontend Deep Dive](#3-frontend-deep-dive)
   - [App Entry & Routing](#31-app-entry--routing)
   - [Authentication & Session](#32-authentication--session)
   - [Layout System](#33-layout-system)
   - [Namespace Access Control (Frontend)](#34-namespace-access-control-frontend)
   - [Page Components](#35-page-components)
   - [Shared Components](#36-shared-components)
   - [API Helper — k8sApi.js](#37-api-helper--k8sapijs)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
   - [Login Flow](#41-login-flow)
   - [Developer Workload View](#42-developer-workload-view)
   - [AI Query Flow](#43-ai-query-flow)
   - [Troubleshoot Exec Flow](#44-troubleshoot-exec-flow)
5. [Access Control Model](#5-access-control-model)
6. [Key Design Decisions](#6-key-design-decisions)
7. [Adding a New Feature — Checklist](#7-adding-a-new-feature--checklist)
8. [Known Limitations & TODOs](#8-known-limitations--todos)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Browser (React SPA)                      │
│  ┌──────────┐  ┌────────────┐  ┌───────────────────────────┐ │
│  │ Sidebar  │  │  Topbar    │  │   Page Component          │ │
│  │ (nav)    │  │ (auth/menu)│  │   (Dashboard / Workloads  │ │
│  └──────────┘  └────────────┘  │    / AI / Admin / ...)    │ │
│                                └────────────┬──────────────┘ │
└─────────────────────────────────────────────┼────────────────┘
                                              │ fetch / axios
                                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  Node.js / Express 5 Backend                  │
│                      (localhost:5000)                         │
│                                                               │
│  ┌───────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ /api/auth │  │ /api/users   │  │  /api/teams            │ │
│  │ /api/ai   │  │ /api/pods    │  │  /api/deployments      │ │
│  └───────────┘  │ /api/events  │  │  /api/logs/:ns/:pod    │ │
│                 │ /api/metrics │  │  /api/troubleshoot/run │ │
│                 └──────┬───────┘  └───────────┬────────────┘ │
│                        │                      │               │
│              ┌─────────▼────────┐   ┌─────────▼────────────┐ │
│              │ @kubernetes/     │   │  MongoDB (Mongoose)   │ │
│              │  client-node     │   │  Users / Teams        │ │
│              └─────────┬────────┘   └──────────────────────┘ │
│                        │                                      │
│              ┌─────────▼────────┐   ┌──────────────────────┐ │
│              │ Kubernetes API   │   │   Groq Cloud API      │ │
│              │ (cluster)        │   │   LLaMA 3.1-8B        │ │
│              └──────────────────┘   └──────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Key characteristics:**
- The backend is a **single Express process** — no microservices.
- Kubernetes communication uses the **official `@kubernetes/client-node` SDK** — it reads from `~/.kube/config` (or the in-cluster service account if deployed inside K8s).
- AI calls go to **Groq Cloud** (external) — all LLM logic is server-side, never exposed to the browser.
- The frontend is a **pure SPA** — all routing is client-side via React Router 7.
- Auth is **localStorage-based** with a dummy token (see [Known Limitations](#8-known-limitations--todos)).

---

## 2. Backend Deep Dive

### 2.1 Entry Point & Express App

**File:** `backend/index.js`

This single file does most of the heavy lifting:

```
connectDB()                  ← MongoDB connection
app.use(cors())
app.use(express.json())

app.use("/api/teams",  teamRoutes)
app.use("/api/users",  userRoutes)
app.use("/api/auth",   authRoutes)
app.use("/api/ai",     aiRoutes)

// Kubernetes clients initialised once at startup:
kc.loadFromDefault()
coreApi   = CoreV1Api
appsApi   = AppsV1Api
batchApi  = BatchV1Api
metricsApi = CustomObjectsApi

// Inline route handlers for all K8s resources
// (pods, deployments, events, logs, metrics, troubleshoot, etc.)
```

The K8s client instances are **module-level singletons** — they are created once when the process starts and reused across all requests.

### 2.2 Kubernetes API Layer

All K8s resource endpoints follow the same pattern:

```js
app.get("/api/<resource>", async (req, res) => {
  const nsList = parseNamespaces(req.query);          // parse ?namespace=ns1,ns2
  const items = await multiNsFetch(                   // fetch per-ns, then flatten
    nsList,
    ns => api.listNamespaced<Resource>({ namespace: ns }),
    () => api.list<Resource>ForAllNamespaces()
  );
  res.json(items);
});
```

**`parseNamespaces(query)`** — Reads `req.query.namespace` (or `req.query.namespaces`), splits on commas, trims whitespace, and returns a clean `string[]`. Empty array means "all namespaces" (admin view).

**`multiNsFetch(nsList, singleFn, allFn)`** — If `nsList` is empty, calls `allFn()`. Otherwise calls `singleFn(ns)` for each namespace in parallel (`Promise.all`) and flattens the resulting `items` arrays.

### 2.3 Multi-Namespace Strategy

A team can be assigned multiple namespaces (`team.namespaces: string[]`). The frontend encodes them as a comma-separated query string:

```
GET /api/pods?namespace=staging,production
```

The backend splits this and fetches each namespace in parallel, merging the results before returning. This is transparent to the frontend — it always gets a flat array.

**Affected endpoints:** `/api/pods`, `/api/deployments`, `/api/daemonsets`, `/api/statefulsets`, `/api/jobs`, `/api/cronjobs`, `/api/namespaces`, `/api/events`, `/api/pod-metrics`, `/api/container-metrics`.

### 2.4 AI Service Pipeline

**Files:** `backend/services/aiService.js`, `backend/controllers/aiController.js`, `backend/services/handlers/`

The AI query pipeline has two stages:

#### Stage 1 — Intent Classification (`analyzePrompt`)

The raw user message is sent to Groq (LLaMA 3.1-8B) with a strict system prompt that instructs the LLM to return **only JSON**. The JSON schema:

```json
{
  "resource": "pods | namespaces | jobs | cronjobs | deployments | services | null",
  "action":   "list | describe | health | fix",
  "name":     "<optional pod/deployment name>",
  "namespace": "default | <name> | all",
  "filter":   "running | failed | pending | unhealthy | ...",
  "output":   "list | count"
}
```

Temperature is set to **0** for deterministic intent parsing.

#### Stage 2 — Data Fetch + Response Formatting

`aiController.js` uses the parsed intent to:

1. **Override namespace** — if `userNamespace` is provided in the request body (developer's scoped namespace), it replaces whatever the LLM suggested.
2. **Call the appropriate handler** from `backend/services/handlers/` — each handler fetches real cluster data and returns a structured response (table data + summary text + suggestions).
3. For `action=fix` — bypass Stage 1 entirely, call `generateAdvice()` with the last stored issue context from `req.body.lastIssue`.

**Handlers:**

| File | Purpose |
|---|---|
| `pods.handler.js` | Fetch pods, apply status filter, return table + unhealthy summary |
| `deployments.handler.js` | Fetch deployments, health check |
| `jobs.handler.js` | Fetch jobs, filter by success/failure |
| `cronjobs.handler.js` | Fetch CronJobs |
| `namespaces.handler.js` | List/describe namespaces |
| `logs.handler.js` | Fetch logs for a named pod |
| `services.handler.js` | List services, filter by type |

#### Fix / Remediation Flow

`generateAdvice()` sends a second Groq call with:
- The last issue context (pod name, namespace, error reasons, K8s events)
- The user's follow-up question

Temperature is **0.3** to allow some variability in advice wording while staying grounded.

**Fast-path detection:** Before calling Groq for intent classification, `isRemediationQuery()` checks the message against a set of regex patterns (`/how.*fix/i`, `/help me fix/i`, etc.). If matched, it skips Stage 1 and goes directly to `generateAdvice()`.

### 2.5 Kube Exec Service

**File:** `backend/services/kube.service.js`

The troubleshooting tab executes arbitrary commands inside a cluster namespace using a **debug pod** strategy:

1. **`ensureDebugPod(namespace)`** — Checks if a pod named `debug-shell` exists in the namespace. If not (or if it completed/failed), creates it:
   ```
   kubectl run debug-shell --image=nicolaka/netshoot --restart=Never -n <ns> -- sleep infinity
   ```
   Then waits up to 90 seconds for it to be `Ready`.

2. **`runTroubleshootTool(namespace, command, abortSignal)`** — Calls `ensureDebugPod` then runs:
   ```
   kubectl exec debug-shell -n <ns> -- sh -c "<command>"
   ```
   Hard timeout: **60 seconds**. If the HTTP client disconnects (frontend cancelled), an `AbortController` signal kills the child process immediately.

3. **Safety blocklist** — A list of regex patterns blocks destructive commands: `rm -rf`, `dd if=`, `mkfs.*`, redirects to `/dev/`, `kubectl delete namespace`, `kubectl delete node`.

### 2.6 MongoDB Models

#### User

```js
{
  name:                  String (required),
  email:                 String (required, unique, lowercase),
  password:              String,
  resetPasswordToken:    String,
  resetPasswordExpires:  Date,
  role:                  "admin" | "developer" (default: "developer"),
  team:                  ObjectId → Team,
  profileImage:          String (file path),
  createdAt:             Date
}
```

#### Team

```js
{
  name:       String (required, unique),
  namespace:  String (legacy, synced to namespaces[0]),
  namespaces: [String] (primary field, default: []),
  createdAt:  Date
}
```

**Backward compatibility:** `namespace` (singular) is always kept in sync with `namespaces[0]`. Both the `POST /api/teams` and `PUT /api/teams/:id/namespaces` routes write to both fields. Frontend code checks `namespaces` first and falls back to `namespace`.

### 2.7 Routes Reference

#### `/api/auth`

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/login` | `{ email, password }` | `{ token, user: { id, name, email, role, team, profileImage } }` |
| POST | `/forgot-password` | `{ email }` | `{ resetLink }` |
| POST | `/reset-password/:token` | `{ newPassword }` | `{ message }` |

The `user.team` object in the login response is **fully populated** (via Mongoose `.populate("team")`), so the frontend gets the complete team document including `namespaces[]`.

#### `/api/users`

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/` | — | Returns all users with `role=developer`, team populated |
| POST | `/` | `{ name, email, password, teamId }` | Admin creates user |
| PUT | `/:id` | `{ name?, email?, teamId? }` | Edit user / change team |
| DELETE | `/:id` | — | Delete user |
| POST | `/upload-avatar` | `multipart/form-data` | Profile photo |
| PUT | `/change-password` | `{ userId, oldPassword, newPassword }` | — |

#### `/api/teams`

| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/` | — | All teams |
| POST | `/` | `{ name, namespaces[] }` | Create; validates unique name, at least one NS |
| PUT | `/:id` | `{ name?, namespaces[]? }` | Update name and/or namespaces |
| PUT | `/:id/namespaces` | `{ namespaces[] }` | Dedicated namespace update; syncs `namespace` field |

#### `/api/ai`

| Method | Path | Body |
|---|---|---|
| POST | `/query` | `{ message, userNamespace?, lastIssue? }` |

---

## 3. Frontend Deep Dive

### 3.1 App Entry & Routing

**File:** `frontend/src/App.js`

Routes are divided into two groups:

- **Public** (no auth required): `/`, `/about`, `/auth`, `/docs`, `/reset-password/:token`
- **Protected** (require login): all `/dashboard`, `/workloads`, `/events`, etc.

`ProtectedRoute` wraps every authenticated page. It reads `localStorage.getItem("user")` — if absent, redirects to `/auth`. Pass `adminOnly` prop to additionally restrict to `role === "admin"`.

### 3.2 Authentication & Session

**No JWT is used** (see [Known Limitations](#8-known-limitations--todos)). The login flow:

1. `POST /api/auth/login` returns `{ token: "dummy-token", user: { ... } }`.
2. Both `token` and `user` are written to `localStorage`.
3. All pages read from `localStorage` directly — there is no React context or global state.
4. Logout = `localStorage.clear()` + redirect.

The full `user` object (including `user.team.namespaces[]`) is stored at login time. **If team namespaces are changed by an admin after login, the developer must log out and back in to see the updated scoping.**

### 3.3 Layout System

```
App.js (BrowserRouter)
└── ProtectedRoute
    └── Layout
        ├── Sidebar (desktop: fixed column, mobile: overlay)
        ├── Topbar (sticky top)
        └── <main> (overflow-y-auto — only this scrolls)
            └── <PageComponent />
```

The `h-screen overflow-hidden` on the root div combined with `flex-1 overflow-y-auto` on `<main>` ensures the sidebar and topbar are always visible. Only the page content scrolls.

Pages that have their own **sticky subheader** (WorkloadsPage, EventsPage) use:

```css
sticky top-0 z-10 bg-slate-50
-mx-4 md:-mx-6 px-4 md:px-6   /* extend to edges to cover scrolled content */
```

The negative horizontal margin exactly cancels the `<main>` padding so the sticky bar appears full-width.

### 3.4 Namespace Access Control (Frontend)

Every page that fetches cluster data has this helper:

```js
function getUserNamespaces() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.role === "developer") {
    const arr = Array.isArray(user?.team?.namespaces) && user.team.namespaces.length
      ? user.team.namespaces
      : user?.team?.namespace ? [user.team.namespace] : [];
    return arr;  // e.g. ["staging", "production"]
  }
  return [];     // admin — empty means "all namespaces"
}
```

The returned array is joined with commas and sent as `?namespace=staging,production`. An empty array sends no namespace parameter, which the backend treats as "all namespaces" (admin view).

### 3.5 Page Components

#### `Dashboard.jsx`
- Auto-refreshes every 5 seconds via `setInterval`.
- Derives `unhealthyPods` by checking: `phase !== "Running"` OR (`phase === "Running"` AND any `containerStatus.ready === false`). This catches CrashLoopBackOff even when the pod phase is "Running".
- The "Namespaces" cluster summary card shows `namespaceFilter.length` for developers (their team's NS count), or unique namespaces derived from pod metadata for admins.

#### `WorkloadsPage.jsx`
- Single `useCallback`-wrapped `fetchData` that hits the relevant endpoint from `endpointMap` based on `activeTab`.
- Three independent filter states: `search` (free text), `nsFilter` (namespace dropdown), `statusFilter` (health status).
- Filtering is done client-side via `useMemo` on `rawData`.
- The namespace dropdown is populated from `[...new Set(rawData.map(r => r.metadata?.namespace))]` — only namespaces present in the current data set.

#### `EventsPage.jsx`
- Auto-refreshes every 15 seconds.
- Pagination: computed `currentPage`, `pageSize` (25/50/100 configurable), `totalPages`.
- `expandedRow` state for click-to-expand full message text.

#### `StructuredQuerying.jsx`
- Three sub-tabs: `TroubleshootTab`, `LogsTab`, `MetricsTab` (which contains `ResourceUsageTab` and `EndpointScrapeTab`).
- Shared `namespace` state at the parent level passed down as prop.
- For developers with exactly 1 namespace: the NS selector is disabled (`locked=true`). For developers with multiple namespaces, the selector is restricted to their team's list. Admins see all namespaces.
- Commands in the Troubleshoot tab use `AbortController` passed through `fetch` → backend → `kube.service` so cancellation propagates all the way to the `kubectl exec` child process.

#### `AIAssistant.jsx`
- Maintains `messages[]` array locally (no persistence).
- Passes `lastIssue` (the last AI response that identified pod failures) back to the backend with each request for context-aware follow-up answers.
- Suggestion commands rendered as copyable `<CopyButton>` elements.

#### `AdminDashboard.jsx`
- Four tabs: **Teams** (card grid), **Developers** (searchable table), **Create Team** (form), **Add Developer** (form).
- `getTeamNs(team)` helper handles backward compat: returns `team.namespaces` if populated, else wraps `team.namespace` in an array.
- Kebab dropdown for developer actions uses `openMenuId` state + `useRef` for the close-on-outside-click pattern. The table wrapper has no `overflow-hidden` to prevent clipping.
- `EditNamespacesModal` — checkbox list of all K8s namespaces; calls `PUT /api/teams/:id/namespaces`.

#### `TeamDetailPage.jsx`
- Fetches both team members and all available K8s namespaces on mount.
- Namespace badges in the header are individually removable.
- "Add namespace" picker shows only namespaces not already assigned.

#### `LogViewer.jsx`
- The namespace selector is pre-populated with the team's namespaces (developer) or all cluster namespaces (admin).
- Pod list re-fetches when `selectedNs` changes.
- Container list re-fetches when `selectedPod` changes.
- Supports tail-line count, previous-crash log toggle, and in-page text search (highlights via CSS).

### 3.6 Shared Components

| Component | File | Purpose |
|---|---|---|
| `Sidebar` | `components/Sidebar.jsx` | Navigation links; admin-only "Admin Panel" link conditionally rendered based on `user.role` |
| `Topbar` | `components/Topbar.jsx` | User avatar, account dropdown (change password, edit photo, logout) |
| `ResourceUsageCard` | `components/charts/ResourceUsageCard.jsx` | Recharts `PieChart` wrapper. Accepts `unit="cpu"` or `unit="memory"`. Tooltip formats millicores → `Xm` / `X cores` and MiB → `X MiB` / `X GiB`. Items below 1% threshold are collapsed into "Others". |
| `ProtectedRoute` | `routes/ProtectedRoute.jsx` | HOC: checks localStorage for user, optionally checks `adminOnly` |
| AI table components | `components/ai/` | Formatted table renderers for the AI Assistant response (`PodTable`, `DeploymentTable`, etc.) |

### 3.7 API Helper — k8sApi.js

**File:** `frontend/src/api/k8sApi.js`

Provides typed fetch wrappers used across the codebase:

```js
getUserNamespaces()  // → string[] (team namespaces or [] for admin)
nsParam(extra?)      // → "?namespace=ns1,ns2&key=val" query string builder

fetchPods()
fetchDeployments()
fetchJobs()
fetchCronJobs()
fetchNamespaces()
fetchNodes()
fetchLogs(ns, pod)
fetchServiceMetrics(namespace, service, port)
```

All functions use `nsParam()` internally, so namespace scoping is automatic.

---

## 4. Data Flow Diagrams

### 4.1 Login Flow

```
Browser                     Backend                  MongoDB
  │                            │                        │
  │─── POST /api/auth/login ──►│                        │
  │    { email, password }     │                        │
  │                            │─── User.findOne ──────►│
  │                            │    .populate("team")   │
  │                            │◄── user doc ───────────│
  │                            │                        │
  │◄── { token, user } ────────│
  │                            │
  │── localStorage.setItem("user", JSON.stringify(user))
  │── localStorage.setItem("token", token)
  │
  │── navigate("/dashboard")
```

### 4.2 Developer Workload View

```
WorkloadsPage mounts
  │
  ├── getUserNamespaces() → ["staging", "production"]
  ├── nsQuery = "?namespace=staging,production"
  │
  ├── GET /api/pods?namespace=staging,production
  │         │
  │    Backend: parseNamespaces → ["staging", "production"]
  │    multiNsFetch:
  │      Promise.all([
  │        coreApi.listNamespacedPod({ namespace: "staging" }),
  │        coreApi.listNamespacedPod({ namespace: "production" })
  │      ])
  │    → flatten → res.json(items)
  │         │
  └── setRawData(items)  → filter/search → render table
```

### 4.3 AI Query Flow

```
User types: "show unhealthy pods in staging"
      │
      ▼
POST /api/ai/query
{ message: "show unhealthy pods in staging", userNamespace: "staging" }
      │
      ▼
aiController.js
  isRemediationQuery("show unhealthy...") → false
      │
      ▼
analyzePrompt(message)  ──► Groq API (LLaMA 3.1-8B, temp=0)
                        ◄── { resource:"pods", action:"health",
                               namespace:"staging", filter:"unhealthy" }
      │
      ▼
override namespace with userNamespace ("staging")
      │
      ▼
pods.handler.js
  GET /api/pods?namespace=staging (internal fetch)
  filter containerStatuses for not-ready pods
  kubectl describe each unhealthy pod → extract Events
  return { type:"table", data:[], summary:"", suggestions:[], lastIssue:{} }
      │
      ▼
res.json(handlerResult) ──► Browser renders PodTable + summary
```

### 4.4 Troubleshoot Exec Flow

```
User clicks "Run" in TroubleshootTab
      │
      ▼
POST /api/troubleshoot/run
{ namespace: "staging", command: "netstat -tuln" }
      │
      ▼ (safety blocklist check)
      │
      ▼
runTroubleshootTool("staging", "netstat -tuln", abortSignal)
      │
      ▼
ensureDebugPod("staging")
  kubectl get pod debug-shell -n staging  → NotFound
  kubectl run debug-shell --image=nicolaka/netshoot --restart=Never -n staging -- sleep infinity
  kubectl wait pod debug-shell -n staging --for=condition=Ready --timeout=90s
      │
      ▼
kubectl exec debug-shell -n staging -- sh -c "netstat -tuln"
      │
      ▼
res.json({ output: "..." })
      │
User clicks "Stop" → fetch.abort() → req "close" event → ac.abort() → child.kill("SIGTERM")
```

---

## 5. Access Control Model

```
Role: admin
  ├── Sees all namespaces in every view
  ├── Access to /admin and /admin/teams/:teamId
  ├── Can create/edit/delete teams and developers
  └── No namespace restriction on any API call

Role: developer
  ├── Bound to one Team (user.team)
  ├── Team has namespaces[] (e.g., ["staging"])
  ├── All K8s API calls automatically scoped to ?namespace=staging,...
  ├── Namespace selector in StructuredQuerying shows only team namespaces
  ├── Log viewer namespace dropdown shows only team namespaces
  └── Cannot access /admin routes (ProtectedRoute adminOnly)
```

**Note:** The namespace restriction is enforced on the **frontend** by passing namespace query params. The backend does not independently verify that the requesting user is authorised for the requested namespace. In a production system, this should be enforced server-side.

---

## 6. Key Design Decisions

### Why a single backend `index.js` for K8s routes?

The K8s API clients (`coreApi`, `appsApi`, etc.) need to be initialised once and shared. Keeping all K8s routes in `index.js` avoids circular dependency issues and keeps the client instances accessible without passing them between files.

### Why not use React Context for auth state?

The original implementation stored auth in `localStorage` and each component reads it directly. This avoids prop-drilling without needing a Context provider, but means state isn't reactive — logging out in one tab won't affect another. A future refactor should use Context + `useReducer`.

### Why the debug pod (netshoot) approach for troubleshooting?

Running commands directly on application containers is not always possible (containers may not have shells or basic tools). The `nicolaka/netshoot` image includes a full network debugging toolkit (`curl`, `netstat`, `nslookup`, `tcpdump`, etc.) and can reach cluster-internal services. One pod per namespace is created lazily and reused.

### Why Groq (LLaMA 3.1-8B) instead of GPT-4?

- **Speed**: LLaMA 3.1-8B on Groq hardware responds in ~200ms, making the chat feel instant.
- **Cost**: Groq free tier is sufficient for a small team's usage.
- **Determinism**: Temperature=0 for intent parsing gives highly consistent JSON output.

### Multi-namespace design

The `namespaces: [String]` field was added to the `Team` model while keeping the old `namespace: String` field for backward compatibility. New code always writes both. Frontend helpers check `namespaces` first, fall back to `namespace`. This allows existing teams in the database to work without a migration.

---

## 7. Adding a New Feature — Checklist

### Adding a new K8s resource endpoint

1. Add a route in `backend/index.js`:
   ```js
   app.get("/api/<resource>", async (req, res) => {
     const nsList = parseNamespaces(req.query);
     const items = await multiNsFetch(nsList, ns => api.listNamespaced<R>({ namespace: ns }), () => api.list<R>ForAllNamespaces());
     res.json(items);
   });
   ```
2. Add a fetch function in `frontend/src/api/k8sApi.js`:
   ```js
   export async function fetch<Resource>() {
     const res = await fetch(`${BASE_URL}/<resource>${nsParam()}`);
     return res.json();
   }
   ```
3. If the resource should appear in WorkloadsPage, add it to the `TABS` array and the `endpointMap` object.

### Adding a new page

1. Create `frontend/src/pages/NewPage.jsx`.
2. Import it in `App.js` and add a `<Route>` (with `ProtectedRoute` if authenticated).
3. Add a nav link to `components/Sidebar.jsx`.

### Adding a new AI resource handler

1. Create `backend/services/handlers/<resource>.handler.js`.
2. Export an async function `handle<Resource>(intent, userNamespace)` that returns:
   ```js
   { type: "table", columns: [], data: [], summary: "", suggestions: [], lastIssue: null }
   ```
3. Register it in `backend/controllers/aiController.js` in the resource-to-handler switch.

---

## 8. Known Limitations & TODOs

| # | Issue | Severity | Notes |
|---|---|---|---|
| 1 | **Dummy auth token** — `token = "dummy-token"` is returned on login; no JWT verification exists | High | Replace with `jsonwebtoken` + middleware guard on all protected routes |
| 2 | **Namespace auth is frontend-only** — a developer could craft a request with a different namespace | High | Backend should validate requested namespaces against the user's team on every K8s API call |
| 3 | **Plain-text passwords** — passwords are stored and compared as plain strings | Critical | Must add `bcrypt` hashing before any production use |
| 4 | **No persistent AI conversation** — `messages[]` is in-memory React state; cleared on refresh | Medium | Store in `localStorage` or a backend session |
| 5 | **Single debug pod per namespace** — concurrent users in the same namespace share one `debug-shell` pod | Medium | Pod naming should include a session/user ID suffix |
| 6 | **No rate limiting** — `/api/ai/query` and troubleshoot endpoints have no throttle | Medium | Add `express-rate-limit` |
| 7 | **kubeconfig on the host** — backend reads `~/.kube/config`; no in-cluster service account setup | Low | For production K8s deployment, use `kc.loadInCluster()` |
| 8 | **No dark mode** — CSS variables reference `dark:` Tailwind classes but the toggle is not wired | Low | Add a `ThemeProvider` context with `localStorage` persistence |
| 9 | **Team namespaces not re-loaded after admin change** — developer must re-login | Low | Emit a `/api/users/me` refresh endpoint and poll it |
