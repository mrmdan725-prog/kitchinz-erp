import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    UsersRound,
    Plus,
    Search,
    Edit,
    Trash2,
    Wallet,
    Calendar,
    Banknote,
    BadgeCheck,
    Briefcase,
    CheckSquare,
    Square,
    HandCoins,
    CircleDollarSign,
    Clock,
    LayoutGrid,
    List,
    CheckCircle2,
    Circle
} from 'lucide-react';

const Employees = () => {
    const { employees, addEmployee, updateEmployee, deleteEmployee, paySalary, accounts } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [selectedForBulk, setSelectedForBulk] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'

    const [newEmployee, setNewEmployee] = useState({
        name: '',
        role: '',
        baseSalary: '',
        joinDate: new Date().toISOString().split('T')[0]
    });

    const [payData, setPayData] = useState({
        amount: '',
        account: accounts[0]?.name || 'الخزنة الرئيسية'
    });

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalSalaries = employees.reduce((sum, emp) => sum + Number(emp.baseSalary), 0);

    const handleEmployeeSubmit = (e) => {
        e.preventDefault();
        if (editMode && selectedEmployee) {
            updateEmployee({ ...selectedEmployee, ...newEmployee });
        } else {
            addEmployee(newEmployee);
        }
        closeModal();
    };

    const handlePaySalary = (e) => {
        e.preventDefault();
        if (selectedEmployee) {
            paySalary(selectedEmployee.id, payData.amount, payData.account);
            setShowPayModal(false);
            setSelectedEmployee(null);
            setPayData({ amount: '', account: accounts[0]?.name || 'الخزنة الرئيسية' });
        }
    };

    const handleBulkPay = (e) => {
        e.preventDefault();
        if (selectedForBulk.length === 0) {
            alert('يرجى اختيار موظف واحد على الأقل.');
            return;
        }

        if (window.confirm(`هل أنت متأكد من صرف الرواتب لـ ${selectedForBulk.length} موظف؟`)) {
            selectedForBulk.forEach(empId => {
                const emp = employees.find(e => e.id === empId);
                if (emp) {
                    paySalary(emp.id, emp.baseSalary, payData.account);
                }
            });
            setShowBulkModal(false);
            setSelectedForBulk([]);
            alert('تم صرف الرواتب للموظفين المحددين بنجاح.');
        }
    };

    const toggleBulkSelect = (id) => {
        setSelectedForBulk(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedForBulk.length === filteredEmployees.length) {
            setSelectedForBulk([]);
        } else {
            setSelectedForBulk(filteredEmployees.map(emp => emp.id));
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setSelectedEmployee(null);
        setNewEmployee({
            name: '',
            role: '',
            baseSalary: '',
            joinDate: new Date().toISOString().split('T')[0]
        });
    };

    const startEdit = (emp) => {
        setSelectedEmployee(emp);
        setNewEmployee({
            name: emp.name,
            role: emp.role,
            baseSalary: emp.baseSalary,
            joinDate: emp.joinDate
        });
        setEditMode(true);
        setShowModal(true);
    };

    const startPay = (emp) => {
        setSelectedEmployee(emp);
        setPayData({ ...payData, amount: emp.baseSalary });
        setShowPayModal(true);
    };

    return (
        <div className="page dashboard-fade-in">
            <div className="module-header">
                <div className="module-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <div className="legendary-icon-container" style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                            <UsersRound size={24} color="white" />
                        </div>
                        <h1 style={{ fontSize: '24px' }}>إدارة شؤون الموظفين</h1>
                    </div>
                    <p>إدارة بيانات الفريق، الرواتب والمهام الوظيفية بكفاءة عالية.</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                        <div className="header-search-box" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                type="text"
                                placeholder="البحث باسم الموظف أو الوظيفة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="glass"
                                style={{
                                    width: '100%',
                                    padding: '12px 48px 12px 20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: 'white',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div className="layout-toggle">
                            <button
                                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="عرض القائمة"
                            >
                                <List size={20} />
                            </button>
                            <button
                                className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="عرض الشبكة"
                            >
                                <LayoutGrid size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="module-actions-container">
                    <button className="btn-bulk-pay" onClick={() => {
                        setSelectedForBulk([]);
                        setShowBulkModal(true);
                    }}>
                        <div className="btn-bulk-icon-wrapper">
                            <CircleDollarSign size={20} />
                        </div>
                        <div className="btn-bulk-content">
                            <span className="btn-bulk-title">صرف جماعي</span>
                            <span className="btn-bulk-subtitle">تحويل الرواتب دفعة واحدة</span>
                        </div>
                    </button>
                    <button className="btn-add-employee-premium" onClick={() => setShowModal(true)}>
                        <div className="btn-add-icon-wrapper">
                            <Plus size={20} />
                        </div>
                        <div className="btn-add-content">
                            <span className="btn-add-title">إضافة موظف</span>
                            <span className="btn-add-subtitle">ضم عضو جديد للفريق</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="icon-box" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                        <UsersRound size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">إجمالي الفريق</span>
                        <span className="stat-value">{employees.length} موظف</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="icon-box" style={{ background: 'rgba(70, 174, 76, 0.1)', color: '#46ae4c' }}>
                        <Banknote size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">كتلة الرواتب</span>
                        <span className="stat-value">{totalSalaries.toLocaleString()} ج.م</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="icon-box" style={{ background: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' }}>
                        <Calendar size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">تاريخ اليوم</span>
                        <span className="stat-value">{new Date().toLocaleDateString('ar-EG')}</span>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="table-container glass" style={{ marginTop: '32px' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>الموظف</th>
                                <th>الوظيفة</th>
                                <th>الراتب الأساسي</th>
                                <th>تاريخ التعاقد</th>
                                <th className="text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div style={{ fontWeight: '600' }}>{emp.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="role-badge">
                                            <Briefcase size={12} />
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{Number(emp.baseSalary).toLocaleString()} ج.م</td>
                                    <td>
                                        <div className="date-info">
                                            <Calendar size={14} className="text-secondary" />
                                            {new Date(emp.joinDate).toLocaleDateString('ar-EG')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-icon-action" onClick={() => startPay(emp)} title="صرف الراتب">
                                                <Wallet size={16} />
                                            </button>
                                            <button className="btn-icon-action" onClick={() => startEdit(emp)} title="تعديل">
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-icon-action delete-btn" onClick={() => { if (window.confirm(`هل أنت متأكد من حذف الموظف "${emp.name}"؟`)) deleteEmployee(emp.id); }} title="حذف">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center">لا يوجد موظفين يطابقون البحث.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid">
                    {filteredEmployees.length === 0 ? (
                        <div className="card glass text-center" style={{ gridColumn: '1 / -1', padding: '60px' }}>
                            <UsersRound size={48} className="text-secondary" style={{ margin: '0 auto 16px' }} />
                            <p className="text-secondary">لا يوجد موظفين يطابقون البحث</p>
                        </div>
                    ) : (
                        filteredEmployees.map(emp => (
                            <div key={emp.id} className="card glass employee-card-enhanced">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                    <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                                        {emp.name.charAt(0)}
                                    </div>
                                    <span className="role-badge" style={{ fontSize: '11px' }}>
                                        {emp.role}
                                    </span>
                                </div>
                                <h4 style={{ marginBottom: '8px' }}>{emp.name}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>الراتب الأساسي</div>
                                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{Number(emp.baseSalary).toLocaleString()} ج.م</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                                    <button className="btn-icon-action" onClick={() => startPay(emp)} title="صرف الراتب"><Wallet size={16} /></button>
                                    <button className="btn-icon-action" onClick={() => startEdit(emp)} title="تعديل"><Edit size={16} /></button>
                                    <button className="btn-icon-action delete-btn" onClick={() => { if (window.confirm(`حذف الموظف "${emp.name}"؟`)) deleteEmployee(emp.id); }} title="حذف"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '500px' }}>
                        <h3>{editMode ? 'تعديل بيانات موظف' : 'إضافة موظف جديد للفريق'}</h3>
                        <form onSubmit={handleEmployeeSubmit}>
                            <div className="form-group">
                                <label>اسم الموظف بالكامل</label>
                                <input
                                    required
                                    value={newEmployee.name}
                                    onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>المسمى الوظيفي</label>
                                    <input
                                        required
                                        value={newEmployee.role}
                                        onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>الراتب الأساسي</label>
                                    <input
                                        required
                                        type="number"
                                        value={newEmployee.baseSalary}
                                        onChange={e => setNewEmployee({ ...newEmployee, baseSalary: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>تاريخ الانضمام</label>
                                <input
                                    type="date"
                                    value={newEmployee.joinDate}
                                    onChange={e => setNewEmployee({ ...newEmployee, joinDate: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>إلغاء</button>
                                <button type="submit" className="btn-primary">{editMode ? 'حفظ التغييرات' : 'إضافة الموظف'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Salary Modal */}
            {showPayModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '400px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div className="icon-circle" style={{ background: 'rgba(70, 174, 76, 0.1)', color: '#46ae4c', margin: '0 auto 16px' }}>
                                <Banknote size={32} />
                            </div>
                            <h3>تأكيد صرف راتب</h3>
                            <p className="text-secondary">أنت على وشك صرف راتب الموظف: <br /><strong style={{ color: 'white' }}>{selectedEmployee?.name}</strong></p>
                        </div>
                        <form onSubmit={handlePaySalary}>
                            <div className="form-group">
                                <label>المبلغ المطلوب صرفه</label>
                                <input
                                    required
                                    type="number"
                                    value={payData.amount}
                                    onChange={e => setPayData({ ...payData, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>الصرف من حساب</label>
                                <select
                                    value={payData.account}
                                    onChange={e => setPayData({ ...payData, account: e.target.value })}
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.name}>{acc.name} ({acc.balance.toLocaleString()} ج.م)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowPayModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary" style={{ background: '#46ae4c' }}>تأكيد الصرف</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Pay Modal */}
            {showBulkModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '600px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div className="icon-circle" style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', margin: '0 auto 16px' }}>
                                <UsersRound size={32} />
                            </div>
                            <h3>صرف رواتب جماعي</h3>
                            <p className="text-secondary">قم باختيار الموظفين المراد تحويل رواتبهم المحددة في النظام</p>
                        </div>

                        <div className="bulk-selection-container">
                            <div className="bulk-header">
                                <div className="perm-item" onClick={toggleSelectAll}>
                                    <div className={`perm-checkbox ${selectedForBulk.length === filteredEmployees.length && filteredEmployees.length > 0 ? 'active' : ''}`}>
                                        {selectedForBulk.length === filteredEmployees.length && filteredEmployees.length > 0 && <CheckCircle2 size={16} />}
                                    </div>
                                    <strong style={{ color: 'white' }}>تحديد الكل ({filteredEmployees.length})</strong>
                                </div>
                                <span className="text-secondary">{selectedForBulk.length} موظفين محددين</span>
                            </div>

                            <div className="bulk-list">
                                {filteredEmployees.map(emp => (
                                    <div key={emp.id} className={`bulk-emp-item ${selectedForBulk.includes(emp.id) ? 'selected' : ''}`} onClick={() => toggleBulkSelect(emp.id)}>
                                        <div className="perm-checkbox">
                                            {selectedForBulk.includes(emp.id) ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                        </div>
                                        <div className="emp-brief">
                                            <span className="emp-name">{emp.name}</span>
                                            <span className="emp-salary">{Number(emp.baseSalary).toLocaleString()} ج.م</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bulk-footer" style={{ padding: '12px 16px', background: 'rgba(var(--primary-rgb), 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>إجمالي المبلغ المستحق:</span>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                                    {selectedForBulk.reduce((sum, id) => {
                                        const emp = employees.find(e => e.id === id);
                                        return sum + (Number(emp?.baseSalary) || 0);
                                    }, 0).toLocaleString()} ج.م
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleBulkPay} style={{ marginTop: '20px' }}>
                            <div className="form-group">
                                <label>الصرف من حساب</label>
                                <select
                                    value={payData.account}
                                    onChange={e => setPayData({ ...payData, account: e.target.value })}
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.name}>{acc.name} ({acc.balance.toLocaleString()} ج.م)</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowBulkModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary" style={{ background: '#46ae4c' }} disabled={selectedForBulk.length === 0}>
                                    تأكيد صرف {selectedForBulk.length} راتب
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .bulk-selection-container {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-glass);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }
                .bulk-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-glass);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.02);
                }
                .bulk-list {
                    max-height: 250px;
                    overflow-y: auto;
                }
                .bulk-emp-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-glass);
                    cursor: pointer;
                    transition: 0.2s;
                }
                .bulk-emp-item:last-child {
                    border-bottom: none;
                }
                .bulk-emp-item:hover {
                    background: rgba(var(--primary-rgb), 0.05);
                }
                .bulk-emp-item.selected {
                    background: rgba(var(--primary-rgb), 0.1);
                }
                .emp-brief {
                    display: flex;
                    justify-content: space-between;
                    flex: 1;
                    align-items: center;
                }
                .emp-name {
                    font-weight: 600;
                    font-size: 14px;
                }
                .emp-salary {
                    font-size: 13px;
                    color: var(--primary);
                    font-weight: 700;
                }
                .perm-checkbox {
                    color: var(--text-secondary);
                }
                .selected .perm-checkbox {
                    color: var(--primary);
                }

                .role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    font-size: 13px;
                    color: var(--text-secondary);
                }
                .date-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-secondary);
                }
                .table-actions {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .icon-circle {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .module-header {
                    margin-bottom: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 24px;
                    flex-wrap: wrap;
                }

                .module-info {
                    flex: 1;
                    min-width: 300px;
                }

                .module-actions-container {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                    align-items: center;
                }

                @media (max-width: 768px) {
                    .module-actions-container {
                        justify-content: center;
                        width: 100%;
                    }
                    .btn-bulk-pay, .btn-add-employee-premium {
                        flex: 1;
                        min-width: 200px;
                    }
                }

                .btn-bulk-pay, .btn-add-employee-premium {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 10px 20px 10px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 16px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                }

                .btn-add-employee-premium {
                    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.15) 0%, rgba(var(--primary-rgb), 0.05) 100%);
                    border-color: rgba(var(--primary-rgb), 0.3);
                }

                .btn-bulk-pay:hover, .btn-add-employee-premium:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
                    border-color: var(--primary);
                }

                .btn-bulk-icon-wrapper, .btn-add-icon-wrapper {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .btn-add-icon-wrapper {
                    background: var(--primary);
                    color: black;
                }

                .btn-bulk-icon-wrapper {
                    background: rgba(var(--primary-rgb), 0.2);
                    color: var(--primary);
                }

                .btn-bulk-pay:hover .btn-bulk-icon-wrapper {
                    background: var(--primary);
                    color: black;
                    transform: rotate(15deg);
                }

                .btn-add-employee-premium:hover .btn-add-icon-wrapper {
                    transform: rotate(90deg) scale(1.1);
                    box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.4);
                }

                .btn-bulk-content, .btn-add-content {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: right;
                }

                .btn-bulk-title, .btn-add-title {
                    font-size: 15px;
                    font-weight: 800;
                    letter-spacing: -0.2px;
                }

                .btn-bulk-subtitle, .btn-add-subtitle {
                    font-size: 11px;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .btn-bulk-pay::after, .btn-add-employee-premium::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 4px;
                    height: 100%;
                    background: var(--primary);
                    opacity: 0.6;
                }
            `}</style>
        </div>
    );
};

export default Employees;
