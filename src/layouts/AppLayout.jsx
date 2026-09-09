import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar.jsx";
import Topbar from "../components/navigation/Topbar.jsx";

const titles = {
  "/dashboard": "Dashboard",
  "/sales": "Sales",
  "/purchases": "Purchases",
  "/inventory": "Inventory",
  "/customers": "Customers",
  "/suppliers": "Suppliers",
  "/products": "Products & Items",
  "/expenses": "Expenses",
  "/accounting": "Basic Accounting",
  "/reports": "Reports",
  "/users": "Users & Roles",
  "/settings": "System Settings",
};

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#f5f7f8]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <Topbar title={titles[pathname] || "Business Management"} onMenu={() => setOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
