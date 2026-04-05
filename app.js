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
    document.getElementById(btnId).classList.add('active-tab');
    
    renderAll(); 
}

// --- KONFIGURASI DATA ---
let products = JSON.parse(localStorage.getItem('ketick_products')) || [
    { id: 1, name: "Sample Item", price: 10.00, qty: 5, desc: "Contoh produk", img: "https://via.placeholder.com/150/4D30FF/FFFFFF?text=Ketick" }
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

    doc.setFontSize(22);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("KETICK4MICRO", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Jenis Dokumen: ${type}`, 14, 30);
    doc.text(`No. Rujukan: #${billNo}`, 14, 35);
    doc.text(`Tarikh: ${date}`, 14, 40);

    const tableData = items.map((item, index) => [
        index + 1, item.name, `1`, `RM ${item.price.toFixed(2)}`, `RM ${item.price.toFixed(2)}`
    ]);

    doc.autoTable({
        startY: 50,
        head: [['No', 'Produk', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        headStyles: { fillColor: accentColor },
        theme: 'striped'
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12); doc.setTextColor(0); doc.setFont("helvetica", "bold");
    doc.text(`TOTAL AMOUNT: RM ${total.toFixed(2)}`, 140, finalY);

    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(150);
    doc.text(type === 'QUOTATION' ? "* Valid for 30 days." : "* Thank you for your business.", 14, finalY + 20);

    doc.save(`KETICK_${type}_${billNo}.pdf`);
}

// --- FUNGSI TRANSAKSI ---
function processTransaction(type) {
    if (cart.length === 0) return alert("Cart is empty!");
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const itemsCopy = [...cart];
    const currentBill = nextBillNo;

    if (type === 'RECEIPT') {
        cart.forEach(item => {
            let p = products.find(prod => prod.id === item.id);
            if (p) p.qty -= 1; 
        });
        generatePDF('RECEIPT', currentBill, itemsCopy, total);
        nextBillNo++;
    } else {
        generatePDF(type, currentBill, itemsCopy, total);
    }

    cart = [];
    saveData();
    renderAll();
}

// --- FUNGSI RENDER UTAMA ---
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
        <div class="glass-card p-3 text-center">
            <img src="${p.img}" class="w-full h-24 object-cover rounded-lg mb-2">
            <p class="text-xs font-bold truncate">${p.name}</p>
            <p class="text-accent text-sm">RM ${p.price.toFixed(2)}</p>
            <p class="text-[10px] opacity-50">Stock: ${p.qty}</p>
        </div>
    `).join('');
}

function renderPOSSelect() {
    const container = document.getElementById('pos-select-list');
    container.innerHTML = products.map(p => `
        <button onclick="addToCart(${p.id})" class="glass-card p-2 text-[10px] flex flex-col items-center hover:border-accent">
            <div class="w-10 h-10 bg-white/10 rounded-full mb-1 overflow-hidden">
                <img src="${p.img}" class="w-full h-full object-cover">
            </div>
            <span class="truncate w-full">${p.name}</span>
        </button>
    `).join('');
}

function renderInventory() {
    const container = document.getElementById('inventory-list');
    container.innerHTML = products.map(p => `
        <div class="glass-card p-4 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <img src="${p.img}" class="w-10 h-10 rounded-lg object-cover">
                <div>
                    <p class="font-bold text-sm">${p.name}</p>
                    <p class="text-xs opacity-50">RM ${p.price.toFixed(2)} | Stock: ${p.qty}</p>
                </div>
            </div>
            <button onclick="deleteProduct(${p.id})" class="text-red-500 p-2">🗑️</button>
        </div>
    `).join('');
}

// --- FUNGSI MANIPULASI DATA ---
function addNewProduct() {
    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const qty = parseInt(document.getElementById('p-qty').value);
    const imgInput = document.getElementById('p-img');
    
    if (!name || isNaN(price)) return alert("Isi Nama & Harga!");

    const process = (img) => {
        products.push({ id: Date.now(), name, price, qty: qty || 0, img });
        saveData(); renderAll(); clearInputs();
    };

    if (imgInput.files && imgInput.files[0]) {
        const r = new FileReader(); r.onload = (e) => process(e.target.result); r.readAsDataURL(imgInput.files[0]);
    } else process("https://via.placeholder.com/150/4D30FF/FFFFFF?text=Ketick");
}

function deleteProduct(id) {
    if(confirm("Hapus produk ini?")) {
        products = products.filter(p => p.id !== id);
        saveData(); renderAll();
    }
}

function addToCart(id) {
    const p = products.find(p => p.id === id);
    if (p.qty <= 0) return alert("Out of stock!");
    cart.push({ ...p }); renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    if (cart.length === 0) container.innerHTML = `<p class="opacity-50 text-sm italic text-center py-10">Empty...</p>`;
    else container.innerHTML = cart.map((item, i) => {
        total += item.price;
        return `<div class="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
            <div><p class="text-sm font-semibold">${item.name}</p><p class="text-xs text-accent">RM ${item.price.toFixed(2)}</p></div>
            <button onclick="removeFromCart(${i})" class="opacity-50 hover:text-red-500">×</button>
        </div>`;
    }).join('');
    document.getElementById('total-price').innerText = `RM ${total.toFixed(2)}`;
}

function removeFromCart(i) { cart.splice(i, 1); renderCart(); }
function cancelBill() { if (cart.length > 0 && confirm("Cancel?")) { cart = []; renderCart(); } }
function saveData() { localStorage.setItem('ketick_products', JSON.stringify(products)); localStorage.setItem('ketick_bill_no', nextBillNo.toString()); }
function updateBillDisplay() { document.getElementById('next-bill-no-display').innerText = `#${nextBillNo}`; }
function clearInputs() { document.querySelectorAll('input, textarea').forEach(i => i.value = ''); }

// Mula sistem
renderAll();
