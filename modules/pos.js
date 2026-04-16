import { InventoryModule } from './inventory.js';

export const POSModule = {
    cart: [],
    nextBillNo: parseInt(localStorage.getItem('ketick_bill_no')) || 1001,
    appliedKupon: null,
    currentDiscount: 0,

    incrementBillNo: function() {
        this.nextBillNo++;
        localStorage.setItem('ketick_bill_no', this.nextBillNo);
    },

    clearCart: function() {
        this.cart = [];
        this.appliedKupon = null;
        this.currentDiscount = 0;
    },

    renderPOSSelect: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const products = InventoryModule.getProducts();

        // Kalau tiada stok langsung
        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 flex flex-col items-center justify-center py-6 opacity-30">
                    <p class="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Tiada Produk Dalam Stok</p>
                </div>`;
            return;
        }

        // Render butang produk
        container.innerHTML = products.map(p => {
            const isOutOfStock = p.qty <= 0;
            return `
            <button 
                onclick="window.addToCart(${p.id})" 
                class="pos-item-btn flex flex-col items-center justify-center bg-darkCard border ${isOutOfStock ? 'border-red-500/30 opacity-50' : 'border-[#2A2A2A] hover:border-primary'} p-2 rounded-xl transition shadow-sm active:scale-95"
                ${isOutOfStock ? 'disabled' : ''}
            >
                <img src="${p.img}" class="w-10 h-10 rounded object-cover mb-2 border border-[#2A2A2A]">
                <div class="text-[9px] font-bold text-white truncate w-full text-center">${p.name}</div>
                <div class="text-[10px] font-mono ${isOutOfStock ? 'text-red-500' : 'text-lime'} mt-1">RM ${parseFloat(p.price).toFixed(2)}</div>
                <div class="text-[8px] ${isOutOfStock ? 'text-red-500 font-bold' : 'text-gray-500'} mt-1">${isOutOfStock ? 'HABIS STOK' : p.qty + ' unit'}</div>
            </button>
        `}).join('');
    },

    renderCart: function(containerId, totalId) {
        const container = document.getElementById(containerId);
        const totalContainer = document.getElementById(totalId);
        if (!container || !totalContainer) return;

        if (this.cart.length === 0) {
            container.innerHTML = `<div class="text-center text-[10px] text-gray-500 py-4 uppercase tracking-widest border-2 border-dashed border-[#2A2A2A] rounded-xl">Troli Kosong</div>`;
            totalContainer.innerHTML = `<span class="text-xs uppercase tracking-widest opacity-70 font-bold">Total:</span><span class="text-2xl font-bold font-mono text-lime">RM 0.00</span>`;
            return;
        }

        container.innerHTML = this.cart.map((item, index) => `
            <div class="flex justify-between items-center bg-[#111] p-2 rounded-lg border border-[#2A2A2A] mb-1 shadow-sm">
                <div class="flex-1">
                    <div class="text-xs text-white font-bold">${item.name}</div>
                    <div class="text-[9px] text-lime font-mono">RM ${parseFloat(item.price).toFixed(2)}</div>
                </div>
                <button onclick="window.removeFromCart(${index})" class="text-orange text-xl hover:text-red-500 px-3 transition font-bold">&times;</button>
            </div>
        `).join('');

        let subtotal = this.cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
        let finalTotal = subtotal - this.currentDiscount;
        if (finalTotal < 0) finalTotal = 0;

        let totalHTML = `<span class="text-xs uppercase tracking-widest opacity-70 font-bold">Total:</span>`;
        if (this.currentDiscount > 0) {
            totalHTML = `<div class="text-right flex flex-col items-end">
                            <div class="text-[10px] text-orange line-through font-mono">RM ${subtotal.toFixed(2)}</div>
                            <div class="text-[10px] text-lime font-bold">Diskaun: -RM ${this.currentDiscount.toFixed(2)}</div>
                         </div>`;
        }

        totalContainer.innerHTML = `${totalHTML}<span class="text-2xl font-bold font-mono text-lime">RM ${finalTotal.toFixed(2)}</span>`;
    }
};
