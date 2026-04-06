export const Buku555Module = {
    getDebts: () => JSON.parse(localStorage.getItem('ketick_555')) || [],
    saveDebts: (data) => localStorage.setItem('ketick_555', JSON.stringify(data)),
    
    addDebt: (customer, amount, billNo) => {
        let debts = Buku555Module.getDebts();
        debts.push({
            id: Date.now(),
            name: customer.name,
            phone: customer.phone,
            amount: parseFloat(amount),
            billNo: billNo,
            date: new Date().toLocaleString() // Tarikh dan Masa direkodkan
        });
        Buku555Module.saveDebts(debts);
    },

    payDebt: (id, payAmount) => {
        let debts = Buku555Module.getDebts();
        let idx = debts.findIndex(x => x.id === id);
        if(idx > -1) {
            debts[idx].amount -= parseFloat(payAmount);
            if(debts[idx].amount <= 0) {
                debts.splice(idx, 1); // Padam hutang jika dah langsai
            }
            Buku555Module.saveDebts(debts);
            return true;
        }
        return false;
    }
};
