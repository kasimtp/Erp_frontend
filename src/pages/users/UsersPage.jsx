import {
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import client from "../../api/client";

const ROLE_OPTIONS = ["admin", "staff", "manager", "accountant"];

// ── Create User Modal ─────────────────────────────────────────────────────────
function CreateUserModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", role: "staff", status: "active",
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setForm({ name: "", email: "", phone: "", password: "", role: "staff", status: "active" });
    setError(""); setShowPass(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email and password are required."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    setSaving(true);
    try {
      const { data } = await client.post("/auth/users", form);
      if (data.success) {
        onSuccess(data.data);
        handleClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const ROLE_META = {
    admin:      { label: "Admin",      color: "bg-purple-100 text-purple-700 ring-1 ring-purple-300" },
    manager:    { label: "Manager",    color: "bg-blue-100 text-blue-700 ring-1 ring-blue-300" },
    accountant: { label: "Accountant", color: "bg-amber-100 text-amber-700 ring-1 ring-amber-300" },
    staff:      { label: "Staff",      color: "bg-slate-100 text-slate-700 ring-1 ring-slate-300" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-600">
              <UserPlus size={20} />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Create New User</h3>
              <p className="text-xs text-slate-500">Add a user account to the system</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              placeholder="e.g. John Smith"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              placeholder="user@company.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Password *</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100"
                placeholder="Min. 8 characters"
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">Role *</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role: r }))}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    form.role === r
                      ? "border-teal-400 bg-teal-50 text-teal-700 ring-2 ring-teal-100"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_META[r].color}`}>
                    {ROLE_META[r].label}
                  </span>
                  {form.role === r && <Check size={14} className="ml-auto text-teal-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-600">Account Status</label>
            <div className="flex gap-2">
              {["active", "inactive"].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, status: s }))}
                  className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                    form.status === s
                      ? s === "active"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition disabled:opacity-60">
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/auth/users");
      // Backend returns: { success, count, data: [...users] }
      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : (data.data?.users || []);
        setUsers(list.map(u => ({
          ...u,
          id: u._id || u.id,
          role: typeof u.role === "object" ? (u.role?.name?.toLowerCase() || "staff") : (u.role || "staff"),
        })));
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || "Failed to load users. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const { data } = await client.put(`/auth/users/${userId}`, { role: newRole });
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        showNotice(`Role updated to ${newRole}`);
      }
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setUpdatingId(userId);
    try {
      const { data } = await client.put(`/auth/users/${userId}`, { status: nextStatus });
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
        showNotice(`Account set to ${nextStatus}`);
      }
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"?`)) return;
    setUpdatingId(userId);
    try {
      const { data } = await client.delete(`/auth/users/${userId}`);
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showNotice(`"${userName}" deleted.`);
      }
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to delete user");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUserCreated = (newUser) => {
    const mapped = {
      ...newUser,
      id: newUser._id || newUser.id,
      role: typeof newUser.role === "object"
        ? (newUser.role?.name?.toLowerCase() || "staff")
        : (newUser.role || "staff"),
    };
    setUsers(prev => [mapped, ...prev]);
    showNotice(`User "${newUser.name}" created successfully!`);
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3200);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name?.toLowerCase().includes(query.toLowerCase()) ||
      u.email?.toLowerCase().includes(query.toLowerCase()) ||
      (u.phone && u.phone.includes(query));
    const matchesRole = selectedRole === "all" || u.role?.toLowerCase() === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalUsers   = users.length;
  const adminCount   = users.filter(u => u.role === "admin").length;
  const staffCount   = users.filter(u => u.role === "staff" || u.role === "manager" || u.role === "accountant").length;
  const activeCount  = users.filter(u => u.status === "active").length;

  const roleClass = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":      return "bg-purple-100 text-purple-700 ring-1 ring-purple-300";
      case "manager":    return "bg-blue-100 text-blue-700 ring-1 ring-blue-300";
      case "accountant": return "bg-amber-100 text-amber-700 ring-1 ring-amber-300";
      default:           return "bg-slate-100 text-slate-700 ring-1 ring-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="fixed right-5 top-24 z-50 max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-fade-in">
          {notice}
        </div>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleUserCreated}
      />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Users & Roles</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Registered accounts retrieved live from the MongoDB database.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <UserPlus size={16} />
            Create User
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-600">
              <Users size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{totalUsers}</p>
          <p className="mt-2 text-xs text-slate-400">Registered in Database</p>
        </article>

        <article className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Admins</p>
            <span className="grid size-9 place-items-center rounded-xl bg-purple-50 text-purple-600">
              <ShieldCheck size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{adminCount}</p>
          <p className="mt-2 text-xs text-slate-400">Full System Access</p>
        </article>

        <article className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Staff Members</p>
            <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <UserCheck size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{staffCount}</p>
          <p className="mt-2 text-xs text-slate-400">Staff / Manager / Accountant</p>
        </article>

        <article className="card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Active Accounts</p>
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Shield size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{activeCount}</p>
          <p className="mt-2 text-xs text-slate-400">Allowed Login Access</p>
        </article>
      </section>

      {/* Users Table */}
      <section className="card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="relative w-full sm:max-w-sm">
            <Search size={17} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input py-2.5 pl-10"
              placeholder="Search by name, email, phone..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase text-slate-400">Role:</span>
            {["all", ...ROLE_OPTIONS].map(r => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  selectedRole === r
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  {/* Name & Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-teal-100 font-semibold text-teal-700">
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 text-slate-600">{u.phone || "—"}</td>

                  {/* Role Selector */}
                  <td className="px-6 py-4">
                    <select
                      value={u.role || "staff"}
                      disabled={updatingId === u.id}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold uppercase outline-none transition ${roleClass(u.role)}`}
                    >
                      {ROLE_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="text-slate-900 bg-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusToggle(u.id, u.status)}
                      disabled={updatingId === u.id}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        u.status === "active"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {u.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 text-slate-500">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>

                  {/* Delete */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      disabled={updatingId === u.id}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Delete User"
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredUsers.length && !loading && (
            <div className="p-12 text-center text-sm text-slate-500">
              No matching user records found in the database.
            </div>
          )}
          {loading && (
            <div className="p-12 text-center text-sm text-slate-400">Loading users...</div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
          <span>Showing {filteredUsers.length} user(s) from database</span>
        </div>
      </section>
    </div>
  );
}
