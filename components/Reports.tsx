
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Search, Download } from 'lucide-react';

export const Reports: React.FC = () => {
    const { state } = useApp();
    const [filters, setFilters] = useState({
        type: 'Supplier',
        entityId: '',
        fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        status: 'All'
    });

    const handlePrint = (e: React.MouseEvent) => {
        e.preventDefault();
        window.print();
    };

    // Logic to build Ledger
    const generateLedger = () => {
        let transactions: any[] = [];
        
        if (filters.type === 'Supplier') {
             // Get Purchases
             const purchases = state.purchases.filter(p => 
                 (!filters.entityId || p.supplierId === filters.entityId) &&
                 p.date >= filters.fromDate && p.date <= filters.toDate
             ).map(p => ({
                 date: p.date,
                 ref: p.transactionNo,
                 desc: `Invoice Ref: ${p.docNo} ${p.notes ? '- ' + p.notes : ''}`,
                 debit: 0,
                 credit: p.totalAmount, // We owe them
                 balance: 0 // Calc later
             }));
             
             // Add Payments (Logic: In a real system payments would be separate table, here we assume payments are part of purchase entry updates)
             // Since we added paidAmount to Purchase, we treat it as Credit entry? No. 
             // Purchase = Credit (We owe). Payment = Debit (We paid).
             
             const payments = state.purchases.filter(p =>
                (!filters.entityId || p.supplierId === filters.entityId) &&
                p.date >= filters.fromDate && p.date <= filters.toDate &&
                (p.paidAmount && p.paidAmount > 0)
             ).map(p => ({
                 date: p.date,
                 ref: p.transactionNo + '-PMT',
                 desc: `Payment for ${p.docNo}`,
                 debit: p.paidAmount,
                 credit: 0,
                 balance: 0
             }));

             transactions = [...purchases, ...payments];

        } else {
             // Customer Logic
             const sales = state.sales.filter(s => 
                 // Sales doesn't have customer ID yet, relies on Name matching or category? 
                 // Prompt requirement said "Credit Customer Selection". 
                 // Current System uses Category enum, but we can filter by Name/Vehicle
                 // Let's use Vehicle No or Name if we had it. 
                 // Assuming Filter by "Category" or text search for now as we don't have Customer ID in Sale interface properly linked
                 (!filters.entityId || s.customerCategory === filters.entityId) &&
                 s.date >= filters.fromDate && s.date <= filters.toDate
             ).map(s => ({
                 date: s.date,
                 ref: s.transactionNo,
                 desc: `Sale - ${s.vehicleNo}`,
                 debit: s.totalAmount, // They owe us
                 credit: 0,
                 balance: 0
             }));

             const receipts = state.sales.filter(s =>
                (!filters.entityId || s.customerCategory === filters.entityId) &&
                s.date >= filters.fromDate && s.date <= filters.toDate &&
                (s.receivedAmount && s.receivedAmount > 0)
             ).map(s => ({
                 date: s.date,
                 ref: s.transactionNo + '-RCT',
                 desc: `Received for ${s.vehicleNo}`,
                 debit: 0,
                 credit: s.receivedAmount,
                 balance: 0
             }));

             transactions = [...sales, ...receipts];
        }

        // Sort by Date
        transactions.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate Running Balance
        let runningBalance = 0;
        return transactions.map(t => {
            if(filters.type === 'Supplier') {
                runningBalance += (t.credit - t.debit); // We owe (Credit increases balance)
            } else {
                runningBalance += (t.debit - t.credit); // They owe (Debit increases balance)
            }
            return { ...t, balance: runningBalance };
        });
    };

    const ledger = generateLedger();
    const totalDebit = ledger.reduce((a,b) => a + b.debit, 0);
    const totalCredit = ledger.reduce((a,b) => a + b.credit, 0);
    const closingBalance = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;

    const selectedEntityName = filters.type === 'Supplier' 
        ? state.suppliers.find(s => s.id === filters.entityId)?.name || 'All Suppliers'
        : filters.entityId || 'All Customers';

    return (
        <div className="p-6">
            {/* Controls */}
            <div className="bg-surface p-6 rounded-2xl border border-accent/20 mb-6 no-print grid grid-cols-1 md:grid-cols-5 gap-4 items-end shadow-sm">
                <div>
                    <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Report Type</label>
                    <select className="w-full p-3 rounded-xl border bg-white" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value, entityId: ''})}>
                        <option value="Supplier">Supplier Statement</option>
                        <option value="Customer">Customer Statement</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1 uppercase text-gray-500">Select Entity</label>
                    {filters.type === 'Supplier' ? (
                        <select className="w-full p-3 rounded-xl border bg-white" value={filters.entityId} onChange={e => setFilters({...filters, entityId: e.target.value})}>
                            <option value="">All Suppliers</option>
                            {state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    ) : (
                        <select className="w-full p-3 rounded-xl border bg-white" value={filters.entityId} onChange={e => setFilters({...filters, entityId: e.target.value})}>
                            <option value="">All Categories</option>
                            {/* Simplified for Customer Categories as per current Sale Model */}
                            <option value="Cash">Cash</option>
                            <option value="Individual">Individual</option>
                            <option value="Group">Group</option>
                        </select>
                    )}
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1 uppercase text-gray-500">From Date</label>
                    <input type="date" className="w-full p-3 rounded-xl border bg-white" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold mb-1 uppercase text-gray-500">To Date</label>
                    <input type="date" className="w-full p-3 rounded-xl border bg-white" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} />
                </div>
                <button onClick={handlePrint} className="bg-primary text-white font-bold p-3 rounded-xl hover:bg-black transition flex justify-center gap-2">
                    <Printer size={20}/> Print / PDF
                </button>
            </div>

            {/* Printable Report */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[800px] relative">
                {/* Header */}
                <div className="border-b-2 border-black pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            {state.companyLogo && <img src={state.companyLogo} className="h-24 w-24 object-contain" />}
                            <div>
                                <h1 className="text-3xl font-bold uppercase">{state.companyName}</h1>
                                <p className="text-gray-600 whitespace-pre-line mt-1">{state.companyAddress}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold uppercase tracking-wider">Statement of Account</h2>
                            <p className="font-medium text-lg mt-2">{selectedEntityName}</p>
                            <p className="text-sm text-gray-500">Period: {filters.fromDate} to {filters.toDate}</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-y-2 border-black">
                        <tr>
                            <th className="p-3 text-left font-bold">Date</th>
                            <th className="p-3 text-left font-bold">Ref No</th>
                            <th className="p-3 text-left font-bold">Description</th>
                            <th className="p-3 text-right font-bold">Debit</th>
                            <th className="p-3 text-right font-bold">Credit</th>
                            <th className="p-3 text-right font-bold">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400 italic">No transactions found in this period</td></tr>
                        ) : (
                            ledger.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-100">
                                    <td className="p-3">{row.date}</td>
                                    <td className="p-3 font-mono text-xs">{row.ref}</td>
                                    <td className="p-3">{row.desc}</td>
                                    <td className="p-3 text-right">{row.debit > 0 ? row.debit.toFixed(2) : '-'}</td>
                                    <td className="p-3 text-right">{row.credit > 0 ? row.credit.toFixed(2) : '-'}</td>
                                    <td className="p-3 text-right font-bold">{row.balance.toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-black font-bold">
                        <tr>
                            <td colSpan={3} className="p-3 text-right uppercase">Totals</td>
                            <td className="p-3 text-right">{totalDebit.toFixed(2)}</td>
                            <td className="p-3 text-right">{totalCredit.toFixed(2)}</td>
                            <td className="p-3 text-right text-lg bg-gray-200">{closingBalance.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signatories */}
                <div className="absolute bottom-20 left-0 w-full px-8">
                    <div className="flex justify-between items-end text-center text-sm font-bold">
                        <div className="border-t border-black w-48 pt-2">Prepared By<br/><span className="text-xs font-normal text-gray-500">{state.currentUser?.name}</span></div>
                        <div className="border-t border-black w-48 pt-2">Approved By</div>
                        <div className="border-t border-black w-48 pt-2">Received By</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
