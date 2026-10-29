import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  FileText, Plus, Trash2, Printer, CheckCircle, Clock, 
  Building2, User, Landmark, Sparkles, LayoutDashboard, 
  ArrowLeft, Search, Download, AlertTriangle 
} from 'lucide-react';

const EMPTY_INVOICE = {
  invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
  currency: '₹',
  taxRate: 18, // 18% GST default
  discountRate: 0,
  
  senderName: '',
  senderEmail: '',
  senderTaxId: '',
  senderAddress: '',
  
  clientName: '',
  clientEmail: '',
  clientTaxId: '',
  clientAddress: '',
  
  bankName: '',
  accountNumber: '',
  ifscCode: '',

  items: [
    { id: '1', description: 'Full-Stack Web Application Development', quantity: 1, rate: 35000 },
    { id: '2', description: 'Cloud Infrastructure Setup & Optimization', quantity: 2, rate: 7500 }
  ],
  notes: 'Payment is due within 15 days of issue. Thank you for your business!',
  status: 'Pending' // 'Paid' | 'Pending' | 'Overdue'
};

const SAMPLE_DEMO = {
  ...EMPTY_INVOICE,
  invoiceNumber: 'INV-2025-089',
  senderName: 'Apex Digital Solutions Pvt Ltd',
  senderEmail: 'billing@apexdigital.io',
  senderTaxId: 'GSTIN: 27AAAAA0000A1Z5',
  senderAddress: 'Tech Park, Whitefield, Bengaluru - 560066',
  
  clientName: 'Nexus Global Logistics',
  clientEmail: 'finance@nexusglobal.com',
  clientTaxId: 'GSTIN: 07BBBBB1111B2Z3',
  clientAddress: 'Connaught Place, New Delhi - 110001',
  
  bankName: 'HDFC Bank',
  accountNumber: '50200012345678',
  ifscCode: 'HDFC0001234',
  taxRate: 18,
  discountRate: 5
};

