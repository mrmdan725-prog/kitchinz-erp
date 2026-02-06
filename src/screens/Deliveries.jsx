import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, CheckCircle, Clock, Search, MapPin, Phone, FileText } from 'lucide-react';

const Deliveries = () => {
    const { contracts, updateContractStatus } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const deliveringContracts = contracts.filter(c =>
        c.status === 'delivering' && (
            c.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.projectType?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleCompleteDelivery = (id) => {
        if (window.confirm('هل تريد وضع علامة "تم التسليم بنجاح" على هذا المشروع؟')) {
            updateContractStatus(id, 'delivered');
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="icon-badge primary">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h2>إدارة التسليمات</h2>
                        <p className="text-secondary">متابعة المشروعات الجاهزة للتسليم للعملاء</p>
                    </div>
                </div>
            </div>

            <div className="search-bar no-print">
                <Search size={18} className="text-secondary" />
                <input
                    type="text"
                    placeholder="بحث باسم العميل أو نوع المشروع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="arabic-text"
                    style={{ textAlign: 'right' }}
                />
            </div>

            <div className="grid">
                {deliveringContracts.length === 0 ? (
                    <div className="card glass text-center" style={{ gridColumn: '1 / -1', padding: '60px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <Truck size={40} className="text-muted" />
                        </div>
                        <h3 className="text-secondary">لا توجد تسليمات حالية</h3>
                        <p className="text-muted">العقود التي يتم تحصيل دفعة استلامها ستظهر هنا تلقائياً.</p>
                    </div>
                ) : (
                    deliveringContracts.map((contract) => (
                        <div key={contract.id} className="card glass fade-in" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className="avatar" style={{ width: '50px', height: '50px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', fontSize: '20px', fontWeight: '800' }}>
                                        {contract.customer?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '18px', marginBottom: '4px' }}>{contract.customer?.name}</h4>
                                        <span className="project-type-tag" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                                            {contract.projectType}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div className="status-badge income" style={{ fontSize: '11px', padding: '5px 12px' }}>
                                        <Clock size={12} style={{ marginLeft: '5px' }} />
                                        جاهز للتسليم
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                    <Phone size={14} className="text-secondary" />
                                    <span>{contract.customer?.phone}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                    <MapPin size={14} className="text-secondary" />
                                    <span style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '120px'
                                    }} title={contract.customer?.address}>
                                        {contract.customer?.address}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                    <FileText size={14} className="text-secondary" />
                                    <span>تاريخ العقد: {contract.contractDate}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                    <CheckCircle size={14} className="text-success" />
                                    <span>مخالصة مالية تامة</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, padding: '12px' }}
                                    onClick={() => handleCompleteDelivery(contract.id)}
                                >
                                    <CheckCircle size={18} />
                                    إتمام التسليم النهائي
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Deliveries;
