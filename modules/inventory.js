export const InventoryModule = {
    getProducts: function() {
        return JSON.parse(localStorage.getItem('ketick_products')) || [];
    },
    saveProducts: function(products) {
        localStorage.setItem('ketick_products', JSON.stringify(products));
    },
    addProduct: function(product, planConfig, callback) {
        let products = this.getProducts();
        
        // Pengehadan Pakej (Gatekeeper)
        if (planConfig && planConfig.maxProducts !== Infinity && products.length >= planConfig.maxProducts) {
            window.KetickModal.alert(`Pakej terhad kepada ${planConfig.maxProducts} produk sahaja. Sila naik taraf pakej.`);
            return;
        }
        
        product.id = Date.now();
        products.push(product);
        this.saveProducts(products);
        if (callback) callback();
    },
    renderList: function(containerId) {
        const container = document.getElementById(containerId);
        if(!container) return;
        const products = this.getProducts();

        // UX: Empty State SVG (Sama macam modul LHDN)
        if (products.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-10 opacity-30">
                    <svg class="w-14 h-14 text-indigo mb-3 drop-shadow-[0_0_10px_rgba(79,70,229,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                    </svg>
                    <p class="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Tiada Rekod Inventori</p>
                </div>`;
            return;
        }

        // Render senarai stok dengan butang Edit & Padam
        container.innerHTML = products.map(p => `
            <div class="bg-darkCard p-3 rounded-xl border border-darkBorder mb-2 flex gap-3 shadow-sm items-center">
                <img src="${p.img}" class="w-12 h-12 rounded-lg object-cover border border-darkBorder">
                <div class="flex-1">
                    <div class="font-bold text-xs text-white">${p.name}</div>
                    <div class="text-[10px] text-lime font-mono mt-1">RM ${parseFloat(p.price).toFixed(2)}</div>
                </div>
                <div class="text-right flex flex-col items-end gap-2">
                    <div class="text-[10px] font-bold font-mono ${p.qty > 5 ? 'text-gray-400' : 'text-orange bg-orange/10 px-2 py-0.5 rounded'}">${p.qty} unit</div>
                    <div class="flex gap-2">
                        <button onclick="window.editInventory(${p.id})" class="text-[8px] bg-[#2A2A2A] text-white px-3 py-1 rounded hover:bg-[#333] transition uppercase tracking-widest shadow-sm">Edit</button>
                        <button onclick="window.deleteInventoryProduct(${p.id})" class="text-[8px] text-orange hover:text-red-500 transition uppercase tracking-widest px-2 py-1">Padam</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
};
