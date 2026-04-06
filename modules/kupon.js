export const KuponModule = {
    getKupons: () => JSON.parse(localStorage.getItem('ketick_kupons')) || [],
    
    saveKupons: (kupons) => {
        localStorage.setItem('ketick_kupons', JSON.stringify(kupons));
    },

    // Tauke tambah kupon baru
    addKupon: (data) => {
        const kupons = KuponModule.getKupons();
        const newKupon = {
            id: Date.now(),
            code: data.code.toUpperCase(),
            type: data.type, // 'PERCENT' atau 'FIXED'
            value: parseFloat(data.value),
            minSpend: parseFloat(data.minSpend),
            qty: parseInt(data.qty), // Stok kupon
            used: 0
        };
        kupons.push(newKupon);
        KuponModule.saveKupons(kupons);
    },

    // Semak kupon semasa POS
    verifyKupon: (code, cartTotal) => {
        const kupons = KuponModule.getKupons();
        const kupon = kupons.find(k => k.code === code.toUpperCase());
        
        if (!kupon) return { valid: false, msg: "Kod kupon tidak wujud." };
        if (kupon.qty <= 0) return { valid: false, msg: "Kupon ini telah habis ditebus." };
        if (cartTotal < kupon.minSpend) return { valid: false, msg: `Minimum belanja RM${kupon.minSpend} diperlukan.` };
        
        let discountAmt = kupon.type === 'PERCENT' ? (cartTotal * (kupon.value / 100)) : kupon.value;
        return { valid: true, discount: discountAmt, detail: kupon };
    },

    // Tolak kuantiti bila transaksi berjaya
    decrementKupon: (code) => {
        if (!code) return;
        const kupons = KuponModule.getKupons();
        const index = kupons.findIndex(k => k.code === code.toUpperCase());
        
        if (index !== -1 && kupons[index].qty > 0) {
            kupons[index].qty -= 1;
            kupons[index].used += 1;
            KuponModule.saveKupons(kupons);
            console.log(`[KUPON] ${code} ditolak. Baki: ${kupons[index].qty}`);
        }
    }
};
