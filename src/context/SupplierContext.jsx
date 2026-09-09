import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SupplierContext = createContext(null);

const INITIAL_SUPPLIERS = [
  {
    id: "SUP-001",
    name: "Metro Steel Works",
    contactPerson: "Rajesh Sharma",
    phone: "+91 98460 11220",
    email: "sales@metrosteel.in",
    address: "Plot 14, Industrial Area Phase II, Kochi, Kerala",
    gstin: "32AAACM1234F1Z5",
    category: "Steel & Metals",
    paymentTerms: "Net 30",
    creditLimit: 500000,
    status: "Active",
    totalPurchases: 182400,
    amountPayable: 0,
    notes: "Primary supplier for stainless steel frames and heavy sheet metal.",
  },
  {
    id: "SUP-002",
    name: "Prime Components",
    contactPerson: "Anish Varma",
    phone: "+91 99471 32008",
    email: "orders@primecomp.com",
    address: "42 Electronics Zone, Kakkanad, Kochi",
    gstin: "32ABCP9876E1Z8",
    category: "Components",
    paymentTerms: "Net 15",
    creditLimit: 200000,
    status: "Active",
    totalPurchases: 96700,
    amountPayable: 46700,
    notes: "Thermal sensors, switches, and heating elements supplier.",
  },
  {
    id: "SUP-003",
    name: "HeatPro Systems",
    contactPerson: "Kavita Menon",
    phone: "+91 80752 91460",
    email: "accounts@heatpro.co.in",
    address: "88 Tech Park, Kalamassery, Kochi",
    gstin: "32BGHJ4321D1ZK",
    category: "Machinery",
    paymentTerms: "Net 30",
    creditLimit: 350000,
    status: "Active",
    totalPurchases: 84200,
    amountPayable: 45600,
    notes: "High-temperature commercial baking thermostats and coils.",
  },
  {
    id: "SUP-004",
    name: "Royal Fabrication",
    contactPerson: "Suresh Nair",
    phone: "+91 81294 77182",
    email: "contact@royalfab.in",
    address: "12 Craftsmen Colony, Aluva",
    gstin: "32CCDR5678B1Z3",
    category: "Fabrication",
    paymentTerms: "Immediate",
    creditLimit: 100000,
    status: "Active",
    totalPurchases: 43600,
    amountPayable: 0,
    notes: "Custom laser-cut handles, hinges, and steel mesh grates.",
  },
  {
    id: "SUP-005",
    name: "Apex Logistics & Transport",
    contactPerson: "Manoj Kumar",
    phone: "+91 94470 55199",
    email: "dispatch@apexlogistics.in",
    address: "5 Bypass Highway Hub, Edappally, Kochi",
    gstin: "32AAFL8890K1Z9",
    category: "Logistics",
    paymentTerms: "Net 15",
    creditLimit: 150000,
    status: "Active",
    totalPurchases: 28400,
    amountPayable: 12500,
    notes: "Regional heavy equipment transport and freight handling.",
  },
  {
    id: "SUP-006",
    name: "EcoPack Containers",
    contactPerson: "Deepa Thomas",
    phone: "+91 97451 88302",
    email: "info@ecopack.co.in",
    address: "Unit 3, Industrial Estate, Angamaly",
    gstin: "32EEPB1122C1Z4",
    category: "Packaging",
    paymentTerms: "Net 30",
    creditLimit: 100000,
    status: "Inactive",
    totalPurchases: 15800,
    amountPayable: 0,
    notes: "Heavy wooden crates and protective foam wrapping.",
  },
];

const INITIAL_PURCHASES = [
  {
    id: "PO-0048",
    supplierId: "SUP-001",
    supplierName: "Metro Steel Works",
    date: "2026-09-06",
    dueDate: "2026-10-06",
    items: [
      { name: "304 Grade Stainless Steel Sheet (2mm)", qty: 25, rate: 2800, amount: 70000 },
      { name: "Steel Angle Bar 40x40", qty: 20, rate: 620, amount: 12400 },
    ],
    totalAmount: 82400,
    paidAmount: 82400,
    status: "Paid",
    billNo: "INV-MSW-982",
  },
  {
    id: "PO-0047",
    supplierId: "SUP-002",
    supplierName: "Prime Components",
    date: "2026-09-05",
    dueDate: "2026-09-20",
    items: [
      { name: "Digital Thermostat Controller X5", qty: 30, rate: 1100, amount: 33000 },
      { name: "High Temp Heating Coil 3KW", qty: 10, rate: 1370, amount: 13700 },
    ],
    totalAmount: 46700,
    paidAmount: 0,
    status: "Unpaid",
    billNo: "INV-PC-4412",
  },
  {
    id: "PO-0046",
    supplierId: "SUP-003",
    supplierName: "HeatPro Systems",
    date: "2026-09-02",
    dueDate: "2026-09-17",
    items: [
      { name: "Industrial Oven Blower Unit 0.5HP", qty: 4, rate: 11400, amount: 45600 },
    ],
    totalAmount: 45600,
    paidAmount: 0,
    status: "Unpaid",
    billNo: "INV-HP-3091",
  },
  {
    id: "PO-0045",
    supplierId: "SUP-004",
    supplierName: "Royal Fabrication",
    date: "2026-08-29",
    dueDate: "2026-08-29",
    items: [
      { name: "Heavy Duty Door Latches (Set)", qty: 15, rate: 1973, amount: 29600 },
    ],
    totalAmount: 29600,
    paidAmount: 29600,
    status: "Paid",
    billNo: "INV-RF-881",
  },
  {
    id: "PO-0044",
    supplierId: "SUP-005",
    supplierName: "Apex Logistics & Transport",
    date: "2026-09-01",
    dueDate: "2026-09-16",
    items: [
      { name: "Interstate Machinery Freight Charges", qty: 1, rate: 12500, amount: 12500 },
    ],
    totalAmount: 12500,
    paidAmount: 0,
    status: "Unpaid",
    billNo: "INV-APX-774",
  },
  {
    id: "PO-0043",
    supplierId: "SUP-001",
    supplierName: "Metro Steel Works",
    date: "2026-08-20",
    dueDate: "2026-09-19",
    items: [
      { name: "Perforated Steel Trays 60x40cm", qty: 100, rate: 1000, amount: 100000 },
    ],
    totalAmount: 100000,
    paidAmount: 100000,
    status: "Paid",
    billNo: "INV-MSW-901",
  },
];

