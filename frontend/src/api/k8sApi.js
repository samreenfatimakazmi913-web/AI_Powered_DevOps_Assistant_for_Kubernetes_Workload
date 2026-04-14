const BASE_URL = "http://localhost:5000/api";

// Returns all namespaces the current developer is allowed to see (empty = admin/all)
function getUserNamespaces() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "developer") {
      const arr = Array.isArray(user?.team?.namespaces) && user.team.namespaces.length
        ? user.team.namespaces
        : user?.team?.namespace ? [user.team.namespace] : [];
      return arr;
    }
  } catch {}
  return [];
}

function nsParam(extra = {}) {
  const namespaces = getUserNamespaces();
  const params = new URLSearchParams();
  if (namespaces.length) params.set("namespace", namespaces.join(","));
  Object.entries(extra).forEach(([k, v]) => params.set(k, v));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchPods() {
  const res = await fetch(`${BASE_URL}/pods${nsParam()}`);
  return res.json();
}

export async function fetchNodes() {
  const res = await fetch(`${BASE_URL}/nodes`);
  return res.json();
}

export async function fetchDeployments() {
  const res = await fetch(`${BASE_URL}/deployments${nsParam()}`);
  return res.json();
}

export async function fetchJobs() {
  const res = await fetch(`${BASE_URL}/jobs${nsParam()}`);
  return res.json();
}

export async function fetchCronJobs() {
  const res = await fetch(`${BASE_URL}/cronjobs${nsParam()}`);
  return res.json();
}

export async function fetchNamespaces() {
  const res = await fetch(`${BASE_URL}/namespaces${nsParam()}`);
  return res.json();
}

export async function fetchLogs(ns, pod) {
  const res = await fetch(`${BASE_URL}/logs/${ns}/${pod}`);
  return res.text();
}

export async function fetchServiceMetrics(namespace, service, port) {
  const res = await fetch(
    `${BASE_URL}/prometheus-metrics?namespace=${namespace}&service=${service}&port=${port}`
  );
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}
