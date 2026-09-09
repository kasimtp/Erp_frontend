import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  FileWarning,
  ReceiptIndianRupee,
  RefreshCw,
  ShoppingCart,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import client from "../../api/client";

function formatRelativeTime(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const diffSec = Math.floor((new Date() - date) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hrs ago`;
  return `${Math.floor(diffSec / 86400)} days ago`;
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await client.get("/dashboard/summary");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError("Failed to load dashboard figures from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statsList = [
    {
      label: "Total Sales",
      value: `₹${(data?.stats?.totalSales || 0).toLocaleString("en-IN")}`,
      change: "+Live",
      Icon: CircleDollarSign,
      direction: "up",
    },
    {
      label: "Purchases",
      value: `₹${(data?.stats?.totalPurchases || 0).toLocaleString("en-IN")}`,
      change: "DB",
      Icon: ShoppingCart,
      direction: "down",
    },
    {
      label: "Expenses",
      value: `₹${(data?.stats?.totalExpenses || 0).toLocaleString("en-IN")}`,
      change: "DB",
      Icon: WalletCards,
      direction: "down",
    },
    {
      label: "Net Profit",
      value: `₹${(data?.stats?.netProfit || 0).toLocaleString("en-IN")}`,
      change: "+Live",
      Icon: ReceiptIndianRupee,
      direction: "up",
    },
  ];

  const summaryList = [
    { label: "Active Customers", value: `${data?.summary?.customersCount || 0}`, Icon: UsersRound },
    { label: "Stock Items", value: `${data?.summary?.stockItemsCount || 0}`, Icon: Boxes },
    { label: "Low-Stock Items", value: `${data?.summary?.lowStockCount || 0}`, Icon: AlertTriangle },
    { label: "Receivables", value: `₹${(data?.stats?.totalReceivables || 0).toLocaleString("en-IN")}`, Icon: FileWarning },
  ];

  const chartData = data?.chart || [
    { month: "Apr", revenue: 0, expenses: 0 },
    { month: "May", revenue: 0, expenses: 0 },
    { month: "Jun", revenue: 0, expenses: 0 },
    { month: "Jul", revenue: 0, expenses: 0 },
    { month: "Aug", revenue: 0, expenses: 0 },
    { month: "Sep", revenue: 0, expenses: 0 },
  ];

  const activities = data?.activities || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Business overview</h2>
          <p className="mt-1 text-sm text-slate-500">Real-time metrics and monthly performance from MongoDB database.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Refresh database figures"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <select className="w-fit rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            <option>This month</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          {error}
        </div>
      )}

      {/* Financial Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsList.map(({ label, value, change, Icon, direction }) => (
          <article key={label} className="card p-5">
            <div className="flex items-start justify-between">
              <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <Icon size={22} />
              </span>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  direction === "up" ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {direction === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
              </span>
            </div>
            <p className="mt-5 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      {/* Chart & Summary */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <article className="card p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Revenue & purchases trend</h3>
              <p className="mt-1 text-xs text-slate-500">Live monthly aggregated database amounts</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full bg-teal-500" />
                Revenue (₹)
              </span>
              <span className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full bg-slate-400" />
                Expenses (₹)
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={2.5} fill="url(#revenue)" />
                <Area type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card p-5 sm:p-6">
          <h3 className="font-semibold text-slate-900">Business summary</h3>
          <div className="mt-5 space-y-3">
            {summaryList.map(({ label, value, Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-xl border border-slate-100 p-3.5">
                <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon size={19} />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-lg font-semibold text-slate-900">{value}</p>
                </div>
                <ArrowUpRight size={18} className="text-slate-300" />
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Activity Feed */}
      <article className="card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Recent activity feed</h3>
          <span className="text-xs text-slate-400">Live database audit log</span>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 py-3.5">
              <span className="mt-1.5 size-2 rounded-full bg-teal-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">{act.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{act.detail}</p>
              </div>
              <time className="whitespace-nowrap text-xs text-slate-400">{formatRelativeTime(act.createdAt)}</time>
            </div>
          ))}

          {!activities.length && (
            <div className="py-8 text-center text-xs text-slate-400">
              {loading ? "Loading database activity..." : "No recent activity recorded yet."}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
