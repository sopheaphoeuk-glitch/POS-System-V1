
import React, { useState, useMemo } from 'react';
import { Product, BusinessInfo, UserAccount, UserRole } from '../types';
import { 
  Plus, Edit2, Trash2, X, Search, Filter, 
  Package, AlertCircle, Calendar as CalendarIcon, 
  ChevronDown, RotateCcw, Tag, ListFilter, BellRing, Clipboard, AlertTriangle, Download, Hash, DollarSign
} from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onAdd: (p: Product) => void;
  onUpdate: (p: Product) => void;
  onDelete: (id: string) => void;
  businessInfo: BusinessInfo;
  searchTerm: string;
  currentUser: UserAccount | null;
}

const Inventory: React.FC<InventoryProps> = ({ products, onAdd, onUpdate, onDelete, businessInfo, searchTerm, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ទាំងអស់');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatPrice = (amount: number) => {
    const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return businessInfo.currencyPosition === 'prefix' 
      ? `${businessInfo.currencySymbol}${formatted}` 
      : `${formatted} ${businessInfo.currencySymbol}`;
  };

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: '',
    sku: '',
    stock: 0,
    purchasePrice: 0,
    salePrice: 0,
    unit: 'ដប',
    lowStockThreshold: 5,
    batchNumber: '',
    expiryDate: ''
  });

  const categories = useMemo(() => {
    const defaultCats = ['ផ្លាស្ទិក', 'ផ្សេងៗ'];
    const productCats = products.map(p => p.category).filter(Boolean);
    const cats = new Set([...defaultCats, ...productCats]);
    return ['ទាំងអស់', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'ទាំងអស់' || p.category === selectedCategory;
      const isLowStock = p.stock <= (p.lowStockThreshold ?? 5);
      
      let matchesDate = true;
      if (p.createdAt) {
        const itemDate = new Date(p.createdAt);
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
      }

      if (showOnlyLowStock && !isLowStock) return false;
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [products, searchTerm, selectedCategory, showOnlyLowStock, startDate, endDate]);

  const exportToCSV = () => {
    const headers = ['ឈ្មោះទំនិញ', 'លេខកូដ (Code)', 'ប្រភេទ', 'ស្តុក', 'ខ្នាត', 'តម្លៃទិញ', 'តម្លៃលក់'];
    const rows = filteredProducts.map(p => [
      `"${p.name}"`, `"${p.sku}"`, `"${p.category}"`, p.stock, `"${p.unit}"`, p.purchasePrice, p.salePrice
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDelete(productToDelete.id);
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) onUpdate({ ...editingProduct, ...formData } as Product);
    else onAdd({ ...formData, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() } as Product);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ 
      name: '', 
      category: '', 
      sku: '', 
      stock: 0, 
      purchasePrice: 0, 
      salePrice: 0, 
      unit: 'ដប',
      lowStockThreshold: 5 
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">គ្រប់គ្រងបញ្ជីទំនិញ</h2>
          <p className="text-slate-500">គ្រប់គ្រងទិន្នន័យទំនិញ និងស្តុកក្នុងឃ្លាំង</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:text-blue-600 hover:border-blue-400 transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" /> នាំចេញ (CSV)
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus className="w-5 h-5" /> បន្ថែមទំនិញថ្មី
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className={`px-4 py-3 rounded-2xl text-xs font-black uppercase transition-all border ${showOnlyLowStock ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
          >
            ជិតអស់ស្តុក
          </button>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
              showFilters || startDate || endDate 
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
              : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            តម្រងកាលបរិច្ឆេទ
          </button>

          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 animate-in slide-in-from-top-2 duration-300">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ចាប់ពី (From):</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ដល់ (To):</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                />
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">ឈ្មោះទំនិញ / លេខកូដ</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">ប្រភេទ</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">ចំនួនក្នុងស្តុក</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">តម្លៃទិញ/លក់</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isLowStock = p.stock <= (p.lowStockThreshold ?? 5);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.sku || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-tight border border-blue-100">
                        {p.category || 'ទូទៅ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-black ${isLowStock ? 'text-red-500' : 'text-slate-700'}`}>
                          {p.stock} {p.unit}
                        </span>
                        {isLowStock && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[9px] font-black uppercase tracking-tighter border border-red-100 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" /> ស្តុកទាប
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400">ទិញ: {formatPrice(p.purchasePrice)}</span>
                        <span className="text-sm font-black text-blue-600">លក់: {formatPrice(p.salePrice)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingProduct(p); setFormData(p); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="កែប្រែ"><Edit2 className="w-4 h-4" /></button>
                        {currentUser?.role === UserRole.ADMIN && (
                          <button onClick={() => { setProductToDelete(p); setIsDeleteModalOpen(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="លុប"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 opacity-50">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-12 h-12 mb-3" />
                      <p className="font-bold uppercase tracking-widest text-xs">មិនមានទិន្នន័យត្រូវបានរកឃើញ</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-100">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">លុបទំនិញពីបញ្ជី?</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                តើអ្នកពិតជាចង់លុបទំនិញ <span className="text-red-600 font-black">"{productToDelete?.name}"</span> នេះមែនទេ? ការលុបនេះមិនអាចត្រឡប់វិញបានទេ។
              </p>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold transition-all hover:bg-slate-200">បោះបង់</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-200 transition-all hover:bg-red-700">យល់ព្រមលុប</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Entry/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                   <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    {editingProduct ? 'កែប្រែទិន្នន័យទំនិញ' : 'បន្ថែមទំនិញថ្មី'}
                  </h3>
                  <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Inventory Information</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ឈ្មោះទំនិញ (Product Name)</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all" 
                    placeholder="ឧ. សំបកដប ៥០០មល"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">លេខ កូត (Code/SKU)</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all" 
                      placeholder="ឧ. RB-001"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ប្រភេទ (Category)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      list="category-suggestions"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all" 
                      placeholder="ឧ. ផ្លាស្ទិក"
                    />
                  </div>
                  <datalist id="category-suggestions">
                    {categories.filter(c => c !== 'ទាំងអស់').map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ចំនួនក្នុងស្តុក</label>
                  <input 
                    required
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ខ្នាត (ឯកតា)</label>
                  <select 
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold transition-all cursor-pointer"
                  >
                    <option value="ដប">ដប</option>
                    <option value="កញ្ចប់">កញ្ចប់</option>
                    <option value="កេស">កេស</option>
                    <option value="ឡូ">ឡូ</option>
                    <option value="គីឡូ">គីឡូ</option>
                    <option value="បាវ">បាវ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">តម្លៃទិញចូល ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black transition-all" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">តម្លៃលក់ចេញ ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({...formData, salePrice: Number(e.target.value)})}
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black transition-all" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <BellRing className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">កម្រិតស្តុកទាបសម្រាប់ព្រមាន</label>
                      <input 
                        type="number" 
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData({...formData, lowStockThreshold: Number(e.target.value)})}
                        className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-black transition-all" 
                      />
                    </div>
                  </div>
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
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                >
                  {editingProduct ? 'រក្សាទុកការកែប្រែ' : 'បន្ថែមទំនិញ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
