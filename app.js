// Konfigurasi Awal & Muat Turun Data dari LocalStorage
let products = JSON.parse(localStorage.getItem('ketick_products')) || [
    { id: 1, name: "Sample Item", price: 10.00, qty: 5, desc: "Contoh produk", img: "https://via.placeholder.com/150/4D30FF/FFFFFF?text=Ketick" }
];
let nextBillNo = parseInt(localStorage.getItem('ketick_bill_no')) || 1001;
let cart = [];

// --- FUNGSI UTAMA: RENDER KATALOG ---
function renderCatalog() {
    const catalog = document.getElementById('catalog');
    if (products.length === 0) {
        catalog.innerHTML = `<p class="col-span-full text-gray-600 italic">No products available. Add some below.</p>`;
        return;
    }
    
    catalog.innerHTML = products.map(p => `
        <div class="glass-card p-4 flex flex-col items-center border-gray-800 hover:border-purple-500/50 transition cursor-default">
            <img src="${p.img}" class="w-full h-32 object-cover rounded-xl mb-3 shadow-inner bg-black">
            <h3 class="font-bold text-sm w-full truncate text-center">${p.name}</h3>
            <p class="text-pink-400 font-bold">RM ${p.price.toFixed(2)}</p>
            <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Stock: ${p.qty}</p>
            <button onclick="addToCart(${p.id})" class="mt-3 w-full py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg text-xs font-bold transition">
                ADD TO BILL
            </button>
        </div>
    `).join('');
}

// --- FUNGSI STOK: TAMBAH PRODUK BARU ---
function addNewProduct() {
    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const qty = parseInt(document.getElementById('p-qty').value);
    const desc = document.getElementById('p-desc').value;
    const imgInput = document.getElementById('p-img');

    if (!name || isNaN(price)) return alert("Sila isi Nama dan Harga!");

    const processUpload = (imageSrc) => {
        const newProduct = {
            id: Date.now(),
            name,
            price,
            qty: qty || 0,
            desc: desc || "",
            img: imageSrc
        };
        products.push(newProduct);
        saveData();
        renderCatalog();
        clearInputs();
    };

    if (imgInput.files && imgInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => processUpload(e.target.result);
        reader.readAsDataURL(imgInput.files[0]);
    } else {
        processUpload("https://via.placeholder.com/150/4D30FF/FFFFFF?text=No+Image");
    }
}

// --- FUNGSI TRANSAKSI (POS LOGIC) ---
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product.qty <= 0) return alert("Maaf, stok habis!");
    
    // Untuk POS ringkas, kita tambah item satu-satu
    cart.push({ ...product, cartId: Date.now() });
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    
    if (cart.length === 0) {
        container.innerHTML = `<p class="text-gray-500 text-sm italic text-center py-10">No items selected...</p>`;
    } else {
        container.innerHTML = cart.map((item, index) => {
            total += item.price;
            return `
                <div class="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <div>
                        <p class="text-sm font-semibold">${item.name}</p>
                        <p class="text-xs text-pink-400">RM ${item.price.toFixed(2)}</p>
                    </div>
                    <button onclick="removeFromCart(${index})" class="text-gray-500 hover:text-red-500">×</button>
                </div>
            `;
        }).join('');
    }
    document.getElementById('total-price').innerText = `RM ${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function processTransaction(type) {
    if (cart.length === 0) return alert("Sila tambah barang dahulu!");

    if (type === 'RECEIPT') {
        // Logik: Hanya Receipt tolak stok
        cart.forEach(item => {
            let p = products.find(prod => prod.id === item.id);
            if (p) p.qty -= 1; 
        });
        alert(`RESIT #${nextBillNo} BERJAYA.\nStok telah ditolak.`);
        nextBillNo++; // Nombor bil meningkat
    } else {
        // Quotation/Invoice: Tidak tolak stok & Nombor bil kekal (Rollback logic)
        alert(`${type} #${nextBillNo} dihasilkan.\nStok TIDAK ditolak.`);
    }

    cart = [];
    saveData();
    renderCatalog();
    renderCart();
    updateBillDisplay();
}

function cancelBill() {
    if (cart.length > 0 && confirm("Batalkan transaksi? No #${nextBillNo} akan dikekalkan.")) {
        cart = [];
        renderCart();
    }
}

// --- FUNGSI PEMBANTU ---
function saveData() {
    localStorage.setItem('ketick_products', JSON.stringify(products));
    localStorage.setItem('ketick_bill_no', nextBillNo.toString());
}

function updateBillDisplay() {
    document.getElementById('next-bill-no').innerText = `#${nextBillNo}`;
}

function clearInputs() {
    document.querySelectorAll('input, textarea').forEach(i => i.value = '');
}

// Jalankan sistem
renderCatalog();
updateBillDisplay();
