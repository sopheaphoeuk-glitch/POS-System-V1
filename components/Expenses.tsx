
import React, { useState, useMemo } from 'react';
import { Expense, BusinessInfo, UserAccount, UserRole } from '../types';
import { Plus, Wallet, Trash2, Calendar, Search, X, Filter, RotateCcw, ListFilter, ChevronDown, Hash, MessageSquare } from 'lucide-react';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
  currentUser: UserAccount | null;
  businessInfo: BusinessInfo;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAddExpense, onDeleteExpense, currentUser, businessInfo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    category: 'ចំណាយទូទៅ',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    note: ''
  });

  const formatPrice = (amount: number) => {
    const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return businessInfo.currencyPosition === 'prefix' 
      ? `${businessInfo.currencySymbol}${formatted}` 
      : `${formatted} ${businessInfo.currencySymbol}`;
  };

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
    if (!formData.description || !formData.amount) return;

    onAddExpense({
      id: `EXP-${Date.now()}`,
      description: formData.description,
      category: formData.category,
      amount: Number(formData.amount),
      date: new Date(formData.date).toISOString(),
      invoiceNumber: formData.invoiceNumber,
      note: formData.note
    });

    setFormData({
      description: '',
      category: 'ចំណាយទូទៅ',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      note: ''
    });
    setIsModalOpen(false);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (e.note && e.note.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesDate = true;
      const itemDate = new Date(e.date);
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

      return matchesSearch && matchesDate;
    });
  }, [expenses, searchTerm, startDate, endDate]);

  const totalExpensesAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ចំណាយផ្សេងៗ</h2>
          <p className="text-slate-500">កត់ត្រារាល់ការចំណាយក្រៅពីការទិញទំនិញស្តុក</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          បន្ថែមការចំណាយ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-0 rounded-3xl border border-slate-100 shadow-sm col-span-1 md:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ស្វែងរកការចំណាយ លេខវិក្កយបត្រ ឬកំណត់សម្គាល់..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    showFilters || startDate || endDate 
                    ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-100' 
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
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ដល់:</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setDatePreset(0)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 hover:bg-red-600 hover:text-white transition-all">ថ្ងៃនេះ</button>
                  <button onClick={() => setDatePreset(7)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 hover:bg-red-600 hover:text-white transition-all">៧ ថ្ងៃ</button>
                  <button onClick={() => setDatePreset(30)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 hover:bg-red-600 hover:text-white transition-all">៣០ ថ្ងៃ</button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
              <ListFilter className="w-3 h-3" />
              រកឃើញ: <span className="text-red-600">{filteredExpenses.length} ប្រតិបត្តិការ</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">ពិពណ៌នា / កំណត់សម្គាល់</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">ប្រភេទ</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">កាលបរិច្ឆេទ</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">ទឹកប្រាក់</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="font-bold text-slate-800 text-sm">{e.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {e.invoiceNumber && (
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                              <Hash className="w-2.5 h-2.5" /> {e.invoiceNumber}
                            </span>
                          )}
                          {e.note && (
                            <span className="text-[10px] text-blue-500 font-medium flex items-center gap-1">
                              <MessageSquare className="w-2.5 h-2.5" /> {e.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-tight border border-red-100">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-slate-500 font-bold">
                      {new Date(e.date).toLocaleDateString('km-KH')}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-red-600 text-sm">
                      {formatPrice(e.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Admin-only Delete Button */}
                      {currentUser?.role === UserRole.ADMIN && (
                        <button 
                          onClick={() => onDeleteExpense(e.id)}
                          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-20">
                        <Wallet className="w-12 h-12 mb-3" />
                        <p className="font-black uppercase tracking-widest text-xs">មិនទាន់មានការចំណាយបង្ហាញ</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-red-600 p-8 rounded-3xl text-white shadow-xl shadow-red-100 border border-red-500/20">
            <h4 className="text-red-100 text-[10px] font-black mb-1 uppercase tracking-[0.2em]">សរុបការចំណាយទាំងអស់</h4>
            <p className="text-4xl font-black mb-6 tracking-tighter">{formatPrice(totalExpensesAmount)}</p>
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div>
                <p className="text-[10px] text-red-200 uppercase font-black tracking-widest">ចំនួនប្រតិបត្តិការ</p>
                <p className="font-black text-2xl tracking-tighter">{filteredExpenses.length}</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Wallet className="w-7 h-7" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">ចំណាំ</h4>
             <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
               * ការចំណាយទាំងនេះមិនរាប់បញ្ចូលថ្លៃដើមទិញទំនិញចូលស្តុកឡើយ។ ពួកវាជាចំណាយរដ្ឋបាល ឬប្រតិបត្តិការទូទៅ។
             </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-100">
                    <Wallet className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">បន្ថែមការចំណាយ</h3>
                   <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Expense Logging</p>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ការពិពណ៌នា (Description)</label>
                <input 
                  required
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold transition-all" 
                  placeholder="ឧ. បង់ថ្លៃទឹក ភ្លើង"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">លេខវិក្កយបត្រ (Invoice #)</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold transition-all" 
                      placeholder="ឧ. INV-123"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ប្រភេទចំណាយ (Category)</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold transition-all cursor-pointer"
                  >
                    <option value="ចំណាយទូទៅ">ចំណាយទូទៅ</option>
                    <option value="ទឹកភ្លើង & អ៊ីនធឺណិត">ទឹកភ្លើង & អ៊ីនធឺណិត</option>
                    <option value="ដឹកជញ្ជូន">ដឹកជញ្ជូន</option>
                    <option value="ជួសជុល">ជួសជុល</option>
                    <option value="ប្រាក់បៀវត្ស">ប្រាក់បៀវត្ស</option>
                    <option value="អាហារ">អាហារ</option>
                    <option value="ធនាគារ">ធនាគារ</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">កំណត់សម្គាល់ (Note)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold transition-all h-24 resize-none" 
                    placeholder="បញ្ជាក់ព័ត៌មានបន្ថែមប្រសិនបើមាន..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ទឹកប្រាក់ ({businessInfo.currencySymbol})</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-black transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">កាលបរិច្ឆេទ</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none font-bold transition-all" 
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                >
                  បោះបង់
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 shadow-xl shadow-red-100 transition-all active:scale-[0.98]"
                >
                  កត់ត្រាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
