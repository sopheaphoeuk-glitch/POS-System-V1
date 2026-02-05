
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Plus, 
  Search,
  Bell,
  User,
  LogOut,
  ChevronRight,
  BarChart3,
  Wallet,
  Users as UsersIcon,
  ClipboardX,
  Settings as SettingsIcon
} from 'lucide-react';
import { Product, Transaction, TransactionType, Expense, UserAccount, UserRole, BusinessInfo, AuditLog } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Transactions from './components/Transactions';
import OtherStockOut from './components/OtherStockOut';
import Reports from './components/Reports';
import Expenses from './components/Expenses';
import Login from './components/Login';
import Users from './components/Users';
import Settings from './components/Settings';
import Invoice from './components/Invoice';

const App: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('inventory_users');
      return saved ? JSON.parse(saved) : [{
        id: '1',
        username: 'Admin',
        password: 'Admin123',
        fullName: 'អ្នកគ្រប់គ្រងទូទៅ',
        role: UserRole.ADMIN,
        isActive: true,
        permissions: {
          dashboard: true,
          inventory: true,
          stockIn: true,
          stockOut: true,
          otherStockOut: true,
          expenses: true,
          reports: true
        },
        createdAt: new Date().toISOString()
      }];
    } catch (e) { return []; }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(() => {
    const saved = localStorage.getItem('inventory_business_info');
    if (saved) return JSON.parse(saved);
    return {
      name: 'រតនា ផលិតសំបកដប និង ប្លាស្ទិក',
      address: 'ភូមិ ស្នួលខ្ពស់ ឃុំ តាំងយ៉ាប ស្រុក ព្រៃកប្បាស តាកែវ',
      phone: '085 809 054 / 085 506 070',
      email: 'ratana.bottle@gmail.com',
      logo: '',
      currencySymbol: '$',
      currencyPosition: 'prefix'
    };
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('inventory_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [invoiceData, setInvoiceData] = useState<Transaction | Expense | (Transaction | Expense)[] | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const addLog = useCallback((action: string, module: AuditLog['module'], details: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 2000));
  }, [currentUser]);

  const showInvoice = useCallback((data: Transaction | Expense | (Transaction | Expense)[]) => {
    setInvoiceData(data);
    setIsInvoiceOpen(true);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('is_authenticated') === 'true';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'stock-in' | 'stock-out' | 'other-stock-out' | 'expenses' | 'reports' | 'users' | 'settings'>('dashboard');
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('inventory_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('inventory_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('inventory_users', JSON.stringify(users));
    localStorage.setItem('inventory_products', JSON.stringify(products));
    localStorage.setItem('inventory_transactions', JSON.stringify(transactions));
    localStorage.setItem('inventory_expenses', JSON.stringify(expenses));
    localStorage.setItem('inventory_business_info', JSON.stringify(businessInfo));
    localStorage.setItem('inventory_audit_logs', JSON.stringify(auditLogs));
  }, [users, products, transactions, expenses, businessInfo, auditLogs]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('is_authenticated', 'true');
    addLog('ចូលប្រើប្រាស់ប្រព័ន្ធ', 'Users', 'បានចូលប្រើប្រាស់ក្នុងគណនី');
    if (user.permissions.dashboard) setActiveTab('dashboard');
    else if (user.permissions.inventory) setActiveTab('inventory');
  };

  const handleLogout = () => {
    if (window.confirm('តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ?')) {
      addLog('ចាកចេញពីប្រព័ន្ធ', 'Users', 'បានចាកចេញពីគណនី');
      localStorage.removeItem('is_authenticated');
      localStorage.removeItem('current_user');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveTab('dashboard');
    }
  };

  const addProduct = (product: Product) => {
    setProducts([{ ...product, createdAt: new Date().toISOString() }, ...products]);
    addLog('បន្ថែមទំនិញថ្មី', 'Inventory', `ទំនិញ: ${product.name}, ស្តុកដើម: ${product.stock}`);
  };

  const updateProduct = (updated: Product) => {
    setProducts(products.map(p => p.id === updated.id ? updated : p));
    addLog('កែប្រែទិន្នន័យទំនិញ', 'Inventory', `ទំនិញ: ${updated.name}, ស្តុកបច្ចុប្បន្ន: ${updated.stock}`);
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (window.confirm(`តើអ្នកពិតជាចង់លុបទំនិញ "${prod?.name}" មែនទេ?`)) {
      setProducts(products.filter(p => p.id !== id));
      addLog('លុបទំនិញ', 'Inventory', `ទំនិញ: ${prod?.name} (ID: ${id})`);
    }
  };

  const addUser = (user: UserAccount) => {
    setUsers([{ ...user, createdAt: new Date().toISOString() }, ...users]);
    addLog('បន្ថែមអ្នកប្រើប្រាស់ថ្មី', 'Users', `ឈ្មោះ: ${user.fullName} (${user.username})`);
  };

  const updateUser = (updated: UserAccount) => {
    setUsers(users.map(u => u.id === updated.id ? updated : u));
    addLog('កែប្រែព័ត៌មានអ្នកប្រើប្រាស់', 'Users', `ឈ្មោះ: ${updated.fullName} (${updated.username})`);
  };

  const deleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    if (user.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length <= 1) {
      alert('មិនអាចលុប Admin តែម្នាក់គត់បានទេ!');
      return;
    }
    if (window.confirm(`តើអ្នកពិតជាចង់លុបអ្នកប្រើប្រាស់ "${user.fullName}" មែនទេ?`)) {
      setUsers(users.filter(u => u.id !== id));
      addLog('លុបអ្នកប្រើប្រាស់', 'Users', `ឈ្មោះ: ${user.fullName} (ID: ${id})`);
    }
  };

  const addTransaction = (transaction: Transaction) => {
    const transactionWithUser = { ...transaction, createdBy: currentUser?.fullName };
    setTransactions(prev => [transactionWithUser, ...prev]);
    
    let actionLabel = '';
    if (transaction.type === TransactionType.SALE) actionLabel = 'លក់ចេញ';
    else if (transaction.type === TransactionType.PURCHASE) actionLabel = 'ទិញចូល';
    else if (transaction.type === TransactionType.PURCHASE_ORDER) actionLabel = 'បង្កើត PO';
    else if (transaction.type === TransactionType.OTHER_OUT) actionLabel = 'កាត់ស្តុកផ្សេងៗ';

    addLog(actionLabel, 'Transactions', `ID: ${transaction.id}, សរុប: $${transaction.totalAmount.toFixed(2)}`);

    if (transaction.type === TransactionType.PURCHASE_ORDER) return;

    setProducts(prevProducts => prevProducts.map(p => {
      const item = transaction.items.find(i => i.productId === p.id);
      if (item) {
        const change = (transaction.type === TransactionType.PURCHASE) ? item.quantity : -item.quantity;
        return { ...p, stock: p.stock + change };
      }
      return p;
    }));
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if (!oldTransaction) return;

    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? { ...updatedTransaction, createdBy: currentUser?.fullName } : t));
    
    addLog('កែប្រែប្រតិបត្តិការ', 'Transactions', `ID: ${updatedTransaction.id}, សរុបថ្មី: $${updatedTransaction.totalAmount.toFixed(2)}`);

    // Reverse old stock and apply new stock
    setProducts(prevProducts => prevProducts.map(p => {
      let newStock = p.stock;
      
      // Reverse old
      const oldItem = oldTransaction.items.find(i => i.productId === p.id);
      if (oldItem && oldTransaction.type !== TransactionType.PURCHASE_ORDER) {
        const reverseChange = (oldTransaction.type === TransactionType.SALE || oldTransaction.type === TransactionType.OTHER_OUT) ? oldItem.quantity : -oldItem.quantity;
        newStock += reverseChange;
      }

      // Apply new
      const newItem = updatedTransaction.items.find(i => i.productId === p.id);
      if (newItem && updatedTransaction.type !== TransactionType.PURCHASE_ORDER) {
        const change = (updatedTransaction.type === TransactionType.PURCHASE) ? newItem.quantity : -newItem.quantity;
        newStock += change;
      }

      return { ...p, stock: newStock };
    }));
  };

  const deleteTransaction = (id: string) => {
    const t = transactions.find(tr => tr.id === id);
    if (!t) return;

    if (window.confirm(`តើអ្នកពិតជាចង់លុបប្រតិបត្តិការ "${t.id}" មែនទេ? ស្តុកនឹងត្រូវបានកែតម្រូវត្រឡប់វិញ។`)) {
      if (t.type !== TransactionType.PURCHASE_ORDER) {
        setProducts(prevProducts => prevProducts.map(p => {
          const item = t.items.find(i => i.productId === p.id);
          if (item) {
            const reverseChange = (t.type === TransactionType.SALE || t.type === TransactionType.OTHER_OUT) ? item.quantity : -item.quantity;
            return { ...p, stock: p.stock + reverseChange };
          }
          return p;
        }));
      }
      setTransactions(prev => prev.filter(tr => tr.id !== id));
      addLog('លុបប្រតិបត្តិការ', 'Transactions', `ID: ${t.id} (បានកែសម្រួលស្តុកវិញរួចរាល់)`);
    }
  };

  const handleFullRestore = (data: any) => {
    if (data.products) setProducts(data.products);
    if (data.transactions) setTransactions(data.transactions);
    if (data.expenses) setExpenses(data.expenses);
    if (data.users) setUsers(data.users);
    if (data.businessInfo) setBusinessInfo(data.businessInfo);
    if (data.auditLogs) setAuditLogs(data.auditLogs);
    addLog('បញ្ចូលទិន្នន័យបម្រុងទុក (Restore)', 'Settings', 'ប្រព័ន្ធត្រូវបានបញ្ចូលទិន្នន័យពីឯកសារបម្រុងទុកដោយជោគជ័យ');
    alert('ទិន្នន័យត្រូវបានបញ្ចូលដោយជោគជ័យ!');
  };

  const navItems = [
    ...(currentUser?.permissions.dashboard ? [{ id: 'dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', icon: LayoutDashboard }] : []),
    ...(currentUser?.permissions.inventory ? [{ id: 'inventory', label: 'បញ្ជីទំនិញ', icon: Package }] : []),
    ...(currentUser?.permissions.stockIn ? [{ id: 'stock-in', label: 'ទិញចូល / បញ្ជាទិញ', icon: Plus }] : []),
    ...(currentUser?.permissions.stockOut ? [{ id: 'stock-out', label: 'លក់ចេញ', icon: ShoppingCart }] : []),
    ...(currentUser?.permissions.otherStockOut ? [{ id: 'other-stock-out', label: 'កាត់ស្តុកផ្សេងៗ', icon: ClipboardX }] : []),
    ...(currentUser?.permissions.expenses ? [{ id: 'expenses', label: 'ចំណាយផ្សេងៗ', icon: Wallet }] : []),
    ...(currentUser?.permissions.reports ? [{ id: 'reports', label: 'របាយការណ៍', icon: BarChart3 }] : []),
    ...(currentUser?.role === UserRole.ADMIN ? [{ id: 'users', label: 'អ្នកប្រើប្រាស់', icon: UsersIcon }] : []),
    ...(currentUser?.role === UserRole.ADMIN ? [{ id: 'settings', label: 'ការកំណត់', icon: SettingsIcon }] : []),
  ];

  if (!isAuthenticated) return <Login users={users} onLogin={handleLogin} />;

  return (
    <div className={`flex min-h-screen bg-slate-50 text-slate-900 ${isInvoiceOpen ? 'invoice-open' : ''}`}>
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col no-print border-r border-slate-800 shadow-2xl sidebar">
        <div className="p-6">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              {businessInfo.logo ? <img src={businessInfo.logo} alt="Logo" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-white" />}
            </div>
            <h1 className="text-sm font-bold leading-tight truncate">
              {businessInfo.name.split(' ')[0]} <br />
              <span className="text-blue-400 text-[10px] uppercase tracking-tighter font-black">IMS Panel</span>
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setGlobalSearchTerm(''); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
              <span className="font-semibold text-sm">{item.label}</span>
              {activeTab === item.id && <ChevronRight className="ml-auto w-4 h-4 text-white/50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 p-3 mb-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 border border-white/10"><User className="w-5 h-5" /></div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{currentUser?.fullName}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentUser?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all text-sm font-bold border border-red-500/20 active:scale-95">
            <LogOut className="w-4 h-4" /> ចាកចេញ
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 no-print shadow-sm">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl w-96 border border-slate-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={`ស្វែងរកក្នុង ${activeTab}...`} 
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
               <span className="text-[10px] font-black uppercase tracking-widest">{currentUser?.role} PANEL</span>
            </div>
            <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 relative border border-transparent hover:border-slate-200 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pb-20 custom-scrollbar main-content-area">
          {activeTab === 'dashboard' && <Dashboard products={products} transactions={transactions} expenses={expenses} currentUser={currentUser} businessInfo={businessInfo} />}
          {activeTab === 'inventory' && <Inventory products={products} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} businessInfo={businessInfo} searchTerm={globalSearchTerm} currentUser={currentUser} />}
          {(activeTab === 'stock-in' || activeTab === 'stock-out') && (
            <Transactions 
              type={activeTab === 'stock-in' ? TransactionType.PURCHASE : TransactionType.SALE}
              products={products} onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction}
              currentUser={currentUser} businessInfo={businessInfo} onShowInvoice={showInvoice}
              transactions={transactions.filter(t => activeTab === 'stock-in' ? (t.type === TransactionType.PURCHASE || t.type === TransactionType.PURCHASE_ORDER) : t.type === TransactionType.SALE)}
              searchTerm={globalSearchTerm}
            />
          )}
          {activeTab === 'other-stock-out' && <OtherStockOut products={products} onAddTransaction={addTransaction} onUpdateTransaction={updateTransaction} onDeleteTransaction={deleteTransaction} currentUser={currentUser} businessInfo={businessInfo} onShowInvoice={showInvoice} transactions={transactions.filter(t => t.type === TransactionType.OTHER_OUT)} searchTerm={globalSearchTerm} />}
          {activeTab === 'expenses' && <Expenses expenses={expenses} onAddExpense={(e) => setExpenses(prev => [e, ...prev])} onUpdateExpense={(updated) => setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e))} onDeleteExpense={(id) => setExpenses(prev => prev.filter(e => e.id !== id))} currentUser={currentUser} businessInfo={businessInfo} onShowInvoice={(e) => showInvoice(e)} searchTerm={globalSearchTerm} />}
          {activeTab === 'reports' && <Reports transactions={transactions} products={products} expenses={expenses} businessInfo={businessInfo} currentUser={currentUser} />}
          {activeTab === 'users' && <Users users={users} onAdd={addUser} onUpdate={updateUser} onDelete={deleteUser} auditLogs={auditLogs} searchTerm={globalSearchTerm} />}
          {activeTab === 'settings' && (
            <Settings 
                businessInfo={businessInfo} 
                onUpdate={setBusinessInfo} 
                onRestore={handleFullRestore} 
                fullData={{ products, transactions, expenses, users, businessInfo, auditLogs }} 
            />
          )}
        </div>
      </main>

      {isInvoiceOpen && invoiceData && <Invoice transactions={invoiceData} onClose={() => setIsInvoiceOpen(false)} businessInfo={businessInfo} />}
    </div>
  );
};

export default App;
