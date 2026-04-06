import { POSModule } from './pos.js';
import { InventoryModule } from './inventory.js';

export const DashboardModule = {
    render: (containerId, planConfig) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Kira jumlah stok sebenar (Bukan sekadar jumlah jenis barang)
        const products = InventoryModule.getProducts();
        const totalStockUnits = products.reduce((sum, p) => sum + parseInt(p.qty), 0);

        const posSales = POSModule.nextBillNo - 1001; 

        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gradient-to-br from-primary to-primaryHover dark:from-purple-900/60 dark:to-black p-5 rounded-3xl border border-white/20 shadow-lg text-white">
                    <h3 class="text-[10px] opacity-70 font-bold tracking-widest uppercase mb-1">Jualan POS</h3>
                    <p class="text-2xl font-bold">${posSales} <span class="text-[10px] opacity-50">Resit</span></p>
                </div>
                <div class="bg-white dark:bg-white/5 p-5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none text-slate-800 dark:text-white">
                    <h3 class="text-[10px] opacity-70 font-bold tracking-widest uppercase mb-1">Total Stok</h3>
                    <p class="text-2xl font-bold">${totalStockUnits} <span class="text-[10px] opacity-50">Unit</span></p>
                </div>
            </div>
        `;
    }
};
