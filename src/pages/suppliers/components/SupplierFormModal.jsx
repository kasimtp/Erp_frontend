import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function SupplierFormModal({ isOpen, onClose, onSave, supplierToEdit }) {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    category: "Steel & Metals",
    paymentTerms: "Net 30",
    creditLimit: 200000,
    status: "Active",
    notes: "",
  });

  useEffect(() => {
    if (supplierToEdit) {
      setFormData({
        name: supplierToEdit.name || "",
        contactPerson: supplierToEdit.contactPerson || "",
        phone: supplierToEdit.phone || "",
        email: supplierToEdit.email || "",
        address: supplierToEdit.address || "",
        gstin: supplierToEdit.gstin || "",
        category: supplierToEdit.category || "Steel & Metals",
        paymentTerms: supplierToEdit.paymentTerms || "Net 30",
        creditLimit: supplierToEdit.creditLimit || 200000,
        status: supplierToEdit.status || "Active",
        notes: supplierToEdit.notes || "",
      });
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        gstin: "",
        category: "Steel & Metals",
        paymentTerms: "Net 30",
        creditLimit: 200000,
        status: "Active",
        notes: "",
      });
    }
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {supplierToEdit ? "Edit Supplier Details" : "Add New Supplier"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Supplier Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Metro Steel Works"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="sales@supplier.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN / Tax ID</label>
              <input
                type="text"
                placeholder="32AAACM1234F1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              >
                <option value="Steel & Metals">Steel & Metals</option>
                <option value="Components">Components</option>
                <option value="Machinery">Machinery</option>
                <option value="Fabrication">Fabrication</option>
                <option value="Logistics">Logistics</option>
                <option value="Packaging">Packaging</option>
                <option value="Services">Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              >
                <option value="Immediate">Immediate / Advance</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Limit (₹)</label>
              <input
                type="number"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
              <textarea
                rows={2}
                placeholder="Full street address, city, state"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Special notes or primary supply items"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs"
            >
              {supplierToEdit ? "Update Supplier" : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
