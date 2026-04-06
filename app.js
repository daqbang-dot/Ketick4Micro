// --- LOGIK PWA INSTALLATION ---
let deferredPrompt;
const installBtn = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA Install: ${outcome}`);
        deferredPrompt = null;
        installBtn.classList.add('hidden');
    });
}

window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.classList.add('hidden');
    deferredPrompt = null;
    alert("Berjaya di-install! Sila semak skrin utama anda.");
});

// --- SISTEM TEMA ---
if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.add('light-mode');
    document.getElementById('theme-icon').innerText = '☀️';
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('theme-icon');
    if (html.classList.contains('light-mode')) {
        html.classList.remove('light-mode');
        icon.innerText = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        html.classList.add('light-mode');
        icon.innerText = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

// --- SISTEM TABS ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    
    document.getElementById(tabId).classList.remove('hidden');
    const btnId = tabId.replace('tab-', 'btn-');
    if(document.getElementById(btnId)) document.getElementById(btnId).classList.add('active-tab');
    
    // Reset search bila tukar tab
    if(tabId === 'tab-catalog') renderCatalog("");
    renderAll(); 
}

// --- SISTEM STATUS PAKEJ & LANGGANAN (PRICING) ---
let currentPlan = localStorage.getItem('ketick_plan') || 'BASIC';

function openPricing() {
    document.getElementById('pricing-page').classList.remove('hidden');
}

function closePricing() {
    document.getElementById('pricing-page').classList.add('hidden');
}

function subscribe(plan) {
    if (currentPlan === plan) {
        return alert(`Anda sudah melanggan pakej ${plan}.`);
    }

    // Ini simulasi pengaktifan pakej
    let confirmUpgrade = confirm(`Adakah anda mahu naik taraf ke pakej ${plan}?\n\n(Ini adalah simulasi pengesahan pembayaran)`);
    
    if (confirmUpgrade) {
        currentPlan = plan;
        localStorage.setItem('ketick_plan', currentPlan);
        alert(`Tahniah! Akaun anda telah dinaik taraf ke pakej ${plan}.`);
        closePricing();
        renderAll();
    }
}

// --- SISTEM BUSINESS SETTINGS ---
let bizInfo = JSON.parse(localStorage.getItem('ketick_biz')) || {
    name: "KETICK BUSINESS",
    address: "Alamat Kedai Anda",
    phone: "012-3456789",
    bank: "MAYBANK",
    accNo: "1234567890",
    accName: "NAMA PEMILIK",
    logo: "" 
};

function openSettings() {
    document.getElementById('settings-page').classList.remove('hidden');
    document.getElementById('biz-name').value = bizInfo.name;
    document.getElementById('biz-address').value = bizInfo.address;
    document.getElementById('biz-phone').value = bizInfo.phone;
    document.getElementById('biz-bank').value = bizInfo.bank;
    document.getElementById('biz-acc-no').value = bizInfo.accNo;
    document.getElementById('biz-acc-name').value = bizInfo.accName;
    if(bizInfo.logo) document.getElementById('logo-preview').src = bizInfo.logo;
}

function closeSettings() { 
    document.getElementById('settings-page').classList.add('hidden'); 
}

function previewLogo(input) {
    // SEMAKAN PAKEJ: Logo hanya untuk PRO ke atas
    if (currentPlan === 'BASIC') {
        alert("Fungsi Logo Syarikat eksklusif untuk pakej PRO dan ke atas sahaja.");
        input.value = ''; // Reset input fail
        closeSettings();
        openPricing();
        return;
    }

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('logo-preview').src = e.target.result;
            bizInfo.logo = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveSettings() {
    bizInfo.name = document.getElementById('biz-name').value;
    bizInfo.address = document.getElementById('biz-address').value;
    bizInfo.phone = document.getElementById('biz-phone').value;
    bizInfo.bank = document.getElementById('biz-bank').value;
    bizInfo.accNo = document.getElementById('biz-acc-no').value;
    bizInfo.accName = document.getElementById('biz-acc-name').value;
    localStorage.setItem('ketick_biz', JSON.stringify(bizInfo));
    alert("Settings Saved!");
    closeSettings();
}

// --- KONFIGURASI DATA STOK ---
let products = JSON.parse(localStorage.getItem('ketick_products')) || [
    { id: 1, name: "Starter Item", price: 10.00, qty: 50, img: "https://via.placeholder.com/150/4D30FF/FFFFFF?text=Ketick" }
];
let nextBillNo = parseInt(localStorage.getItem('ketick_bill_no')) || 1001;
let cart = [];

// --- FUNGSI PENJANAAN PDF ---
async function generatePDF(type, billNo, items, total) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const date = new Date().toLocaleString();
    const isLight = document.documentElement.classList.contains('light-mode');
    const accentColor = isLight ? [255, 83, 0] : [77, 48, 255];

    if(bizInfo.logo) { 
        try { doc.addImage(bizInfo.logo, 'PNG', 14, 10, 25, 25); } catch(e) {} 
    }

    doc.setFontSize(16); doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(bizInfo.name.toUpperCase(), 200, 20, { align: 'right' });
    
    doc.setFontSize(8); doc.setTextColor(100);
    doc.text(bizInfo.address, 200, 26, { align: 'right' });
    doc.text(`Phone: ${bizInfo.phone}`, 200, 30, { align: 'right' });

    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.line(14, 40, 200, 40);

    doc.setFontSize(12); doc.setTextColor(0);
    doc.text(`${type}: #${billNo}`, 14, 50);
    doc.setFontSize(9); doc.text(`Tarikh: ${date}`, 14, 55);

    const tableData = items.map((item, index) => [
        index + 1, item.name, `1`, `RM ${item.price.toFixed(2)}`, `RM ${item.price.toFixed(2)}`
    ]);

    doc.autoTable({ 
        startY: 60, 
        head: [['No', 'Produk', 'Qty', 'Price', 'Total']], 
        body: tableData, 
        headStyles: { fillColor: accentColor } 
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: RM ${total.toFixed(2)}`, 200, finalY, { align: 'right' });

    doc.setFontSize(10); doc.text("PAYMENT INFO:", 14, finalY);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Bank: ${bizInfo.bank} | Acc: ${bizInfo.accNo}`, 14, finalY + 6);
    doc.text(`Name: ${bizInfo.accName}`, 14, finalY + 11);

    // --- LOGIK WATERMARK UNTUK PAKEJ BASIC ---
    if (currentPlan === 'BASIC') {
        doc.setFontSize(8);
        doc.setTextColor(150, 0, 0); // Merah pudar
        doc.text("Dijana secara percuma oleh KETICK4MICRO - Sila naik taraf", 105, 290, { align: 'center' });
    }

    doc.save(`KETICK_${type}_${billNo}.pdf`);
}

