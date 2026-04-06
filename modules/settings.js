export const SettingsModule = {
    // Ambil maklumat bisnes
    getBizInfo: () => {
        return JSON.parse(localStorage.getItem('ketick_biz')) || {
            name: "KETICK BUSINESS",
            address: "Alamat Kedai Anda",
            phone: "012-3456789",
            bank: "MAYBANK",
            accNo: "1234567890",
            accName: "NAMA PEMILIK",
            logo: "" 
        };
    },

    // Simpan maklumat bisnes
    saveBizInfo: (data) => {
        localStorage.setItem('ketick_biz', JSON.stringify(data));
        alert("Tetapan berjaya disimpan!");
    },

    // Paparkan data ke dalam borang (Form)
    loadToForm: () => {
        const info = SettingsModule.getBizInfo();
        document.getElementById('biz-name').value = info.name;
        document.getElementById('biz-address').value = info.address;
        document.getElementById('biz-phone').value = info.phone;
        document.getElementById('biz-bank').value = info.bank;
        document.getElementById('biz-acc-no').value = info.accNo;
        document.getElementById('biz-acc-name').value = info.accName;
        if(info.logo) document.getElementById('logo-preview').src = info.logo;
    }
};
