const MechGoApi = (() => {
  const apiBase = window.MECHGO_API_BASE || "http://127.0.0.1:4173/api";
  const tokenKey = "mechgo-api-token";

  async function request(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    const token = localStorage.getItem(tokenKey);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "MechGo API request failed.");
    }
    return payload;
  }

  function saveSession(payload) {
    if (payload && payload.token) {
      localStorage.setItem(tokenKey, payload.token);
    }
    return payload;
  }

  return {
    health: () => request("/health"),
    register: (account) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify(account),
      }).then(saveSession),
    login: (credentials) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }).then(saveSession),
    currentUser: () => request("/me"),
    createBooking: (booking) =>
      request("/bookings", {
        method: "POST",
        body: JSON.stringify(booking),
      }),
    createSupportReport: (report) =>
      request("/support-reports", {
        method: "POST",
        body: JSON.stringify(report),
      }),
    createVerification: (verification) =>
      request("/verifications", {
        method: "POST",
        body: JSON.stringify(verification),
      }),
    adminOverview: () => request("/admin/overview"),
    signOut: () => localStorage.removeItem(tokenKey),
  };
})();

window.MechGoApi = MechGoApi;
