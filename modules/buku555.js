export const Buku555Module = {
    getDebts: () => JSON.parse(localStorage.getItem('ketick_555')) || [],
    
    addDebt: (customer, amount, billNo) => {
        let debts = Buku555Module.getDebts();
        debts.push({ id: Date.now(), customerId: customer.id, name: customer.name, phone: customer.phone, amount: amount, billNo: billNo, date: new Date().toLocaleString(), status: 'HUTANG' });
        localStorage.setItem('ketick_555', JSON.stringify(debts));
    }
};
