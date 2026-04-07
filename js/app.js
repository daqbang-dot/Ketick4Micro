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
let isDevMode = false; // Diubah kepada false supaya Dev Panel ghaib

// --- ENJIN CUSTOM MODAL (GLASSMORPHISM) ---
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
                titleEl.innerText = "Makluman";
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
    prompt: (msg, def) => window.KetickModal.show('prompt', msg, def)
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
    const savedTheme = localStorage.getItem('ketick_theme');
    if (savedTheme === 'light') { document.documentElement.classList.remove('dark'); } 
    else { document.documentElement.classList.add('dark'); }
    
    checkLicenseSystem();
    
    document.getElementById('next-bill-no-display').innerText = `#${POSModule.nextBillNo}`;
    refreshAllUI();
    setupEventListeners();
    
    // Tanam penderia ketukan Dev Panel di sini
    setupDevTrigger();
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

window.toggleTheme = function() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('ketick_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
};

function setPlan(planName) {
    if (planName === 'LEGEND') currentPlanConfig = LegendPlan;
    else if (planName === 'PREMIUM') currentPlanConfig = Premium;
    else if (planName === 'PRO') currentPlanConfig = ProPlan;
    else currentPlanConfig = BasicPlan;
    document.getElementById('auth-status').innerText = `${currentPlanConfig.planName} MODE`;
}

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active-tab', 'text-white', 'text-slate-800');
        btn.classList.add('opacity-50', 'text-slate-500');
    });
    document.getElementById(tabId).classList.remove('hidden');
    const btnId = tabId.replace('tab-', 'btn-');
    if(document.getElementById(btnId)) {
        document.getElementById(btnId).classList.add('active-tab', 'text-white');
        document.getElementById(btnId).classList.remove('opacity-50', 'text-slate-500');
    }
    refreshAllUI();
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
    await KetickModal.alert("Tetapan berjaya disimpan!");
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

// --- GATEKEEPER UI (PENGUNCI PAPARAN VISUAL) ---
const lockMsg = (modul) => `<div class="opacity-50 text-xs text-center py-10 text-slate-500 dark:text-white">🔒 Pakej ${currentPlanConfig.planName} tidak menyokong ${modul}.<br><br>Sila hubungi pembekal untuk naik taraf.</div>`;

function renderLHDNExpenses() {
    const container = document.getElementById('lhdn-expenses-list');
    if(!container) return;
    if(!currentPlanConfig.enableLHDN) return container.innerHTML = lockMsg("Modul LHDN / Cukai");
    
    const expenses = LHDNModule.getExpenses();
    if(expenses.length === 0) return container.innerHTML = `<div class="text-xs text-center opacity-50 py-4">Tiada rekod perbelanjaan.</div>`;
    container.innerHTML = expenses.map(e => `
        <div class="bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10 mb-2 shadow-sm flex justify-between items-center">
            <div class="flex gap-3 items-center">
                ${e.img ? `<img src="${e.img}" class="w-10 h-10 rounded-lg object-cover">` : `<div class="w-10 h-10 bg-slate-100 dark:bg-black/50 flex items-center justify-center text-[8px] opacity-50">Tiada</div>`}
                <div><div class="font-bold text-xs">${e.desc}</div><div class="text-[9px] opacity-60">${e.category}</div></div>
            </div>
            <div class="text-right">
                <div class="font-bold text-sm text-red-500">-RM${e.amount.toFixed(2)}</div>
                <button onclick="deleteExpense(${e.id})" class="text-[8px] text-slate-400 hover:text-red-500">Padam</button>
            </div>
        </div>
    `).join('');
}

function renderCRM() {
    const container = document.getElementById('crm-list');
    if(!container) return;
    if(!currentPlanConfig.enableCRM) return container.innerHTML = lockMsg("Modul CRM");

    const customers = CRMModule.getCustomers();
    container.innerHTML = customers.map(c => `
        <div class="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-3 rounded-2xl flex justify-between items-center mb-2">
            <div><div class="font-bold text-xs">${c.name}</div><div class="text-[10px] text-blue-600 dark:text-purple-400 font-mono">${c.phone}</div></div>
            <div class="text-right flex items-center gap-2">
                <button onclick="editCustomer(${c.id}, '${c.name}', '${c.phone}')" class="text-[10px] bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">Edit</button>
                <button onclick="toggleJail('${c.phone}')" class="text-[8px] text-red-500">STOP</button>
            </div>
        </div>
    `).join('');
}

