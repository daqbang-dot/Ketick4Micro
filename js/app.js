import { BasicPlan } from '../plans/basic.js';
import { ProPlan } from '../plans/pro.js';
import { Premium } from '../plans/premium.js';
import { LegendPlan } from '../plans/legend.js';
import { initDevTools } from './dev-tools.js';

import { InventoryModule } from '../modules/inventory.js';
import { POSModule } from '../modules/pos.js';
import { BillingModule } from '../modules/billing.js';
import { SettingsModule } from '../modules/settings.js';
import { DashboardModule } from '../modules/dashboard.js'; 
import { SyncModule } from '../modules/sync.js'; 
import { HistoryModule } from '../modules/history.js';
import { CRMModule } from '../modules/crm.js';
import { KuponModule } from '../modules/kupon.js';
import { Buku555Module } from '../modules/buku555.js';
import { WABlastModule } from '../modules/wablast.js';
import { PrinterModule } from '../modules/printer.js';
import { LHDNModule } from '../modules/lhdn.js';
import { LicenseModule } from '../modules/license.js';

let currentPlanConfig = BasicPlan; 
let isDevMode = false; 

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setPlan(currentPlanConfig.planName); 
});

window.installApp = async function() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            KetickModal.toast("Terima kasih memasang KETICK!");
        }
        deferredPrompt = null;
        document.getElementById('pwa-install-btn')?.classList.add('hidden');
    } else {
        KetickModal.alert("Untuk install di iOS/iPhone: Tekan butang 'Share' (petak ada anak panah atas) di browser anda, kemudian pilih 'Add to Home Screen'.");
    }
};

const AudioEngine = {
    ctx: null,
    init: function() {
        if(!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if(AudioContext) this.ctx = new AudioContext();
        }
    },
    playBeep: function() {
        try {
            this.init();
            if(!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime); 
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        } catch(e){}
    },
    playSuccess: function() {
        try {
            this.init();
            if(!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.setValueAtTime(900, this.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
        } catch(e){}
    }
};

window.KetickModal = {
    show: function(type, message, defaultValue = '') {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-modal');
            const titleEl = document.getElementById('custom-modal-title');
            const msgEl = document.getElementById('custom-modal-msg');
            const inputEl = document.getElementById('custom-modal-input');
            const btnCancel = document.getElementById('custom-modal-cancel');
            const btnOk = document.getElementById('custom-modal-ok');

            msgEl.innerText = message;
            inputEl.value = '';
            modal.classList.remove('hidden');

            if (type === 'prompt') {
                inputEl.classList.remove('hidden');
                inputEl.value = defaultValue || '';
                setTimeout(() => inputEl.focus(), 100);
                titleEl.innerText = "Sila Isi";
            } else {
                inputEl.classList.add('hidden');
            }

            if (type === 'alert') {
                btnCancel.classList.add('hidden');
                titleEl.innerText = "System Alert";
            } else if (type === 'confirm') {
                btnCancel.classList.remove('hidden');
                titleEl.innerText = "Pengesahan";
            }

            btnOk.onclick = () => {
                modal.classList.add('hidden');
                if (type === 'prompt') resolve(inputEl.value);
                else resolve(true);
            };

            btnCancel.onclick = () => {
                modal.classList.add('hidden');
                if (type === 'prompt') resolve(null);
                else resolve(false);
            };
        });
    },
    alert: (msg) => window.KetickModal.show('alert', msg),
    confirm: (msg) => window.KetickModal.show('confirm', msg),
    prompt: (msg, def) => window.KetickModal.show('prompt', msg, def),
    
    toast: function(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if(!container) return;
        
        const el = document.createElement('div');
        const bgClass = type === 'success' ? 'bg-lime text-black border-lime' : 'bg-orange text-white border-orange';
        
        el.className = `${bgClass} border border-opacity-50 px-4 py-3 rounded-xl text-[10px] font-bold font-mono shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 flex items-center justify-center text-center uppercase tracking-widest`;
        el.innerText = msg;
        
        container.appendChild(el);
        
        setTimeout(() => { el.classList.remove('translate-y-10', 'opacity-0'); }, 10);
        setTimeout(() => {
            el.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => el.remove(), 300);
        }, 2000);
    }
};

