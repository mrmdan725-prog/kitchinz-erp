import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Printer, FileText, Search, Edit2, Clock, X, FileSpreadsheet } from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';
import ContractForm from '../components/ContractForm';
import ContractPreview from '../components/ContractPreview';
import ContractDetails from '../components/ContractDetails';

const Contracts = () => {
    const { accounts, customers, contracts, addContract, updateContract, deleteContract, recordContractPayment, updateContractStatus, systemSettings, cancelContractPayment, addInvoice } = useApp();
    const location = useLocation();
    const [showForm, setShowForm] = useState(false);
    const [activeContract, setActiveContract] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
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
            }
        }
    }, [location.state, customers, activeContract, showForm, isPreviewMode]);

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
        const matchesSearch =
            c.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.projectType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.contractDate?.includes(searchTerm);

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
                    <div className="page-header">
                        <h2>إدارة العقود</h2>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn-export-excel" onClick={handleExport} title="تصدير لإكسل">
                                <FileSpreadsheet size={18} />
                                تصدير البيانات
                            </button>
                            <button className="btn-primary" onClick={handleCreateNew}>
                                <Plus size={18} />
                                عقد جديد
                            </button>
                        </div>
                    </div>

                    <div className="search-bar no-print">
                        <Search size={18} className="text-secondary" />
                        <input
                            type="text"
                            placeholder="بحث باسم العميل، نوع المشروع، أو التاريخ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="arabic-text"
                            style={{ textAlign: 'right' }}
                        />
                    </div>

                    <div className="tabs-container no-print">
                        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>الكل</button>
                        <button className={`tab-btn ${activeTab === 'manufacturing' ? 'active' : ''}`} onClick={() => setActiveTab('manufacturing')}>في التصنيع</button>
                        <button className={`tab-btn ${activeTab === 'delivering' ? 'active' : ''}`} onClick={() => setActiveTab('delivering')}>في التسليم</button>
                        <button className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>تم التسليم النهائي</button>
                    </div>

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
                                >
                                    <div className="card-top-info">
                                        <div className="contract-main-info">
                                            <div className="customer-avatar-min">
                                                {contract.customer?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="customer-name-heading">{contract.customer?.name}</h4>
                                                <div className="project-type-tag">
                                                    <Clock size={12} /> {contract.contractDate} • {contract.projectType}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-top-actions">
                                            <button className="btn-icon-action" onClick={(e) => { e.stopPropagation(); handleViewContract(contract); }} title="عرض"><FileText size={18} /></button>
                                            <button className="btn-icon-action" onClick={(e) => { e.stopPropagation(); handleEditContract(contract); }} title="تعديل"><Edit2 size={18} /></button>
                                            <button className="btn-icon-action delete-btn" onClick={(e) => { e.stopPropagation(); setContractToDelete(contract); }} title="حذف"><X size={18} /></button>
                                        </div>
                                    </div>

                                    <div className="card-middle-status">
                                        <div className="status-indicator">
                                            <span
                                                className={`status-dot ${contract.status || 'new'}`}
                                            ></span>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>
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
                                        >
                                            <option value="new">جديد</option>
                                            <option value="manufacturing">قيد التصنيع</option>
                                            <option value="completed">تم التصنيع</option>
                                            <option value="delivering">في التسليم</option>
                                            <option value="delivered">تم التسليم</option>
                                        </select>
                                    </div>

                                    <div className="card-bottom-payments">
                                        <div className="payment-grid">
                                            {[
                                                { type: 'deposit', ratio: 0.6, label: '60%' },
                                                { type: 'operation', ratio: 0.3, label: '30%' },
                                                { type: 'delivery', ratio: 0.1, label: '10%' }
                                            ].map(p => (
                                                <button
                                                    key={p.type}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const calculatedAmount = (contract[p.type] || Math.round((parseFloat(contract.accessoriesTotal) || 0) * p.ratio)).toString();

                                                        setSelectedPaymentContract(contract);
                                                        setPaymentFormData({
                                                            type: p.type,
                                                            amount: calculatedAmount,
                                                            account: contract.customer?.name || (accounts[0]?.name || 'الخزنة الرئيسية')
                                                        });
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className={`payment-action-btn ${contract.payments?.[p.type]?.received ? 'paid' : ''}`}
                                                >
                                                    <span className="p-label">{p.label}</span>
                                                    {contract.payments?.[p.type]?.received && <span className="p-check">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {showForm && (
                        <div className="modal-overlay">
                            <div className="modal glass" style={{ maxWidth: '900px' }}>
                                <h3 style={{ marginBottom: '20px' }}>
                                    {isEditing ? 'تعديل نموذج تعاقد' : 'إنشاء نموذج تعاقد'}
                                </h3>
                                <ContractForm
                                    customers={customers}
                                    initialData={isEditing ? activeContract : null}
                                    onSubmit={handleContractCreateOrUpdate}
                                    onCancel={() => setShowForm(false)}
                                />
                            </div>
                        </div>
                    )}
                    {contractToDelete && (
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
                    )}
                    {showPaymentModal && selectedPaymentContract && (
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
                    )}

                    {selectedContractForDetails && (
                        <ContractDetails
                            contract={selectedContractForDetails}
                            onClose={() => setSelectedContractForDetails(null)}
                            systemSettings={systemSettings}
                            onGenerateInvoice={handleGenerateInvoice}
                        />
                    )}

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
        </div>
    );
};

export default Contracts;
