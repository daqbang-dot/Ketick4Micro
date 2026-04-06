export const CRMModule = {
    getCustomers: () => JSON.parse(localStorage.getItem('ketick_crm')) || [],
    saveCustomers: (data) => localStorage.setItem('ketick_crm', JSON.stringify(data)),
    
    saveCustomer: (name, phone) => {
        let customers = CRMModule.getCustomers();
        let existing = customers.find(c => c.phone === phone);
        if (existing) {
            existing.name = name; 
            CRMModule.saveCustomers(customers);
            return { success: true, customer: existing, msg: "Data dikemaskini." };
        }
        const newCust = { id: Date.now(), name, phone, points: 0 };
        customers.push(newCust);
        CRMModule.saveCustomers(customers);
        return { success: true, customer: newCust, msg: "Berjaya daftar." };
    },

    updateCustomerDetails: (id, newName, newPhone) => {
        let c = CRMModule.getCustomers();
        let idx = c.findIndex(x => x.id === id);
        if(idx > -1) {
            c[idx].name = newName;
            c[idx].phone = newPhone;
            CRMModule.saveCustomers(c);
            return true;
        }
        return false;
    },

    deleteCustomer: (id) => {
        let c = CRMModule.getCustomers();
        CRMModule.saveCustomers(c.filter(x => x.id !== id));
    },

    // Kita buang Google Import yang rosak tu, ganti dengan import fail sahaja.
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
    }
};
