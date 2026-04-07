export const LicenseModule = {
    // PENYAMARAN TAHAP TINGGI: Kunci dipecahkan dan diselit celah "CSS Classes"
    _manifest: ['K3T1CK', 'bg-white', 'text-sm', '_RAHSIA', 'flex', 'p-4', '_2026', 'items-center'],
    
    // Fungsi 'Boring' yang pasang balik kunci tu tanpa nampak mencurigakan
    _getEnv: function() {
        return this._manifest[0] + this._manifest[3] + this._manifest[6];
    },

    generateKey: function(p, d) {
        const x = new Date();
        x.setDate(x.getDate() + d);
        const t = x.getTime(); 
        const py = `${p}|${t}`;
        const sg = btoa(py + this._getEnv()).substring(0, 12); 
        return btoa(`${py}|${sg}`); 
    },

    verifyKey: function(b64) {
        try {
            const raw = atob(b64);
            const pt = raw.split('|');
            if(pt.length !== 3) return { valid: false, msg: "Konfigurasi tidak sah (ERR_01)." };

            const p = pt[0];
            const t = parseInt(pt[1]);
            const sg = pt[2];

            const xSg = btoa(`${p}|${t}` + this._getEnv()).substring(0, 12);
            if(sg !== xSg) return { valid: false, msg: "Integriti sistem terjejas (ERR_02)." };
            if(Date.now() > t) return { valid: false, msg: "Sesi telah tamat tempoh. Sila perbaharui langganan." };

            return { valid: true, plan: p, expiry: t };
        } catch(e) {
            return { valid: false, msg: "Ralat pemprosesan sistem (ERR_03)." };
        }
    },

    // Nama LocalStorage ditukar supaya tak nampak macam 'license'
    saveLicense: (k) => localStorage.setItem('ketick_sys_cfg', k),
    getLicense: () => localStorage.getItem('ketick_sys_cfg'),

    checkStatus: function() {
        const k = this.getLicense();
        if(!k) return { status: 'BASIC', expired: false }; 
        
        const res = this.verifyKey(k);
        if(!res.valid) {
            return { status: 'LOCKED', msg: res.msg }; 
        }
        return { status: res.plan, expired: false, expiryDate: res.expiry };
    }
};
