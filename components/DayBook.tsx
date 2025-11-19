
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, FileSpreadsheet, Download } from 'lucide-react';

const PrintHeader: React.FC<{ title: string, date: string }> = ({ title, date }) => {
    const { state } = useApp();
    return (
        <div className="mb-4 border-b border-black pb-4 flex justify-between items-center print-only">
            <div className="flex items-center gap-4">
                {state.companyLogo && <img src={state.companyLogo} className="h-16 w-16 object-contain" />}
                <div>
                    <h1 className="text-2xl font-bold uppercase leading-none">{state.companyName}</h1>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{state.companyAddress}</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-bold bg-black text-white px-4 py-1 inline-block uppercase">{title}</h2>
                <p className="text-sm mt-1 font-bold">Date: {date}</p>
            </div>
        </div>
    );
};

export const DayBook: React.FC = () => {
  const { state, navigateTo } = useApp();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const salesToday = state.sales.filter(s => s.date === date);
  const purchasesToday = state.purchases.filter(p => p.date === date);
  const utilToday = state.utilities.filter(u => u.date === date);

  const totalSales = salesToday.reduce((a,b) => a + b.totalAmount, 0);
  const totalPurchases = purchasesToday.reduce((a,b) => a + b.totalAmount, 0);
  const totalUtil = utilToday.reduce((a,b) => a + b.amount, 0);

  const handlePrint = (e: React.MouseEvent) => {
      e.preventDefault();
      window.print();
  };

  const handleEdit = (type: 'purchase' | 'sales', id: string) => {
      // Navigate to respective page with edit ID
      navigateTo(type, null, id);
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-8 no-print gap-4">
         <div>
             <h2 className="text-2xl font-bold text-primary uppercase">Day Book</h2>
             <p className="text-xs text-gray-500">Double click any row to edit transaction</p>
         </div>
         <div className="flex gap-2">
             <input type="date" className="border border-gray-200 bg-white p-3 rounded-xl shadow-sm focus:outline-none focus:border-primary font-bold" value={date} onChange={e => setDate(e.target.value)} />
             
             <button type="button" onClick={handlePrint} className="bg-secondary text-primary font-bold px-4 py-2 rounded-xl flex gap-2 shadow hover:bg-yellow-400 transition items-center">
                 <Download size={18} /> PDF / Print
             </button>
         </div>
      </div>

      <PrintHeader title="Day Book Report" date={date} />
      
      {/* Summary Card */}
      <div className="grid grid-cols-3 gap-4 mb-8 no-print">
          <div className="bg-green-100 p-4 rounded-xl border border-green-200 text-green-800 text-center">
              <span className="text-xs font-bold uppercase">Total Sales</span>
              <p className="text-2xl font-bold">{totalSales.toFixed(2)}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-xl border border-red-200 text-red-800 text-center">
              <span className="text-xs font-bold uppercase">Purchases</span>
              <p className="text-2xl font-bold">{totalPurchases.toFixed(2)}</p>
          </div>
          <div className="bg-orange-100 p-4 rounded-xl border border-orange-200 text-orange-800 text-center">
              <span className="text-xs font-bold uppercase">Expenses</span>
              <p className="text-2xl font-bold">{totalUtil.toFixed(2)}</p>
          </div>
      </div>

      <div className="space-y-8">
         <section>
             <h3 className="font-bold text-white bg-primary px-4 py-2 rounded-t-lg flex items-center justify-between uppercase text-sm">
                <span>Sales ({salesToday.length})</span>
                <span>{totalSales.toFixed(2)}</span>
             </h3>
             <div className="bg-white shadow-sm border border-primary rounded-b-lg overflow-hidden">
                <table className="w-full text-sm font-bold">
                    <thead className="bg-gray-100 text-primary border-b border-gray-300">
                        <tr>
                            <th className="p-3 text-left border-r border-gray-200">Txn No</th>
                            <th className="p-3 text-left border-r border-gray-200">Vehicle / Ref</th>
                            <th className="p-3 text-left border-r border-gray-200">Status</th>
                            <th className="p-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesToday.map(s => (
                            <tr key={s.id} onDoubleClick={() => handleEdit('sales', s.id)} className="border-t border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                                <td className="p-3 font-mono text-gray-600 border-r border-gray-200">{s.transactionNo}</td>
                                <td className="p-3 border-r border-gray-200">{s.vehicleNo}</td>
                                <td className="p-3 border-r border-gray-200">{s.paymentStatus}</td>
                                <td className="p-3 text-right font-bold">{s.totalAmount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
         </section>

         <section>
             <h3 className="font-bold text-white bg-primary px-4 py-2 rounded-t-lg flex items-center justify-between uppercase text-sm">
                <span>Purchases ({purchasesToday.length})</span>
                <span>{totalPurchases.toFixed(2)}</span>
             </h3>
             <div className="bg-white shadow-sm border border-primary rounded-b-lg overflow-hidden">
                <table className="w-full text-sm font-bold">
                    <thead className="bg-gray-100 text-primary border-b border-gray-300">
                        <tr>
                            <th className="p-3 text-left border-r border-gray-200">Txn No</th>
                            <th className="p-3 text-left border-r border-gray-200">Supplier</th>
                            <th className="p-3 text-left border-r border-gray-200">Status</th>
                            <th className="p-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchasesToday.map(s => (
                            <tr key={s.id} onDoubleClick={() => handleEdit('purchase', s.id)} className="border-t border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors">
                                <td className="p-3 font-mono text-gray-600 border-r border-gray-200">{s.transactionNo}</td>
                                <td className="p-3 border-r border-gray-200">{state.suppliers.find(sup=>sup.id===s.supplierId)?.name}</td>
                                <td className="p-3 border-r border-gray-200">{s.paymentStatus}</td>
                                <td className="p-3 text-right font-bold">{s.totalAmount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
         </section>
         
         {/* Print footer calculations */}
         <div className="print-only mt-8 border-t border-black pt-4">
             <div className="flex justify-between items-center text-sm">
                 <div><strong>Closing Balance Calculation:</strong><br/>(Opening Cash + Total Sales) - (Purchases + Expenses)</div>
                 <div className="text-right">
                     <p>Total In: {totalSales.toFixed(2)}</p>
                     <p>Total Out: {(totalPurchases + totalUtil).toFixed(2)}</p>
                     <p className="font-bold text-lg mt-1">Net Flow: {(totalSales - totalPurchases - totalUtil).toFixed(2)}</p>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
