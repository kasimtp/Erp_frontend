import { ArrowRight, Building2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { user, login, demoLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault(); setError("");
    try { await login(form.email, form.password); navigate("/dashboard"); }
    catch (err) { setError(err.response?.data?.message || "Unable to sign in. Check the backend and your details."); }
  };
  const openDemo = () => { demoLogin(); navigate("/dashboard"); };

  return (
    <main className="grid min-h-screen bg-[#f3f7f6] lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden bg-[#102a2a] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-teal-500"><Building2 /></span><div><p className="text-lg font-semibold">Orbit</p><p className="text-xs text-white/50">Business Suite</p></div></div>
        <div className="max-w-xl"><p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-teal-300">One connected workspace</p><h1 className="text-5xl font-semibold leading-tight">Run your business with clarity.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-white/60">Customers, invoices, expenses, people, projects, tasks, and reports—all in one secure system.</p></div>
        <p className="text-sm text-white/40">Built for growing teams.</p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-9 flex items-center gap-3 lg:hidden"><span className="grid size-10 place-items-center rounded-xl bg-teal-600 text-white"><Building2 size={21} /></span><span className="font-semibold">Orbit Business Suite</span></div>
          <h2 className="text-3xl font-semibold text-slate-900">Welcome back</h2><p className="mt-2 text-slate-500">Sign in to continue to your workspace.</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-medium">Email address</span><span className="relative block"><Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" /><input type="email" required className="input pl-11" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></span></label>
            <label className="block"><span className="mb-2 block text-sm font-medium">Password</span><span className="relative block"><LockKeyhole size={18} className="absolute left-3.5 top-3.5 text-slate-400" /><input type={showPassword ? "text" : "password"} required minLength={8} className="input px-11" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3.5 font-medium text-white transition hover:bg-teal-700 disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}<ArrowRight size={18} /></button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Create account
            </Link>
          </div>
          <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />OR<span className="h-px flex-1 bg-slate-200" /></div>
          <button onClick={openDemo} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium hover:bg-slate-50">Open dashboard demo</button>
        </div>
      </section>
    </main>
  );
}

