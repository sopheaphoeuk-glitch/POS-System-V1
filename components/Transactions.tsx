
import React, { useState, useMemo } from 'react';
import { Product, Transaction, TransactionType, TransactionItem, BusinessInfo, UserAccount, UserRole } from '../types';
import { 
  Plus, ShoppingCart, Truck, Search, User, Calendar, Trash2, 
  Printer, FileText, CheckCircle2, ChevronRight, X, FileSearch, 
  Percent, DollarSign, Filter, RotateCcw, ChevronDown, ListFilter, ClipboardList, Clipboard, CheckSquare, Square
} from 'lucide-react';
import Invoice from './Invoice';

interface TransactionsProps {
  type: TransactionType;
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  currentUser: UserAccount | null;
  businessInfo: BusinessInfo;
}

const Transactions: React.FC<TransactionsProps> = ({ type, products, transactions, onAddTransaction, onDeleteTransaction, currentUser, businessInfo }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentItems, setCurrentItems] = useState<TransactionItem[]>([]);
  const [partyName, setPartyName] = useState('');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<Transaction | Transaction[] | null>(null);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Selection state for batch printing
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Specific fields for items being added
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Specific for Purchase mode
  const [purchaseSubMode, setPurchaseSubMode] = useState<'STOCK_IN' | 'PO'>(type === TransactionType.PURCHASE ? 'STOCK_IN' : 'STOCK_IN');

  // Discount states
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Use current product's batch/expiry if user didn't provide new ones for Sale
    const finalBatch = batchNumber || (type === TransactionType.SALE ? product.batchNumber : '');
    const finalExpiry = expiryDate || (type === TransactionType.SALE ? product.expiryDate : '');

    const existing = currentItems.find(i => i.productId === product.id && i.batchNumber === finalBatch);
    if (existing) {
      setCurrentItems(currentItems.map(i => (i.productId === product.id && i.batchNumber === finalBatch) ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      setCurrentItems([...currentItems, {
        productId: product.id,
        productName: product.name,
        quantity,
        price: type === TransactionType.SALE ? product.salePrice : product.purchasePrice,
        batchNumber: finalBatch,
        expiryDate: finalExpiry
      }]);
    }
    setQuantity(1);
    setSelectedProduct('');
    setBatchNumber('');
    setExpiryDate('');
  };

  const removeItem = (id: string, batch?: string) => {
    setCurrentItems(currentItems.filter(i => !(i.productId === id && i.batchNumber === batch)));
  };

  const setDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const handleReset = () => {
    setHistorySearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const subTotal = currentItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const calculatedDiscountAmount = discountType === 'percentage' 
    ? (subTotal * discountValue) / 100 
    : discountValue;

  const totalAmount = Math.max(0, subTotal - calculatedDiscountAmount);

  const handleFinalize = () => {
    if (currentItems.length === 0) return;

    const nextNum = (transactions.length + 1).toString().padStart(7, '0');
    
    let actualType = type;
    let idPrefix = type === TransactionType.SALE ? 'SL' : 'PR';
    let initialStatus: Transaction['status'] = undefined;

    if (type === TransactionType.PURCHASE && purchaseSubMode === 'PO') {
        actualType = TransactionType.PURCHASE_ORDER;
        idPrefix = 'PO';
        initialStatus = 'Pending';
    }

    const newId = `${idPrefix}-${nextNum}`;

    const newTransaction: Transaction = {
      id: newId,
      type: actualType,
      status: initialStatus,
      date: new Date().toISOString(),
      items: currentItems,
      subTotal,
      discountType,
      discountValue,
      discountAmount: calculatedDiscountAmount,
      totalAmount,
      customerOrSupplierName: partyName || (type === TransactionType.SALE ? 'អតិថិជន' : 'អ្នកផ្គត់ផ្គង់ទូទៅ')
    };

    onAddTransaction(newTransaction);
    setIsFormOpen(false);
    setCurrentItems([]);
    setPartyName('');
    setDiscountValue(0);
    
    // Auto-open print preview for Sales and POs
    if (type === TransactionType.SALE || actualType === TransactionType.PURCHASE_ORDER) {
      setSelectedInvoices(newTransaction);
      setIsInvoiceOpen(true);
    }
  };

  const filteredHistory = useMemo(() => {
    return transactions.filter(t => {
      // Basic type filter (only relevant for Purchase tab where we show both PO and Entry)
      if (type === TransactionType.PURCHASE) {
        if (purchaseSubMode === 'STOCK_IN' && t.type !== TransactionType.PURCHASE) return false;
        if (purchaseSubMode === 'PO' && t.type !== TransactionType.PURCHASE_ORDER) return false;
      }

      const matchesSearch = t.customerOrSupplierName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                            t.id.toLowerCase().includes(historySearchTerm.toLowerCase());
      
      let matchesDate = true;
      const itemDate = new Date(t.date);
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
  }, [transactions, historySearchTerm, startDate, endDate, purchaseSubMode, type]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedIds.size === filteredHistory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredHistory.map(t => t.id)));
    }
  };

  const handleBatchPrint = () => {
    const selectedTransactions = filteredHistory.filter(t => selectedIds.has(t.id));
    if (selectedTransactions.length === 0) return;
    setSelectedInvoices(selectedTransactions);
    setIsInvoiceOpen(true);
  };

  const activeTypeName = type === TransactionType.SALE ? 'លក់ចេញ' : (purchaseSubMode === 'PO' ? 'បញ្ជាទិញ' : 'ទិញចូល');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {type === TransactionType.SALE ? 'លក់ចេញ (Sales & Invoices)' : 'ទិញចូល និងបញ្ជាទិញ (Purchases & PO)'}
          </h2>
          <p className="text-slate-500">
            {type === TransactionType.SALE 
                ? 'គ្រប់គ្រងការលក់ និងចេញវិក័យបត្រជូនអតិថិជន' 
                : 'គ្រប់គ្រងការទិញទំនិញចូលស្តុក ឬបង្កើតបញ្ជាទិញ (PO)'}
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
            type === TransactionType.SALE 
            ? 'bg-green-600 text-white shadow-green-100 hover:bg-green-700' 
            : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'
          }`}
        >
          <Plus className="w-5 h-5" />
          {type === TransactionType.SALE 
            ? 'បង្កើតវិក័យបត្រថ្មី' 
            : (purchaseSubMode === 'PO' ? 'បង្កើតបញ្ជាទិញ (PO)' : 'កត់ត្រាការទិញចូល')}
        </button>
      </div>

      {type === TransactionType.PURCHASE && (
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit">
              <button 
                onClick={() => setPurchaseSubMode('STOCK_IN')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${purchaseSubMode === 'STOCK_IN' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  <Truck className="w-4 h-4" />
                  ទិញចូលស្តុក
              </button>
              <button 
                onClick={() => setPurchaseSubMode('PO')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${purchaseSubMode === 'PO' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  <ClipboardList className="w-4 h-4" />
                  បញ្ជាទិញ (PO)
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
                    <FileText className="w-4 h-4 text-blue-500" />
                    ប្រវត្តិនៃការ{activeTypeName}
                    </h3>
                    {selectedIds.size > 0 && (
                        <button 
                            onClick={handleBatchPrint}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300 shadow-lg shadow-blue-200"
                        >
                            <Printer className="w-3.5 h-3.5" /> បោះពុម្ពដែលបានជ្រើស ({selectedIds.size})
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-1 max-w-xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="ស្វែងរកតាមឈ្មោះ ឬ ID..."
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                      showFilters || startDate || endDate 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                      : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    តម្រង
                    <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                  {(historySearchTerm || startDate || endDate) && (
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
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ដល់:</label>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setDatePreset(0)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 hover:bg-blue-600 hover:text-white transition-all">ថ្ងៃនេះ</button>
                    <button onClick={() => setDatePreset(7)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 hover:bg-blue-600 hover:text-white transition-all">៧ ថ្ងៃ</button>
                    <button onClick={() => setDatePreset(30)} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 hover:bg-blue-600 hover:text-white transition-all">៣០ ថ្ងៃ</button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <ListFilter className="w-3 h-3" />
                    រកឃើញ: <span className="text-blue-600">{filteredHistory.length} ប្រតិបត្តិការ</span>
                </div>
                {filteredHistory.length > 0 && (
                    <button 
                        onClick={toggleAllSelection}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                        {selectedIds.size === filteredHistory.length ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                        {selectedIds.size === filteredHistory.length ? 'ដកជម្រើសទាំងអស់' : 'ជ្រើសយកទាំងអស់'}
                    </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
              {filteredHistory.map((t) => (
                <div 
                    key={t.id} 
                    className={`p-4 transition-all flex items-center justify-between group cursor-pointer ${selectedIds.has(t.id) ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                    onClick={() => toggleSelection(t.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-1 transition-colors ${selectedIds.has(t.id) ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}>
                        {selectedIds.has(t.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                        t.type === TransactionType.SALE ? 'bg-green-50 text-green-600 border border-green-100' : 
                        (t.type === TransactionType.PURCHASE_ORDER ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-blue-50 text-blue-600 border border-blue-100')
                    }`}>
                      {t.type === TransactionType.SALE ? <ShoppingCart className="w-5 h-5" /> : (t.type === TransactionType.PURCHASE_ORDER ? <ClipboardList className="w-5 h-5" /> : <Truck className="w-5 h-5" />)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {t.customerOrSupplierName}
                        <span className="text-[9px] bg-white border border-slate-100 px-1 py-0.5 rounded text-slate-400 uppercase tracking-tighter">#{t.id}</span>
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(t.date).toLocaleDateString('km-KH')}</span>
                        <span>•</span>
                        <span className="text-blue-500 font-bold">{t.items.length} មុខទំនិញ</span>
                        {t.type === TransactionType.PURCHASE_ORDER && (
                            <span className="bg-indigo-50 text-indigo-500 px-2 rounded-lg text-[8px] font-black uppercase">PO Only</span>
                        )}
                        {t.status && (
                            <span className={`px-2 rounded-lg text-[8px] font-black uppercase ${
                                t.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                                t.status === 'Received' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                            }`}>
                                {t.status}
                            </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                      <p className="text-sm font-black text-slate-900">${t.totalAmount.toFixed(2)}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{t.type === TransactionType.PURCHASE_ORDER ? 'Draft Order' : 'Paid Full'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedInvoices(t); setIsInvoiceOpen(true); }}
                        className="flex items-center gap-2 px-3 py-2 bg-white text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-bold text-xs border border-blue-100 shadow-sm"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden md:inline text-[10px]">បោះពុម្ព</span>
                      </button>
                      
                      {/* Admin-only Delete Button */}
                      {currentUser?.role === UserRole.ADMIN && onDeleteTransaction && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteTransaction(t.id); }}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                          title="លុបប្រតិបត្តិការ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredHistory.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center justify-center text-slate-400">
                   <FileSearch className="w-12 h-12 mb-4 opacity-20" />
                   <p className="font-bold uppercase tracking-[0.2em] text-[10px]">មិនមានទិន្នន័យត្រូវបានរកឃើញ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`p-6 rounded-3xl text-white shadow-2xl ${
                type === TransactionType.SALE 
                ? 'bg-gradient-to-br from-green-500 to-emerald-700 shadow-green-100' 
                : (purchaseSubMode === 'PO' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-100' : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-100')
            }`}>
            <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">សរុបការ{activeTypeName}</h4>
            <p className="text-4xl font-black mb-6 tracking-tighter">${transactions.filter(t => {
                if (type === TransactionType.PURCHASE) {
                    return purchaseSubMode === 'STOCK_IN' ? t.type === TransactionType.PURCHASE : t.type === TransactionType.PURCHASE_ORDER;
                }
                return t.type === TransactionType.SALE;
            }).reduce((a, b) => a + b.totalAmount, 0).toFixed(2)}</p>
            <div className="flex items-center justify-between pt-6 border-t border-white/20">
              <div>
                <p className="text-[10px] text-white/60 font-bold uppercase">ចំនួន{purchaseSubMode === 'PO' ? 'បញ្ជាទិញ' : 'វិក័យបត្រ'}</p>
                <p className="text-xl font-black">{transactions.filter(t => {
                if (type === TransactionType.PURCHASE) {
                    return purchaseSubMode === 'STOCK_IN' ? t.type === TransactionType.PURCHASE : t.type === TransactionType.PURCHASE_ORDER;
                }
                return t.type === TransactionType.SALE;
            }).length}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">ព័ត៌មានបន្ថែម</h4>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Printer className="w-4 h-4" />
                   </div>
                   <p className="text-xs font-medium text-slate-600 leading-relaxed">ចុចលើប៊ូតុង <span className="text-blue-600 font-bold">បោះពុម្ព</span> ដើម្បីមើលវិក្កយបត្រ ឬបញ្ជាទិញឡើងវិញ។</p>
                </div>
                {purchaseSubMode === 'PO' ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <ClipboardList className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">បញ្ជាទិញ (PO) <span className="text-indigo-600 font-bold">មិនមានការកើនឡើងស្តុកទេ</span> រហូតដល់ទំនិញត្រូវបានបញ្ចូលជាផ្លូវការ។</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">រាល់ការ{type === TransactionType.SALE ? 'លក់ចេញ' : 'ទិញចូល'} នឹងធ្វើការកាត់ ឬបន្ថែមក្នងស្តុកដោយស្វ័យប្រវត្តិ។</p>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-6 border-b border-slate-100 flex items-center justify-between ${type === TransactionType.SALE ? 'bg-green-50/50' : 'bg-blue-50/50'}`}>
              <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                      type === TransactionType.SALE ? 'bg-green-600 shadow-green-100' : (purchaseSubMode === 'PO' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-blue-600 shadow-blue-100')
                  }`}>
                    {type === TransactionType.SALE ? <ShoppingCart className="w-6 h-6" /> : (purchaseSubMode === 'PO' ? <ClipboardList className="w-6 h-6" /> : <Truck className="w-6 h-6" />)}
                  </div>
                  <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">
                        {type === TransactionType.SALE ? 'បង្កើតវិក័យបត្រលក់ថ្មី' : (purchaseSubMode === 'PO' ? 'បង្កើតបញ្ជាទិញ (PO)' : 'កត់ត្រាការទិញទំនិញចូល')}
                      </h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${type === TransactionType.SALE ? 'text-green-600' : 'text-blue-600'}`}>
                          {type === TransactionType.SALE ? 'New Sales Invoice' : (purchaseSubMode === 'PO' ? 'New Purchase Order Document' : 'New Stock Receipt')}
                      </p>
                  </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-6 border-r border-slate-100 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                    {type === TransactionType.SALE ? 'ឈ្មោះអតិថិជន / Customer' : 'ឈ្មោះអ្នកផ្គត់ផ្គង់ / Supplier'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      placeholder={type === TransactionType.SALE ? 'ឧ. អតិថិជនទូទៅ' : 'ឧ. ក្រុមហ៊ុនចែកចាយ'}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-4 ${type === TransactionType.SALE ? 'bg-green-50/50 border-green-100' : 'bg-blue-50/50 border-blue-100'}`}>
                  <h4 className={`text-sm font-black uppercase tracking-wider ${type === TransactionType.SALE ? 'text-green-800' : 'text-blue-800'}`}>ជ្រើសរើសទំនិញ</h4>
                  <div>
                    <label className={`block text-[10px] font-bold mb-1.5 uppercase ${type === TransactionType.SALE ? 'text-green-400' : 'text-blue-400'}`}>ស្វែងរកទំនិញក្នុងស្តុក</label>
                    <select 
                      value={selectedProduct}
                      onChange={(e) => {
                          const id = e.target.value;
                          setSelectedProduct(id);
                          const p = products.find(prod => prod.id === id);
                          if (p && type === TransactionType.SALE) {
                              setBatchNumber(p.batchNumber || '');
                              setExpiryDate(p.expiryDate || '');
                          }
                      }}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                    >
                      <option value="">-- រើសទំនិញ --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (នៅសល់: {p.stock} {p.unit})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-[10px] font-bold mb-1.5 uppercase ${type === TransactionType.SALE ? 'text-green-400' : 'text-blue-400'}`}>លេខឡូតិ៍ (Batch #)</label>
                        <input 
                          type="text" 
                          value={batchNumber}
                          onChange={(e) => setBatchNumber(e.target.value)}
                          placeholder="Batch Number"
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold mb-1.5 uppercase ${type === TransactionType.SALE ? 'text-green-400' : 'text-blue-400'}`}>ថ្ងៃផុតកំណត់ (Expiry)</label>
                        <input 
                          type="date" 
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                        />
                      </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className={`block text-[10px] font-bold mb-1.5 uppercase ${type === TransactionType.SALE ? 'text-green-400' : 'text-blue-400'}`}>ចំនួន</label>
                      <input 
                        type="number" 
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-black text-center"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={addItem}
                        disabled={!selectedProduct}
                        className={`px-8 py-3 text-white rounded-xl font-bold disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
                            type === TransactionType.SALE ? 'bg-green-600 shadow-green-100 hover:bg-green-700' : 'bg-blue-600 shadow-blue-100 hover:bg-blue-700'
                        }`}
                      >
                        <Plus className="w-4 h-4" /> បញ្ចូល
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-6 bg-slate-50/50 flex flex-col h-full overflow-hidden">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  <span>បញ្ជីរាយមុខទំនិញ</span> 
                  <span className={`bg-white px-2 py-0.5 rounded-lg border border-slate-200 font-black text-[10px] ${type === TransactionType.SALE ? 'text-green-600' : 'text-blue-600'}`}>{currentItems.length} មុខ</span>
                </h4>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
                  {currentItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group shadow-sm transition-all hover:border-blue-300">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{item.productName}</p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{item.quantity} x ${item.price.toFixed(2)}</p>
                        {(item.batchNumber || item.expiryDate) && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.batchNumber && <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black">L: {item.batchNumber}</span>}
                            {item.expiryDate && <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-black">EXP: {item.expiryDate}</span>}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span className={`text-sm font-black ${type === TransactionType.SALE ? 'text-green-600' : 'text-blue-600'}`}>${(item.price * item.quantity).toFixed(2)}</span>
                        <button 
                          onClick={() => removeItem(item.productId, item.batchNumber)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {currentItems.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 py-12">
                      <ShoppingCart className="w-16 h-16 mb-3" />
                      <p className="font-bold uppercase text-[10px] tracking-widest">មិនទាន់មានទំនិញក្នុងបញ្ជី</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-200">
                  {/* Discount Section */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">បញ្ចុះតម្លៃ (Discount)</span>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setDiscountType('percentage')}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${discountType === 'percentage' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                <Percent className="w-3 h-3 inline mr-1" /> %
                            </button>
                            <button 
                                onClick={() => setDiscountType('fixed')}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${discountType === 'fixed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                            >
                                <DollarSign className="w-3 h-3 inline mr-1" /> $
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <input 
                            type="number" 
                            min="0"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(Number(e.target.value))}
                            placeholder={discountType === 'percentage' ? 'បញ្ជាក់ភាគរយ...' : 'បញ្ជាក់ទឹកប្រាក់...'}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-right font-bold text-sm"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">
                            Value
                        </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">សរុបដើម:</span>
                        <span className="text-sm font-bold text-slate-600">${subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">សរុបចុងក្រោយ:</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleFinalize}
                    disabled={currentItems.length === 0}
                    className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
                      type === TransactionType.SALE 
                      ? 'bg-green-600 text-white shadow-green-100 hover:bg-green-700' 
                      : (purchaseSubMode === 'PO' ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700')
                    } disabled:opacity-50`}
                  >
                    {type === TransactionType.SALE 
                        ? 'រក្សាទុក និងចេញវិក័យបត្រ' 
                        : (purchaseSubMode === 'PO' ? 'ចេញបញ្ជាទិញ (PO)' : 'រក្សាទុកការទិញចូល')}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isInvoiceOpen && selectedInvoices && (
        <Invoice 
          transactions={selectedInvoices} 
          onClose={() => setIsInvoiceOpen(false)} 
          businessInfo={businessInfo}
        />
      )}
    </div>
  );
};

export default Transactions;
