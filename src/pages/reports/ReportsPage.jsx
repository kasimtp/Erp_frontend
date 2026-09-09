import {
  BarChart2,
  BookOpen,
  ChevronDown,
  Download,
  FileText,
  Package,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import client from "../../api/client";
import { downloadReportPDF } from "../../utils/pdfExportUtils";

// ── constants ─────────────────────────────────────────────────────────────────
const REPORT_TABS = [
  { key: "sales",            label: "Sales",            Icon: TrendingUp  },
  { key: "purchases",        label: "Purchases",        Icon: Wallet       },
  { key: "inventory",        label: "Inventory",        Icon: Package      },
  { key: "expenses",         label: "Expenses",         Icon: BarChart2    },
  { key: "profit-loss",      label: "Profit & Loss",    Icon: FileText     },
  { key: "customer-ledger",  label: "Customer Ledger",  Icon: Users        },
  { key: "supplier-ledger",  label: "Supplier Ledger",  Icon: BookOpen     },
];

const PAYMENT_STATUSES = ["all", "paid", "partial", "unpaid", "pending"];
const SALE_DOC_TYPES   = ["all", "invoice", "quotation", "salesOrder", "salesReturn"];
const PUR_DOC_TYPES    = ["all", "purchaseOrder", "supplierBill", "purchaseReturn"];

const statusClass = (v) => {
  const t = String(v).toLowerCase();
  if (["paid", "active", "in stock"].some(x => t.includes(x)))  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (["overdue", "out of", "cancelled"].some(x => t.includes(x))) return "bg-rose-50 text-rose-700 border border-rose-200";
  if (["partial", "low", "unpaid", "pending"].some(x => t.includes(x))) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-slate-100 text-slate-600 border border-slate-200";
};

const fmtINR = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

// ── component ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [activeTab,  setActiveTab]  = useState("sales");
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [notice,     setNotice]     = useState("");

  // Shared filters
  const [search,       setSearch]       = useState("");
  const [startDate,    setStartDate]    = useState("");
  const [endDate,      setEndDate]      = useState("");
  const [status,       setStatus]       = useState("all");
  const [docType,      setDocType]      = useState("all");
  const [customerId,   setCustomerId]   = useState("all");
  const [supplierId,   setSupplierId]   = useState("all");
  const [category,     setCategory]     = useState("all");

  const toast = (msg) => { setNotice(msg); setTimeout(() => setNotice(""), 3200); };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setData(null);
    try {
      const p = new URLSearchParams();
      if (search)                   p.set("search",       search);
      if (startDate)                p.set("startDate",    startDate);
      if (endDate)                  p.set("endDate",      endDate);
      if (status    !== "all")      p.set("status",       status);
      if (docType   !== "all")      p.set("documentType", docType);
      if (customerId !== "all")     p.set("customerId",   customerId);
      if (supplierId !== "all")     p.set("supplierId",   supplierId);
      if (category  !== "all")      p.set("category",     category);

      const res = await client.get(`/reports/${activeTab}?${p}`);
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.error(err);
      toast("Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, startDate, endDate, status, docType, customerId, supplierId, category]);

  useEffect(() => {
    setData(null);
    setStatus("all"); setDocType("all"); setCustomerId("all");
    setSupplierId("all"); setCategory("all"); setSearch("");
    setStartDate(""); setEndDate("");
  }, [activeTab]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  // ── Table config per report type ──────────────────────────────────────────
  const { columns, rows, kpis } = useMemo(() => {
    if (!data) return { columns: [], rows: [], kpis: [] };

    if (activeTab === "sales") {
      const recs = data.records || [];
      return {
        kpis: [
          { label: "Total Documents",  value: data.metrics?.totalCount   || 0                },
          { label: "Total Amount",     value: fmtINR(data.metrics?.totalAmount)              },
          { label: "Amount Received",  value: fmtINR(data.metrics?.totalReceived)            },
          { label: "Balance Due",      value: fmtINR(data.metrics?.totalBalance)             },
        ],
        columns: ["Document #", "Type", "Customer", "Date", "Total", "Paid", "Balance", "Status"],
        rows: recs.map(r => [
          r.documentNumber, r.documentType?.toUpperCase() || "",
          r.customerName || "", fmtDate(r.createdAt),
          fmtINR(r.grandTotal), fmtINR(r.amountPaid), fmtINR(r.balanceDue),
          r.paymentStatus?.toUpperCase() || r.status?.toUpperCase() || "",
        ]),
      };
    }

    if (activeTab === "purchases") {
      const recs = data.records || [];
      return {
        kpis: [
          { label: "Total Documents",  value: data.metrics?.totalCount   || 0                },
          { label: "Total Amount",     value: fmtINR(data.metrics?.totalAmount)              },
          { label: "Amount Paid",      value: fmtINR(data.metrics?.totalPaid)                },
          { label: "Amount Payable",   value: fmtINR(data.metrics?.totalPayable)             },
        ],
        columns: ["Document #", "Type", "Supplier", "Date", "Total", "Paid", "Payable", "Status"],
        rows: recs.map(r => [
          r.documentNumber, r.documentType?.toUpperCase() || "",
          r.supplierName || "", fmtDate(r.createdAt),
          fmtINR(r.grandTotal), fmtINR(r.amountPaid), fmtINR(r.balanceDue),
          r.paymentStatus?.toUpperCase() || "",
        ]),
      };
    }

    if (activeTab === "inventory") {
      const recs = data.records || [];
      return {
        kpis: [
          { label: "Total Items",       value: data.metrics?.totalItems     || 0 },
          { label: "Total Stock Units", value: data.metrics?.totalStockQty  || 0 },
          { label: "Stock Valuation",   value: fmtINR(data.metrics?.totalStockValue) },
          { label: "Low Stock Items",   value: data.metrics?.lowStockCount  || 0 },
        ],
        columns: ["SKU", "Product Name", "Category", "Stock Qty", "Cost Price", "Selling Price", "Status"],
        rows: recs.map(r => [
          r.sku || "", r.name, r.category || "",
          `${r.stockQuantity || 0} ${r.unit || "pcs"}`,
          fmtINR(r.costPrice), fmtINR(r.sellingPrice),
          r.status?.toUpperCase() || "",
        ]),
      };
    }

    if (activeTab === "expenses") {
      const recs = data.records || [];
      return {
        kpis: [
          { label: "Total Records",   value: data.metrics?.totalCount  || 0 },
          { label: "Total Amount",    value: fmtINR(data.metrics?.totalAmount) },
        ],
        columns: ["Exp. #", "Title", "Category", "Date", "Payment Method", "Status", "Amount"],
        rows: recs.map(r => [
          r.expenseNumber || "", r.title, r.category,
          r.expenseDate ? new Date(r.expenseDate).toLocaleDateString("en-IN") : "",
          r.paymentMethod, r.status?.toUpperCase() || "",
          fmtINR(r.amount),
        ]),
      };
    }

    if (activeTab === "profit-loss") {
      const m = data.metrics || {};
      const combined = [
        ...(data.revenueBreakdown || []),
        ...(data.expenseBreakdown || []),
        ...(data.otherExpenses    || []),
      ].sort((a, b) => new Date(a.date) - new Date(b.date));
      return {
        kpis: [
          { label: "Total Revenue",    value: fmtINR(m.totalRevenue)          },
          { label: "Total Purchases",  value: fmtINR(m.totalPurchases)        },
          { label: "Total Expenses",   value: fmtINR(m.totalExpenses)         },
          { label: "Net Profit",       value: fmtINR(m.netProfit)             },
        ],
        columns: ["Document #", "Party", "Date", "Type", "Amount"],
        rows: combined.map(r => [
          r.documentNumber || "", r.partyName || "", fmtDate(r.date),
          r.type || "", fmtINR(r.amount),
        ]),
      };
    }

    if (activeTab === "customer-ledger") {
      const recs = data.records || [];
      const m = data.metrics || {};
      return {
        kpis: [
          { label: "Total Billed",     value: fmtINR(m.totalBilled)    },
          { label: "Total Paid",       value: fmtINR(m.totalPaid)      },
          { label: "Current Balance",  value: fmtINR(m.currentBalance) },
        ],
        columns: ["Document #", "Type", "Date", "Total", "Paid", "Balance Due", "Running Balance", "Status"],
        rows: recs.map(r => [
          r.documentNumber || "", r.documentType?.toUpperCase() || "",
          fmtDate(r.date), fmtINR(r.totalAmount), fmtINR(r.amountPaid),
          fmtINR(r.balanceDue), fmtINR(r.runningBalance),
          r.status?.toUpperCase() || "",
        ]),
      };
    }

    if (activeTab === "supplier-ledger") {
      const recs = data.records || [];
      const m = data.metrics || {};
      return {
        kpis: [
          { label: "Total Purchased",  value: fmtINR(m.totalPurchased) },
          { label: "Total Paid",       value: fmtINR(m.totalPaid)      },
          { label: "Current Payable",  value: fmtINR(m.currentPayable) },
        ],
        columns: ["Document #", "Type", "Date", "Total", "Paid", "Balance Due", "Running Balance", "Status"],
        rows: recs.map(r => [
          r.documentNumber || "", r.documentType?.toUpperCase() || "",
          fmtDate(r.date), fmtINR(r.totalAmount), fmtINR(r.amountPaid),
          fmtINR(r.balanceDue), fmtINR(r.runningBalance),
          r.status?.toUpperCase() || "",
        ]),
      };
    }

    return { columns: [], rows: [], kpis: [] };
  }, [data, activeTab]);

  // ── PDF Export ─────────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    const tab = REPORT_TABS.find(t => t.key === activeTab);
    const extraInfo = {};
    if (activeTab === "customer-ledger" && data?.customer) extraInfo.customer = data.customer.name;
    if (activeTab === "supplier-ledger" && data?.supplier) extraInfo.supplier = data.supplier.name;

    downloadReportPDF({
      reportTitle: `${tab?.label || "ERP"} Report`,
      subtitle:
        activeTab === "customer-ledger" && data?.customer ? `Customer: ${data.customer.name}` :
        activeTab === "supplier-ledger" && data?.supplier ? `Supplier: ${data.supplier.name}` :
        "Filtered from MongoDB database",
      filters: { startDate, endDate, status, category, search },
      metrics: kpis.map(k => ({ label: k.label, value: k.value })),
      columns,
      rows,
      fileName: `${tab?.label.replace(/\s+/g,"_")}_Report_${new Date().toISOString().slice(0,10)}.pdf`,
    });
  };

  const curTab = REPORT_TABS.find(t => t.key === activeTab);
  const customers = data?.customers || [];
  const suppliers = data?.suppliers || [];
  const inventoryCategories = data?.categories || [];

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
          <h2 className="text-2xl font-semibold text-slate-900">ERP Reports</h2>
          <p className="mt-1 text-sm text-slate-500">
            Analyze sales, purchases, inventory, expenses, and profit with advanced filters and PDF export.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchReport} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-700">
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 px-4 pt-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {REPORT_TABS.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === key
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 bg-slate-50/50 p-4 sm:px-6">

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <div>
              <label className="mb-1 block text-xs text-slate-500">From</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">To</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
            </div>
          </div>

          {/* Status — Sales / Purchases / Expenses */}
          {["sales", "purchases", "expenses"].includes(activeTab) && (
            <div>
              <label className="mb-1 block text-xs text-slate-500">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          )}

          {/* Document Type */}
          {activeTab === "sales" && (
            <div>
              <label className="mb-1 block text-xs text-slate-500">Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                {SALE_DOC_TYPES.map(d => <option key={d} value={d}>{d === "all" ? "All Types" : d}</option>)}
              </select>
            </div>
          )}
          {activeTab === "purchases" && (
            <div>
              <label className="mb-1 block text-xs text-slate-500">Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                {PUR_DOC_TYPES.map(d => <option key={d} value={d}>{d === "all" ? "All Types" : d}</option>)}
              </select>
            </div>
          )}

          {/* Customer Selector */}
          {(activeTab === "sales" || activeTab === "customer-ledger") && customers.length > 0 && (
            <div>
              <label className="mb-1 block text-xs text-slate-500">Customer</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                <option value="all">All Customers</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Supplier Selector */}
          {(activeTab === "purchases" || activeTab === "supplier-ledger") && suppliers.length > 0 && (
            <div>
              <label className="mb-1 block text-xs text-slate-500">Supplier</label>
              <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                <option value="all">All Suppliers</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}

          {/* Inventory Category */}
          {activeTab === "inventory" && inventoryCategories.length > 0 && (
            <div>
              <label className="mb-1 block text-xs text-slate-500">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                <option value="all">All Categories</option>
                {inventoryCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Search */}
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-xs text-slate-500">Search</label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-700"
                placeholder="Search..." />
            </div>
          </div>

          <button onClick={() => { setSearch(""); setStartDate(""); setEndDate(""); setStatus("all"); setDocType("all"); setCustomerId("all"); setSupplierId("all"); setCategory("all"); }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 hover:bg-slate-100">
            Reset
          </button>
        </div>

        {/* KPI Cards */}
        {kpis.length > 0 && (
          <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-slate-100 border-b border-slate-100 sm:grid-cols-4">
            {kpis.map(({ label, value }) => (
              <div key={label} className="p-5">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Customer/Supplier context header */}
        {activeTab === "customer-ledger" && data?.customer && (
          <div className="border-b border-slate-100 bg-teal-50 px-6 py-3">
            <p className="text-sm font-medium text-teal-800">
              📋 Ledger for: <strong>{data.customer.name}</strong>
              {data.customer.company ? ` — ${data.customer.company}` : ""}
            </p>
          </div>
        )}
        {activeTab === "supplier-ledger" && data?.supplier && (
          <div className="border-b border-slate-100 bg-teal-50 px-6 py-3">
            <p className="text-sm font-medium text-teal-800">
              📋 Ledger for: <strong>{data.supplier.name}</strong>
              {data.supplier.company ? ` — ${data.supplier.company}` : ""}
            </p>
          </div>
        )}

        {/* Profit & Loss Summary View */}
        {activeTab === "profit-loss" && data?.metrics && (
          <div className="border-b border-slate-100 p-6">
            <h4 className="mb-4 text-sm font-semibold text-slate-700">Profit & Loss Summary</h4>
            <div className="space-y-2">
              {[
                { label: "Total Revenue (Sales Invoices)",       value: data.metrics.totalRevenue,   color: "text-emerald-700" },
                { label: "Less: Total Purchase Costs",           value: data.metrics.totalPurchases, color: "text-rose-600" },
                { label: "Less: Other Expenses",                 value: data.metrics.totalExpenses,  color: "text-rose-600" },
                { label: "Net Profit",                           value: data.metrics.netProfit,      color: "text-teal-700 font-bold" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <span className={color}>₹{(value || 0).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-14 text-center text-sm text-slate-400">Loading report data from database...</div>
          ) : rows.length === 0 ? (
            <div className="p-14 text-center text-sm text-slate-400">
              No records found for the selected filters. Try adjusting the date range or reset filters.
            </div>
          ) : (
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-6 py-4 font-semibold">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/70">
                    {row.map((cell, ci) => (
                      <td key={ci} className={`px-6 py-3.5 ${ci === 0 ? "font-medium text-slate-900" : "text-slate-600"} text-sm`}>
                        {ci === row.length - 1 && ["sales","purchases","customer-ledger","supplier-ledger"].includes(activeTab) ? (
                          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(cell)}`}>{cell}</span>
                        ) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
          <span>Showing {rows.length} records from MongoDB</span>
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700">
            <Download size={13} /> Download PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}
