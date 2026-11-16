export const API = "http://localhost:3000";
export async function api(path, options = {}) {
  const config = { headers: { "Content-Type": "application/json" }, ...options };
  const response = await fetch(`${API}/${path}`, config);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}
export const get = path => api(path);
export const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body) });
export const patch = (path, id, body) => api(`${path}/${id}`, { method: "PATCH", body: JSON.stringify(body) });
export const remove = (path, id) => api(`${path}/${id}`, { method: "DELETE" });
export function currentUser() {
  try { return JSON.parse(sessionStorage.getItem("paanilinkUser")); } catch { return null; }
}
export function requireUser() {
  const user = currentUser();
  if (!user) location.href = "../login.html";
  return user;
}
export function money(value) { return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`; }
export function statusBadge(status) {
  const cls = String(status || "").toLowerCase().replaceAll(" ", "-");
  return `<span class="status ${cls}">${status || "—"}</span>`;
}
export function escapeHTML(value="") {
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
