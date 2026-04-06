import { AuthModule } from './firebase-auth.js';
import { BasicPlan } from '../plans/basic.js';
import { ProPlan } from '../plans/pro.js';
import { LegendPlan } from '../plans/legend.js';
import { initDevTools } from './dev-tools.js';

// Modul Teras
import { InventoryModule } from '../modules/inventory.js';
import { POSModule } from '../modules/pos.js';
import { BillingModule } from '../modules/billing.js';
import { SettingsModule } from '../modules/settings.js';
import { DashboardModule } from '../modules/dashboard.js'; 
import { SyncModule } from '../modules/sync.js'; 
import { HistoryModule } from '../modules/history.js';

// Modul Baharu (Pakej Premium/Legend)
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

    if(isDevMode) {
        setTimeout(() => initDevTools(currentPlanConfig), 500); 
    }
}

function setPlan(planName) {
    if (planName === 'LEGEND') currentPlanConfig = LegendPlan;
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
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab', 'text-white'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.add('opacity-50'));
    
    document.getElementById(tabId).classList.remove('hidden');
    const btnId = tabId.replace('tab-', 'btn-');
    if(document.getElementById(btnId)) {
        document.getElementById(btnId).classList.add('active-tab', 'text-white');
        document.getElementById(btnId).classList.remove('opacity-50');
    }
    
    refreshAllUI();
};

// --- FUNGSI RENDER CUSTOM UI ---
function renderCRM() {
    const container = document.getElementById('crm-list');
    if(!container) return;
    
    if(!currentPlanConfig.enableCRM) {
        container.innerHTML = `<div class="opacity-50 text-xs text-center py-10">🔒 Pakej anda tidak menyokong modul CRM.</div>`;
        return;
    }

    const customers = CRMModule.getCustomers();
    if(customers.length === 0) return container.innerHTML = `<div class="opacity-50 text-xs text-center py-5">Tiada rekod pelanggan.</div>`;
    
    container.innerHTML = customers.map(c => `
        <div class="bg-white/5 border border-white/10 p-3 rounded-xl flex justify-between items-center mb-2">
            <div>
                <div class="font-bold text-xs">${c.name}</div>
                <div class="text-[10px] text-purple-400 font-mono mt-1">${c.phone}</div>
            </div>
            <div class="text-right">
                <div class="text-[10px] opacity-70 bg-black/50 px-2 py-1 rounded-md">Pts: ${c.points || 0}</div>
            </div>
        </div>
    `).join('');
}

function renderBuku555() {
    const container = document.getElementById('buku555-list');
    if(!container) return;
    
    if(!currentPlanConfig.enableBuku555) {
        container.innerHTML = `<div class="opacity-50 text-xs text-center py-10">🔒 Pakej anda tidak menyokong Buku 555.</div>`;
        return;
    }

    const debts = Buku555Module.getDebts();
    if(debts.length === 0) return container.innerHTML = `<div class="opacity-50 text-xs text-center py-5">Tiada rekod hutang aktif.</div>`;
    
    container.innerHTML = debts.map(d => `
        <div class="bg-red-900/20 border border-red-500/30 p-3 rounded-xl flex justify-between items-center mb-2">
            <div>
                <div class="font-bold text-xs text-red-400">${d.name}</div>
                <div class="text-[9px] opacity-70 mt-1">Bil: #${d.billNo} | ${d.date}</div>
            </div>
            <div class="text-right flex flex-col items-end">
                <div class="font-bold text-sm text-white">RM ${d.amount.toFixed(2)}</div>
                <button onclick="window.open('https://wa.me/${d.phone}?text=Sila jelaskan hutang RM${d.amount.toFixed(2)} untuk Bil KETICK %23${d.billNo}. Terima kasih.', '_blank')" class="mt-2 bg-green-600/20 text-green-400 border border-green-500/30 px-2 py-1 rounded text-[8px] font-bold tracking-wider uppercase">Ingatkan</button>
            </div>
        </div>
    `).join('');
}

function refreshAllUI() {
    InventoryModule.renderList('inventory-list');
    POSModule.renderPOSSelect('pos-select-list');
    POSModule.renderCart('cart-items', 'total-price');
    DashboardModule.render('dashboard-container', currentPlanConfig); 
    HistoryModule.render('history-list', currentPlanConfig); 
    renderCRM();
    renderBuku555();
}

// --- HELPER TRANSAKSI & POS ---
window.searchCustomer = function() {
    const phone = document.getElementById('pos-phone').value;
    if(!phone) return alert("Sila masukkan no telefon dahulu.");
    const found = POSModule.setCustomerByPhone(phone, 'pos-name');
    if(!found) alert("Pelanggan baru. Sila isikan nama untuk didaftarkan.");
};

window.applyKupon = function() {
    if(!currentPlanConfig.enableKupon) return alert("Fungsi kupon tidak aktif untuk pelan ini.");
    const code = document.getElementById('pos-kupon').value;
    if(!code) return;
    POSModule.applyKupon(code);
};

