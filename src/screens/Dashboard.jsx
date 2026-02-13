import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
    Users,
    FileText,
    ShoppingCart,
    Package,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Plus,
    Eye,
    FileSpreadsheet,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { exportToExcel, formatters } from '../utils/excelExport';

const Dashboard = () => {
    const { customers, contracts, purchases, inventory, transactions } = useApp();
    const [activityLimit, setActivityLimit] = useState(5);

    const handleMasterExport = () => {
        const masterReport = {
            'العملاء': customers.map(formatters.customer),
            'العقود': contracts.map(formatters.contract),
            'العمليات المالية': transactions.map(formatters.transaction),
            'المشتريات': purchases.map(formatters.purchase),
            'المخزن': inventory.map(formatters.inventory)
        };
        exportToExcel(masterReport, 'التقرير_الشامل_كيتشينز_ERP');
    };

    // Calculate basic stats
    const totalContractValue = contracts.reduce((acc, c) => acc + (parseFloat(c.accessoriesTotal) || 0), 0);
    const lowStockItems = inventory.filter(item => item.stock < 10).length;

    // Sort recent activities
    const ALL_ACTIVITIES = [
        ...contracts.map(c => ({
            type: 'contract',
            name: c.customer?.name || 'عقد جديد',
            date: new Date(c.savedAt || Date.now()),
            detail: c.projectType || 'مشروع سكنى'
        })),
        ...purchases.map(p => ({
            type: 'purchase',
            name: p.materialName,
            date: new Date(p.date),
            detail: p.supplier
        }))
    ].sort((a, b) => b.date - a.date);

    const recentActivities = ALL_ACTIVITIES.slice(0, activityLimit);

    return (
        <div className="page arabic-text dashboard-fade-in">
            {/* Hero Section */}
            <div className="hero-section glass dashboard-hero">
                <div className="hero-content">
                    <h1 className="hero-title text-gradient">
                        {new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير'}، مدير كيتشينز ✨
                    </h1>
                    <p className="hero-subtitle text-secondary">
                        أهلاً بك مجدداً في مركز القيادة الذكي. إليك نظرة شاملة على تطور أعمالك اليوم.
                    </p>
                </div>
                <div className="hero-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-export-excel" onClick={handleMasterExport} title="تصدير التقرير الشامل لإكسل">
                        <FileSpreadsheet size={18} />
                        التقرير الشامل (إكسل)
                    </button>
                    <div className="stat-badge glass">
                        <ArrowUpRight size={18} className="text-primary" />
                        <span className="badge-text">أداء مرتفع (+12.5%)</span>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="hero-decoration"></div>
            </div>

            {/* Quick Actions (Integrated Hub) - Moved here */}
            <div className="card glass dashboard-hub" style={{ marginBottom: '30px' }}>
                <div className="hub-header">
                    <h3 className="hub-title">اختصارات سريعة للمبدعين 🎨</h3>
                    <p className="text-secondary hub-subtitle">قم بإنجاز مهامك اليومية بسرعة فائقة</p>
                </div>
                <div className="hub-actions">
                    {[
                        { label: 'عقد جديد', icon: Plus, link: '/contracts', color: 'var(--primary)' },
                        { label: 'إضافة عميل', icon: Users, link: '/customers', color: '#3498db' },
                        { label: 'طلب شراء', icon: ShoppingCart, link: '/purchasing', color: '#e67e22' },
                        { label: 'معاينة فنية', icon: Eye, link: '/inspections', color: '#9b59b6' }
                    ].map((btn, i) => (
                        <button
                            key={i}
                            className="quick-action-btn github-style glass-interactive"
                            onClick={() => window.location.href = btn.link}
                        >
                            <btn.icon size={20} style={{ color: btn.color }} />
                            <span className="btn-label">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid dashboard-stats">
                <div className="dashboard-card glass">
                    <div className="icon-box" style={{ background: 'rgba(70, 174, 76, 0.15)', color: '#46ae4c' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">إجمالي العملاء</span>
                        <h2 className="stat-value">{customers.length}</h2>
                    </div>
                    <div className="card-decoration"></div>
                </div>

                <div className="dashboard-card glass">
                    <div className="icon-box" style={{ background: 'rgba(52, 152, 219, 0.15)', color: '#3498db' }}>
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">إجمالي العقود</span>
                        <h2 className="stat-value">{contracts.length}</h2>
                    </div>
                    <div className="card-decoration" style={{ background: '#3498db' }}></div>
                </div>

                <div className="dashboard-card glass">
                    <div className="icon-box" style={{ background: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">قيمة المبيعات</span>
                        <h2 className="stat-value">{totalContractValue.toLocaleString()} <small style={{ fontSize: '13px' }}>ج.م</small></h2>
                    </div>
                    <div className="card-decoration" style={{ background: '#e74c3c' }}></div>
                </div>

                <div className="dashboard-card glass">
                    <div className="icon-box" style={{ background: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f' }}>
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">نواقص المخزون</span>
                        <h2 className="stat-value">{lowStockItems}</h2>
                    </div>
                    <div className="card-decoration" style={{ background: '#f1c40f' }}></div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Project Distribution Chart (Creative CSS) */}
                <div className="card glass-interactive dashboard-chart-card">
                    <div className="card-header-creative">
                        <div className="header-title-group">
                            <TrendingUp className="text-primary" size={20} />
                            <h3 className="chart-title">تحليل توزيع المشروعات</h3>
                        </div>
                        <span className="last-update">آخر تحديث: الآن</span>
                    </div>

                    <div className="chart-wrapper" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', padding: '20px 0 10px' }}>
                        {(() => {
                            // Calculate real project type distribution
                            const kitchenCount = contracts.filter(c => {
                                const type = (c.projectType || '').toLowerCase();
                                return type.includes('مطبخ') || type.includes('kitchen') || type === 'both' || type.includes('كلاهما');
                            }).length;

                            const dressingCount = contracts.filter(c => {
                                const type = (c.projectType || '').toLowerCase();
                                return type.includes('دريسنج') || type.includes('دريسين') || type.includes('dressing') || type === 'both' || type.includes('كلاهما');
                            }).length;

                            const woodCount = contracts.filter(c => {
                                const type = (c.projectType || '').toLowerCase();
                                return type.includes('خشب') || type.includes('wood');
                            }).length;

                            const bothCount = contracts.filter(c => {
                                const type = (c.projectType || '').toLowerCase();
                                return type === 'both' || type.includes('كلاهما');
                            }).length;

                            const otherCount = contracts.length - kitchenCount - dressingCount - woodCount + bothCount;
                            const total = contracts.length || 1;

                            const projectData = [
                                { label: 'مطابخ', val: Math.round((kitchenCount / total) * 100), count: kitchenCount, color: 'var(--primary)' },
                                { label: 'دريسنج', val: Math.round((dressingCount / total) * 100), count: dressingCount, color: '#3498db' },
                                { label: 'خشب', val: Math.round((woodCount / total) * 100), count: woodCount, color: '#e74c3c' },
                                { label: 'آخر', val: Math.round((otherCount / total) * 100), count: otherCount, color: '#f1c40f' }
                            ];

                            return projectData.map((bar, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '12px' }}>
                                    <div className="chart-value-label glass" style={{
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        background: `${bar.color}15`,
                                        color: bar.color,
                                        border: `1px solid ${bar.color}30`,
                                        marginBottom: '4px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {bar.val}% ({bar.count})
                                    </div>
                                    <div style={{
                                        width: '40px',
                                        height: `${Math.max(bar.val * 1.8, 4)}px`, // Adjusted scale to 1.8 and min height
                                        background: `linear-gradient(to top, ${bar.color}, ${bar.color}40)`,
                                        borderRadius: '8px 8px 4px 4px',
                                        animation: `growUp ${0.5 + i * 0.2}s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                                        position: 'relative',
                                        boxShadow: `0 4px 15px ${bar.color}20`,
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: 'rgba(255,255,255,0.3)',
                                            borderRadius: '8px'
                                        }}></div>
                                    </div>
                                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '4px' }}>{bar.label}</span>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card glass dashboard-activity-card">
                    <div className="card-header-creative">
                        <div className="header-title-group">
                            <Clock className="text-secondary" size={20} />
                            <h3 className="chart-title">النشاطات الذكية</h3>
                        </div>
                        <button
                            className="view-all-btn glass-btn"
                            onClick={() => setActivityLimit(prev => prev === 5 ? 20 : 5)}
                        >
                            <span>{activityLimit === 5 ? 'مشاهدة الكل' : 'عرض أقل'}</span>
                            {activityLimit === 5 ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </button>
                    </div>
                    <div className="activity-list">
                        {recentActivities.length > 0 ? recentActivities.map((act, i) => (
                            <div key={i} className="activity-item glass-interactive">
                                <div className="activity-icon-small" style={{
                                    background: act.type === 'contract' ? 'rgba(70, 174, 76, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                                    color: act.type === 'contract' ? 'var(--primary)' : '#3498db',
                                    borderRadius: '10px'
                                }}>
                                    {act.type === 'contract' ? <FileText size={18} /> : <ShoppingCart size={18} />}
                                </div>
                                <div className="activity-details">
                                    <h4 className="activity-name">{act.name}</h4>
                                    <div className="activity-meta">
                                        <p className="text-secondary">{act.detail}</p>
                                        <span className="activity-date">{act.date.toLocaleDateString('ar-EG')}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-secondary empty-msg">لا توجد نشاطات مؤخراً</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