export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'editor'
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('billpulse_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeInvoice, setActiveInvoice] = useState(EMPTY_INVOICE);
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('billpulse_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Financial Computations
  const subtotal = useMemo(() => {
    return activeInvoice.items.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.rate || 0)), 0);
  }, [activeInvoice.items]);

  const discountAmount = (subtotal * (Number(activeInvoice.discountRate) || 0)) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * (Number(activeInvoice.taxRate) || 0)) / 100;
  const grandTotal = taxableAmount + taxAmount;

  // Item Table Handlers
  const handleItemChange = (id, field, value) => {
    setActiveInvoice({
      ...activeInvoice,
      items: activeInvoice.items.map(it => it.id === id ? { ...it, [field]: value } : it)
    });
  };

  const addItem = () => {
    setActiveInvoice({
      ...activeInvoice,
      items: [...activeInvoice.items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]
    });
  };

  const removeItem = (id) => {
    if (activeInvoice.items.length === 1) return;
    setActiveInvoice({
      ...activeInvoice,
      items: activeInvoice.items.filter(it => it.id !== id)
    });
  };

  // Save / Upsert to Ledger
  const saveInvoiceToLedger = () => {
    if (!activeInvoice.clientName.trim() || !activeInvoice.senderName.trim()) {
      alert('Please fill in both Your Business Name and Client Name.');
      return;
    }

    const payload = { ...activeInvoice, total: grandTotal, id: activeInvoice.id || Date.now().toString() };
    const existingIndex = invoices.findIndex(i => i.id === payload.id);

    if (existingIndex >= 0) {
      const updated = [...invoices];
      updated[existingIndex] = payload;
      setInvoices(updated);
    } else {
      setInvoices([payload, ...invoices]);
    }

    alert('Invoice saved successfully to Ledger!');
    setView('dashboard');
  };

  const toggleInvoiceStatus = (id) => {
    setInvoices(invoices.map(inv => {
      if (inv.id === id) {
        const nextStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
        if (nextStatus === 'Paid') {
          confetti({ particleCount: 35, spread: 70, origin: { y: 0.8 } });
        }
        return { ...inv, status: nextStatus };
      }
      return inv;
    }));
  };

  const deleteInvoice = (id) => {
    if (window.confirm('Delete this invoice permanently?')) {
      setInvoices(invoices.filter(i => i.id !== id));
    }
  };

  // Metrics for Dashboard
  const metrics = useMemo(() => {
    const totalRevenue = invoices.reduce((acc, i) => acc + (i.total || 0), 0);
    const paidRevenue = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + (i.total || 0), 0);
    const pendingRevenue = invoices.filter(i => i.status !== 'Paid').reduce((acc, i) => acc + (i.total || 0), 0);
    return { totalRevenue, paidRevenue, pendingRevenue, count: invoices.length };
  }, [invoices]);

  return (
    <div className="min-h-screen">
      {/* Navigation (Hidden during print) */}
      <nav className="no-print border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-4 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">BillPulse</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 ml-2 px-2 py-0.5 rounded-full border border-indigo-500/30">Enterprise</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                view === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Ledger & Analytics
            </button>
            <button
              onClick={() => {
                setActiveInvoice({ ...EMPTY_INVOICE, invoiceNumber: `INV-${Date.now().toString().slice(-5)}` });
                setView('editor');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                view === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" /> Create Invoice
            </button>
          </div>
        </div>
      </nav>

      {/* VIEW 1: DASHBOARD / LEDGER */}
      {view === 'dashboard' && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Header KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Billed</span>
              <div className="text-2xl font-bold text-white mt-1">₹{metrics.totalRevenue.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">{metrics.count} total invoices</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Collected (Paid)</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">₹{metrics.paidRevenue.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-emerald-500/80 mt-1 block">Cleared in Bank</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Outstanding (Unpaid)</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">₹{metrics.pendingRevenue.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-amber-500/80 mt-1 block">Awaiting Remittance</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Fast Action</span>
              <button
                onClick={() => {
                  setActiveInvoice(SAMPLE_DEMO);
                  setView('editor');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-semibold transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Load Sample Invoice
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-white">Invoice Records & Settlement</h2>
                <p className="text-xs text-slate-400">All client receivables and payment histories</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search invoice or client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
                <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm text-slate-400 font-medium">No invoices created yet.</p>
                <p className="text-xs text-slate-400 mb-4">Generate your first invoice or load demo data to present.</p>
                <button
                  onClick={() => {
                    setActiveInvoice(SAMPLE_DEMO);
                    setView('editor');
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Load Professional Demo
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="pb-3">INVOICE #</th>
                      <th className="pb-3">CLIENT</th>
                      <th className="pb-3">DUE DATE</th>
                      <th className="pb-3">TOTAL</th>
                      <th className="pb-3">STATUS</th>
                      <th className="pb-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {invoices
                      .filter(i => i.clientName.toLowerCase().includes(search.toLowerCase()) || i.invoiceNumber.toLowerCase().includes(search.toLowerCase()))
                      .map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-950/40 transition">
                          <td className="py-3.5 font-mono font-bold text-indigo-400">{inv.invoiceNumber}</td>
                          <td className="py-3.5 font-medium text-white">{inv.clientName}</td>
                          <td className="py-3.5 text-slate-400">{inv.dueDate}</td>
                          <td className="py-3.5 font-mono font-bold text-white">₹{inv.total?.toLocaleString('en-IN')}</td>
                          <td className="py-3.5">
                            <button
                              onClick={() => toggleInvoiceStatus(inv.id)}
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                                inv.status === 'Paid' 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {inv.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {inv.status}
                            </button>
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={() => {
                                setActiveInvoice(inv);
                                setView('editor');
                              }}
                              className="text-slate-400 hover:text-white font-medium"
                            >
                              View / Edit
                            </button>
                            <button
                              onClick={() => deleteInvoice(inv.id)}
                              className="text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      )}

      {/* VIEW 2: INVOICE BUILDER & PRINT-READY CANVAS */}
      {view === 'editor' && (
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Action Bar */}
          <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Ledger
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveInvoice(SAMPLE_DEMO)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Fill Demo Details
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-white transition shadow-sm"
              >
                <Printer className="w-4 h-4 text-emerald-400" /> Print / Save as PDF
              </button>
              <button
                onClick={saveInvoiceToLedger}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20"
              >
                <CheckCircle className="w-4 h-4" /> Save to Ledger
              </button>
            </div>
          </div>

          {/* The Printable A4 Invoice Canvas */}
          <div className="print-area bg-white text-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-200">
            {/* Header: Company & Invoice Meta */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-600">Tax Invoice</span>
                <input
                  type="text"
                  placeholder="Your Business / Agency Name"
                  value={activeInvoice.senderName}
                  onChange={(e) => setActiveInvoice({ ...activeInvoice, senderName: e.target.value })}
                  className="text-2xl font-black text-slate-900 block w-full mt-1 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="GSTIN / Business Registration ID"
                  value={activeInvoice.senderTaxId}
                  onChange={(e) => setActiveInvoice({ ...activeInvoice, senderTaxId: e.target.value })}
                  className="text-xs font-mono text-slate-500 block w-full mt-1 border-b border-transparent hover:border-slate-300 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Business Address & Email"
                  value={activeInvoice.senderAddress}
                  onChange={(e) => setActiveInvoice({ ...activeInvoice, senderAddress: e.target.value })}
                  className="text-xs text-slate-500 block w-full mt-1 border-b border-transparent hover:border-slate-300 focus:outline-none"
                />
              </div>

              <div className="text-left md:text-right w-full md:w-auto">
                <div className="font-mono text-2xl font-black text-indigo-600">{activeInvoice.invoiceNumber}</div>
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <div>Issue Date: <input type="date" value={activeInvoice.issueDate} onChange={(e) => setActiveInvoice({...activeInvoice, issueDate: e.target.value})} className="font-semibold text-slate-800 bg-transparent" /></div>
                  <div>Payment Due: <input type="date" value={activeInvoice.dueDate} onChange={(e) => setActiveInvoice({...activeInvoice, dueDate: e.target.value})} className="font-semibold text-slate-800 bg-transparent" /></div>
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="my-8">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bill To</span>
              <input
                type="text"
                placeholder="Client Name / Company"
                value={activeInvoice.clientName}
                onChange={(e) => setActiveInvoice({ ...activeInvoice, clientName: e.target.value })}
                className="text-base font-bold text-slate-900 block w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none mt-1"
              />
              <input
                type="text"
                placeholder="Client GSTIN / Tax ID"
                value={activeInvoice.clientTaxId}
                onChange={(e) => setActiveInvoice({ ...activeInvoice, clientTaxId: e.target.value })}
                className="text-xs font-mono text-slate-500 block w-full mt-0.5 border-b border-transparent hover:border-slate-300 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Client Billing Address"
                value={activeInvoice.clientAddress}
                onChange={(e) => setActiveInvoice({ ...activeInvoice, clientAddress: e.target.value })}
                className="text-xs text-slate-500 block w-full mt-0.5 border-b border-transparent hover:border-slate-300 focus:outline-none"
              />
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto my-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 w-1/2">Item & Description</th>
                    <th className="py-2.5 text-center w-20">Qty</th>
                    <th className="py-2.5 text-right w-28">Rate (₹)</th>
                    <th className="py-2.5 text-right w-28">Amount (₹)</th>
                    <th className="py-2.5 text-center w-10 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5">
                        <input
                          type="text"
                          placeholder="Service or product description..."
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-600 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          className="w-16 text-center font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 text-right">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                          className="w-24 text-right font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        ₹{(Number(item.quantity || 0) * Number(item.rate || 0)).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 text-center no-print">
                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={addItem}
                className="no-print mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Line Item
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-6 border-t border-slate-200">
              {/* Payment Details & Notes */}
              <div className="w-full md:w-1/2 space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Landmark className="w-3 h-3" /> Remittance Bank Credentials
                  </span>
                  <div className="mt-2 text-xs space-y-1">
                    <input
                      type="text"
                      placeholder="Bank Name (e.g. HDFC, SBI)"
                      value={activeInvoice.bankName}
                      onChange={(e) => setActiveInvoice({ ...activeInvoice, bankName: e.target.value })}
                      className="w-full bg-transparent font-medium text-slate-800 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={activeInvoice.accountNumber}
                      onChange={(e) => setActiveInvoice({ ...activeInvoice, accountNumber: e.target.value })}
                      className="w-full bg-transparent font-mono text-slate-800 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="IFSC / Routing Code"
                      value={activeInvoice.ifscCode}
                      onChange={(e) => setActiveInvoice({ ...activeInvoice, ifscCode: e.target.value })}
                      className="w-full bg-transparent font-mono text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <textarea
                  rows="2"
                  value={activeInvoice.notes}
                  onChange={(e) => setActiveInvoice({ ...activeInvoice, notes: e.target.value })}
                  className="w-full text-xs text-slate-500 bg-transparent border border-transparent hover:border-slate-200 focus:outline-none rounded-lg p-1"
                  placeholder="Terms and conditions..."
                ></textarea>
              </div>

              {/* Totals Table */}
              <div className="w-full md:w-5/12 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Discount (%):</span>
                  <input
                    type="number"
                    value={activeInvoice.discountRate}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, discountRate: e.target.value })}
                    className="w-14 text-right border rounded px-1.5 py-0.5 text-xs bg-white focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>GST / Tax (%):</span>
                  <input
                    type="number"
                    value={activeInvoice.taxRate}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, taxRate: e.target.value })}
                    className="w-14 text-right border rounded px-1.5 py-0.5 text-xs bg-white focus:outline-none"
                  />
                </div>
                <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900 uppercase">Grand Total:</span>
                  <span className="text-xl font-mono font-black text-indigo-600">₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
