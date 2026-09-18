import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import client from "../../api/client";
import CreateSaleModal from "../../components/sales/CreateSaleModal.jsx";
import { downloadQuotationPDF, shareQuotationWhatsApp } from "../../utils/pdfExportUtils";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-teal-50 text-teal-700 border-teal-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Action states
  const [convertingId, setConvertingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const toast = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3500);
  };

  const fetchQuotationsData = useCallback(async () => {
    setLoading(true);
    try {
      const [quotesRes, metricsRes] = await Promise.all([
        client.get("/quotations"),
        client.get("/quotations/metrics"),
      ]);

      if (quotesRes.data.success) {
        setQuotations(quotesRes.data.data || []);
      }

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load quotations:", err);
      toast("Error fetching quotation records from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotationsData();
  }, [fetchQuotationsData]);

  // Convert Quotation to Invoice
  const handleConvertToInvoice = async (quote) => {
    if (!window.confirm(`Convert quotation "${quote.documentNumber || quote.quotationNumber}" to a live Sales Invoice? This will deduct stock and update customer account.`)) {
      return;
    }

    setConvertingId(quote._id);
    try {
      const res = await client.post(`/quotations/${quote._id}/convert-to-invoice`);
      if (res.data.success) {
        toast(`Quotation converted to Invoice ${res.data.data.invoice?.documentNumber}!`);
        fetchQuotationsData();
      }
    } catch (err) {
      toast(err.response?.data?.message || "Failed to convert quotation to invoice.");
    } finally {
      setConvertingId(null);
    }
  };

  // Update Quotation Status
  const handleStatusChange = async (quoteId, newStatus) => {
    setUpdatingStatusId(quoteId);
    try {
      const res = await client.patch(`/quotations/${quoteId}/status`, { status: newStatus });
      if (res.data.success) {
        toast(`Status updated to ${newStatus.toUpperCase()}`);
        setQuotations((prev) =>
          prev.map((q) => (q._id === quoteId ? { ...q, status: newStatus } : q))
        );
      }
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete Quotation
  const handleDelete = async (quote) => {
    if (!window.confirm(`Delete quotation ${quote.documentNumber || quote.quotationNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await client.delete(`/quotations/${quote._id}`);
      if (res.data.success) {
        toast(`Quotation ${quote.documentNumber || quote.quotationNumber} deleted from database.`);
        fetchQuotationsData();
      }
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete quotation.");
    }
  };

  // Filtered rows
  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      // Search
      const searchStr = `${q.documentNumber || ""} ${q.customerName || q.customer?.name || ""} ${q.notes || ""}`.toLowerCase();
      if (search && !searchStr.includes(search.toLowerCase())) return false;

      // Status
      if (statusFilter !== "all" && q.status !== statusFilter) return false;

      // Date range
      if (startDate) {
        const qDate = new Date(q.createdAt).toISOString().slice(0, 10);
        if (qDate < startDate) return false;
      }
      if (endDate) {
        const qDate = new Date(q.createdAt).toISOString().slice(0, 10);
        if (qDate > endDate) return false;
      }

      return true;
    });
  }, [quotations, search, statusFilter, startDate, endDate]);

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
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <FileSpreadsheet size={20} />
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">Quotations & Estimates</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Generate price quotes, track client approvals, export customized PDFs, and convert directly to invoices.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchQuotationsData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
            title="Refresh database records"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700 transition"
          >
            <Plus size={17} /> Create Quotation
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card p-5">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <FileText size={20} />
            </span>
            <span className="text-xs font-medium text-slate-500">Pipeline Total</span>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">Total Quotations</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {metrics?.totalCount ?? quotations.length}
          </p>
          <div className="mt-2 text-xs text-slate-500">
            Total Value:{" "}
            <span className="font-semibold text-teal-700">
              ₹{(metrics?.totalQuoted ?? quotations.reduce((s, q) => s + (q.grandTotal || 0), 0)).toLocaleString("en-IN")}
            </span>
          </div>
        </article>

        <article className="card p-5">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              Approved
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">Approved Quotations</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {metrics?.approvedCount ?? quotations.filter((q) => q.status === "approved" || q.status === "completed").length}
          </p>
          <div className="mt-2 text-xs text-slate-500">
            Value:{" "}
            <span className="font-semibold text-emerald-700">
              ₹{(metrics?.approvedQuoted ?? quotations.filter((q) => q.status === "approved").reduce((s, q) => s + (q.grandTotal || 0), 0)).toLocaleString("en-IN")}
            </span>
          </div>
        </article>

        <article className="card p-5">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <Send size={20} />
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
              Sent / Pending
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">Awaiting Client Response</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {metrics?.pendingCount ?? quotations.filter((q) => q.status === "sent").length}
          </p>
          <div className="mt-2 text-xs text-slate-500">
            Pending Value:{" "}
            <span className="font-semibold text-blue-700">
              ₹{(metrics?.pendingQuoted ?? quotations.filter((q) => q.status === "sent").reduce((s, q) => s + (q.grandTotal || 0), 0)).toLocaleString("en-IN")}
            </span>
          </div>
        </article>

        <article className="card p-5">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={20} />
            </span>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              Drafts
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">Draft Estimates</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {metrics?.draftCount ?? quotations.filter((q) => q.status === "draft").length}
          </p>
          <div className="mt-2 text-xs text-slate-500">Ready to review & send to clients</div>
        </article>
      </section>

      {/* Table Card */}
      <section className="card overflow-hidden">
        {/* Filters bar */}
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-slate-50/50 p-4 sm:px-6">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs text-slate-500">Search</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quote #, customer name..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-500">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setStartDate("");
              setEndDate("");
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 hover:bg-slate-100"
          >
            Reset
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Quotation #</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Valid Until</th>
                <th className="px-6 py-4 font-semibold">Quoted Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions & Export</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredQuotations.map((quote) => {
                const isExpired = quote.dueDate && new Date(quote.dueDate) < new Date() && quote.status !== "approved";
                const cust = quote.customer || {};
                const custName = cust.name || quote.customerName || "Customer";

                return (
                  <tr key={quote._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-teal-800">{quote.documentNumber}</span>
                      <span className="block text-[11px] text-slate-400">
                        {quote.items?.length || 0} {quote.items?.length === 1 ? "item" : "items"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{custName}</span>
                      {cust.company && (
                        <span className="block text-xs text-slate-400">{cust.company}</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(quote.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {quote.dueDate ? (
                        <span className={`inline-flex items-center gap-1 ${isExpired ? "text-rose-600 font-medium" : "text-slate-600"}`}>
                          {new Date(quote.dueDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          {isExpired && <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-700">Expired</span>}
                        </span>
                      ) : (
                        <span className="text-slate-400">30 days</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        ₹{(quote.grandTotal || 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={quote.status || "sent"}
                        disabled={updatingStatusId === quote._id}
                        onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider focus:outline-none ${
                          statusStyles[quote.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="approved">Approved</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Download PDF Quotation */}
                        <button
                          type="button"
                          title="Download Official PDF Quotation"
                          onClick={() => downloadQuotationPDF(quote)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 transition"
                        >
                          <Download size={13} />
                          <span>PDF</span>
                        </button>

                        {/* Share WhatsApp */}
                        <button
                          type="button"
                          title="Share Quotation on WhatsApp"
                          onClick={() => shareQuotationWhatsApp(quote)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-emerald-600 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50 transition"
                        >
                          <MessageCircle size={14} />
                        </button>

                        {/* Convert to Invoice */}
                        {quote.status !== "approved" && quote.status !== "completed" ? (
                          <button
                            type="button"
                            title="Convert directly to Sales Invoice"
                            disabled={convertingId === quote._id}
                            onClick={() => handleConvertToInvoice(quote)}
                            className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-teal-700 transition disabled:opacity-50"
                          >
                            <ArrowRight size={13} />
                            <span>{convertingId === quote._id ? "Converting..." : "Convert"}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <CheckCircle2 size={13} /> Converted
                          </span>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          title="Delete Quotation"
                          onClick={() => handleDelete(quote)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!filteredQuotations.length && (
            <div className="p-14 text-center">
              <FileSpreadsheet size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">
                {loading ? "Loading quotation records from MongoDB..." : "No quotations found matching your filters."}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Create your first quotation by clicking "+ Create Quotation" above.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
          <span>Showing {filteredQuotations.length} quotation records from database</span>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 font-medium text-teal-600 hover:text-teal-700"
          >
            <Plus size={14} /> New Quotation
          </button>
        </div>
      </section>

      {/* Creation Modal pre-configured for Quotation */}
      <CreateSaleModal
        isOpen={isCreateModalOpen}
        initialDocumentType="quotation"
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchQuotationsData();
          toast("Quotation created and saved to MongoDB!");
        }}
      />
    </div>
  );
}
