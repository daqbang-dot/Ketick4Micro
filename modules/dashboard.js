import { InventoryModule } from './inventory.js';
import { HistoryModule } from './history.js';
import { LHDNModule } from './lhdn.js';

export const DashboardModule = {
    render: (containerId, planConfig) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 1. Kira Total Stok
        const products = InventoryModule.getProducts();
        const totalStockUnits = products.reduce((sum, p) => sum + parseInt(p.qty || 0), 0);

        // 2. Kira Total Jualan POS (Dari Sejarah)
        const history = HistoryModule.getHistory();
        const totalSales = history.reduce((sum, trx) => sum + parseFloat(trx.total || 0), 0);

        // 3. Kira Total Perbelanjaan (Dari LHDN)
        const expenses = LHDNModule.getExpenses();
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

        // 4. Untung Bersih Semasa
        const netProfit = totalSales - totalExpenses;

        // Render UI
        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-gradient-to-br from-primary to-primaryHover dark:from-purple-900/60 dark:to-black p-5 rounded-3xl border border-primary/20 dark:border-white/20 shadow-sm dark:shadow-md text-white relative overflow-hidden">
                    <div class="absolute top-0 right-0 bg-white/20 px-2 py-1 rounded-bl-lg text-[8px] font-bold">REAL-TIME</div>
                    <h3 class="text-[10px] opacity-80 font-bold tracking-widest uppercase mb-1">Untung Bersih</h3>
                    <p class="text-xl font-bold">RM ${netProfit.toFixed(2)}</p>
                </div>
                <div class="bg-white dark:bg-white/5 p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none text-slate-800 dark:text-white">
                    <h3 class="text-[10px] opacity-70 font-bold tracking-widest uppercase mb-1">Total Stok</h3>
                    <p class="text-2xl font-bold">${totalStockUnits} <span class="text-[10px] opacity-50">Unit</span></p>
                </div>
            </div>
            
            <div class="bg-white dark:bg-white/5 p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none flex justify-between items-center text-slate-800 dark:text-white">
                <div>
                    <h3 class="text-[9px] opacity-70 font-bold tracking-widest uppercase">Jualan Kasar (POS)</h3>
                    <p class="text-sm font-bold text-primary dark:text-purple-400">RM ${totalSales.toFixed(2)}</p>
                </div>
                <div class="text-right">
                    <h3 class="text-[9px] opacity-70 font-bold tracking-widest uppercase">Kos & Belanja</h3>
                    <p class="text-sm font-bold text-red-500">- RM ${totalExpenses.toFixed(2)}</p>
                </div>
            </div>
        `;
    }
};
