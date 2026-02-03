
import React from 'react';
import { Product, Transaction, TransactionType, Expense, UserAccount } from '../types';
import { ShoppingCart, Package, DollarSign, ArrowUpRight, ArrowDownRight, Activity, Wallet, Sun, Moon, CloudSun, TrendingUp, ClipboardX, BarChart3 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
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
}

const Dashboard: React.FC<DashboardProps> = ({ products, transactions, expenses = [], currentUser }) => {
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalItems = products.length;
  
  // គណនាតម្លៃស្តុកសរុប (ចំនួនស្តុក x ថ្លៃដើម)
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  
  // ចំណូលសរុប រាប់តែ SALE
  const totalSales = transactions
    .filter(t => t.type === TransactionType.SALE)
    .reduce((acc, t) => acc + t.totalAmount, 0);

  // ការទិញចូល
  const totalPurchases = transactions
    .filter(t => t.type === TransactionType.PURCHASE)
    .reduce((acc, t) => acc + t.totalAmount, 0);

  // ការដកស្តុកផ្សេងៗ (ចំនួនដង)
  const otherOutCount = transactions.filter(t => t.type === TransactionType.OTHER_OUT).length;

  const totalExp = expenses.reduce((acc, e) => acc + e.amount, 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'អរុណសួស្តី', icon: <Sun className="w-6 h-6 text-orange-400" /> };
    if (hour < 17) return { text: 'ទិវាសួស្តី', icon: <CloudSun className="w-6 h-6 text-yellow-500" /> };
    return { text: 'សាយ័ណ្ហសួស្តី', icon: <Moon className="w-6 h-6 text-indigo-400" /> };
  };

  const greeting = getGreeting();

  const salesByDate = transactions
    .filter(t => t.type === TransactionType.SALE)
    .reduce((acc: any, t) => {
      const date = new Date(t.date).toLocaleDateString('km-KH');
      acc[date] = (acc[date] || 0) + t.totalAmount;
      return acc;
    }, {});

  const chartData = Object.keys(salesByDate).map(date => ({
    name: date,
    amount: salesByDate[date]
  })).slice(-7);

  const stats = [
    { label: 'ទំនិញសរុប', value: totalItems, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'ចំណូលសរុប', value: `$${totalSales.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: '+12%' },
    { label: 'តម្លៃស្តុកក្នុងឃ្លាំង', value: `$${totalStockValue.toFixed(2)}`, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'ចំណាយទិញចូល', value: `$${totalPurchases.toFixed(2)}`, icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'កាត់ស្តុកផ្សេងៗ', value: otherOutCount, icon: ClipboardX, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl">
            {greeting.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{greeting.text}, {currentUser?.fullName || 'អ្នកគ្រប់គ្រង'}!</h2>
            <p className="text-slate-500 text-sm">នេះគឺជាសេចក្តីសង្ខេបអាជីវកម្មរបស់អ្នកសម្រាប់ថ្ងៃនេះ {new Date().toLocaleDateString('km-KH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ស្ថានភាពប្រព័ន្ធ</p>
          <p className="text-sm font-bold text-green-500 flex items-center justify-end gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> កំពុងដំណើរការ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend && (
                <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {stat.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">ស្ថិតិការលក់ (៧ ថ្ងៃចុងក្រោយ)</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span className="text-xs text-slate-500 font-medium">ទឹកប្រាក់លក់ចេញ ($)</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">សេចក្តីសង្ខេបស្តុក</h3>
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">ស្តុកសរុបក្នុងឃ្លាំង</p>
              <p className="text-3xl font-bold text-slate-800">{totalStock} <span className="text-sm font-normal text-slate-400">ឯកតា</span></p>
            </div>
            <div className="p-5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <p className="text-sm text-blue-100 mb-1 font-medium">ប្រាក់ចំណេញប៉ាន់ស្មាន</p>
              <p className="text-3xl font-bold">${(totalSales - totalPurchases - totalExp).toFixed(2)}</p>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-[10px] text-blue-200 leading-tight">គណនាពី ចំណូល - (ថ្លៃទិញ + ចំណាយ)</p>
                <TrendingUp className="w-5 h-5 text-blue-200" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <Activity className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-[10px] font-bold text-orange-600 uppercase">ការណែនាំ</p>
                <p className="text-xs text-orange-700">ពិនិត្យទំនិញដែលជិតអស់ពីស្តុក</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
