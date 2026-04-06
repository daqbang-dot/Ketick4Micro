import { BillingModule } from './billing.js';

export const HistoryModule = {
    // Ambil data sejarah jualan
    getHistory: () => {
        return JSON.parse(localStorage.getItem('ketick_history')) || [];
    },

    // Simpan rekod transaksi baru
    saveTransaction: (transaction) => {
        const history = HistoryModule.getHistory();
        history.unshift(transaction); // Masukkan di kedudukan paling atas (terkini)
        
        // Simpan maksimum 100 rekod terakhir (untuk jimatkan memori telefon)
        if(history.length > 100) history.pop(); 
        
        localStorage.setItem('ketick_history', JSON.stringify(history));
    },

    // Render paparan sejarah
    render: (containerId, planConfig) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const history = HistoryModule.getHistory();

        if (history.length === 0) {
            container.innerHTML = `<div class="text-center py-20 opacity-30 text-xs italic">Tiada rekod jualan setakat ini.</div>`;
            return;
        }

        container.innerHTML = history.map(h => `
            <div class="bg-white/5 border border-white/10 p-4 rounded-3xl mb-3 shadow-lg">
                <div class="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                    <div>
                        <span class="text-xs font-bold ${h.type === 'RECEIPT' ? 'text-green-400' : 'text-purple-400'}">#${h.billNo} (${h.type})</span>
                        <div class="text-[9px] opacity-50 mt-1">${h.date}</div>
                    </div>
                    <span class="text-lg font-bold text-white">RM ${h.total.toFixed(2)}</span>
                </div>
                <div class="text-[10px] opacity-70 mb-4 line-clamp-2 leading-relaxed">
                    ${h.items.map(i => `${i.name} (x1)`).join(', ')}
                </div>
                <button class="w-full border border-white/20 hover:bg-white/10 py-3 rounded-xl text-[10px] font-bold transition reprint-btn" data-bill="${h.billNo}">
                    📄 CETAK SEMULA / SHARE
                </button>
            </div>
        `).join('');

        // Aktifkan butang cetak semula
        container.querySelectorAll('.reprint-btn').forEach(btn => {
            btn.onclick = () => {
                const billNo = parseInt(btn.getAttribute('data-bill'));
                const record = history.find(h => h.billNo === billNo);
                if(record) {
                    BillingModule.generatePDF(record.type, record.billNo, record.items, record.total, planConfig);
                }
            };
        });
    }
};