function renderBuku555() {
    const container = document.getElementById('buku555-list');
    if(!container) return;
    if(!currentPlanConfig.enableBuku555) return container.innerHTML = lockMsg("Buku 555 (Hutang)");

    const debts = Buku555Module.getDebts();
    container.innerHTML = debts.map(d => `
        <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl border border-red-100 dark:border-red-500/20 flex justify-between items-center mb-2">
            <div><div class="font-bold text-xs text-red-600">${d.name}</div><div class="text-[9px] opacity-70">Bil #${d.billNo} | ${d.date}</div></div>
            <div class="text-right">
                <div class="font-bold text-sm text-red-700 dark:text-white mb-1">RM ${d.amount.toFixed(2)}</div>
                <button onclick="payBuku555(${d.id}, ${d.amount})" class="text-[8px] bg-green-500 text-white px-2 py-1 rounded font-bold uppercase">Bayar</button>
            </div>
        </div>
    `).join('');
}

function renderKuponManager() {
    const container = document.getElementById('kupon-manager-list');
    if(!container) return;
    if(!currentPlanConfig.enableKupon) return container.innerHTML = lockMsg("Pengurusan Kupon");

    const kupons = KuponModule.getKupons();
    container.innerHTML = kupons.map(k => `
        <div class="bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex justify-between items-center mb-2 shadow-sm">
            <div><div class="font-bold text-xs text-blue-600">${k.code}</div><div class="text-[9px] opacity-60">RM/Pct: ${k.value} | Min: RM${k.minSpend}</div></div>
            <div class="text-right flex flex-col items-end gap-1">
                <div class="text-[10px] font-bold text-green-600">${k.qty} baki</div>
                <div class="flex gap-2">
                    <button onclick="editKupon(${k.id})" class="text-[8px] bg-slate-200 dark:bg-white/10 px-2 rounded">Edit</button>
                    <button onclick="KuponModule.deleteKupon(${k.id}); refreshAllUI();" class="text-[8px] text-red-500">Padam</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- GATEKEEPER FUNGSI (PENGUNCI BUTANGT LOGIK) ---

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
        refreshAllUI(); 
    }
};

window.payBuku555 = async function(id, currentAmount) {
    if(!currentPlanConfig.enableBuku555) return await KetickModal.alert("Pakej tidak menyokong Buku 555.");
    const amt = await KetickModal.prompt(`Baki hutang: RM${currentAmount.toFixed(2)}\nMasukkan jumlah bayaran:`, "");
    if(amt !== null && amt !== "" && !isNaN(amt)) {
        Buku555Module.payDebt(id, amt);
        await KetickModal.alert("Bayaran direkodkan!");
        refreshAllUI();
    }
};

window.applyKupon = async () => {
    if(!currentPlanConfig.enableKupon) return await KetickModal.alert("Fungsi Kupon dikunci untuk pakej anda.");
    const code = document.getElementById('pos-kupon').value;
    if(code) POSModule.applyKupon(code);
    refreshAllUI();
};

window.searchCustomer = async function() {
    const phone = document.getElementById('pos-phone').value;
    if(!phone) return await KetickModal.alert("Sila masukkan no telefon.");
    if(!POSModule.setCustomerByPhone(phone, 'pos-name')) await KetickModal.alert("Pelanggan baru.");
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
};

window.cancelBill = async () => { 
    if(await KetickModal.confirm("Batalkan transaksi ini?")) { 
        POSModule.clearCart(); 
        refreshAllUI(); 
    } 
};

window.filterHistory = () => HistoryModule.render('history-list', currentPlanConfig, document.getElementById('history-search')?.value);
window.toggleJail = async (p) => { 
    if(!currentPlanConfig.enableWABlast) return await KetickModal.alert("Pakej tidak menyokong fungsi Jail.");
    WABlastModule.addToJail(p); refreshAllUI(); 
};

window.addManualCustomer = async () => { 
    if(!currentPlanConfig.enableCRM) return await KetickModal.alert("Modul CRM dikunci.");
    const n = document.getElementById('crm-manual-name').value;
    const p = document.getElementById('crm-manual-phone').value;
    if(!n || !p) return await KetickModal.alert("Sila isi Nama & No Telefon.");
    CRMModule.saveCustomer(n, p); 
    refreshAllUI(); 
};

window.importPhoneContacts = async () => {
    if(!currentPlanConfig.enableCRM) return await KetickModal.alert("Fungsi Import dikunci.");
    await KetickModal.alert("Menyemak buku telefon... Sila benarkan akses jika diminta.");
    const result = await CRMModule.importFromContacts();
    if(result.success) {
        await KetickModal.alert(`Berjaya import ${result.count} pelanggan!`);
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
        document.getElementById('btn-save-kupon').innerText = "SIMPAN KUPON";
    } else {
        KuponModule.addKupon(data);
    }
    document.getElementById('kupon-form').reset();
    refreshAllUI();
};

window.deleteExpense = async (id) => { 
    if(await KetickModal.confirm("Padam perbelanjaan ini?")) { 
        LHDNModule.deleteExpense(id); 
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
        await KetickModal.alert("Perbelanjaan direkodkan!");
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
    if(val !== null && val !== "") LHDNModule.downloadTaxReport(type, val);
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
    document.getElementById('blast-status-display').innerHTML = queue.map((q, i) => `<a href="${q.link}" target="_blank" class="block bg-green-600 p-2 rounded-xl text-[10px] mt-1 text-white text-center">HANTAR ${i+1}: ${q.name}</a>`).join('');
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
        await KetickModal.alert("Semua mesej dihantar!");
    }
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
                    document.getElementById('btn-save-inv').innerText = "SIMPAN DATA";
                    await KetickModal.alert("Produk dikemaskini!");
                } else {
                    InventoryModule.addProduct(formData, currentPlanConfig, () => {});
                    await KetickModal.alert("Produk Ditambah!");
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

// --- FUNGSI PENDERIA KETUKAN DEV PANEL (10 KALI) ---
function setupDevTrigger() {
    let devTapCount = 0;
    let devTapTimer;
    
    // Kita guna elemen 'auth-status' (tulisan BASIC/LEGEND MODE tu) sebagai trigger
    const devTrigger = document.getElementById('auth-status');
    
    if(devTrigger) {
        devTrigger.style.cursor = "pointer"; // Biar bos tahu boleh tekan
        devTrigger.addEventListener('click', () => {
            devTapCount++;
            clearTimeout(devTapTimer);
            
            // Reset kalau tak ketuk dalam masa 3 saat
            devTapTimer = setTimeout(() => { devTapCount = 0; }, 3000);

            if(devTapCount >= 10) { // Ketuk 10 kali laju-laju
                devTapCount = 0;
                if(!isDevMode) {
                    isDevMode = true;
                    // Panggil fungsi Dev Tools secara manual
                    import('./dev-tools.js').then(module => {
                        module.initDevTools(currentPlanConfig);
                        KetickModal.alert("DEV_PANEL: ACTIVATED 🛠️");
                    });
                }
            }
        });
    }
}

// =======================================================
// ALAT SULIT ADMIN (UNTUK AWAK GENERATE KUNCI LESEN)
// =======================================================
window.AdminGenerateKey = async function(planName, days) {
    const newKey = LicenseModule.generateKey(planName, days);
    console.log(`%c[KUNCI RAHSIA KETICK]`, `color: yellow; font-size: 16px; font-weight: bold;`);
    console.log(`Pelan: ${planName} | Tempoh: ${days} Hari`);
    console.log(`KUNCI: ${newKey}`);
    
    prompt(`Kunci untuk pelan ${planName} (${days} Hari) berjaya dijana. Sila copy kod di bawah:`, newKey);
};

window.onload = initApp;