window.alert = function(message) {
    KetickModal.alert(message);
};

function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400; 
            const scaleSize = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scaleSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            callback(canvas.toDataURL('image/jpeg', 0.5)); 
        }
    };
}

function initApp() {
    console.log(`[KETICK4MICRO] Sistem bermula.`);
    
    checkLicenseSystem();
    
    document.getElementById('next-bill-no-display').innerText = `#${POSModule.nextBillNo}`;
    refreshAllUI();
    setupEventListeners();
    setupDevTrigger();
    
    document.body.addEventListener('click', (e) => {
        if(e.target.closest('button') || e.target.closest('.pos-item-btn') || e.target.closest('.tab-btn')) {
            if(navigator.vibrate) navigator.vibrate(15);
            AudioEngine.playBeep();
        }
    });
}

function checkLicenseSystem() {
    const lic = LicenseModule.checkStatus();
    if (lic.status === 'LOCKED') {
        document.getElementById('paywall-overlay').classList.remove('hidden');
        document.getElementById('paywall-msg').innerText = lic.msg;
        setPlan('BASIC'); 
    } else {
        document.getElementById('paywall-overlay').classList.add('hidden');
        setPlan(lic.status);
        
        const infoDisplay = document.getElementById('license-info-display');
        if (infoDisplay) {
            if (lic.status === 'BASIC') {
                infoDisplay.innerText = "Pakej Semasa: BASIC (Percuma / Tiada Lesen)";
            } else {
                const dateExp = new Date(lic.expiryDate).toLocaleDateString();
                infoDisplay.innerText = `Pakej: ${lic.status} | Sah Sehingga: ${dateExp}`;
            }
        }
    }
}

window.applyNewLicense = async function() {
    const key = document.getElementById('settings-license-key').value;
    if(!key) return await KetickModal.alert("Sila masukkan kunci lesen.");
    
    const result = LicenseModule.verifyKey(key);
    if (result.valid) {
        LicenseModule.saveLicense(key);
        await KetickModal.alert(`Berjaya! Sistem dinaik taraf ke pelan ${result.plan}.`);
        document.getElementById('settings-license-key').value = '';
        checkLicenseSystem(); 
        refreshAllUI();
    } else {
        await KetickModal.alert(result.msg);
    }
};

window.unlockPaywall = async function() {
    const key = document.getElementById('paywall-key-input').value;
    if(!key) return alert("Sila masukkan kunci lesen."); 
    
    const result = LicenseModule.verifyKey(key);
    if (result.valid) {
        LicenseModule.saveLicense(key);
        alert(`Sistem dibuka! Selamat kembali ke pelan ${result.plan}.`);
        document.getElementById('paywall-key-input').value = '';
        checkLicenseSystem(); 
        refreshAllUI();
    } else {
        alert(result.msg);
    }
};

function setPlan(planName) {
    if (planName === 'LEGEND') currentPlanConfig = LegendPlan;
    else if (planName === 'PREMIUM') currentPlanConfig = Premium;
    else if (planName === 'PRO') currentPlanConfig = ProPlan;
    else currentPlanConfig = BasicPlan;
    document.getElementById('auth-status').innerText = `${currentPlanConfig.planName} MODE`;
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        if (currentPlanConfig.planName === 'BASIC' && !isStandalone) {
            installBtn.classList.remove('hidden');
        } else {
            installBtn.classList.add('hidden');
        }
    }
}

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('fade-in-up'); 
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active-tab', 'text-white', 'text-slate-800');
        btn.classList.add('opacity-50', 'text-gray-300');
    });
    
    const activeContent = document.getElementById(tabId);
    activeContent.classList.remove('hidden');
    
    void activeContent.offsetWidth; 
    activeContent.classList.add('fade-in-up');
    
    const btnId = tabId.replace('tab-', 'btn-');
    if(document.getElementById(btnId)) {
        document.getElementById(btnId).classList.add('active-tab', 'text-white');
        document.getElementById(btnId).classList.remove('opacity-50', 'text-gray-300');
    }
    refreshAllUI();
};

window.openPricingPage = function() {
    document.getElementById('pricing-page').classList.remove('hidden');
};

window.closePricingPage = function() {
    document.getElementById('pricing-page').classList.add('hidden');
};

