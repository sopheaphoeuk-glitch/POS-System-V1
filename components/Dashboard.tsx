
import React, { useMemo } from 'react';
import { Product, Transaction, TransactionType, Expense, UserAccount } from '../types';
import { ShoppingCart, Package, DollarSign, Activity, Wallet, Sun, Moon, CloudSun, TrendingUp, ClipboardX, AlertCircle } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';

interface DashboardProps {
  products: Product[];
  transactions: Transaction[];
  expenses?: Expense[];
  currentUser?: UserAccount | null;
  businessInfo?: any;
}

const Dashboard: React.FC<DashboardProps> = ({ products, transactions, expenses = [], currentUser, businessInfo }) => {
  const totalItems = products.length;
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  
  const totalSales = useMemo(() => transactions
    .filter(t => t.type === TransactionType.SALE)
    .reduce((acc, t) => acc + t.totalAmount, 0), [transactions]);

  const totalPurchases = useMemo(() => transactions
    .filter(t => t.type === TransactionType.PURCHASE)
    .reduce((acc, t) => acc + t.totalAmount, 0), [transactions]);

  const totalOtherExpenses = useMemo(() => expenses.reduce((acc, e) => acc + e.amount, 0), [expenses]);
  const otherOutCount = transactions.filter(t => t.type === TransactionType.OTHER_OUT).length;

  const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 5));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'អរុណសួស្តី', icon: <Sun className="w-6 h-6 text-orange-400" /> };
    if (hour < 17) return { text: 'ទិវាសួស្តី', icon: <CloudSun className="w-6 h-6 text-yellow-500" /> };
    return { text: 'សាយ័ណ្ហសួស្តី', icon: <Moon className="w-6 h-6 text-indigo-400" /> };
  };

  const greeting = getGreeting();

  const chartData = useMemo(() => {
    const dailyMap: { [key: string]: number } = {};
    const last7Days: string[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('km-KH', { day: 'numeric', month: 'short' });
      last7Days.push(dateStr);
      dailyMap[dateStr] = 0;
    }

    transactions
      .filter(t => t.type === TransactionType.SALE)
      .forEach(t => {
        const dateStr = new Date(t.date).toLocaleDateString('km-KH', { day: 'numeric', month: 'short' });
        if (dailyMap.hasOwnProperty(dateStr)) {
          dailyMap[dateStr] += t.totalAmount;
        }
      });

    return last7Days.map(day => ({
      name: day,
      amount: dailyMap[day]
    }));
  }, [transactions]);

  const stats = [
    { label: 'ទំនិញសរុប', value: totalItems, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'ចំណូលសរុប (Sales)', value: `$${totalSales.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'តម្លៃស្តុកបច្ចុប្បន្ន', value: `$${totalStockValue.toFixed(2)}`, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'ចំណាយទិញចូល (Purchase)', value: `$${totalPurchases.toFixed(2)}`, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'កាត់ស្តុកផ្សេងៗ', value: otherOutCount, icon: ClipboardX, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center border border-slate-100">
            {greeting.icon}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{greeting.text}, {currentUser?.fullName}!</h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{new Date().toLocaleDateString('km-KH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> ស្ថិតិការលក់ (៧ ថ្ងៃចុងក្រោយ)
            </h3>
          </div>
          <div className="w-full h-[350px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '800'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }} 
                  itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="amount" name="លក់បាន" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <h4 className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mb-2">តុល្យភាពហិរញ្ញវត្ថុ</h4>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-black tracking-tighter">${(totalSales - totalPurchases - totalOtherExpenses).toFixed(2)}</p>
                <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mt-1">ប្រាក់ចំណេញសុទ្ធ (Net Profit)</p>
              </div>
              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                   <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">ចំណាយប្រតិបត្តិការ</p>
                   <p className="font-black text-xl text-red-400">${totalOtherExpenses.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl">
                  <Activity className="w-6 h-6 text-white/20" />
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              <span>ទំនិញជិតអស់ស្តុក</span>
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[8px] border border-red-100">{lowStockProducts.length} មុខ</span>
            </h4>
            <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <span className="text-xs font-black text-red-600">{p.stock} {p.unit}</span>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-slate-300 opacity-50">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">គ្មានការព្រមាន</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
