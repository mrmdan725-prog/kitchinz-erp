import React from 'react';
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
    Eye
} from 'lucide-react';

const Dashboard = () => {
    const { customers, contracts, purchases, inventory } = useApp();

    // Calculate basic stats
    const totalContractValue = contracts.reduce((acc, c) => acc + (parseFloat(c.accessoriesTotal) || 0), 0);
    const lowStockItems = inventory.filter(item => item.stock < 10).length;

    // Sort recent activities
    const recentActivities = [
        ...contracts.map(c => ({
            type: 'contract',
            name: c.customer?.name,
            date: new Date(c.savedAt || Date.now()),
            detail: c.projectType
        })),
        ...purchases.map(p => ({
            type: 'purchase',
            name: p.materialName,
            date: new Date(p.date),
            detail: p.supplier
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);

    return (
        <div className="page arabic-text dashboard-fade-in">
            {/* Hero Section */}
            <div className="hero-section glass" style={{
                padding: '50px 40px',
                borderRadius: 'var(--radius-xl)',
                marginBottom: '40px',
                background: 'linear-gradient(225deg, hsla(var(--primary-h), 40%, 40%, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                justifyContent: 'space-between',
                offsetInlineStart: 0,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <h1 className="text-gradient" style={{ fontSize: '36px', marginBottom: '12px' }}>
                        {new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير'}، مدير كيتشينز ✨
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '16px', maxWidth: '500px' }}>
                        أهلاً بك مجدداً في مركز القيادة الذكي. إليك نظرة شاملة على تطور أعمالك اليوم.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                    <div className="stat-badge glass" style={{ padding: '12px 24px', borderRadius: '40px', background: 'rgba(255,255,255,0.05)' }}>
                        <ArrowUpRight size={18} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontWeight: '600' }}>أداء مرتفع (+12.5%)</span>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1 }}></div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid" style={{ marginBottom: '40px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', marginBottom: '40px' }}>
                {/* Project Distribution Chart (Creative CSS) */}
                <div className="card glass-interactive" style={{ padding: '30px', borderRadius: 'var(--radius-lg)', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <TrendingUp className="text-primary" size={20} />
                            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>تحليل توزيع المشروعات</h3>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>آخر تحديث: الآن</span>
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
                <div className="card glass" style={{ padding: '30px', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Clock className="text-secondary" size={20} />
                            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>النشاطات الذكية</h3>
                        </div>
                        <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>مشاهدة الكل</button>
                    </div>
                    <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {recentActivities.length > 0 ? recentActivities.map((act, i) => (
                            <div key={i} className="activity-item glass-interactive" style={{
                                padding: '14px',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                                <div className="activity-icon-small" style={{
                                    background: act.type === 'contract' ? 'rgba(70, 174, 76, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                                    color: act.type === 'contract' ? 'var(--primary)' : '#3498db',
                                    borderRadius: '10px'
                                }}>
                                    {act.type === 'contract' ? <FileText size={18} /> : <ShoppingCart size={18} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{act.name}</h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <p className="text-secondary" style={{ fontSize: '12px' }}>{act.detail}</p>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{act.date.toLocaleDateString('ar-EG')}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-secondary" style={{ textAlign: 'center', padding: '20px' }}>لا توجد نشاطات مؤخراً</p>
                        )}
                    </div>
                </div>
            </div>
            {/* Quick Actions (Integrated Hub) */}
            <div className="card glass" style={{
                padding: '32px',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                border: '1px dashed var(--border-glass)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>اختصارات سريعة للمبدعين 🎨</h3>
                    <p className="text-secondary" style={{ fontSize: '13px' }}>قم بإنجاز مهامك اليومية بسرعة فائقة</p>
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'عقد جديد', icon: Plus, link: '/contracts', color: 'var(--primary)' },
                        { label: 'إضافة عميل', icon: Users, link: '/customers', color: '#3498db' },
                        { label: 'طلب شراء', icon: ShoppingCart, link: '/purchasing', color: '#e67e22' },
                        { label: 'معاينة فنية', icon: Eye, link: '/inspections', color: '#9b59b6' }
                    ].map((btn, i) => (
                        <button
                            key={i}
                            className="quick-action-btn glass-interactive"
                            style={{ flex: 1, minWidth: '150px', justifyContent: 'center', gap: '12px', padding: '20px', borderRadius: 'var(--radius-lg)' }}
                            onClick={() => window.location.href = btn.link}
                        >
                            <btn.icon size={20} style={{ color: btn.color }} />
                            <span style={{ fontWeight: '600' }}>{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
