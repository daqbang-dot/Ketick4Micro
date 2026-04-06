import { HistoryModule } from './history.js';

export const LHDNModule = {
    getExpenses: () => JSON.parse(localStorage.getItem('ketick_expenses')) || [],
    
    saveExpense: (desc, amount, category, imgBase64) => {
        const expenses = LHDNModule.getExpenses();
        expenses.push({
            id: Date.now(),
            date: new Date().toLocaleString(),
            desc: desc,
            amount: parseFloat(amount),
            category: category,
            img: imgBase64 || null
        });
        localStorage.setItem('ketick_expenses', JSON.stringify(expenses));
        return true;
    },

    deleteExpense: (id) => {
        let expenses = LHDNModule.getExpenses();
        expenses = expenses.filter(e => e.id !== id);
        localStorage.setItem('ketick_expenses', JSON.stringify(expenses));
    },

    // JANA FORMAT E-INVOICE (JSON Khas LHDN MyInvois System - Asas)
    generateEInvoiceJSON: (billNo) => {
        const history = HistoryModule.getHistory();
        const trx = history.find(h => h.billNo === billNo);
        if(!trx) return alert("Transaksi tidak dijumpai.");

        const eInvoiceFormat = {
            "_version": "1.0",
            "invoiceTypeCode": "01",
            "issueDate": new Date(trx.date).toISOString().split('T')[0],
            "issuer": { "name": "KETICK Merchant" }, // Sepatutnya ambil dari Biz Settings
            "buyer": { "name": trx.customer?.name || "General Public", "contact": trx.customer?.phone || "" },
            "paymentMeans": trx.paymentMethod,
            "totalAmount": trx.total.toFixed(2),
            "lines": trx.items.map(item => ({
                "productName": item.name,
                "quantity": 1,
                "unitPrice": item.price.toFixed(2)
            }))
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(eInvoiceFormat, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        link.setAttribute("download", `eInvoice_${billNo}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    // JANA LAPORAN LHDN (Pilih Bulan atau Tahun)
    downloadTaxReport: (type, value) => { // type: 'MONTH' or 'YEAR', value: '04-2026' or '2026'
        const history = HistoryModule.getHistory();
        const expenses = LHDNModule.getExpenses();
        
        let filteredSales = [];
        let filteredExpenses = [];

        if (type === 'MONTH') {
            const [m, y] = value.split('-');
            filteredSales = history.filter(h => new Date(h.date).getMonth() + 1 == m && new Date(h.date).getFullYear() == y);
            filteredExpenses = expenses.filter(e => new Date(e.date).getMonth() + 1 == m && new Date(e.date).getFullYear() == y);
        } else if (type === 'YEAR') {
            filteredSales = history.filter(h => new Date(h.date).getFullYear() == value);
            filteredExpenses = expenses.filter(e => new Date(e.date).getFullYear() == value);
        }

        const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalSales - totalExpenses;

        let csv = `LAPORAN KEWANGAN LHDN (${type}: ${value})\n\n`;
        csv += `RINGKASAN\nTotal Pendapatan (Jualan),RM ${totalSales.toFixed(2)}\nTotal Perbelanjaan,RM ${totalExpenses.toFixed(2)}\nUNTUNG BERSIH,RM ${netProfit.toFixed(2)}\n\n`;
        
        csv += `REKOD PENDAPATAN (JUALAN)\nTarikh,No_Bil,Pelanggan,Amaun(RM),Kaedah\n`;
        filteredSales.forEach(s => csv += `"${s.date}",${s.billNo},"${s.customer?.name || 'Walk-in'}",${s.total.toFixed(2)},${s.paymentMethod}\n`);
        
        csv += `\nREKOD PERBELANJAAN (KOS)\nTarikh,Kategori,Penerangan,Amaun(RM)\n`;
        filteredExpenses.forEach(e => csv += `"${e.date}",${e.category},"${e.desc}",${e.amount.toFixed(2)}\n`);

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", `Laporan_${type}_${value}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
