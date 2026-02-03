
import React, { useState } from 'react';
import { User, Lock, LogIn, AlertCircle, Package } from 'lucide-react';
import { UserAccount } from '../types';

interface LoginProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      if (!user.isActive) {
        setError('គណនីនេះត្រូវបានផ្អាកជាបណ្តោះអាសន្ន!');
        return;
      }
      onLogin(user);
    } else {
      setError('ឈ្មោះអ្នកប្រើប្រាស់ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200 mb-6">
            <Package className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">រតនា ផលិតសំបកដប</h1>
          <p className="text-slate-500 mt-2 font-medium">ប្រព័ន្ធគ្រប់គ្រងស្តុក និងការលក់</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">សូមចូលប្រើប្រាស់ប្រព័ន្ធ</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ឈ្មោះអ្នកប្រើប្រាស់</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800"
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">លេខសម្ងាត់</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800"
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl text-sm font-medium animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform active:scale-95"
            >
              <LogIn className="w-5 h-5" />
              ចូលប្រើប្រាស់
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs mt-10 uppercase tracking-widest font-bold">
          Inventory Management System v1.1
        </p>
      </div>
    </div>
  );
};

export default Login;
