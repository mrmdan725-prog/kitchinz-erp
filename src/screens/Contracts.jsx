import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Printer, FileText, Search, Edit2, Edit, Clock, X, FileSpreadsheet, LayoutGrid, List, Eye, Trash2 } from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';
import ContractForm from '../components/ContractForm';
import ContractPreview from '../components/ContractPreview';
import ContractDetails from '../components/ContractDetails';

const Contracts = () => {
    const { accounts, customers, contracts, addContract, updateContract, deleteContract, recordContractPayment, updateContractStatus, systemSettings, cancelContractPayment, addInvoice } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [activeContract, setActiveContract] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [isEditing, setIsEditing] = useState(false);
    const [contractToDelete, setContractToDelete] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentContract, setSelectedPaymentContract] = useState(null);
    const [paymentFormData, setPaymentFormData] = useState({
        type: 'deposit', // deposit, operation, delivery
        amount: '',
        account: accounts[0]?.name || 'الخزنة الرئيسية'
    });
    const [selectedContractForDetails, setSelectedContractForDetails] = useState(null);

    useEffect(() => {
        // Only trigger if we have a customer name in state AND we aren't already in an active session
        if (location.state?.selectedCustomerName && !activeContract && !showForm && !isPreviewMode) {
            const customer = customers.find(c => c.name === location.state.selectedCustomerName);
            if (customer) {
                setActiveContract({ customer });
                setIsEditing(false);
                setShowForm(true);

                // Clear the state so it doesn't trigger again on re-render
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state, customers, activeContract, showForm, isPreviewMode, location.pathname, navigate]);

    const handleContractCreateOrUpdate = (data, shouldSave = false) => {
        if (shouldSave) {
            if (data.id) {
                updateContract(data);
            } else {
                addContract(data);
            }
            setShowForm(false);
            setIsPreviewMode(false);
            alert('تم حفظ العقد بنجاح');
        } else {
            setActiveContract(data);
            setIsPreviewMode(true);
            setShowForm(false);
            setIsSaved(!!data.id);
        }
    };

    const handleSaveContract = () => {
        if (activeContract) {
            if (activeContract.id) {
                updateContract(activeContract);
            } else {
                const saved = addContract(activeContract);
                setActiveContract(saved); // Update with generated ID
            }
            setIsSaved(true);
        }
    };

    const handleEditContract = (contract) => {
        setActiveContract(contract);
        setShowForm(true);
        setIsEditing(true);
    };

    const handleViewContract = (contract) => {
        setActiveContract(contract);
        setIsPreviewMode(true);
        setIsSaved(true);
    };

    const handleCreateNew = () => {
        setActiveContract(null);
        setIsEditing(false);
        setShowForm(true);
    };

    const confirmDelete = () => {
        if (contractToDelete) {
            deleteContract(contractToDelete.id);
            setContractToDelete(null);
        }
    };

    const handleCardDoubleClick = (contract) => {
        setSelectedContractForDetails(contract);
    };

    const handleGenerateInvoice = (contract) => {
        const invoice = {
            customerId: contract.customer?.id,
            customerName: contract.customer?.name,
            customerAddress: contract.customer?.address,
            customerPhone: contract.customer?.phone,
            type: 'contract',
            date: new Date().toISOString(),
            status: 'draft',
            relatedId: contract.id,
            items: [
                { description: `مروع ${contract.projectType} - تعاقد كلي`, quantity: 1, unitPrice: contract.accessoriesTotal, total: contract.accessoriesTotal }
            ],
            subtotal: contract.accessoriesTotal,
            taxAmount: (contract.accessoriesTotal * (systemSettings.taxRate || 14)) / 100,
            discount: 0,
            totalAmount: contract.accessoriesTotal + ((contract.accessoriesTotal * (systemSettings.taxRate || 14)) / 100)
        };
        addInvoice(invoice);
        alert('تم إنشاء مسودة الفاتورة بنجاح. يمكنك العثور عليها في قسم الفواتير.');
    };

    const [activeTab, setActiveTab] = useState('all'); // all, manufacturing, delivering, completed

    const filteredContracts = contracts.filter(c => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            c.customer?.name?.toLowerCase().includes(query) ||
            c.projectType?.toLowerCase().includes(query) ||
            c.contractDate?.includes(searchTerm) ||
            c.serialNumber?.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        if (activeTab === 'all') return true;
        if (activeTab === 'manufacturing') return c.status === 'manufacturing' || c.status === 'new' || c.status === 'completed' || !c.status;
        if (activeTab === 'delivering') return c.status === 'delivering';
        if (activeTab === 'completed') return c.status === 'delivered';

        return true;
    });

    const handleExport = () => {
        const dataToExport = filteredContracts.map(formatters.contract);
        exportToExcel(dataToExport, 'قائمة_العقود', 'العقود');
    };

    return (
        <div className="page">
            {!isPreviewMode ? (
                <>
                    <div className="module-header">
                        <div className="module-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                <div className="legendary-icon-container" style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px' }}>
                                    <FileText size={24} color="white" />
                                </div>
                                <h1 style={{ fontSize: '24px' }}>إدارة العقود</h1>
                            </div>
                            <p>مراجعة، تعديل، وطباعة العقود. تتبع حالة التصنيع والتسليم لكل عميل باحترافية.</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                                <div className="header-search-box" style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                    <Search size={18} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                    <input
                                        type="text"
                                        placeholder="ابحث باسم العميل، نوع المشروع، الرقم السريال، أو التاريخ..."
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

                        <div className="module-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button className="btn-export-excel glass-interactive" onClick={handleExport} style={{ height: '40px', padding: '0 16px', borderRadius: '10px' }}>
                                <FileSpreadsheet size={16} />
                                تصدير البيانات
                            </button>

                            <button className="btn-primary" onClick={handleCreateNew} style={{ height: '40px', padding: '0 20px', borderRadius: '10px', boxShadow: '0 8px 16px rgba(68, 184, 92, 0.2)' }}>
                                <Plus size={18} />
                                إنشاء عقد جديد
                            </button>
                        </div>
                    </div>

                    {/* Compact Filter Tabs */}
                    <div className="filter-tabs glass" style={{ marginBottom: '20px', padding: '4px', borderRadius: '12px', display: 'inline-flex', gap: '4px' }}>
                        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>الكل</button>
                        <button className={`tab-btn ${activeTab === 'manufacturing' ? 'active' : ''}`} onClick={() => setActiveTab('manufacturing')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>تحت التصنيع</button>
                        <button className={`tab-btn ${activeTab === 'delivering' ? 'active' : ''}`} onClick={() => setActiveTab('delivering')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>قيد التسليم</button>
                        <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>تم التسليم</button>
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid">
                            {filteredContracts.length === 0 ? (
                                <div className="card glass text-center" style={{ gridColumn: '1 / -1', padding: '60px' }}>
                                    <FileText size={48} className="text-secondary" style={{ margin: '0 auto 16px' }} />
                                    <p className="text-secondary">
                                        {searchTerm ? 'لم يتم العثور على نتائج للبحث.' : 'ابدأ بإنشاء عقد جديد لعميلك.'}
                                    </p>
                                </div>
                            ) : (
                                filteredContracts.map((contract) => (
                                    <div
                                        key={contract.id}
                                        className="card glass contract-card-enhanced"
                                        onDoubleClick={() => handleCardDoubleClick(contract)}
                                        style={{ padding: '24px', position: 'relative', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        {/* Header Area */}
                                        <div className="card-top-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                <div className="customer-avatar-min" style={{ width: '42px', height: '42px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(70, 174, 92, 0.1)', color: 'var(--primary)', borderRadius: '12px', border: '1px solid rgba(70, 174, 92, 0.2)' }}>
                                                    {contract.customer?.name?.charAt(0)}
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <h4 className="customer-name-heading" style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                                                        {contract.customer?.name}
                                                    </h4>
                                                    <div className="project-type-tag" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                                                        <Clock size={12} /> {contract.contractDate} • {contract.projectType}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="serial-badge-vibrant" style={{
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                color: 'white',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: '900',
                                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {contract.serialNumber || 'تلقائي'}
                                            </div>
                                        </div>

                                        {/* Status Area */}
                                        <div className="card-middle-status" style={{
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '14px',
                                            padding: '10px 14px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '20px',
                                            border: '1px solid rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span className={`status-dot ${contract.status || 'new'}`} style={{ width: '8px', height: '8px', boxShadow: '0 0 8px currentColor' }}></span>
                                                <span style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>
                                                    {contract.status === 'delivered' ? 'تم التسليم' :
                                                        (contract.status === 'delivering' ? 'في التسليم' :
                                                            (contract.status === 'completed' ? 'تم التصنيع' :
                                                                (contract.status === 'manufacturing' ? 'قيد التصنيع' : 'جديد')))}
                                                </span>
                                            </div>
                                            <select
                                                className="status-select-minimal"
                                                value={contract.status || 'new'}
                                                onChange={(e) => updateContractStatus(contract.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ border: 'none', background: 'transparent', fontSize: '12px', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', outline: 'none' }}
                                            >
                                                <option value="new">تعديل الحالة</option>
                                                <option value="manufacturing">بدا التصنيع</option>
                                                <option value="completed">تم التصنيع</option>
                                                <option value="delivering">توصيل</option>
                                                <option value="delivered">تم التسليم</option>
                                            </select>
                                        </div>

                                        {/* Payments Milestones */}
                                        <div className="card-bottom-payments" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                                            {[
                                                { type: 'delivery', ratio: 0.1, label: '10%' },
                                                { type: 'operation', ratio: 0.3, label: '30%' },
                                                { type: 'deposit', ratio: 0.6, label: '60%' }
                                            ].map(p => {
                                                const paid = contract[`${p.type}Paid`] || (contract.payments && contract.payments[p.type]?.received);
                                                return (
                                                    <button
                                                        key={p.type}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const calculatedAmount = (contract[p.type] || Math.round((parseFloat(contract.accessoriesTotal) || 0) * p.ratio)).toString();
                                                            setSelectedPaymentContract(contract);
                                                            setPaymentFormData({ type: p.type, amount: calculatedAmount, account: accounts[0]?.name || 'الخزنة الرئيسية' });
                                                            setShowPaymentModal(true);
                                                        }}
                                                        style={{
                                                            padding: '10px 0',
                                                            borderRadius: '10px',
                                                            border: '1px solid rgba(255, 255, 255, 0.05)',
                                                            background: paid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                            color: paid ? '#10b981' : 'rgba(255,255,255,0.4)',
                                                            fontSize: '13px',
                                                            fontWeight: '900',
                                                            transition: 'all 0.3s ease',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {p.label}{paid ? ' ✓' : ''}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="card-footer-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button className="btn-icon-action delete-btn" onClick={(e) => { e.stopPropagation(); setContractToDelete(contract); }} style={{ width: '34px', height: '34px' }} title="حذف العقد"><Trash2 size={15} /></button>
                                                <button className="btn-icon-action" onClick={(e) => { e.stopPropagation(); handleEditContract(contract); }} style={{ width: '34px', height: '34px' }} title="تعديل"><Edit size={15} /></button>
                                            </div>
                                            <button className="btn-icon-action view-btn" onClick={(e) => { e.stopPropagation(); handleViewContract(contract); }} style={{ width: '34px', height: '34px' }} title="عرض وطباعة"><Eye size={15} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
                            <table className="modern-table" style={{ width: '100%', color: 'white' }}>
                                <thead>
                                    <tr>
                                        <th>السيريال</th>
                                        <th>العميل</th>
                                        <th>نوع المشروع</th>
                                        <th>التاريخ</th>
                                        <th className="text-center">الحالة</th>
                                        <th className="text-center">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContracts.map(contract => (
                                        <tr key={contract.id}>
                                            <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{contract.serialNumber || '---'}</td>
                                            <td>{contract.customer?.name}</td>
                                            <td>{contract.projectType}</td>
                                            <td>{contract.contractDate}</td>
                                            <td className="text-center">
                                                <span className={`status-badge ${contract.status || 'new'}`}>
                                                    {contract.status === 'delivered' ? 'تم التسليم' :
                                                        contract.status === 'delivering' ? 'في التسليم' :
                                                            'تحت التصنيع'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button className="btn-icon-action view-btn" onClick={() => handleViewContract(contract)} title="عرض">
                                                        <FileText size={16} />
                                                    </button>
                                                    <button className="btn-icon-action" onClick={() => handleEditContract(contract)} title="تعديل">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="btn-icon-action delete-btn" onClick={() => setContractToDelete(contract)} title="حذف">
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {
                        showForm && (
                            <div className="modal-overlay">
                                <div className="modal glass" style={{ maxWidth: '900px' }}>
                                    <ContractForm
                                        customers={customers}
                                        initialData={activeContract}
                                        isEditing={isEditing}
                                        onSubmit={handleContractCreateOrUpdate}
                                        onCancel={() => {
                                            setShowForm(false);
                                            setActiveContract(null);
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    }
                    {
                        contractToDelete && (
                            <div className="modal-overlay">
                                <div className="modal glass" style={{ maxWidth: '400px', textAlign: 'center' }}>
                                    <h3 style={{ color: '#ff4d4d', marginBottom: '20px' }}>تأكيد الحذف</h3>
                                    <p style={{ marginBottom: '30px' }}>
                                        هل أنت متأكد من رغبتك في حذف عقد العميل <strong>{contractToDelete.customer?.name}</strong>؟
                                        <br />
                                        <small className="text-secondary">(هذا الإجراء لا يمكن التراجع عنه)</small>
                                    </p>
                                    <div className="modal-actions" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0 }}>
                                        <button className="btn-secondary" onClick={() => setContractToDelete(null)}>إلغاء</button>
                                        <button className="btn-primary" style={{ background: '#ff4d4d' }} onClick={confirmDelete}>حذف الآن</button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                    {
                        showPaymentModal && selectedPaymentContract && (
                            <div className="modal-overlay">
                                <div className="modal glass" style={{ maxWidth: '400px' }}>
                                    <h3>تحصيل دفعة - {selectedPaymentContract.customer?.name}</h3>
                                    <div style={{ margin: '15px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        {paymentFormData.type === 'deposit' ? 'دفع التعاقد (60%)' : (paymentFormData.type === 'operation' ? 'دفع التشغيل (30%)' : 'دفع الاستلام (10%)')}
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '15px' }}>
                                        <label>المبلغ المطلوب تحصيله</label>
                                        <input
                                            type="number"
                                            className="row-input"
                                            style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}
                                            value={paymentFormData.amount}
                                            onChange={e => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label>الحساب المستلم</label>
                                        <select
                                            className="row-input"
                                            value={paymentFormData.account}
                                            onChange={e => setPaymentFormData({ ...paymentFormData, account: e.target.value })}
                                        >
                                            <option value="">اختر الحساب</option>
                                            {selectedPaymentContract.customer?.name && (
                                                <option value={selectedPaymentContract.customer.name}>حساب العميل ({selectedPaymentContract.customer.name})</option>
                                            )}
                                            {accounts.map(acc => <option key={acc.id} value={acc.name}>{acc.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="modal-actions">
                                        <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>إلغاء</button>
                                        {selectedPaymentContract.payments?.[paymentFormData.type]?.received ? (
                                            <button
                                                className="btn-primary"
                                                style={{ background: '#ff4d4d' }}
                                                onClick={() => {
                                                    if (window.confirm('هل أنت متأكد من إلغاء هذه الدفعة؟ سيتم تسجيل حركة مصروف موازية.')) {
                                                        cancelContractPayment(selectedPaymentContract.id, paymentFormData.type);
                                                        setShowPaymentModal(false);
                                                    }
                                                }}
                                            >
                                                إلغاء الدفعة المسجلة
                                            </button>
                                        ) : (
                                            <button className="btn-primary" onClick={() => {
                                                recordContractPayment(selectedPaymentContract.id, paymentFormData.type, paymentFormData.amount, paymentFormData.account);
                                                setShowPaymentModal(false);
                                            }}>تأكيد التحصيل</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        selectedContractForDetails && (
                            <ContractDetails
                                contract={selectedContractForDetails}
                                onClose={() => setSelectedContractForDetails(null)}
                                systemSettings={systemSettings}
                                onGenerateInvoice={handleGenerateInvoice}
                            />
                        )
                    }

                    <style>{`
                        .contract-card-enhanced {
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            cursor: pointer;
                            border: 1px solid rgba(255,255,255,0.05);
                            padding: 20px;
                        }
                        .contract-card-enhanced:hover {
                            transform: translateY(-5px);
                            border-color: rgba(var(--primary-rgb), 0.3);
                            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        }
                        .card-top-info {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-start;
                            margin-bottom: 20px;
                        }
                        .contract-main-info {
                            display: flex;
                            gap: 15px;
                            align-items: center;
                        }
                        .customer-avatar-min {
                            width: 45px;
                            height: 45px;
                            border-radius: 12px;
                            background: rgba(var(--primary-rgb), 0.1);
                            color: var(--primary);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 20px;
                            font-weight: 800;
                        }
                        .customer-name-heading {
                            font-size: 16px;
                            margin-bottom: 4px;
                            color: white;
                        }
                        .project-type-tag {
                            font-size: 12px;
                            color: var(--text-secondary);
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }
                        .card-top-actions {
                            display: flex;
                            gap: 8px;
                        }
                        .btn-icon-action {
                            width: 38px;
                            height: 38px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            border-radius: 10px;
                            color: white;
                            cursor: pointer;
                            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        }
                        .btn-icon-action:hover {
                            background: rgba(255, 255, 255, 0.1);
                            border-color: rgba(255, 255, 255, 0.2);
                            transform: scale(1.05);
                        }
                        .btn-icon-action.delete-btn:hover {
                            background: rgba(255, 77, 77, 0.15);
                            border-color: #ff4d4d;
                            color: #ff4d4d;
                        }
                        .card-middle-status {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 12px 15px;
                            background: rgba(255,255,255,0.02);
                            border-radius: 10px;
                            margin-bottom: 20px;
                        }
                        .status-indicator {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .status-dot {
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #666;
                        }
                        .status-dot.manufacturing { background: #ffaa00; box-shadow: 0 0 10px rgba(255, 170, 0, 0.5); }
                        .status-dot.completed { background: #9b59b6; box-shadow: 0 0 10px rgba(155, 89, 182, 0.5); }
                        .status-dot.delivering { background: #3498db; box-shadow: 0 0 10px rgba(52, 152, 219, 0.5); }
                        .status-dot.delivered { background: #46ae4c; box-shadow: 0 0 10px rgba(70, 174, 76, 0.5); }
                        .status-select-minimal {
                            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
                            border: 1px solid rgba(255, 255, 255, 0.15);
                            color: white;
                            font-size: 11px;
                            cursor: pointer;
                            padding: 6px 12px 6px 32px;
                            border-radius: 10px;
                            outline: none;
                            -webkit-appearance: none;
                            -moz-appearance: none;
                            appearance: none;
                            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23eeb65b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
                            background-repeat: no-repeat;
                            background-position: left 10px center;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            font-weight: 600;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
                            backdrop-filter: blur(10px);
                        }
                        .status-select-minimal:hover {
                            background: linear-gradient(135deg, rgba(238, 182, 91, 0.15) 0%, rgba(238, 182, 91, 0.08) 100%);
                            border-color: var(--primary);
                            box-shadow: 0 6px 20px rgba(238, 182, 91, 0.25);
                            transform: translateY(-1px);
                        }
                        .status-select-minimal option {
                            background: rgba(23, 23, 25, 0.95);
                            color: white;
                            padding: 12px;
                            font-weight: 500;
                        }
                        .card-bottom-payments {
                            border-top: 1px solid rgba(255,255,255,0.05);
                            padding-top: 15px;
                        }
                        .payment-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr 1fr;
                            gap: 8px;
                        }
                        .payment-action-btn {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            padding: 8px;
                            background: rgba(255,255,255,0.03);
                            border: 1px solid rgba(255,255,255,0.05);
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                            transition: all 0.2s;
                        }
                        .payment-action-btn:hover {
                            background: rgba(var(--primary-rgb), 0.1);
                            border-color: var(--primary);
                        }
                        .payment-action-btn.paid {
                            background: rgba(70, 174, 76, 0.1);
                            border-color: rgba(70, 174, 76, 0.4);
                            color: #46ae4c;
                        }
                        .p-label { font-size: 12px; font-weight: 600; }
                        .p-check { font-size: 10px; margin-top: 2px; }

                        .tabs-container {
                            display: flex;
                            gap: 10px;
                            margin-bottom: 25px;
                            background: rgba(255,255,255,0.02);
                            padding: 6px;
                            border-radius: 12px;
                            width: fit-content;
                        }
                        .tab-btn {
                            padding: 8px 20px;
                            border-radius: 8px;
                            border: 1px solid transparent;
                            background: transparent;
                            color: var(--text-secondary);
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        }
                        .tab-btn:hover {
                            color: white;
                            background: rgba(255,255,255,0.05);
                        }
                        .tab-btn.active {
                            background: var(--primary);
                            color: black;
                            box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
                        }
                    `}</style>
                </>
            ) : (
                <div className="preview-page">
                    <div className="preview-actions no-print" style={{ marginBottom: '20px', display: 'flex', gap: '15px' }}>
                        <button className="btn-secondary" onClick={() => setIsPreviewMode(false)}>رجوع للقائمة</button>

                        {!isSaved && (
                            <button className="btn-success" onClick={handleSaveContract}>
                                <FileText size={18} />
                                حفظ العقد
                            </button>
                        )}

                        <button className="btn-primary" onClick={() => window.print()}>
                            <Printer size={18} />
                            طباعة العقد
                        </button>
                    </div>
                    <ContractPreview data={activeContract} />
                </div>
            )}
        </div >
    );
};

export default Contracts;
