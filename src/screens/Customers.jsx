import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import InspectionForm from '../components/InspectionForm';
import {
    Plus,
    Search,
    User,
    History,
    FileText,
    ShoppingCart,
    Calendar,
    DollarSign,
    Package,
    Edit2,
    Trash2
} from 'lucide-react';

const Customers = () => {
    const {
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        contracts,
        purchases,
        transactions,
        inventory,
        accounts,
        addPurchase,
        inspections,
        addInspection,
        updateInspection,
        deleteInspection,
        addInvoice,
        systemSettings
    } = useApp();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        email: '',
        projectType: 'kitchen' // Default to kitchen
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // info, contracts, purchases, finances, inspections
    const [showInspectionModal, setShowInspectionModal] = useState(false);
    const [inspectionType, setInspectionType] = useState('kitchen');

    const [purchaseData, setPurchaseData] = useState({
        materialName: '',
        quantity: '',
        unitPrice: '',
        account: accounts[0]?.name || 'الخزنة الرئيسية'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing && selectedCustomer) {
            updateCustomer({ ...selectedCustomer, ...formData });
        } else {
            addCustomer(formData);
        }
        setShowModal(false);
        setIsEditing(false);
        setFormData({ name: '', phone: '', address: '', email: '', projectType: 'kitchen' });
    };

    const handlePurchaseSubmit = (e) => {
        e.preventDefault();
        addPurchase({
            ...purchaseData,
            customerName: selectedCustomer.name,
            customerId: selectedCustomer.id,
            total: Number(purchaseData.quantity) * Number(purchaseData.unitPrice)
        });
        setShowPurchaseModal(false);
        setPurchaseData({
            materialName: '',
            quantity: '',
            unitPrice: '',
            account: accounts[0]?.name || 'الخزنة الرئيسية'
        });
    };

    const handleCreateContract = (customer) => {
        // Navigate to contracts with customer info in state
        navigate('/contracts', { state: { selectedCustomerName: customer.name } });
    };

    const handleAddInspection = (customer, type) => {
        setSelectedCustomer(customer);
        setInspectionType(type);
        setShowInspectionModal(true);
    };

    const handleInspectionSubmit = (data) => {
        addInspection(data);
        setShowInspectionModal(false);
        setActiveTab('inspections');
        setShowHistoryModal(true);
    };

    const handleGenerateInspectionInvoice = (ins) => {
        const fee = Number(systemSettings.inspectionFee || 500); // Dynamic fee from settings
        const invoice = {
            customerId: ins.customerId,
            customerName: selectedCustomer.name,
            customerAddress: selectedCustomer.address,
            customerPhone: selectedCustomer.phone,
            type: 'inspection',
            date: new Date().toISOString(),
            status: 'draft',
            relatedId: ins.id,
            items: [
                { description: `رسوم معاينة فنية - ${ins.type === 'kitchen' ? 'مطبخ' : 'درسينج'}`, quantity: 1, unitPrice: fee, total: fee }
            ],
            subtotal: fee,
            taxAmount: (fee * (systemSettings.taxRate || 14)) / 100,
            discount: 0,
            totalAmount: fee + ((fee * (systemSettings.taxRate || 14)) / 100)
        };
        addInvoice(invoice);
        alert('تم إنشاء مسودة فاتورة المعاينة بنجاح.');
    };

    const openCustomerDetails = (customer) => {
        setSelectedCustomer(customer);
        setFormData({ name: customer.name, phone: customer.phone, address: customer.address || '', email: customer.email || '' });
        setShowHistoryModal(true);
        setIsEditing(false);
    };

    const handleEditClick = (e, customer) => {
        e.stopPropagation();
        setSelectedCustomer(customer);
        setFormData({ name: customer.name, phone: customer.phone, address: customer.address || '', email: customer.email || '' });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDeleteClick = (e, customer) => {
        e.stopPropagation();
        if (window.confirm(`هل أنت متأكد من حذف العميل ${customer.name}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
            deleteCustomer(customer.id);
        }
    };

    const customerInspections = selectedCustomer ? (inspections || []).filter(i => i.customerId === selectedCustomer.id) : [];
    const customerContracts = selectedCustomer ? (contracts || []).filter(c =>
        (c.customer?.name === selectedCustomer.name) || (c.clientName === selectedCustomer.name)
    ) : [];
    const customerPurchases = selectedCustomer ? (purchases || []).filter(p => p.customerName === selectedCustomer.name) : [];
    const customerTransactions = selectedCustomer ? (transactions || []).filter(t =>
        t.notes?.toString().includes(selectedCustomer.name) || t.account?.toString().includes(selectedCustomer.name)
    ) : [];

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <h2>إدارة العملاء</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    إضافة عميل
                </button>
            </div>

            <div className="search-bar glass">
                <Search size={20} />
                <input
                    type="text"
                    placeholder="البحث بالاسم أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    dir="rtl"
                />
            </div>

            <div className="grid">
                {filteredCustomers.map(customer => (
                    <div key={customer.id} className="card glass">
                        <div className="card-header">
                            <div className="customer-avatar">
                                <User size={24} />
                            </div>
                            <div>
                                <h3>{customer.name}</h3>
                                <p>{customer.phone}</p>
                            </div>
                        </div>
                        <div className="card-body">
                            <p><strong>البريد الإلكتروني:</strong> {customer.email}</p>
                            <p><strong>العنوان:</strong> {customer.address}</p>
                            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(70, 174, 76, 0.05)', borderRadius: '8px', border: '1px solid rgba(70, 174, 76, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>رصيد المشروع:</span>
                                    <span style={{ fontWeight: '700', color: '#46ae4c', fontSize: '16px' }}>
                                        {(customer.balance || 0).toLocaleString()} <small>ج.م</small>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="card-footer customer-actions-modern">
                            <button className="btn-action-view" onClick={() => openCustomerDetails(customer)}>
                                <History size={16} />
                                <span>عرض التفاصيل</span>
                            </button>
                            <button className="btn-action-edit" onClick={(e) => handleEditClick(e, customer)}>
                                <Edit2 size={16} />
                                <span>تعديل</span>
                            </button>
                            <button className="btn-action-delete" onClick={(e) => handleDeleteClick(e, customer)}>
                                <Trash2 size={16} />
                                <span>حذف</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal glass">
                        <h3>{isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>الاسم الكامل</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>رقم الهاتف</label>
                                <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>البريد الإلكتروني</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>العنوان</label>
                                <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>نوع المشروع</label>
                                <select
                                    value={formData.projectType}
                                    onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border-glass)',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'white',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="kitchen" style={{ background: '#1a1a1a', color: 'white' }}>مطبخ</option>
                                    <option value="dressing" style={{ background: '#1a1a1a', color: 'white' }}>دريسنج روم</option>
                                    <option value="both" style={{ background: '#1a1a1a', color: 'white' }}>كلاهما (مطبخ + دريسنج)</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary">حفظ العميل</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showHistoryModal && selectedCustomer && (
                <div className="modal-overlay">
                    <div className="modal glass customer-details-modal">
                        <div className="modal-header">
                            <div className="customer-header-info">
                                <div className="customer-avatar-large">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3>{selectedCustomer.name}</h3>
                                    <p className="text-secondary">{selectedCustomer.phone}</p>
                                </div>
                            </div>
                            <div className="header-actions">
                                <button className="btn-icon-bg" onClick={() => { setIsEditing(true); setShowModal(true); setShowHistoryModal(false); }} title="تعديل البيانات"><Edit2 size={18} /></button>
                                <button className="btn-icon" onClick={() => setShowHistoryModal(false)}>&times;</button>
                            </div>
                        </div>

                        <div className="customer-tabs">
                            <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>البيانات الأساسية</button>
                            <button className={`tab-btn ${activeTab === 'inspections' ? 'active' : ''}`} onClick={() => setActiveTab('inspections')}>المعاينات ({customerInspections.length})</button>
                            <button className={`tab-btn ${activeTab === 'contracts' ? 'active' : ''}`} onClick={() => setActiveTab('contracts')}>العقود ({customerContracts.length})</button>
                            <button className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>المشتريات ({customerPurchases.length})</button>
                            <button className={`tab-btn ${activeTab === 'finances' ? 'active' : ''}`} onClick={() => setActiveTab('finances')}>الحسابات ({customerTransactions.length})</button>
                        </div>

                        <div className="tab-content-scroller">
                            {activeTab === 'info' && (
                                <div className="tab-pane info-grid">
                                    <div className="info-item">
                                        <label>رقم الهاتف</label>
                                        <p>{selectedCustomer.phone}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>البريد الإلكتروني</label>
                                        <p>{selectedCustomer.email || 'غير مسجل'}</p>
                                    </div>
                                    <div className="info-item full-width">
                                        <label>العنوان</label>
                                        <p>{selectedCustomer.address || 'غير مسجل'}</p>
                                    </div>
                                    <div className="info-item balance-card">
                                        <label>رصيد العميل الحالي</label>
                                        <div className="balance-value">
                                            {(selectedCustomer.balance || 0).toLocaleString()} <span>ج.م</span>
                                        </div>
                                    </div>
                                    <div className="quick-actions-grid">
                                        <button className="action-card" onClick={() => { setShowPurchaseModal(true); }}>
                                            <ShoppingCart size={20} />
                                            <span>طلب شراء</span>
                                        </button>
                                        <button className="action-card" onClick={() => handleCreateContract(selectedCustomer)}>
                                            <FileText size={20} />
                                            <span>إنشاء عقد</span>
                                        </button>
                                        <button className="action-card btn-inspection-kitchen" onClick={() => handleAddInspection(selectedCustomer, 'kitchen')}>
                                            <Search size={20} />
                                            <span>معاينة مطبخ</span>
                                        </button>
                                        <button className="action-card btn-inspection-dressing" onClick={() => handleAddInspection(selectedCustomer, 'dressing')}>
                                            <Package size={20} />
                                            <span>معاينة درسينج</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inspections' && (
                                <div className="tab-pane">
                                    <div className="history-list-modern">
                                        {customerInspections.map(ins => (
                                            <div key={ins.id} className="history-item-modern inspection-item">
                                                <div className="item-main">
                                                    <div className={`inspection-type-icon ${ins.type}`}>
                                                        {ins.type === 'kitchen' ? <Search size={18} /> : <Package size={18} />}
                                                    </div>
                                                    <div>
                                                        <span className="item-title">معاينة {ins.type === 'kitchen' ? 'مطبخ' : 'درسينج'}</span>
                                                        <span className="item-date">{new Date(ins.date).toLocaleDateString('ar-EG')}</span>
                                                    </div>
                                                </div>
                                                <div className="item-actions">
                                                    <span className="representative-tag">{ins.representative || 'بدون مهندس'}</span>
                                                    <button className="btn-text" onClick={() => handleGenerateInspectionInvoice(ins)} title="إصدار فاتورة رسوم">فاتورة</button>
                                                    <button className="btn-text" onClick={() => alert('قريباً: عرض ملف المعاينة كاملاً')}>عرض</button>
                                                </div>
                                            </div>
                                        ))}
                                        {customerInspections.length === 0 && <div className="empty-state-min"><p>لا توجد معاينات مسجلة</p></div>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contracts' && (
                                <div className="tab-pane">
                                    <div className="history-list-modern">
                                        {customerContracts.map(c => (
                                            <div key={c.id || Math.random()} className="history-item-modern">
                                                <div className="item-main">
                                                    <FileText size={18} className="text-primary" />
                                                    <div>
                                                        <span className="item-title">{c.projectType || 'عقد مشروع'}</span>
                                                        <span className="item-date">{c.contractDate}</span>
                                                    </div>
                                                </div>
                                                <button className="btn-text" onClick={() => navigate('/contracts')}>مشاهدة</button>
                                            </div>
                                        ))}
                                        {customerContracts.length === 0 && <div className="empty-state-min"><p>لا توجد عقود مسجلة</p></div>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'purchases' && (
                                <div className="tab-pane">
                                    <div className="history-list-modern">
                                        {customerPurchases.map(p => (
                                            <div key={p.id || Math.random()} className="history-item-modern">
                                                <div className="item-main">
                                                    <Package size={18} className="text-secondary" />
                                                    <div>
                                                        <span className="item-title">{p.materialName} ({p.quantity || 0})</span>
                                                        <span className="item-date">{new Date(p.date).toLocaleDateString('ar-EG')}</span>
                                                    </div>
                                                </div>
                                                <span className="item-amount">{(Number(p.total) || 0).toLocaleString()} ج.م</span>
                                            </div>
                                        ))}
                                        {customerPurchases.length === 0 && <div className="empty-state-min"><p>لا توجد مشتريات مسجلة</p></div>}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'finances' && (
                                <div className="tab-pane">
                                    <div className="history-list-modern">
                                        {customerTransactions.map(t => (
                                            <div key={t.id || Math.random()} className="history-item-modern">
                                                <div className="item-main">
                                                    <DollarSign size={18} className={t.type === 'income' ? 'text-success' : 'text-danger'} />
                                                    <div>
                                                        <span className="item-title">{t.category}</span>
                                                        <span className="item-date">{new Date(t.date).toLocaleDateString('ar-EG')}</span>
                                                    </div>
                                                </div>
                                                <span className={`item-amount ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                                    {t.type === 'income' ? '+' : '-'}{(Number(t.amount) || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                        {customerTransactions.length === 0 && <div className="empty-state-min"><p>لا توجد عمليات مالية</p></div>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions-sticky">
                            <button className="btn-secondary" onClick={() => setShowHistoryModal(false)}>إغلاق</button>
                        </div>
                    </div>
                </div>
            )}

            {showPurchaseModal && selectedCustomer && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <ShoppingCart className="text-primary" />
                            <h3>طلب شراء للعميل: {selectedCustomer.name}</h3>
                        </div>
                        <form onSubmit={handlePurchaseSubmit}>
                            <div className="form-group">
                                <label>المادة / الخامة</label>
                                <input
                                    required
                                    list="inventory-list"
                                    value={purchaseData.materialName}
                                    onChange={e => setPurchaseData({ ...purchaseData, materialName: e.target.value })}
                                    placeholder="اختر من المخزن أو ادخل خامة جديدة"
                                />
                                <datalist id="inventory-list">
                                    {inventory.map(item => <option key={item.id} value={item.name} />)}
                                </datalist>
                            </div>
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>الكمية</label>
                                    <input
                                        required
                                        type="number"
                                        value={purchaseData.quantity}
                                        onChange={e => setPurchaseData({ ...purchaseData, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>سعر الوحدة</label>
                                    <input
                                        required
                                        type="number"
                                        value={purchaseData.unitPrice}
                                        onChange={e => setPurchaseData({ ...purchaseData, unitPrice: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>يخصم من حساب</label>
                                <select
                                    value={purchaseData.account}
                                    onChange={e => setPurchaseData({ ...purchaseData, account: e.target.value })}
                                >
                                    <option value="">اختر الحساب</option>
                                    <option value={selectedCustomer.name}>حساب العميل ({selectedCustomer.name})</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.name}>{acc.name} (رصيد: {acc.balance.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="info-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span className="text-secondary">إجمالي التكلفة:</span>
                                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                                        {(Number(purchaseData.quantity) * Number(purchaseData.unitPrice)).toLocaleString()} ج.م
                                    </span>
                                </div>
                                <p className="text-secondary" style={{ fontSize: '11px', marginTop: '8px' }}>
                                    * سيتم إضافة الكمية للمخزون وتحميل التكلفة على حساب العميل وخصمها من الخزانة المحددة.
                                </p>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowPurchaseModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-primary">تأكيد المشتريات</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showInspectionModal && selectedCustomer && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '800px', width: '95%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '0 20px' }}>
                            <Search className="text-primary" />
                            <h3>نموذج معاينة جديد ({inspectionType === 'kitchen' ? 'مطبخ' : 'درسينج'}) - {selectedCustomer.name}</h3>
                        </div>
                        <InspectionForm
                            customer={selectedCustomer}
                            type={inspectionType}
                            onCancel={() => setShowInspectionModal(false)}
                            onSubmit={handleInspectionSubmit}
                        />
                    </div>
                </div>
            )}

            <style>{`
                .customer-details-modal {
                    max-width: 850px;
                    width: 95%;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .customer-details-modal .modal-header {
                    padding: 25px;
                    background: rgba(var(--primary-rgb), 0.05);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .customer-header-info {
                    display: flex;
                    gap: 15px;
                    align-items: center;
                }
                .customer-avatar-large {
                    width: 60px;
                    height: 60px;
                    border-radius: 15px;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 800;
                    box-shadow: 0 8px 16px rgba(var(--primary-rgb), 0.3);
                }
                .header-actions {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .btn-icon-bg {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-icon-bg:hover {
                    background: var(--primary);
                    transform: scale(1.05);
                }
                .customer-tabs {
                    display: flex;
                    gap: 5px;
                    padding: 10px 20px;
                    background: rgba(255,255,255,0.02);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .tab-btn {
                    padding: 10px 18px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .tab-btn:hover {
                    color: white;
                    background: rgba(255,255,255,0.05);
                }
                .tab-btn.active {
                    color: var(--primary);
                    background: rgba(var(--primary-rgb), 0.1);
                }
                .tab-content-scroller {
                    max-height: 60vh;
                    overflow-y: auto;
                    padding: 25px;
                }
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .info-item {
                    background: rgba(255,255,255,0.02);
                    padding: 15px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .info-item.full-width { grid-column: span 2; }
                .info-item label {
                    display: block;
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-bottom: 6px;
                }
                .info-item p {
                    font-size: 16px;
                    font-weight: 500;
                    color: white;
                }
                .balance-card {
                    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--primary-rgb), 0.05));
                    border-color: rgba(var(--primary-rgb), 0.3);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .balance-value {
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--primary);
                    margin-top: 5px;
                }
                .balance-value span { font-size: 14px; margin-right: 5px; }
                
                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                .action-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    padding: 20px;
                    border-radius: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                    color: white;
                }
                .action-card:hover {
                    background: rgba(var(--primary-rgb), 0.1);
                    border-color: var(--primary);
                    transform: translateY(-3px);
                }
                .action-card span { font-weight: 600; font-size: 14px; }

                .history-list-modern {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .history-item-modern {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 10px;
                }
                .item-main {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .item-title { display: block; font-weight: 600; font-size: 14px; margin-bottom: 2px; }
                .item-date { font-size: 11px; color: var(--text-secondary); }
                .item-amount { font-weight: 700; font-size: 15px; }
                .btn-text {
                    background: transparent;
                    border: none;
                    color: var(--primary);
                    font-weight: 600;
                    cursor: pointer;
                }
                .empty-state-min {
                    text-align: center;
                    padding: 50px;
                    color: var(--text-secondary);
                }
                .modal-actions-sticky {
                    padding: 20px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    justify-content: flex-end;
                }
                .text-danger { color: #ff4d4d !important; }
                .btn-inspection-kitchen:hover { border-color: var(--primary) !important; color: var(--primary) !important; }
                .btn-inspection-dressing:hover { border-color: #e91e63 !important; color: #e91e63 !important; }
                
                .inspection-item { border-right: 4px solid var(--primary); }
                .inspection-type-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .inspection-type-icon.kitchen { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }
                .inspection-type-icon.dressing { background: rgba(233, 30, 99, 0.1); color: #e91e63; }
                
                .item-actions { display: flex; align-items: center; gap: 15px; }
                .representative-tag {
                    font-size: 11px;
                    padding: 2px 8px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                    color: var(--text-secondary);
                }

                .customer-actions-modern {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr 1fr;
                    gap: 8px;
                    padding: 15px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .customer-actions-modern button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(255,255,255,0.05);
                    background: rgba(255,255,255,0.03);
                    color: white;
                }
                .customer-actions-modern button:hover {
                    transform: translateY(-2px);
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(255,255,255,0.2);
                }
                .customer-actions-modern .btn-action-view:hover {
                    color: var(--primary);
                    border-color: rgba(var(--primary-rgb), 0.3);
                    background: rgba(var(--primary-rgb), 0.1);
                }
                .customer-actions-modern .btn-action-edit:hover {
                    color: #ffaa00;
                    border-color: rgba(255, 170, 0, 0.3);
                    background: rgba(255, 170, 0, 0.1);
                }
                .customer-actions-modern .btn-action-delete:hover {
                    color: #ff4d4d;
                    border-color: rgba(255, 77, 77, 0.3);
                    background: rgba(255, 77, 77, 0.1);
                }
                .customer-actions-modern span {
                    white-space: nowrap;
                }
            `}</style>
        </div>
    );
};

export default Customers;
