export const HistoryModule = {
    getHistory: () => JSON.parse(localStorage.getItem('ketick_history')) || [],

    // Simpan transaksi baru (dipanggil dari app.js)
    saveTransaction: (trx) => {
        const history = HistoryModule.getHistory();
        history.unshift(trx); // Letak yang terbaru di atas
        // Simpan 100 transaksi terakhir sahaja untuk jimat memori
        if (history.length > 100) history.pop();
        localStorage.setItem('ketick_history', JSON.stringify(history));
    },

    // Kumpul data ikut bulan (Untuk Monthly Report Summary)
    getMonthlySummary: () => {
        const history = HistoryModule.getHistory();
        const summary = {};

        history.forEach(trx => {
            const date = new Date(trx.date);
            const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            if (!summary[key]) {
                summary[key] = { totalSales: 0, count: 0 };
            }
            summary[key].totalSales += trx.total;
            summary[key].count += 1;
        });
        return summary;
    },

    // Fungsi carian
    search: (query) => {
        const history = HistoryModule.getHistory();
        const q = query.toLowerCase();
        return history.filter(h => 
            (h.customer && h.customer.name.toLowerCase().includes(q)) || 
            (h.customer && h.customer.phone.includes(q)) || 
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
            container.innerHTML = `<div class="text-center py-10 opacity-30 text-xs italic text-slate-500 dark:text-white">Tiada rekod ditemui.</div>`;
            return;
        }

        let html = '';
        
        // 1. Render Monthly Summary (Gaya Glassmorphism Baru)
        if (!searchQuery) {
            html += `<div class="grid grid-cols-2 gap-2 mb-6">`;
            for (const month in monthlySummary) {
                html += `
                <div class="bg-white dark:bg-purple-900/20 border border-slate-200 dark:border-purple-500/30 p-3 rounded-2xl text-center shadow-sm dark:shadow-none">
                    <p class="text-[8px] opacity-60 uppercase font-bold text-slate-500 dark:text-purple-300">${month}</p>
                    <p class="text-xs font-bold text-slate-800 dark:text-white">RM ${monthlySummary[month].totalSales.toFixed(2)}</p>
                    <p class="text-[7px] opacity-40 text-slate-500 dark:text-gray-400">${monthlySummary[month].count} Transaksi</p>
                </div>`;
            }
            html += `</div>`;
        }

        // 2. Render Senarai Transaksi (Gaya UI/UX Baru + Butang e-Invois)
        html += history.map(h => `
            <div class="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-3xl mb-3 shadow-sm dark:shadow-none transition-all">
                <div class="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-3 mb-2">
                    <div>
                        <span class="text-xs font-bold text-slate-800 dark:text-white">#${h.billNo}</span>
                        <span class="text-[8px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white px-2 py-0.5 rounded-full ml-2 font-bold">${h.type}</span>
                    </div>
                    <span class="text-sm font-bold text-primary dark:text-purple-400">RM ${h.total.toFixed(2)}</span>
                </div>
                <div class="flex justify-between items-center text-[10px]">
                    <div class="opacity-70 text-slate-600 dark:text-white">
                        <p class="font-bold">${h.customer ? h.customer.name : 'Walk-in'}</p>
                        <p class="text-[8px] opacity-50">${h.date}</p>
                    </div>
                    <div class="text-right flex items-center gap-2">
                        <button onclick="generateEInvoiceJSON(${h.billNo})" class="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/50 px-2 py-1 rounded-lg text-[8px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition">
                            e-Invois
                        </button>
                        <div class="text-[8px] opacity-40 uppercase font-bold text-slate-500 dark:text-white">${h.paymentMethod}</div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }
};
