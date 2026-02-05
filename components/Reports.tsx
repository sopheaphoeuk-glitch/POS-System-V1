
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
import { TrendingUp, Download, PieChart as PieChartIcon, Truck, Filter, RotateCcw, Wallet, ClipboardX, AlertTriangle, ArrowUpRight, ArrowDownRight, Package, Users, ShoppingBag, BarChart3 } from 'lucide-react';

interface ReportsProps {
  transactions: Transaction[];
  products: Product[];
  expenses?: Expense[];
  businessInfo: BusinessInfo;
  currentUser: UserAccount | null;
}

const Reports: React.FC<ReportsProps> = ({ transactions, products, expenses = [], businessInfo, currentUser }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [activeView, setActiveView] = useState<'overview' | 'sales' | 'stock-in' | 'expenses' | 'adjustments'>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatPrice = (amount: number) => {
    const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return businessInfo.currencyPosition === 'prefix' 
      ? `${businessInfo.currencySymbol}${formatted}` 
      : `${formatted} ${businessInfo.currencySymbol}`;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
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
      return matchesDate;
    });
  }, [transactions, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
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
      return matchesDate;
    });
  }, [expenses, startDate, endDate]);

  const financials = useMemo(() => {
    const salesTrans = filteredTransactions.filter(t => t.type === TransactionType.SALE);
    const sales = salesTrans.reduce((a, b) => a + b.totalAmount, 0);
    const purchases = filteredTransactions.filter(t => t.type === TransactionType.PURCHASE).reduce((a, b) => a + b.totalAmount, 0);
    const expTotal = filteredExpenses.reduce((a, b) => a + b.amount, 0);
    
    // Calculate estimated loss from stock adjustments (Other Stock Out)
    const adjustments = filteredTransactions.filter(t => t.type === TransactionType.OTHER_OUT);
    const adjustmentLoss = adjustments.reduce((acc, t) => {
      const transValue = t.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId);
        return itemAcc + (item.quantity * (product?.purchasePrice || 0));
      }, 0);
      return acc + transValue;
    }, 0);

    const aov = salesTrans.length > 0 ? sales / salesTrans.length : 0;

    return { 
        sales, 
        purchases, 
        expTotal, 
        adjustmentLoss, 
        netProfit: sales - purchases - expTotal - adjustmentLoss,
        aov,
        salesCount: salesTrans.length
    };
  }, [filteredTransactions, filteredExpenses, products]);

  const reportData = useMemo(() => {
    const data: any = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      let key = '';
      if (reportType === 'daily') key = date.toLocaleDateString();
      if (reportType === 'monthly') key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (reportType === 'yearly') key = `${date.getFullYear()}`;

      if (!data[key]) data[key] = { name: key, sales: 0, purchases: 0, expenses: 0, adjustments: 0 };
      
      if (t.type === TransactionType.SALE) {
        data[key].sales += t.totalAmount;
      } else if (t.type === TransactionType.PURCHASE) {
        data[key].purchases += t.totalAmount;
      } else if (t.type === TransactionType.OTHER_OUT) {
        const lossValue = t.items.reduce((acc, item) => {
          const product = products.find(p => p.id === item.productId);
          return acc + (item.quantity * (product?.purchasePrice || 0));
        }, 0);
        data[key].adjustments += lossValue;
      }
    });

    filteredExpenses.forEach(e => {
      const date = new Date(e.date);
      let key = '';
      if (reportType === 'daily') key = date.toLocaleDateString();
      if (reportType === 'monthly') key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (reportType === 'yearly') key = `${date.getFullYear()}`;

      if (data[key]) data[key].expenses += e.amount;
      else data[key] = { name: key, sales: 0, purchases: 0, expenses: e.amount, adjustments: 0 };
    });

    return Object.values(data).sort((a: any, b: any) => {
        return a.name.localeCompare(b.name);
    });
  }, [filteredTransactions, filteredExpenses, reportType, products]);

  const topSellingProducts = useMemo(() => {
    const sales: any = {};
    filteredTransactions.filter(t => t.type === TransactionType.SALE).forEach(t => {
      t.items.forEach(item => {
        if (!sales[item.productName]) {
            sales[item.productName] = { quantity: 0, revenue: 0 };
        }
        sales[item.productName].quantity += item.quantity;
        sales[item.productName].revenue += (item.quantity * item.price);
      });
    });

    return Object.keys(sales)
      .map(name => ({ name, value: sales[name].quantity, revenue: sales[name].revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredTransactions]);

  const topCustomers = useMemo(() => {
    const customers: any = {};
    filteredTransactions.filter(t => t.type === TransactionType.SALE).forEach(t => {
      const name = t.customerOrSupplierName || 'អតិថិជនទូទៅ';
      if (!customers[name]) {
        customers[name] = { revenue: 0, count: 0 };
      }
      customers[name].revenue += t.totalAmount;
      customers[name].count += 1;
    });

    return Object.keys(customers)
      .map(name => ({ name, revenue: customers[name].revenue, count: customers[name].count }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredTransactions]);

  const expenseCategories = useMemo(() => {
    const cats: any = {};
    filteredExpenses.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + e.amount;
    });
    return Object.keys(cats).map(name => ({ name, value: cats[name] })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const adjustmentReasons = useMemo(() => {
    const reasons: any = {};
    filteredTransactions.filter(t => t.type === TransactionType.OTHER_OUT).forEach(t => {
      const reason = t.note || 'មិនបានបញ្ជាក់';
      reasons[reason] = (reasons[reason] || 0) + 1;
    });
    return Object.keys(reasons).map(name => ({ name, value: reasons[name] })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#4b5563'];

  const exportReportToCSV = () => {
    const headers = ['កាលបរិច្ឆេទ (Date)', 'ចំណូល (Sales)', 'ការទិញចូល (Purchases)', 'ចំណាយផ្សេងៗ (Expenses)', 'បាត់បង់ស្តុក (Stock Loss)'];
    const rows = reportData.map((d: any) => [
      `"${d.name}"`, 
      d.sales.toFixed(2), 
      d.purchases.toFixed(2), 
      d.expenses.toFixed(2),
      d.adjustments.toFixed(2)
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.csv`);
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
            {(['daily', 'monthly', 'yearly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  reportType === type ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {type === 'daily' ? 'ប្រចាំថ្ងៃ' : type === 'monthly' ? 'ប្រចាំខែ' : 'ប្រចាំឆ្នាំ'}
              </button>
            ))}
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
          </button>
          
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="p-3 bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {currentUser?.role === UserRole.ADMIN && (
            <button 
              onClick={exportReportToCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              នាំចេញ (CSV)
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="p-6 bg-white border border-slate-100 rounded-3xl animate-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">កាលបរិច្ឆេទចាប់ពី:</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">រហូតដល់:</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ចំណូលសរុប (Sales)</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{formatPrice(financials.sales)}</h3>
          <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-500">
            <ArrowUpRight className="w-3 h-3" /> {financials.salesCount} ប្រតិបត្តិការ
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ចំណាយប្រតិបត្តិការ (Expenses)</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{formatPrice(financials.expTotal)}</h3>
          <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-red-500">
            <ArrowDownRight className="w-3 h-3" /> មិនរាប់បញ្ចូលថ្លៃដើម
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
            <ClipboardX className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">បាត់បង់ស្តុក (Adj. Loss)</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{formatPrice(financials.adjustmentLoss)}</h3>
          <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-orange-500">
            <AlertTriangle className="w-3 h-3" /> តាមថ្លៃដើមប៉ាន់ស្មាន
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col hover:scale-[1.02] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-blue-400 flex items-center justify-center mb-4">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">ប្រាក់ចំណេញសុទ្ធ (Net Profit)</p>
          <h3 className="text-2xl font-black text-white tracking-tighter">{formatPrice(financials.netProfit)}</h3>
          <div className={`mt-4 flex items-center gap-1 text-[10px] font-bold ${financials.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {financials.netProfit >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {financials.netProfit >= 0 ? 'ចំណេញ' : 'ខាត'}
          </div>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm w-fit overflow-x-auto">
        {(['overview', 'sales', 'stock-in', 'expenses', 'adjustments'] as const).map((view) => (
            <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeView === view ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
            }`}
            >
            {view === 'overview' ? 'ទូទៅ' : view === 'sales' ? 'ការលក់' : view === 'stock-in' ? 'ការទិញចូល' : view === 'expenses' ? 'ចំណាយ' : 'កាត់ស្តុក'}
            </button>
        ))}
      </div>

      {/* OVERVIEW VIEW */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-w-0">
              <h3 className="font-black text-slate-800 mb-8 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em]">
                <TrendingUp className="w-4 h-4 text-green-500" />
                ប្រៀបធៀបចំណូល ចំណាយ និងការបាត់បង់
              </h3>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="sales" name="លក់ចេញ ($)" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expenses" name="ចំណាយ ($)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="adjustments" name="បាត់បង់ស្តុក ($)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
              <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-green-500" />
                ប្រភេទចំណាយធំៗ
              </h3>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseCategories} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" align="center" layout="vertical" wrapperStyle={{ paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SALES VIEW */}
      {activeView === 'sales' && (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <ShoppingBag className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">តម្លៃមធ្យម/វិក្កយបត្រ</p>
                        <h4 className="text-xl font-black text-slate-800 tracking-tighter">{formatPrice(financials.aov)}</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">អតិថិជនសរុប (ក្នុងរយៈពេលនេះ)</p>
                        <h4 className="text-xl font-black text-slate-800 tracking-tighter">{topCustomers.length} នាក់</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <BarChart3 className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ចំនួនលក់ចេញសរុប</p>
                        <h4 className="text-xl font-black text-slate-800 tracking-tighter">{financials.salesCount} ដង</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Customers */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-800 mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" /> អតិថិជនឆ្នើម (Top 10 Customers)
                    </h3>
                    <div className="space-y-4">
                        {topCustomers.map((cust, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{cust.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{cust.count} វិក្កយបត្រ</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-blue-600">{formatPrice(cust.revenue)}</p>
                                    <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full" 
                                            style={{ width: `${(cust.revenue / (topCustomers[0]?.revenue || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-800 mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-green-500" /> ទំនិញលក់ដាច់បំផុត (Product Revenue)
                    </h3>
                    <div className="space-y-4">
                        {topSellingProducts.slice(0, 10).map((prod, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs shadow-sm">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{prod.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">លក់បាន {prod.value} មុខ</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-green-600">{formatPrice(prod.revenue)}</p>
                                    <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 rounded-full" 
                                            style={{ width: `${(prod.revenue / (topSellingProducts[0]?.revenue || 1)) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" /> និន្នាការចំណូលលក់ចេញ
                </h3>
                <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <Tooltip />
                            <Area type="monotone" dataKey="sales" name="ចំណូលលក់ ($)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      {activeView === 'adjustments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <ClipboardX className="w-4 h-4 text-orange-500" /> មូលហេតុនៃការកាត់ស្តុក
             </h3>
             <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={adjustmentReasons} margin={{ left: 50 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, width: 150}} width={150} />
                    <Tooltip />
                    <Bar dataKey="value" name="ចំនួនប្រតិបត្តិការ" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
             <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> ព័ត៌មានលម្អិតការបាត់បង់
             </h3>
             <div className="flex-1 space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTransactions.filter(t => t.type === TransactionType.OTHER_OUT).map((t, idx) => {
                    const loss = t.items.reduce((acc, item) => {
                        const product = products.find(p => p.id === item.productId);
                        return acc + (item.quantity * (product?.purchasePrice || 0));
                    }, 0);
                    return (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-slate-800">{t.note}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(t.date).toLocaleDateString('km-KH')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-red-600">{formatPrice(loss)}</p>
                                <p className="text-[9px] text-slate-400 uppercase font-black">{t.items.length} មុខទំនិញ</p>
                            </div>
                        </div>
                    );
                })}
                {filteredTransactions.filter(t => t.type === TransactionType.OTHER_OUT).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <ClipboardX className="w-12 h-12 mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">មិនទាន់មានទិន្នន័យ</p>
                    </div>
                )}
             </div>
          </div>
        </div>
      )}

      {activeView === 'expenses' && (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-red-500" /> និន្នាការចំណាយប្រតិបត្តិការ
                </h3>
                <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportData}>
                            <defs>
                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                            <Tooltip />
                            <Area type="monotone" dataKey="expenses" name="ចំណាយ ($)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 mb-6 uppercase text-[10px] tracking-[0.2em]">ប្រវត្តិចំណាយលម្អិត</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExpenses.slice(0, 12).map((exp, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-800 truncate max-w-[140px]">{exp.description}</p>
                                <p className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded w-fit mt-1 uppercase tracking-tighter">{exp.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-900">{formatPrice(exp.amount)}</p>
                                <p className="text-[9px] text-slate-400 font-bold">{new Date(exp.date).toLocaleDateString('km-KH')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {activeView === 'stock-in' && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-w-0">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em] mb-8">
            <Truck className="w-4 h-4 text-blue-500" />
            របាយការណ៍ទិញទំនិញចូល (Stock In Analysis)
          </h3>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData}>
                    <defs>
                        <linearGradient id="colorPur" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="purchases" name="ការទិញចូល ($)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPur)" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
