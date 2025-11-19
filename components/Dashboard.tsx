
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Package, Users, UserCircle, HardDrive, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { state } = useApp();
    
    const stats = useMemo(() => {
        const totalItems = state.items.length;
        const totalSuppliers = state.suppliers.length;
        const totalCustomers = state.customers.length;
        
        const usedBytes = new Blob([JSON.stringify(state)]).size;
        const totalBytes = 5 * 1024 * 1024;
        const storagePercent = (usedBytes / totalBytes) * 100;

        const totalSales = state.sales.reduce((acc, s) => acc + s.totalAmount, 0);
        const cashSales = state.sales.filter(s => s.customerCategory === 'Cash').reduce((acc, s) => acc + s.totalAmount, 0);
        const creditSales = state.sales.filter(s => s.customerCategory !== 'Cash').reduce((acc, s) => acc + s.totalAmount, 0);
        
        // Low Stock Logic
        const lowStockItems = state.items.map(item => {
            const purchased = state.purchases.flatMap(p => p.items).filter(i => i.itemId === item.id).reduce((a,b) => a + b.quantity, 0);
            const sold = state.sales.flatMap(s => s.items).filter(i => i.itemId === item.id && i.mode === 'Stock').reduce((a,b) => a + b.quantity, 0);
            const stock = purchased - sold;
            return { ...item, stock };
        }).filter(i => i.alertEnabled && i.stock <= i.minStock);

        return { totalItems, totalSuppliers, totalCustomers, storagePercent, totalSales, cashSales, creditSales, lowStockItems };
    }, [state]);

    // Simple SVG Donut Chart Calculation
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const cashPercent = stats.totalSales > 0 ? (stats.cashSales / stats.totalSales) : 0;
    const cashOffset = circumference - (cashPercent * circumference);

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-8 text-primary uppercase">Dashboard Overview</h2>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-primary text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                    <h3 className="text-gray-300 mb-1">Total Items</h3>
                    <p className="text-4xl font-bold">{stats.totalItems}</p>
                    <Package className="absolute bottom-4 right-4 opacity-20" size={40} />
                </div>
                <div className="bg-secondary text-primary p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                    <h3 className="text-primary/70 mb-1">Suppliers</h3>
                    <p className="text-4xl font-bold">{stats.totalSuppliers}</p>
                    <Users className="absolute bottom-4 right-4 opacity-20" size={40} />
                </div>
                <div className="bg-accent text-primary p-6 rounded-3xl shadow-lg relative overflow-hidden group">
                    <h3 className="text-primary/70 mb-1">Customers</h3>
                    <p className="text-4xl font-bold">{stats.totalCustomers}</p>
                    <UserCircle className="absolute bottom-4 right-4 opacity-20" size={40} />
                </div>
                <div className="bg-[#2a2a29] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden border border-white/5">
                    <h3 className="text-gray-300 mb-1">Storage</h3>
                    <p className="text-4xl font-bold">{stats.storagePercent.toFixed(1)}%</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-3">
                         <div className={`h-full ${stats.storagePercent > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${stats.storagePercent}%`}}></div>
                    </div>
                    <HardDrive className="absolute bottom-4 right-4 opacity-20" size={40} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Analysis */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary"><TrendingUp /> Sales Analysis</h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                         {/* Donut Chart */}
                         <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="96" cy="96" r={radius} stroke="#E5E7EB" strokeWidth="20" fill="transparent" />
                                <circle cx="96" cy="96" r={radius} stroke="#F5CB5C" strokeWidth="20" fill="transparent" strokeDasharray={circumference} strokeDashoffset={cashOffset} />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="text-2xl font-bold text-primary">{((cashPercent || 0) * 100).toFixed(0)}%</span>
                                <p className="text-xs text-gray-500">Cash Sales</p>
                            </div>
                         </div>
                         
                         {/* Legend & Stats */}
                         <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                             <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                 <div className="flex items-center gap-2 mb-2">
                                     <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                     <span className="text-sm text-gray-500 font-bold">Cash Sales</span>
                                 </div>
                                 <p className="text-2xl font-bold">{stats.cashSales.toFixed(2)}</p>
                             </div>
                             <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                 <div className="flex items-center gap-2 mb-2">
                                     <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                                     <span className="text-sm text-gray-500 font-bold">Credit Sales</span>
                                 </div>
                                 <p className="text-2xl font-bold">{stats.creditSales.toFixed(2)}</p>
                             </div>
                             <div className="col-span-2 p-4 rounded-2xl bg-primary text-white">
                                 <span className="text-sm text-gray-400 font-bold">Total Revenue</span>
                                 <p className="text-3xl font-bold flex items-center gap-1"><DollarSign size={24}/> {stats.totalSales.toFixed(2)}</p>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600"><AlertTriangle /> Stock Alerts</h3>
                    {stats.lowStockItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Package size={48} className="mb-2 opacity-20"/>
                            <p>Stock levels are healthy</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-2 max-h-[300px]">
                            <table className="w-full text-sm">
                                <thead className="bg-red-50 sticky top-0">
                                    <tr>
                                        <th className="text-left p-2 text-red-800 rounded-tl-lg">Item</th>
                                        <th className="text-right p-2 text-red-800 rounded-tr-lg">Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.lowStockItems.map(item => (
                                        <tr key={item.id} className="border-b border-gray-50 hover:bg-red-50/30">
                                            <td className="p-3">
                                                <div className="font-bold text-gray-800">{item.name}</div>
                                                <div className="text-xs text-gray-500">Min: {item.minStock}</div>
                                            </td>
                                            <td className="p-3 text-right font-bold text-red-600 text-lg">{item.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
