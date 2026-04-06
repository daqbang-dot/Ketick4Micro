export const KuponModule = {
    getKupons: () => JSON.parse(localStorage.getItem('ketick_kupon')) || [],
    saveKupons: (data) => localStorage.setItem('ketick_kupon', JSON.stringify(data)),
    
    addKupon: (data) => {
        const k = KuponModule.getKupons();
        k.push({
            id: Date.now(), 
            code: data.code.toUpperCase(), 
            type: data.type, 
            value: parseFloat(data.value), 
            minSpend: parseFloat(data.minSpend), 
            qty: parseInt(data.qty), 
            used: 0
        });
        KuponModule.saveKupons(k);
    },

    updateKupon: (id, data) => {
        let k = KuponModule.getKupons();
        let idx = k.findIndex(x => x.id === id);
        if(idx > -1) {
            k[idx] = { ...k[idx], ...data, value: parseFloat(data.value), minSpend: parseFloat(data.minSpend), qty: parseInt(data.qty) };
            KuponModule.saveKupons(k);
        }
    },

    deleteKupon: (id) => {
        let k = KuponModule.getKupons();
        KuponModule.saveKupons(k.filter(x => x.id !== id));
    },

    verifyKupon: (code, subtotal) => {
        const k = KuponModule.getKupons().find(x => x.code === code.toUpperCase());
        if(!k) return {valid: false, msg: "Kupon tidak wujud."};
        if(k.qty <= 0) return {valid: false, msg: "Kupon telah habis ditebus."};
        if(subtotal < k.minSpend) return {valid: false, msg: `Syarat tidak sah! Belanja minimum ialah RM${k.minSpend.toFixed(2)}.`};
        
        let disc = k.type === 'PERCENT' ? subtotal * (k.value/100) : k.value;
        return {valid: true, discount: disc, kupon: k};
    },

    decrementKupon: (code) => {
        let k = KuponModule.getKupons();
        let target = k.find(x => x.code === code.toUpperCase());
        if(target && target.qty > 0) { 
            target.qty -= 1; 
            target.used += 1; 
            KuponModule.saveKupons(k); 
        }
    }
};
