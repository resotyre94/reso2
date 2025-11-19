import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Upload, FileSpreadsheet, HardDrive, AlertTriangle, CheckCircle, Database, Save, Building, ShieldAlert } from 'lucide-react';
import { INITIAL_STATE } from '../types';

export const DataManager: React.FC = () => {
  const { state, setState } = useApp();
  const [storageStats, setStorageStats] = useState({ 
      usedBytes: 0, 
      totalBytes: 5242880, // 5MB is standard browser limit
      percent: 0,
      estRemainingRecords: 0 
  });
  
  const [companyForm, setCompanyForm] = useState({
      name: state.companyName,
      address: state.companyAddress
  });

  useEffect(() => {
    const dataString = JSON.stringify(state);
    const usedBytes = new Blob([dataString]).size;
    const totalBytes = 5 * 1024 * 1024; // 5MB
    const percent = (usedBytes / totalBytes) * 100;
    
    const remainingBytes = totalBytes - usedBytes;
    const estRemainingRecords = Math.floor(remainingBytes / 500);

    setStorageStats({ usedBytes, totalBytes, percent, estRemainingRecords });
    setCompanyForm({ name: state.companyName, address: state.companyAddress });
  }, [state.companyName, state.companyAddress, state]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCompanyDetails = () => {
      setState(prev => ({
          ...prev,
          companyName: companyForm.name,
          companyAddress: companyForm.address
      }));
      alert("Company details updated successfully!");
  };

  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ALI_Inventory_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadCSV = () => {
     let csvContent = "data:text/csv;charset=utf-8,";
     csvContent += "Transaction No,Date,Customer Category,Vehicle,Total Amount\n";
     state.sales.forEach(row => {
        csvContent += `${row.transactionNo},${row.date},${row.customerCategory},${row.vehicleNo},${row.totalAmount}\n`;
     });
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
     document.body.appendChild(link);
     link.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
            if(event.target?.result) {
                const parsed = JSON.parse(event.target.result as string);
                if(parsed.suppliers && parsed.sales && parsed.items) {
                    
                    // SECURITY & MIGRATION:
                    // 1. Force logout to ensure current session user structure doesn't conflict with old data
                    parsed.currentUser = null;
                    parsed.isAuthenticated = false;

                    // 2. Ensure users array exists (legacy backup support)
                    if (!parsed.users || !Array.isArray(parsed.users)) {
                        // If users missing, insert default admin so system isn't locked
                        parsed.users = [{ username: 'admin', password: '123', role: 'Admin', name: 'System Admin' }];
                    }
                    
                    // 3. Merge with initial state to ensure all new schema fields exist
                    setState({ ...INITIAL_STATE, ...parsed });
                    alert("System restored successfully! You have been logged out to ensure data integrity. Please login again.");
                } else {
                    throw new Error("Missing core data structures");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Invalid Backup File. Structure does not match.");
        }
      };
    }
  };

  const formatBytes = (bytes: number) => {
      if(bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-8 text-primary">Settings & Data Management</h2>

      {/* Company Settings */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
         <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary"><Building /> Company Settings</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold mb-2">Company Name</label>
                <input className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-bold mb-2">Address</label>
                <input className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50" value={companyForm.address} onChange={e => setCompanyForm({...companyForm, address: e.target.value})} />
            </div>
            <div className="md:col-span-2 flex items-center gap-4">
                <div>
                    <label className="block text-sm font-bold mb-2">Header Logo (For Print)</label>
                    <input type="file" className="text-sm" accept="image/*" onChange={handleLogoUpload} />
                </div>
                {state.companyLogo && <img src={state.companyLogo} alt="Header" className="h-16 object-contain border p-1 rounded" />}
            </div>
            <div className="md:col-span-2 text-right">
                <button onClick={saveCompanyDetails} className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 ml-auto"><Save size={18} /> Save Details</button>
            </div>
         </div>
      </div>

      {/* Storage Visualization */}
      <div className="bg-primary text-white p-8 rounded-3xl shadow-xl mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 relative z-10">
            <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-secondary"><HardDrive /> Storage Balance</h3>
                <div className="mb-2 flex justify-between text-sm font-bold">
                    <span>{formatBytes(storageStats.usedBytes)} used</span>
                    <span>{formatBytes(storageStats.totalBytes)} total</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-4 mb-4 overflow-hidden border border-white/5">
                    <div className={`h-full rounded-full transition-all duration-1000 ${storageStats.percent > 80 ? 'bg-red-500' : 'bg-secondary'}`} style={{ width: `${Math.min(storageStats.percent, 100)}%` }}></div>
                </div>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl flex flex-col justify-center items-center min-w-[200px] backdrop-blur-sm border border-white/5">
                <span className="text-4xl font-bold text-secondary mb-1">~{storageStats.estRemainingRecords}</span>
                <span className="text-sm text-gray-400 text-center">Records Remaining</span>
            </div>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-primary text-lg"><Download size={24}/> Backup System</h3>
            <button onClick={downloadJSON} className="bg-primary text-white px-6 py-4 rounded-2xl hover:bg-black transition-colors w-full font-bold shadow-lg flex items-center justify-center gap-2 mt-auto">
                <Database size={18} /> Download Full Backup
            </button>
        </div>

        {/* ADMIN ONLY UPLOAD ZONE */}
        {state.currentUser?.role === 'Admin' ? (
            <div className="bg-white p-8 rounded-3xl shadow-sm border-2 border-red-100 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-xl">ADMIN ONLY</div>
                <h3 className="font-bold mb-4 flex items-center gap-2 text-primary text-lg"><Upload size={24}/> Restore System</h3>
                <div className="bg-red-50 p-4 rounded-xl mb-4 text-sm text-red-600 flex gap-2">
                    <ShieldAlert size={20} className="shrink-0"/>
                    <p>Warning: Restoring will overwrite all current data. You will be logged out.</p>
                </div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-accent rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors mt-auto">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Upload Backup File</p>
                    </div>
                    <input type="file" className="hidden" accept=".json" onChange={importData} />
                </label>
            </div>
        ) : (
             <div className="bg-gray-100 p-8 rounded-3xl border border-gray-200 flex flex-col items-center justify-center text-gray-400">
                 <ShieldAlert size={48} className="mb-2 opacity-50"/>
                 <p className="font-bold">Restore Restricted</p>
                 <p className="text-sm">Admin access required</p>
             </div>
        )}

         <div className="bg-secondary/10 border border-secondary p-8 rounded-3xl shadow-lg md:col-span-2 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
                <h3 className="font-bold mb-2 flex items-center gap-2 text-primary text-xl"><FileSpreadsheet size={24}/> Export Reports (Excel/CSV)</h3>
            </div>
            <button onClick={downloadCSV} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-md whitespace-nowrap">
                Export Sales CSV
            </button>
        </div>
      </div>
    </div>
  );
};