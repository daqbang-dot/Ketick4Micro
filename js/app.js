import { AuthModule } from './firebase-auth.js';
import { BasicPlan } from '../plans/basic.js';
import { ProPlan } from '../plans/pro.js';
import { LegendPlan } from '../plans/legend.js';
import { initDevTools } from './dev-tools.js';
import { InventoryModule } from '../modules/inventory.js';
import { POSModule } from '../modules/pos.js';
import { BillingModule } from '../modules/billing.js';
import { SettingsModule } from '../modules/settings.js';
import { DashboardModule } from '../modules/dashboard.js'; 
import { SyncModule } from '../modules/sync.js'; 
import { HistoryModule } from '../modules/history.js';

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

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    
    document.getElementById(tabId).classList.remove('hidden');
    const btnId = tabId.replace('tab-', 'btn-');
    if(document.getElementById(btnId)) document.getElementById(btnId).classList.add('active-tab');
    
    refreshAllUI();
};

window.openSettings = function() {
    document.getElementById('settings-page').classList.remove('hidden');
    SettingsModule.loadToForm();
};

window.closeSettings = function() {
    document.getElementById('settings-page').classList.add('hidden');
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
    window.closeSettings();
    SyncModule.uploadData(); 
};

window.previewLogo = function(input) {
    if (!currentPlanConfig.canUploadLogo) {
        alert(`Maaf, pakej ${currentPlanConfig.planName} tidak menyokong fungsi muat naik logo.`);
        return;
    }
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('logo-preview').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

function refreshAllUI() {
    InventoryModule.renderList('inventory-list');
    POSModule.renderPOSSelect('pos-select-list');
    POSModule.renderCart('cart-items', 'total-price');
    DashboardModule.render('dashboard-container', currentPlanConfig); 
    HistoryModule.render('history-list', currentPlanConfig); 
}

window.processTransaction = function(type) {
    if (POSModule.cart.length === 0) return alert("Troli kosong!");
    const total = POSModule.cart.reduce((sum, item) => sum + item.price, 0);
    const itemsCopy = [...POSModule.cart];
    
    const transactionRecord = {
        billNo: POSModule.nextBillNo,
        date: new Date().toLocaleString(),
        items: itemsCopy,
        total: total,
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

        BillingModule.generatePDF('RECEIPT', POSModule.nextBillNo, itemsCopy, total, currentPlanConfig);
        POSModule.incrementBillNo();
    } else { 
        BillingModule.generatePDF(type, POSModule.nextBillNo, itemsCopy, total, currentPlanConfig); 
    }
    
    POSModule.clearCart();
    refreshAllUI();
    SyncModule.uploadData(); 
};

window.cancelBill = function() {
    if (POSModule.cart.length > 0 && confirm("Batalkan transaksi ini?")) { POSModule.clearCart(); }
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
