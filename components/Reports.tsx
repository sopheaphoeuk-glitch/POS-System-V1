
import React, { useState, useMemo } from 'react';
import { Transaction, Product, TransactionType, Expense, BusinessInfo, UserAccount, UserRole } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, Filter, TrendingUp, TrendingDown, Package, FileText, Download, Wallet, BellRing, AlertTriangle, ClipboardX, PieChart as PieChartIcon, Truck, ShoppingBag, ClipboardList, CheckCircle } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
  products: Product[];
  expenses?: Expense[];
  businessInfo: BusinessInfo;
  currentUser: UserAccount | null;
}

const Reports: React.FC<ReportsProps> = ({ transactions, products, expenses = [], businessInfo, currentUser }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [activeView, setActiveView] = useState<'overview' | 'stock-in' | 'po'>('overview');

  const formatPrice = (amount: number) => {
    const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return businessInfo.currencyPosition === 'prefix' 
      ? `${businessInfo.currencySymbol}${formatted}` 
      : `${formatted} ${businessInfo.currencySymbol}`;
  };

  const reportData = useMemo(() => {
    const data: any = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      let key = '';
      if (reportType === 'daily') key = date.toLocaleDateString();
      if (reportType === 'monthly') key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (reportType === 'yearly') key = `${date.getFullYear()}`;

      if (!data[key]) data[key] = { name: key, sales: 0, purchases: 0, expenses: 0 };
      if (t.type === TransactionType.SALE) data[key].sales += t.totalAmount;
      else if (t.type === TransactionType.PURCHASE) data[key].purchases += t.totalAmount;
    });

    expenses.forEach(e => {
      const date = new Date(e.date);
      let key = '';
      if (reportType === 'daily') key = date.toLocaleDateString();
      if (reportType === 'monthly') key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (reportType === 'yearly') key = `${date.getFullYear()}`;

      if (data[key]) data[key].expenses += e.amount;
      else data[key] = { name: key, sales: 0, purchases: 0, expenses: e.amount };
    });

    return Object.values(data);
  }, [transactions, expenses, reportType]);

  const topSellingProducts = useMemo(() => {
    const sales: any = {};
    transactions.filter(t => t.type === TransactionType.SALE).forEach(t => {
      t.items.forEach(item => {
        sales[item.productName] = (sales[item.productName] || 0) + item.quantity;
      });
    });

    return Object.keys(sales)
      .map(name => ({ name, value: sales[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  const lowStockItems = useMemo(() => {
    return products.filter(p => p.stock <= (p.lowStockThreshold ?? 5));
  }, [products]);

  const purchaseTransactions = useMemo(() => {
    return transactions.filter(t => t.type === TransactionType.PURCHASE);
  }, [transactions]);

  const topSuppliers = useMemo(() => {
    const suppliers: any = {};
    purchaseTransactions.forEach(t => {
      suppliers[t.customerOrSupplierName] = (suppliers[t.customerOrSupplierName] || 0) + t.totalAmount;
    });
    return Object.keys(suppliers)
      .map(name => ({ name, value: suppliers[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [purchaseTransactions]);

  const stockAdjustments = useMemo(() => {
    return transactions.filter(t => t.type === TransactionType.OTHER_OUT);
  }, [transactions]);

  const poTransactions = useMemo(() => {
    return transactions.filter(t => t.type === TransactionType.PURCHASE_ORDER);
  }, [transactions]);

  const poStats = useMemo(() => {
    const pending = poTransactions.filter(t => t.status === 'Pending').length;
    const received = poTransactions.filter(t => t.status === 'Received').length;
    const totalValue = poTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
    return { pending, received, totalValue };
  }, [poTransactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const exportReportToCSV = () => {
    let csvContent = '';
    let fileName = '';

    if (activeView === 'overview') {
      const headers = ['កាលបរិច្ឆេទ (Date)', 'ចំណូល (Sales)', 'ការទិញចូល (Purchases)', 'ចំណាយផ្សេងៗ (Expenses)'];
      const rows = reportData.map((d: any) => [
        `"${d.name}"`, 
        d.sales.toFixed(2), 
        d.purchases.toFixed(2), 
        d.expenses.toFixed(2)
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      fileName = `របាយការណ៍សង្ខេប_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeView === 'stock-in') {
      const headers = ['កាលបរិច្ឆេទ (Date)', 'អ្នកផ្គត់ផ្គង់ (Supplier)', 'ចំនួនមុខ (Items)', 'សរុប (Total)'];
      const rows = purchaseTransactions.map(t => [
        new Date(t.date).toLocaleDateString('km-KH'),
        `"${t.customerOrSupplierName}"`,
        t.items.length,
        t.totalAmount.toFixed(2)
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      fileName = `របាយការណ៍ទិញចូល_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (activeView === 'po') {
      const headers = ['លេខ PO #', 'អ្នកផ្គត់ផ្គង់ (Supplier)', 'កាលបរិច្ឆេទ (Date)', 'ស្ថានភាព (Status)', 'សរុប (Total)'];
      const rows = poTransactions.map(t => [
        t.id,
        `"${t.customerOrSupplierName}"`,
        new Date(t.date).toLocaleDateString('km-KH'),
        t.status || 'Draft',
        t.totalAmount.toFixed(2)
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      fileName = `របាយការណ៍បញ្ជាទិញ_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">របាយការណ៍លម្អិត</h2>
          <p className="text-slate-500">ពិនិត្យមើលសកម្មភាពអាជីវកម្ម និងហិរញ្ញវត្ថុរបស់អ្នក</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex shadow-sm">
            {(['overview', 'stock-in', 'po'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeView === view ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {view === 'overview' ? 'ទូទៅ' : view === 'stock-in' ? 'ការទិញចូល' : 'បញ្ជាទិញ (PO)'}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex shadow-sm">
            {(['daily', 'monthly', 'yearly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  reportType === type ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {type === 'daily' ? 'តាមថ្ងៃ' : type === 'monthly' ? 'តាមខែ' : 'តាមឆ្នាំ'}
              </button>
            ))}
          </div>

          {/* Export Button - Restricted to Admin */}
          {currentUser?.role === UserRole.ADMIN && (
            <button 
              onClick={exportReportToCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              នាំចេញរបាយការណ៍ (CSV)
            </button>
          )}
        </div>
      </div>

      {activeView === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  ប្រៀបធៀប ចំណូល ចំណាយ និង ចំណាយផ្សេងៗ
                </h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" />
                      <Bar dataKey="sales" name={`ការលក់ចេញ (${businessInfo.currencySymbol})`} fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="purchases" name={`ការទិញចូល (${businessInfo.currencySymbol})`} fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="expenses" name={`ចំណាយផ្សេងៗ (${businessInfo.currencySymbol})`} fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
                    <ClipboardX className="w-4 h-4 text-orange-500" />
                    របាយការណ៍កាត់ស្តុកផ្សេងៗ
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">កាលបរិច្ឆេទ</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">មូលហេតុ</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">ចំនួនដក</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stockAdjustments.slice(0, 5).map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{new Date(t.date).toLocaleDateString('km-KH')}</td>
                            <td className="px-6 py-4 text-xs font-black text-slate-800">{t.note}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-xs font-black text-orange-600">{t.items.reduce((acc, i) => acc + i.quantity, 0)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
                    <BellRing className="w-4 h-4 text-red-500" />
                    ទំនិញជិតអស់ស្តុក
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ឈ្មោះទំនិញ</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">ស្តុក</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">ស្ថានភាព</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lowStockItems.slice(0, 5).map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 text-xs font-black text-slate-800">{item.name}</td>
                            <td className="px-6 py-4 text-center text-xs font-black text-red-600">{item.stock} {item.unit}</td>
                            <td className="px-6 py-4 text-right">
                              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-red-200">ជិតអស់</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-green-500" />
                  ទំនិញលក់ដាច់បំផុត
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={topSellingProducts} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                        {topSellingProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" align="center" layout="vertical" wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
                <h3 className="text-[10px] font-black mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  សេចក្តីសង្ខេបហិរញ្ញវត្ថុ
                </h3>
                <div className="space-y-5">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-default">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ប្រាក់ចំណេញប៉ាន់ស្មាន</span>
                      <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><TrendingUp className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-green-400 tracking-tighter">
                      + {formatPrice(
                        transactions.filter(t => t.type === TransactionType.SALE).reduce((a,b) => a + b.totalAmount, 0) -
                        transactions.filter(t => t.type === TransactionType.PURCHASE).reduce((a,b) => a + b.totalAmount, 0) -
                        expenses.reduce((a,b) => a + b.amount, 0)
                      )}
                    </p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-default">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ចំណាយសរុប</span>
                      <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><Wallet className="w-4 h-4" /></div>
                    </div>
                    <p className="text-3xl font-black text-red-400 tracking-tighter">
                      {formatPrice(
                        transactions.filter(t => t.type === TransactionType.PURCHASE).reduce((a,b) => a + b.totalAmount, 0) +
                        expenses.reduce((a,b) => a + b.amount, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeView === 'stock-in' && (
        <div className="animate-in slide-in-from-right-4 duration-500">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
                <Truck className="w-4 h-4 text-blue-500" />
                របាយការណ៍ទិញទំនិញចូល (Stock In Analysis)
              </h3>
              <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5 text-right">សរុបការចំណាយលើស្តុក</p>
                <p className="text-lg font-black text-blue-600">{formatPrice(purchaseTransactions.reduce((acc, t) => acc + t.totalAmount, 0))}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="h-64">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest text-center">អ្នកផ្គត់ផ្គង់ធំៗ (Top Suppliers)</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={topSuppliers} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                      {topSuppliers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {topSuppliers.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/30 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-blue-700">{formatPrice(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">កាលបរិច្ឆេទ</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">អ្នកផ្គត់ផ្គង់</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">ចំនួនមុខ</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">ទឹកប្រាក់សរុប</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseTransactions.slice(0, 20).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{new Date(t.date).toLocaleDateString('km-KH')}</td>
                      <td className="px-6 py-4 text-xs font-black text-slate-800">{t.customerOrSupplierName}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100">{t.items.length} មុខ</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-black text-blue-600">{formatPrice(t.totalAmount)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'po' && (
        <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100 border border-indigo-500">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm"><ClipboardList className="w-6 h-6" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">សរុបការបញ្ជាទិញ</span>
              </div>
              <p className="text-3xl font-black tracking-tighter mb-1">{formatPrice(poStats.totalValue)}</p>
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Total Value Ordered</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600"><TrendingUp className="w-6 h-6" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">កំពុងរង់ចាំ</span>
              </div>
              <p className="text-3xl font-black text-slate-800 tracking-tighter mb-1">{poStats.pending}</p>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Pending Orders</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-2xl text-green-600"><CheckCircle className="w-6 h-6" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">បានទទួល</span>
              </div>
              <p className="text-3xl font-black text-slate-800 tracking-tighter mb-1">{poStats.received}</p>
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Received Orders</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em] mb-8">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              បញ្ជីរាយការណ៍ បញ្ជាទិញទំនិញ (PO SUMMARY)
            </h3>
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">លេខ PO #</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">អ្នកផ្គត់ផ្គង់ (SUPPLIER)</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">កាលបរិច្ឆេទ</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">ស្ថានភាព</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">ទឹកប្រាក់សរុប</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {poTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-xs text-indigo-600">{t.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{t.customerOrSupplierName}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">{new Date(t.date).toLocaleDateString('km-KH')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                          t.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          t.status === 'Received' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {t.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-slate-900 text-sm tracking-tight">{formatPrice(t.totalAmount)}</span>
                      </td>
                    </tr>
                  ))}
                  {poTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-bold uppercase tracking-[0.2em] italic">មិនទាន់មានទិន្នន័យបញ្ជាទិញ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
