export const WABlastModule = {
    // Ambil senarai hitam (Nombor yang minta STOP)
    getJail: () => JSON.parse(localStorage.getItem('ketick_jail')) || [],
    
    addToJail: (phone) => {
        const jail = WABlastModule.getJail();
        if (!jail.includes(phone)) {
            jail.push(phone);
            localStorage.setItem('ketick_jail', JSON.stringify(jail));
        }
    },

    // Janakan kod rawak 25 aksara (Anti-Spam)
    generateKetickCode: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = 'KETICK'; // Mula dengan KETICK
        for (let i = 0; i < 19; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result; // Total 25 aksara
    },

    // Proses Blast dengan Delay & Filter Jail
    processBlast: async (message, delaySeconds, onProgress) => {
        const customers = JSON.parse(localStorage.getItem('ketick_crm')) || [];
        const jail = WABlastModule.getJail();
        
        // Tapis pelanggan: Buang yang ada dalam Jail
        const targetList = customers.filter(c => !jail.includes(c.phone));
        
        for (let i = 0; i < targetList.length; i++) {
            const customer = targetList[i];
            const randomCode = WABlastModule.generateKetickCode();
            
            // Format mesej: Personalised + Stop Option + Random Code
            const fullMessage = `${message.replace('[NAMA]', customer.name)}\n\nBalas STOP untuk berhenti.\n\nRef: ${randomCode}`;
            const waLink = `https://wa.me/${customer.phone}?text=${encodeURIComponent(fullMessage)}`;

            onProgress(i + 1, targetList.length, customer.name);
            
            // Buka WhatsApp
            window.open(waLink, '_blank');

            // Tunggu delay (Simulasi delay untuk elak banned)
            if (i < targetList.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
            }
        }
        return true;
    }
};
