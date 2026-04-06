import { AuthModule } from './firebase-auth.js';
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

let currentPlanConfig = BasicPlan; 
let currentUser = null;
let isDevMode = true; 

function initApp() {
    console.log(`[KETICK4MICRO] Sistem bermula.`);
    
    // Inisialisasi Tema
    const savedTheme = localStorage.getItem('ketick_theme');
    if (savedTheme === 'light') { document.documentElement.classList.remove('dark'); } 
    else { document.documentElement.classList.add('dark'); }
    
    AuthModule.onStatusChange(async (user) => {
        if (user) {
            currentUser = user;
            const planName = await AuthModule.getUserPlan(user.uid);
            setPlan(planName);
            updateAuthUI(user);
        } else {
            currentUser = null;
            setPlan('BASIC');
            updateAuthUI(null);
        }
        
        const billDisplay = document.getElementById('next-bill-no-display');
        if(billDisplay) billDisplay.innerText = `#${POSModule.nextBillNo}`;
        refreshAllUI();
    });
    
    setupEventListeners();
    if(isDevMode) setTimeout(() => initDevTools(currentPlanConfig), 500); 
}

// --- FUNGSI THEME TOGGLE ---
window.toggleTheme = function() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('ketick_theme', isDark ? 'dark' : 'light');
};

function setPlan(planName) {
    if (planName === 'LEGEND') currentPlanConfig = LegendPlan;
    else if (planName === 'PREMIUM') currentPlanConfig = Premium;
    else if (planName === 'PRO') currentPlanConfig = ProPlan;
    else currentPlanConfig = BasicPlan;

    const authStatus = document.getElementById('auth-status');
    if (authStatus) authStatus.innerText = `${currentPlanConfig.planName} MODE`;
}

function updateAuthUI(user) {
    const btn = document.getElementById('login-trigger-btn');
    if (!btn) return;
    if (user) {
        btn.innerText = "LOGOUT";
        btn.onclick = () => AuthModule.logout();
    } else {
        btn.innerText = "LOGIN";
        btn.onclick = () => AuthModule.login();
    }
}

// --- PENGURUSAN TAB ---
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab', 'text-white', 'text-slate-800'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.add('opacity-50', 'text-slate-500'));
    
    document.getElementById(tabId).classList.remove('hidden');
    const btnId = tabId.replace('tab-', 'btn-');
    if(document.getElementById(btnId)) {
        document.getElementById(btnId).classList.add('active-tab', 'text-white');
        document.getElementById(btnId).classList.remove('opacity-50', 'text-slate-500');
    }
    refreshAllUI();
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

// --- PENGURUSAN SETTINGS ---
window.openSettings = function() {
    const modal = document.getElementById('settings-page');
    if (modal) {
        modal.classList.remove('hidden');
        SettingsModule.loadToForm();
    }
};

window.closeSettings = function() {
    const modal = document.getElementById('settings-page');
    if (modal) modal.classList.add('hidden');
};

window.saveSettings = function() {
    const data = {
        name: document.getElementById('biz-name').value,
        address: document.getElementById('biz-address').value,
        phone: document.getElementById('biz-phone').value,
        bank: document.getElementById('biz-bank').value,
        accNo: document.getElementById('biz-acc-no').value,
        accName: document.getElementById('biz-acc-name').value,
        logo: document.getElementById('logo-preview').src 
    };
    SettingsModule.saveBizInfo(data);
    alert("Tetapan berjaya disimpan!");
    window.closeSettings();
    SyncModule.uploadData(); 
};

window.previewLogo = function(input) {
    if (!currentPlanConfig.canUploadLogo) return alert(`Maaf, pakej ${currentPlanConfig.planName} tidak menyokong logo.`);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { document.getElementById('logo-preview').src = e.target.result; };
        reader.readAsDataURL(input.files[0]);
    }
};

// --- MODUL LHDN / EXPENSES ---
function renderLHDNExpenses() {
    const container = document.getElementById('lhdn-expenses-list');
    if(!container) return;
    const expenses = LHDNModule.getExpenses();
    if(expenses.length === 0) return container.innerHTML = `<div class="text-xs text-center opacity-50 py-4">Tiada rekod perbelanjaan.</div>`;
    container.innerHTML = expenses.map(e => `
        <div class="bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10 mb-2 shadow-sm dark:shadow-none flex justify-between items-center">
            <div class="flex gap-3 items-center">
                ${e.img ? `<img src="${e.img}" class="w-10 h-10 rounded-lg object-cover cursor-pointer" onclick="window.open('${e.img}', '_blank')">` : `<div class="w-10 h-10 bg-slate-100 dark:bg-black/50 rounded-lg flex items-center justify-center text-[8px] opacity-50">Tiada Resit</div>`}
                <div>
                    <div class="font-bold text-xs text-slate-800 dark:text-white">${e.desc}</div>
                    <div class="text-[9px] opacity-60">${e.category} | ${e.date.split(',')[0]}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-bold text-sm text-red-500">-RM${e.amount.toFixed(2)}</div>
                <button onclick="deleteExpense(${e.id})" class="text-[8px] text-slate-400 hover:text-red-500 mt-1">Padam</button>
            </div>
        </div>
    `).join('');
}

