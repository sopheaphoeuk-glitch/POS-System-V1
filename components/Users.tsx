
import React, { useState, useMemo } from 'react';
import { UserAccount, UserRole, UserPermissions, AuditLog } from '../types';
import { 
  Plus, Edit2, Trash2, X, Search, ShieldCheck, 
  UserCheck, ShieldAlert, Settings2, 
  LayoutDashboard, Package, ShoppingCart, Wallet, 
  BarChart3, Lock, ClipboardX, Filter, Calendar as CalendarIcon,
  RotateCcw, ListFilter, ChevronDown, Check, Eye, EyeOff, Activity, Clock, Info
} from 'lucide-react';

interface UsersProps {
  users: UserAccount[];
  onAdd: (u: UserAccount) => void;
  onUpdate: (u: UserAccount) => void;
  onDelete: (id: string) => void;
  auditLogs: AuditLog[];
}

const Users: React.FC<UsersProps> = ({ users, onAdd, onUpdate, onDelete, auditLogs }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [logSearchTerm, setLogSearchTerm] = useState('');
  const [selectedLogUser, setSelectedLogUser] = useState('all');
  const [selectedLogModule, setSelectedLogModule] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const defaultPermissions: UserPermissions = {
    dashboard: true,
    inventory: true,
    stockIn: false,
    stockOut: true,
    otherStockOut: false,
    expenses: false,
    reports: false
  };

  const [formData, setFormData] = useState<Partial<UserAccount>>({
    username: '',
    password: '',
    fullName: '',
    role: UserRole.STAFF,
    isActive: true,
    permissions: { ...defaultPermissions }
  });

  const setDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const handleReset = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdate({ ...editingUser, ...formData } as UserAccount);
    } else {
      onAdd({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
      } as UserAccount);
    }
    closeModal();
  };

  const openModal = (u?: UserAccount) => {
    if (u) {
      setEditingUser(u);
      setFormData(u);
    } else {
      setEditingUser(null);
      setFormData({
        username: '', 
        password: '', 
        fullName: '', 
        role: UserRole.STAFF, 
        isActive: true,
        permissions: { ...defaultPermissions }
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const togglePermission = (key: keyof UserPermissions) => {
    const currentPerms = formData.permissions || { ...defaultPermissions };
    setFormData({
      ...formData,
      permissions: {
        ...currentPerms,
        [key]: !currentPerms[key]
      }
    });
  };

  const handleSelectAllPermissions = (selectAll: boolean) => {
      const keys = Object.keys(defaultPermissions) as (keyof UserPermissions)[];
      const newPerms = { ...defaultPermissions };
      keys.forEach(k => newPerms[k] = selectAll);
      setFormData({ ...formData, permissions: newPerms });
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.username.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (u.createdAt) {
        const itemDate = new Date(u.createdAt);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (itemDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) matchesDate = false;
        }
      } else if (startDate || endDate) {
        matchesDate = false;
      }

      return matchesSearch && matchesDate;
    });
  }, [users, searchTerm, startDate, endDate]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(logSearchTerm.toLowerCase()) || 
                           log.details.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
                           log.userName.toLowerCase().includes(logSearchTerm.toLowerCase());
      const matchesUser = selectedLogUser === 'all' || log.userId === selectedLogUser;
      const matchesModule = selectedLogModule === 'all' || log.module === selectedLogModule;
      return matchesSearch && matchesUser && matchesModule;
    });
  }, [auditLogs, logSearchTerm, selectedLogUser, selectedLogModule]);

  const permissionItems = [
    { key: 'dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', desc: 'មើលស្ថិតិរួម និងចំណូលចំណាយ', icon: LayoutDashboard, color: 'text-blue-500' },
    { key: 'inventory', label: 'បញ្ជីទំនិញ', desc: 'គ្រប់គ្រងទិន្នន័យ និងស្តុកទំនិញ', icon: Package, color: 'text-orange-500' },
    { key: 'stockIn', label: 'ទិញចូល (Stock In)', desc: 'កត់ត្រាទំនិញចូល និងបញ្ជាទិញ', icon: Plus, color: 'text-blue-600' },
    { key: 'stockOut', label: 'លក់ចេញ (Stock Out)', desc: 'កត់ត្រាការលក់ និងបោះពុម្ពវិក្កយបត្រ', icon: ShoppingCart, color: 'text-green-600' },
    { key: 'otherStockOut', label: 'កាត់ស្តុកផ្សេងៗ', desc: 'ដកទំនិញខូច ឬប្រើប្រាស់ផ្ទាល់ខ្លួន', icon: ClipboardX, color: 'text-orange-600' },
    { key: 'expenses', label: 'ចំណាយផ្សេងៗ', desc: 'គ្រប់គ្រងការចំណាយប្រតិបត្តិការ', icon: Wallet, color: 'text-red-500' },
    { key: 'reports', label: 'របាយការណ៍', desc: 'មើល និងទាញយករបាយការណ៍លម្អិត', icon: BarChart3, color: 'text-indigo-500' },
  ];

  const getModuleIcon = (module: AuditLog['module']) => {
    switch (module) {
      case 'Inventory': return <Package className="w-4 h-4" />;
      case 'Transactions': return <ShoppingCart className="w-4 h-4" />;
      case 'Expenses': return <Wallet className="w-4 h-4" />;
      case 'Users': return <UserCheck className="w-4 h-4" />;
      case 'Settings': return <Settings2 className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getModuleColor = (module: AuditLog['module']) => {
    switch (module) {
      case 'Inventory': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Transactions': return 'bg-green-50 text-green-600 border-green-100';
      case 'Expenses': return 'bg-red-50 text-red-600 border-red-100';
      case 'Users': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Settings': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const allSelected = useMemo(() => {
    if (!formData.permissions) return false;
    return Object.values(formData.permissions).every(v => v === true);
  }, [formData.permissions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">គ្រប់គ្រងបុគ្គលិក និងសិទ្ធិ</h2>
          <p className="text-slate-500 text-sm">បង្កើត កែប្រែ Password និងកំណត់សិទ្ធិប្រើប្រាស់</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-200 shadow-sm active:scale-95"
          >
            <Activity className="w-5 h-5 text-indigo-500" />
            កំណត់ហេតុសកម្មភាព
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            បន្ថែមបុគ្គលិកថ្មី
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="ស្វែងរកឈ្មោះ ឬ ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                  showFilters || startDate || endDate 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                  : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                តម្រង
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              {(searchTerm || startDate || endDate) && (
                <button 
                  onClick={handleReset}
                  className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-5 bg-white border border-slate-200 rounded-2xl animate-in slide-in-from-top-2 duration-300 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ចាប់ពី:</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ដល់:</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setDatePreset(0)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 hover:bg-indigo-600 hover:text-white transition-all">ថ្ងៃនេះ</button>
                <button onClick={() => setDatePreset(7)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 hover:bg-indigo-600 hover:text-white transition-all">៧ ថ្ងៃ</button>
                <button onClick={() => setDatePreset(30)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 hover:bg-indigo-600 hover:text-white transition-all">៣០ ថ្ងៃ</button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
            <ListFilter className="w-3 h-3" />
            រកឃើញ: <span className="text-indigo-600">{filteredUsers.length} បុគ្គលិក</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">ឈ្មោះបុគ្គលិក</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">ឈ្មោះ ID</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">តួនាទី</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">សិទ្ធិចូលប្រើ</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${u.role === UserRole.ADMIN ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {u.role === UserRole.ADMIN ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{u.fullName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                          <p className={`text-[9px] font-black uppercase tracking-tighter ${u.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {u.isActive ? 'កំពុងដំណើរការ' : 'ផ្អាកដំណើរការ'}
                          </p>
                          {u.createdAt && (
                            <span className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                              • <CalendarIcon className="w-2.5 h-2.5" /> 
                              {new Date(u.createdAt).toLocaleDateString('km-KH')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] text-indigo-500 font-black">@{u.username}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${u.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {u.role === UserRole.ADMIN ? 'Admin' : 'Staff'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {u.role === UserRole.ADMIN ? (
                        <span className="text-[9px] text-indigo-600 font-black uppercase tracking-tighter bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">សិទ្ធិពេញលេញ</span>
                      ) : (
                        permissionItems.filter(item => u.permissions?.[item.key as keyof UserPermissions]).map(item => (
                          <span key={item.key} className="p-1.5 bg-slate-100 rounded-lg text-slate-500 border border-slate-200" title={item.label}>
                            <item.icon className="w-3.5 h-3.5" />
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(u)}
                        className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="កែប្រែទិន្នន័យ"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(u.id)}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="លុបគណនី"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-20">
                      <UserCheck className="w-12 h-12 mb-3" />
                      <p className="font-black uppercase tracking-widest text-xs">មិនមានអ្នកប្រើប្រាស់បង្ហាញ</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">កំណត់ហេតុសកម្មភាពប្រព័ន្ធ</h3>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">System Audit Log & Activity Timeline</p>
                </div>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border-b border-slate-100 bg-white grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative col-span-1 md:col-span-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ស្វែងរកសកម្មភាព..."
                  value={logSearchTerm}
                  onChange={(e) => setLogSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <select 
                value={selectedLogUser}
                onChange={(e) => setSelectedLogUser(e.target.value)}
                className="px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">បុគ្គលិកទាំងអស់</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
              <select 
                value={selectedLogModule}
                onChange={(e) => setSelectedLogModule(e.target.value)}
                className="px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">គ្រប់ផ្នែកទាំងអស់</option>
                <option value="Inventory">បញ្ជីទំនិញ</option>
                <option value="Transactions">ប្រតិបត្តិការ</option>
                <option value="Expenses">ចំណាយ</option>
                <option value="Users">អ្នកប្រើប្រាស់</option>
                <option value="Settings">ការកំណត់</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
              {filteredLogs.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="relative pl-12 group">
                      <div className={`absolute left-0 top-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 z-10 transition-transform group-hover:scale-110 ${getModuleColor(log.module)} bg-white`}>
                        {getModuleIcon(log.module)}
                      </div>
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group-hover:border-indigo-200 transition-all group-hover:bg-white group-hover:shadow-md">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-800">{log.action}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${getModuleColor(log.module)}`}>
                              {log.module}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                            <Clock className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleString('km-KH', { 
                              year: 'numeric', month: 'short', day: 'numeric', 
                              hour: '2-digit', minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mb-3">{log.details}</p>
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                              {log.userName.charAt(0)}
                           </div>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ដោយ: {log.userName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Activity className="w-20 h-20 mb-4" />
                  <p className="font-black uppercase tracking-[0.2em]">មិនមានកំណត់ហេតុត្រូវបានរកឃើញ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    {editingUser ? 'កែប្រែព័ត៌មាន និងសិទ្ធិ' : 'ចុះឈ្មោះបុគ្គលិកថ្មី'}
                  </h3>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">User Access & Granular Permissions</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                <div className="md:col-span-2 space-y-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3">
                    <UserCheck className="w-4 h-4 text-indigo-600" /> ១. ព័ត៌មានគណនី
                  </h4>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">ឈ្មោះពេញបុគ្គលិក</label>
                    <input 
                      required
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold" 
                      placeholder="ឧ. សុខ ចាន់ថា"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">ID Login</label>
                      <input 
                        required
                        type="text" 
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-indigo-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type={showPassword ? 'text' : 'password'} 
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono font-bold" 
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider">កំណត់តួនាទី (Role)</label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, role: UserRole.STAFF})}
                            className={`py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${formData.role === UserRole.STAFF ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            Staff
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, role: UserRole.ADMIN})}
                            className={`py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${formData.role === UserRole.ADMIN ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                        >
                            Admin
                        </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-wider">ស្ថានភាពគណនី</label>
                        <p className="text-[10px] text-slate-400 font-bold">{formData.isActive ? 'កំពុងដំណើរការជាធម្មតា' : 'គណនីត្រូវបានផ្អាក'}</p>
                    </div>
                    <div 
                      onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${formData.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${formData.isActive ? 'left-7' : 'left-1'}`}></div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" /> ២. កំណត់សិទ្ធិប្រើប្រាស់ (Granular Control)
                    </h4>
                    {formData.role !== UserRole.ADMIN && (
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => handleSelectAllPermissions(true)}
                                className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md transition-all ${allSelected ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-100'}`}
                            >
                                រើសទាំងអស់
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleSelectAllPermissions(false)}
                                className="text-[10px] font-black uppercase tracking-tighter px-2 py-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                            >
                                លុបទាំងអស់
                            </button>
                        </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 h-[420px] overflow-y-auto custom-scrollbar">
                    {formData.role === UserRole.ADMIN ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h5 className="text-lg font-black text-slate-800 mb-2">សិទ្ធិគ្រប់គ្រងពេញលេញ (Full Access)</h5>
                        <p className="text-sm text-slate-500 font-medium max-w-xs">ក្នុងនាមជា Admin អ្នកប្រើប្រាស់នេះមានសិទ្ធិចូលទៅកាន់គ្រប់ផ្នែកទាំងអស់នៃប្រព័ន្ធដោយមិនមានការកម្រិត។</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {permissionItems.map((item) => (
                          <div 
                            key={item.key} 
                            onClick={() => togglePermission(item.key as keyof UserPermissions)}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                              formData.permissions?.[item.key as keyof UserPermissions] 
                              ? 'border-indigo-600 bg-white shadow-md' 
                              : 'border-transparent bg-white/40 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl shadow-sm ${formData.permissions?.[item.key as keyof UserPermissions] ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                                <item.icon className={`w-5 h-5 ${formData.permissions?.[item.key as keyof UserPermissions] ? item.color : 'text-slate-400'}`} />
                              </div>
                              <div>
                                <span className={`text-xs font-black uppercase tracking-tight block ${formData.permissions?.[item.key as keyof UserPermissions] ? 'text-slate-800' : 'text-slate-400'}`}>
                                  {item.label}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">{item.desc}</span>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              formData.permissions?.[item.key as keyof UserPermissions] 
                              ? 'bg-indigo-600 border-indigo-600' 
                              : 'bg-transparent border-slate-200'
                            }`}>
                              {formData.permissions?.[item.key as keyof UserPermissions] && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-10 flex gap-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-4 border border-slate-200 rounded-2xl font-black text-xs text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transform transition-all active:scale-[0.98]"
                >
                  {editingUser ? 'រក្សាទុកការកែប្រែ' : 'បង្កើតគណនីថ្មី'}
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
