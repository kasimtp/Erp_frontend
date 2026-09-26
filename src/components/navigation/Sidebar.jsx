import { NavLink } from "react-router-dom";
import {
  BarChart3, Boxes, Building2, Calculator, ContactRound, FileSpreadsheet, FileText,
  LayoutDashboard, PackageSearch, ReceiptText, Settings, ShoppingCart,
  Truck, Users, WalletCards, X,
} from "lucide-react";

const items = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/sales", "Sales", FileText],
  ["/quotations", "Quotations", FileSpreadsheet],
  ["/purchases", "Purchases", ShoppingCart],
  ["/inventory", "Inventory", Boxes],
  ["/customers", "Customers", ContactRound],
  ["/suppliers", "Suppliers", Truck],
  ["/products", "Products / Items", PackageSearch],
  ["/expenses", "Expenses", WalletCards],
  ["/accounting", "Accounting", Calculator],
  ["/reports", "Reports", BarChart3],
  ["/users", "Users & Roles", Users],
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <button aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#102a2a] text-white transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-500"><Building2 size={22} /></span>
            <div><p className="font-semibold">CRM</p><p className="text-xs text-teal-100/60">Business Suite</p></div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"><X size={20} /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {items.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition ${isActive ? "bg-teal-500 font-medium text-white" : "text-white/65 hover:bg-white/8 hover:text-white"}`}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm ${isActive ? "bg-teal-500" : "text-white/65 hover:bg-white/8 hover:text-white"}`}><Settings size={19} />System Settings</NavLink>
        </div>
      </aside>
    </>
  );
}
