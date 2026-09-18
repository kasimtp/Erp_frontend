import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BRAND_COLOR   = [15, 118, 110];   // teal-700
const ACCENT_COLOR  = [30, 41, 59];     // slate-800
const LIGHT_COLOR   = [248, 250, 252];  // slate-50
const TEXT_MUTED    = [100, 116, 139];  // slate-500

function fmtINR(val) {
  if (val === undefined || val === null || val === "") return "";
  const n = Number(val);
  if (isNaN(n)) return String(val);
  return "Rs " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Generate and download a report PDF.
 * @param {Object} opts
 * @param {string}   opts.reportTitle
 * @param {string}   opts.subtitle
 * @param {Object}   opts.filters        { startDate, endDate, status, ... }
 * @param {Array}    opts.metrics        [{ label, value }]
 * @param {string[]} opts.columns        table header labels
 * @param {Array[]}  opts.rows           2-d array of cell values
 * @param {string}   opts.fileName
 */
export function downloadReportPDF({ reportTitle, subtitle, filters = {}, metrics = [], columns = [], rows = [], fileName }) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let cursorY = 0;

  // ── Header Banner ──────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BUSINESS MANAGEMENT SYSTEM", 14, 11);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("ERP Report Portal", 14, 18);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, pageW - 14, 11, { align: "right" });
  doc.text(`Page 1`, pageW - 14, 18, { align: "right" });

  cursorY = 36;

  // ── Report Title ───────────────────────────────────────────────────────────
  doc.setTextColor(...ACCENT_COLOR);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(reportTitle, 14, cursorY);

  if (subtitle) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text(subtitle, 14, cursorY + 6);
    cursorY += 12;
  } else {
    cursorY += 8;
  }

  // ── Filter Summary ─────────────────────────────────────────────────────────
  const filterParts = [];
  if (filters.startDate)     filterParts.push(`From: ${fmtDate(filters.startDate)}`);
  if (filters.endDate)       filterParts.push(`To: ${fmtDate(filters.endDate)}`);
  if (filters.status && filters.status !== "all")   filterParts.push(`Status: ${filters.status}`);
  if (filters.category && filters.category !== "all") filterParts.push(`Category: ${filters.category}`);
  if (filters.search)        filterParts.push(`Search: "${filters.search}"`);

  if (filterParts.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, cursorY, pageW - 28, 9, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text("Filters Applied: " + filterParts.join("   |   "), 18, cursorY + 6);
    cursorY += 15;
  } else {
    cursorY += 2;
  }

  // ── KPI Metrics Boxes ──────────────────────────────────────────────────────
  if (metrics.length > 0) {
    const boxW = (pageW - 28) / Math.min(metrics.length, 5);
    metrics.slice(0, 5).forEach((m, i) => {
      const x = 14 + i * boxW;
      doc.setFillColor(...LIGHT_COLOR);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, cursorY, boxW - 3, 18, 2, 2, "FD");

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...TEXT_MUTED);
      doc.text(String(m.label), x + 4, cursorY + 6);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...ACCENT_COLOR);
      doc.text(String(m.value), x + 4, cursorY + 14);
    });
    cursorY += 26;
  }

  // ── Data Table ─────────────────────────────────────────────────────────────
  if (rows.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_MUTED);
    doc.text("No records found for the selected filters.", 14, cursorY + 10);
  } else {
    autoTable(doc, {
      startY: cursorY,
      head: [columns],
      body: rows,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        font: "helvetica",
        textColor: ACCENT_COLOR,
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: BRAND_COLOR,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: LIGHT_COLOR },
      columnStyles: {
        // Right-align last column (typically Amount/Status)
        [columns.length - 1]: { halign: "right" },
      },
      didDrawPage: (hookData) => {
        // Footer on every page
        const pg = doc.internal.getCurrentPageInfo().pageNumber;
        const total = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(...TEXT_MUTED);
        doc.text(`Business Management System — ${reportTitle}`, 14, pageH - 8);
        doc.text(`Page ${pg} of ${total}`, pageW - 14, pageH - 8, { align: "right" });

        // Thin footer line
        doc.setDrawColor(226, 232, 240);
        doc.line(14, pageH - 12, pageW - 14, pageH - 12);
      },
    });
  }

  // ── Download ───────────────────────────────────────────────────────────────
  const safeFileName = fileName || `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(safeFileName);
}

/**
 * Generate and download a professional single Invoice/Sale document PDF (portrait A4)
 * @param {Object} saleDoc
 */
export function downloadInvoicePDF(saleDoc) {
  if (!saleDoc) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const docTypeNames = {
    invoice: "TAX INVOICE",
    quotation: "SALES QUOTATION",
    salesOrder: "SALES ORDER",
    salesReturn: "SALES RETURN",
  };
  const docTitle = docTypeNames[saleDoc.documentType] || "TAX INVOICE";

  // Header Banner
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageW, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ORBIT BUSINESS SUITE", 14, 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("GSTIN: 32AABCU9603R1ZM | contact@orbitbusiness.com", 14, 20);
  doc.text("123 Business Avenue, Tech Hub, India", 14, 25);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(docTitle, pageW - 14, 16, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Status: ${(saleDoc.paymentStatus || saleDoc.status || "UNPAID").toUpperCase()}`, pageW - 14, 24, { align: "right" });

  // Invoice Details & Bill To
  let y = 42;

  // Document Info
  doc.setTextColor(...ACCENT_COLOR);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Document Details", 14, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Number:", 14, y + 6);
  doc.text("Date:", 14, y + 11);
  doc.text("Due Date:", 14, y + 16);

  doc.setTextColor(...ACCENT_COLOR);
  doc.setFont("helvetica", "bold");
  doc.text(saleDoc.documentNumber || "N/A", 35, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(fmtDate(saleDoc.createdAt || new Date()), 35, y + 11);
  doc.text(fmtDate(saleDoc.dueDate || new Date()), 35, y + 16);

  // Bill To Box (Right side)
  const rightX = pageW / 2 + 5;
  doc.setTextColor(...ACCENT_COLOR);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", rightX, y);

  const cust = saleDoc.customer || {};
  const custName = cust.name || saleDoc.customerName || "Valued Customer";
  const custPhone = cust.phone || "";
  const custEmail = cust.email || "";
  const custAddress = cust.address || "";

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ACCENT_COLOR);
  doc.text(custName, rightX, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  let custY = y + 11;
  if (custPhone) {
    doc.text(`Phone: ${custPhone}`, rightX, custY);
    custY += 5;
  }
  if (custEmail) {
    doc.text(`Email: ${custEmail}`, rightX, custY);
    custY += 5;
  }
  if (custAddress) {
    doc.text(`Address: ${custAddress}`, rightX, custY);
    custY += 5;
  }

  y = Math.max(y + 24, custY + 2);

  // Items Table
  const items = saleDoc.items || [];
  const tableRows = items.map((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const total = Number(item.total) || (qty * price);
    return [
      idx + 1,
      item.productName || item.product?.name || "Product Item",
      item.sku || "—",
      qty,
      fmtINR(price),
      taxRate ? `${taxRate}%` : "0%",
      fmtINR(total),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["#", "Item Description", "SKU", "Qty", "Unit Price", "Tax", "Total"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: ACCENT_COLOR,
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 25 },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 30, halign: "right" },
    },
  });

  const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 8 : y + 40;

  // Summary Table (Right aligned)
  const summaryX = pageW - 85;
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_MUTED);

  const grandTotal = saleDoc.grandTotal || 0;
  const subtotal = saleDoc.subtotal || grandTotal;
  const taxTotal = saleDoc.taxTotal || 0;
  const discountTotal = saleDoc.discountTotal || 0;
  const amountPaid = saleDoc.amountPaid || 0;
  const balanceDue = saleDoc.balanceDue !== undefined ? saleDoc.balanceDue : (grandTotal - amountPaid);

  let sumY = finalY;
  const addSummaryLine = (label, val, isBold = false, isHighlight = false) => {
    if (isHighlight) {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(summaryX - 4, sumY - 4, 75, 8, 1, 1, "F");
    }
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(...(isBold ? ACCENT_COLOR : TEXT_MUTED));
    doc.text(label, summaryX, sumY);
    doc.text(fmtINR(val), pageW - 14, sumY, { align: "right" });
    sumY += 6;
  };

  addSummaryLine("Subtotal:", subtotal);
  if (discountTotal > 0) addSummaryLine("Discount:", -discountTotal);
  if (taxTotal > 0) addSummaryLine("Tax:", taxTotal);
  addSummaryLine("Grand Total:", grandTotal, true, true);
  if (amountPaid > 0) addSummaryLine("Amount Paid:", amountPaid);
  addSummaryLine("Balance Due:", balanceDue, true);

  // Notes
  if (saleDoc.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...ACCENT_COLOR);
    doc.text("Notes / Terms:", 14, finalY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(doc.splitTextToSize(saleDoc.notes, summaryX - 25), 14, finalY + 5);
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(14, pageH - 20, pageW - 14, pageH - 20);

  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Thank you for your business! This is a computer generated document.", 14, pageH - 14);
  doc.text("Authorized Signature ____________________", pageW - 14, pageH - 14, { align: "right" });

  doc.save(`${saleDoc.documentNumber || "Invoice"}.pdf`);
}

