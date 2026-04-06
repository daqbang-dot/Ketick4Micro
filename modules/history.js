export const HistoryModule = {
    getHistory: () => JSON.parse(localStorage.getItem('ketick_history')) || [],

    // Kumpul data ikut bulan (Untuk Monthly Report)
    getMonthlySummary: () => {
        const history = HistoryModule.getHistory();
        const summary = {};

        history.forEach(trx => {
            const date = new Date(trx.date);
            const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            if (!summary[key]) {
                summary[key] = { totalSales: 0, count: 0, transactions: [] };
            }
            summary[key].totalSales += trx.total;
            summary[key].count += 1;
            summary[key].transactions.push(trx);
        });
        return summary;
    },

    // Fungsi carian yang fleksibel
    search: (query) => {
        const history = HistoryModule.getHistory();
        const q = query.toLowerCase();
        return history.filter(h => 
            h.customer?.name.toLowerCase().includes(q) || 
            h.customer?.phone.includes(q) || 
            h.billNo.toString().includes(q) ||
            h.date.includes(q)
        );
    },

    render: (containerId, planConfig, searchQuery = "") => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const history = searchQuery ? HistoryModule.search(searchQuery) : HistoryModule.getHistory();
        const monthlySummary = HistoryModule.getMonthlySummary();

        if (history.length === 0) {
            container.innerHTML = `<div class="text-center py-10 opacity-30 text-xs italic">Tiada rekod ditemui.</div>`;
            return;
        }

        // Paparan UI mengikut kategori Bulan
        let html = '';
        
        // Render Monthly Report Summary (Jika tiada carian)
        if (!searchQuery) {
            html += `<div class="grid grid-cols-2 gap-2 mb-6">`;
            for (const month in monthlySummary) {
                html += `
                <div class="bg-purple-900/20 border border-purple-500/30 p-3 rounded-2xl text-center">
                    <p class="text-[8px] opacity-60 uppercase">${month}</p>
                    <p class="text-xs font-bold">RM ${monthlySummary[month].totalSales.toFixed(2)}</p>
                    <p class="text-[7px] opacity-40">${monthlySummary[month].count} Transaksi</p>
                </div>`;
            }
            html += `</div>`;
        }

        // Render Senarai Transaksi
        html += history.map(h => `
            <div class="bg-white/5 border border-white/10 p-4 rounded-3xl mb-3 shadow-lg">
                <div class="flex justify-between items-center border-b border-white/10 pb-3 mb-2">
                    <div>
                        <span class="text-xs font-bold text-white">#${h.billNo}</span>
                        <span class="text-[8px] bg-white/10 px-2 py-0.5 rounded-full ml-2">${h.type}</span>
                    </div>
                    <span class="text-sm font-bold text-purple-400">RM ${h.total.toFixed(2)}</span>
                </div>
                <div class="flex justify-between items-center text-[10px]">
                    <div class="opacity-70">
                        <p class="font-bold">${h.customer ? h.customer.name : 'Walk-in'}</p>
                        <p class="text-[8px] opacity-50">${h.date}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[8px] opacity-50 uppercase">${h.paymentMethod}</p>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }
};
