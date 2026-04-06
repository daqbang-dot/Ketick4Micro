export const CRMModule = {
    getCustomers: () => JSON.parse(localStorage.getItem('ketick_crm')) || [],
    
    saveCustomer: (name, phone) => {
        // Format & Validasi No Phone (Wajib bermula dengan 6, tiada +)
        let formattedPhone = phone.replace(/\D/g,''); // Buang semua simbol/huruf
        if (formattedPhone.startsWith('0')) formattedPhone = '6' + formattedPhone;
        if (!formattedPhone.startsWith('6')) return { success: false, msg: "No. Telefon mesti bermula dengan 6 (Contoh: 6012...)" };

        let customers = CRMModule.getCustomers();
        let existing = customers.find(c => c.phone === formattedPhone);
        
        if (existing) {
            existing.name = name; // Update nama jika pelanggan dah wujud
        } else {
            customers.push({ id: Date.now(), name: name, phone: formattedPhone, points: 0, totalSpent: 0 });
        }
        
        localStorage.setItem('ketick_crm', JSON.stringify(customers));
        return { success: true, customer: existing || customers[customers.length - 1] };
    },

    searchCustomer: (phone) => {
        let formattedPhone = phone.replace(/\D/g,'');
        if (formattedPhone.startsWith('0')) formattedPhone = '6' + formattedPhone;
        return CRMModule.getCustomers().find(c => c.phone === formattedPhone) || null;
    }
};
