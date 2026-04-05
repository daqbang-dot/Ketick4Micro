// Data Dummy / Database Emulator
let products = [
    { id: 1, name: "Cosmic Mouse", price: 150, qty: 10, img: "https://via.placeholder.com/150" },
    { id: 2, name: "Midnight Keyboard", price: 350, qty: 5, img: "https://via.placeholder.com/150" }
];

let cart = [];
let nextBillNo = 1001;

// 1. Render Catalog
function renderCatalog() {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = products.map(p => `
        <div class="glass-card p-4 text-center">
            <img src="${p.img}" class="rounded-lg mb-2 mx-auto">
            <h3 class="font-bold">${p.name}</h3>
            <p class="text-pink-400">RM ${p.price}</p>
            <p class="text-xs text-gray-400">Stock: ${p.qty}</p>
            <button onclick="addToCart(${p.id})" class="mt-3 text-xs bg-white text-black px-4 py-1 rounded-full font-bold hover:bg-pink-400">ADD</button>
        </div>
    `).join('');
}

// 2. Logik Auto-Increment & Rollback
function updateBillDisplay() {
    document.getElementById('next-bill-no').innerText = `#${nextBillNo}`;
}

function cancelBill() {
    if(cart.length > 0) {
        if(confirm("Cancel this bill? Number #${nextBillNo} will be reused.")) {
            cart = [];
            renderCart();
            // Logik: Nombor bil tidak berubah (Stay at 1001), 
            // maka ia seolah-olah di-rollback untuk kegunaan seterusnya.
        }
    }
}

// 3. Logik Penolakan Stok (Hanya pada Checkout/Receipt)
function checkout() {
    if(cart.length === 0) return alert("Cart is empty!");

    // Tolak stok secara rasmi
    cart.forEach(item => {
        let product = products.find(p => p.id === item.id);
        if(product) product.qty -= 1;
    });

    alert(`Receipt #${nextBillNo} Printed! Stock updated.`);
    
    // Increment No Bill untuk transaksi seterusnya
    nextBillNo++;
    cart = [];
    
    updateBillDisplay();
    renderCatalog();
    renderCart();
}

// Tambahan fungsi Cart
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if(product.qty <= 0) return alert("Out of stock!");
    cart.push(product);
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price;
        return `<div class="flex justify-between text-sm">
                    <span>${item.name}</span>
                    <span>RM ${item.price}</span>
                </div>`;
    }).join('');
    document.getElementById('total-price').innerText = `RM ${total.toFixed(2)}`;
}

// Init
renderCatalog();
updateBillDisplay();