/**
 * Share invoice summary with direct WhatsApp link and download PDF invoice
 * @param {Object} saleDoc
 */
export function shareInvoiceWhatsApp(saleDoc) {
  if (!saleDoc) return;

  // 1. Download the PDF invoice
  downloadInvoicePDF(saleDoc);

  // 2. Prepare WhatsApp text
  const cust = saleDoc.customer || {};
  const custName = cust.name || saleDoc.customerName || "Customer";
  const phone = cust.phone || "";

  // Clean phone number: remove non-digits
  let cleanPhone = String(phone).replace(/\D/g, "");
  // If Indian 10-digit number without country code, prepend 91
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const itemsList = (saleDoc.items || [])
    .map((it, i) => `${i + 1}. ${it.productName || it.product?.name || "Item"} x ${it.quantity} = Rs ${(it.total || 0).toLocaleString("en-IN")}`)
    .join("\n");

  const message = `*INVOICE: ${saleDoc.documentNumber}*
Hello ${custName},

Here are the details for your recent transaction:
----------------------------------------
*Type:* ${saleDoc.documentType ? saleDoc.documentType.toUpperCase() : "INVOICE"}
*Date:* ${new Date(saleDoc.createdAt || Date.now()).toLocaleDateString("en-IN")}
*Grand Total:* Rs ${(saleDoc.grandTotal || 0).toLocaleString("en-IN")}
*Paid:* Rs ${(saleDoc.amountPaid || 0).toLocaleString("en-IN")}
*Balance Due:* Rs ${(saleDoc.balanceDue !== undefined ? saleDoc.balanceDue : saleDoc.grandTotal).toLocaleString("en-IN")}
*Due Date:* ${saleDoc.dueDate ? new Date(saleDoc.dueDate).toLocaleDateString("en-IN") : "N/A"}
----------------------------------------
*Items:*
${itemsList || "—"}
----------------------------------------
Your PDF invoice has been downloaded. Thank you for your business!`;

  const encodedMsg = encodeURIComponent(message);
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;

  window.open(waUrl, "_blank");
}

