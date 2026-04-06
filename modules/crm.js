// Fungsi Helper: Format Nombor Telefon Malaysia
function formatMyPhone(phone) {
    if (!phone) return "";
    let p = String(phone).replace(/\D/g, ''); // Buang semua simbol (-, +, spasi)
    if (p.startsWith('0')) {
        p = '60' + p.substring(1); // Tukar 012 ke 6012
    }
    return p;
}

export const CRMModule = {
    getCustomers: () => JSON.parse(localStorage.getItem('ketick_crm')) || [],
    saveCustomers: (data) => localStorage.setItem('ketick_crm', JSON.stringify(data)),
    
    saveCustomer: (name, phone) => {
        let customers = CRMModule.getCustomers();
        let formattedPhone = formatMyPhone(phone); // Apply format
        
        let existing = customers.find(c => c.phone === formattedPhone);
        if (existing) {
            existing.name = name; 
            CRMModule.saveCustomers(customers);
            return { success: true, customer: existing, msg: "Data pelanggan dikemaskini." };
        }
        
        const newCust = { id: Date.now(), name, phone: formattedPhone, points: 0 };
        customers.push(newCust);
        CRMModule.saveCustomers(customers);
        return { success: true, customer: newCust, msg: "Berjaya daftar." };
    },

    updateCustomerDetails: (id, newName, newPhone) => {
        let c = CRMModule.getCustomers();
        let idx = c.findIndex(x => x.id === id);
        if(idx > -1) {
            c[idx].name = newName;
            c[idx].phone = formatMyPhone(newPhone); // Apply format semasa edit
            CRMModule.saveCustomers(c);
            return true;
        }
        return false;
    },

    deleteCustomer: (id) => {
        let c = CRMModule.getCustomers();
        CRMModule.saveCustomers(c.filter(x => x.id !== id));
    },

    importFromExcel: (file, callback) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet);
                let count = 0;
                json.forEach(row => {
                    const phone = row.Phone || row.Telefon || row.NoTel;
                    const name = row.Name || row.Nama;
                    if(phone && name) { CRMModule.saveCustomer(String(name), String(phone)); count++; }
                });
                callback({success: true, count});
            } catch(err) { callback({success: false, msg: "Format fail tidak sah."}); }
        };
        reader.readAsArrayBuffer(file);
    },

    importFromContacts: async () => {
        // Guna Web Contact Picker API (Berfungsi baik di Chrome Android)
        if (!('contacts' in navigator && 'ContactsManager' in window)) {
            return { success: false, msg: "Browser telefon anda tidak menyokong fungsi ini (Sila guna Google Chrome di Android)." };
        }
        try {
            const props = ['name', 'tel'];
            const opts = { multiple: true };
            const contacts = await navigator.contacts.select(props, opts);
            
            let count = 0;
            contacts.forEach(c => {
                if(c.tel && c.tel.length > 0 && c.name && c.name.length > 0) {
                    CRMModule.saveCustomer(c.name[0], c.tel[0]);
                    count++;
                }
            });
            return { success: true, count: count };
        } catch (ex) {
            return { success: false, msg: "Akses kenalan ditolak atau dibatalkan oleh pengguna." };
        }
    }
};