// --- FUNGSI TRANSAKSI & RENDER ---
function processTransaction(type) {
    if (cart.length === 0) return alert("Cart is empty!");
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const itemsCopy = [...cart];
    
    if (type === 'RECEIPT') {
        cart.forEach(item => { 
            let p = products.find(prod => prod.id === item.id); 
            if (p) p.qty -= 1; 
        });
        generatePDF('RECEIPT', nextBillNo, itemsCopy, total);

        // --- KELEBIHAN PAKEJ LEGEND: WHATSAPP AUTO ---
        if (currentPlan === 'LEGEND') {
            setTimeout(() => {
                if (confirm("Resit berjaya dijana! Hantar butiran terus ke WhatsApp pelanggan?")) {
                    let phoneNum = prompt("Sila masukkan nombor telefon pelanggan (Contoh: 60123456789):");
                    if (phoneNum) {
                        let text = `Terima kasih atas pembelian anda dari ${bizInfo.name}!\n\nNo Resit: #${nextBillNo}\nJumlah: RM${total.toFixed(2)}\n\nSila simpan PDF resit yang telah diberikan.`;
                        window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`, '_blank');
                    }
                }
            }, 500); // Tunggu PDF selesai dijana sebelum prompt WhatsApp muncul
        }
        
        nextBillNo++;
    } else { 
        generatePDF(type, nextBillNo, itemsCopy, total); 
    }
    
    cart = []; 
    saveData(); 
    renderAll();
}

function renderAll() { 
    renderCatalog(); 
    renderPOSSelect(); 
    renderCart(); 
    renderInventory(); 
    updateBillDisplay(); 
}

function renderCatalog(filter = "") {
    const container = document.getElementById('catalog-list');
    const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
    
    container.innerHTML = filtered.map(p => `
        <div class="glass-card p-3 text-center flex flex-col justify-between h-full">
            <div>
                <img src="${p.img}" class="w-full h-24 object-cover rounded-lg mb-2">
                <p class="text-xs font-bold leading-tight line-clamp-2">${p.name}</p>
            </div>
            <div class="mt-2">
                <p class="text-accent text-sm font-bold">RM ${p.price.toFixed(2)}</p>
                <p class="text-[10px] opacity-50 mt-1">Stock: ${p.qty}</p>
            </div>
        </div>
    `).join('');
}

function renderPOSSelect() {
    const container = document.getElementById('pos-select-list');
    container.innerHTML = products.map(p => `
        <button onclick="addToCart(${p.id})" class="glass-card p-2 text-[10px] flex flex-col items-center justify-center h-20 active:scale-95 transition">
            <div class="w-8 h-8 bg-white/10 rounded-full mb-1 overflow-hidden">
                <img src="${p.img}" class="w-full h-full object-cover">
            </div>
            <span class="truncate w-full text-center leading-tight">${p.name}</span>
        </button>
    `).join('');
}

function renderInventory() {
    const container = document.getElementById('inventory-list');
    container.innerHTML = products.map(p => `
        <div class="glass-card p-3 flex justify-between items-center">
            <div class="flex items-center gap-3 w-4/5">
                <img src="${p.img}" class="w-10 h-10 rounded-lg object-cover flex-shrink-0">
                <div class="truncate">
                    <p class="font-bold text-xs truncate">${p.name}</p>
                    <p class="text-[10px] opacity-50">RM ${p.price.toFixed(2)} | Stock: ${p.qty}</p>
                </div>
            </div>
            <button onclick="deleteProduct(${p.id})" class="text-red-500 bg-red-500/10 p-2 rounded-lg text-xs w-8 h-8 flex items-center justify-center">✕</button>
        </div>
    `).join('');
}

function addNewProduct() {
    // SEMAKAN PAKEJ: Had 5 produk untuk Basic
    if (currentPlan === 'BASIC' && products.length >= 5) {
        alert("Had maksimum 5 produk dicapai untuk Pakej Basic.\nSila naik taraf ke Pro/Premium/Legend untuk produk tanpa had.");
        openPricing();
        return;
    }

    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const qty = parseInt(document.getElementById('p-qty').value);
    const imgInput = document.getElementById('p-img');
    
    if (!name || isNaN(price)) return alert("Sila isi Nama & Harga!");
    
    const process = (img) => { 
        products.push({ id: Date.now(), name, price, qty: qty || 0, img }); 
        saveData(); 
        renderAll(); 
        clearInputs(); 
        alert("Produk berjaya ditambah!");
    };
    
    if (imgInput.files && imgInput.files[0]) { 
        const r = new FileReader(); 
        r.onload = (e) => process(e.target.result); 
        r.readAsDataURL(imgInput.files[0]); 
    } else {
        process("https://via.placeholder.com/150/4D30FF/FFFFFF?text=Ketick");
    }
}

function deleteProduct(id) { 
    if(confirm("Hapus produk ini?")) { 
        products = products.filter(p => p.id !== id); 
        saveData(); 
        renderAll(); 
    } 
}

function addToCart(id) { 
    const p = products.find(p => p.id === id); 
    if (p.qty <= 0) return alert("Habis stok!"); 
    cart.push({ ...p, cartId: Date.now() }); 
    renderCart(); 
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    
    if (cart.length === 0) {
        container.innerHTML = `<p class="opacity-50 text-xs italic text-center py-6">Troli kosong...</p>`;
    } else { 
        container.innerHTML = cart.map((item, i) => { 
            total += item.price; 
            return `
            <div class="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                <div class="w-4/5 truncate">
                    <p class="text-xs font-semibold truncate">${item.name}</p>
                    <p class="text-[10px] text-accent">RM ${item.price.toFixed(2)}</p>
                </div>
                <button onclick="removeFromCart(${i})" class="text-xs opacity-50 hover:text-red-500 w-6 h-6 flex justify-center items-center">✕</button>
            </div>`; 
        }).join('');
    }
    document.getElementById('total-price').innerText = `RM ${total.toFixed(2)}`;
}

function removeFromCart(i) { cart.splice(i, 1); renderCart(); }
function cancelBill() { if (cart.length > 0 && confirm("Batalkan bil ini?")) { cart = []; renderCart(); } }
function saveData() { localStorage.setItem('ketick_products', JSON.stringify(products)); localStorage.setItem('ketick_bill_no', nextBillNo.toString()); }
function updateBillDisplay() { if(document.getElementById('next-bill-no-display')) document.getElementById('next-bill-no-display').innerText = `#${nextBillNo}`; }
function clearInputs() { document.querySelectorAll('input:not([type="file"]), textarea').forEach(i => i.value = ''); document.getElementById('p-img').value = ''; }

// Mulakan sistem
renderAll();
