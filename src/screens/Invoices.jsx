import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    Plus,
    Search,
    Filter,
    Download,
    Printer,
    MoreVertical,
    CheckCircle,
    Clock,
    XCircle,
    ArrowRight,
    ChevronDown
} from 'lucide-react';

const Invoices = () => {
    const { invoices, deleteInvoice, customers } = useApp();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        const matchesType = typeFilter === 'all' || inv.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paid': return { bg: 'rgba(70, 174, 76, 0.1)', color: '#46ae4c', icon: <CheckCircle size={14} />, label: 'مدفوعة' };
            case 'draft': return { bg: 'rgba(255, 170, 0, 0.1)', color: '#ffaa00', icon: <Clock size={14} />, label: 'مسودة' };
            case 'cancelled': return { bg: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', icon: <XCircle size={14} />, label: 'ملغاة' };
            default: return { bg: 'rgba(255,255,255,0.05)', color: '#fff', label: status };
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'inspection': return 'معاينة';
            case 'contract': return 'تعاقد مشروع';
            case 'material': return 'مشتريات خامات';
            case 'payment': return 'دفعة مرحلية';
            default: return type;
        }
    };

    return (
        <div className="invoices-screen">
            <div className="screen-header">
                <div>
                    <h2>إدارة الفواتير</h2>
                    <p className="text-secondary">عرض وإصدار الفواتير الرسمية للعملاء</p>
                </div>
                <button className="btn-primary" onClick={() => alert('يمكنك إصدار فاتورة من داخل تفاصيل العميل أو التعاقد حالياً')}>
                    <Plus size={18} />
                    فاتورة جديدة
                </button>
            </div>

            <div className="filters-bar glass">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="البحث باسم العميل أو رقم الفاتورة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="smart-filters">
                    <div className="filter-group">
                        <span className="filter-label">الحالة:</span>
                        <div className="chips-container">
                            {[
                                { id: 'all', label: 'الكل' },
                                { id: 'draft', label: 'مسودة' },
                                { id: 'paid', label: 'مدفوعة' },
                                { id: 'cancelled', label: 'ملغاة' }
                            ].map(chip => (
                                <button
                                    key={chip.id}
                                    className={`filter-chip ${statusFilter === chip.id ? 'active' : ''}`}
                                    onClick={() => setStatusFilter(chip.id)}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <span className="filter-label">النوع:</span>
                        <div className="chips-container">
                            {[
                                { id: 'all', label: 'الكل' },
                                { id: 'sales', label: 'مبيعات' },
                                { id: 'contract', label: 'عقد' },
                                { id: 'maintenance', label: 'صيانة' },
                                { id: 'inspection', label: 'معاينة' }
                            ].map(chip => (
                                <button
                                    key={chip.id}
                                    className={`filter-chip ${typeFilter === chip.id ? 'active' : ''}`}
                                    onClick={() => setTypeFilter(chip.id)}
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="invoices-table-container glass">
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>رقم الفاتورة</th>
                            <th>العميل</th>
                            <th>التاريخ</th>
                            <th>النوع</th>
                            <th>الإجمالي</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(inv => {
                            const status = getStatusStyle(inv.status);
                            return (
                                <tr key={inv.id} onClick={() => navigate(`/invoice/${inv.id}`)} className="clickable-row">
                                    <td className="font-bold">{inv.number}</td>
                                    <td>{inv.customerName}</td>
                                    <td>{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                                    <td>
                                        <span className="type-tag">{getTypeLabel(inv.type)}</span>
                                    </td>
                                    <td className="font-bold">{(inv.totalAmount || 0).toLocaleString()} <small>ج.م</small></td>
                                    <td>
                                        <div className="status-badge" style={{ backgroundColor: status.bg, color: status.color }}>
                                            {status.icon}
                                            <span>{status.label}</span>
                                        </div>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="row-actions">
                                            <button className="btn-icon" title="طباعة" onClick={() => navigate(`/invoice/${inv.id}`)}><Printer size={16} /></button>
                                            <button className="btn-icon text-danger" title="حذف" onClick={() => { if (window.confirm('حذف الفاتورة؟')) deleteInvoice(inv.id); }}><XCircle size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredInvoices.length === 0 && (
                            <tr>
                                <td colSpan="7" className="empty-row">لا توجد فواتير تطابق البحث</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style>{`
                .invoices-screen {
                    padding: 5px;
                }
                .screen-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .filters-bar {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    padding: 20px;
                    border-radius: 16px;
                    margin-bottom: 25px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 10px 18px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.3s;
                }
                .search-box:focus-within {
                    border-color: var(--primary);
                    background: rgba(255, 255, 255, 0.08);
                }
                .search-box input {
                    background: transparent;
                    border: none;
                    color: white;
                    width: 100%;
                    outline: none;
                    font-size: 14px;
                }
                .smart-filters {
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                }
                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .filter-label {
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-weight: 600;
                    white-space: nowrap;
                }
                .chips-container {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .filter-chip {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: var(--text-secondary);
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .filter-chip:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                    color: white;
                }
                .filter-chip.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: white;
                    box-shadow: 0 4px 12px rgba(70, 174, 76, 0.3);
                    transform: translateY(-1px);
                }
                .invoices-table-container {
                    border-radius: 15px;
                    overflow: hidden;
                }
                .modern-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: right;
                }
                .modern-table th {
                    padding: 15px 20px;
                    background: rgba(255,255,255,0.03);
                    font-size: 13px;
                    color: var(--text-secondary);
                    font-weight: 600;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .modern-table td {
                    padding: 15px 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    font-size: 14px;
                }
                .clickable-row {
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .clickable-row:hover {
                    background: rgba(var(--primary-rgb), 0.05);
                }
                .font-bold {
                    font-weight: 700;
                }
                .type-tag {
                    padding: 2px 8px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                    font-size: 11px;
                }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .row-actions {
                    display: flex;
                    gap: 8px;
                }
                .empty-row {
                    padding: 40px;
                    text-align: center;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
};

export default Invoices;
