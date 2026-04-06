// Modul Inventory - Menguruskan Data & UI Stok
export const InventoryModule = {
    // Ambil data dari LocalStorage
    getProducts: () => {
        return JSON.parse(localStorage.getItem('ketick_products')) || [];
    },

    // Simpan data ke LocalStorage
    saveProducts: (products) => {
        localStorage.setItem('ketick_products', JSON.stringify(products));
    },

    // Tambah Produk Baru dengan semakan had pelan
    addProduct: (formData, planConfig, callback) => {
        const products = InventoryModule.getProducts();

        // Semak had produk berdasarkan pelan
        if (products.length >= planConfig.maxProducts) {
            alert(`Had produk dicapai! Pelan ${planConfig.planName} hanya membenarkan ${planConfig.maxProducts} produk.`);
            return false;
        }

        const newProduct = {
            id: Date.now(),
            name: formData.name,
            price: parseFloat(formData.price),
            qty: parseInt(formData.qty),
            img: formData.img || "https://via.placeholder.com/150/4D30FF/FFFFFF?text=No+Image"
        };

        products.push(newProduct);
        InventoryModule.saveProducts(products);
        if (callback) callback();
        return true;
    },

    // Hapus Produk
    deleteProduct: (id, callback) => {
        let products = InventoryModule.getProducts();
        products = products.filter(p => p.id !== id);
        InventoryModule.saveProducts(products);
        if (callback) callback();
    },

    // Render Senarai Inventory ke HTML
    renderList: (containerId) => {
        const container = document.getElementById(containerId);
        const products = InventoryModule.getProducts();

        if (products.length === 0) {
            container.innerHTML = `<div class="text-center py-10 opacity-30 text-xs italic">Tiada produk dalam inventory.</div>`;
            return;
        }

        container.innerHTML = products.map(p => `
            <div class="bg-white/5 border border-white/5 p-3 rounded-2xl flex justify-between items-center mb-2">
                <div class="flex items-center gap-3 w-4/5">
                    <img src="${p.img}" class="w-10 h-10 rounded-lg object-cover bg-black">
                    <div class="truncate">
                        <p class="font-bold text-xs truncate">${p.name}</p>
                        <p class="text-[10px] opacity-50">RM ${p.price.toFixed(2)} | Stok: ${p.qty}</p>
                    </div>
                </div>
                <button class="delete-btn text-red-500 bg-red-500/10 w-8 h-8 rounded-full flex items-center justify-center text-xs" data-id="${p.id}">✕</button>
            </div>
        `).join('');

        // Attach event listener secara dinamik untuk butang hapus
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-id'));
                if(confirm("Hapus produk ini?")) {
                    InventoryModule.deleteProduct(id, () => InventoryModule.renderList(containerId));
                }
            };
        });
    }
};
