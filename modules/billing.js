import { SettingsModule } from './settings.js';

export const BillingModule = {
    generatePDF: function(type, billNo, items, total, discount, customer, paymentMethod, planConfig) {
        // Panggil library jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Ambil data kedai yang bos dah save kat Settings (termasuk logo)
        const bizInfo = SettingsModule.getBizInfo();

        // 1. HEADER (LOGO ATAU NAMA BISNES DI KANAN ATAS)
        if (planConfig.canUploadLogo && bizInfo.logo && !bizInfo.logo.includes('placeholder.com')) {
            try {
                // Letak gambar logo: addImage(imageData, format, x, y, width, height)
                doc.addImage(bizInfo.logo, 'JPEG', 160, 10, 35, 35);
            } catch(e) {
                console.log("Ralat render logo PDF:", e);
                // Kalau logo gagal load, kita letak nama bisnes je
                doc.setFontSize(20);
                doc.setTextColor(91, 123, 254); 
                doc.text(bizInfo.name || "KETICK", 195, 20, { align: "right" });
            }
        } else {
            doc.setFontSize(20);
            doc.setTextColor(91, 123, 254); // Warna Primary Ketick
            doc.text(bizInfo.name || "KETICK", 195, 20, { align: "right" });
        }

        // 2. MAKLUMAT SYARIKAT DI KIRI ATAS
        doc.setTextColor(0, 0, 0); // Warna hitam
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(bizInfo.name || "Syarikat Saya", 14, 20);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        if(bizInfo.address) {
            // Pecahkan alamat kalau panjang sangat
            const splitAddr = doc.splitTextToSize(bizInfo.address, 80);
            doc.text(splitAddr, 14, 26);
        }
        if(bizInfo.phone) doc.text(`Tel: ${bizInfo.phone}`, 14, 42);

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 48, 196, 48); // Garisan pemisah

        // 3. MAKLUMAT INVOIS / RESIT
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${type}: #${billNo}`, 14, 58);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Tarikh: ${new Date().toLocaleString()}`, 14, 64);
        doc.text(`Pelanggan: ${customer.name}`, 14, 70);
        doc.text(`No. Tel: ${customer.phone}`, 14, 76);
        
        doc.text(`Kaedah Bayaran: ${paymentMethod}`, 196, 64, { align: "right" });

        // 4. JADUAL ITEM (AUTO TABLE)
        const tableCol = ["No", "Produk", "Qty", "Harga (RM)", "Total (RM)"];
        const tableRows = [];

        // Himpunkan (Group) item yang sama kalau ada duplicate dalam troli
        const grouped = {};
        items.forEach(item => {
            if(grouped[item.name]) {
                grouped[item.name].qty += 1;
                grouped[item.name].total += item.price;
            } else {
                grouped[item.name] = { price: item.price, qty: 1, total: item.price };
            }
        });

        let index = 1;
        for (const [name, data] of Object.entries(grouped)) {
            tableRows.push([
                index++,
                name,
                data.qty,
                data.price.toFixed(2),
                data.total.toFixed(2)
            ]);
        }

        // Lukis jadual guna plugin AutoTable
        doc.autoTable({
            startY: 85,
            head: [tableCol],
            body: tableRows,
            theme: 'striped',
            styles: { fontSize: 9 },
            headStyles: { fillColor: [91, 123, 254] } // Warna kotak atas jadual
        });

        const finalY = doc.lastAutoTable.finalY + 10;

        // 5. BAHAGIAN JUMLAH (TOTAL) DI BAWAH JADUAL
        doc.setFontSize(10);
        if (discount > 0) {
            doc.text(`Subtotal: RM ${(total + discount).toFixed(2)}`, 196, finalY, { align: "right" });
            doc.setTextColor(239, 68, 68); // Warna merah untuk tolak diskaun
            doc.text(`Diskaun: -RM ${discount.toFixed(2)}`, 196, finalY + 6, { align: "right" });
            doc.setTextColor(0, 0, 0); // Reset hitam
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(`JUMLAH: RM ${total.toFixed(2)}`, 196, finalY + 14, { align: "right" });
        } else {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(`JUMLAH: RM ${total.toFixed(2)}`, 196, finalY, { align: "right" });
        }
        
        // 6. MAKLUMAT PEMBAYARAN (BANK)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        if(bizInfo.bank && bizInfo.accNo) {
            doc.text("Maklumat Pembayaran Bank:", 14, finalY);
            doc.setFont("helvetica", "bold");
            doc.text(`${bizInfo.bank}`, 14, finalY + 5);
            doc.setFont("helvetica", "normal");
            doc.text(`${bizInfo.accNo}`, 14, finalY + 10);
            doc.text(`${bizInfo.accName}`, 14, finalY + 15);
        }

        // 7. WATERMARK (GATEKEEPER PAKEJ)
        if (planConfig.hasWatermark) {
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Dijana secara percuma menggunakan KETICK4MICRO", 105, 285, null, null, "center");
        }

        // Download fail PDF terus ke peranti
        doc.save(`Resit_${billNo}.pdf`);
    }
};
