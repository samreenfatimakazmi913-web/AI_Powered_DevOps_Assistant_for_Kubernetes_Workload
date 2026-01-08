const BASE_URL = "http://localhost:5000/api";

export async function fetchPods() {
  const res = await fetch(`${BASE_URL}/pods`);
  return res.json();
}

export async function fetchNodes() {
  const res = await fetch(`${BASE_URL}/nodes`);
  return res.json();
}

export async function fetchDeployments() {
  const res = await fetch(`${BASE_URL}/deployments`);
  return res.json();
}

export async function fetchJobs() {
  const res = await fetch(`${BASE_URL}/jobs`);
  return res.json();
}

export async function fetchCronJobs() {
  const res = await fetch(`${BASE_URL}/cronjobs`);
  return res.json();
}

export async function fetchLogs(ns, pod) {
  const res = await fetch(`${BASE_URL}/logs/${ns}/${pod}`);
  return res.text();
}
