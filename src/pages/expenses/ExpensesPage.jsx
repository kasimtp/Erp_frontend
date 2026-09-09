import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import client from "../../api/client";
import { downloadReportPDF } from "../../utils/pdfExportUtils";

const CATEGORIES = [
  "All", "Rent", "Salaries", "Utilities", "Transport", "Software",
  "Marketing", "Office Supplies", "Repairs", "Insurance", "Meals", "Travel", "Other",
];
const PAYMENT_METHODS = ["All", "Cash", "Bank Transfer", "Card", "UPI", "Cheque", "Other"];
const STATUSES = ["All", "paid", "pending", "cancelled"];

const statusClass = (s) => {
  const t = String(s).toLowerCase();
  if (t === "paid")      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (t === "pending")   return "bg-amber-50 text-amber-700 border border-amber-200";
  if (t === "cancelled") return "bg-rose-50 text-rose-700 border border-rose-200";
  return "bg-slate-100 text-slate-600 border border-slate-200";
};

const EMPTY_FORM = {
  title: "", category: "Other", amount: "", paymentMethod: "Cash",
  expenseDate: new Date().toISOString().slice(0, 10), reference: "", notes: "",
};

export default function ExpensesPage() {
  const [expenses, setExpenses]     = useState([]);
  const [metrics,  setMetrics]      = useState(null);
  const [loading,  setLoading]      = useState(false);
  const [notice,   setNotice]       = useState("");

  // Filters
  const [search,        setSearch]        = useState("");
  const [filterCat,     setFilterCat]     = useState("All");
  const [filterMethod,  setFilterMethod]  = useState("All");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [filterStart,   setFilterStart]   = useState("");
  const [filterEnd,     setFilterEnd]     = useState("");

  // Modal
  const [showModal,  setShowModal]  = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  const toast = (msg) => { setNotice(msg); setTimeout(() => setNotice(""), 3200); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)                          params.set("search",        search);
      if (filterCat    !== "All")          params.set("category",      filterCat);
      if (filterMethod !== "All")          params.set("paymentMethod", filterMethod);
      if (filterStatus !== "All")          params.set("status",        filterStatus);
      if (filterStart)                     params.set("startDate",     filterStart);
      if (filterEnd)                       params.set("endDate",       filterEnd);

      const [expRes, metricsRes] = await Promise.all([
        client.get(`/expenses?${params}`),
        client.get("/expenses/metrics"),
      ]);

      if (expRes.data.success)     setExpenses(expRes.data.data);
      if (metricsRes.data.success) setMetrics(metricsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterCat, filterMethod, filterStatus, filterStart, filterEnd]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        await client.put(`/expenses/${editTarget._id}`, form);
        toast("Expense updated successfully!");
      } else {
        await client.post("/expenses", form);
        toast("Expense recorded and saved to database!");
      }
      setShowModal(false);
      setEditTarget(null);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to save expense.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await client.delete(`/expenses/${id}`);
      toast("Expense deleted.");
      fetchData();
    } catch (err) {
      toast("Failed to delete expense.");
    }
  };

  const handleEdit = (exp) => {
    setEditTarget(exp);
    setForm({
      title: exp.title, category: exp.category, amount: exp.amount,
      paymentMethod: exp.paymentMethod,
      expenseDate: exp.expenseDate ? new Date(exp.expenseDate).toISOString().slice(0, 10) : "",
      reference: exp.reference || "", notes: exp.notes || "",
    });
    setShowModal(true);
  };

  const handleDownloadPDF = () => {
    const columns = ["#", "Expense Number", "Title", "Category", "Date", "Payment Method", "Status", "Amount"];
    const rows = expenses.map((e, i) => [
      i + 1,
      e.expenseNumber || "",
      e.title,
      e.category,
      e.expenseDate ? new Date(e.expenseDate).toLocaleDateString("en-IN") : "",
      e.paymentMethod,
      e.status?.toUpperCase() || "",
      `Rs ${(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    ]);
    downloadReportPDF({
      reportTitle: "Expense Report",
      subtitle: "All recorded business expenses from database",
      filters: { startDate: filterStart, endDate: filterEnd, status: filterStatus, category: filterCat, search },
      metrics: [
        { label: "Total Expenses",       value: `Rs ${(metrics?.totalAll       || 0).toLocaleString("en-IN")}` },
        { label: "This Month",           value: `Rs ${(metrics?.totalMonthly   || 0).toLocaleString("en-IN")}` },
        { label: "Today",                value: `Rs ${(metrics?.totalToday     || 0).toLocaleString("en-IN")}` },
        { label: "Total Records",        value: expenses.length },
        { label: "Top Category",         value: metrics?.topCategory || "N/A" },
      ],
      columns,
      rows,
      fileName: `Expense_Report_${new Date().toISOString().slice(0,10)}.pdf`,
    });
  };

  const metricsCards = [
    { label: "Total Expenses",   value: `₹${(metrics?.totalAll     || 0).toLocaleString("en-IN")}`, Icon: TrendingDown, color: "rose" },
    { label: "This Month",       value: `₹${(metrics?.totalMonthly || 0).toLocaleString("en-IN")}`, Icon: Calendar,     color: "amber" },
    { label: "Today",            value: `₹${(metrics?.totalToday   || 0).toLocaleString("en-IN")}`, Icon: Wallet,       color: "teal"  },
    { label: "Top Category",     value: metrics?.topCategory || "N/A",                              Icon: AlertTriangle, color: "violet" },
  ];

  const iconColor = { rose: "text-rose-600 bg-rose-50", amber: "text-amber-600 bg-amber-50", teal: "text-teal-600 bg-teal-50", violet: "text-violet-600 bg-violet-50" };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="fixed right-5 top-24 z-50 max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          {notice}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Expense Management</h2>
          <p className="mt-1 text-sm text-slate-500">Record and track all business expenses with categories, payment methods, and full PDF export.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-xs font-medium text-teal-700 hover:bg-teal-100">
            <Download size={14} /> Export PDF
          </button>
          <button onClick={() => { setEditTarget(null); setForm(EMPTY_FORM); setShowModal(true); }}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700">
            <Plus size={16} /> Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricsCards.map(({ label, value, Icon, color }) => (
          <article key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <span className={`grid size-11 place-items-center rounded-xl ${iconColor[color]}`}>
                <Icon size={22} />
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      {/* Filters + Table */}
      <section className="card overflow-hidden">
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 border-b border-slate-200 p-4 sm:px-6">
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input py-2 pl-9 text-xs" placeholder="Search expenses..." />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
          <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
          <button onClick={() => { setSearch(""); setFilterCat("All"); setFilterMethod("All"); setFilterStatus("All"); setFilterStart(""); setFilterEnd(""); }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 hover:bg-slate-50">
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Exp. Number</th>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Amount</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map(exp => (
                <tr key={exp._id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 font-medium text-slate-900">{exp.expenseNumber}</td>
                  <td className="px-6 py-4 text-slate-700">{exp.title}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{exp.category}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {exp.expenseDate ? new Date(exp.expenseDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{exp.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(exp.status)}`}>
                      {exp.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    ₹{(exp.amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(exp)}
                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-teal-50 hover:text-teal-700">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(exp._id)}
                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!expenses.length && (
            <div className="p-12 text-center text-sm text-slate-400">
              {loading ? "Loading expenses from database..." : "No expense records found. Click 'Record Expense' to add one."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
          <span>Showing {expenses.length} expense records</span>
          <span className="font-semibold text-slate-900">
            Total: ₹{expenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString("en-IN")}
          </span>
        </div>
      </section>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700"><FileText size={18} /></span>
                <h3 className="font-semibold text-slate-900">{editTarget ? "Edit Expense" : "Record New Expense"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input" placeholder="e.g. Office Rent, Fuel, Salary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Category *</label>
                  <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
                    {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Amount (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="input" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className="input">
                    {PAYMENT_METHODS.filter(m => m !== "All").map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Expense Date</label>
                  <input type="date" value={form.expenseDate}
                    onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} className="input" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Reference / Invoice No.</label>
                <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                  className="input" placeholder="Optional reference" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="input resize-none" placeholder="Optional notes..." />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                  {saving ? "Saving..." : editTarget ? "Update Expense" : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
