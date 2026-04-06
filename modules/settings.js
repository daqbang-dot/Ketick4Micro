export const SettingsModule = {
    // Ambil maklumat bisnes (Guna fallback data jika kosong)
    getBizInfo: () => {
        return JSON.parse(localStorage.getItem('ketick_biz_info')) || {
            name: "KETICK BUSINESS",
            address: "Alamat Kedai Anda",
            phone: "012-3456789",
            bank: "MAYBANK",
            accNo: "1234567890",
            accName: "NAMA PEMILIK",
            logo: "https://via.placeholder.com/100" 
        };
    },

    // Simpan maklumat bisnes
    saveBizInfo: (data) => {
        localStorage.setItem('ketick_biz_info', JSON.stringify(data));
        // Kita buang alert() kat sini sedia ada, sebab kita dah panggil alert di app.js
    },

    // Paparkan data ke dalam borang (Safe Mode)
    loadToForm: () => {
        const info = SettingsModule.getBizInfo();
        
        // Senarai ID yang perlu ada dalam index.html
        const fields = {
            'biz-name': info.name,
            'biz-address': info.address,
            'biz-phone': info.phone,
            'biz-bank': info.bank,
            'biz-acc-no': info.accNo,
            'biz-acc-name': info.accName
        };

        // Loop dan masukkan data hanya jika ID itu wujud (Ini insurans kita!)
        for (const [id, value] of Object.entries(fields)) {
            const el = document.getElementById(id);
            if (el) {
                el.value = value || '';
            } else {
                console.warn(`[KETICK Warning] ID ${id} tidak dijumpai dalam HTML.`);
            }
        }

        // Khas untuk preview logo
        const logoPreview = document.getElementById('logo-preview');
        if (logoPreview && info.logo) {
            logoPreview.src = info.logo;
        }
    }
};
