
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Upload, ArrowRight, UserPlus, LogIn, Database, CheckCircle } from 'lucide-react';
import { User, INITIAL_STATE } from '../types';

export const Login: React.FC = () => {
  const { state, setState } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Staff'>('Staff');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleBackupRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
            if (event.target?.result) {
                const parsed = JSON.parse(event.target.result as string);
                
                // Basic Validation: Ensure users exist in the backup
                if (parsed.users && Array.isArray(parsed.users) && parsed.users.length > 0) {
                    // Restore data, but keep user logged out so they must authenticate
                    setState({
                        ...INITIAL_STATE,
                        ...parsed,
                        isAuthenticated: false,
                        currentUser: null
                    });
                    setSuccessMsg('System Restored! Please login with your saved credentials.');
                    setError('');
                    // Switch to login view if on signup
                    setIsSignUp(false);
                } else {
                    setError('Invalid Backup File: No user data found.');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Failed to parse backup file. Please check format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isSignUp) {
        // REGISTER
        if (!username || !password || !fullName) {
            setError('Please fill in all fields');
            return;
        }
        if (state.users.find(u => u.username === username)) {
            setError('Username already exists');
            return;
        }
        
        const newUser: User = { username, password, role, name: fullName };
        setState(prev => ({
            ...prev,
            users: [...prev.users, newUser],
            isAuthenticated: true,
            currentUser: newUser
        }));

    } else {
        // LOGIN
        const user = state.users.find(u => u.username === username && u.password === password);
        if (user) {
            setState(prev => ({
                ...prev,
                isAuthenticated: true,
                currentUser: user
            }));
        } else {
            setError('Invalid username or password');
        }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EBE0] flex items-center justify-center relative overflow-hidden p-4">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-10 right-10 w-32 h-64 bg-[#242423] rounded-3xl transform rotate-12 opacity-5"></div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md z-10 border border-accent/30 transition-all duration-300">
        <div className="text-center mb-8">
          {state.companyLogo ? (
            <img src={state.companyLogo} alt="Logo" className="h-24 mx-auto mb-6 object-contain rounded-xl border-2 border-accent p-1" />
          ) : (
            <div className="h-20 w-20 bg-accent rounded-2xl mx-auto mb-6 flex items-center justify-center transform rotate-3">
               <span className="text-primary font-bold text-2xl">ALI</span>
            </div>
          )}
          <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-gray-500 text-lg">{isSignUp ? 'Join the team' : 'Secure Inventory Management'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
             <div className="space-y-1 animate-fadeIn">
                <label className="block text-sm font-bold text-gray-700 ml-1">Full Name</label>
                <input
                    type="text"
                    className="block w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Your Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
             </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 ml-1">Username</label>
            <input
              type="text"
              className="block w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-gray-700 ml-1">Password</label>
            <input
              type="password"
              className="block w-full border-2 border-gray-100 bg-gray-50 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isSignUp && (
             <div className="space-y-1 animate-fadeIn">
                <label className="block text-sm font-bold text-gray-700 ml-1">Role</label>
                <div className="grid grid-cols-2 gap-3">
                    <div 
                        onClick={() => setRole('Staff')} 
                        className={`p-3 rounded-xl border-2 cursor-pointer text-center font-bold text-sm ${role === 'Staff' ? 'border-primary bg-primary text-white' : 'border-gray-100 text-gray-500'}`}
                    >
                        Staff
                    </div>
                    <div 
                        onClick={() => setRole('Admin')} 
                        className={`p-3 rounded-xl border-2 cursor-pointer text-center font-bold text-sm ${role === 'Admin' ? 'border-primary bg-primary text-white' : 'border-gray-100 text-gray-500'}`}
                    >
                        Admin
                    </div>
                </div>
             </div>
          )}
          
          {/* Error / Success Messages */}
          {error && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg text-center border border-red-100">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm font-medium bg-green-50 p-3 rounded-lg text-center border border-green-100 flex items-center justify-center gap-2"><CheckCircle size={16}/> {successMsg}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-4 px-6 rounded-2xl hover:bg-black hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            {isSignUp ? 'Create Account' : 'Login'} <ArrowRight size={20} />
          </button>

          <div className="text-center pt-4">
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMsg(''); }} className="text-sm font-bold text-gray-500 hover:text-primary flex items-center justify-center gap-2 w-full">
                  {isSignUp ? <><LogIn size={16}/> Already have an account? Login</> : <><UserPlus size={16}/> No account? Sign Up</>}
              </button>
          </div>

          {/* Backup Restore Option */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400 mb-3 uppercase font-bold tracking-widest">System Recovery</p>
            <label className="flex items-center justify-center w-full p-3 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-secondary/10 hover:border-secondary transition-colors group gap-2">
                <Database className="w-4 h-4 text-gray-400 group-hover:text-secondary transition-colors" />
                <span className="text-xs font-bold text-gray-500 group-hover:text-primary">Upload & Restore Backup JSON</span>
                <input type="file" className="hidden" accept=".json" onChange={handleBackupRestore} />
            </label>
          </div>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-300 font-medium tracking-wide">
                System by ALI • 2025
            </p>
        </div>
      </div>
    </div>
  );
};
