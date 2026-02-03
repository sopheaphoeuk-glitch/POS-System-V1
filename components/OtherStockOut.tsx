
import React, { useState } from 'react';
import { Product, Transaction, TransactionType, TransactionItem, UserAccount, UserRole } from '../types';
import { Plus, ClipboardX, Search, MessageSquare, Calendar, Trash2, CheckCircle2, ChevronRight, X, AlertCircle, Clipboard } from 'lucide-react';

interface OtherStockOutProps {
  products: Product[];
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  currentUser: UserAccount | null;
}

const PREDEFINED_REASONS = [
  'ទំនិញខូចគុណភាព (Damaged)',
  'ប្រើប្រាស់ក្នុងហាង (Used Internally)',
  'ទំនិញថែមជូន/ផ្សព្វផ្សាយ (Promotional/Free)',
  'បាត់បង់/មិនគ្រប់ចំនួន (Lost/Missing)',
  'ហួសកាលបរិច្ឆេទប្រើប្រាស់ (Expired)',
  'ផ្សេងៗ (Other...)'
];

const OtherStockOut: React.FC<OtherStockOutProps> = ({ products, transactions, onAddTransaction, onDeleteTransaction, currentUser }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [currentItems, setCurrentItems] = useState<TransactionItem[]>([]);
  const [selectedReason, setSelectedReason] = useState(PREDEFINED_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  
  // New fields
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Default to product's current batch if not specified
    const finalBatch = batchNumber || product.batchNumber || '';
    const finalExpiry = expiryDate || product.expiryDate || '';

    const existing = currentItems.find(i => i.productId === product.id && i.batchNumber === finalBatch);
    if (existing) {
      setCurrentItems(currentItems.map(i => (i.productId === product.id && i.batchNumber === finalBatch) ? { ...i, quantity: i.quantity + quantity } : i));
    } else {
      setCurrentItems([...currentItems, {
        productId: product.id,
        productName: product.name,
        quantity,
        price: 0,
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

  const handleFinalize = () => {
    if (currentItems.length === 0) return;

    const finalReason = selectedReason === 'ផ្សេងៗ (Other...)' ? customReason : selectedReason;
    if (!finalReason) {
      alert('សូមបញ្ចូលមូលហេតុនៃការដកស្តុក!');
      return;
    }

    const nextNum = (Date.now()).toString().slice(-7);
    const newId = `ADJ-${nextNum}`;

    const newTransaction: Transaction = {
      id: newId,
      type: TransactionType.OTHER_OUT,
      date: new Date().toISOString(),
      items: currentItems,
      subTotal: 0,
      discountAmount: 0,
      totalAmount: 0,
      customerOrSupplierName: 'ការកែតម្រូវស្តុក',
      note: finalReason
    };

    onAddTransaction(newTransaction);
    setIsFormOpen(false);
    setCurrentItems([]);
    setSelectedReason(PREDEFINED_REASONS[0]);
    setCustomReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">កាត់ស្តុកផ្សេងៗ (Stock Adjustment)</h2>
          <p className="text-slate-500">ប្រើសម្រាប់ដកទំនិញដែលខូច ឬប្រើប្រាស់ផ្ទាល់ខ្លួន (មិនមែនលក់)</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-orange-600 text-white shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          បង្កើតការដកស្តុកថ្មី
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 bg-slate-50/50 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs uppercase tracking-widest">
            <Calendar className="w-4 h-4 text-orange-500" />
            ប្រវត្តិនៃការកាត់ស្តុកផ្សេងៗ
          </h3>
        </div>
        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
          {transactions.map((t) => (
            <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-sm transition-transform group-hover:scale-105">
                  <ClipboardX className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">មូលហេតុ: {t.note}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-medium">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">#{t.id}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(t.date).toLocaleDateString('km-KH')}</span>
                    <span>•</span>
                    <span className="text-orange-600 font-bold">{t.items.reduce((acc, i) => acc + i.quantity, 0)} មុខទំនិញត្រូវបានដក</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ប្រតិបត្តិករ</p>
                  <p className="text-sm font-bold text-slate-700">{t.createdBy || 'រដ្ឋបាល'}</p>
                </div>
                
                {/* Admin-only Delete Button */}
                {currentUser?.role === UserRole.ADMIN && onDeleteTransaction && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteTransaction(t.id); }}
                    className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="លុបប្រតិបត្តិការ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-24 text-center">
              <div className="flex flex-col items-center justify-center opacity-20">
                <ClipboardX className="w-16 h-16 mb-4 text-slate-400" />
                <p className="text-xl font-black text-slate-800 uppercase tracking-[0.2em]">មិនទាន់មានទិន្នន័យ</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-orange-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                   <ClipboardX className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">ទម្រង់កែតម្រូវស្តុក</h3>
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">Inventory Adjustment</p>
                </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-8 border-r border-slate-100 overflow-y-auto space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">មូលហេតុនៃការដកស្តុក (Reason)</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <select 
                        value={selectedReason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-bold transition-all cursor-pointer appearance-none"
                      >
                        {PREDEFINED_REASONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>

                    {selectedReason === 'ផ្សេងៗ (Other...)' && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2 px-1">សូមបញ្ជាក់មូលហេតុផ្សេងៗ:</label>
                        <textarea 
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="រៀបរាប់ពីមូលហេតុនៃការដកស្តុក..."
                          className="w-full px-4 py-3 bg-white border-2 border-orange-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all h-24 resize-none font-bold"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 space-y-5">
                  <h4 className="text-xs font-black text-orange-800 uppercase tracking-widest flex items-center gap-2">
                    <Plus className="w-4 h-4" /> ជ្រើសរើសទំនិញត្រូវដក
                  </h4>
                  <div>
                    <label className="block text-[10px] font-bold text-orange-600 mb-1.5 uppercase">ស្វែងរកទំនិញ</label>
                    <select 
                      value={selectedProduct}
                      onChange={(e) => {
                          const id = e.target.value;
                          setSelectedProduct(id);
                          const p = products.find(prod => prod.id === id);
                          if (p) {
                              setBatchNumber(p.batchNumber || '');
                              setExpiryDate(p.expiryDate || '');
                          }
                      }}
                      className="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-bold text-sm"
                    >
                      <option value="">-- ជ្រើសរើសទំនិញ --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (ស្តុក: {p.stock} {p.unit})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-orange-600 mb-1.5 uppercase">លេខឡូតិ៍ (Batch #)</label>
                        <input 
                          type="text" 
                          value={batchNumber}
                          onChange={(e) => setBatchNumber(e.target.value)}
                          placeholder="Batch Number"
                          className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-orange-600 mb-1.5 uppercase">ថ្ងៃផុតកំណត់ (Expiry)</label>
                        <input 
                          type="date" 
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                        />
                      </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-orange-600 mb-1.5 uppercase">ចំនួន</label>
                      <input 
                        type="number" 
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-orange-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-black text-center"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={addItem}
                        disabled={!selectedProduct}
                        className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-black hover:bg-orange-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-orange-200 active:scale-95"
                      >
                        <Plus className="w-5 h-5" /> បញ្ចូល
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-8 bg-slate-50 flex flex-col h-full overflow-hidden">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                  <span>បញ្ជីទំនិញត្រៀមកាត់ស្តុក</span> 
                  <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-orange-600 font-black text-[10px]">{currentItems.length} មុខ</span>
                </h4>
                <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
                  {currentItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group shadow-sm transition-all hover:border-orange-300">
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-800">{item.productName}</p>
                        <p className="text-xs font-bold text-orange-500 mt-1 uppercase tracking-tight">ចំនួនដែលត្រូវដក: {item.quantity}</p>
                        {(item.batchNumber || item.expiryDate) && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.batchNumber && <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black">L: {item.batchNumber}</span>}
                            {item.expiryDate && <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-black">EXP: {item.expiryDate}</span>}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => removeItem(item.productId, item.batchNumber)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {currentItems.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 py-12">
                      <ClipboardX className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">មិនទាន់មានទំនិញក្នុងបញ្ជី</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-200">
                  <div className="bg-white p-5 rounded-3xl border border-orange-100 mb-6 flex gap-4 items-start shadow-sm">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                      <span className="text-orange-600">ចំណាំ:</span> ការកាត់ស្តុកប្រភេទនេះនឹងមិនបង្កើតចំណូល ឬវិក័យបត្រលក់ឡើយ។ ប្រព័ន្ធនឹងធ្វើការកាត់បន្ថយចំនួនទំនិញក្នុងឃ្លាំងដោយស្វ័យប្រវត្តិបន្ទាប់ពីអ្នកបញ្ជាក់។
                    </p>
                  </div>
                  <button 
                    onClick={handleFinalize}
                    disabled={currentItems.length === 0}
                    className="w-full py-4 rounded-2xl font-black text-lg bg-orange-600 text-white shadow-xl shadow-orange-100 hover:bg-orange-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    បញ្ជាក់ការកាត់ស្តុក
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherStockOut;
