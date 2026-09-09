import {
  AlertCircle, Building2, CheckCircle2, ChevronRight, DollarSign,
  Filter, Layers, ShoppingBag, Truck, Users, X
} from "lucide-react";

export default function SupplierSidebar({
  filterView,
  setFilterView,
  selectedCategory,
  setSelectedCategory,
  categories,
  suppliers,
  totalAmountPayable,
  onSelectSupplier,
  isOpenMobile,
  onCloseMobile,
}) {
  const payableSuppliersCount = suppliers.filter((s) => s.amountPayable > 0).length;

  const content = (
    <aside className="w-full flex-col gap-6 bg-white p-5 lg:w-72 lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-xs">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800">
          <Filter size={18} className="text-teal-600" />
          <h3 className="font-semibold text-slate-900">Supplier Filters</h3>
        </div>
        {isOpenMobile && (
          <button onClick={onCloseMobile} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Quick Summary Card */}
      <div className="rounded-xl bg-gradient-to-br from-teal-900 to-slate-900 p-4 text-white shadow-sm">
        <div className="flex items-center gap-2 text-teal-300">
          <DollarSign size={16} />
          <span className="text-xs font-medium tracking-wide uppercase">Total Payable</span>
        </div>
        <p className="mt-2 text-2xl font-bold tracking-tight">₹{totalAmountPayable.toLocaleString("en-IN")}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-teal-100/70">
          <span>{payableSuppliersCount} pending vendors</span>
          <span className="rounded-md bg-teal-500/20 px-2 py-0.5 font-medium text-teal-200">Active Ledger</span>
        </div>
      </div>

      {/* Navigation Filter Views */}
      <div className="space-y-1">
        <p className="px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Views</p>
        
        <button
          onClick={() => { setFilterView("all"); setSelectedCategory("all"); onCloseMobile?.(); }}
          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
            filterView === "all" ? "bg-teal-50 text-teal-800 font-semibold" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <Users size={17} className={filterView === "all" ? "text-teal-600" : "text-slate-400"} />
            All Suppliers
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{suppliers.length}</span>
        </button>

        <button
          onClick={() => { setFilterView("payable"); setSelectedCategory("all"); onCloseMobile?.(); }}
          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
            filterView === "payable" ? "bg-amber-50 text-amber-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <AlertCircle size={17} className={filterView === "payable" ? "text-amber-600" : "text-amber-500"} />
            Amount Payable
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
            {payableSuppliersCount}
          </span>
        </button>

        <button
          onClick={() => { setFilterView("active"); setSelectedCategory("all"); onCloseMobile?.(); }}
          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
            filterView === "active" ? "bg-emerald-50 text-emerald-800 font-semibold" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <CheckCircle2 size={17} className={filterView === "active" ? "text-emerald-600" : "text-slate-400"} />
            Active Only
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {suppliers.filter((s) => s.status === "Active").length}
          </span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <p className="px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Categories</p>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); onCloseMobile?.(); }}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                selectedCategory === cat ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Layers size={15} className={selectedCategory === cat ? "text-teal-400" : "text-slate-400"} />
                {cat === "all" ? "All Categories" : cat}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Top Pending Vendors List */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <p className="px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Pending Vendors</p>
        <div className="space-y-1.5">
          {suppliers
            .filter((s) => s.amountPayable > 0)
            .sort((a, b) => b.amountPayable - a.amountPayable)
            .slice(0, 3)
            .map((sup) => (
              <div
                key={sup.id}
                onClick={() => { onSelectSupplier(sup); onCloseMobile?.(); }}
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-2.5 hover:border-amber-300 hover:bg-amber-50/40 transition"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-amber-900">{sup.name}</p>
                  <p className="text-[11px] font-medium text-amber-700">₹{sup.amountPayable.toLocaleString("en-IN")}</p>
                </div>
                <ChevronRight size={15} className="text-slate-300 group-hover:text-amber-600" />
              </div>
            ))}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">{content}</div>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex bg-slate-950/40 backdrop-blur-xs lg:hidden">
          <div className="w-80 h-full overflow-y-auto bg-white p-4 shadow-xl">
            {content}
          </div>
          <button className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
