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
