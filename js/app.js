import { AuthModule } from './firebase-auth.js';
import { BasicPlan } from '../plans/basic.js';
import { ProPlan } from '../plans/pro.js';
import { Premium } from '../plans/premium.js';
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

// Modul Baharu
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
                <div class="text-[10px] opacity-70 bg-black/50 px-2 py-1 rounded-md mb-1">Pts: ${c.points || 0}</div>
                <button onclick="toggleJail('${c.phone}')" class="text-[8px] border border-red-500/50 text-red-400 px-2 py-1 rounded hover:bg-red-500/20">STOP / JAIL</button>
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

function renderKuponManager() {
    const container = document.getElementById('kupon-manager-list');
    if(!container) return;
    
    if(!currentPlanConfig.enableKupon) {
        container.innerHTML = `<div class="opacity-50 text-xs text-center py-10">🔒 Pakej anda tidak menyokong Modul Kupon.</div>`;
        return;
    }

    const kupons = KuponModule.getKupons();
    if(kupons.length === 0) {
        container.innerHTML = `<div class="text-[10px] opacity-30 italic">Tiada kupon dicipta.</div>`;
        return;
    }

    container.innerHTML = kupons.map(k => `
        <div class="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center mb-2">
            <div>
                <div class="font-bold text-xs text-yellow-500">${k.code}</div>
                <div class="text-[9px] opacity-50">${k.type === 'PERCENT' ? k.value+'%' : 'RM'+k.value} | Min: RM${k.minSpend}</div>
            </div>
            <div class="text-right flex flex-col items-end">
                <div class="text-[10px] font-bold ${k.qty > 0 ? 'text-green-400' : 'text-red-400'}">${k.qty} baki</div>
                <div class="text-[8px] opacity-40 uppercase">Guna: ${k.used}</div>
            </div>
        </div>
    `).join('');
}

function refreshAllUI() {
    InventoryModule.renderList('inventory-list');
    POSModule.renderPOSSelect('pos-select-list');
    POSModule.renderCart('cart-items', 'total-price');
    DashboardModule.render('dashboard-container', currentPlanConfig); 
    HistoryModule.render('history-list', currentPlanConfig, document.getElementById('history-search')?.value); 
    renderCRM();
    renderBuku555();
    renderKuponManager();
}

// --- FUNGSI SEARCH HISTORY ---
window.filterHistory = function() {
    const query = document.getElementById('history-search').value;
    HistoryModule.render('history-list', currentPlanConfig, query);
};

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

window.createNewKupon = function() {
    if(!currentPlanConfig.enableKupon) return alert("Sila naik taraf pakej untuk mencipta kupon.");
    const data = {
        code: document.getElementById('kp-code').value,
        type: document.getElementById('kp-type').value,
        value: document.getElementById('kp-value').value,
        minSpend: document.getElementById('kp-min').value,
        qty: document.getElementById('kp-qty').value
    };

    if(!data.code || !data.value || !data.qty || !data.minSpend) return alert("Sila lengkapkan semua maklumat kupon.");
    
    KuponModule.addKupon(data);
    alert("Kupon berjaya dicipta!");
    document.getElementById('kupon-form').reset();
    refreshAllUI();
};

// --- FUNGSI WA BLAST (SEMI-AUTO) ---
window.startWABlast = function() {
    if(!currentPlanConfig.enableWABlast) return alert("Pakej anda tidak menyokong WA Blast.");
    
    const message = document.getElementById('blast-msg').value;
    if(!message) return alert("Sila masukkan mesej.");

    const queue = WABlastModule.generateBlastLinks(message);
    if(queue.length === 0) return alert("Tiada sasaran yang sah (Semua pelanggan mungkin berada di dalam senarai Jail atau tiada rekod pelanggan).");

    alert(`Sistem KETICK telah menyusun ${queue.length} pautan selamat. Sila klik butang yang dijana satu per satu.`);

    const display = document.getElementById('blast-status-display');
    display.innerHTML = `
        <div class="max-h-60 overflow-y-auto space-y-2 text-left mt-4 border-t border-white/10 pt-4">
            ${queue.map((q, i) => `
                <a href="${q.link}" target="_blank" onclick="this.classList.replace('bg-green-600', 'bg-gray-700'); this.classList.add('opacity-50'); this.innerText = '✅ SELESAI: ${q.name}';" class="block bg-green-600 p-3 rounded-xl text-[10px] font-bold text-center text-white shadow-lg transition">
                    🚀 HANTAR ${i+1}: ${q.name}
                </a>
            `).join('')}
        </div>
        <button onclick="document.getElementById('blast-status-display').innerHTML=''" class="w-full text-[8px] text-red-400 mt-4 border border-red-500/30 p-2 rounded-xl">TUTUP SENARAI</button>
    `;
};

// --- FUNGSI WA BLAST (TURBO EXTENSION FULL-AUTO) ---
window.startTurboBlast = async function() {
    if(!currentPlanConfig.enableWABlast) return alert("Pakej anda tidak menyokong WA Blast.");
    
    const message = document.getElementById('blast-msg').value;
    const delay = parseInt(document.getElementById('blast-delay').value);
    
    if(!message) return alert("Sila masukkan mesej.");
    if(delay < 15) return alert("Untuk TURBO, delay minimum 15 saat diperlukan supaya WhatsApp Web sempat sedia.");

    const queue = WABlastModule.generateTurboLinks(message);
    if(queue.length === 0) return alert("Tiada sasaran.");

    if(confirm(`AMARAN: KETICK akan membuka & menutup tab automatik untuk ${queue.length} pelanggan. Pastikan 'KETICK Turbo Blast' Extension aktif di Kiwi Browser (Desktop Mode). Teruskan?`)) {
        
        for (let i = 0; i < queue.length; i++) {
            const task = queue[i];
            
            document.getElementById('blast-status-display').innerHTML = `
                <div class="animate-bounce text-yellow-400 font-bold mt-3">🚀 TURBO AKTIF: ${i+1}/${queue.length}</div>
                <p class="text-[10px] opacity-70">Menghantar ke: ${task.name}</p>
                <p class="text-[8px] text-red-500 italic">Jangan tutup tab/browser KETICK ini.</p>
            `;

            window.open(task.link, '_blank');

            await new Promise(resolve => setTimeout(resolve, delay * 1000));
        }

        alert("Misi Turbo Blast Selesai!");
        document.getElementById('blast-status-display').innerHTML = "✅ Semua mesej Turbo telah dihantar.";
        refreshAllUI();
    }
};

