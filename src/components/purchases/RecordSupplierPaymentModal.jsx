import { X } from "lucide-react";
import { useState } from "react";
import client from "../../api/client";

export default function RecordSupplierPaymentModal({ isOpen, onClose, purchaseDoc, onSuccess }) {
  const [amount, setAmount] = useState(purchaseDoc?.balanceDue || 0);
  const [paymentMethod, setPaymentMethod] = useState("bankTransfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !purchaseDoc) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await client.post(`/purchases/${purchaseDoc._id}/payments`, {
        amount: Number(amount),
        paymentMethod,
        referenceNumber,
        notes,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to record supplier payment");
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
            <h3 className="text-lg font-semibold text-slate-900">Record Supplier Payment</h3>
            <p className="text-xs text-slate-500">Bill: {purchaseDoc.documentNumber}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Supplier:</span>
              <span className="font-semibold text-slate-900">{purchaseDoc.supplierName || purchaseDoc.supplier?.name}</span>
            </div>
            <div className="mt-1 flex justify-between text-slate-600">
              <span>Total Bill Amount:</span>
              <span className="font-semibold text-slate-900">₹{purchaseDoc.grandTotal?.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between text-amber-600">
              <span>Outstanding Payable Balance:</span>
              <span className="font-bold">₹{purchaseDoc.balanceDue?.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Payment Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              max={purchaseDoc.balanceDue}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-semibold text-slate-900 focus:border-teal-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-none"
            >
              <option value="bankTransfer">Bank Transfer (NEFT/RTGS/UPI)</option>
              <option value="cash">Cash</option>
              <option value="creditCard">Corporate Card</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Ref / Transaction ID</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UTR98765432"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional remarks"
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
              {loading ? "Recording..." : "Confirm Supplier Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
