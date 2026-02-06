import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, AlertTriangle, ArrowUpRight, Plus, Edit, Trash2 } from 'lucide-react';

const Inventory = () => {
    const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
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

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <h2>مخزون المواد</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} />
                    إضافة مادة جديدة
                </button>
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

            <div className="table-container glass">
                <table className="data-table" dir="rtl" style={{ textAlign: 'right' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'right' }}>اسم المادة</th>
                            <th style={{ textAlign: 'right' }}>المخزون الحالي</th>
                            <th style={{ textAlign: 'right' }}>الوحدة</th>
                            <th style={{ textAlign: 'right' }}>الحالة</th>
                            <th style={{ textAlign: 'right' }}>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map(item => (
                            <tr key={item.id}>
                                <td className="font-bold">{item.name}</td>
                                <td>{item.stock}</td>
                                <td>{item.unit}</td>
                                <td>
                                    <span className={item.stock < 10 ? 'text-danger' : 'text-success'} style={{ fontWeight: 'bold' }}>
                                        {item.stock < 10 ? 'مخزون منخفض' : 'متوفر'}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button className="btn-icon small" onClick={() => handleEdit(item)}>
                                            <Edit size={14} />
                                        </button>
                                        <button className="btn-icon small text-danger" onClick={() => handleDelete(item.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                                    <option value="متر مربع">متر مربع</option>
                                    <option value="متر طولي">متر طولي</option>
                                    <option value="قطعة">قطعة</option>
                                    <option value="لوح">لوح</option>
                                    <option value="لتر">لتر</option>
                                    <option value="كجم">كجم</option>
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
