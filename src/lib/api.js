const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ai-business-manager-backend-production.up.railway.app";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken()
        ? { Authorization: `Bearer ${getToken()}` }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.message || data.error || `Request failed: ${res.status}`
    );
  }

  return data;
}

export const api = {
  login: (email, businessName) =>
    request("/api/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({
        email,
        businessName,
      }),
    }),

  entry: (text) =>
    request("/api/entry", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  ask: (question) =>
    request("/api/ask", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),

  snapshot: () => request("/api/reports/snapshot"),
  transactions: () => request("/api/transactions"),
  plan: () => request("/api/plan"),
  adminOverview: () => request("/api/admin/overview"),
  adminBusinesses: () => request("/api/admin/businesses"),

  adminSetPlan: (id, plan) =>
    request(`/api/admin/businesses/${id}/plan`, {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),
};

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function isLoggedIn() {
  return Boolean(getToken());
}
