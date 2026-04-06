export const LHDNModule = {
    getConfig: () => JSON.parse(localStorage.getItem('ketick_lhdn')) || { tin: "", msic: "", isReady: false },
    // Modul ini akan dikembangkan bila API LHDN sebenar disambungkan
    validateTIN: (tin) => {
        if(tin.length < 10) return false;
        return true;
    }
};
