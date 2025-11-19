
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Supplier, Customer, Item, CustomerCategory, PriceClass } from '../types';
import { Save, Printer, Edit, Plus, Ban } from 'lucide-react';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`border border-gray-200 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full transition-all ${props.className}`} />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button {...props} className={`bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-black shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${props.className}`} />
);

// --- Supplier Component ---
export const SupplierManager: React.FC = () => {
  const { state, setState, navigateTo } = useApp();
  const [form, setForm] = useState<Partial<Supplier>>({ active: true });
  const [editMode, setEditMode] = useState(false);

  const save = () => {
    if (!form.code || !form.name) return alert("Code and Name required");
    
    if (editMode) {
         setState(prev => ({
            ...prev,
            suppliers: prev.suppliers.map(s => s.id === form.id ? { ...s, ...form } as Supplier : s)
         }));
         setEditMode(false);
    } else {
        const newSupplier: Supplier = {
            id: crypto.randomUUID(),
            code: form.code!,
            name: form.name!,
            address: form.address || '',
            email: form.email || '',
            phone: form.phone || '',
            active: form.active ?? true,
            blockReason: form.active ? '' : (form.blockReason || '')
        };
        setState(prev => ({ ...prev, suppliers: [...prev.suppliers, newSupplier] }));
    }
    
    setForm({ active: true });
    
    // Redirect Logic
    if (state.redirectAfterSave) {
        navigateTo(state.redirectAfterSave);
    }
  };

  const handleEdit = (s: Supplier) => {
      setForm(s);
      setEditMode(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary uppercase">Suppliers</h2>
        {state.redirectAfterSave && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Adding New for Transaction...</span>}
      </div>

      <div className="bg-surface p-6 rounded-2xl border border-accent/20 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input placeholder="Supplier Code" value={form.code || ''} onChange={e => setForm({...form, code: e.target.value})} />
        <Input placeholder="Supplier Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
        <Input placeholder="Address" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
        <Input placeholder="Email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
        <Input placeholder="Phone" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
        
        <div className="flex flex-col gap-2">
            <select className="border border-gray-200 bg-gray-50 rounded-xl p-3 w-full" value={form.active ? 'Active' : 'Block'} onChange={e => setForm({...form, active: e.target.value === 'Active'})}>
                <option value="Active">Active</option>
                <option value="Block">Block</option>
            </select>
            {!form.active && (
                <Input placeholder="Reason for blocking..." value={form.blockReason || ''} onChange={e => setForm({...form, blockReason: e.target.value})} className="bg-red-50 border-red-200"/>
            )}
        </div>

        <div className="md:col-span-3 flex justify-end mt-2 gap-2">
            {editMode && <Button onClick={() => { setEditMode(false); setForm({active: true}); }} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>}
            <Button onClick={save}><Save size={18} /> {editMode ? 'Update' : 'Save'} Supplier</Button>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
            <thead className="bg-accent/30">
                <tr>
                    <th className="p-4 text-left font-bold text-primary">Code</th>
                    <th className="p-4 text-left font-bold text-primary">Name</th>
                    <th className="p-4 text-left font-bold text-primary">Phone</th>
                    <th className="p-4 text-left font-bold text-primary">Status</th>
                    <th className="p-4 text-center">Action</th>
                </tr>
            </thead>
            <tbody>
                {state.suppliers.map(s => (
                    <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="p-4 font-mono">{s.code}</td>
                        <td className="p-4 font-medium">{s.name}</td>
                        <td className="p-4 text-gray-600">{s.phone}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {s.active ? 'Active' : 'Blocked'}
                            </span>
                            {!s.active && s.blockReason && <div className="text-xs text-red-500 mt-1 italic">"{s.blockReason}"</div>}
                        </td>
                        <td className="p-4 text-center">
                            <button onClick={() => handleEdit(s)} className="text-primary hover:bg-gray-200 p-2 rounded-full transition"><Edit size={16}/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Customer Component ---
export const CustomerManager: React.FC = () => {
    const { state, setState, navigateTo } = useApp();
    const [form, setForm] = useState<Partial<Customer>>({ active: true, category: CustomerCategory.INDIVIDUAL });
    const [editMode, setEditMode] = useState(false);
  
    const save = () => {
      if (!form.code || !form.name) return alert("Code and Name required");
      
      if (editMode) {
        setState(prev => ({
            ...prev,
            customers: prev.customers.map(c => c.id === form.id ? { ...c, ...form } as Customer : c)
        }));
        setEditMode(false);
      } else {
        const newCust: Customer = {
            id: crypto.randomUUID(),
            code: form.code!,
            name: form.name!,
            address: form.address || '',
            email: form.email || '',
            phone: form.phone || '',
            active: form.active ?? true,
            category: form.category as CustomerCategory,
            creditLimitDays: form.creditLimitDays || 0,
            blockReason: form.active ? '' : (form.blockReason || '')
        };
        setState(prev => ({ ...prev, customers: [...prev.customers, newCust] }));
      }
      setForm({ active: true, category: CustomerCategory.INDIVIDUAL });

      // Redirect Logic
      if (state.redirectAfterSave) {
        navigateTo(state.redirectAfterSave);
      }
    };

    const handleEdit = (c: Customer) => {
        setForm(c);
        setEditMode(true);
    };
  
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary uppercase">Customers</h2>
            {state.redirectAfterSave && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Adding New for Transaction...</span>}
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-accent/20 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="Customer Code" value={form.code || ''} onChange={e => setForm({...form, code: e.target.value})} />
          <Input placeholder="Customer Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
          <select className="border border-gray-200 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-primary w-full" value={form.category} onChange={e => setForm({...form, category: e.target.value as CustomerCategory})}>
              {Object.values(CustomerCategory).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Input placeholder="Address" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
          <Input placeholder="Phone" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
          <Input type="number" placeholder="Credit Limit (Days)" value={form.creditLimitDays || ''} onChange={e => setForm({...form, creditLimitDays: parseInt(e.target.value)})} />
          
          <div className="flex flex-col gap-2">
            <select className="border border-gray-200 bg-gray-50 rounded-xl p-3 w-full" value={form.active ? 'Active' : 'Block'} onChange={e => setForm({...form, active: e.target.value === 'Active'})}>
                <option value="Active">Active</option>
                <option value="Block">Block</option>
            </select>
            {!form.active && (
                <Input placeholder="Reason for blocking..." value={form.blockReason || ''} onChange={e => setForm({...form, blockReason: e.target.value})} className="bg-red-50 border-red-200"/>
            )}
          </div>

          <div className="md:col-span-3 flex justify-end mt-2 gap-2">
             {editMode && <Button onClick={() => { setEditMode(false); setForm({active: true, category: CustomerCategory.INDIVIDUAL}); }} className="bg-gray-400 hover:bg-gray-500">Cancel</Button>}
            <Button onClick={save}><Save size={18} /> {editMode ? 'Update' : 'Save'} Customer</Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
              <thead className="bg-accent/30">
                  <tr>
                      <th className="p-4 text-left font-bold text-primary">Code</th>
                      <th className="p-4 text-left font-bold text-primary">Name</th>
                      <th className="p-4 text-left font-bold text-primary">Category</th>
                      <th className="p-4 text-left font-bold text-primary">Limit (Days)</th>
                      <th className="p-4 text-left font-bold text-primary">Status</th>
                      <th className="p-4 text-center">Action</th>
                  </tr>
              </thead>
              <tbody>
                  {state.customers.map(s => (
                      <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="p-4 font-mono">{s.code}</td>
                          <td className="p-4 font-medium">{s.name}</td>
                          <td className="p-4"><span className="bg-secondary/20 px-2 py-1 rounded text-xs font-bold">{s.category}</span></td>
                          <td className="p-4 font-mono">{s.creditLimitDays}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {s.active ? 'Active' : 'Blocked'}
                            </span>
                            {!s.active && s.blockReason && <div className="text-xs text-red-500 mt-1 italic">"{s.blockReason}"</div>}
                          </td>
                          <td className="p-4 text-center">
                            <button onClick={() => handleEdit(s)} className="text-primary hover:bg-gray-200 p-2 rounded-full transition"><Edit size={16}/></button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
        </div>
      </div>
    );
};

// --- Stock Component ---
export const StockManager: React.FC = () => {
    const { state, setState, navigateTo } = useApp();
    const [form, setForm] = useState<Partial<Item>>({ alertEnabled: false });
  
    const save = () => {
      if (!form.code || !form.name) return alert("Code and Name required");
      const newItem: Item = {
          id: crypto.randomUUID(),
          code: form.code!,
          name: form.name!,
          barcode: form.barcode || '',
          shortName: form.shortName || '',
          supplierId: form.supplierId || '',
          priceA: form.priceA || 0,
          priceB: form.priceB || 0,
          priceC: form.priceC || 0,
          minStock: form.minStock || 0,
          alertEnabled: form.alertEnabled ?? false
      };
      setState(prev => ({ ...prev, items: [...prev.items, newItem] }));
      setForm({ alertEnabled: false });

      if (state.redirectAfterSave) {
        navigateTo(state.redirectAfterSave);
      }
    };

    const updateMinStock = (id: string, val: number) => {
        setState(prev => ({
            ...prev,
            items: prev.items.map(i => i.id === id ? { ...i, minStock: val, alertEnabled: true } : i)
        }));
    };

    const handlePrint = (e: React.MouseEvent) => {
        e.preventDefault();
        window.print();
    };
  
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6 no-print">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-primary uppercase">Stock & Inventory</h2>
                {state.redirectAfterSave && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Adding New Item...</span>}
            </div>
            <button type="button" onClick={handlePrint} className="bg-secondary text-primary font-bold px-4 py-2 rounded-xl flex gap-2 shadow hover:bg-yellow-400 transition"><Printer size={18} /> Print Report</button>
        </div>

        <div className="bg-surface p-6 rounded-2xl border border-accent/20 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
          <Input placeholder="Item Code" value={form.code || ''} onChange={e => setForm({...form, code: e.target.value})} />
          <Input placeholder="Item Name" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
          <Input placeholder="Barcode" value={form.barcode || ''} onChange={e => setForm({...form, barcode: e.target.value})} />
          <Input placeholder="Short Name" value={form.shortName || ''} onChange={e => setForm({...form, shortName: e.target.value})} />
          
          <select className="border border-gray-200 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-primary w-full" value={form.supplierId} onChange={e => setForm({...form, supplierId: e.target.value})}>
              <option value="">Select Supplier</option>
              {state.suppliers.filter(s=>s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          
          <Input type="number" placeholder="Price A" value={form.priceA || ''} onChange={e => setForm({...form, priceA: parseFloat(e.target.value)})} />
          <Input type="number" placeholder="Price B" value={form.priceB || ''} onChange={e => setForm({...form, priceB: parseFloat(e.target.value)})} />
          <Input type="number" placeholder="Price C" value={form.priceC || ''} onChange={e => setForm({...form, priceC: parseFloat(e.target.value)})} />
          
          <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-gray-200">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary" checked={form.alertEnabled} onChange={e => setForm({...form, alertEnabled: e.target.checked})} /> 
                <span className="font-bold">Min Stock Alert</span>
            </label>
            {form.alertEnabled && (
                <input type="number" placeholder="Qty" className="border-b border-gray-300 p-1 text-sm focus:outline-none focus:border-primary" value={form.minStock || ''} onChange={e => setForm({...form, minStock: parseInt(e.target.value)})} />
            )}
          </div>
  
          <div className="md:col-span-4 flex justify-end mt-2">
            <Button onClick={save}><Save size={18} /> Add Item to Stock</Button>
          </div>
        </div>
        
        {/* Detailed Stock Table */}
        <div className="print-only mb-4">
            <h1 className="text-2xl font-bold uppercase">{state.companyName} - Stock Valuation</h1>
            <p>{new Date().toLocaleDateString()}</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-xs md:text-sm">
              <thead className="bg-accent/30">
                  <tr>
                      <th className="p-3 text-left font-bold text-primary">Code/Item</th>
                      <th className="p-3 text-center font-bold text-primary border-l border-white">Purchased</th>
                      <th className="p-3 text-center font-bold text-primary border-l border-white">Sold</th>
                      <th className="p-3 text-center font-bold text-primary border-l border-white bg-primary text-white">In Stock</th>
                      <th className="p-3 text-center font-bold text-primary border-l border-white">Min Stock</th>
                      <th className="p-3 text-center font-bold text-primary border-l border-white">Margins</th>
                  </tr>
              </thead>
              <tbody>
                  {state.items.map(s => {
                      // Calculations
                      const pItems = state.purchases.flatMap(p => p.items).filter(i => i.itemId === s.id);
                      const sItems = state.sales.flatMap(sl => sl.items).filter(i => i.itemId === s.id && i.mode === 'Stock');

                      const totalPurQty = pItems.reduce((a,b) => a + b.quantity, 0);
                      const totalPurVal = pItems.reduce((a,b) => a + (b.amount * b.quantity), 0); // Base Amount
                      const avgPurCost = totalPurQty > 0 ? (totalPurVal / totalPurQty) : 0;

                      const totalSoldQty = sItems.reduce((a,b) => a + b.quantity, 0);
                      const totalSoldVal = sItems.reduce((a,b) => a + (b.price * b.quantity), 0); // Base Amount
                      const avgSoldPrice = totalSoldQty > 0 ? (totalSoldVal / totalSoldQty) : 0;

                      const currentStock = totalPurQty - totalSoldQty;
                      const profitMargin = avgSoldPrice > 0 ? ((avgSoldPrice - avgPurCost) / avgSoldPrice) * 100 : 0;

                      return (
                        <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                            <td className="p-3">
                                <div className="font-mono font-bold">{s.code}</div>
                                <div>{s.name}</div>
                                <div className="text-xs text-gray-400">Price A: {s.priceA}</div>
                            </td>
                            
                            <td className="p-3 text-center border-l border-gray-100">
                                <div className="font-bold">{totalPurQty}</div>
                                <div className="text-xs text-gray-500">Avg Cost: {avgPurCost.toFixed(2)}</div>
                            </td>

                            <td className="p-3 text-center border-l border-gray-100">
                                <div className="font-bold">{totalSoldQty}</div>
                                <div className="text-xs text-gray-500">Avg Price: {avgSoldPrice.toFixed(2)}</div>
                            </td>

                            <td className={`p-3 text-center border-l border-gray-100 font-bold text-lg ${currentStock <= s.minStock && s.alertEnabled ? 'text-red-600 bg-red-50' : 'text-primary'}`}>
                                {currentStock}
                            </td>
                            
                            {/* Editable Min Stock */}
                            <td className="p-3 text-center border-l border-gray-100 no-print">
                                <input 
                                    type="number" 
                                    value={s.minStock} 
                                    onChange={(e) => updateMinStock(s.id, parseInt(e.target.value))}
                                    className="w-16 text-center border rounded p-1" 
                                />
                            </td>
                            <td className="p-3 text-center border-l border-gray-100 print-only">
                                {s.minStock}
                            </td>

                            <td className="p-3 text-center border-l border-gray-100">
                                <div className={`font-bold ${profitMargin > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {profitMargin.toFixed(1)}%
                                </div>
                            </td>
                        </tr>
                      );
                  })}
              </tbody>
          </table>
        </div>
      </div>
    );
};
