import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, AlertTriangle, ArrowUpRight, Plus, Edit, Trash2, FileSpreadsheet, LayoutGrid, List, Search } from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';

const Inventory = () => {
    const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, contractOptions } = useApp();

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [formData, setFormData] = useState({
        name: '',
        unit: 'متر مربع',
        stock: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const itemData = {
            ...formData,
            stock: Number(formData.stock)
        };

        if (isEditing) {
            updateInventoryItem({ ...itemData, id: editId });
        } else {
            addInventoryItem(itemData);
        }

        handleClose();
    };

    const handleEdit = (item) => {
        setFormData({
            name: item.name,
            unit: item.unit,
            stock: item.stock
        });
        setIsEditing(true);
        setEditId(item.id);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('هل أنت متأكد من مسح هذه المادة من المخزن؟')) {
            deleteInventoryItem(id);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', unit: 'متر مربع', stock: '' });
    };

    const filteredInventory = inventory.filter(item => {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleExport = () => {
        const dataToExport = filteredInventory.map(formatters.inventory);
        exportToExcel(dataToExport, 'مخزون_المواد', 'المخزن');
    };

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Plus size={24} className="text-secondary" />
                    <h2>مخزون المواد</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-export-excel" onClick={handleExport} title="تصدير لإكسل">
                        <FileSpreadsheet size={18} />
                        تصدير الجرد
                    </button>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        إضافة مادة
                    </button>
                </div>
            </div>

            <div className="header-search-box glass" style={{ marginBottom: '20px', width: '100%', maxWidth: '100%', background: 'rgba(255,255,255,0.03)' }}>
                <Search size={20} style={{ color: 'var(--text-dim)', marginLeft: '10px' }} />
                <input
                    type="text"
                    placeholder="البحث باسم المادة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', padding: '10px' }}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <div className="layout-toggle">
                    <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="عرض الجدول"><List size={18} /></button>
                    <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="عرض المربعات"><LayoutGrid size={18} /></button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass">
                    <Package className="text-primary" />
                    <div className="stat-info">
                        <span className="stat-label">إجمالي البنود</span>
                        <span className="stat-value">{inventory.length}</span>
                    </div>
                </div>
                <div className="stat-card glass">
                    <AlertTriangle className="text-primary" />
                    <div className="stat-info">
                        <span className="stat-label">مخزون منخفض</span>
                        <span className="stat-value">{inventory.filter(i => i.stock < 10).length}</span>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="table-container glass">
                    <table className="data-table" dir="rtl" style={{ textAlign: 'right' }}>
                        <thead>
                            <tr>
                                <th>اسم المادة</th>
                                <th>المخزون الحالي</th>
                                <th>الوحدة</th>
                                <th className="text-center">الحالة</th>
                                <th className="text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map(item => (
                                <tr key={item.id}>
                                    <td className="font-bold">{item.name}</td>
                                    <td>{item.stock}</td>
                                    <td>{item.unit}</td>
                                    <td className="text-center">
                                        <span className={item.stock < 10 ? 'text-danger' : 'text-success'} style={{ fontWeight: 'bold' }}>
                                            {item.stock < 10 ? 'مخزون منخفض' : 'متوفر'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="btn-icon-action" onClick={() => handleEdit(item)} title="تعديل">
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-icon-action delete-btn" onClick={() => handleDelete(item.id)} title="حذف">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInventory.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center">لا توجد بنود تطابق البحث.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid">
                    {filteredInventory.length === 0 ? (
                        <div className="card glass text-center" style={{ gridColumn: '1 / -1', padding: '60px' }}>
                            <Package size={48} className="text-secondary" style={{ margin: '0 auto 16px' }} />
                            <p className="text-secondary">لا توجد مواد تطابق البحث</p>
                        </div>
                    ) : (
                        filteredInventory.map(item => (
                            <div key={item.id} className="card glass inventory-card-enhanced">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <div className="legendary-icon-container small" style={{ background: item.stock < 10 ? 'rgba(255, 77, 77, 0.1)' : 'rgba(70, 174, 76, 0.1)', padding: '8px', borderRadius: '10px' }}>
                                        <Package size={18} color={item.stock < 10 ? '#ff4d4d' : '#46ae4c'} />
                                    </div>
                                    <span className={`badge ${item.stock < 10 ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '10px' }}>
                                        {item.stock < 10 ? 'منخفض' : 'متوفر'}
                                    </span>
                                </div>
                                <h4 style={{ marginBottom: '5px' }}>{item.name}</h4>
                                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '15px' }}>
                                    الكمية: {item.stock} {item.unit}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                                    <button className="btn-icon-action" onClick={() => handleEdit(item)}><Edit size={16} /></button>
                                    <button className="btn-icon-action delete-btn" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '400px' }}>
                        <h3>{isEditing ? 'تعديل مادة' : 'إضافة مادة جديدة للمخزن'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>اسم المادة</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>الوحدة</label>
                                <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>
                                    {contractOptions.units?.map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>الرصيد الافتتاحي</label>
                                <input required type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={handleClose}>إلغاء</button>
                                <button type="submit" className="btn-primary">حفظ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
