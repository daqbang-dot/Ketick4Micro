import { InventoryModule } from './inventory.js';

export const POSModule = {
    cart: [],
    nextBillNo: parseInt(localStorage.getItem('ketick_bill_no')) || 1001,

    addToCart: (productId) => {
        const products = InventoryModule.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        if (product.qty <= 0) return alert("Stok habis untuk produk ini!");
        
        POSModule.cart.push({ ...product, cartId: Date.now() });
        POSModule.renderCart('cart-items', 'total-price');
    },

    removeFromCart: (index) => {
        POSModule.cart.splice(index, 1);
        POSModule.renderCart('cart-items', 'total-price');
    },

    clearCart: () => {
        POSModule.cart = [];
        POSModule.renderCart('cart-items', 'total-price');
    },

    incrementBillNo: () => {
        POSModule.nextBillNo++;
        localStorage.setItem('ketick_bill_no', POSModule.nextBillNo.toString());
        const display = document.getElementById('next-bill-no-display');
        if(display) display.innerText = `#${POSModule.nextBillNo}`;
    },

    // Render butang produk di tab POS
    renderPOSSelect: (containerId) => {
        const container = document.getElementById(containerId);
        if(!container) return;
        
        const products = InventoryModule.getProducts();
        container.innerHTML = products.map(p => `
            <button data-id="${p.id}" class="pos-item-btn bg-white/5 border border-white/10 p-2 text-[10px] flex flex-col items-center justify-center h-20 active:scale-95 transition rounded-xl">
                <div class="w-8 h-8 bg-black/50 rounded-full mb-1 overflow-hidden">
                    <img src="${p.img}" class="w-full h-full object-cover">
                </div>
                <span class="truncate w-full text-center leading-tight">${p.name}</span>
            </button>
        `).join('');

        // Event listener untuk setiap butang
        container.querySelectorAll('.pos-item-btn').forEach(btn => {
            btn.onclick = () => POSModule.addToCart(parseInt(btn.getAttribute('data-id')));
        });
    },

    // Render senarai barang dalam troli
    renderCart: (containerId, totalId) => {
        const container = document.getElementById(containerId);
        const totalDisplay = document.getElementById(totalId);
        if(!container || !totalDisplay) return;

        let total = 0;
        if (POSModule.cart.length === 0) {
            container.innerHTML = `<p class="opacity-50 text-xs italic text-center py-6">Troli kosong...</p>`;
        } else {
            container.innerHTML = POSModule.cart.map((item, i) => {
                total += item.price;
                return `
                <div class="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5 mb-2">
                    <div class="w-4/5 truncate">
                        <p class="text-xs font-semibold truncate">${item.name}</p>
                        <p class="text-[10px] text-purple-400">RM ${item.price.toFixed(2)}</p>
                    </div>
                    <button class="remove-cart-btn text-xs opacity-50 hover:text-red-500 w-6 h-6" data-index="${i}">✕</button>
                </div>`;
            }).join('');

            container.querySelectorAll('.remove-cart-btn').forEach(btn => {
                btn.onclick = () => POSModule.removeFromCart(parseInt(btn.getAttribute('data-index')));
            });
        }
        totalDisplay.innerText = `RM ${total.toFixed(2)}`;
    }
};