const INITIAL_PAYMENTS = [
  {
    id: "PAY-1004",
    supplierId: "SUP-001",
    supplierName: "Metro Steel Works",
    date: "2026-09-06",
    amount: 82400,
    paymentMethod: "Bank Transfer",
    referenceNo: "UTR-994827104928",
    notes: "Full payment against Bill INV-MSW-982",
  },
  {
    id: "PAY-1003",
    supplierId: "SUP-004",
    supplierName: "Royal Fabrication",
    date: "2026-08-29",
    amount: 29600,
    paymentMethod: "UPI",
    referenceNo: "UPI-ROYAL-94821",
    notes: "Payment for laser-cut latches order PO-0045",
  },
  {
    id: "PAY-1002",
    supplierId: "SUP-003",
    supplierName: "HeatPro Systems",
    date: "2026-08-15",
    amount: 38600,
    paymentMethod: "Bank Transfer",
    referenceNo: "UTR-11029384756",
    notes: "Settled previous balance for July orders",
  },
];

export function SupplierProvider({ children }) {
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem("bms_suppliers");
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [purchases, setPurchases] = useState(() => {
    const saved = localStorage.getItem("bms_supplier_purchases");
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem("bms_supplier_payments");
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  useEffect(() => {
    localStorage.setItem("bms_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("bms_supplier_purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem("bms_supplier_payments", JSON.stringify(payments));
  }, [payments]);

  // Recalculate totals
  const totalAmountPayable = useMemo(() => {
    return suppliers.reduce((acc, curr) => acc + (curr.amountPayable || 0), 0);
  }, [suppliers]);

  const totalPurchasesAmount = useMemo(() => {
    return purchases.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  }, [purchases]);

  const addSupplier = (newSup) => {
    const created = {
      ...newSup,
      id: `SUP-00${suppliers.length + 1}`,
      totalPurchases: Number(newSup.totalPurchases || 0),
      amountPayable: Number(newSup.amountPayable || 0),
      status: newSup.status || "Active",
    };
    setSuppliers((prev) => [created, ...prev]);
    return created;
  };

  const updateSupplier = (id, updatedFields) => {
    setSuppliers((prev) =>
      prev.map((sup) => (sup.id === id ? { ...sup, ...updatedFields } : sup))
    );
  };

  const deleteSupplier = (id) => {
    setSuppliers((prev) => prev.filter((sup) => sup.id !== id));
  };

  const recordPayment = ({ supplierId, amount, paymentMethod, referenceNo, notes }) => {
    const payNum = Number(amount);
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    const newPayment = {
      id: `PAY-${1000 + payments.length + 1}`,
      supplierId,
      supplierName: supplier.name,
      date: new Date().toISOString().split("T")[0],
      amount: payNum,
      paymentMethod,
      referenceNo,
      notes,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Deduct from supplier amount payable
    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id === supplierId) {
          const newPayable = Math.max(0, (sup.amountPayable || 0) - payNum);
          return { ...sup, amountPayable: newPayable };
        }
        return sup;
      })
    );

    // Apply payment to unpaid purchases for this supplier
    let remainingToApply = payNum;
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.supplierId === supplierId && p.status !== "Paid" && remainingToApply > 0) {
          const unpaid = p.totalAmount - (p.paidAmount || 0);
          const apply = Math.min(unpaid, remainingToApply);
          remainingToApply -= apply;
          const newPaid = (p.paidAmount || 0) + apply;
          const newStatus = newPaid >= p.totalAmount ? "Paid" : "Partial";
          return { ...p, paidAmount: newPaid, status: newStatus };
        }
        return p;
      })
    );
  };

  const addPurchaseOrder = ({ supplierId, items, dueDate, billNo }) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    const totalAmount = items.reduce(
      (acc, item) => acc + Number(item.qty || 0) * Number(item.rate || 0),
      0
    );

    const newPO = {
      id: `PO-00${purchases.length + 45}`,
      supplierId,
      supplierName: supplier.name,
      date: new Date().toISOString().split("T")[0],
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      items,
      totalAmount,
      paidAmount: 0,
      status: "Unpaid",
      billNo: billNo || `INV-BLL-${Math.floor(100 + Math.random() * 900)}`,
    };

    setPurchases((prev) => [newPO, ...prev]);

    // Update supplier total purchases and amount payable
    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id === supplierId) {
          return {
            ...sup,
            totalPurchases: (sup.totalPurchases || 0) + totalAmount,
            amountPayable: (sup.amountPayable || 0) + totalAmount,
          };
        }
        return sup;
      })
    );
  };

  const value = useMemo(
    () => ({
      suppliers,
      purchases,
      payments,
      totalAmountPayable,
      totalPurchasesAmount,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      recordPayment,
      addPurchaseOrder,
    }),
    [suppliers, purchases, payments, totalAmountPayable, totalPurchasesAmount]
  );

  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>;
}

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error("useSuppliers must be used within a SupplierProvider");
  }
  return context;
};
