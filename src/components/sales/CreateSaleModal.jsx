import { CheckCircle2, Download, MessageCircle, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import client from "../../api/client";
import {
  downloadInvoicePDF,
  downloadQuotationPDF,
  shareInvoiceWhatsApp,
  shareQuotationWhatsApp,
} from "../../utils/pdfExportUtils";

export default function CreateSaleModal({ isOpen, onClose, onSuccess, initialDocumentType = "invoice" }) {
  const [documentType, setDocumentType] = useState(initialDocumentType);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSaleDoc, setCreatedSaleDoc] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setCreatedSaleDoc(null);
      setDocumentType(initialDocumentType);
      if (initialDocumentType === "quotation") {
        setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
        setNotes("Quotation valid for 30 days from date of issue. Prices subject to standard terms.");
      } else {
        setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
        setNotes("");
      }
      fetchDependencies();
    }
  }, [isOpen, initialDocumentType]);


  const fetchDependencies = async () => {
    try {
      setError("");
      const [custRes, prodRes] = await Promise.all([
        client.get("/customers"),
        client.get("/products"),
      ]);

      if (custRes.data.success && custRes.data.data) {
        setCustomers(custRes.data.data);
        if (custRes.data.data.length > 0) {
          setSelectedCustomerId(custRes.data.data[0]._id);
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
              unitPrice: firstProd.sellingPrice,
              taxRate: 0,
              discountRate: 0,
            },
          ]);
        }
      }
    } catch (err) {
      setError("Failed to load customer and product data.");
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
        unitPrice: prod.sellingPrice,
        taxRate: 0,
        discountRate: 0,
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
          unitPrice: prod ? prod.sellingPrice : next[index].unitPrice,
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

  // Calculations
  const calculatedRows = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const tax = Number(item.taxRate) || 0;
    const discount = Number(item.discountRate) || 0;

    const subtotal = qty * price;
    const discAmt = subtotal * (discount / 100);
    const taxAmt = (subtotal - discAmt) * (tax / 100);
    const total = subtotal - discAmt + taxAmt;

    return { subtotal, discAmt, taxAmt, total };
  });

  const subtotal = calculatedRows.reduce((sum, r) => sum + r.subtotal, 0);
  const discountTotal = calculatedRows.reduce((sum, r) => sum + r.discAmt, 0);
  const taxTotal = calculatedRows.reduce((sum, r) => sum + r.taxAmt, 0);
  const grandTotal = subtotal - discountTotal + taxTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError("Please select a customer.");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one line item.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = documentType === "quotation" ? "/quotations" : "/sales";
      const payload =
        documentType === "quotation"
          ? {
              customerId: selectedCustomerId,
              items,
              validUntil: dueDate,
              dueDate,
              notes,
            }
          : {
              documentType,
              customerId: selectedCustomerId,
              items,
              dueDate,
              notes,
            };

      const { data } = await client.post(endpoint, payload);

      if (!data.success) {
        throw new Error(data.message || "Failed to create document");
      }

      setCreatedSaleDoc(data.data);
      onSuccess && onSuccess(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (createdSaleDoc) {
    const custName = createdSaleDoc.customerName || createdSaleDoc.customer?.name || "Customer";
    const phone = createdSaleDoc.customer?.phone || "";
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle2 size={32} />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            {createdSaleDoc.documentType === "quotation" ? "Quotation" : "Invoice"} Created Successfully!
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Document <span className="font-semibold text-slate-800">{createdSaleDoc.documentNumber}</span> saved to database.
          </p>

          <div className="my-5 rounded-xl bg-slate-50 p-4 text-left text-xs space-y-2 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-800">{custName}</span>
            </div>
            {phone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-700">{phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">
                {createdSaleDoc.documentType === "quotation" ? "Quoted Total:" : "Grand Total:"}
              </span>
              <span className="font-bold text-teal-700 text-sm">₹{createdSaleDoc.grandTotal?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">
                {createdSaleDoc.documentType === "quotation" ? "Valid Until:" : "Due Date:"}
              </span>
              <span className="text-slate-700">
                {createdSaleDoc.dueDate ? new Date(createdSaleDoc.dueDate).toLocaleDateString("en-IN") : "N/A"}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() =>
                createdSaleDoc.documentType === "quotation"
                  ? downloadQuotationPDF(createdSaleDoc)
                  : downloadInvoicePDF(createdSaleDoc)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition"
            >
              <Download size={17} />{" "}
              {createdSaleDoc.documentType === "quotation" ? "Download PDF Quotation" : "Download PDF Invoice"}
            </button>

            <button
              onClick={() =>
                createdSaleDoc.documentType === "quotation"
                  ? shareQuotationWhatsApp(createdSaleDoc)
                  : shareInvoiceWhatsApp(createdSaleDoc)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <MessageCircle size={17} /> Share via WhatsApp
            </button>

            <button
              onClick={() => {
                setCreatedSaleDoc(null);
                onClose();
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              {documentType === "quotation" ? "Create Price Quotation" : "Create New Sale Document"}
            </h3>
            <p className="text-xs text-slate-500">
              {documentType === "quotation"
                ? "Generate official estimate/quotation with items, taxes, validity and PDF download"
                : "Generate invoice, quotation, sales order or return live in database"}
            </p>
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
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="invoice">Sales Invoice (INV)</option>
                <option value="quotation">Quotation (QUO)</option>
                <option value="salesOrder">Sales Order (SO)</option>
                <option value="salesReturn">Sales Return (RET)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                {documentType === "quotation" ? "Validity Date" : "Due Date"}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Line items section */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Line Items</label>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                <Plus size={15} /> Add Product
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
                          {p.name} - ₹{p.sellingPrice} (Stock: {p.stockQuantity})
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
                    <label className="block text-[11px] text-slate-500">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItemRow(idx, "unitPrice", e.target.value)}
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
            {discountTotal > 0 && (
              <div className="mt-1 flex justify-between text-xs text-emerald-600">
                <span>Discount Total:</span>
                <span>-₹{discountTotal.toFixed(2)}</span>
              </div>
            )}
            {taxTotal > 0 && (
              <div className="mt-1 flex justify-between text-xs text-slate-600">
                <span>Tax Total:</span>
                <span>+₹{taxTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold text-slate-900">
              <span>Grand Total:</span>
              <span className="text-teal-700">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Notes / Payment Terms</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Payment due within 14 days. Bank Transfer preferred."
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
              {loading
                ? "Saving to Database..."
                : documentType === "quotation"
                ? "Create Quotation"
                : "Create Sale Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
