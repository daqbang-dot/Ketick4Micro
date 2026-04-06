// Modul Simulasi Pengesahan (Tanpa API Key - Berasaskan LocalStorage)
// Ini membolehkan anda test butang LOGIN dan LOGOUT tanpa sambungan server.

export const AuthModule = {
    // Simulasi Popup Login
    login: async () => {
        return new Promise((resolve) => {
            // Kita reka satu user dummy
            const mockUser = { 
                uid: "dev_user_001", 
                email: "admin@ketick.my",
                displayName: "Ketick Admin"
            };
            
            // Simpan sesi login di telefon
            localStorage.setItem('ketick_mock_user', JSON.stringify(mockUser));
            
            // Jika belum ada pelan, kita set BASIC sebagai default
            if(!localStorage.getItem('ketick_plan')) {
                localStorage.setItem('ketick_plan', 'BASIC');
            }
            
            alert("Simulasi Log Masuk Berjaya!");
            
            // Perlu reload page untuk trigger onStatusChange (sebab kita tak guna real Firebase observer)
            window.location.reload(); 
            resolve(mockUser);
        });
    },

    // Simulasi Logout
    logout: () => {
        localStorage.removeItem('ketick_mock_user');
        alert("Anda telah log keluar.");
        window.location.reload();
    },

    // Ambil pelan pengguna (Simulasi dari Cloud ke Local)
    getUserPlan: async (uid) => {
        return localStorage.getItem('ketick_plan') || 'BASIC';
    },

    // Pantau status login (Berlakon seperti Firebase onAuthStateChanged)
    onStatusChange: (callback) => {
        const userStr = localStorage.getItem('ketick_mock_user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        // Jalankan callback dengan data user (atau null jika belum login)
        callback(user);
    }
};