window.buyPlan = function(planName) {
    let paymentLink = "";
    if (planName === "PRO") {
        paymentLink = "https://toyyibpay.com/Ketick4MicroPRO";
    } else if (planName === "PREMIUM") {
        paymentLink = "https://toyyibpay.com/Ketick4MicroPREMIUM";
    } else if (planName === "LEGEND") {
        paymentLink = "https://toyyibpay.com/Ketick4MicroLEGEND";
    }
    
    if(paymentLink) {
        window.open(paymentLink, '_blank');
    } else {
        KetickModal.alert("Ralat sistem: Pautan bayaran tidak dijumpai.");
    }
};

window.openSettings = function() {
    document.getElementById('settings-page').classList.remove('hidden');
    SettingsModule.loadToForm();
};
window.closeSettings = function() { document.getElementById('settings-page').classList.add('hidden'); };

window.saveSettings = async function() {
    SettingsModule.saveBizInfo({
        name: document.getElementById('biz-name').value,
        address: document.getElementById('biz-address').value,
        phone: document.getElementById('biz-phone').value,
        bank: document.getElementById('biz-bank').value,
        accNo: document.getElementById('biz-acc-no').value,
        accName: document.getElementById('biz-acc-name').value,
        logo: document.getElementById('logo-preview').src 
    });
    KetickModal.toast("Tetapan berjaya disimpan!");
    window.closeSettings();
    SyncModule.uploadData(); 
};

window.previewLogo = async function(input) {
    if (!currentPlanConfig.canUploadLogo) return await KetickModal.alert("Pakej tak sokong muat naik logo.");
    if (input.files && input.files[0]) {
        compressImage(input.files[0], (compressedData) => {
            document.getElementById('logo-preview').src = compressedData;
        });
    }
};

// --- FUNGSI PORTAL PENGGUNA (AKAUN & SUPPORT) ---
window.openAccountPage = function() {
    const lic = LicenseModule.checkStatus();
    document.getElementById('account-page').classList.remove('hidden');

    const planNameEl = document.getElementById('acc-plan-name');
    const daysLeftEl = document.getElementById('acc-days-left');

    if(lic.status === 'BASIC' || lic.status === 'LOCKED') {
        planNameEl.innerText = "BASIC MODE";
        daysLeftEl.innerText = "Tiada Lesen Aktif";
        daysLeftEl.className = "text-lg font-bold text-gray-500 font-mono";
    } else {
        planNameEl.innerText = `PAKEJ ${lic.status}`;
        // Kira baki hari
        const expDate = new Date(lic.expiryDate);
        const today = new Date();
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        daysLeftEl.innerText = `${diffDays > 0 ? diffDays : 0} Hari Lagi`;
        
        // Tukar warna ikut baki hari
        if(diffDays > 14) {
            daysLeftEl.className = "text-lg font-bold text-lime font-mono";
        } else if (diffDays > 3) {
            daysLeftEl.className = "text-lg font-bold text-orange font-mono";
        } else {
            daysLeftEl.className = "text-lg font-bold text-red-500 font-mono animate-pulse";
        }
    }
};

window.closeAccountPage = function() {
    document.getElementById('account-page').classList.add('hidden');
};

window.contactSupport = function() {
    const phoneNo = "601123266755"; 
    const msg = encodeURIComponent("Salam Admin Ketick. Saya pengguna Ketick4Micro dan saya perlukan sedikit bantuan teknikal berkenaan sistem.");
    window.open(`https://api.whatsapp.com/send?phone=${phoneNo}&text=${msg}`, '_blank');
};

function refreshAllUI() {
    InventoryModule.renderList('inventory-list');
    POSModule.renderPOSSelect('pos-select-list');
    POSModule.renderCart('cart-items', 'total-price');
    DashboardModule.render('dashboard-container', currentPlanConfig); 
    HistoryModule.render('history-list', currentPlanConfig, document.getElementById('history-search')?.value); 
    renderCRM();
    renderBuku555();
    renderKuponManager();
    renderLHDNExpenses();
}

const lockMsg = (modul) => `<div class="opacity-50 text-xs text-center py-10 text-gray-400">🔒 Pakej ${currentPlanConfig.planName} tidak menyokong ${modul}.<br><br>Sila hubungi pembekal untuk naik taraf.</div>`;