window.triggerWABlast = function() {
    if(!currentPlanConfig.enableWABlast) return alert("Fungsi WA Blast eksklusif untuk pelan LEGEND.");
    const msg = prompt("Masukkan mesej promosi. Gunakan [NAMA] untuk letak nama pelanggan:", "Hi [NAMA], kami ada promosi istimewa hari ini!");
    if(!msg) return;
    
    const links = WABlastModule.generateBlastLinks(msg);
    if(links && links.length > 0) {
        alert(`Terdapat ${links.length} sasaran. Sila klik butang hantar yang dijana.`);
        const crmList = document.getElementById('crm-list');
        crmList.innerHTML = `<button onclick="switchTab('tab-crm')" class="text-[10px] w-full text-center mb-3 text-red-400 border border-red-400 p-2 rounded-xl">Batalkan Mod Blast</button>` + 
        links.map((link, i) => `
            <a href="${link}" target="_blank" class="block bg-green-600 hover:bg-green-500 p-3 rounded-xl mb-2 text-[10px] font-bold text-center text-white shadow-lg transition">🚀 HANTAR KE PELANGGAN ${i+1}</a>
        `).join('');
    }
};

window.processTransaction = function(type, printMethod = 'PDF') {
    if (POSModule.cart.length === 0) return alert("Troli kosong!");

    const phoneInput = document.getElementById('pos-phone').value;
    const nameInput = document.getElementById('pos-name').value;
    const paymentMethod = document.getElementById('pos-payment-method').value;

    // Validasi Pelanggan (Wajib)
    if (!phoneInput || !nameInput) {
        return alert("WAJIB: Sila isi Nama dan No Telefon pelanggan (Mula dengan 6) sebelum meneruskan transaksi.");
    }

    // Simpan ke CRM dan Validasi Nombor Telefon
    const crmResult = CRMModule.saveCustomer(nameInput, phoneInput);
    if (!crmResult.success) {
        return alert(crmResult.msg); // Ralat jika format telefon salah
    }
    const customer = crmResult.customer;

    // Pengiraan
    const subtotal = POSModule.cart.reduce((sum, item) => sum + item.price, 0);
    let discount = POSModule.currentDiscount || 0;
    let total = subtotal - discount;
    if(total < 0) total = 0;

    const itemsCopy = [...POSModule.cart];
    const currentBill = POSModule.nextBillNo;

    // Logik Buku 555
    if (paymentMethod === 'HUTANG') {
        if (!currentPlanConfig.enableBuku555) return alert("Pakej anda tidak menyokong fungsi Buku 555. Sila tukar kaedah bayaran.");
        if (type !== 'RECEIPT') return alert("Hutang hanya boleh direkodkan menggunakan JANA RESIT MUKTAMAD.");
        Buku555Module.addDebt(customer, total, currentBill);
        alert(`Berjaya direkodkan ke Buku 555 atas nama ${customer.name}`);
    }

    // Simpan Sejarah
    const transactionRecord = {
        billNo: currentBill,
        date: new Date().toLocaleString(),
        items: itemsCopy,
        total: total,
        discount: discount,
        customer: customer,
        paymentMethod: paymentMethod,
        type: type
    };
    HistoryModule.saveTransaction(transactionRecord);

    // Potong Stok
    if (type === 'RECEIPT') {
        let products = InventoryModule.getProducts();
        POSModule.cart.forEach(cartItem => { 
            let p = products.find(prod => prod.id === cartItem.id); 
            if (p && p.qty > 0) p.qty -= 1; 
        });
        InventoryModule.saveProducts(products); 
    }

    // Penjanaan Resit
    if (printMethod === 'BT') {
        if (!currentPlanConfig.enableBluetoothPrint) return alert("Fungsi Print Bluetooth dikunci untuk pakej anda.");
        PrinterModule.printReceipt(transactionRecord, BillingModule.getBizInfo());
    } else {
        BillingModule.generatePDF(type, currentBill, itemsCopy, total, discount, customer, paymentMethod, currentPlanConfig);
    }
    
    // Reset Data POS
    POSModule.incrementBillNo();
    POSModule.clearCart();
    document.getElementById('pos-phone').value = '';
    document.getElementById('pos-name').value = '';
    document.getElementById('pos-kupon').value = '';
    document.getElementById('pos-payment-method').value = 'TUNAI';

    refreshAllUI();
    SyncModule.uploadData(); 
};

window.cancelBill = function() {
    if (POSModule.cart.length > 0 && confirm("Batalkan transaksi ini?")) { POSModule.clearCart(); }
};

// --- SETTINGS DAN EVENT LISTENER ---
window.openSettings = function() { document.getElementById('settings-page').classList.remove('hidden'); SettingsModule.loadToForm(); };
window.closeSettings = function() { document.getElementById('settings-page').classList.add('hidden'); };

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
    window.closeSettings();
    SyncModule.uploadData(); 
};

window.previewLogo = function(input) {
    if (!currentPlanConfig.canUploadLogo) return alert(`Maaf, pakej ${currentPlanConfig.planName} tidak menyokong fungsi muat naik logo.`);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => { document.getElementById('logo-preview').src = e.target.result; };
        reader.readAsDataURL(input.files[0]);
    }
};

function setupEventListeners() {
    const form = document.getElementById('add-product-form');
    if(form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('p-img');
            const processAdd = (imgData = "") => {
                const formData = {
                    name: document.getElementById('p-name').value,
                    price: document.getElementById('p-price').value,
                    qty: document.getElementById('p-qty').value,
                    img: imgData
                };
                InventoryModule.addProduct(formData, currentPlanConfig, () => {
                    refreshAllUI();
                    form.reset();
                    alert("Produk Berjaya Ditambah!");
                    SyncModule.uploadData(); 
                });
            };
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => processAdd(ev.target.result);
                reader.readAsDataURL(fileInput.files[0]);
            } else processAdd();
        };
    }
}

window.onload = initApp;
