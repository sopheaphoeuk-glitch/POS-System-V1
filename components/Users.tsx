
import React, { useState, useMemo } from 'react';
import { UserAccount, UserRole, UserPermissions, AuditLog } from '../types';
import { 
  Plus, Edit2, Trash2, X, Search, ShieldCheck, 
  UserCheck, ShieldAlert, Settings2, 
  LayoutDashboard, Package, ShoppingCart, Wallet, 
  BarChart3, Lock, ClipboardX, Filter, Calendar as CalendarIcon,
  RotateCcw, ListFilter, History, User as UserIcon, UserMinus, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle, Clock, ArrowRight
} from 'lucide-react';

interface UsersProps {
  users: UserAccount[];
  onAdd: (u: UserAccount) => void;
  onUpdate: (u: UserAccount) => void;
  onDelete: (id: string) => void;
  auditLogs: AuditLog[];
  searchTerm: string;
}

const Users: React.FC<UsersProps> = ({ users, onAdd, onUpdate, onDelete, auditLogs, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'logs'>('list');
  
  const [formData, setFormData] = useState<Partial<UserAccount>>({
    username: '',
    password: '',
    fullName: '',
    role: UserRole.STAFF,
    isActive: true,
    permissions: {
      dashboard: true,
      inventory: true,
      stockIn: true,
      stockOut: true,
      otherStockOut: true,
      expenses: true,
      reports: false
    }
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [auditLogs, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdate({ ...editingUser, ...formData } as UserAccount);
    } else {
      onAdd({ 
        ...formData, 
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      } as UserAccount);
    }
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      role: UserRole.STAFF,
      isActive: true,
      permissions: {
        dashboard: true,
        inventory: true,
        stockIn: true,
        stockOut: true,
        otherStockOut: true,
        expenses: true,
        reports: false
      }
    });
    setIsModalOpen(true);
  };

  const togglePermission = (key: keyof UserPermissions) => {
    if (!formData.permissions) return;
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key]
      }
    });
  };

  const toggleUserStatus = (user: UserAccount) => {
    onUpdate({ ...user, isActive: !user.isActive });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('km-KH', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">គ្រប់គ្រងបុគ្គលិក និងសុវត្ថិភាព</h2>
          <p className="text-slate-500">គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ និងពិនិត្យមើលសកម្មភាពប្រព័ន្ធ</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            <button 
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <UserIcon className="w-4 h-4" /> បញ្ជីអ្នកប្រើប្រាស់
            </button>
            <button 
                onClick={() => setActiveTab('logs')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <History className="w-4 h-4" /> កំណត់ហេតុ (Logs)
            </button>
        </div>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-6">
           <div className="flex justify-end">
              <button 
                onClick={openAddModal}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
              >
                <Plus className="w-5 h-5" /> បង្កើតអ្នកប្រើថ្មី
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(user => (
                <div key={user.id} className={`bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 ${!user.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner ${user.role === UserRole.ADMIN ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingUser(user); setFormData(user); setIsModalOpen(true); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(user.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-slate-100"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">{user.fullName}</h3>
                            <p className="text-xs font-bold text-slate-400 font-mono">@{user.username}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.role === UserRole.ADMIN ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {user.role === UserRole.ADMIN ? 'ADMIN' : 'STAFF'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                {user.isActive ? 'កំពុងដំណើរការ' : 'ត្រូវបានផ្អាក'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto border-t border-slate-50 bg-slate-50/30 p-8 pt-6">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">សិទ្ធិប្រើប្រាស់ (Permissions)</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(user.permissions).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                    {value ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <X className="w-3.5 h-3.5 text-slate-200" />}
                                    <span className={`text-[10px] font-bold capitalize ${value ? 'text-slate-600' : 'text-slate-300 line-through'}`}>
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => toggleUserStatus(user)}
                            className={`w-full mt-8 flex items-center justify-center gap-3 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${user.isActive ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600' : 'bg-green-600 text-white shadow-lg shadow-green-100'}`}
                        >
                            {user.isActive ? <><UserMinus className="w-4 h-4" /> ផ្អាកដំណើរការ</> : <><UserCheck className="w-4 h-4" /> បើកដំណើរការ</>}
                        </button>
                    </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <History className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">កំណត់ហេតុសកម្មភាព</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">System Audit Logs</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest">
                        បង្ហាញ {filteredLogs.length} សកម្មភាព
                    </span>
                </div>
            </div>

            <div className="p-8 max-h-[700px] overflow-y-auto custom-scrollbar font-content">
                <div className="relative border-l-2 border-slate-100 ml-6 space-y-12 pb-8">
                    {filteredLogs.map((log, idx) => (
                        <div key={log.id} className="relative pl-12 group">
                            <div className={`absolute -left-[33px] top-0 w-16 h-16 rounded-3xl border-4 border-white shadow-lg flex items-center justify-center transition-all group-hover:scale-110 ${
                                log.module === 'Inventory' ? 'bg-orange-50 text-orange-600' :
                                log.module === 'Transactions' ? 'bg-blue-50 text-blue-600' :
                                log.module === 'Expenses' ? 'bg-red-50 text-red-600' :
                                log.module === 'Users' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                            }`}>
                                {log.module === 'Inventory' && <Package className="w-7 h-7" />}
                                {log.module === 'Transactions' && <ShoppingCart className="w-7 h-7" />}
                                {log.module === 'Expenses' && <Wallet className="w-7 h-7" />}
                                {/* Fixed: 'UsersIcon' to 'UserIcon' */}
                                {log.module === 'Users' && <UserIcon className="w-7 h-7" />}
                                {log.module === 'Settings' && <Settings2 className="w-7 h-7" />}
                            </div>
                            
                            <div className="bg-slate-50/50 group-hover:bg-white border border-transparent group-hover:border-slate-100 p-6 rounded-[2rem] transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <p className="font-black text-slate-800 text-base">{log.action}</p>
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                                            log.module === 'Inventory' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                                            log.module === 'Transactions' ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                            log.module === 'Expenses' ? 'bg-red-100 text-red-600 border-red-200' :
                                            log.module === 'Users' ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-slate-200 text-slate-600 border-slate-300'
                                        }`}>
                                            {log.module}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">{formatDate(log.timestamp)}</span>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-slate-500 font-bold leading-relaxed mb-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-inner italic">
                                    "{log.details}"
                                </p>
                                
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-800 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-sm">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                                        អ្នករៀបចំ: <span className="text-blue-600">{log.userName}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredLogs.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-300 opacity-50">
                            <History className="w-20 h-20 mb-6" />
                            <p className="text-xl font-black uppercase tracking-widest">មិនទាន់មានកំណត់ហេតុ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
                  <UserIcon className="w-7 h-7" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {editingUser ? 'កែប្រែគណនីបុគ្គលិក' : 'បង្កើតគណនីបុគ្គលិកថ្មី'}
                    </h3>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1">Access Control Information</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 transition-all group">
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">ឈ្មោះពេញ (Full Name)</label>
                            <input 
                                required
                                type="text" 
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold transition-all text-sm" 
                                placeholder="ឈ្មោះបុគ្គលិក"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">ឈ្មោះអ្នកប្រើប្រាស់ (Username)</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full pl-10 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold transition-all text-sm" 
                                    placeholder="username"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">លេខសម្ងាត់ (Password)</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    required={!editingUser}
                                    type="password" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold transition-all text-sm" 
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">តួនាទី (User Role)</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, role: UserRole.ADMIN})}
                                    className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.role === UserRole.ADMIN ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white hover:border-blue-400'}`}
                                >
                                    ADMIN
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, role: UserRole.STAFF})}
                                    className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.role === UserRole.STAFF ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-white hover:border-blue-400'}`}
                                >
                                    STAFF
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-blue-600" /> សិទ្ធិប្រើប្រាស់ (Access Rights)
                        </h4>
                        <div className="space-y-4">
                            {formData.permissions && Object.keys(formData.permissions).map((key) => (
                                <button 
                                    key={key}
                                    type="button"
                                    onClick={() => togglePermission(key as keyof UserPermissions)}
                                    className="w-full flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all group"
                                >
                                    <span className="text-xs font-bold text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    {formData.permissions?.[key as keyof UserPermissions] ? (
                                        <div className="w-10 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1 shadow-inner shadow-blue-800"><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                                    ) : (
                                        <div className="w-10 h-6 bg-slate-200 rounded-full flex items-center justify-start px-1 shadow-inner"><div className="w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 px-8 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                    >
                        បោះបង់
                    </button>
                    <button 
                        type="submit"
                        className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-3xl font-black text-base uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 active:scale-95"
                    >
                        {editingUser ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បង្កើតគណនី'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
