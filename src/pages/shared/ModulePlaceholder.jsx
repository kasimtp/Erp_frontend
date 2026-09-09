import { ArrowRight, Construction } from "lucide-react";

export default function ModulePlaceholder({ title, description }) {
  return <section className="card flex min-h-[480px] flex-col items-center justify-center p-8 text-center"><span className="grid size-16 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Construction size={30}/></span><h2 className="mt-5 text-2xl font-semibold">{title}</h2><p className="mt-2 max-w-lg text-slate-500">{description}</p><div className="mt-6 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">Scheduled for the next development phase</div><button className="mt-6 flex items-center gap-2 text-sm font-medium text-teal-700">View project roadmap <ArrowRight size={16}/></button></section>;
}
