export const WABlastModule = {
    getJail: () => JSON.parse(localStorage.getItem('ketick_jail')) || [],
    
    addToJail: (phone) => {
        const jail = WABlastModule.getJail();
        if (!jail.includes(phone)) {
            jail.push(phone);
            localStorage.setItem('ketick_jail', JSON.stringify(jail));
        }
    },

    generateKetickCode: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'KETICK'; 
        for (let i = 0; i < 19; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result; 
    },

    // 1. SEMI-AUTO (Guna wa.me - Untuk Chrome/Phone Biasa)
    generateBlastLinks: (message) => {
        const customers = JSON.parse(localStorage.getItem('ketick_crm')) || [];
        const jail = WABlastModule.getJail();
        
        // Tapis pelanggan: Buang yang ada dalam Jail
        const targetList = customers.filter(c => !jail.includes(c.phone));
        
        return targetList.map(c => {
            const randomCode = WABlastModule.generateKetickCode();
            const fullMessage = `${message.replace('[NAMA]', c.name)}\n\nBalas STOP untuk berhenti.\n\nRef: ${randomCode}`;
            return {
                name: c.name,
                phone: c.phone,
                link: `https://wa.me/${c.phone}?text=${encodeURIComponent(fullMessage)}`
            };
        });
    },

    // 2. TURBO AUTO (Guna web.whatsapp.com - Untuk Kiwi Browser + Extension)
    generateTurboLinks: (message) => {
        const customers = JSON.parse(localStorage.getItem('ketick_crm')) || [];
        const jail = WABlastModule.getJail();
        const targetList = customers.filter(c => !jail.includes(c.phone));
        
        return targetList.map(c => {
            const randomCode = WABlastModule.generateKetickCode();
            const fullMessage = `${message.replace('[NAMA]', c.name)}\n\nBalas STOP untuk berhenti.\n\nRef: ${randomCode}`;
            return {
                name: c.name,
                link: `https://web.whatsapp.com/send?phone=${c.phone}&text=${encodeURIComponent(fullMessage)}`
            };
        });
    }
};
