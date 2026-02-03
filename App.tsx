
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

const App: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('inventory_users');
    if (saved) return JSON.parse(saved);
    return [{
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
    setAuditLogs(prev => [newLog, ...prev].slice(0, 1000)); // Keep last 1000 logs
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('inventory_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

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
  }, [users]);

  useEffect(() => {
    localStorage.setItem('inventory_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inventory_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('inventory_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('inventory_business_info', JSON.stringify(businessInfo));
  }, [businessInfo]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('is_authenticated', 'true');
    if (user.permissions.dashboard) setActiveTab('dashboard');
    else if (user.permissions.inventory) setActiveTab('inventory');
    else if (user.permissions.stockOut) setActiveTab('stock-out');
  };

  const handleLogout = () => {
    if (window.confirm('តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធមែនទេ?')) {
      localStorage.removeItem('is_authenticated');
      localStorage.removeItem('current_user');
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveTab('dashboard');
    }
  };

  const addProduct = (product: Product) => {
    setProducts([{ ...product, createdAt: new Date().toISOString() }, ...products]);
    addLog('បន្ថែមទំនិញថ្មី', 'Inventory', `ទំនិញ: ${product.name}, ស្តុក: ${product.stock}`);
  };

  const updateProduct = (updated: Product) => {
    setProducts(products.map(p => p.id === updated.id ? updated : p));
    addLog('កែប្រែទិន្នន័យទំនិញ', 'Inventory', `ទំនិញ: ${updated.name}, ស្តុកចុងក្រោយ: ${updated.stock}`);
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (window.confirm(`តើអ្នកពិតជាចង់លុបទំនិញ "${prod?.name}" មែនទេ?`)) {
      setProducts(products.filter(p => p.id !== id));
      addLog('លុបទំនិញ', 'Inventory', `ទំនិញ: ${prod?.name} (ID: ${id})`);
    }
  };

  const addTransaction = (transaction: Transaction) => {
    const transactionWithUser = { ...transaction, createdBy: currentUser?.fullName };
    setTransactions([transactionWithUser, ...transactions]);
    
    let actionLabel = '';
    if (transaction.type === TransactionType.SALE) actionLabel = 'លក់ចេញ';
    else if (transaction.type === TransactionType.PURCHASE) actionLabel = 'ទិញចូល';
    else if (transaction.type === TransactionType.PURCHASE_ORDER) actionLabel = 'បង្កើត PO';
    else if (transaction.type === TransactionType.OTHER_OUT) actionLabel = 'កាត់ស្តុកផ្សេងៗ';

    addLog(actionLabel, 'Transactions', `ID: ${transaction.id}, សរុប: $${transaction.totalAmount.toFixed(2)}, ភាគី: ${transaction.customerOrSupplierName}`);

    if (transaction.type === TransactionType.PURCHASE_ORDER) return;

    const updatedProducts = products.map(p => {
      const item = transaction.items.find(i => i.productId === p.id);
      if (item) {
        const change = transaction.type === TransactionType.PURCHASE ? item.quantity : -item.quantity;
        const updateInfo = transaction.type === TransactionType.PURCHASE ? {
          batchNumber: item.batchNumber || p.batchNumber,
          expiryDate: item.expiryDate || p.expiryDate
        } : {};
        return { ...p, stock: p.stock + change, ...updateInfo };
      }
      return p;
    });
    setProducts(updatedProducts);
  };

  const deleteTransaction = (id: string) => {
    const t = transactions.find(tr => tr.id === id);
    if (!t) return;

    if (window.confirm(`តើអ្នកពិតជាចង់លុបប្រតិបត្តិការ "${t.id}" មែនទេ? ការលុបនេះនឹងធ្វើការកែសម្រួលស្តុកត្រឡប់មកវិញ។`)) {
      // Reverse stock changes if not PO
      if (t.type !== TransactionType.PURCHASE_ORDER) {
        const updatedProducts = products.map(p => {
          const item = t.items.find(i => i.productId === p.id);
          if (item) {
            const reverseChange = (t.type === TransactionType.SALE || t.type === TransactionType.OTHER_OUT) 
              ? item.quantity 
              : -item.quantity;
            return { ...p, stock: p.stock + reverseChange };
          }
          return p;
        });
        setProducts(updatedProducts);
      }

      setTransactions(transactions.filter(tr => tr.id !== id));
      addLog('លុបប្រតិបត្តិការ', 'Transactions', `ID: ${t.id}, ប្រភេទ: ${t.type}`);
    }
  };

  const addExpense = (expense: Expense) => {
    setExpenses([expense, ...expenses]);
    addLog('បន្ថែមការចំណាយ', 'Expenses', `${expense.description} - $${expense.amount.toFixed(2)}`);
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (window.confirm('តើអ្នកពិតជាចង់លុបការចំណាយនេះមែនទេ?')) {
      setExpenses(expenses.filter(e => e.id !== id));
      addLog('លុបការចំណាយ', 'Expenses', `${exp?.description} - $${exp?.amount.toFixed(2)}`);
    }
  };

  const addUser = (user: UserAccount) => {
    setUsers([{ ...user, createdAt: new Date().toISOString() }, ...users]);
    addLog('បង្កើតអ្នកប្រើប្រាស់ថ្មី', 'Users', `ឈ្មោះ: ${user.fullName}, ID: ${user.username}`);
  };

  const updateUser = (updated: UserAccount) => {
    const updatedUsers = users.map(u => u.id === updated.id ? updated : u);
    setUsers(updatedUsers);
    addLog('កែប្រែព័ត៌មានអ្នកប្រើប្រាស់', 'Users', `ឈ្មោះ: ${updated.fullName}, តួនាទី: ${updated.role}`);
    if (updated.id === currentUser?.id) {
      setCurrentUser(updated);
      localStorage.setItem('current_user', JSON.stringify(updated));
    }
  };

  const deleteUser = (id: string) => {
    if (id === currentUser?.id) return alert('អ្នកមិនអាចលុបគណនីដែលកំពុងប្រើប្រាស់បានទេ!');
    const target = users.find(u => u.id === id);
    if (window.confirm(`តើអ្នកពិតជាចង់លុបគណនី "${target?.fullName}" មែនទេ?`)) {
        setUsers(users.filter(u => u.id !== id));
        addLog('លុបអ្នកប្រើប្រាស់', 'Users', `ឈ្មោះ: ${target?.fullName}`);
    }
  };

  const updateBusinessInfo = (info: BusinessInfo) => {
    setBusinessInfo(info);
    addLog('កែប្រែការកំណត់ប្រព័ន្ធ', 'Settings', `កែប្រែព័ត៌មានអាជីវកម្ម: ${info.name}`);
  };

  const navItems = [
    ...(currentUser?.permissions.dashboard ? [{ id: 'dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', icon: LayoutDashboard }] : []),
    ...(currentUser?.permissions.inventory ? [{ id: 'inventory', label: 'បញ្ជីទំនិញ', icon: Package }] : []),
    ...(currentUser?.permissions.stockIn ? [{ id: 'stock-in', label: 'ទិញចូល / បញ្ជាទិញ', icon: Plus }] : []),
    ...(currentUser?.permissions.stockOut ? [{ id: 'stock-out', label: 'លក់ចេញ (Stock Out)', icon: ShoppingCart }] : []),
    ...(currentUser?.permissions.otherStockOut ? [{ id: 'other-stock-out', label: 'កាត់ស្តុកផ្សេងៗ', icon: ClipboardX }] : []),
    ...(currentUser?.permissions.expenses ? [{ id: 'expenses', label: 'ចំណាយផ្សេងៗ', icon: Wallet }] : []),
    ...(currentUser?.permissions.reports ? [{ id: 'reports', label: 'របាយការណ៍', icon: BarChart3 }] : []),
    ...(currentUser?.role === UserRole.ADMIN ? [{ id: 'users', label: 'អ្នកប្រើប្រាស់', icon: UsersIcon }] : []),
    ...(currentUser?.role === UserRole.ADMIN ? [{ id: 'settings', label: 'ការកំណត់', icon: SettingsIcon }] : []),
  ];

  if (!isAuthenticated) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col no-print border-r border-slate-800 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 overflow-hidden">
              {businessInfo.logo ? (
                <img src={businessInfo.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Package className="w-6 h-6 text-white" />
              )}
            </div>
            <h1 className="text-sm font-bold leading-tight truncate">
              {businessInfo.name.split(' ')[0]} <br />
              <span className="text-blue-400 text-[10px] uppercase tracking-tighter font-black">IMS Panel</span>
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
              <span className="font-semibold text-sm">{item.label}</span>
              {activeTab === item.id && <ChevronRight className="ml-auto w-4 h-4 text-white/50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 p-3 mb-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 border border-white/10">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{currentUser?.fullName}</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentUser?.role === UserRole.ADMIN ? 'អ្នកគ្រប់គ្រង' : 'បុគ្គលិក'}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all duration-300 text-sm font-bold border border-red-500/20 shadow-lg shadow-red-950/20 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            ចាកចេញពីប្រព័ន្ធ
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 no-print shadow-sm">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl w-96 border border-slate-100 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកអ្វីមួយ..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
               <span className="text-[10px] font-black uppercase tracking-widest">{currentUser?.role} PANEL</span>
            </div>
            <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 relative border border-transparent hover:border-slate-200 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 pb-20 custom-scrollbar">
          {activeTab === 'dashboard' && currentUser?.permissions.dashboard && (
            <Dashboard 
              products={products} 
              transactions={transactions} 
              expenses={expenses} 
              currentUser={currentUser}
              businessInfo={businessInfo}
            />
          )}
          {activeTab === 'inventory' && currentUser?.permissions.inventory && (
            <Inventory 
              products={products} 
              onAdd={addProduct} 
              onUpdate={updateProduct} 
              onDelete={deleteProduct} 
              businessInfo={businessInfo}
            />
          )}
          {(activeTab === 'stock-in' || activeTab === 'stock-out') && 
           ((activeTab === 'stock-in' && currentUser?.permissions.stockIn) || 
            (activeTab === 'stock-out' && currentUser?.permissions.stockOut)) && (
            <Transactions 
              type={activeTab === 'stock-in' ? TransactionType.PURCHASE : TransactionType.SALE}
              products={products}
              onAddTransaction={addTransaction}
              onDeleteTransaction={deleteTransaction}
              currentUser={currentUser}
              transactions={transactions.filter(t => 
                activeTab === 'stock-in' 
                ? (t.type === TransactionType.PURCHASE || t.type === TransactionType.PURCHASE_ORDER)
                : t.type === TransactionType.SALE
              )}
              businessInfo={businessInfo}
            />
          )}
          {activeTab === 'other-stock-out' && currentUser?.permissions.otherStockOut && (
            <OtherStockOut 
              products={products}
              onAddTransaction={addTransaction}
              onDeleteTransaction={deleteTransaction}
              currentUser={currentUser}
              transactions={transactions.filter(t => t.type === TransactionType.OTHER_OUT)}
            />
          )}
          {activeTab === 'expenses' && currentUser?.permissions.expenses && (
            <Expenses 
              expenses={expenses}
              onAddExpense={addExpense}
              onDeleteExpense={deleteExpense}
              currentUser={currentUser}
              businessInfo={businessInfo}
            />
          )}
          {activeTab === 'reports' && currentUser?.permissions.reports && (
            <Reports 
              transactions={transactions} 
              products={products} 
              expenses={expenses} 
              businessInfo={businessInfo}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'users' && currentUser?.role === UserRole.ADMIN && (
            <Users 
              users={users}
              onAdd={addUser}
              onUpdate={updateUser}
              onDelete={deleteUser}
              auditLogs={auditLogs}
            />
          )}
          {activeTab === 'settings' && currentUser?.role === UserRole.ADMIN && (
            <Settings 
              businessInfo={businessInfo}
              onUpdate={updateBusinessInfo}
            />
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;
