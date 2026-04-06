export const KuponModule = {
    getKupons: () => JSON.parse(localStorage.getItem('ketick_kupon')) || [],
    
    verifyKupon: (code, cartTotal) => {
        const kupons = KuponModule.getKupons();
        const kupon = kupons.find(k => k.code.toUpperCase() === code.toUpperCase());
        
        if (!kupon) return { valid: false, msg: "Kupon tidak sah" };
        if (kupon.minSpend > cartTotal) return { valid: false, msg: `Belanja minimum RM${kupon.minSpend} diperlukan` };
        
        let discountAmt = kupon.type === 'PERCENT' ? (cartTotal * (kupon.value / 100)) : kupon.value;
        return { valid: true, discount: discountAmt, detail: kupon };
    }
};
