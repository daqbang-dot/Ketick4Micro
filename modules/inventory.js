export const InventoryModule = {
    getProducts: () => JSON.parse(localStorage.getItem('ketick_inventory')) || [],
    saveProducts: (products) => localStorage.setItem('ketick_inventory', JSON.stringify(products)),

    addProduct: (productData, planConfig, onSuccess) => {
        const products = InventoryModule.getProducts();
        
        if (!planConfig.canAddUnlimitedProducts && products.length >= planConfig.maxProducts) {
            alert(`Pakej ${planConfig.planName} hanya membenarkan maksimum ${planConfig.maxProducts} produk. Sila naik taraf pakej.`);
            return;
        }

        const newProduct = {
            id: Date.now(),
            name: productData.name,
            desc: productData.desc || '', // Tambahan Description
            price: parseFloat(productData.price),
            qty: parseInt(productData.qty),
            img: productData.img || 'https://via.placeholder.com/150'
        };

        products.push(newProduct);
        InventoryModule.saveProducts(products);
        onSuccess();
    },

    deleteProduct: (id) => {
        let products = InventoryModule.getProducts();
        products = products.filter(p => p.id !== id);
        InventoryModule.saveProducts(products);
    },

    renderList: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const products = InventoryModule.getProducts();
        if (products.length === 0) {
            container.innerHTML = `<div class="text-center py-10 opacity-30 text-xs italic">Tiada produk. Sila tambah stok.</div>`;
            return;
        }

        container.innerHTML = products.map(p => `
            <div class="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-3 rounded-2xl flex gap-4 items-center mb-3 shadow-sm dark:shadow-none transition-all">
                <img src="${p.img}" class="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-white/10">
                <div class="flex-1">
                    <h3 class="font-bold text-sm text-slate-800 dark:text-white">${p.name}</h3>
                    ${p.desc ? `<p class="text-[9px] text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1">${p.desc}</p>` : ''}
                    <div class="text-xs text-blue-600 dark:text-purple-400 font-bold mt-1">RM ${p.price.toFixed(2)}</div>
                </div>
                <div class="text-center">
                    <div class="text-[10px] font-bold bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-lg ${p.qty <= 5 ? 'text-red-500' : 'text-slate-700 dark:text-white'}">
                        ${p.qty} unit
                    </div>
                    <button onclick="if(confirm('Padam produk ini?')){ InventoryModule.deleteProduct(${p.id}); refreshAllUI(); }" class="text-[10px] text-red-500 mt-2 opacity-70 hover:opacity-100">Padam</button>
                </div>
            </div>
        `).join('');
    }
};
