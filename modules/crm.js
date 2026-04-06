export const CRMModule = {
    getCustomers: () => JSON.parse(localStorage.getItem('ketick_crm')) || [],
    
    saveCustomer: (name, phone) => {
        let formattedPhone = phone.replace(/\D/g,''); 
        if (formattedPhone.startsWith('0')) formattedPhone = '6' + formattedPhone;
        if (!formattedPhone.startsWith('6')) return { success: false, msg: "No. Tel mesti mula dengan 6" };

        let customers = CRMModule.getCustomers();
        let existing = customers.find(c => c.phone === formattedPhone);
        
        if (existing) {
            existing.name = name; 
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
    },

    // Import dari Contact Android (Web Contact API)
    importFromContacts: async () => {
        if (!('contacts' in navigator && 'ContactsManager' in window)) {
            return { success: false, msg: "Peranti/Browser anda tidak menyokong fungsi baca Contact. Sila guna Chrome di Android." };
        }
        try {
            const props = ['name', 'tel'];
            const opts = { multiple: true };
            const contacts = await navigator.contacts.select(props, opts);
            
            let imported = 0;
            contacts.forEach(c => {
                if(c.tel && c.tel.length > 0) {
                    let phone = c.tel[0];
                    let name = c.name ? c.name[0] : "Tanpa Nama";
                    let res = CRMModule.saveCustomer(name, phone);
                    if(res.success) imported++;
                }
            });
            return { success: true, count: imported };
        } catch(e) {
            return { success: false, msg: "Akses kenalan dibatalkan oleh pengguna." };
        }
    },

    // Import dari Excel menggunakan SheetJS
    importFromExcel: (file, callback) => {
        if(!window.XLSX) return callback({ success: false, msg: "Pustaka SheetJS belum dimuatkan." });
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheet = workbook.SheetNames[0];
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
                
                let imported = 0;
                rows.forEach(row => {
                    // Cari column yang menyerupai Nama dan Nombor Telefon (Sangat fleksibel)
                    let name = row['Nama'] || row['Name'] || row['nama'] || Object.values(row)[0];
                    let phone = row['Phone'] || row['No Tel'] || row['Telefon'] || row['tel'] || Object.values(row)[1];
                    
                    if(name && phone) {
                        let res = CRMModule.saveCustomer(String(name), String(phone));
                        if(res.success) imported++;
                    }
                });
                callback({ success: true, count: imported });
            } catch(err) {
                callback({ success: false, msg: "Fail tidak sah atau rosak." });
            }
        };
        reader.readAsArrayBuffer(file);
    }
};
