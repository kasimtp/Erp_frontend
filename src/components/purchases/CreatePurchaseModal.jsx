import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import client from "../../api/client";

export default function CreatePurchaseModal({ isOpen, onClose, onSuccess, initialDocumentType = "purchaseOrder" }) {
  const [documentType, setDocumentType] = useState(initialDocumentType);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDocumentType(initialDocumentType);
      fetchDependencies();
    }
  }, [isOpen, initialDocumentType]);

  const fetchDependencies = async () => {
    try {
      setError("");
      const [suppRes, prodRes] = await Promise.all([
        client.get("/suppliers"),
        client.get("/products"),
      ]);

      if (suppRes.data.success && suppRes.data.data) {
        setSuppliers(suppRes.data.data);
        if (suppRes.data.data.length > 0) {
          setSelectedSupplierId(suppRes.data.data[0]._id);
        }
      }

      if (prodRes.data.success && prodRes.data.data) {
        setProducts(prodRes.data.data);
        if (prodRes.data.data.length > 0 && items.length === 0) {
          const firstProd = prodRes.data.data[0];
          setItems([
            {
              productId: firstProd._id,
              quantity: 1,
              unitCost: firstProd.costPrice || 0,
              taxRate: 0,
            },
          ]);
        }
      }
    } catch (err) {
      setError("Failed to load supplier and product data.");
    }
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    const prod = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: prod._id,
        quantity: 1,
        unitCost: prod.costPrice || 0,
        taxRate: 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItemRow = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      if (field === "productId") {
        const prod = products.find((p) => p._id === value);
        next[index] = {
          ...next[index],
          productId: value,
          unitCost: prod ? prod.costPrice : next[index].unitCost,
        };
      } else {
        next[index] = {
          ...next[index],
          [field]: value,
        };
      }
      return next;
    });
  };

  const calculatedRows = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const cost = Number(item.unitCost) || 0;
    const tax = Number(item.taxRate) || 0;

    const subtotal = qty * cost;
    const taxAmt = subtotal * (tax / 100);
    const total = subtotal + taxAmt;

    return { subtotal, taxAmt, total };
  });

  const subtotal = calculatedRows.reduce((sum, r) => sum + r.subtotal, 0);
  const taxTotal = calculatedRows.reduce((sum, r) => sum + r.taxAmt, 0);
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setError("Please select a supplier.");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one line item.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await client.post("/purchases", {
        documentType,
        supplierId: selectedSupplierId,
        items,
        dueDate,
        notes,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to create purchase document");
      }

      onSuccess && onSuccess(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Create New Purchase Document</h3>
            <p className="text-xs text-slate-500">Generate Purchase Order, Supplier Bill, or Return & auto-restock inventory</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-800 focus:border-teal-500 focus:outline-none"
              >
                <option value="purchaseOrder">Purchase Order (PO)</option>
                <option value="supplierBill">Supplier Bill (BILL)</option>
                <option value="purchaseReturn">Purchase Return (PRET)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Supplier</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-800 focus:border-teal-500 focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.company ? `(${s.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-800 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Line items section */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Purchase Line Items</label>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                <Plus size={15} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:flex-nowrap">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-[11px] text-slate-500">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateItemRow(idx, "productId", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800"
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} - Cost: ₹{p.costPrice} (Current Stock: {p.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <label className="block text-[11px] text-slate-500">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemRow(idx, "quantity", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-[11px] text-slate-500">Unit Cost (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => updateItemRow(idx, "unitCost", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-[11px] text-slate-500">Tax (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={item.taxRate}
                      onChange={(e) => updateItemRow(idx, "taxRate", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <div className="w-24 text-right">
                    <label className="block text-[11px] text-slate-500">Total (₹)</label>
                    <span className="mt-2 block text-xs font-semibold text-slate-900">
                      ₹{calculatedRows[idx]?.total.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="mt-4 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            {taxTotal > 0 && (
              <div className="mt-1 flex justify-between text-xs text-slate-600">
                <span>Tax Total:</span>
                <span>+₹{taxTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
              <span>Grand Total Payable:</span>
              <span className="text-teal-700">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Supplier Instructions / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Delivery expected by next Monday. Payment upon inspection."
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? "Saving to Database..." : "Create Purchase & Restock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
