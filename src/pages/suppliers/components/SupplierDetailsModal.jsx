import {
  AlertCircle, Building2, Calendar, CheckCircle2, CreditCard, DollarSign,
  Edit2, FileText, Mail, MapPin, Phone, Plus, Receipt, ShoppingCart, Trash2, User, X
} from "lucide-react";
import { useState } from "react";

export default function SupplierDetailsModal({
  supplier,
  purchases = [],
  payments = [],
  onClose,
  onEdit,
  onRecordPayment,
  onAddPO,
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!supplier) return null;

  const supplierPurchases = purchases.filter((p) => p.supplierId === supplier.id);
  const supplierPayments = payments.filter((p) => p.supplierId === supplier.id);
  const unpaidPurchases = supplierPurchases.filter((p) => p.status !== "Paid");

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 place-items-center rounded-xl bg-teal-600 font-bold text-white text-lg">
              {supplier.name.substring(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{supplier.name}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  supplier.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                }`}>
                  {supplier.status}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">ID: {supplier.id} • Category: {supplier.category}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(supplier)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-3 gap-3 border-b border-slate-200 bg-slate-900 p-4 text-white">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Total Purchased</p>
            <p className="mt-1 text-lg font-bold text-white">₹{supplier.totalPurchases.toLocaleString("en-IN")}</p>
          </div>
          <div className={`rounded-xl p-3 ${supplier.amountPayable > 0 ? "bg-amber-500/20 border border-amber-500/30" : "bg-white/5"}`}>
            <p className="text-[11px] font-medium text-amber-300 uppercase tracking-wide">Amount Payable</p>
            <p className="mt-1 text-lg font-bold text-amber-400">₹{supplier.amountPayable.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Payment Terms</p>
            <p className="mt-1 text-base font-semibold text-teal-300">{supplier.paymentTerms || "Net 30"}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          {[
            { id: "overview", label: "Supplier Details", icon: User },
            { id: "purchases", label: `Purchase History (${supplierPurchases.length})`, icon: ShoppingCart },
            { id: "payable", label: `Amount Payable (${unpaidPurchases.length})`, icon: AlertCircle },
            { id: "ledger", label: `Payment Ledger (${supplierPayments.length})`, icon: Receipt },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-semibold transition ${
                  activeTab === t.id
                    ? "border-teal-600 text-teal-700 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW & DETAILS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => onRecordPayment(supplier)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition shadow-xs"
                >
                  <DollarSign size={17} /> Record Payment
                </button>
                <button
                  onClick={() => onAddPO(supplier)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                >
                  <Plus size={17} /> Create Purchase Order
                </button>
              </div>

              {/* Contact Information */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <User size={16} className="text-teal-600" /> Contact Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Contact Person</span>
                    <span className="font-semibold text-slate-800">{supplier.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" /> {supplier.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Email Address</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400" /> {supplier.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">GSTIN / Tax ID</span>
                    <span className="font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded w-fit block mt-0.5">
                      {supplier.gstin || "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Business Address</span>
                  <span className="text-xs font-medium text-slate-800 flex items-start gap-1.5 mt-1">
                    <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    {supplier.address}
                  </span>
                </div>
              </div>

              {/* Financial Terms */}
              <div className="rounded-2xl border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <CreditCard size={16} className="text-teal-600" /> Financial Settings
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Credit Limit</span>
                    <span className="font-semibold text-slate-800">₹{(supplier.creditLimit || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payment Terms</span>
                    <span className="font-semibold text-slate-800">{supplier.paymentTerms || "Net 30"}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {supplier.notes && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Internal Notes</span>
                  <p className="text-xs text-slate-700 mt-1 italic">{supplier.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PURCHASE HISTORY */}
          {activeTab === "purchases" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-900">Purchase Orders & Bills</h3>
                <button
                  onClick={() => onAddPO(supplier)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
                >
                  <Plus size={14} /> New Purchase Order
                </button>
              </div>

              {supplierPurchases.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                  No purchase history found for this supplier.
                </div>
              ) : (
                <div className="space-y-3">
                  {supplierPurchases.map((po) => (
                    <div key={po.id} className="rounded-xl border border-slate-200 p-4 space-y-3 hover:border-slate-300 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{po.id}</span>
                            <span className="text-xs text-slate-500">• Bill: {po.billNo}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Date: {po.date} • Due: {po.dueDate}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          po.status === "Paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {po.status}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-xs">
                        {po.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-700">
                            <span>{item.qty}x {item.name}</span>
                            <span className="font-mono">₹{(item.qty * item.rate).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Total Bill Amount:</span>
                        <span className="font-bold text-slate-900 text-sm">₹{po.totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AMOUNT PAYABLE BREAKDOWN */}
          {activeTab === "payable" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-800 uppercase">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-amber-900">₹{supplier.amountPayable.toLocaleString("en-IN")}</p>
                </div>
                {supplier.amountPayable > 0 && (
                  <button
                    onClick={() => onRecordPayment(supplier)}
                    className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
                  >
                    <DollarSign size={16} /> Clear Payable
                  </button>
                )}
              </div>

              <h3 className="text-sm font-semibold text-slate-900">Unpaid & Partial Bills</h3>

              {unpaidPurchases.length === 0 ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 text-center text-emerald-800 text-xs font-medium">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-600" />
                  All clear! There are no pending payables for {supplier.name}.
                </div>
              ) : (
                <div className="space-y-3">
                  {unpaidPurchases.map((bill) => {
                    const unpaid = bill.totalAmount - (bill.paidAmount || 0);
                    return (
                      <div key={bill.id} className="rounded-xl border border-amber-200 p-4 space-y-2 bg-white">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{bill.id}</span>
                            <span className="text-xs text-slate-500 block">Ref Bill: {bill.billNo}</span>
                          </div>
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Due {bill.dueDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <span>Original: ₹{bill.totalAmount.toLocaleString("en-IN")}</span>
                          <span>Paid: ₹{(bill.paidAmount || 0).toLocaleString("en-IN")}</span>
                          <span className="font-bold text-rose-700 text-sm">Payable: ₹{unpaid.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT LEDGER */}
          {activeTab === "ledger" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Payment Audit Trail</h3>

              {supplierPayments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                  No payment records logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {supplierPayments.map((pay) => (
                    <div key={pay.id} className="rounded-xl border border-slate-200 p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{pay.id}</span>
                          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                            {pay.paymentMethod}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{pay.date}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-mono">Ref: {pay.referenceNo || "N/A"}</span>
                        <span className="font-bold text-emerald-700 text-sm">₹{pay.amount.toLocaleString("en-IN")}</span>
                      </div>
                      {pay.notes && <p className="text-[11px] text-slate-500 italic">{pay.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={() => onDelete(supplier.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
          >
            <Trash2 size={15} /> Delete Supplier
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