/**
 * Generate and download a specialized professional Sales Quotation / Estimate PDF
 * @param {Object} quoteDoc
 */
export function downloadQuotationPDF(quoteDoc) {
  if (!quoteDoc) return;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Header Banner with Brand styling
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageW, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ORBIT BUSINESS SUITE", 14, 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("GSTIN: 32AABCU9603R1ZM | contact@orbitbusiness.com", 14, 20);
  doc.text("123 Business Avenue, Tech Hub, India | Ph: +91 98765 43210", 14, 25);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SALES QUOTATION", pageW - 14, 15, { align: "right" });

  const statusStr = (quoteDoc.status || "SENT").toUpperCase();
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Status: ${statusStr}`, pageW - 14, 23, { align: "right" });
  doc.text(`Official Quotation / Price Estimate`, pageW - 14, 28, { align: "right" });

  // Details Row
  let y = 43;

  // Document Info
  doc.setTextColor(...ACCENT_COLOR);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("Quotation Details", 14, y);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Quote Number:", 14, y + 6);
  doc.text("Quote Date:", 14, y + 11);
  doc.text("Valid Until:", 14, y + 16);

  doc.setTextColor(...ACCENT_COLOR);
  doc.setFont("helvetica", "bold");
  doc.text(quoteDoc.documentNumber || "QUO-DRAFT", 40, y + 6);
  doc.setFont("helvetica", "normal");
  doc.text(fmtDate(quoteDoc.createdAt || new Date()), 40, y + 11);

  // Validity Date (default +30 days if not set)
  const validUntilDate = quoteDoc.dueDate
    ? fmtDate(quoteDoc.dueDate)
    : fmtDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  doc.setTextColor(15, 118, 110);
  doc.setFont("helvetica", "bold");
  doc.text(validUntilDate, 40, y + 16);

  // Quoted To (Right Side)
  const rightX = pageW / 2 + 5;
  doc.setTextColor(...ACCENT_COLOR);
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text("Quotation Prepared For:", rightX, y);

  const cust = quoteDoc.customer || {};
  const custName = cust.name || quoteDoc.customerName || "Valued Client";
  const custPhone = cust.phone || "";
  const custEmail = cust.email || "";
  const custAddress = cust.address || "";
  const custCompany = cust.company || "";

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ACCENT_COLOR);
  doc.text(custName + (custCompany ? ` (${custCompany})` : ""), rightX, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_MUTED);
  let custY = y + 11;
  if (custPhone) {
    doc.text(`Phone: ${custPhone}`, rightX, custY);
    custY += 5;
  }
  if (custEmail) {
    doc.text(`Email: ${custEmail}`, rightX, custY);
    custY += 5;
  }
  if (custAddress) {
    doc.text(`Address: ${custAddress}`, rightX, custY);
    custY += 5;
  }

  y = Math.max(y + 24, custY + 2);

  // Items Table
  const items = quoteDoc.items || [];
  const tableRows = items.map((item, idx) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const total = Number(item.total) || qty * price;
    return [
      idx + 1,
      item.productName || item.product?.name || "Product Item",
      item.sku || "—",
      qty,
      fmtINR(price),
      taxRate ? `${taxRate}%` : "0%",
      fmtINR(total),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["#", "Item & Specifications", "SKU", "Qty", "Unit Price", "Tax", "Quoted Total"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: ACCENT_COLOR,
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 25 },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 32, halign: "right" },
    },
  });

  const finalY = doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY + 8 : y + 45;

  // Summary Table (Right aligned)
  const summaryX = pageW - 85;
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_MUTED);

  const grandTotal = quoteDoc.grandTotal || 0;
  const subtotal = quoteDoc.subtotal || grandTotal;
  const taxTotal = quoteDoc.taxTotal || 0;
  const discountTotal = quoteDoc.discountTotal || 0;

  let sumY = finalY;
  const addSummaryLine = (label, val, isBold = false, isHighlight = false) => {
    if (isHighlight) {
      doc.setFillColor(236, 253, 245); // teal-50
      doc.roundedRect(summaryX - 4, sumY - 4, 75, 8, 1, 1, "F");
    }
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setTextColor(...(isBold ? ACCENT_COLOR : TEXT_MUTED));
    doc.text(label, summaryX, sumY);
    doc.text(fmtINR(val), pageW - 14, sumY, { align: "right" });
    sumY += 6;
  };

  addSummaryLine("Quotation Subtotal:", subtotal);
  if (discountTotal > 0) addSummaryLine("Special Discount:", -discountTotal);
  if (taxTotal > 0) addSummaryLine("Estimated Tax (GST):", taxTotal);
  addSummaryLine("Total Quoted Amount:", grandTotal, true, true);

  // Terms & Conditions section (Left side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT_COLOR);
  doc.text("Quotation Terms & Conditions:", 14, finalY);

  const standardTerms = [
    "1. Validity: This quotation is valid until the validity date specified above.",
    "2. Delivery: Items will be dispatched upon receipt of confirmed Purchase Order.",
    "3. Payment: Standard terms apply upon final invoice issuance.",
    quoteDoc.notes ? `4. Notes: ${quoteDoc.notes}` : "4. Prices are subject to applicable taxes as indicated above.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  let termY = finalY + 5;
  standardTerms.forEach((term) => {
    const lines = doc.splitTextToSize(term, summaryX - 25);
    doc.text(lines, 14, termY);
    termY += lines.length * 4;
  });

  // Dual Signature Area at Bottom
  const sigY = pageH - 26;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, sigY - 6, pageW - 14, sigY - 6);

  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Client Acceptance Signature", 14, sigY);
  doc.text("Authorized Signature & Stamp", pageW - 14, sigY, { align: "right" });

  doc.setFontSize(7.5);
  doc.text("Date: ________________________", 14, sigY + 8);
  doc.text("For Orbit Business Suite", pageW - 14, sigY + 8, { align: "right" });

  doc.save(`${quoteDoc.documentNumber || "Quotation"}.pdf`);
}

/**
 * Share quotation summary with direct WhatsApp link and download quotation PDF
 * @param {Object} quoteDoc
 */
export function shareQuotationWhatsApp(quoteDoc) {
  if (!quoteDoc) return;

  // 1. Download PDF quotation
  downloadQuotationPDF(quoteDoc);

  // 2. Prepare WhatsApp message
  const cust = quoteDoc.customer || {};
  const custName = cust.name || quoteDoc.customerName || "Customer";
  const phone = cust.phone || "";

  let cleanPhone = String(phone).replace(/\D/g, "");
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const itemsList = (quoteDoc.items || [])
    .map(
      (it, i) =>
        `${i + 1}. ${it.productName || it.product?.name || "Item"} x ${it.quantity} = Rs ${(it.total || 0).toLocaleString("en-IN")}`
    )
    .join("\n");

  const validUntil = quoteDoc.dueDate
    ? new Date(quoteDoc.dueDate).toLocaleDateString("en-IN")
    : "30 days from date";

  const message = `*SALES QUOTATION: ${quoteDoc.documentNumber}*
Hello ${custName},

Thank you for your inquiry! Please find the price estimate / quotation details below:
----------------------------------------
*Quotation #:* ${quoteDoc.documentNumber}
*Date:* ${new Date(quoteDoc.createdAt || Date.now()).toLocaleDateString("en-IN")}
*Valid Until:* ${validUntil}
*Quoted Total:* Rs ${(quoteDoc.grandTotal || 0).toLocaleString("en-IN")}
*Status:* ${(quoteDoc.status || "SENT").toUpperCase()}
----------------------------------------
*Items Quoted:*
${itemsList || "—"}
----------------------------------------
${quoteDoc.notes ? `*Notes:* ${quoteDoc.notes}\n----------------------------------------\n` : ""}Your official PDF quotation has been downloaded to your device. Please let us know if you would like to proceed with the order!

Orbit Business Suite`;

  const encodedMsg = encodeURIComponent(message);
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;

  window.open(waUrl, "_blank");
}

