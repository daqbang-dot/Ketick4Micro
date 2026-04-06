export const SyncModule = {
    isSyncing: false,

    // Simulasi hantar data ke Cloud (CommandCenter)
    uploadData: async () => {
        if (SyncModule.isSyncing) return;
        
        SyncModule.isSyncing = true;
        SyncModule.updateUI("Syncing...");

        // Ambil semua data penting dari LocalStorage
        const dataToSync = {
            products: JSON.parse(localStorage.getItem('ketick_products')) || [],
            bizInfo: JSON.parse(localStorage.getItem('ketick_biz')) || {},
            lastBill: localStorage.getItem('ketick_bill_no') || "1001",
            timestamp: new Date().toISOString()
        };

        console.log("[SYNC] Menghantar data ke KETICK CommandCenter...", dataToSync);

        // Simulasi lengah masa internet (Network Latency) selama 2 saat
        return new Promise((resolve) => {
            setTimeout(() => {
                SyncModule.isSyncing = false;
                const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                SyncModule.updateUI(`Synced at ${now}`);
                console.log("[SYNC] Data berjaya dikemaskini di Cloud.");
                resolve(true);
            }, 2000);
        });
    },

    // Kemaskini teks indikator di Header
    updateUI: (status) => {
        const el = document.getElementById('sync-status');
        if (el) {
            el.innerText = status;
            // Tambah kesan berkelip jika sedang syncing
            if (SyncModule.isSyncing) el.classList.add('animate-pulse', 'text-yellow-500');
            else el.classList.remove('animate-pulse', 'text-yellow-500');
        }
    }
};
