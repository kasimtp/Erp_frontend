import { Bell, ChevronDown, LogOut, Menu, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar({ title, onMenu }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-xl border border-slate-200 p-2.5 lg:hidden"><Menu size={20} /></button>
        <div><h1 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h1><p className="hidden text-xs text-slate-500 sm:block">Keep your vvvvvvvvvvvvvvv business moving forward.</p></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden md:block"><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><input className="w-60 rounded-xl bg-slate-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-teal-600/20" placeholder="Search anything..." /></div>
        <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600"><Bell size={19} /><span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" /></button>
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100">
            <span className="grid size-9 place-items-center rounded-xl bg-teal-100 font-semibold text-teal-700">{user?.name?.charAt(0) || "U"}</span>
            <span className="hidden text-left sm:block"><span className="block max-w-28 truncate text-sm font-medium">{user?.name}</span><span className="block text-xs text-slate-500">{user?.role?.name || user?.role}</span></span>
            <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
          </button>
          {profileOpen && <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"><LogOut size={17} />Logout</button></div>}
        </div>
      </div>
    </header>
  );
}
