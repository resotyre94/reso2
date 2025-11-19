
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { SupplierManager, CustomerManager, StockManager } from './components/Masters';
import { PurchaseEntry, SalesEntry } from './components/Transactions';
import { UtilityManager, BudgetManager, PLReport } from './components/Finance';
import { DayBook } from './components/DayBook';
import { DataManager } from './components/DataManager';
import { Reports } from './components/Reports';
import { Dashboard } from './components/Dashboard';
import { 
  LayoutDashboard, Users, UserCircle, Package, 
  ShoppingCart, CreditCard, Lightbulb, 
  PieChart, BookOpen, Database, LogOut, Menu,
  TrendingUp, ShieldCheck, FileText
} from 'lucide-react';

const MainLayout: React.FC = () => {
    const { state, setState, navigateTo } = useApp();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    if (!state.isAuthenticated || !state.currentUser) {
        return <Login />;
    }

    const isAdmin = state.currentUser?.role === 'Admin';

    // Define Menu Structure
    const allMenuItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, restricted: false },
        { id: 'suppliers', label: 'Suppliers', icon: Users, restricted: false },
        { id: 'customers', label: 'Customers', icon: UserCircle, restricted: false },
        { id: 'stock', label: 'Stock Items', icon: Package, restricted: false },
        { id: 'purchase', label: 'Purchases', icon: ShoppingCart, restricted: false },
        { id: 'sales', label: 'Sales', icon: CreditCard, restricted: false },
        { id: 'daybook', label: 'Day Book', icon: BookOpen, restricted: false },
        { id: 'reports', label: 'SOA & Reports', icon: FileText, restricted: false }, // New Tab
        { id: 'utilities', label: 'Utilities', icon: Lightbulb, restricted: false },
        { id: 'budget', label: 'Budget', icon: PieChart, restricted: true },
        { id: 'pnl', label: 'Profit & Loss', icon: TrendingUp, restricted: true },
        { id: 'data', label: 'Settings & Data', icon: Database, restricted: true },
    ];

    const menuItems = allMenuItems.filter(item => isAdmin || !item.restricted);

    return (
        <div className="flex h-screen bg-surface overflow-hidden font-sans text-primary">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-primary text-gray-300 flex flex-col transition-all duration-300 no-print z-20 shadow-2xl`}>
                <div className="p-6 flex items-center justify-between">
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                           {state.companyLogo ? 
                                <img src={state.companyLogo} className="h-8 w-8 rounded bg-white object-contain" /> 
                                : <div className="w-8 h-8 rounded bg-secondary"></div>
                           }
                           <span className="font-bold text-white text-xl tracking-tight">ALI System</span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"><Menu size={20} /></button>
                </div>
                
                <div className="px-4 py-2 flex-1 overflow-y-auto scrollbar-hide">
                    <p className={`text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ${!sidebarOpen && 'hidden'}`}>Menu</p>
                    <nav className="space-y-1">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => navigateTo(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    state.activeTab === item.id 
                                    ? 'bg-secondary text-primary font-bold shadow-lg' 
                                    : 'hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <item.icon size={20} className={state.activeTab === item.id ? 'text-primary' : 'text-gray-400 group-hover:text-white'} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-white/10 bg-[#2a2a29]">
                    <div className={`mb-4 flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm shrink-0">
                            {(state.currentUser?.username || '?').charAt(0).toUpperCase()}
                        </div>
                        {sidebarOpen && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{state.currentUser?.name || 'User'}</p>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    {isAdmin ? <ShieldCheck size={10} className="text-secondary"/> : null} {state.currentUser?.role || 'Staff'}
                                </p>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setState(prev => ({...prev, isAuthenticated: false}))} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl w-full transition-colors">
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="bg-surface/80 backdrop-blur-md p-4 md:px-8 flex justify-between items-center no-print z-10 sticky top-0">
                    <div>
                         <h1 className="text-2xl font-bold text-primary uppercase tracking-tight">{menuItems.find(i => i.id === state.activeTab)?.label}</h1>
                         <p className="text-sm text-gray-500">Manage your business efficiently</p>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-sm min-h-full p-1">
                         {state.activeTab === 'dashboard' && <Dashboard />}
                         {state.activeTab === 'suppliers' && <SupplierManager />}
                         {state.activeTab === 'customers' && <CustomerManager />}
                         {state.activeTab === 'stock' && <StockManager />}
                         {state.activeTab === 'purchase' && <PurchaseEntry />}
                         {state.activeTab === 'sales' && <SalesEntry />}
                         {state.activeTab === 'daybook' && <DayBook />}
                         {state.activeTab === 'reports' && <Reports />}
                         {state.activeTab === 'utilities' && <UtilityManager />}
                         
                         {/* Protected Routes */}
                         {isAdmin && state.activeTab === 'budget' && <BudgetManager />}
                         {isAdmin && state.activeTab === 'pnl' && <PLReport />}
                         {isAdmin && state.activeTab === 'data' && <DataManager />}
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-100 text-center text-xs py-3 text-gray-400 no-print">
                    Created by ALI • m.nharakkat@eleganciagroup.com • 2025
                </footer>
            </div>
        </div>
    );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
