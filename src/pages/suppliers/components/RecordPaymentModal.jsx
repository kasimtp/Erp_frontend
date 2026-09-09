import { DollarSign, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function RecordPaymentModal({ isOpen, onClose, onRecord, suppliers, initialSupplier }) {
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialSupplier) {
      setSupplierId(initialSupplier.id);
      setAmount(initialSupplier.amountPayable || "");
    } else if (suppliers.length > 0) {
      setSupplierId(suppliers[0].id);
      setAmount(suppliers[0].amountPayable || "");
    }
  }, [initialSupplier, suppliers, isOpen]);

  const selectedSup = suppliers.find((s) => s.id === supplierId);

  const handleSupplierChange = (e) => {
    const id = e.target.value;
    setSupplierId(id);
    const found = suppliers.find((s) => s.id === id);
    if (found) {
      setAmount(found.amountPayable || "");
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId || !amount || Number(amount) <= 0) return;

    onRecord({
      supplierId,
      amount: Number(amount),
      paymentMethod,
      referenceNo,
      notes: notes || `Payment recorded for ${selectedSup?.name || "supplier"}`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-teal-900 text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <DollarSign className="text-teal-400" size={22} />
            Record Supplier Payment
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Supplier *</label>
            <select
              value={supplierId}
              onChange={handleSupplierChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
            >
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name} (Payable: ₹{sup.amountPayable.toLocaleString("en-IN")})
                </option>
              ))}
            </select>
          </div>

          {selectedSup && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex justify-between items-center text-xs">
              <span className="font-medium text-amber-900">Current Amount Payable:</span>
              <span className="font-bold text-amber-900 text-sm">₹{selectedSup.amountPayable.toLocaleString("en-IN")}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
            <input
              required
              type="number"
              min="1"
              max={selectedSup ? Math.max(selectedSup.amountPayable * 2, 1000000) : 1000000}
              placeholder="e.g. 25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reference / UTR No.</label>
              <input
                type="text"
                placeholder="e.g. UTR-99482103"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Notes</label>
            <input
              type="text"
              placeholder="e.g. Settled Bill INV-MSW-982"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-teal-600 focus:outline-none"
            />
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
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
