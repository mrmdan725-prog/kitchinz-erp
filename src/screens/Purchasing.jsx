import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, ShoppingCart, Calendar, User, Package, Edit, Trash2, Receipt, FileText, Upload, X } from 'lucide-react';

const Purchasing = () => {
    const {
        accounts,
        customers,
        purchases,
        addPurchase,
        updatePurchase,
        deletePurchase,
        inventory,
        addInvoice,
        systemSettings
    } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        materialName: '',
        quantity: '',
        unitPrice: '',
        customerId: '',
        supplier: '',
        account: accounts[0]?.name || 'الخزنة الرئيسية',
        notes: '',
        invoiceFile: null // base64 string
    });

    const handleEdit = (purchase) => {
        setFormData({
            materialName: purchase.materialName,
            quantity: purchase.quantity,
            unitPrice: purchase.unitPrice,
            customerId: purchase.customerId,
            supplier: purchase.supplier || '',
            account: purchase.account || accounts[0]?.name || 'الخزنة الرئيسية',
            notes: purchase.notes || '',
            invoiceFile: purchase.invoiceFile || null
        });
        setIsEditing(true);
        setEditId(purchase.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('هل أنت متأكد من مسح هذه العملية؟ سيتم استرجاع المخزون المخصوم.')) {
            deletePurchase(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const customer = customers.find(c => c.id === formData.customerId);
        const purchaseData = {
            ...formData,
            customerName: customer ? customer.name : 'Unknown',
            total: Number(formData.quantity) * Number(formData.unitPrice)
        };

        if (isEditing) {
            updatePurchase({ ...purchaseData, id: editId });
        } else {
            addPurchase(purchaseData);
        }

        setShowModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
            materialName: '',
            quantity: '',
            unitPrice: '',
            customerId: '',
            supplier: '',
            account: accounts[0]?.name || 'الخزنة الرئيسية',
            notes: '',
            invoiceFile: null
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('حجم الملف كبير جداً. الحد الأقصى هو 2 ميجابايت.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, invoiceFile: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const viewInvoice = (fileData) => {
        if (!fileData) return;
        const newWindow = window.open();
        newWindow.document.write(`<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    };

    const handleGenerateInvoice = (purchase) => {
        const total = Number(purchase.quantity) * Number(purchase.unitPrice);
        const invoice = {
            customerId: purchase.customerId,
            customerName: purchase.customerName,
            type: 'material',
            date: new Date().toISOString(),
            status: 'draft',
            relatedId: purchase.id,
            items: [
                { description: `شراء خامة: ${purchase.materialName}`, quantity: purchase.quantity, unitPrice: purchase.unitPrice, total: total }
            ],
            subtotal: total,
            taxAmount: (total * (systemSettings.taxRate || 14)) / 100,
            discount: 0,
            totalAmount: total + ((total * (systemSettings.taxRate || 14)) / 100)
        };
        addInvoice(invoice);
        alert('تم إنشاء مسودة الفاتورة بنجاح.');
    };

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <h2>مشتريات المواد</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    تسجيل عملية شراء
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass">
                    <ShoppingCart className="text-primary" />
                    <div className="stat-info">
                        <span className="stat-label">إجمالي المشتروات</span>
                        <span className="stat-value">{purchases.length}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <Package className="text-primary" />
                    <div className="stat-info">
                        <span className="stat-label">المواد النشطة</span>
                        <span className="stat-value">{inventory.length}</span>
                    </div>
                </div>
            </div>

            <div className="table-container glass">
                <table className="data-table" dir="rtl" style={{ textAlign: 'right' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'right' }}>التاريخ</th>
                            <th style={{ textAlign: 'right' }}>المادة</th>
                            <th style={{ textAlign: 'right' }}>الكمية</th>
                            <th style={{ textAlign: 'right' }}>السعر</th>
                            <th style={{ textAlign: 'right' }}>العميل</th>
                            <th style={{ textAlign: 'right' }}>المورد</th>
                            <th style={{ textAlign: 'right' }}>الإجمالي</th>
                            <th style={{ textAlign: 'right' }}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchases.map(purchase => (
                            <tr key={purchase.id}>
                                <td>{new Date(purchase.date).toLocaleDateString()}</td>
                                <td>{purchase.materialName}</td>
                                <td>{purchase.quantity}</td>
                                <td>{purchase.unitPrice} ج.م</td>
                                <td>
                                    <div className="cell-flex">
                                        <User size={14} className="text-primary" />
                                        {purchase.customerName}
                                    </div>
                                </td>
                                <td>{purchase.supplier}</td>
                                <td className="text-primary font-bold">
                                    {(Number(purchase.quantity) * Number(purchase.unitPrice)).toLocaleString()} ج.م
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        {purchase.invoiceFile && (
                                            <button className="btn-icon small text-primary" title="عرض الفاتورة المرفقة" onClick={() => viewInvoice(purchase.invoiceFile)}>
                                                <FileText size={14} />
                                            </button>
                                        )}
                                        <button className="btn-icon small" title="إصدار فاتورة" onClick={() => handleGenerateInvoice(purchase)}>
                                            <Receipt size={14} />
                                        </button>
                                        <button className="btn-icon small" onClick={() => handleEdit(purchase)}>
                                            <Edit size={14} />
                                        </button>
                                        <button className="btn-icon small text-danger" onClick={() => handleDelete(purchase.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {purchases.length === 0 && (
                            <tr>
                                <td colSpan="8" className="text-center">لا توجد عمليات شراء مسجلة حتى الآن.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal glass">
                        <h3>{isEditing ? 'تعديل عملية شراء' : 'تسجيل عملية شراء جديدة'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>اسم المادة</label>
                                    <input
                                        required
                                        type="text"
                                        list="material-suggestions"
                                        placeholder="اختر أو اكتب اسم المادة"
                                        value={formData.materialName}
                                        onChange={e => setFormData({ ...formData, materialName: e.target.value })}
                                        className="row-input"
                                    />
                                    <datalist id="material-suggestions">
                                        {inventory.map(item => (
                                            <option key={item.id} value={item.name}>{item.name}</option>
                                        ))}
                                    </datalist>
                                </div>
                                <div className="form-group">
                                    <label>العميل (مرتبط)</label>
                                    <select
                                        required
                                        value={formData.customerId}
                                        onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                                    >
                                        <option value="">اختر العميل</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>الكمية</label>
                                    <input required type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>سعر الوحدة</label>
                                    <input required type="number" step="0.01" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>المورد</label>
                                    <input required type="text" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>الحساب المستخدم</label>
                                    <select
                                        required
                                        value={formData.account}
                                        onChange={e => setFormData({ ...formData, account: e.target.value })}
                                    >
                                        <option value="">اختر الحساب</option>
                                        {formData.customerId && (
                                            <option value={customers.find(c => c.id === formData.customerId)?.name}>
                                                حساب العميل ({customers.find(c => c.id === formData.customerId)?.name})
                                            </option>
                                        )}
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.name}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>ملاحظات</label>
                                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                            </div>

                            <div className="form-group">
                                <label>إرفاق فاتورة (PDF / صور)</label>
                                <div className="file-upload-container">
                                    <input
                                        type="file"
                                        id="invoice-upload"
                                        accept="application/pdf,image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                    {!formData.invoiceFile ? (
                                        <label htmlFor="invoice-upload" className="file-upload-label">
                                            <Upload size={18} />
                                            <span>اختر ملف الفاتورة</span>
                                        </label>
                                    ) : (
                                        <div className="file-preview-strip">
                                            <div className="file-info">
                                                <FileText size={18} className="text-primary" />
                                                <span>تم إرفاق فاتورة</span>
                                            </div>
                                            <button type="button" className="btn-icon small text-danger" onClick={() => setFormData({ ...formData, invoiceFile: null })}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => {
                                    setShowModal(false);
                                    setIsEditing(false);
                                    setEditId(null);
                                }}>إلغاء</button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'حفظ التغييرات' : 'تسجيل الشراء'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchasing;
