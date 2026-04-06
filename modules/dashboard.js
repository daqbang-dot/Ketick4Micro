export const DashboardModule = {
    // Ambil data jualan (Simulasi: Kita ambil dari 'ketick_bill_no' sebagai indikator jualan)
    getStats: () => {
        const products = JSON.parse(localStorage.getItem('ketick_products')) || [];
        const nextBill = parseInt(localStorage.getItem('ketick_bill_no')) || 1001;
        const totalSalesCount = nextBill - 1001;
        
        return {
            totalProducts: products.length,
            totalTransactions: totalSalesCount,
            estimatedRevenue: (totalSalesCount * 25.50).toFixed(2) // Simulasi harga purata
        };
    },

    render: (containerId, planConfig) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Semakan Pelan: Hanya PRO ke atas boleh tengok laporan
        if (!planConfig.enableSalesReports) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div class="text-4xl mb-4">🔒</div>
                    <h2 class="font-bold text-lg">Modul Laporan Disekat</h2>
                    <p class="text-xs opacity-50 mt-2">Sila naik taraf ke pakej PRO atau LEGEND untuk melihat statistik jualan dan prestasi bisnes anda.</p>
                    <button onclick="alert('Buka Pricing Page')" class="mt-6 bg-purple-600 px-6 py-2 rounded-xl text-xs font-bold shadow-lg">UPGRADE SEKARANG</button>
                </div>
            `;
            return;
        }

        const stats = DashboardModule.getStats();
        container.innerHTML = `
            <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="bg-white/5 border border-white/5 p-4 rounded-3xl">
                    <p class="text-[10px] opacity-50 uppercase font-bold">Jualan</p>
                    <h3 class="text-xl font-bold text-purple-400">${stats.totalTransactions}</h3>
                </div>
                <div class="bg-white/5 border border-white/5 p-4 rounded-3xl">
                    <p class="text-[10px] opacity-50 uppercase font-bold">Produk</p>
                    <h3 class="text-xl font-bold text-blue-400">${stats.totalProducts}</h3>
                </div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-3xl shadow-xl mb-6">
                <p class="text-[10px] text-white/70 uppercase font-bold tracking-widest">Anggaran Pendapatan</p>
                <h2 class="text-3xl font-bold text-white mt-1">RM ${stats.estimatedRevenue}</h2>
                <div class="mt-4 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                    <div class="h-full bg-white w-2/3"></div>
                </div>
                <p class="text-[9px] text-white/50 mt-2 italic">* Data berdasarkan transaksi resit muktamad.</p>
            </div>

            <div class="bg-white/5 border border-white/5 p-5 rounded-3xl">
                <h4 class="text-xs font-bold mb-4 opacity-70 uppercase">Prestasi Mingguan</h4>
                <div class="flex items-end justify-between h-20 gap-2 px-2">
                    <div class="w-full bg-white/10 rounded-t-lg h-[40%]"></div>
                    <div class="w-full bg-white/10 rounded-t-lg h-[60%]"></div>
                    <div class="w-full bg-purple-500 rounded-t-lg h-[90%] shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                    <div class="w-full bg-white/10 rounded-t-lg h-[30%]"></div>
                    <div class="w-full bg-white/10 rounded-t-lg h-[50%]"></div>
                    <div class="w-full bg-white/10 rounded-t-lg h-[75%]"></div>
                    <div class="w-full bg-white/10 rounded-t-lg h-[45%]"></div>
                </div>
                <div class="flex justify-between mt-2 text-[8px] opacity-30 font-bold">
                    <span>ISN</span><span>SEL</span><span>RAB</span><span>KHA</span><span>JUM</span><span>SAB</span><span>AHA</span>
                </div>
            </div>
        `;
    }
};