window.toggleJail = function(phone) {
    WABlastModule.addToJail(phone);
    alert(`Nombor ${phone} telah dimasukkan ke dalam JAIL (Penyekat Blast).`);
    refreshAllUI();
};

// --- FUNGSI POS & TRANSAKSI ---
window.processTransaction = function(type, printMethod = 'PDF') {
    if (POSModule.cart.length === 0) return alert("Troli kosong!");

    const phoneInput = document.getElementById('pos-phone').value;
    const nameInput = document.getElementById('pos-name').value;
    const paymentMethod = document.getElementById('pos-payment-method').value;

    if (!phoneInput || !nameInput) {
        return alert("WAJIB: Sila isi Nama dan No Telefon pelanggan (Mula dengan 6) sebelum meneruskan transaksi.");
    }

    const crmResult = CRMModule.saveCustomer(nameInput, phoneInput);
    if (!crmResult.success) return alert(crmResult.msg); 
    const customer = crmResult.customer;

    const subtotal = POSModule.cart.reduce((sum, item) => sum + item.price, 0);

    if (POSModule.appliedKupon) {
        const check = KuponModule.verifyKupon(POSModule.appliedKupon, subtotal);
        if (!check.valid) {
            POSModule.appliedKupon = null;
            POSModule.currentDiscount = 0;
            refreshAllUI(); 
            return alert(`Transaksi ditahan! Kupon tidak melepasi syarat: ${check.msg}`);
        }
    }

    let discount = POSModule.currentDiscount || 0;
    let total = subtotal - discount;
    if(total < 0) total = 0;

    const itemsCopy = [...POSModule.cart];
    const currentBill = POSModule.nextBillNo;

    if (paymentMethod === 'HUTANG') {
        if (!currentPlanConfig.enableBuku555) return alert("Pakej anda tidak menyokong fungsi Buku 555.");
        if (type !== 'RECEIPT') return alert("Hutang hanya direkodkan menggunakan JANA RESIT MUKTAMAD.");
        Buku555Module.addDebt(customer, total, currentBill);
        alert(`Berjaya direkodkan ke Buku 555 atas nama ${customer.name}`);
    }

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

    if (type === 'RECEIPT') {
        let products = InventoryModule.getProducts();
        POSModule.cart.forEach(cartItem => { 
            let p = products.find(prod => prod.id === cartItem.id); 
            if (p && p.qty > 0) p.qty -= 1; 
        });
        InventoryModule.saveProducts(products); 

        if (POSModule.appliedKupon) {
            KuponModule.decrementKupon(POSModule.appliedKupon);
        }
    }

    if (printMethod === 'BT') {
        if (!currentPlanConfig.enableBluetoothPrint) return alert("Fungsi Print Bluetooth dikunci untuk pakej anda.");
        PrinterModule.printReceipt(transactionRecord, BillingModule.getBizInfo());
    } else {
        BillingModule.generatePDF(type, currentBill, itemsCopy, total, discount, customer, paymentMethod, currentPlanConfig);
    }
    
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

// --- FUNGSI TAMBAHAN UNTUK CRM UI ---
window.addManualCustomer = function() {
    if(!currentPlanConfig.enableCRM) return alert("Pakej anda tidak menyokong modul CRM.");
    const name = document.getElementById('crm-manual-name').value;
    const phone = document.getElementById('crm-manual-phone').value;
    if(!name || !phone) return alert("Sila masukkan nama dan nombor telefon.");
    
    const result = CRMModule.saveCustomer(name, phone);
    if(result.success) {
        alert("Pelanggan berjaya disimpan!");
        document.getElementById('crm-manual-name').value = '';
        document.getElementById('crm-manual-phone').value = '';
        refreshAllUI();
        SyncModule.uploadData();
    } else {
        alert(result.msg);
    }
};

window.importPhoneContacts = async function() {
    if(!currentPlanConfig.enableCRM) return alert("Pakej anda tidak menyokong modul CRM.");
    const result = await CRMModule.importFromContacts();
    if(result.success) {
        alert(`Berjaya import ${result.count} nombor dari kenalan telefon anda!`);
        refreshAllUI();
        SyncModule.uploadData();
    } else {
        alert(result.msg);
    }
};

window.handleExcelUpload = function(input) {
    if(!currentPlanConfig.enableCRM) return alert("Pakej anda tidak menyokong modul CRM.");
    if (input.files && input.files[0]) {
        alert("Sedang memproses fail Excel/CSV...");
        CRMModule.importFromExcel(input.files[0], (result) => {
            if(result.success) {
                alert(`Selesai! Berjaya import ${result.count} pelanggan dari fail.`);
                refreshAllUI();
                SyncModule.uploadData();
            } else {
                alert(`Ralat: ${result.msg}`);
            }
            input.value = ''; 
        });
    }
};

window.onload = initApp;
