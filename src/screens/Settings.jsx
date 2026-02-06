import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Settings as SettingsIcon,
    Users as UsersIcon,
    Shield,
    Globe,
    Plus,
    Trash2,
    Edit,
    Lock,
    User,
    Building,
    Check
} from 'lucide-react';

const SettingsScreen = () => {
    const { users, addUser, updateUser, deleteUser, systemSettings, updateSettings, defaultPermissions, currentUser } = useApp();
    const [activeTab, setActiveTab] = useState('system'); // 'system' or 'users'
    const [showUserModal, setShowUserModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'engineer', permissions: { ...defaultPermissions } });
    const [tempSettings, setTempSettings] = useState(systemSettings);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        updateSettings(tempSettings);
        alert('تم حفظ الإعدادات بنجاح! ✅');
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        if (editMode && selectedUser) {
            updateUser({ ...selectedUser, ...newUser });
        } else {
            addUser(newUser);
        }
        setNewUser({ name: '', username: '', password: '', role: 'engineer', permissions: { ...defaultPermissions } });
        setShowUserModal(false);
        setEditMode(false);
        setSelectedUser(null);
    };

    const startEdit = (user) => {
        setSelectedUser(user);
        setNewUser({ name: user.name, username: user.username, password: user.password, role: user.role, permissions: user.permissions || { ...defaultPermissions } });
        setEditMode(true);
        setShowUserModal(true);
    };

    const togglePermission = (perm) => {
        setNewUser(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [perm]: !prev.permissions[perm]
            }
        }));
    };

    return (
        <div className="page arabic-text">
            <div className="page-header">
                <h2>الإعدادات والمستخدمين</h2>
            </div>

            <div className="settings-container glass">
                <div className="settings-sidebar">
                    <button
                        className={`settings-nav-item ${activeTab === 'system' ? 'active' : ''}`}
                        onClick={() => setActiveTab('system')}
                    >
                        <SettingsIcon size={18} />
                        <span>إعدادات النظام</span>
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <UsersIcon size={18} />
                        <span>إدارة المستخدمين</span>
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'system' ? (
                        <div className="settings-panel fade-in">
                            <h3><Globe size={20} className="text-primary" /> إعدادات الشركة</h3>
                            <form onSubmit={handleSaveSettings} style={{ marginTop: '24px' }}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>اسم الشركة</label>
                                        <div className="input-with-icon">
                                            <Building size={16} />
                                            <input
                                                type="text"
                                                value={tempSettings.companyName}
                                                onChange={e => setTempSettings({ ...tempSettings, companyName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>العملة</label>
                                        <input
                                            type="text"
                                            value={tempSettings.currency}
                                            onChange={e => setTempSettings({ ...tempSettings, currency: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>نسبة الضريبة (%)</label>
                                        <input
                                            type="number"
                                            value={tempSettings.taxRate}
                                            onChange={e => setTempSettings({ ...tempSettings, taxRate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>رسوم المعاينة الافتراضية</label>
                                        <input
                                            type="number"
                                            value={tempSettings.inspectionFee}
                                            onChange={e => setTempSettings({ ...tempSettings, inspectionFee: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>رقم الهاتف</label>
                                        <input
                                            type="text"
                                            value={tempSettings.phone}
                                            onChange={e => setTempSettings({ ...tempSettings, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '10px' }}>
                                    <label>عنوان المقر</label>
                                    <textarea
                                        value={tempSettings.address}
                                        onChange={e => setTempSettings({ ...tempSettings, address: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>
                                    حفظ التغييرات
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="settings-panel fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3><Shield size={20} className="text-primary" /> المستخدمين الصلاحيات</h3>
                                <button className="btn-primary btn-small" onClick={() => setShowUserModal(true)}>
                                    <Plus size={16} />
                                    إضافة مستخدم
                                </button>
                            </div>

                            <div className="users-list">
                                {users.map(user => (
                                    <div key={user.id} className="user-card glass">
                                        <div className="user-info">
                                            <div className="user-avatar-small">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4>{user.name}</h4>
                                                <p className="text-secondary">@{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="user-role-badge">
                                            {user.role === 'admin' ? 'مدير نظام' : 'مهندس'}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={() => startEdit(user)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn-icon text-danger"
                                                onClick={() => {
                                                    if (user.id === currentUser?.id) {
                                                        alert('لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول.');
                                                        return;
                                                    }
                                                    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
                                                        deleteUser(user.id);
                                                    }
                                                }}
                                                disabled={user.id === currentUser?.id}
                                                title={user.id === currentUser?.id ? 'لا يمكن حذف الحساب الحالي' : 'حذف المستخدم'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showUserModal && (
                <div className="modal-overlay">
                    <div className="modal glass" style={{ maxWidth: '500px' }}>
                        <h3>{editMode ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label>الاسم بالكامل</label>
                                <input
                                    required
                                    type="text"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>اسم المستخدم</label>
                                    <div className="input-with-icon">
                                        <User size={16} />
                                        <input
                                            required
                                            type="text"
                                            value={newUser.username}
                                            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>كلمة المرور</label>
                                    <div className="input-with-icon">
                                        <Lock size={16} />
                                        <input
                                            required
                                            type="password"
                                            value={newUser.password}
                                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>الصلاحية الرئيسية</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="engineer">مهندس</option>
                                    <option value="admin">مدير نظام</option>
                                </select>
                            </div>

                            <div className="permissions-section" style={{ marginTop: '20px', textAlign: 'right' }}>
                                <label style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', display: 'block' }}>الصلاحيات التفصيلية:</label>
                                <div className="permissions-grid">
                                    {[
                                        { key: 'canViewDashboard', label: 'الوصول إلى لوحة التحكم (الرئيسية)' },
                                        { key: 'canManageUsers', label: 'التحكم في النظام والمستخدمين' },
                                        { key: 'canManagePurchases', label: 'إدارة طلبات الشراء' },
                                        { key: 'canManageContracts', label: 'إصدار وإدارة العقود' },
                                        { key: 'canManageInventory', label: 'التحكم في المخزون' },
                                        { key: 'canManageCustomers', label: 'إدارة بيانات العملاء' },
                                        { key: 'canManageFinance', label: 'إدارة المالية والمحسابات' },
                                        { key: 'canManageHR', label: 'شؤون الموظفين والرواتب' }
                                    ].map(perm => (
                                        <div key={perm.key} className="perm-item" onClick={() => togglePermission(perm.key)}>
                                            <div className={`perm-checkbox ${newUser.permissions?.[perm.key] ? 'active' : ''}`}>
                                                {newUser.permissions?.[perm.key] && <Check size={12} />}
                                            </div>
                                            <span>{perm.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => { setShowUserModal(false); setEditMode(false); }}>إلغاء</button>
                                <button type="submit" className="btn-primary">{editMode ? 'تحديث البيانات' : 'حفظ المستخدم'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .permissions-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 12px;
                    margin-top: 10px;
                }
                .perm-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    transition: background 0.3s;
                }
                .perm-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                .perm-checkbox {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--border-color);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                }
                .perm-checkbox.active {
                    background: var(--primary);
                    border-color: var(--primary);
                    color: black;
                }
                .btn-icon.text-danger:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
                .settings-container {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    min-height: 500px;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                }
                .settings-sidebar {
                    background: rgba(255, 255, 255, 0.02);
                    padding: 20px;
                    border-left: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .settings-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    font-family: var(--font-arabic);
                    text-align: right;
                }
                .settings-nav-item:hover {
                    background: rgba(70, 174, 76, 0.1);
                    color: var(--primary);
                }
                .settings-nav-item.active {
                    background: var(--primary);
                    color: black;
                    font-weight: 600;
                }
                .settings-content {
                    padding: 40px;
                }
                .settings-panel h3 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 20px;
                }
                .users-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .user-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-radius: 12px;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .user-avatar-small {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: black;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }
                .user-role-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    font-size: 12px;
                    border: 1px solid var(--border-color);
                }
                .input-with-icon {
                    position: relative;
                    width: 100%;
                }
                .input-with-icon svg {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-secondary);
                }
                .input-with-icon input {
                    padding-left: 40px !important;
                }
                .btn-small {
                    padding: 8px 16px;
                    font-size: 13px;
                }
            `}</style>
        </div>
    );
};

export default SettingsScreen;
