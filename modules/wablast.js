export const WABlastModule = {
    // Fungsi ini akan generate link WA berurutan
    generateBlastLinks: (message) => {
        const customers = JSON.parse(localStorage.getItem('ketick_crm')) || [];
        if(customers.length === 0) return alert("Tiada pelanggan dalam CRM.");
        
        // Dalam dunia sebenar, kita buka tab WA satu persatu menggunakan loop manual
        let links = customers.map(c => {
            let personalizedMsg = message.replace('[NAMA]', c.name);
            return `https://wa.me/${c.phone}?text=${encodeURIComponent(personalizedMsg)}`;
        });
        return links;
    }
};
