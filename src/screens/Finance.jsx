import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    Search,
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    PieChart,
    Edit,
    Trash2,
    Settings as SettingsIcon,
    X,
    Users,
    ExternalLink
} from 'lucide-react';

const Finance = () => {
    const {
        transactions,
        accounts,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        adjustAccountBalance,
        recurringExpenses,
        addRecurring,
        deleteRecurring,
        processRecurring,
        customers,
        systemSettings,
        adjustCustomerBalance
    } = useApp();
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const [showStatementModal, setShowStatementModal] = useState(false);
    const [accountEditMode, setAccountEditMode] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedAccountForStatement, setSelectedAccountForStatement] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const [newAdjustment, setNewAdjustment] = useState({
        newBalance: '',
        reason: ''
    });

    const [newRecurring, setNewRecurring] = useState({
        label: '',
        amount: '',
        category: 'مصاريف معرض',
        account: accounts[0]?.name || 'الخزنة الرئيسية'
    });
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        type: 'income',
        category: 'دفعة تعاقد',
        account: accounts[0]?.name || 'الخزنة الرئيسية',
        notes: ''
    });
    const [newAccount, setNewAccount] = useState({ name: '', balance: '' });
    const [transactionEditMode, setTransactionEditMode] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const netProfit = totalIncome - totalExpense;

    // Expense Categories Analysis
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const categoriesAnalysis = [
        { key: 'خامات', label: 'خامات', color: 'var(--primary)' },
        { key: 'رواتب', label: 'رواتب', color: '#36a2eb' },
        { key: 'مصاريف معرض', label: 'مصاريف معرض', color: '#ff6384' },
        { key: 'أخرى', label: 'أخرى', color: '#ffcc00' }
    ].map(cat => {
        const amount = expenseTransactions
            .filter(t => cat.key === 'أخرى'
                ? !['خامات', 'رواتب', 'مصاريف معرض'].includes(t.category)
                : t.category.includes(cat.key))
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return { ...cat, amount, percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0 };
    });

    const mainCategory = categoriesAnalysis.reduce((prev, current) => (prev.amount > current.amount) ? prev : current);

    // Conic Gradient String for the chart
    let currentTotal = 0;
    const gradientParts = categoriesAnalysis.map(cat => {
        const start = currentTotal;
        currentTotal += cat.percentage;
        return `${cat.color} ${start}% ${currentTotal}%`;
    }).join(', ');
    const chartBackground = `conic-gradient(${gradientParts})`;

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;

        let matchesDate = true;
        if (dateRange.start || dateRange.end) {
            const tDate = new Date(t.date).getTime();
            if (dateRange.start) {
                const start = new Date(dateRange.start).getTime();
                if (tDate < start) matchesDate = false;
            }
            if (dateRange.end) {
                const end = new Date(dateRange.end).getTime();
                // Add 23:59:59 to include the whole end day
                if (tDate > (end + 86399999)) matchesDate = false;
            }
        }

        return matchesSearch && matchesType && matchesDate;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (transactionEditMode && selectedTransaction) {
            updateTransaction({ ...selectedTransaction, ...newTransaction });
        } else {
            addTransaction(newTransaction);
        }
        setShowAddModal(false);
        setTransactionEditMode(false);
        setSelectedTransaction(null);
        setNewTransaction({
            amount: '',
            type: 'income',
            category: 'دفعة تعاقد',
            account: accounts[0]?.name || 'الخزنة الرئيسية',
            notes: ''
        });
    };

    const startEditTransaction = (t) => {
        setSelectedTransaction(t);
        setNewTransaction({
            amount: t.amount,
            type: t.type,
            category: t.category,
            account: t.account,
            notes: t.notes
        });
        setTransactionEditMode(true);
        setShowAddModal(true);
    };
    const confirmDeleteTransaction = () => {
        if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
        }
    };

    const handleProcessRecurring = (id) => {
        processRecurring(id);
    };

    const handleRecurringSubmit = (e) => {
        e.preventDefault();
        addRecurring(newRecurring);
        setShowRecurringModal(false);
        setNewRecurring({
            label: '',
            amount: '',
            category: 'مصاريف معرض',
            account: accounts[0]?.name || 'الخزنة الرئيسية'
        });
    };

    const handleAdjustment = (e) => {
        e.preventDefault();
        const newBal = parseFloat(newAdjustment.newBalance);

        if (selectedAccountForStatement.phone) {
            // It's a customer
            adjustCustomerBalance(selectedAccountForStatement.id, newBal, newAdjustment.reason);
        } else {
            // It's a standard account
            adjustAccountBalance(selectedAccountForStatement.id, newBal, newAdjustment.reason);
        }

        setShowStatementModal(false);
        setNewAdjustment({ newBalance: '', reason: '' });
    };

    const openStatement = (acc) => {
        setSelectedAccountForStatement(acc);
        setShowStatementModal(true);
    };

    const accountTransactions = selectedAccountForStatement
        ? transactions.filter(t => t.account === selectedAccountForStatement.name)
        : [];

    const handleAccountSubmit = (e) => {
        e.preventDefault();
        if (accountEditMode && selectedAccount) {
            updateAccount({ ...selectedAccount, ...newAccount });
        } else {
            addAccount(newAccount);
        }
        setShowAccountModal(false);
        setAccountEditMode(false);
        setSelectedAccount(null);
        setNewAccount({ name: '', balance: '' });
    };

    const startEditAccount = (acc) => {
        setSelectedAccount(acc);
        setNewAccount({ name: acc.name, balance: acc.balance });
        setAccountEditMode(true);
        setShowAccountModal(true);
    };

    return (
        <div className="page dashboard-fade-in">
            <div className="page-header">
                <div>
                    <h2>المالية والمحاسبة</h2>
                    <p className="text-secondary">إدارة الحسابات، التدفقات النقدية والتقارير المالية</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    <span>إضافة عملية مالية</span>
                </button>
            </div>

            {/* Financial Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="icon-box" style={{ background: 'rgba(70, 174, 76, 0.1)', color: '#46ae4c' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">إجمالي الوارد</span>
                        <span className="stat-value text-success">{totalIncome.toLocaleString()} ج.م</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="icon-box" style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d' }}>
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">إجمالي المصروفات</span>
                        <span className="stat-value text-danger">{totalExpense.toLocaleString()} ج.م</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="icon-box" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--primary)' }}>
                        <Wallet size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">صافي الربح</span>
                        <span className="stat-value" style={{ color: netProfit >= 0 ? '#46ae4c' : '#ff4d4d' }}>
                            {netProfit.toLocaleString()} ج.م
                        </span>
                    </div>
                </div>
            </div>

            <div className="finance-grid">
                {/* Account Balances */}
                <div className="card">
                    <div className="card-header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <CreditCard size={20} className="text-primary" />
                            <h3>حسابات المعرض</h3>
                        </div>
                        <button className="btn-icon" title="إدارة الحسابات" onClick={() => setShowAccountModal(true)}>
                            <SettingsIcon size={18} />
                        </button>
                    </div>
                    <div className="accounts-list">
                        {accounts.map(acc => (
                            <div
                                key={acc.id}
                                className="account-item"
                                onDoubleClick={() => openStatement(acc)}
                                title="اضغط مرتين لعرض كشف الحساب"
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="account-info">
                                    <div className="account-details">
                                        <span className="account-name">{acc.name}</span>
                                        <div className="account-actions">
                                            <button className="btn-icon small" onClick={(e) => { e.stopPropagation(); startEditAccount(acc); }}><Edit size={12} /></button>
                                            <button className="btn-icon small text-danger" onClick={(e) => { e.stopPropagation(); deleteAccount(acc.id); }}><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                    <span className="account-balance">{(acc.balance || 0).toLocaleString()} ج.م</span>
                                </div>
                                <div className="balance-bar">
                                    <div className="balance-progress" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer Accounts */}
                <div className="card">
                    <div className="card-header">
                        <Users size={20} className="text-primary" />
                        <h3>حسابات العملاء (رصيد المشاريع)</h3>
                    </div>
                    <div className="accounts-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {customers.map(customer => (
                            <div
                                key={customer.id}
                                className="account-item"
                                onDoubleClick={() => openStatement(customer)}
                                title="اضغط مرتين لعرض كشف الحساب"
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="account-info">
                                    <div className="account-details">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="account-name">{customer.name}</span>
                                            <div className="account-actions">
                                                <button
                                                    className="btn-icon small"
                                                    title="ملف العميل"
                                                    onClick={(e) => { e.stopPropagation(); navigate('/customers'); }}
                                                >
                                                    <ExternalLink size={12} />
                                                </button>
                                                <button
                                                    className="btn-icon small"
                                                    title="تسوية الرصيد"
                                                    onClick={(e) => { e.stopPropagation(); openStatement(customer); }}
                                                >
                                                    <SettingsIcon size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <small className="text-secondary" style={{ fontSize: '11px', display: 'block' }}>{customer.phone}</small>
                                    </div>
                                    <span className={`account-balance ${(customer.balance || 0) < 0 ? 'text-danger' : 'text-success'}`}>
                                        {(customer.balance || 0).toLocaleString()} {systemSettings?.currency || 'ج.م'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {customers.length === 0 && (
                            <p className="text-secondary" style={{ textAlign: 'center', padding: '20px' }}>لا يوجد عملاء مسجلين</p>
                        )}
                    </div>
                </div>

                {/* Financial Chart */}
                <div className="card">
                    <div className="card-header">
                        <PieChart size={20} className="text-primary" />
                        <h3>تحليل النفقات</h3>
                    </div>
                    <div className="chart-placeholder">
                        <div className="donut-chart" style={{ background: chartBackground }}>
                            <div className="donut-center">
                                <span>{Math.round(mainCategory.percentage)}%</span>
                                <small>{mainCategory.label}</small>
                            </div>
                        </div>
                        <div className="chart-legend">
                            {categoriesAnalysis.map(cat => (
                                <div key={cat.key} className="legend-item">
                                    <span className="dot" style={{ background: cat.color }}></span>
                                    {cat.label} ({Math.round(cat.percentage)}%)
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="finance-grid" style={{ marginTop: '24px' }}>
                {/* Recurring Expenses (Bills) */}
                <div className="card">
                    <div className="card-header" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Calendar size={20} className="text-primary" />
                            <h3>مصروفات دورية (فواتير)</h3>
                        </div>
                        <button className="btn-icon" onClick={() => setShowRecurringModal(true)} title="إضافة قالب مصروف">
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="recurring-list">
                        {recurringExpenses.map(item => (
                            <div key={item.id} className="recurring-item">
                                <div className="recurring-info">
                                    <div className="recurring-title">{item.label}</div>
                                    <div className="recurring-meta">{item.category} • {item.account}</div>
                                </div>
                                <div className="recurring-actions">
                                    <div className="recurring-amount">{Number(item.amount).toLocaleString()} ج.م</div>
                                    <button className="btn-pay-recurring" onClick={() => handleProcessRecurring(item.id)}>
                                        صرف الآن
                                    </button>
                                    <button className="btn-icon small text-danger" onClick={() => deleteRecurring(item.id)}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {recurringExpenses.length === 0 && (
                            <p className="text-secondary" style={{ textAlign: 'center', padding: '20px' }}>لا توجد مصروفات دورية مسجلة</p>
                        )}
                    </div>
                </div>

                {/* Transactions Table Tooltip or Stats */}
                <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #36a2eb 100%)', color: 'white' }}>
                    <div style={{ padding: '20px' }}>
                        <h4 style={{ opacity: 0.9, marginBottom: '8px' }}>نصيحة مالية</h4>
                        <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                            تأكد من مراجعة سجل المعاملات أسبوعياً لمطابقة الأرصدة الفعلية في الخزنة مع أرصدة النظام لضمان دقة التقارير.
                        </p>
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>#دقة_محاسبية</span>
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>#نمو_ذكي</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="table-container" style={{ marginTop: '32px' }}>
                <div className="table-header-tools">
                    <div className="search-bar" style={{ margin: 0, border: 'none', background: 'transparent' }}>
                        <Search size={18} className="text-secondary" />
                        <input
                            placeholder="بحث في العمليات..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        {(filterType !== 'all' || dateRange.start || dateRange.end) && (
                            <button
                                className="clear-filters-btn"
                                onClick={() => {
                                    setFilterType('all');
                                    setDateRange({ start: '', end: '' });
                                }}
                            >
                                <X size={14} />
                                <span>مسح الفلاتر</span>
                            </button>
                        )}
                        <button
                            className={`btn-icon ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="filter-bar glass" style={{ marginBottom: '24px', padding: '20px', borderRadius: '14px', display: 'flex', gap: '32px', flexWrap: 'wrap', animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div className="filter-item">
                            <label className="filter-label">نوع العملية</label>
                            <div className="segmented-control">
                                <button
                                    className={`segment-btn ${filterType === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilterType('all')}
                                >
                                    الكل
                                </button>
                                <button
                                    className={`segment-btn ${filterType === 'income' ? 'active' : ''}`}
                                    onClick={() => setFilterType('income')}
                                >
                                    وارد
                                </button>
                                <button
                                    className={`segment-btn expense ${filterType === 'expense' ? 'active' : ''}`}
                                    onClick={() => setFilterType('expense')}
                                >
                                    صادر
                                </button>
                            </div>
                        </div>
                        <div className="filter-item">
                            <label className="filter-label">من تاريخ</label>
                            <input
                                type="date"
                                className="professional-date-input"
                                value={dateRange.start}
                                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div className="filter-item">
                            <label className="filter-label">إلى تاريخ</label>
                            <input
                                type="date"
                                className="professional-date-input"
                                value={dateRange.end}
                                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                    </div>
                )}
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>البيان</th>
                            <th>الحساب</th>
                            <th>النوع</th>
                            <th>المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(t => (
                            <tr key={t.id}>
                                <td>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                                <td>
                                    <div style={{ fontWeight: '500' }}>{t.category}</div>
                                    <div className="text-secondary" style={{ fontSize: '12px' }}>{t.notes}</div>
                                </td>
                                <td>{t.account}</td>
                                <td>
                                    <span className={`badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                                        {t.type === 'income' ? (
                                            <><ArrowDownLeft size={12} /> وارد</>
                                        ) : (
                                            <><ArrowUpRight size={12} /> صادر</>
                                        )}
                                    </span>
                                </td>
                                <td style={{ fontWeight: '700' }} className={t.type === 'income' ? 'text-success' : 'text-danger'}>
                                    {t.type === 'income' ? '+' : '-'}{parseFloat(t.amount).toLocaleString()} ج.م
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button className="btn-icon small" title="تعديل" onClick={() => startEditTransaction(t)}>
                                            <Edit size={12} />
                                        </button>
                                        <button className="btn-icon small text-danger" title="حذف" onClick={() => setTransactionToDelete(t)}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '500px' }}>
                        <h3>{transactionEditMode ? 'تعديل عملية مالية' : 'إضافة عملية مالية جديدة'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>المبلغ</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    value={newTransaction.amount}
                                    onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>النوع</label>
                                    <select
                                        value={newTransaction.type}
                                        onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                    >
                                        <option value="income">وارد (دخل)</option>
                                        <option value="expense">صادر (مصروف)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>الحساب</label>
                                    <select
                                        value={newTransaction.account}
                                        onChange={e => setNewTransaction({ ...newTransaction, account: e.target.value })}
                                    >
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.name}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>التصنيف</label>
                                <input
                                    required
                                    list="category-suggestions"
                                    placeholder="مثلاً: دفعة تعاقد، فاتورة كهرباء..."
                                    value={newTransaction.category}
                                    onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                />
                                <datalist id="category-suggestions">
                                    {newTransaction.type === 'income' ? (
                                        <>
                                            <option value="دفعة تعاقد" />
                                            <option value="صيانة ملحقة" />
                                            <option value="تعديل تصميم" />
                                        </>
                                    ) : (
                                        <>
                                            <option value="رواتب" />
                                            <option value="خامات" />
                                            <option value="مصاريف معرض" />
                                            <option value="كهرباء ومياه" />
                                            <option value="إيجار" />
                                        </>
                                    )}
                                </datalist>
                            </div>
                            <div className="form-group">
                                <label>ملاحظات إضافية</label>
                                <textarea
                                    rows="3"
                                    value={newTransaction.notes}
                                    onChange={e => setNewTransaction({ ...newTransaction, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary">حفظ العملية</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Account Statement Modal */}
            {showStatementModal && selectedAccountForStatement && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="modal-header-tools">
                            <h3>كشف حساب: {selectedAccountForStatement.name}</h3>
                            <div className="account-total-badge">
                                الرصيد الحالي: {selectedAccountForStatement.balance.toLocaleString()} ج.م
                            </div>
                        </div>

                        <div className="statement-layout">
                            <div className="statement-table-container">
                                <table className="data-table small">
                                    <thead>
                                        <tr>
                                            <th>التاريخ</th>
                                            <th>البيان</th>
                                            <th>المبلغ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accountTransactions.map(t => (
                                            <tr key={t.id}>
                                                <td>{new Date(t.date).toLocaleDateString('ar-EG')}</td>
                                                <td>{t.category} {t.notes && <span className="text-secondary" style={{ fontSize: '11px' }}>({t.notes})</span>}</td>
                                                <td className={t.type === 'income' ? 'text-success' : 'text-danger'} style={{ fontWeight: '600' }}>
                                                    {t.type === 'income' ? '+' : '-'}{parseFloat(t.amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {accountTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }} className="text-secondary">لا توجد معاملات مسجلة لهذا الحساب</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="statement-audit-sidebar">
                                <div className="audit-card">
                                    <h4>تسوية الرصيد يدويًا</h4>
                                    <p className="text-secondary" style={{ fontSize: '12px', marginBottom: '16px' }}>
                                        استخدم هذا الخيار لتصحيح الرصيد في حال وجود فروق مع الخزينة الفعلية.
                                    </p>
                                    <form onSubmit={handleAdjustment}>
                                        <div className="form-group">
                                            <label>الرصيد الفعلي الجديد</label>
                                            <input
                                                required
                                                type="number"
                                                placeholder="0.00"
                                                value={newAdjustment.newBalance}
                                                onChange={e => setNewAdjustment({ ...newAdjustment, newBalance: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>سبب التسوية</label>
                                            <textarea
                                                required
                                                rows="3"
                                                placeholder="مثلاً: جرد نقدي، مصاريف نثرية غير مسجلة..."
                                                value={newAdjustment.reason}
                                                onChange={e => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>تحديث الرصيد نهائياً</button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '24px' }}>
                            <button type="button" className="btn-secondary" onClick={() => setShowStatementModal(false)}>إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Recurring Expense Modal */}
            {showRecurringModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '450px' }}>
                        <h3>إضافة قالب مصروف دوري</h3>
                        <form onSubmit={handleRecurringSubmit}>
                            <div className="form-group">
                                <label>وصف المصروف (مثلاً: إيجار المعرض)</label>
                                <input
                                    required
                                    value={newRecurring.label}
                                    onChange={e => setNewRecurring({ ...newRecurring, label: e.target.value })}
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>المبلغ الثابت</label>
                                    <input
                                        required
                                        type="number"
                                        value={newRecurring.amount}
                                        onChange={e => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>التصنيف</label>
                                    <select
                                        value={newRecurring.category}
                                        onChange={e => setNewRecurring({ ...newRecurring, category: e.target.value })}
                                    >
                                        <option value="مصاريف معرض">مصاريف معرض</option>
                                        <option value="كهرباء ومياه">كهرباء ومياه</option>
                                        <option value="إيجار">إيجار</option>
                                        <option value="نشر وتسويق">نشر وتسويق</option>
                                        <option value="بنزين وانتقالات">بنزين وانتقالات</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>يخصم من حساب</label>
                                <select
                                    value={newRecurring.account}
                                    onChange={e => setNewRecurring({ ...newRecurring, account: e.target.value })}
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.name}>{acc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowRecurringModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary">حفظ القالب</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Transaction Confirmation */}
            {transactionToDelete && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <h3 style={{ color: '#ff4d4d', marginBottom: '20px' }}>تأكيد الحذف</h3>
                        <p style={{ marginBottom: '30px' }}>
                            هل أنت متأكد من رغبتك في حذف عملية "<strong>{transactionToDelete.category}</strong>" بمبلغ <strong>{parseFloat(transactionToDelete.amount).toLocaleString()} ج.م</strong>؟
                            <br />
                            <small className="text-secondary">(سيتم تعديل رصيد الخزينة تلقائياً)</small>
                        </p>
                        <div className="modal-actions" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0 }}>
                            <button className="btn-secondary" onClick={() => setTransactionToDelete(null)}>إلغاء</button>
                            <button className="btn-primary" style={{ background: '#ff4d4d' }} onClick={confirmDeleteTransaction}>حذف الآن</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Account Modal */}
            {showAccountModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '450px' }}>
                        <h3>{accountEditMode ? 'تعديل حساب' : 'إضافة حساب معرض جديد'}</h3>
                        <form onSubmit={handleAccountSubmit}>
                            <div className="form-group">
                                <label>اسم الحساب (خزنة، بنك، عهدة...)</label>
                                <input
                                    required
                                    type="text"
                                    value={newAccount.name}
                                    onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>الرصيد الافتتاحي</label>
                                <input
                                    required
                                    type="number"
                                    value={newAccount.balance}
                                    onChange={e => setNewAccount({ ...newAccount, balance: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => { setShowAccountModal(false); setAccountEditMode(false); }}>إلغاء</button>
                                <button type="submit" className="btn-primary">{accountEditMode ? 'تحديث الحساب' : 'حفظ الحساب'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .finance-grid {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 24px;
                    margin-top: 32px;
                }
                .account-item {
                    padding: 16px 0;
                    border-bottom: 1px solid var(--border-color);
                }
                .account-item:last-child {
                    border-bottom: none;
                }
                .account-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }
                .account-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .account-actions {
                    display: flex;
                    gap: 6px;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .account-item:hover .account-actions {
                    opacity: 1;
                }
                .btn-icon.small {
                    padding: 4px;
                    border-radius: 4px;
                }
                .account-name {
                    font-weight: 500;
                    color: var(--text-secondary);
                }
                .account-balance {
                    font-weight: 700;
                    color: white;
                }
                .balance-bar {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .balance-progress {
                    height: 100%;
                    background: var(--primary);
                    border-radius: 3px;
                }
                .badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                .badge-success {
                    background: rgba(70, 174, 76, 0.1);
                    color: #46ae4c;
                }
                .badge-danger {
                    background: rgba(255, 77, 77, 0.1);
                    color: #ff4d4d;
                }
                .table-header-tools {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--border-color);
                }
                .filter-group {
                    display: flex;
                    gap: 8px;
                }
                .chart-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px 0;
                }
                .donut-chart {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .donut-center {
                    width: 110px;
                    height: 110px;
                    background: var(--bg-surface);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
                }
                .donut-center span {
                    font-size: 24px;
                    font-weight: 700;
                    color: white;
                }
                .donut-center small {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                .chart-legend {
                    margin-top: 24px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    width: 100%;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }
                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 2px;
                }
                .recurring-list {
                    margin-top: 10px;
                }
                .recurring-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid var(--border-color);
                }
                .recurring-item:last-child {
                    border-bottom: none;
                }
                .recurring-title {
                    font-weight: 600;
                    margin-bottom: 2px;
                }
                .recurring-meta {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                .recurring-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .recurring-amount {
                    font-weight: 700;
                    color: var(--primary);
                }
                .btn-pay-recurring {
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary);
                    border: 1px solid var(--primary);
                    padding: 4px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: 0.3s;
                }
                .btn-pay-recurring:hover {
                    background: var(--primary);
                    color: white;
                }
                .modal-header-tools {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .account-total-badge {
                    background: rgba(var(--primary-rgb), 0.1);
                    color: var(--primary);
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-weight: 700;
                    border: 1px dashed var(--primary);
                }
                .statement-layout {
                    display: grid;
                    grid-template-columns: 1fr 280px;
                    gap: 24px;
                }
                .statement-table-container {
                    max-height: 400px;
                    overflow-y: auto;
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                }
                .data-table.small {
                    font-size: 13px;
                }
                .data-table.small th, .data-table.small td {
                    padding: 10px 16px;
                }
                .audit-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid var(--border-color);
                    padding: 20px;
                    border-radius: 12px;
                }
                .audit-card h4 {
                    margin-bottom: 8px;
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
};

export default Finance;
