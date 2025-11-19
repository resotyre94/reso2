
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UtilityBill, Partner } from '../types';
import { Plus, Printer } from 'lucide-react';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`border border-gray-200 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full font-bold ${props.className}`} />
);

const PrintHeader: React.FC<{ title: string }> = ({ title }) => {
    const { state } = useApp();
    return (
        <div className="mb-4 border-b pb-4 flex justify-between items-center print-only">
            <div className="flex items-center gap-4">
                {state.companyLogo && <img src={state.companyLogo} className="h-16 w-16 object-contain" />}
                <div>
                    <h1 className="text-2xl font-bold uppercase leading-none">{state.companyName}</h1>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{state.companyAddress}</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-bold bg-black text-white px-4 py-1 inline-block uppercase">{title}</h2>
                <p className="text-sm mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export const UtilityManager: React.FC = () => {
    const { state, setState } = useApp();
    const [form, setForm] = useState<Partial<UtilityBill>>({ date: new Date().toISOString().split('T')[0], category: 'Petty Cash' });
    const [isNewCat, setIsNewCat] = useState(false);

    const save = () => {
        if (!form.amount || !form.description) return alert("Fill all fields");
        const newBill: UtilityBill = {
            id: crypto.randomUUID(),
            category: form.category!,
            date: form.date!,
            amount: form.amount!,
            description: form.description!,
            createdBy: state.currentUser?.username || 'Admin',
            timestamp: Date.now()
        };
        setState(prev => ({ ...prev, utilities: [...prev.utilities, newBill] }));
        setForm({ ...form, amount: 0, description: '' });
        setIsNewCat(false);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-primary uppercase">Utility Bills & Petty Cash</h2>
            <div className="bg-surface p-6 rounded-2xl border border-accent/20 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {isNewCat ? (
                     <div className="flex gap-2">
                         <Input placeholder="New Category Name" value={form.category} onChange={e => setForm({...form, category: e.target.value})} autoFocus />
                         <button onClick={()=>setIsNewCat(false)} className="text-red-500 font-bold">X</button>
                     </div>
                ) : (
                    <select className="border border-gray-200 bg-gray-50 rounded-xl p-3 font-bold w-full" value={form.category} onChange={e => {
                        if(e.target.value === 'NEW') setIsNewCat(true);
                        else setForm({...form, category: e.target.value});
                    }}>
                        <option value="Petty Cash">Petty Cash</option>
                        <option value="Electricity">Electricity</option>
                        <option value="Phone">Phone</option>
                        <option value="Internet">Internet</option>
                        <option value="NEW" className="text-blue-600 font-bold">+ Create New Category</option>
                    </select>
                )}
                
                <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                <Input type="number" placeholder="Amount" value={form.amount || ''} onChange={e => setForm({...form, amount: parseFloat(e.target.value)})} />
                <Input placeholder="Description" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
                <button onClick={save} className="bg-secondary text-primary font-bold p-3 rounded-xl shadow hover:bg-yellow-400 transition col-span-1 md:col-span-4">Add Record</button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-100 max-h-96 overflow-y-auto">
                <table className="w-full text-sm font-bold">
                    <thead className="bg-accent/30 sticky top-0">
                        <tr><th className="p-4 text-left text-primary">Date</th><th className="p-4 text-left text-primary">Category</th><th className="p-4 text-left text-primary">Desc</th><th className="p-4 text-right text-primary">Amount</th></tr>
                    </thead>
                    <tbody>
                        {state.utilities.map(u => (
                            <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                                <td className="p-4">{u.date}</td>
                                <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{u.category}</span></td>
                                <td className="p-4">{u.description}</td>
                                <td className="p-4 text-right font-mono font-bold">{u.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const BudgetManager: React.FC = () => {
    const { state, setState } = useApp();
    const [partner, setPartner] = useState<Partial<Partner>>({ startDate: new Date().toISOString().split('T')[0] });

    const addPartner = () => {
        if (!partner.name || !partner.contribution) return;
        const newP: Partner = {
            id: crypto.randomUUID(),
            name: partner.name!,
            contribution: partner.contribution!,
            startDate: partner.startDate!
        };
        setState(prev => ({ 
            ...prev, 
            partners: [...prev.partners, newP],
            totalBudget: prev.totalBudget + newP.contribution
        }));
        setPartner({ startDate: new Date().toISOString().split('T')[0], name: '', contribution: 0 });
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-primary uppercase">Budget & Partners</h2>
            <div className="bg-primary text-white p-6 rounded-3xl mb-8 flex justify-between items-center shadow-lg">
                <span className="text-lg font-medium text-gray-300">Total Budget / Capital</span>
                <span className="text-4xl font-bold text-secondary">{state.totalBudget.toFixed(2)}</span>
            </div>
            <div className="bg-surface p-6 rounded-2xl border border-accent/20 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input placeholder="Partner Name" value={partner.name || ''} onChange={e => setPartner({...partner, name: e.target.value})} />
                <Input type="number" placeholder="Contribution" value={partner.contribution || ''} onChange={e => setPartner({...partner, contribution: parseFloat(e.target.value)})} />
                <Input type="date" value={partner.startDate} onChange={e => setPartner({...partner, startDate: e.target.value})} />
                <button onClick={addPartner} className="bg-primary text-white font-bold p-3 rounded-xl shadow hover:bg-black transition flex items-center justify-center gap-2"><Plus size={20} /> Add Partner</button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="w-full text-sm font-bold">
                    <thead className="bg-accent/30">
                        <tr><th className="p-4 text-left text-primary">Name</th><th className="p-4 text-left text-primary">Start Date</th><th className="p-4 text-right text-primary">Contribution</th></tr>
                    </thead>
                    <tbody>
                        {state.partners.map(p => (
                            <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                                <td className="p-4 font-medium">{p.name}</td>
                                <td className="p-4">{p.startDate}</td>
                                <td className="p-4 text-right font-mono font-bold">{p.contribution.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const PLReport: React.FC = () => {
    const { state } = useApp();

    const totalSales = state.sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPurchases = state.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalUtilities = state.utilities.reduce((sum, u) => sum + u.amount, 0);
    const netProfit = totalSales - totalPurchases - totalUtilities;

    const today = new Date();
    const partnersWithWeight = state.partners.map(p => {
        const start = new Date(p.startDate);
        const diffTime = Math.abs(today.getTime() - start.getTime());
        const daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; 
        return { ...p, weight: p.contribution * daysActive, daysActive };
    });

    const totalWeight = partnersWithWeight.reduce((sum, p) => sum + p.weight, 0);

    const handlePrint = (e: React.MouseEvent) => {
        e.preventDefault();
        window.print();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8 no-print">
                <h2 className="text-2xl font-bold text-primary uppercase">Profit & Loss Account</h2>
                <button type="button" onClick={handlePrint} className="bg-secondary text-primary font-bold px-4 py-2 rounded-xl flex gap-2 shadow hover:bg-yellow-400 transition"><Printer size={18} /> Print Report</button>
            </div>

            <PrintHeader title="Profit & Loss Report" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 no-print">
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-green-500">
                    <h3 className="text-gray-400 text-sm uppercase font-bold tracking-wider">Total Income (Sales)</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-red-500">
                    <h3 className="text-gray-400 text-sm uppercase font-bold tracking-wider">Total Expenses</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{(totalPurchases + totalUtilities).toFixed(2)}</p>
                </div>
            </div>

            {/* Print Friendly Summary */}
            <div className="print-only border-b mb-4 pb-4">
                 <table className="w-full mb-4">
                     <tr><td className="font-bold">Total Sales Income:</td><td className="text-right">{totalSales.toFixed(2)}</td></tr>
                     <tr><td className="font-bold">Total Purchases:</td><td className="text-right">{totalPurchases.toFixed(2)}</td></tr>
                     <tr><td className="font-bold">Total Utility Exp:</td><td className="text-right">{totalUtilities.toFixed(2)}</td></tr>
                     <tr><td className="font-bold border-t pt-2">NET PROFIT/LOSS:</td><td className="text-right font-bold border-t pt-2">{netProfit.toFixed(2)}</td></tr>
                 </table>
            </div>

            <div className={`p-8 rounded-3xl shadow-lg text-center mb-10 ${netProfit >= 0 ? 'bg-primary' : 'bg-red-600'} text-white no-print`}>
                <h3 className="text-lg uppercase font-bold opacity-80">Net Profit / Loss</h3>
                <p className="text-5xl font-bold mt-4">{netProfit.toFixed(2)}</p>
            </div>

            <h3 className="text-xl font-bold mb-4 text-primary uppercase">Partner Share Distribution</h3>
            
            <div className="bg-white shadow-sm rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm font-bold">
                    <thead className="bg-accent/30">
                        <tr>
                            <th className="p-4 text-left text-primary">Partner</th>
                            <th className="p-4 text-right text-primary">Contribution</th>
                            <th className="p-4 text-center text-primary">Days</th>
                            <th className="p-4 text-right text-primary">Share %</th>
                            <th className="p-4 text-right font-bold text-primary">Profit Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partnersWithWeight.map(p => {
                            const sharePercent = totalWeight > 0 ? (p.weight / totalWeight) : 0;
                            const profitShare = netProfit * sharePercent;
                            return (
                                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="p-4">{p.name}</td>
                                    <td className="p-4 text-right font-mono">{p.contribution.toFixed(2)}</td>
                                    <td className="p-4 text-center">{p.daysActive}</td>
                                    <td className="p-4 text-right">{(sharePercent * 100).toFixed(2)}%</td>
                                    <td className={`p-4 text-right font-bold ${profitShare >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {profitShare.toFixed(2)}
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
