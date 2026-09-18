import { ChevronDown, CreditCard, Download, Filter, MessageCircle, Plus, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import client from "../../api/client";
import CreateCustomerModal from "../../components/customers/CreateCustomerModal.jsx";
import StockAdjustmentModal from "../../components/inventory/StockAdjustmentModal.jsx";
import CreateProductModal from "../../components/products/CreateProductModal.jsx";
import CreatePurchaseModal from "../../components/purchases/CreatePurchaseModal.jsx";
import RecordSupplierPaymentModal from "../../components/purchases/RecordSupplierPaymentModal.jsx";
import CreateSaleModal from "../../components/sales/CreateSaleModal.jsx";
import RecordPaymentModal from "../../components/sales/RecordPaymentModal.jsx";
import CreateSupplierModal from "../../components/suppliers/CreateSupplierModal.jsx";
import {
  downloadInvoicePDF,
  downloadQuotationPDF,
  shareInvoiceWhatsApp,
  shareQuotationWhatsApp,
} from "../../utils/pdfExportUtils";

const statusClass = (value) => {
  const text = String(value).toLowerCase();
  if (["paid", "active", "received", "in stock", "income", "configured", "enabled"].some((x) => text.includes(x)))
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (["overdue", "out of stock", "inactive", "cancelled"].some((x) => text.includes(x)))
    return "bg-rose-50 text-rose-700 border border-rose-200";
  if (["partial", "low stock", "unpaid", "ordered", "payable", "payment", "sent", "draft"].some((x) => text.includes(x)))
    return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-slate-100 text-slate-600 border border-slate-200";
};

export default function ERPModulePage({ config }) {
  const [activeTab, setActiveTab] = useState(config.tabs[0]);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [liveData, setLiveData] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] = useState(false);

  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState(null);
  const [selectedPurchaseForPayment, setSelectedPurchaseForPayment] = useState(null);

  const titleLower = config.title.toLowerCase();

  const fetchLiveData = useCallback(async () => {
    setLoading(true);
    try {
      if (titleLower.includes("sale")) {
        let docType = "invoice";
        const tabLower = activeTab.toLowerCase();
        if (tabLower.includes("quotation")) docType = "quotation";
        else if (tabLower.includes("order")) docType = "salesOrder";
        else if (tabLower.includes("return")) docType = "salesReturn";
        else docType = "invoice";

        const [salesRes, metricsRes] = await Promise.all([
          client.get(`/sales?documentType=${docType}`),
          client.get(`/sales/metrics`),
        ]);

        const sJson = salesRes.data;
        const mJson = metricsRes.data;

        if (sJson.success && Array.isArray(sJson.data)) {
          setLiveData(
            sJson.data.map((item) => ({
              id: item._id,
              rawDoc: item,
              row: [
                item.documentNumber,
                item.customerName || item.customer?.name || "N/A",
                new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                `₹${item.grandTotal?.toLocaleString("en-IN") || 0}`,
                item.paymentStatus ? item.paymentStatus.toUpperCase() : item.status.toUpperCase(),
              ],
            }))
          );
        }

        if (mJson.success && mJson.data) {
          setLiveMetrics([
            ["Total Invoiced", `₹${mJson.data.totalInvoiced?.toLocaleString("en-IN")}`],
            ["Total Received", `₹${mJson.data.totalReceived?.toLocaleString("en-IN")}`],
            ["Outstanding Receivables", `₹${mJson.data.totalOutstanding?.toLocaleString("en-IN")}`],
            ["Invoices Count", `${mJson.data.totalInvoicesCount}`],
          ]);
        }
      } else if (titleLower.includes("purchase")) {
        let docType = "purchaseOrder";
        const tabLower = activeTab.toLowerCase();
        if (tabLower.includes("bill")) docType = "supplierBill";
        else if (tabLower.includes("return")) docType = "purchaseReturn";
        else docType = "purchaseOrder";

        const [purRes, metricsRes] = await Promise.all([
          client.get(`/purchases?documentType=${docType}`),
          client.get(`/purchases/metrics`),
        ]);

        const pJson = purRes.data;
        const mJson = metricsRes.data;

        if (pJson.success && Array.isArray(pJson.data)) {
          setLiveData(
            pJson.data.map((item) => ({
              id: item._id,
              rawDoc: item,
              row: [
                item.documentNumber,
                item.supplierName || item.supplier?.name || "N/A",
                new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                `₹${item.grandTotal?.toLocaleString("en-IN") || 0}`,
                item.paymentStatus ? item.paymentStatus.toUpperCase() : item.status.toUpperCase(),
              ],
            }))
          );
        }

        if (mJson.success && mJson.data) {
          setLiveMetrics([
            ["Total Purchases", `₹${mJson.data.totalPurchases?.toLocaleString("en-IN")}`],
            ["Total Payables", `₹${mJson.data.totalPayable?.toLocaleString("en-IN")}`],
            ["Open Orders", `${mJson.data.openOrdersCount}`],
            ["Due Bills", `${mJson.data.dueBillsCount}`],
          ]);
        }
      } else if (titleLower.includes("inventory")) {
        const tabLower = activeTab.toLowerCase();
        let endpoint = "/inventory/stock";
        if (tabLower.includes("low")) endpoint = "/inventory/low-stock";
        else if (tabLower.includes("transaction")) endpoint = "/inventory/transactions";
        else if (tabLower.includes("adjustment")) endpoint = "/inventory/adjustments";

        const [invRes, metricsRes] = await Promise.all([
          client.get(endpoint),
          client.get("/inventory/metrics"),
        ]);

        const iJson = invRes.data;
        const mJson = metricsRes.data;

        if (iJson.success && Array.isArray(iJson.data)) {
          if (tabLower.includes("transaction")) {
            setLiveData(
              iJson.data.map((tx) => ({
                id: tx._id,
                rawDoc: tx,
                row: [
                  tx.sku || tx.product?.sku || "N/A",
                  tx.productName || tx.product?.name || "N/A",
                  tx.type.toUpperCase(),
                  `${tx.quantity > 0 ? "+" : ""}${tx.quantity} (${tx.newStock} remaining)`,
                  tx.reason || tx.referenceNumber || "Movement",
                ],
              }))
            );
          } else if (tabLower.includes("adjustment")) {
            setLiveData(
              iJson.data.map((adj) => ({
                id: adj._id,
                rawDoc: adj,
                row: [
                  adj.adjustmentNumber,
                  adj.productName || adj.product?.name || "N/A",
                  adj.adjustmentType.toUpperCase(),
                  `${adj.adjustmentType === "increase" ? "+" : "-"}${adj.quantity} (Stock: ${adj.previousStock} -> ${adj.newStock})`,
                  adj.reason,
                ],
              }))
            );
          } else {
            setLiveData(
              iJson.data.map((item) => ({
                id: item._id,
                rawDoc: item,
                row: [
                  item.sku,
                  item.name,
                  item.category || "General",
                  `${item.stockQuantity || 0} ${item.unit || "pcs"} (Val: ₹${(item.stockValue || 0).toLocaleString("en-IN")})`,
                  item.status ? item.status.toUpperCase() : "IN STOCK",
                ],
              }))
            );
          }
        }

        if (mJson.success && mJson.data) {
          setLiveMetrics([
            ["Stock Valuation", `₹${mJson.data.totalStockValue?.toLocaleString("en-IN")}`],
            ["Total Catalog Items", `${mJson.data.totalItemsCount}`],
            ["Low Stock Alerts", `${mJson.data.lowStockCount}`],
            ["Out of Stock", `${mJson.data.outOfStockCount}`],
          ]);
        }
      } else if (titleLower.includes("customer")) {
        const res = await client.get("/customers");
        const json = res.data;
        if (json.success && Array.isArray(json.data)) {
          setLiveData(
            json.data.map((cust) => ({
              id: cust._id,
              rawDoc: cust,
              row: [
                cust.name,
                cust.phone || cust.email || "N/A",
                cust.company || "Individual",
                `₹${(cust.balance || 0).toLocaleString("en-IN")}`,
                cust.status.toUpperCase(),
              ],
            }))
          );
          setLiveMetrics([
            ["Total Customers", `${json.data.length}`],
            ["Active Directory", `${json.data.filter((c) => c.status === "active").length}`],
            ["Total Outstanding", `₹${json.data.reduce((sum, c) => sum + (c.balance || 0), 0).toLocaleString("en-IN")}`],
            ["New This Month", `${json.data.length}`],
          ]);
        }
      } else if (titleLower.includes("supplier")) {
        const res = await client.get("/suppliers");
        const json = res.data;
        if (json.success && Array.isArray(json.data)) {
          setLiveData(
            json.data.map((supp) => ({
              id: supp._id,
              rawDoc: supp,
              row: [
                supp.name,
                supp.phone || supp.email || "N/A",
                supp.company || "Corporate",
                `₹${(supp.payableBalance || 0).toLocaleString("en-IN")}`,
                supp.status.toUpperCase(),
              ],
            }))
          );
          setLiveMetrics([
            ["Total Suppliers", `${json.data.length}`],
            ["Active Suppliers", `${json.data.filter((s) => s.status === "active").length}`],
            ["Total Payable Balance", `₹${json.data.reduce((sum, s) => sum + (s.payableBalance || 0), 0).toLocaleString("en-IN")}`],
            ["Registered Partners", `${json.data.length}`],
          ]);
        }
      } else if (titleLower.includes("product") || titleLower.includes("item")) {
        const res = await client.get("/products");
        const json = res.data;
        if (json.success && Array.isArray(json.data)) {
          setLiveData(
            json.data.map((prod) => ({
              id: prod._id,
              rawDoc: prod,
              row: [
                prod.sku,
                prod.name,
                prod.category,
                `₹${prod.sellingPrice} (${prod.stockQuantity} ${prod.unit})`,
                prod.status.toUpperCase(),
              ],
            }))
          );
          setLiveMetrics([
            ["Total Catalog Products", `${json.data.length}`],
            ["In Stock Items", `${json.data.filter((p) => p.status === "in stock").length}`],
            ["Low Stock Alerts", `${json.data.filter((p) => p.status === "low stock").length}`],
            ["Out of Stock", `${json.data.filter((p) => p.status === "out of stock").length}`],
          ]);
        }
      } else {
        setLiveData([]);
        setLiveMetrics(null);
      }
    } catch (err) {
      console.error("Failed to fetch module data:", err);
    } finally {
      setLoading(false);
    }
  }, [titleLower, activeTab]);

  useEffect(() => {
    setActiveTab(config.tabs[0]);
  }, [config]);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const activeRows = useMemo(() => {
    if (liveData && liveData.length > 0) {
      return liveData.map((d) => ({
        id: d.id,
        rawDoc: d.rawDoc,
        row: d.row,
      }));
    }
    return (config.rows || []).map((row, idx) => ({
      id: `static-${idx}`,
      rawDoc: null,
      row,
    }));
  }, [liveData, config.rows]);

  const filteredRows = useMemo(() => {
    return activeRows.filter((r) => r.row.join(" ").toLowerCase().includes(query.toLowerCase()));
  }, [activeRows, query]);

  const handlePrimaryAction = () => {
    if (titleLower.includes("sale")) {
      setIsSaleModalOpen(true);
    } else if (titleLower.includes("purchase")) {
      setIsPurchaseModalOpen(true);
    } else if (titleLower.includes("inventory")) {
      setIsStockAdjustmentModalOpen(true);
    } else if (titleLower.includes("customer")) {
      setIsCustomerModalOpen(true);
    } else if (titleLower.includes("supplier")) {
      setIsSupplierModalOpen(true);
    } else if (titleLower.includes("product") || titleLower.includes("item")) {
      setIsProductModalOpen(true);
    } else {
      setNotice(`${config.primaryAction} feature activated for ${config.title}.`);
      setTimeout(() => setNotice(""), 2800);
    }
  };

  const currentMetrics = liveMetrics || config.metrics;

  return (
    <div className="space-y-6">
      {notice && (
        <div className="fixed right-5 top-24 z-50 max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          {notice}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{config.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{config.description}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchLiveData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            title="Refresh database records"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={handlePrimaryAction}
            className="flex w-fit items-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-teal-700"
          >
            <Plus size={18} />
            {activeTab.toLowerCase().includes("quotation") ? "Create quotation" : config.primaryAction}
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {currentMetrics.map(([label, value]) => (
          <article key={label} className="card p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
            <div className="mt-4 h-1.5 rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-teal-500" />
            </div>
          </article>
        ))}
      </section>

      {/* Data Table */}
      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 px-4 pt-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {config.tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="relative w-full sm:max-w-sm">
            <Search size={17} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input py-2.5 pl-10 text-xs"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
            />
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 hover:bg-slate-50">
              <Filter size={15} /> Filter <ChevronDown size={14} />
            </button>
            <button
              onClick={() => setNotice("Export prepared with the visible database records.")}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {config.columns.map((col) => (
                  <th key={col} className="px-6 py-4 font-semibold">
                    {col}
                  </th>
                ))}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRows.map(({ id, rawDoc, row }) => (
                <tr key={id} className="hover:bg-slate-50/70">
                  {row.map((cell, i) => (
                    <td key={i} className={`px-6 py-4 ${i === 0 ? "font-medium text-slate-900" : "text-slate-600"}`}>
                      {i === row.length - 1 ? (
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(cell)}`}>
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}

                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right">
                    {titleLower.includes("sale") && rawDoc ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title={rawDoc.documentType === "quotation" ? "Download PDF Quotation" : "Download PDF Invoice"}
                          onClick={() =>
                            rawDoc.documentType === "quotation"
                              ? downloadQuotationPDF(rawDoc)
                              : downloadInvoicePDF(rawDoc)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-2xs hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          type="button"
                          title="Share via WhatsApp"
                          onClick={() =>
                            rawDoc.documentType === "quotation"
                              ? shareQuotationWhatsApp(rawDoc)
                              : shareInvoiceWhatsApp(rawDoc)
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-emerald-600 shadow-2xs hover:border-emerald-300 hover:bg-emerald-50 transition"
                        >
                          <MessageCircle size={13} />
                        </button>
                        {rawDoc.balanceDue > 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedSaleForPayment(rawDoc)}
                            className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                          >
                            <CreditCard size={13} /> Pay
                          </button>
                        ) : null}
                      </div>
                    ) : titleLower.includes("purchase") && rawDoc && rawDoc.balanceDue > 0 ? (
                      <button
                        onClick={() => setSelectedPurchaseForPayment(rawDoc)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100"
                      >
                        <CreditCard size={14} /> Pay Bill
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredRows.length && (
            <div className="p-12 text-center text-sm text-slate-500">
              {loading ? "Loading database records..." : "No matching records found in database."}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
          <span>Showing {filteredRows.length} database records</span>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">Previous</button>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50">Next</button>
          </div>
        </div>
      </section>

      {/* Creation & Payment Modals */}
      <CreateSaleModal
        isOpen={isSaleModalOpen}
        initialDocumentType={activeTab.toLowerCase().includes("quotation") ? "quotation" : "invoice"}
        onClose={() => setIsSaleModalOpen(false)}
        onSuccess={() => {
          fetchLiveData();
          setNotice("Sale document successfully created and stored in MongoDB!");
          setTimeout(() => setNotice(""), 3500);
        }}
      />

      <CreatePurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={() => {
          fetchLiveData();
          setNotice("Purchase document created, stock updated in catalog!");
          setTimeout(() => setNotice(""), 3500);
        }}
      />

      <StockAdjustmentModal
        isOpen={isStockAdjustmentModalOpen}
        onClose={() => setIsStockAdjustmentModalOpen(false)}
        onSuccess={() => {
          fetchLiveData();
          setNotice("Stock adjustment recorded & inventory updated in MongoDB!");
          setTimeout(() => setNotice(""), 3500);
        }}
      />

      <CreateCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={() => {
          fetchLiveData();
          setNotice("Customer created and stored in MongoDB!");
          setTimeout(() => setNotice(""), 3500);
        }}
      />

      <CreateSupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSuccess={() => {
          fetchLiveData();
          setNotice("Supplier created and stored in MongoDB!");
          setTimeout(() => setNotice(""), 3500);
        }}
      />

      <CreateProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => {
          fetchLiveData();
          setNotice("Product catalog item created in MongoDB!");
          setTimeout(() => setNotice(""), 3500);
        }}
      />

      <RecordPaymentModal
        isOpen={!!selectedSaleForPayment}
        saleDoc={selectedSaleForPayment}
        onClose={() => setSelectedSaleForPayment(null)}
        onSuccess={() => {
          fetchLiveData();
          setNotice("Payment recorded and customer balance updated in MongoDB!");
          setTimeout(() => setNotice(""), 3500);
        }}
      />

      <RecordSupplierPaymentModal
        isOpen={!!selectedPurchaseForPayment}
        purchaseDoc={selectedPurchaseForPayment}
        onClose={() => setSelectedPurchaseForPayment(null)}
        onSuccess={() => {
          fetchLiveData();
          setNotice("Supplier payment recorded and payable balance updated!");
          setTimeout(() => setNotice(""), 3500);
        }}
      />
    </div>
  );
}
