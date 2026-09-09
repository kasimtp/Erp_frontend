import { X } from "lucide-react";
import { useEffect, useState } from "react";
import client from "../../api/client";

export default function StockAdjustmentModal({ isOpen, onClose, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("increase");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("Audit Count Correction");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      setError("");
      const { data } = await client.get("/products");
      if (data.success && data.data) {
        setProducts(data.data);
        if (data.data.length > 0) {
          setSelectedProductId(data.data[0]._id);
        }
      }
    } catch (err) {
      setError("Failed to load products for stock adjustment.");
    }
  };

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError("Please select a product.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await client.post("/inventory/adjustments", {
        productId: selectedProductId,
        adjustmentType,
        quantity: Number(quantity),
        reason,
        notes,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to process stock adjustment");
      }

      onSuccess && onSuccess(data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Stock Adjustment</h3>
            <p className="text-xs text-slate-500">Correct inventory counts, write off damaged stock, or manually restock</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Select Product *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-none"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} - SKU: {p.sku} (Current Stock: {p.stockQuantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="rounded-xl bg-slate-50 p-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Current Stock Level:</span>
                <span className="font-bold text-slate-900">{selectedProduct.stockQuantity} {selectedProduct.unit}</span>
              </div>
              <div className="mt-1 flex justify-between text-slate-600">
                <span>Cost Price / Unit:</span>
                <span className="font-semibold text-slate-800">₹{selectedProduct.costPrice}</span>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Adjustment Type</label>
              <select
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-none"
              >
                <option value="increase">Stock Increase (+)</option>
                <option value="decrease">Stock Decrease (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Quantity *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Reason for Adjustment</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
            >
              <option value="Audit Count Correction">Audit Count Correction</option>
              <option value="Damaged Stock Write-off">Damaged Stock Write-off</option>
              <option value="Lost or Stolen Items">Lost or Stolen Items</option>
              <option value="Expired Product">Expired Product</option>
              <option value="Manual Restock">Manual Restock</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Notes / Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Physical count discrepancy found during monthly audit"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Stock Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
