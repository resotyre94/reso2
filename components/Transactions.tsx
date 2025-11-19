
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Purchase, PurchaseItem, Sale, SaleItem, CustomerCategory, PriceClass } from '../types';
import { Save, Printer, Trash2, Plus, Search, Edit, X, Package } from 'lucide-react';

const SERVICE_TYPES = ["Air Checking", "Tire Puncture", "Tire Replacing", "Tire Rotation"];

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`border border-gray-200 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full font-bold ${props.className}`} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`border border-gray-200 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full font-bold ${props.className}`} />
);

const PrintHeader: React.FC<{ title: string }> = ({ title }) => {
    const { state } = useApp();
    return (
        <div className="mb-4 border-b pb-4 flex justify-between items-center print-only">
            <div className="flex items-center gap-4">
                {state.companyLogo && <img src={state.companyLogo} className="h-20 w-20 object-contain" />}
                <div>
                    <h1 className="text-3xl font-bold uppercase leading-none tracking-tight">{state.companyName}</h1>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line font-medium">{state.companyAddress}</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-bold border-2 border-black px-4 py-1 inline-block uppercase">{title}</h2>
                <p className="text-xs mt-2">Generated: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};

// --- Purchase Entry ---
export const PurchaseEntry: React.FC = () => {
  const { state, setState, navigateTo } = useApp();
  const [editId, setEditId] = useState<string | null>(state.editTransactionId); // Initialize with context if editing from Daybook
  const [searchQuery, setSearchQuery] = useState('');

  const [header, setHeader] = useState<Partial<Purchase>>({
    date: new Date().toISOString().split('T')[0],
    paymentStatus: 'Full',
    supplierId: '',
    docNo: '',
    notes: ''
  });
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<PurchaseItem>>({ quantity: 1, gstRate: 18 });

  // Load Edit Data on Mount if editId exists
  useEffect(() => {
      if (editId) {
          const found = state.purchases.find(p => p.id === editId);
          if (found) {
              setHeader({
                  date: found.date,
                  paymentStatus: found.paymentStatus,
                  supplierId: found.supplierId,
                  docNo: found.docNo,
                  notes: found.notes,
                  paidAmount: found.paidAmount
              });
              setItems(found.items);
          }
      }
  }, [editId, state.purchases]);

  // Find Previous Amount when Item Selected
  useEffect(() => {
      if (currentItem.itemId) {
          // Look for last purchase of this item
          const lastPurchase = [...state.purchases]
            .sort((a,b) => b.createdAt - a.createdAt)
            .flatMap(p => p.items)
            .find(i => i.itemId === currentItem.itemId);
            
          if (lastPurchase) {
              setCurrentItem(prev => ({ ...prev, amount: lastPurchase.amount }));
          }
      }
  }, [currentItem.itemId, state.purchases]);
  
  const nextTxnNo = `RS-PUR-2025-${(1001 + state.purchases.length).toString().padStart(4, '0')}`;
  const displayTxnNo = editId ? (state.purchases.find(p => p.id === editId)?.transactionNo) : nextTxnNo;

  const calculateTotals = () => {
      let gross = 0;
      let gst = 0;
      let net = 0;

      items.forEach(item => {
          const lineBase = item.amount * item.quantity;
          const lineGst = (lineBase * (item.gstRate || 0)) / 100;
          const lineTotal = lineBase + lineGst;

          gross += lineBase;
          gst += lineGst;
          net += lineTotal;
      });
      return { gross, gst, net };
  };
  const totals = calculateTotals();

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value === 'NEW') {
          navigateTo('suppliers', 'purchase');
      } else {
          setHeader({...header, supplierId: e.target.value});
      }
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value === 'NEW') {
          navigateTo('stock', 'purchase');
      } else {
          setCurrentItem({...currentItem, itemId: e.target.value});
      }
  };

  const addItem = () => {
    if (!currentItem.itemId || !currentItem.amount) return;
    const itemDef = state.items.find(i => i.id === currentItem.itemId);
    
    const baseTotal = currentItem.amount! * (currentItem.quantity || 1);
    const taxAmt = (baseTotal * (currentItem.gstRate || 0)) / 100;

    const newItem: PurchaseItem = {
      itemId: currentItem.itemId!,
      description: itemDef?.name || '',
      quantity: currentItem.quantity || 1,
      amount: currentItem.amount!,
      gstRate: currentItem.gstRate || 0,
      total: baseTotal + taxAmt
    };
    setItems([...items, newItem]);
    // Reset current item but keep GST preference
    setCurrentItem({ quantity: 1, gstRate: currentItem.gstRate, itemId: '', amount: 0 });
  };

  const savePurchase = () => {
    if (!header.supplierId || !header.docNo || items.length === 0) return alert("Fill mandatory fields");
    
    const paid = header.paidAmount || (header.paymentStatus === 'Full' ? totals.net : 0);
    const balance = totals.net - paid;

    const purchaseData: any = {
        supplierId: header.supplierId!,
        docNo: header.docNo!,
        date: header.date!,
        paymentStatus: header.paymentStatus,
        paidAmount: paid,
        balanceAmount: balance,
        notes: header.notes || '',
        items,
        totalAmount: totals.net,
    };

    if (editId) {
        setState(prev => ({
            ...prev,
            purchases: prev.purchases.map(p => p.id === editId ? { ...p, ...purchaseData } : p),
            editTransactionId: null
        }));
        alert("Record Updated Successfully");
        setEditId(null);
    } else {
        const newPurchase: Purchase = {
            ...purchaseData,
            id: crypto.randomUUID(),
            transactionNo: nextTxnNo,
            createdBy: state.currentUser?.username || 'Admin',
            createdAt: Date.now()
        };
        setState(prev => ({ ...prev, purchases: [...prev.purchases, newPurchase] }));
    }
    // Clear
    setItems([]);
    setHeader({
      date: new Date().toISOString().split('T')[0],
      paymentStatus: 'Full',
      supplierId: '',
      docNo: '',
      notes: '',
      paidAmount: 0
    });
  };

  const handlePrint = (e: React.MouseEvent) => {
      e.preventDefault();
      window.print();
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6 no-print gap-4">
        <h2 className="text-2xl font-bold text-primary uppercase tracking-tighter">Purchase Entry</h2>
        <div className="flex gap-2 items-center bg-white p-2 rounded-xl border shadow-sm">
            <input className="p-2 outline-none text-sm w-40" placeholder="Search Txn No..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <button className="bg-primary text-white p-2 rounded-lg"><Search size={16}/></button>
        </div>
        <button type="button" onClick={handlePrint} className="bg-secondary text-primary font-bold px-4 py-2 rounded-xl flex gap-2 shadow hover:bg-yellow-400 transition"><Printer size={18} /> Print / PDF</button>
      </div>

      {/* Print View */}
      <div className="print-only p-0 bg-white">
         <PrintHeader title="Purchase Invoice" />
         {/* ... (Keep existing print layout, just minimal updates) ... */}
         <div className="grid grid-cols-2 gap-4 mb-4 border-b pb-4 text-sm">
             <div>
                <p><strong>Invoice No:</strong> {displayTxnNo}</p>
                <p><strong>Date:</strong> {header.date}</p>
                <p><strong>Ref Doc No:</strong> {header.docNo}</p>
             </div>
             <div className="text-right">
                 <p><strong>Supplier:</strong> {state.suppliers.find(s => s.id === header.supplierId)?.name}</p>
             </div>
         </div>
         <table className="w-full mt-2 border-collapse text-xs">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Item</th>
                    <th className="border p-2 text-center">Qty</th>
                    <th className="border p-2 text-right">Rate</th>
                    <th className="border p-2 text-right">GST%</th>
                    <th className="border p-2 text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                {items.map((i, idx) => (
                    <tr key={idx}>
                        <td className="border p-2">{i.description}</td>
                        <td className="border p-2 text-center">{i.quantity}</td>
                        <td className="border p-2 text-right">{i.amount.toFixed(2)}</td>
                        <td className="border p-2 text-right">{i.gstRate}%</td>
                        <td className="border p-2 text-right font-bold">{i.total.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
         </table>
      </div>

      {/* Form Controls */}
      <div className="bg-surface p-6 rounded-2xl border border-accent/20 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 no-print shadow-sm">
        <div className="p-3 bg-primary text-white rounded-xl text-center font-mono font-bold flex items-center justify-center">{displayTxnNo}</div>
        <Select value={header.supplierId} onChange={handleSupplierChange}>
          <option value="">Select Supplier</option>
          <option value="NEW" className="font-bold text-blue-600">+ Create New Supplier</option>
          {state.suppliers.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Input placeholder="Doc No / Reference" value={header.docNo} onChange={e => setHeader({...header, docNo: e.target.value})} />
        <Input type="date" value={header.date} onChange={e => setHeader({...header, date: e.target.value})} />
      </div>

      <div className="bg-accent/20 p-6 rounded-2xl mb-6 no-print border border-accent/30">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <Select className="col-span-2" value={currentItem.itemId} onChange={handleItemChange}>
            <option value="">Select Item</option>
             <option value="NEW" className="font-bold text-blue-600">+ Create New Item</option>
            {state.items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </Select>
          <Input type="number" placeholder="Qty" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: parseFloat(e.target.value)})} />
          <Input type="number" placeholder="Amount" value={currentItem.amount || ''} onChange={e => setCurrentItem({...currentItem, amount: parseFloat(e.target.value)})} />
          
          <div className="relative">
             <label className="text-xs font-bold text-gray-500 ml-1">GST %</label>
             <Input type="number" placeholder="GST %" value={currentItem.gstRate} onChange={e => setCurrentItem({...currentItem, gstRate: parseFloat(e.target.value)})} />
          </div>

          <button onClick={addItem} className="bg-secondary text-primary p-3 rounded-xl shadow hover:bg-yellow-400 transition flex justify-center"><Plus size={20}/></button>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 mb-6 no-print">
        <table className="w-full text-sm font-bold">
            <thead className="bg-accent/30 text-primary">
                <tr><th className="p-4 text-left">Item</th><th className="p-4 text-center">Qty</th><th className="p-4 text-right">Rate</th><th className="p-4 text-right">GST</th><th className="p-4 text-right">Total</th><th className="p-4"></th></tr>
            </thead>
            <tbody>
            {items.map((it, idx) => (
                <tr key={idx} className="border-t border-gray-50 text-center hover:bg-gray-50">
                    <td className="p-4 text-left">{it.description}</td>
                    <td className="p-4">{it.quantity}</td>
                    <td className="p-4 text-right">{it.amount}</td>
                    <td className="p-4 text-right text-xs text-gray-500">{it.gstRate}%</td>
                    <td className="p-4 text-right">{it.total.toFixed(2)}</td>
                    <td className="p-4 text-red-500 cursor-pointer hover:text-red-700" onClick={() => setItems(items.filter((_, i) => i !== idx))}><Trash2 size={18} /></td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>

      {/* Payment Section */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 no-print grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div>
              <label className="block text-sm font-bold mb-1">Payment Status</label>
              <Select value={header.paymentStatus} onChange={e => setHeader({...header, paymentStatus: e.target.value as any})}>
                  <option value="Full">Full Payment</option>
                  <option value="Part">Part Payment</option>
                  <option value="Credit">Credit / Unpaid</option>
              </Select>
          </div>
          {(header.paymentStatus === 'Part') && (
              <div>
                  <label className="block text-sm font-bold mb-1">Amount Paid</label>
                  <Input type="number" value={header.paidAmount || ''} onChange={e => setHeader({...header, paidAmount: parseFloat(e.target.value)})} />
              </div>
          )}
           {(header.paymentStatus === 'Part') && (
              <div>
                  <label className="block text-sm font-bold mb-1">Outstanding</label>
                  <div className="p-3 bg-red-100 text-red-600 rounded-xl font-bold">
                      {(totals.net - (header.paidAmount || 0)).toFixed(2)}
                  </div>
              </div>
          )}
          <div className="col-span-2">
              <label className="block text-sm font-bold mb-1">Notes</label>
              <Input placeholder="Payment reference, checks, etc." value={header.notes} onChange={e => setHeader({...header, notes: e.target.value})} />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2 pt-4 border-t">
            <div className="text-right mr-4">
                <p className="text-sm text-gray-500">Net Total</p>
                <p className="text-3xl font-bold text-primary">{totals.net.toFixed(2)}</p>
            </div>
            <button onClick={savePurchase} className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2">
                {editId ? <><Edit size={18} /> Update Record</> : <><Save size={18}/> Save Purchase</>}
            </button>
          </div>
      </div>
    </div>
  );
};

// --- Sales Entry ---
export const SalesEntry: React.FC = () => {
    const { state, setState, navigateTo } = useApp();
    const [editId, setEditId] = useState<string | null>(state.editTransactionId);
    const [searchQuery, setSearchQuery] = useState('');

    const [header, setHeader] = useState<Partial<Sale>>({
      date: new Date().toISOString().split('T')[0],
      customerCategory: CustomerCategory.CASH,
      priceClass: PriceClass.A,
      vehicleNo: '',
      contactNo: '',
      paymentStatus: 'Received',
      receivedAmount: 0,
      notes: ''
    });
    const [items, setItems] = useState<SaleItem[]>([]);
    const [mode, setMode] = useState<'Service' | 'Stock'>('Stock');
    const [currentItem, setCurrentItem] = useState<Partial<SaleItem>>({ quantity: 1, gstRate: 18 });
  
    useEffect(() => {
      if (editId) {
          const found = state.sales.find(p => p.id === editId);
          if (found) {
              setHeader({
                  date: found.date,
                  customerCategory: found.customerCategory,
                  vehicleNo: found.vehicleNo,
                  contactNo: found.contactNo,
                  priceClass: found.priceClass,
                  paymentStatus: found.paymentStatus,
                  receivedAmount: found.receivedAmount,
                  notes: found.notes
              });
              setItems(found.items);
          }
      }
    }, [editId, state.sales]);

    const nextTxnNo = `RS-SAL-2025-${(1001 + state.sales.length).toString().padStart(4, '0')}`;
    const displayTxnNo = editId ? (state.sales.find(s => s.id === editId)?.transactionNo) : nextTxnNo;

    const calculateTotals = () => {
        let gross = 0;
        let gst = 0;
        let net = 0;

        items.forEach(item => {
            const lineBase = item.price * item.quantity;
            const lineGst = (lineBase * (item.gstRate || 0)) / 100;
            const lineTotal = lineBase + lineGst;

            gross += lineBase;
            gst += lineGst;
            net += lineTotal;
        });
        return { gross, gst, net };
    };
    const totals = calculateTotals();

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
         if(e.target.value === 'NEW') {
             navigateTo('customers', 'sales');
         } else {
             // Since customer category is enum in UI, this is just for tracking if we add customer selection
             // Current UI uses Category Enum, let's keep it simple as requested but check if they want specific customer
             // User asked for "Credit Customer Selection" in SOA, implying we might need specific customer selection here
             // For now sticking to requested format but ensuring flow works
         }
    };
  
    useEffect(() => {
        if (mode === 'Stock' && currentItem.itemId) {
            const item = state.items.find(i => i.id === currentItem.itemId);
            if (item) {
                let price = item.priceA;
                if (header.priceClass === 'B') price = item.priceB;
                if (header.priceClass === 'C') price = item.priceC;
                setCurrentItem(prev => ({ ...prev, price }));
            }
        }
    }, [currentItem.itemId, header.priceClass, mode, state.items]);

    const addItem = () => {
      if (!currentItem.price) return;
      
      const baseTotal = currentItem.price! * (currentItem.quantity || 1);
      const taxAmt = (baseTotal * (currentItem.gstRate || 0)) / 100;

      const newItem: SaleItem = {
        mode,
        itemId: currentItem.itemId,
        serviceName: currentItem.serviceName,
        description: mode === 'Stock' ? state.items.find(i => i.id === currentItem.itemId)?.name || '' : currentItem.serviceName!,
        quantity: currentItem.quantity || 1,
        price: currentItem.price!, 
        gstRate: currentItem.gstRate || 0,
        total: baseTotal + taxAmt
      };
      setItems([...items, newItem]);
      setCurrentItem({ quantity: 1, gstRate: currentItem.gstRate, itemId: '', serviceName: '', price: 0 });
    };
  
    const saveSale = () => {
      if (!header.vehicleNo || items.length === 0) return alert("Vehicle No and Items required");
      
      const received = header.receivedAmount || (header.paymentStatus === 'Received' ? totals.net : 0);
      const balance = totals.net - received;

      const saleData: any = {
          date: header.date!,
          customerCategory: header.customerCategory!,
          vehicleNo: header.vehicleNo!,
          contactNo: header.contactNo || '',
          priceClass: header.priceClass!,
          paymentStatus: header.paymentStatus,
          receivedAmount: received,
          balanceAmount: balance,
          notes: header.notes || '',
          items,
          totalAmount: totals.net
      };

      if(editId) {
        setState(prev => ({
            ...prev,
            sales: prev.sales.map(s => s.id === editId ? { ...s, ...saleData } : s),
            editTransactionId: null
        }));
        alert("Sales record updated!");
        setEditId(null);
      } else {
          const newSale: Sale = {
            ...saleData,
            id: crypto.randomUUID(),
            transactionNo: nextTxnNo,
            createdBy: state.currentUser?.username || 'Admin',
            createdAt: Date.now()
          };
          setState(prev => ({ ...prev, sales: [...prev.sales, newSale] }));
      }
      // Clear
      setItems([]);
      setHeader({
          date: new Date().toISOString().split('T')[0],
          customerCategory: CustomerCategory.CASH,
          priceClass: PriceClass.A,
          vehicleNo: '',
          contactNo: '',
          paymentStatus: 'Received',
          receivedAmount: 0,
          notes: ''
      });
    };

    const handlePrint = (e: React.MouseEvent) => {
        e.preventDefault();
        window.print();
    };
  
    return (
      <div className="p-6">
        <div className="flex flex-wrap justify-between items-center mb-6 no-print gap-4">
          <h2 className="text-2xl font-bold text-primary uppercase tracking-tighter">Sales Entry</h2>
          <div className="flex gap-2 items-center bg-white p-2 rounded-xl border shadow-sm">
              <input className="p-2 outline-none text-sm w-40" placeholder="Search Txn No..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button className="bg-primary text-white p-2 rounded-lg"><Search size={16}/></button>
          </div>
          <button type="button" onClick={handlePrint} className="bg-secondary text-primary font-bold px-4 py-2 rounded-xl flex gap-2 shadow hover:bg-yellow-400 transition"><Printer size={18} /> Print Invoice</button>
        </div>

        {/* Print Layout */}
        <div className="print-only p-0 bg-white">
            <PrintHeader title="Sales Invoice" />
            {/* ... (Existing print layout) ... */}
            <div className="grid grid-cols-2 gap-4 mb-4 border-b pb-4 text-sm">
                <div>
                    <p><strong>Invoice No:</strong> {displayTxnNo}</p>
                    <p><strong>Date:</strong> {header.date}</p>
                    <p><strong>Type:</strong> {header.customerCategory}</p>
                </div>
                <div className="text-right">
                    <p><strong>Vehicle:</strong> {header.vehicleNo}</p>
                    <p><strong>Contact:</strong> {header.contactNo}</p>
                </div>
            </div>
            <table className="w-full mt-2 border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Description</th>
                        <th className="border p-2 text-center">Qty</th>
                        <th className="border p-2 text-right">Rate</th>
                        <th className="border p-2 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((i, idx) => (
                        <tr key={idx}>
                            <td className="border p-2">{i.description}</td>
                            <td className="border p-2 text-center">{i.quantity}</td>
                            <td className="border p-2 text-right">{i.price.toFixed(2)}</td>
                            <td className="border p-2 text-right font-bold">{i.total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
  
        {/* Form */}
        <div className="bg-surface p-6 rounded-2xl border border-accent/20 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
          <div className="p-3 bg-primary text-white rounded-xl text-center font-mono font-bold flex items-center justify-center">{displayTxnNo}</div>
          <Input type="date" value={header.date} onChange={e => setHeader({...header, date: e.target.value})} />
          <Select value={header.customerCategory} onChange={e => setHeader({...header, customerCategory: e.target.value as CustomerCategory})}>
             {Object.values(CustomerCategory).map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input placeholder="Vehicle No" value={header.vehicleNo} onChange={e => setHeader({...header, vehicleNo: e.target.value})} />
          <Input placeholder="Contact No" value={header.contactNo} onChange={e => setHeader({...header, contactNo: e.target.value})} />
          
          <div className="flex gap-4 items-center col-span-1 md:col-span-3 bg-white p-3 rounded-xl border border-gray-200">
             <span className="font-bold text-primary">Price Class:</span>
             {Object.values(PriceClass).map(pc => (
                 <label key={pc} className="flex items-center gap-1 cursor-pointer">
                     <input type="radio" name="pc" className="accent-primary" checked={header.priceClass === pc} onChange={() => setHeader({...header, priceClass: pc})} /> {pc}
                 </label>
             ))}
          </div>
        </div>
  
        <div className="bg-accent/20 p-6 rounded-2xl mb-6 no-print border border-accent/30">
          <div className="flex gap-2 mb-4 bg-white p-1 rounded-xl inline-flex border border-gray-200">
             <button className={`px-6 py-2 rounded-lg font-medium transition-all ${mode==='Stock' ? 'bg-primary text-white shadow':'text-gray-500 hover:bg-gray-50'}`} onClick={()=>setMode('Stock')}>Stock Item</button>
             <button className={`px-6 py-2 rounded-lg font-medium transition-all ${mode==='Service' ? 'bg-primary text-white shadow':'text-gray-500 hover:bg-gray-50'}`} onClick={()=>setMode('Service')}>Service</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            {mode === 'Stock' ? (
                <div className="col-span-2">
                    <Select value={currentItem.itemId} onChange={(e) => {
                        if(e.target.value === 'NEW') navigateTo('stock', 'sales');
                        else setCurrentItem({...currentItem, itemId: e.target.value});
                    }}>
                        <option value="">Select Stock Item</option>
                        <option value="NEW" className="font-bold text-blue-600">+ Create New Item</option>
                        {state.items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </Select>
                </div>
            ) : (
                <Select className="col-span-2" value={currentItem.serviceName} onChange={e => setCurrentItem({...currentItem, serviceName: e.target.value})}>
                    <option value="">Select Service</option>
                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
            )}
            
            <Input type="number" placeholder="Qty" value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: parseFloat(e.target.value)})} />
            <Input type="number" placeholder="Price" value={currentItem.price || ''} onChange={e => setCurrentItem({...currentItem, price: parseFloat(e.target.value)})} />
            
             <div className="relative">
                <label className="text-xs font-bold text-gray-500 ml-1">GST %</label>
                <Input type="number" placeholder="GST %" value={currentItem.gstRate} onChange={e => setCurrentItem({...currentItem, gstRate: parseFloat(e.target.value)})} />
             </div>

            <button onClick={addItem} className="bg-secondary text-primary p-3 rounded-xl shadow hover:bg-yellow-400 transition flex justify-center"><Plus size={20}/></button>
          </div>
        </div>
  
        {/* Items Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 mb-6 no-print">
            <table className="w-full text-sm font-bold">
            <thead className="bg-accent/30 text-primary">
                <tr><th className="p-4 text-left">Type</th><th className="p-4 text-left">Item</th><th className="p-4 text-center">Qty</th><th className="p-4 text-right">Rate</th><th className="p-4 text-right">GST</th><th className="p-4 text-right">Total</th><th className="p-4"></th></tr>
            </thead>
            <tbody>
                {items.map((it, idx) => (
                    <tr key={idx} className="border-t border-gray-50 text-center hover:bg-gray-50">
                        <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold">{it.mode}</span></td>
                        <td className="p-4 text-left">{it.description}</td>
                        <td className="p-4">{it.quantity}</td>
                        <td className="p-4 text-right">{it.price}</td>
                        <td className="p-4 text-right text-xs text-gray-500">{it.gstRate}%</td>
                        <td className="p-4 text-right font-bold">{it.total.toFixed(2)}</td>
                        <td className="p-4 text-red-500 cursor-pointer hover:text-red-700" onClick={() => setItems(items.filter((_, i) => i !== idx))}><Trash2 size={18} /></td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        {/* Payment Section */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 no-print grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div>
                <label className="block text-sm font-bold mb-1">Payment</label>
                <Select value={header.paymentStatus} onChange={e => setHeader({...header, paymentStatus: e.target.value as any})}>
                    <option value="Received">Received</option>
                    <option value="Part">Part Received</option>
                    <option value="Credit">Credit / Pending</option>
                </Select>
            </div>
            {(header.paymentStatus === 'Part') && (
                <div>
                    <label className="block text-sm font-bold mb-1">Amt Received</label>
                    <Input type="number" value={header.receivedAmount || ''} onChange={e => setHeader({...header, receivedAmount: parseFloat(e.target.value)})} />
                </div>
            )}
            {(header.paymentStatus === 'Part') && (
                <div>
                    <label className="block text-sm font-bold mb-1">Balance</label>
                     <div className="p-3 bg-red-100 text-red-600 rounded-xl font-bold">
                      {(totals.net - (header.receivedAmount || 0)).toFixed(2)}
                  </div>
                </div>
            )}
            <div className="col-span-2">
                <label className="block text-sm font-bold mb-1">Notes</label>
                <Input placeholder="Payment notes" value={header.notes} onChange={e => setHeader({...header, notes: e.target.value})} />
            </div>

            <div className="md:col-span-4 flex justify-end mt-2 border-t pt-4">
              <div className="text-right mr-4">
                  <p className="text-sm text-gray-500">Net Total</p>
                  <p className="text-3xl font-bold text-primary">{totals.net.toFixed(2)}</p>
              </div>
              <button onClick={saveSale} className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center gap-2">
                {editId ? <><Edit size={18} /> Update Invoice</> : <><Save size={18}/> Save Sale</>}
              </button>
            </div>
        </div>
      </div>
    );
};
