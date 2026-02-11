import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [customers, setCustomers] = useState(() => {
        const saved = localStorage.getItem('kitchinz_customers');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'أحمد علي', phone: '01012345678', address: 'القاهرة، مصر', email: 'ahmed@example.com', balance: 0 },
            { id: '2', name: 'سارة حسن', phone: '01122334455', address: 'الجيزة، مصر', email: 'sarah@example.com', balance: 0 }
        ];
    });

    const [purchases, setPurchases] = useState(() => {
        const saved = localStorage.getItem('kitchinz_purchases');
        return saved ? JSON.parse(saved) : [];
    });

    const [inventory, setInventory] = useState(() => {
        const saved = localStorage.getItem('kitchinz_inventory');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'خشب بلوط', unit: 'متر مربع', stock: 50 },
            { id: '2', name: 'جرانيت كاونترتوب', unit: 'قطعة', stock: 10 },
            { id: '3', name: 'مفصلات إغلاق هادئ', unit: 'قطعة', stock: 200 }
        ];
    });

    const [contracts, setContracts] = useState(() => {
        const saved = localStorage.getItem('kitchinz_contracts');
        return saved ? JSON.parse(saved) : [];
    });

    const [inspections, setInspections] = useState(() => {
        const saved = localStorage.getItem('kitchinz_inspections');
        return saved ? JSON.parse(saved) : [];
    });

    const [invoices, setInvoices] = useState(() => {
        const saved = localStorage.getItem('kitchinz_invoices');
        return saved ? JSON.parse(saved) : [];
    });

    const defaultPermissions = {
        canViewDashboard: false,
        canManageUsers: false,
        canManagePurchases: false,
        canManageContracts: false,
        canManageInventory: false,
        canManageCustomers: false,
        canManageFinance: false,
        canManageHR: false,
        canManageInvoices: false,
        canManageDeliveries: false
    };

    const adminPermissions = {
        canViewDashboard: true,
        canManageUsers: true,
        canManagePurchases: true,
        canManageContracts: true,
        canManageInventory: true,
        canManageCustomers: true,
        canManageFinance: true,
        canManageHR: true,
        canManageInvoices: true,
        canManageInspections: true,
        canManageDeliveries: true
    };

    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('kitchinz_users');
        let data = saved ? JSON.parse(saved) : [];
        const defaults = [
            { id: '1', name: 'المسؤول', role: 'admin', username: 'admin', password: '123', status: 'active', permissions: adminPermissions },
            { id: '2', name: 'مهندس أحمد', role: 'engineer', username: 'ahmed', password: '123', status: 'active', permissions: { ...defaultPermissions, canViewDashboard: true, canManageContracts: true, canManageInventory: true, canManageCustomers: true } },
            { id: '3', name: 'محمد فتوح', role: 'admin', username: 'mhmd', password: '123', status: 'active', permissions: adminPermissions }
        ];

        // Update old users with default permissions if missing
        data = data.map(u => {
            const upToDatePermissions = u.permissions || (u.role === 'admin' ? adminPermissions : defaultPermissions);
            // Extra safety: if admin, ensure all keys are present
            if (u.role === 'admin') {
                return { ...u, permissions: { ...adminPermissions, ...u.permissions } };
            }
            return { ...u, permissions: upToDatePermissions };
        });

        // Ensure defaults are present
        defaults.forEach(def => {
            if (!data.find(u => u.username === def.username)) {
                data.push(def);
            }
        });

        return data;
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('kitchinz_current_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [systemSettings, setSystemSettings] = useState(() => {
        const saved = localStorage.getItem('kitchinz_settings');
        return saved ? JSON.parse(saved) : {
            companyName: 'كيتشينز للعمارة والديكور',
            currency: 'ج.م',
            taxRate: 14,
            address: 'العاشر من رمضان، مصر',
            phone: '01012345678',
            inspectionFee: 500
        };
    });

    const [isCloudLoading, setIsCloudLoading] = useState(true);

    // Migration & Real-time Sync Logic (Supabase)
    useEffect(() => {
        let activeChannels = [];

        const startSync = async () => {
            if (!supabase) {
                console.warn("Supabase client not initialized. Real-time sync disabled.");
                setIsCloudLoading(false);
                return;
            }

            const tablesToSync = [
                { name: 'customers', state: customers, setter: setCustomers },
                { name: 'purchases', state: purchases, setter: setPurchases },
                { name: 'inventory', state: inventory, setter: setInventory },
                { name: 'contracts', state: contracts, setter: setContracts },
                { name: 'inspections', state: inspections, setter: setInspections },
                { name: 'invoices', state: invoices, setter: setInvoices },
                { name: 'users', state: users, setter: setUsers },
                { name: 'settings', state: systemSettings, setter: setSystemSettings, isSingle: true },
                { name: 'transactions', state: transactions, setter: setTransactions },
                { name: 'accounts', state: accounts, setter: setAccounts },
                { name: 'employees', state: employees, setter: setEmployees },
                { name: 'recurring', state: recurringExpenses, setter: setRecurringExpenses }
            ];

            // 1. Initial Migration Check (LocalStorage to Supabase)
            try {
                for (const tableSpec of tablesToSync) {
                    const { data: existingData, error } = await supabase.from(tableSpec.name).select('*');

                    if (error) throw error;

                    if ((!existingData || existingData.length === 0) && tableSpec.state.length > 0) {
                        console.log(`Migrating ${tableSpec.name} to Supabase...`);
                        const dataToInsert = tableSpec.isSingle ? [tableSpec.state] : tableSpec.state;
                        // Supabase doesn't like duplicate IDs if they already exist, but we checked empty
                        await supabase.from(tableSpec.name).insert(dataToInsert);
                    } else if (existingData && existingData.length > 0) {
                        if (tableSpec.isSingle) tableSpec.setter(existingData[0]);
                        else tableSpec.setter(existingData);
                    }
                }
            } catch (err) {
                console.warn("Supabase connection issues or migration failed. Using local storage Fallback.", err);
            } finally {
                setIsCloudLoading(false);
            }

            // 2. Set up real-time sync via Supabase Channels
            activeChannels = tablesToSync.map(tableSpec => {
                return supabase.channel(`public:${tableSpec.name}`)
                    .on('postgres_changes', { event: '*', schema: 'public', table: tableSpec.name }, (payload) => {
                        console.log(`Change received for ${tableSpec.name}:`, payload);

                        // Refetch all for simplicity or handle individual events
                        supabase.from(tableSpec.name).select('*').then(({ data }) => {
                            if (data) {
                                if (tableSpec.isSingle) tableSpec.setter(data[0]);
                                else tableSpec.setter(data);
                            }
                        });
                    })
                    .subscribe();
            });
        };

        startSync();

        return () => {
            activeChannels.forEach(channel => channel.unsubscribe());
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('kitchinz_customers', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        localStorage.setItem('kitchinz_purchases', JSON.stringify(purchases));
    }, [purchases]);

    useEffect(() => {
        localStorage.setItem('kitchinz_inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('kitchinz_contracts', JSON.stringify(contracts));
    }, [contracts]);

    useEffect(() => {
        localStorage.setItem('kitchinz_inspections', JSON.stringify(inspections));
    }, [inspections]);

    useEffect(() => {
        localStorage.setItem('kitchinz_invoices', JSON.stringify(invoices));
    }, [invoices]);

    useEffect(() => {
        localStorage.setItem('kitchinz_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('kitchinz_settings', JSON.stringify(systemSettings));
    }, [systemSettings]);

    useEffect(() => {
        if (currentUser) {
            // Find the most up-to-date version of this user from our users list
            const latestUser = users.find(u => u.id === currentUser.id || u.username === currentUser.username);
            if (latestUser && JSON.stringify(latestUser.permissions) !== JSON.stringify(currentUser.permissions)) {
                setCurrentUser(latestUser);
            }
            localStorage.setItem('kitchinz_current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('kitchinz_current_user');
        }
    }, [currentUser, users]);

    // Finance State
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('kitchinz_transactions');
        return saved ? JSON.parse(saved) : [
            { id: '1', date: new Date().toISOString(), type: 'income', amount: 50000, category: 'دفعة تعاقد', notes: 'تعاقد مشروع الشيخ زايد', account: 'الخزنة الرئيسية' },
            { id: '2', date: new Date().toISOString(), type: 'expense', amount: 15000, category: 'مشتريات خامات', notes: 'خامات ألمنيوم', account: 'الخزنة الرئيسية' }
        ];
    });

    const [accounts, setAccounts] = useState(() => {
        const saved = localStorage.getItem('kitchinz_accounts');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'الخزنة الرئيسية', balance: 35000 },
            { id: '2', name: 'البنك العربي', balance: 120000 },
            { id: '3', name: 'عهدة مدير المشروع', balance: 5000 }
        ];
    });

    useEffect(() => {
        localStorage.setItem('kitchinz_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('kitchinz_accounts', JSON.stringify(accounts));
    }, [accounts]);
    const addTransaction = async (transaction) => {
        const id = Date.now().toString();
        const newTransaction = {
            ...transaction,
            id,
            date: transaction.date || new Date().toISOString()
        };
        setTransactions([newTransaction, ...transactions]);
        try {
            if (supabase) await supabase.from('transactions').insert(newTransaction);
        } catch (e) { console.error(e); }

        // Update Physical Account Balance
        setAccounts(prevAccounts => prevAccounts.map(acc => {
            if (acc.name === transaction.account) {
                const newBalance = transaction.type === 'income'
                    ? acc.balance + parseFloat(transaction.amount)
                    : acc.balance - parseFloat(transaction.amount);
                updateAccount({ ...acc, balance: newBalance }); // Handles Firestore
                return { ...acc, balance: newBalance };
            }
            return acc;
        }));

        // Update Customer Balance if account is a customer name
        setCustomers(prevCustomers => prevCustomers.map(cust => {
            if (cust.name === transaction.account) {
                const newBalance = (cust.balance || 0) + (transaction.type === 'income' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount));
                updateCustomer({ ...cust, balance: newBalance }); // Handles Firestore
                return { ...cust, balance: newBalance };
            }
            return cust;
        }));
    };

    const deleteTransaction = async (id) => {
        const transaction = transactions.find(t => t.id === id);
        if (transaction) {
            // Reverse balance impact
            setAccounts(prevAccounts => prevAccounts.map(acc => {
                if (acc.name === transaction.account) {
                    const newBalance = transaction.type === 'income'
                        ? acc.balance - parseFloat(transaction.amount) // subtract if it was income
                        : acc.balance + parseFloat(transaction.amount); // add back if it was expense
                    updateAccount({ ...acc, balance: newBalance }); // Handles Firestore
                    return { ...acc, balance: newBalance };
                }
                return acc;
            }));

            // Reverse Customer Balance
            setCustomers(prevCustomers => prevCustomers.map(cust => {
                if (cust.name === transaction.account) {
                    const newBalance = (cust.balance || 0) - (transaction.type === 'income' ? parseFloat(transaction.amount) : -parseFloat(transaction.amount));
                    updateCustomer({ ...cust, balance: newBalance }); // Handles Firestore
                    return { ...cust, balance: newBalance };
                }
                return cust;
            }));

            try {
                if (supabase) await supabase.from('transactions').delete().eq('id', id);
            } catch (e) { console.error(e); }
        }
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const updateTransaction = async (updatedTransaction) => {
        const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
        if (!oldTransaction) return;

        setAccounts(prevAccounts => prevAccounts.map(acc => {
            let newBalance = acc.balance;

            // 1. Reverse old impact
            if (acc.name === oldTransaction.account) {
                newBalance = oldTransaction.type === 'income'
                    ? newBalance - parseFloat(oldTransaction.amount)
                    : newBalance + parseFloat(oldTransaction.amount);
            }

            // 2. Apply new impact
            if (acc.name === updatedTransaction.account) {
                newBalance = updatedTransaction.type === 'income'
                    ? newBalance + parseFloat(updatedTransaction.amount)
                    : newBalance - parseFloat(updatedTransaction.amount);
            }

            if (newBalance !== acc.balance) {
                updateAccount({ ...acc, balance: newBalance }); // Handles Firestore
            }
            return { ...acc, balance: newBalance };
        }));

        // Handle Customer Balance Updates
        setCustomers(prevCustomers => prevCustomers.map(cust => {
            let newBalance = cust.balance || 0;
            // 1. Reverse old impact
            if (cust.name === oldTransaction.account) {
                newBalance = oldTransaction.type === 'income'
                    ? newBalance - parseFloat(oldTransaction.amount)
                    : newBalance + parseFloat(oldTransaction.amount);
            }
            // 2. Apply new impact
            if (cust.name === updatedTransaction.account) {
                newBalance = updatedTransaction.type === 'income'
                    ? newBalance + parseFloat(updatedTransaction.amount)
                    : newBalance - parseFloat(updatedTransaction.amount);
            }
            if (newBalance !== (cust.balance || 0)) {
                updateCustomer({ ...cust, balance: newBalance }); // Handles Firestore
            }
            return { ...cust, balance: newBalance };
        }));

        setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
        try {
            if (supabase) await supabase.from('transactions').update(updatedTransaction).eq('id', updatedTransaction.id);
        } catch (e) { console.error(e); }
    };

    const addAccount = async (account) => {
        const id = Date.now().toString();
        const newAcc = { ...account, id, balance: Number(account.balance) || 0 };
        setAccounts([...accounts, newAcc]);
        try {
            if (supabase) await supabase.from('accounts').insert(newAcc);
        } catch (e) { console.error(e); }
    };

    const updateAccount = async (updatedAccount) => {
        setAccounts(accounts.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
        try {
            if (supabase) await supabase.from('accounts').update(updatedAccount).eq('id', updatedAccount.id);
        } catch (e) { console.error(e); }
    };

    const deleteAccount = async (id) => {
        setAccounts(accounts.filter(acc => acc.id !== id));
        try {
            if (supabase) await supabase.from('accounts').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const adjustAccountBalance = (accountId, newBalance, reason) => {
        const account = accounts.find(acc => acc.id === accountId);
        if (account) {
            const diff = newBalance - account.balance;
            if (diff === 0) return;

            addTransaction({
                type: diff > 0 ? 'income' : 'expense',
                amount: Math.abs(diff),
                category: 'تسوية رصيد',
                account: account.name,
                notes: `تسوية يدوية: ${reason}`
            });
        }
    };

    const adjustCustomerBalance = (customerId, newBalance, reason) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            const diff = newBalance - (customer.balance || 0);
            if (diff === 0) return;

            addTransaction({
                type: diff > 0 ? 'income' : 'expense',
                amount: Math.abs(diff),
                category: 'تسوية رصيد عميل',
                account: customer.name,
                notes: `تسوية يدوية: ${reason}`
            });

            // Note: addTransaction will trigger the setCustomers update because of the logic inside it
        }
    };

    // HR State
    const [employees, setEmployees] = useState(() => {
        const saved = localStorage.getItem('kitchinz_employees');
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'أحمد محمود', role: 'فني تركيبات', baseSalary: 8000, joinDate: '2023-05-10' },
            { id: '2', name: 'منى حسن', role: 'مصممة ديكور', baseSalary: 12000, joinDate: '2024-01-15' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('kitchinz_employees', JSON.stringify(employees));
    }, [employees]);

    const addEmployee = async (employee) => {
        const id = Date.now().toString();
        const newEmp = { ...employee, id };
        setEmployees([...employees, newEmp]);
        try {
            if (supabase) await supabase.from('employees').insert(newEmp);
        } catch (e) { console.error(e); }
    };

    const updateEmployee = async (updatedEmployee) => {
        setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
        try {
            if (supabase) await supabase.from('employees').update(updatedEmployee).eq('id', updatedEmployee.id);
        } catch (e) { console.error(e); }
    };

    const deleteEmployee = async (id) => {
        setEmployees(employees.filter(e => e.id !== id));
        try {
            if (supabase) await supabase.from('employees').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const paySalary = (employeeId, amount, accountName) => {
        const emp = employees.find(e => e.id === employeeId);
        if (emp) {
            addTransaction({
                type: 'expense',
                amount: amount,
                category: 'رواتب',
                account: accountName,
                notes: `راتب شهر ${new Date().toLocaleDateString('ar-EG', { month: 'long' })} للموظف ${emp.name}`
            });
        }
    };

    // Recurring Expenses State
    const [recurringExpenses, setRecurringExpenses] = useState(() => {
        const saved = localStorage.getItem('kitchinz_recurring');
        return saved ? JSON.parse(saved) : [
            { id: '1', label: 'إيجار المعرض', amount: 15000, category: 'مصاريف معرض', account: 'الخزنة الرئيسية' },
            { id: '2', label: 'فاتورة الكهرباء', amount: 1200, category: 'مصاريف معرض', account: 'الخزنة الرئيسية' }
        ];
    });

    useEffect(() => {
        localStorage.setItem('kitchinz_recurring', JSON.stringify(recurringExpenses));
    }, [recurringExpenses]);

    const addRecurring = async (expense) => {
        const id = Date.now().toString();
        const newExc = { ...expense, id };
        setRecurringExpenses([...recurringExpenses, newExc]);
        try {
            if (supabase) await supabase.from('recurring').insert(newExc);
        } catch (e) { console.error(e); }
    };

    const deleteRecurring = async (id) => {
        setRecurringExpenses(recurringExpenses.filter(e => e.id !== id));
        try {
            if (supabase) await supabase.from('recurring').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const processRecurring = (id) => {
        const exp = recurringExpenses.find(e => e.id === id);
        if (exp) {
            addTransaction({
                type: 'expense',
                amount: exp.amount,
                category: exp.category,
                account: exp.account,
                notes: `دفع دوري: ${exp.label}`
            });
        }
    };

    const addCustomer = async (customer) => {
        const id = Date.now().toString();
        const newCustomer = { ...customer, id, balance: Number(customer.balance) || 0 };
        setCustomers([...customers, newCustomer]);
        try {
            if (supabase) await supabase.from('customers').insert(newCustomer);
        } catch (e) { console.error(e); }
    };

    const updateCustomer = async (updatedCustomer) => {
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        try {
            if (supabase) await supabase.from('customers').update(updatedCustomer).eq('id', updatedCustomer.id);
        } catch (e) { console.error(e); }
    };

    const deleteCustomer = async (id) => {
        setCustomers(prev => prev.filter(c => c.id !== id));
        try {
            if (supabase) await supabase.from('customers').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const addInspection = async (inspection) => {
        const id = Date.now().toString();
        const newInsp = {
            ...inspection,
            id,
            date: new Date().toISOString(),
            status: inspection.status || 'planned',
            scheduledDate: inspection.scheduledDate || new Date().toISOString()
        };
        setInspections([newInsp, ...inspections]);
        try {
            if (supabase) await supabase.from('inspections').insert(newInsp);
        } catch (e) { console.error(e); }
    };

    const updateInspection = async (updated) => {
        setInspections(prev => prev.map(i => i.id === updated.id ? updated : i));
        try {
            if (supabase) await supabase.from('inspections').update(updated).eq('id', updated.id);
        } catch (e) { console.error(e); }
    };

    const deleteInspection = async (id) => {
        setInspections(prev => prev.filter(i => i.id !== id));
        try {
            if (supabase) await supabase.from('inspections').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const addInvoice = async (invoice) => {
        const id = Date.now().toString();
        const year = new Date().getFullYear();
        const typePrefix = {
            inspection: 'INS',
            contract: 'CON',
            material: 'MAT',
            payment: 'PAY'
        }[invoice.type] || 'INV';

        const typeInvoices = invoices.filter(inv => inv.type === invoice.type);
        const nextNum = (typeInvoices.length + 1).toString().padStart(3, '0');
        const invoiceNumber = `${typePrefix}-${year}-${nextNum}`;

        const newInvoice = {
            ...invoice,
            id,
            number: invoiceNumber,
            date: invoice.date || new Date().toISOString(),
            status: invoice.status || 'draft'
        };

        setInvoices([newInvoice, ...invoices]);
        try {
            if (supabase) await supabase.from('invoices').insert(newInvoice);
        } catch (e) { console.error(e); }
    };

    const updateInvoice = async (updated) => {
        setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
        try {
            if (supabase) await supabase.from('invoices').update(updated).eq('id', updated.id);
        } catch (e) { console.error(e); }
    };

    const deleteInvoice = async (id) => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        try {
            if (supabase) await supabase.from('invoices').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const updateInvoiceStatus = async (id, status) => {
        const invoice = invoices.find(inv => inv.id === id);
        if (invoice) {
            const updated = { ...invoice, status };
            updateInvoice(updated);
        }
    };

    const addPurchase = async (purchase) => {
        const id = Date.now().toString();
        const newPurchase = {
            ...purchase,
            id,
            date: new Date().toISOString()
        };
        setPurchases([newPurchase, ...purchases]);
        try {
            if (supabase) await supabase.from('purchases').insert(newPurchase);
        } catch (e) { console.error(e); }

        // Update inventory stock
        setInventory(prev => prev.map(item => {
            if (item.name === purchase.materialName) {
                const newStock = item.stock + Number(purchase.quantity);
                updateInventoryItem({ ...item, stock: newStock }); // This handles Firestore
                return { ...item, stock: newStock };
            }
            return item;
        }));

        // Record financial transaction if account is provided
        if (purchase.account) {
            addTransaction({
                type: 'expense',
                amount: purchase.total || (Number(purchase.quantity) * Number(purchase.unitPrice)),
                category: 'مشتريات خامات',
                account: purchase.account,
                notes: `شراء ${purchase.materialName} ${purchase.customerName ? `للعميل: ${purchase.customerName}` : ''}`
            });
        }
    };

    const updatePurchase = async (updatedPurchase) => {
        const oldPurchase = purchases.find(p => p.id === updatedPurchase.id);
        if (!oldPurchase) return;

        // 1. Reverse old inventory impact
        setInventory(prev => prev.map(item => {
            if (item.name === oldPurchase.materialName) {
                const newStock = Math.max(0, item.stock - Number(oldPurchase.quantity));
                updateInventoryItem({ ...item, stock: newStock }); // Handles Firestore
                return { ...item, stock: newStock };
            }
            return item;
        }));

        // 2. Apply new inventory impact
        setInventory(prev => prev.map(item => {
            if (item.name === updatedPurchase.materialName) {
                const newStock = item.stock + Number(updatedPurchase.quantity);
                updateInventoryItem({ ...item, stock: newStock }); // Handles Firestore
                return { ...item, stock: newStock };
            }
            return item;
        }));

        // 3. Update transaction
        const oldNote = `شراء ${oldPurchase.materialName} ${oldPurchase.customerName ? `للعميل: ${oldPurchase.customerName}` : ''}`;
        const transaction = transactions.find(t => t.notes === oldNote);
        if (transaction) {
            updateTransaction({
                ...transaction,
                amount: updatedPurchase.total || (Number(updatedPurchase.quantity) * Number(updatedPurchase.unitPrice)),
                account: updatedPurchase.account,
                notes: `شراء ${updatedPurchase.materialName} ${updatedPurchase.customerName ? `للعميل: ${updatedPurchase.customerName}` : ''}`
            });
        }

        setPurchases(purchases.map(p => p.id === updatedPurchase.id ? updatedPurchase : p));
        try {
            if (supabase) await supabase.from('purchases').update(updatedPurchase).eq('id', updatedPurchase.id);
        } catch (e) { console.error(e); }
    };

    const deletePurchase = async (id) => {
        const purchase = purchases.find(p => p.id === id);
        if (purchase) {
            // Reverse inventory stock
            setInventory(prev => prev.map(item => {
                if (item.name === purchase.materialName) {
                    const newStock = Math.max(0, item.stock - Number(purchase.quantity));
                    updateInventoryItem({ ...item, stock: newStock }); // Handles Firestore
                    return { ...item, stock: newStock };
                }
                return item;
            }));

            // Find and delete associated transaction
            const transactionNote = `شراء ${purchase.materialName} ${purchase.customerName ? `للعميل: ${purchase.customerName}` : ''}`;
            const transaction = transactions.find(t => t.notes === transactionNote);
            if (transaction) {
                deleteTransaction(transaction.id);
            }

            try {
                if (supabase) await supabase.from('purchases').delete().eq('id', id);
            } catch (e) { console.error(e); }
        }
        setPurchases(purchases.filter(p => p.id !== id));
    };

    const addInventoryItem = async (item) => {
        const id = Date.now().toString();
        const newItem = { ...item, id, stock: Number(item.stock) || 0 };
        setInventory([...inventory, newItem]);
        try {
            if (supabase) await supabase.from('inventory').insert(newItem);
        } catch (e) { console.error(e); }
    };

    const updateInventoryItem = async (updatedItem) => {
        setInventory(inventory.map(item => item.id === updatedItem.id ? updatedItem : item));
        try {
            if (supabase) await supabase.from('inventory').update(updatedItem).eq('id', updatedItem.id);
        } catch (e) { console.error(e); }
    };

    const deleteInventoryItem = async (id) => {
        setInventory(inventory.filter(item => item.id !== id));
        try {
            if (supabase) await supabase.from('inventory').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const addContract = async (contract) => {
        const id = Date.now().toString();
        const newContract = {
            ...contract,
            id,
            status: 'new',
            savedAt: new Date().toISOString()
        };
        setContracts([newContract, ...contracts]);
        try {
            if (supabase) await supabase.from('contracts').insert(newContract);
        } catch (e) { console.error(e); }
        return newContract;
    };

    const updateContract = async (updatedContract) => {
        setContracts(contracts.map(c => c.id === updatedContract.id ? updatedContract : c));
        try {
            if (supabase) await supabase.from('contracts').update(updatedContract).eq('id', updatedContract.id);
        } catch (e) { console.error(e); }
    };

    const deleteContract = async (id) => {
        setContracts(contracts.filter(c => c.id !== id));
        try {
            if (supabase) await supabase.from('contracts').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const updateContractStatus = async (contractId, status) => {
        const contract = contracts.find(c => c.id === contractId);
        if (contract) {
            updateContract({ ...contract, status });
        }
    };

    const recordContractPayment = async (contractId, paymentType, amount, accountName) => {
        const contract = contracts.find(c => c.id === contractId);
        if (!contract) return;

        const paymentLabels = {
            'deposit': 'دفعة التعاقد (60%)',
            'operation': 'دفعة التشغيل (30%)',
            'delivery': 'دفعة الاستلام (10%)'
        };

        // Add financial transaction
        addTransaction({
            type: 'income',
            amount: amount,
            category: 'تحصيل كيتشنز',
            account: accountName,
            notes: `تحصيل ${paymentLabels[paymentType] || paymentType} للعميل ${contract.customer?.name}`
        });

        // Update contract payment records and status based on payment type
        const updatedContract = {
            ...contract,
            status: paymentType === 'deposit' ? 'manufacturing' :
                paymentType === 'operation' ? 'completed' :
                    paymentType === 'delivery' ? 'delivering' : contract.status,
            payments: {
                ...(contract.payments || {}),
                [paymentType]: {
                    amount,
                    date: new Date().toISOString(),
                    account: accountName,
                    received: true
                }
            }
        };

        setContracts(prev => prev.map(c => c.id === contractId ? updatedContract : c));
        try {
            if (supabase) await supabase.from('contracts').update(updatedContract).eq('id', contractId);
        } catch (e) { console.error(e); }
    };

    const cancelContractPayment = async (contractId, paymentType) => {
        const contract = contracts.find(c => c.id === contractId);
        if (!contract || !contract.payments?.[paymentType]?.received) return;

        const payment = contract.payments[paymentType];

        const paymentLabels = {
            'deposit': 'دفعة التعاقد (60%)',
            'operation': 'دفعة التشغيل (30%)',
            'delivery': 'دفعة الاستلام (10%)'
        };

        // Add reversal transaction (expense)
        addTransaction({
            type: 'expense',
            amount: payment.amount,
            category: 'إلغاء تحصيل',
            account: payment.account,
            notes: `إلغاء تحصيل ${paymentLabels[paymentType] || paymentType} للعميل ${contract.customer?.name}`
        });

        // Update contract payment records
        const payments = { ...contract.payments };
        delete payments[paymentType];
        const updatedContract = { ...contract, payments };

        setContracts(prev => prev.map(c => c.id === contractId ? updatedContract : c));
        try {
            if (supabase) await supabase.from('contracts').update(updatedContract).eq('id', contractId);
        } catch (e) { console.error(e); }
    };

    const addUser = async (user) => {
        const id = Date.now().toString();
        const newUser = { ...user, id, status: 'active' };
        setUsers([...users, newUser]);
        try {
            if (supabase) await supabase.from('users').insert(newUser);
        } catch (e) { console.error(e); }
    };

    const updateUser = async (updatedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        try {
            if (supabase) await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
        } catch (e) { console.error(e); }
        // If updating current user, update currentUser state too
        if (currentUser && currentUser.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
    };

    const deleteUser = async (id) => {
        setUsers(users.filter(u => u.id !== id));
        try {
            if (supabase) await supabase.from('users').delete().eq('id', id);
        } catch (e) { console.error(e); }
    };

    const updateSettings = async (newSettings) => {
        const updated = { ...systemSettings, ...newSettings };
        setSystemSettings(updated);
        try {
            if (supabase) await supabase.from('settings').update(updated).eq('id', 'global');
        } catch (e) { console.error(e); }
    };

    // Migration: Ensure all admins have new permissions when they are added to the system
    useEffect(() => {
        setUsers(prev => prev.map(u => {
            if (u.role === 'admin') {
                const updatedPerms = { ...adminPermissions, ...u.permissions };
                // Check if any permission is missing
                if (JSON.stringify(updatedPerms) !== JSON.stringify(u.permissions)) {
                    return { ...u, permissions: updatedPerms };
                }
            }
            return u;
        }));
    }, []);

    const login = (username, password) => {
        const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <AppContext.Provider value={{
            customers,
            addCustomer,
            updateCustomer,
            deleteCustomer,
            purchases,
            addPurchase,
            inventory,
            contracts,
            addContract,
            updateContract,
            deleteContract,
            inspections,
            addInspection,
            updateInspection,
            deleteInspection,
            invoices,
            addInvoice,
            updateInvoice,
            deleteInvoice,
            updateInvoiceStatus,
            users,
            addUser,
            updateUser,
            deleteUser,
            systemSettings,
            updateSettings,
            currentUser,
            login,
            logout,
            defaultPermissions,
            transactions,
            accounts,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            addAccount,
            updateAccount,
            deleteAccount,
            adjustAccountBalance,
            adjustCustomerBalance,
            employees,
            addEmployee,
            updateEmployee,
            deleteEmployee,
            paySalary,
            recurringExpenses,
            addRecurring,
            deleteRecurring,
            processRecurring,
            updateContractStatus,
            recordContractPayment,
            cancelContractPayment,
            updatePurchase,
            deletePurchase,
            addInventoryItem,
            updateInventoryItem,
            deleteInventoryItem
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