window.deleteExpense = (id) => { if(confirm("Padam?")) { LHDNModule.deleteExpense(id); refreshAllUI(); } };
window.saveNewExpense = () => {
    const desc = document.getElementById('exp-desc').value;
    const amount = document.getElementById('exp-amount').value;
    const cat = document.getElementById('exp-cat').value;
    const imgInput = document.getElementById('exp-img');
    if(!desc || !amount) return alert("Isi butiran!");
    const processSave = (imgData = null) => {
        LHDNModule.saveExpense(desc, amount, cat, imgData);
        alert("Direkodkan!");
        document.getElementById('lhdn-expense-form').reset();
        refreshAllUI();
    };
    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => processSave(e.target.result);
        reader.readAsDataURL(imgInput.files[0]);
    } else processSave();
};

window.generateTaxReport = (type) => {
    if(!currentPlanConfig.enableLHDN) return alert("Naik taraf Legend!");
    const val = (type === 'MONTH') ? prompt("Bulan (MM-YYYY):", "04-2026") : prompt("Tahun (YYYY):", "2026");
    if(val) LHDNModule.downloadTaxReport(type, val);
};

window.generateEInvoiceJSON = (billNo) => { LHDNModule.generateEInvoiceJSON(billNo); };

// --- POS & CRM FUNCTIONS ---
window.searchCustomer = () => {
    const phone = document.getElementById('pos-phone').value;
    if(!phone) return alert("Isi no tel!");
    if(!POSModule.setCustomerByPhone(phone, 'pos-name')) alert("Pelanggan baru!");
};

window.applyKupon = () => {
    const code = document.getElementById('pos-kupon').value;
    if(code) POSModule.applyKupon(code);
};

window.processTransaction = (type, printMethod = 'PDF') => {
    if (POSModule.cart.length === 0) return alert("Troli kosong!");
    const phone = document.getElementById('pos-phone').value;
    const name = document.getElementById('pos-name').value;
    const payMethod = document.getElementById('pos-payment-method').value;

    if (!phone || !name) return alert("Isi Nama & No Tel!");

    const crmResult = CRMModule.saveCustomer(name, phone);
    if (!crmResult.success) return alert(crmResult.msg);

    let subtotal = POSModule.cart.reduce((sum, item) => sum + item.price, 0);
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

    if (payMethod === 'HUTANG') Buku555Module.addDebt(crmResult.customer, total, trx.billNo);
    
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
    refreshAllUI();
    SyncModule.uploadData();
};

window.cancelBill = () => { if(confirm("Batal?")) POSModule.clearCart(); };
window.createNewKupon = () => {
    const data = { code: document.getElementById('kp-code').value, type: document.getElementById('kp-type').value, value: document.getElementById('kp-value').value, minSpend: document.getElementById('kp-min').value, qty: document.getElementById('kp-qty').value };
    KuponModule.addKupon(data);
    refreshAllUI();
};

// --- WA BLAST ---
window.startWABlast = () => {
    const msg = document.getElementById('blast-msg').value;
    const queue = WABlastModule.generateBlastLinks(msg);
    const display = document.getElementById('blast-status-display');
    display.innerHTML = queue.map((q, i) => `<a href="${q.link}" target="_blank" class="block bg-green-600 p-2 rounded-xl text-[10px] mt-1 text-white">HANTAR ${i+1}: ${q.name}</a>`).join('');
};

window.startTurboBlast = async () => {
    const msg = document.getElementById('blast-msg').value;
    const delay = parseInt(document.getElementById('blast-delay').value);
    const queue = WABlastModule.generateTurboLinks(msg);
    if(confirm(`Mula Turbo Blast untuk ${queue.length} orang?`)) {
        for (let i = 0; i < queue.length; i++) {
            window.open(queue[i].link, '_blank');
            await new Promise(r => setTimeout(r, delay * 1000));
        }
    }
};

window.toggleJail = (p) => { WABlastModule.addToJail(p); refreshAllUI(); };
window.addManualCustomer = () => { CRMModule.saveCustomer(document.getElementById('crm-manual-name').value, document.getElementById('crm-manual-phone').value); refreshAllUI(); };
window.filterHistory = () => HistoryModule.render('history-list', currentPlanConfig, document.getElementById('history-search').value);

// --- CRM & MISC ---
function renderCRM() { /* UI CRM */ }
function renderBuku555() { /* UI 555 */ }
function renderKuponManager() { /* UI Kupon */ }

function setupEventListeners() {
    const form = document.getElementById('add-product-form');
    if(form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('p-name').value,
                desc: document.getElementById('p-desc').value,
                price: document.getElementById('p-price').value,
                qty: document.getElementById('p-qty').value,
                img: "" // Handle image if needed
            };
            InventoryModule.addProduct(formData, currentPlanConfig, () => { refreshAllUI(); form.reset(); });
        };
    }
}

window.onload = initApp;
