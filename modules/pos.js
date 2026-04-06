import { InventoryModule } from './inventory.js';
import { CRMModule } from './crm.js';
import { KuponModule } from './kupon.js';

export const POSModule = {
    cart: [],
    nextBillNo: parseInt(localStorage.getItem('ketick_bill_no')) || 1001,
    
    // State Transaksi Semasa
    currentCustomer: null,
    currentPaymentMethod: 'TUNAI',
    currentDiscount: 0,
    appliedKupon: null,

    setCustomerByPhone: (phone, nameInputId) => {
        const customer = CRMModule.searchCustomer(phone);
        if (customer) {
            POSModule.currentCustomer = customer;
            document.getElementById(nameInputId).value = customer.name; // Auto-fill
            return true;
        }
        POSModule.currentCustomer = null;
        return false;
    },

    setPaymentMethod: (method) => {
        POSModule.currentPaymentMethod = method;
    },

    applyKupon: (code) => {
        const total = POSModule.cart.reduce((sum, item) => sum + item.price, 0);
        const result = KuponModule.verifyKupon(code, total);
        if(result.valid) {
            POSModule.currentDiscount = result.discount;
            POSModule.appliedKupon = code;
            alert(`Kupon disahkan! Diskaun RM${result.discount.toFixed(2)}`);
            POSModule.renderCart('cart-items', 'total-price');
        } else {
            alert(result.msg);
        }
    },

    addToCart: (productId) => {
        const products = InventoryModule.getProducts();
        const product = products.find(p => p.id === productId);
        if (!product || product.qty <= 0) return alert("Stok habis!");
        POSModule.cart.push({ ...product, cartId: Date.now() });
        POSModule.renderCart('cart-items', 'total-price');
    },

    removeFromCart: (index) => {
        POSModule.cart.splice(index, 1);
        POSModule.renderCart('cart-items', 'total-price');
    },

    clearCart: () => {
        POSModule.cart = [];
        POSModule.currentCustomer = null;
        POSModule.currentDiscount = 0;
        POSModule.appliedKupon = null;
        POSModule.renderCart('cart-items', 'total-price');
    },

    incrementBillNo: () => {
        POSModule.nextBillNo++;
        localStorage.setItem('ketick_bill_no', POSModule.nextBillNo.toString());
    },

    renderPOSSelect: (containerId) => {
        const container = document.getElementById(containerId);
        if(!container) return;
        const products = InventoryModule.getProducts();
        container.innerHTML = products.map(p => `
            <button data-id="${p.id}" class="pos-item-btn bg-white/5 border border-white/10 p-2 text-[10px] flex flex-col items-center justify-center h-20 active:scale-95 transition rounded-xl relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <img src="${p.img}" class="absolute inset-0 w-full h-full object-cover opacity-50 z-0">
                <span class="z-20 truncate w-full text-center font-bold">${p.name}</span>
                <span class="z-20 text-[8px] text-purple-300">RM${p.price.toFixed(2)}</span>
            </button>
        `).join('');

        container.querySelectorAll('.pos-item-btn').forEach(btn => {
            btn.onclick = () => POSModule.addToCart(parseInt(btn.getAttribute('data-id')));
        });
    },

    renderCart: (containerId, totalId) => {
        const container = document.getElementById(containerId);
        const totalDisplay = document.getElementById(totalId);
        if(!container || !totalDisplay) return;

        let subtotal = 0;
        if (POSModule.cart.length === 0) {
            container.innerHTML = `<p class="opacity-50 text-xs italic text-center py-6">Troli kosong...</p>`;
        } else {
            container.innerHTML = POSModule.cart.map((item, i) => {
                subtotal += item.price;
                return `
                <div class="flex justify-between items-center bg-black/40 p-2 rounded-xl border border-white/5 mb-2">
                    <div class="w-4/5 truncate">
                        <p class="text-xs font-bold text-white truncate">${item.name}</p>
                        <p class="text-[10px] text-purple-400">RM ${item.price.toFixed(2)}</p>
                    </div>
                    <button class="remove-cart-btn text-xs text-red-500 bg-red-500/10 w-6 h-6 rounded-md flex items-center justify-center" data-index="${i}">✕</button>
                </div>`;
            }).join('');
            
            container.querySelectorAll('.remove-cart-btn').forEach(btn => {
                btn.onclick = () => POSModule.removeFromCart(parseInt(btn.getAttribute('data-index')));
            });
        }
        
        let grandTotal = subtotal - POSModule.currentDiscount;
        if(grandTotal < 0) grandTotal = 0;
        
        totalDisplay.innerHTML = `
            <div class="text-xs text-gray-400 font-normal">Subtotal: RM ${subtotal.toFixed(2)}</div>
            ${POSModule.currentDiscount > 0 ? `<div class="text-xs text-green-400 font-normal">Diskaun: -RM ${POSModule.currentDiscount.toFixed(2)}</div>` : ''}
            <div class="text-xl font-bold mt-1">RM ${grandTotal.toFixed(2)}</div>
        `;
    }
};