const emptyStateSVG = (text) => `
    <div class="flex flex-col items-center justify-center py-10 opacity-30">
        <svg class="w-14 h-14 text-indigo mb-3 drop-shadow-[0_0_10px_rgba(79,70,229,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <p class="text-[10px] font-mono text-gray-400 uppercase tracking-widest">${text}</p>
    </div>
`;

function renderLHDNExpenses() {
    const container = document.getElementById('lhdn-expenses-list');
    if(!container) return;
    if(!currentPlanConfig.enableLHDN) return container.innerHTML = lockMsg("Modul LHDN / Cukai");
    
    const expenses = LHDNModule.getExpenses();
    if(expenses.length === 0) return container.innerHTML = emptyStateSVG("Tiada Rekod Perbelanjaan");
    
    container.innerHTML = expenses.map(e => `
        <div class="bg-darkCard p-3 rounded-xl border border-darkBorder mb-2 shadow-sm flex justify-between items-center">
            <div class="flex gap-3 items-center">
                ${e.img ? `<img src="${e.img}" class="w-10 h-10 rounded-lg object-cover border border-darkBorder">` : `<div class="w-10 h-10 bg-[#2A2A2A] flex items-center justify-center text-[8px] opacity-50 rounded-lg">Tiada</div>`}
                <div><div class="font-bold text-xs text-white">${e.desc}</div><div class="text-[9px] opacity-60 text-gray-400 font-mono">${e.category}</div></div>
            </div>
            <div class="text-right">
                <div class="font-bold text-sm text-orange font-mono">-RM${e.amount.toFixed(2)}</div>
                <button onclick="deleteExpense(${e.id})" class="text-[8px] text-gray-500 hover:text-orange uppercase tracking-widest">Padam</button>
            </div>
        </div>
    `).join('');
}

function renderCRM() {
    const container = document.getElementById('crm-list');
    if(!container) return;
    if(!currentPlanConfig.enableCRM) return container.innerHTML = lockMsg("Modul CRM");

    const customers = CRMModule.getCustomers();
    if(customers.length === 0) return container.innerHTML = emptyStateSVG("Tiada Rekod Pelanggan");

    container.innerHTML = customers.map(c => `
        <div class="bg-darkCard border border-darkBorder p-3 rounded-xl flex justify-between items-center mb-2">
            <div><div class="font-bold text-xs text-white">${c.name}</div><div class="text-[10px] text-primary font-mono">${c.phone}</div></div>
            <div class="text-right flex items-center gap-2">
                <button onclick="editCustomer(${c.id}, '${c.name}', '${c.phone}')" class="text-[10px] bg-[#2A2A2A] text-white px-2 py-1 rounded">Edit</button>
                <button onclick="toggleJail('${c.phone}')" class="text-[8px] text-orange uppercase tracking-widest font-bold">Stop</button>
            </div>
        </div>
    `).join('');
}

function renderBuku555() {
    const container = document.getElementById('buku555-list');
    if(!container) return;
    if(!currentPlanConfig.enableBuku555) return container.innerHTML = lockMsg("Buku 555 (Hutang)");

    const debts = Buku555Module.getDebts();
    if(debts.length === 0) return container.innerHTML = emptyStateSVG("Tiada Rekod Pemiutang");

    container.innerHTML = debts.map(d => `
        <div class="bg-orange/5 p-3 rounded-xl border border-orange/20 flex justify-between items-center mb-2">
            <div><div class="font-bold text-xs text-orange">${d.name}</div><div class="text-[9px] opacity-70 text-gray-300 font-mono">Bil #${d.billNo} | ${d.date}</div></div>
            <div class="text-right">
                <div class="font-bold text-sm text-white mb-1 font-mono">RM ${d.amount.toFixed(2)}</div>
                <button onclick="payBuku555(${d.id}, ${d.amount})" class="text-[8px] bg-orange text-white px-2 py-1 rounded font-bold uppercase tracking-widest">Bayar</button>
            </div>
        </div>
    `).join('');
}

function renderKuponManager() {
    const container = document.getElementById('kupon-manager-list');
    if(!container) return;
    if(!currentPlanConfig.enableKupon) return container.innerHTML = lockMsg("Pengurusan Kupon");

    const kupons = KuponModule.getKupons();
    if(kupons.length === 0) return container.innerHTML = emptyStateSVG("Tiada Kupon Aktif");

    container.innerHTML = kupons.map(k => `
        <div class="bg-darkCard p-3 rounded-xl border border-darkBorder flex justify-between items-center mb-2 shadow-sm">
            <div><div class="font-bold text-xs text-lime uppercase">${k.code}</div><div class="text-[9px] opacity-60 text-white font-mono">RM/Pct: ${k.value} | Min: RM${k.minSpend}</div></div>
            <div class="text-right flex flex-col items-end gap-1">
                <div class="text-[10px] font-bold text-gray-400 font-mono">${k.qty} baki</div>
                <div class="flex gap-2">
                    <button onclick="editKupon(${k.id})" class="text-[8px] bg-[#2A2A2A] text-white px-2 rounded">Edit</button>
                    <button onclick="KuponModule.deleteKupon(${k.id}); refreshAllUI(); KetickModal.toast('Kupon Dibuang', 'error');" class="text-[8px] text-orange uppercase tracking-widest">Padam</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.editingProductId = null;
window.editInventory = function(id) {
    const p = InventoryModule.getProducts().find(x => x.id === id);
    if(p) {
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-desc').value = p.desc || '';
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-qty').value = p.qty;
        window.editingProductId = p.id;
        document.getElementById('btn-save-inv').innerText = "KEMASKINI DATA";
        window.scrollTo(0,0);
    }
};

window.deleteInventoryProduct = async function(id) {
    if(await KetickModal.confirm("Padam produk ini dari pangkalan data secara kekal?")) {
        let prods = InventoryModule.getProducts();
        prods = prods.filter(x => x.id !== id);
        InventoryModule.saveProducts(prods);
        
        KetickModal.toast("Stok produk dipadam!", "error");
        refreshAllUI(); 
    }
};

window.editingKuponId = null;
window.editKupon = async function(id) {
    if(!currentPlanConfig.enableKupon) return await KetickModal.alert("Pakej anda tidak menyokong Kupon.");
    const k = KuponModule.getKupons().find(x => x.id === id);
    if(k) {
        document.getElementById('kp-code').value = k.code;
        document.getElementById('kp-type').value = k.type;
        document.getElementById('kp-value').value = k.value;
        document.getElementById('kp-min').value = k.minSpend;
        document.getElementById('kp-qty').value = k.qty;
        window.editingKuponId = k.id;
        document.getElementById('btn-save-kupon').innerText = "KEMASKINI KUPON";
    }
};

window.editCustomer = async function(id, oldName, oldPhone) {
    if(!currentPlanConfig.enableCRM) return await KetickModal.alert("Pakej anda tidak menyokong CRM.");
    const newName = await KetickModal.prompt("Kemaskini Nama:", oldName);
    if(newName === null) return;
    const newPhone = await KetickModal.prompt("Kemaskini No Telefon (Sistem auto-format):", oldPhone);
    if(newPhone === null) return;
    
    if(newName && newPhone) { 
        CRMModule.updateCustomerDetails(id, newName, newPhone); 
        KetickModal.toast("Data pelanggan dikemaskini.");
        refreshAllUI(); 
    }
};

window.payBuku555 = async function(id, currentAmount) {
    if(!currentPlanConfig.enableBuku555) return await KetickModal.alert("Pakej tidak menyokong Buku 555.");
    const amt = await KetickModal.prompt(`Baki hutang: RM${currentAmount.toFixed(2)}\nMasukkan jumlah bayaran:`, "");
    if(amt !== null && amt !== "" && !isNaN(amt)) {
        Buku555Module.payDebt(id, amt);
        AudioEngine.playSuccess();
        KetickModal.toast("Bayaran hutang direkodkan!");
        refreshAllUI();
    }
};

window.applyKupon = async () => {
    if(!currentPlanConfig.enableKupon) return await KetickModal.alert("Fungsi Kupon dikunci untuk pakej anda.");
    
    const code = document.getElementById('pos-kupon').value.trim();
    if(!code) return await KetickModal.alert("Sila taip kod kupon.");
    
    let subtotal = POSModule.cart.reduce((sum, item) => sum + item.price, 0);
    const check = KuponModule.verifyKupon(code, subtotal);
    
    if(!check.valid) {
        POSModule.appliedKupon = null; 
        POSModule.currentDiscount = 0; 
        refreshAllUI();
        return KetickModal.toast(`Gagal: ${check.msg}`, 'error'); 
    }
    
    POSModule.appliedKupon = code;
    POSModule.currentDiscount = check.discount;
    refreshAllUI();
    AudioEngine.playSuccess();
    KetickModal.toast(`Kupon Sah! Diskaun RM${check.discount.toFixed(2)} ditolak.`);
};

window.searchCustomer = async function() {
    const phone = document.getElementById('pos-phone').value.trim(); 
    if(!phone) return await KetickModal.alert("Sila masukkan no telefon.");
    
    const customers = CRMModule.getCustomers();
    const found = customers.find(c => String(c.phone).trim() === String(phone));
    
    if(found) {
        document.getElementById('pos-name').value = found.name;
        KetickModal.toast(`Pelanggan Ditemui: ${found.name}`);
    } else {
        document.getElementById('pos-name').value = '';
        KetickModal.toast("Pelanggan baru. Sila taip nama.", "error");
    }
};

window.processTransaction = async function(type, printMethod = 'PDF') {
    if (POSModule.cart.length === 0) return await KetickModal.alert("Troli kosong!");
    const phone = document.getElementById('pos-phone').value;
    const name = document.getElementById('pos-name').value;
    const payMethod = document.getElementById('pos-payment-method').value;

    if (!phone || !name) return await KetickModal.alert("Sila isi Nama & No Telefon.");
    
    if (payMethod === 'HUTANG' && !currentPlanConfig.enableBuku555) {
        return await KetickModal.alert("Pakej anda tidak menyokong transaksi HUTANG (Buku 555). Sila guna kaedah Tunai/Transfer.");
    }

    const crmResult = CRMModule.saveCustomer(name, phone);
    if (!crmResult.success) return await KetickModal.alert(crmResult.msg);

    let subtotal = POSModule.cart.reduce((sum, item) => sum + item.price, 0);

    if (POSModule.appliedKupon) {
        const check = KuponModule.verifyKupon(POSModule.appliedKupon, subtotal);
        if(!check.valid) {
            POSModule.appliedKupon = null; POSModule.currentDiscount = 0; refreshAllUI();
            return await KetickModal.alert(`Kupon Batal: ${check.msg}`);
        }
        POSModule.currentDiscount = check.discount;
    }

    let total = subtotal - (POSModule.currentDiscount || 0);
    if(total < 0) total = 0;

    const trx = {
        billNo: POSModule.nextBillNo,
        date: new Date().toLocaleString(),
        items: [...POSModule.cart],
        total: total,
        customer: crmResult.customer,
        paymentMethod: payMethod,
        type: type
    };

    if (payMethod === 'HUTANG' && type === 'RECEIPT') Buku555Module.addDebt(crmResult.customer, total, trx.billNo);
    HistoryModule.saveTransaction(trx);

    if (type === 'RECEIPT') {
        let prods = InventoryModule.getProducts();
        POSModule.cart.forEach(item => { let p = prods.find(x => x.id === item.id); if(p && p.qty > 0) p.qty--; });
        InventoryModule.saveProducts(prods);
        if(POSModule.appliedKupon) KuponModule.decrementKupon(POSModule.appliedKupon);
    }

    if (printMethod === 'BT') PrinterModule.printReceipt(trx, SettingsModule.getBizInfo());
    else BillingModule.generatePDF(type, trx.billNo, trx.items, total, POSModule.currentDiscount, crmResult.customer, payMethod, currentPlanConfig);

    POSModule.incrementBillNo();
    POSModule.clearCart();
    document.getElementById('pos-phone').value = '';
    document.getElementById('pos-name').value = '';
    document.getElementById('pos-kupon').value = '';
    POSModule.appliedKupon = null;
    POSModule.currentDiscount = 0;
    refreshAllUI();
    SyncModule.uploadData();
    
    AudioEngine.playSuccess();
    KetickModal.toast("Transaksi Berjaya & Direkodkan!");
};

window.cancelBill = async () => { 
    if(await KetickModal.confirm("Batalkan transaksi ini?")) { 
        POSModule.clearCart(); 
        refreshAllUI(); 
        KetickModal.toast("Troli dibersihkan.", "error");
    } 
};

window.filterHistory = () => HistoryModule.render('history-list', currentPlanConfig, document.getElementById('history-search')?.value);
window.toggleJail = async (p) => { 
    if(!currentPlanConfig.enableWABlast) return await KetickModal.alert("Pakej tidak menyokong fungsi Jail.");
    WABlastModule.addToJail(p); 
    KetickModal.toast("Status pelanggan dikemaskini.");
    refreshAllUI(); 
};

window.addManualCustomer = async () => { 
    if(!currentPlanConfig.enableCRM) return await KetickModal.alert("Modul CRM dikunci.");
    const n = document.getElementById('crm-manual-name').value;
    const p = document.getElementById('crm-manual-phone').value;
    if(!n || !p) return await KetickModal.alert("Sila isi Nama & No Telefon.");
    CRMModule.saveCustomer(n, p); 
    KetickModal.toast("Pelanggan ditambah ke sistem.");
    refreshAllUI(); 
};

window.importPhoneContacts = async () => {
    if(!currentPlanConfig.enableCRM) return await KetickModal.alert("Fungsi Import dikunci.");
    await KetickModal.alert("Menyemak buku telefon... Sila benarkan akses jika diminta.");
    const result = await CRMModule.importFromContacts();
    if(result.success) {
        AudioEngine.playSuccess();
        KetickModal.toast(`Berjaya import ${result.count} pelanggan!`);
        refreshAllUI();
    } else {
        await KetickModal.alert(result.msg);
    }
};

window.createNewKupon = async () => {
    if(!currentPlanConfig.enableKupon) return await KetickModal.alert("Pakej anda tidak menyokong Kupon.");
    const data = { code: document.getElementById('kp-code').value, type: document.getElementById('kp-type').value, value: document.getElementById('kp-value').value, minSpend: document.getElementById('kp-min').value, qty: document.getElementById('kp-qty').value };
    if(window.editingKuponId) {
        KuponModule.updateKupon(window.editingKuponId, data);
        window.editingKuponId = null;
        document.getElementById('btn-save-kupon').innerText = "EXECUTE PROCESS";
        KetickModal.toast("Kupon Dikemaskini");
    } else {
        KuponModule.addKupon(data);
        KetickModal.toast("Kupon Baru Dicipta");
    }
    document.getElementById('kupon-form').reset();
    refreshAllUI();
};

window.deleteExpense = async (id) => { 
    if(await KetickModal.confirm("Padam perbelanjaan ini?")) { 
        LHDNModule.deleteExpense(id); 
        KetickModal.toast("Rekod dipadam", "error");
        refreshAllUI(); 
    } 
};

window.saveNewExpense = async function() {
    if(!currentPlanConfig.enableLHDN) return await KetickModal.alert("Modul LHDN dikunci.");
    const desc = document.getElementById('exp-desc').value;
    const amount = document.getElementById('exp-amount').value;
    const cat = document.getElementById('exp-cat').value;
    const imgInput = document.getElementById('exp-img');
    if(!desc || !amount) return await KetickModal.alert("Sila isi butiran.");

    const processSave = async (imgData = null) => {
        LHDNModule.saveExpense(desc, amount, cat, imgData);
        AudioEngine.playSuccess();
        KetickModal.toast("Perbelanjaan direkodkan!");
        document.getElementById('lhdn-expense-form').reset();
        refreshAllUI();
    };
    if (imgInput.files && imgInput.files[0]) {
        compressImage(imgInput.files[0], processSave);
    } else { processSave(); }
};

window.generateTaxReport = async (type) => {
    if(!currentPlanConfig.enableLHDN) return await KetickModal.alert("Fungsi Export LHDN dikunci.");
    const val = (type === 'MONTH') ? await KetickModal.prompt("Bulan (MM-YYYY):", "04-2026") : await KetickModal.prompt("Tahun (YYYY):", "2026");
    if(val !== null && val !== "") {
        LHDNModule.downloadTaxReport(type, val);
        KetickModal.toast("Laporan Excel sedang dimuat turun.");
    }
};
window.generateEInvoiceJSON = async (billNo) => {
    if(!currentPlanConfig.enableLHDN) return await KetickModal.alert("E-Invoice dikunci.");
    LHDNModule.generateEInvoiceJSON(billNo);
}

window.startWABlast = async function() {
    if(!currentPlanConfig.enableWABlast) return await KetickModal.alert("WA Blast dikunci.");
    const msg = document.getElementById('blast-msg').value;
    if(!msg) return await KetickModal.alert("Isi mesej terlebih dahulu.");
    const queue = WABlastModule.generateBlastLinks(msg);
    document.getElementById('blast-status-display').innerHTML = queue.map((q, i) => `<a href="${q.link}" target="_blank" class="block bg-indigo p-2 rounded-lg text-[10px] mt-1 text-white text-center shadow-md">HANTAR ${i+1}: ${q.name}</a>`).join('');
    KetickModal.toast("Senarai Blast Dijana!");
};

window.startTurboBlast = async function() {
    if(!currentPlanConfig.enableWABlast) return await KetickModal.alert("WA Turbo dikunci.");
    const msg = document.getElementById('blast-msg').value;
    const delay = parseInt(document.getElementById('blast-delay').value);
    const queue = WABlastModule.generateTurboLinks(msg);
    if(await KetickModal.confirm(`Mula Turbo Blast untuk ${queue.length} orang? Pastikan extension aktif.`)) {
        for (let i = 0; i < queue.length; i++) { 
            window.open(queue[i].link, '_blank'); 
            await new Promise(r => setTimeout(r, delay * 1000)); 
        }
        KetickModal.toast("Semua mesej dihantar!");
    }
};

// --- FUNGSI TAMBAH / BUANG TROLI JUALAN ---
window.addToCart = function(productId) {
    const products = InventoryModule.getProducts();
    const p = products.find(x => x.id === productId);
    
    if(!p) return;
    if(p.qty <= 0) {
        AudioEngine.playBeep(); // Bunyi error
        return KetickModal.toast("Stok Habis!", "error");
    }
    
    // Masukkan ke dalam troli
    POSModule.cart.push({...p}); 
    
    // Mainkan efek bunyi
    AudioEngine.playBeep();
    KetickModal.toast(`${p.name} masuk troli`);
    refreshAllUI();
};

window.removeFromCart = function(index) {
    POSModule.cart.splice(index, 1);
    
    // Kalau troli dah dikosongkan, batalkan kupon diskaun
    if (POSModule.cart.length === 0) {
        POSModule.appliedKupon = null;
        POSModule.currentDiscount = 0;
        document.getElementById('pos-kupon').value = '';
    }
    
    KetickModal.toast("Item dikeluarkan", "error");
    refreshAllUI();
};

function setupEventListeners() {
    const form = document.getElementById('add-product-form');
    if(form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('p-name').value,
                desc: document.getElementById('p-desc').value,
                price: document.getElementById('p-price').value,
                qty: document.getElementById('p-qty').value,
                img: "https://via.placeholder.com/150" 
            };
            
            const fileInput = document.getElementById('p-img');
            const processAdd = async (imgData) => {
                formData.img = imgData;
                if(window.editingProductId) {
                    let prods = InventoryModule.getProducts();
                    let idx = prods.findIndex(x => x.id === window.editingProductId);
                    if(idx > -1) { prods[idx] = {...prods[idx], ...formData}; InventoryModule.saveProducts(prods); }
                    window.editingProductId = null;
                    document.getElementById('btn-save-inv').innerText = "EXECUTE PROCESS";
                    KetickModal.toast("Produk dikemaskini!");
                } else {
                    InventoryModule.addProduct(formData, currentPlanConfig, () => {});
                    KetickModal.toast("Stok baru ditambah!");
                }
                form.reset(); refreshAllUI();
            };

            if (fileInput.files && fileInput.files[0]) {
                compressImage(fileInput.files[0], processAdd);
            } else {
                if(window.editingProductId) {
                    const oldP = InventoryModule.getProducts().find(x => x.id === window.editingProductId);
                    processAdd(oldP ? oldP.img : formData.img);
                } else {
                    processAdd(formData.img);
                }
            }
        };
    }
}

function setupDevTrigger() {} 

window.onload = initApp;
