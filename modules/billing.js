export const BillingModule = {
    generatePDF: function(type, billNo, items, total, discount, customer, paymentMethod, planConfig) {
        try {
            // 1. Semak jika library PDF ada (Perlukan internet untuk pertama kali)
            if (!window.jspdf) {
                alert("Ralat: Sistem gagal memuatkan fail PDF. Pastikan telefon anda ada sambungan internet semasa menekan butang ini.");
                return false;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ format: 'a5' }); // Guna saiz A5 supaya cantik kat phone

            // --- HEADER RESIT ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text(`KETICK - ${type}`, 105, 20, { align: "center" });
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`No. Bil: #${billNo}`, 14, 35);
            doc.text(`Tarikh: ${new Date().toLocaleString()}`, 14, 40);
            doc.text(`Kaedah: ${paymentMethod}`, 14, 45);
            
            if (customer && customer.name) {
                doc.text(`Pelanggan: ${customer.name}`, 14, 50);
            } else {
                doc.text(`Pelanggan: TUNAI (Walk-in)`, 14, 50);
            }

            // --- JADUAL BARANG (Guna AutoTable) ---
            const tableData = items.map((item, index) => [
                index + 1,
                item.name,
                "1", 
                `RM ${parseFloat(item.price).toFixed(2)}`
            ]);

            doc.autoTable({
                startY: 55,
                head: [['No', 'Item', 'Qty', 'Harga']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [79, 70, 229] } // Warna Indigo KETICK
            });

            // --- PENGIRAAN TOTAL ---
            let finalY = doc.lastAutoTable.finalY + 10;
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            
            let subtotal = total + discount;
            doc.text(`Subtotal: RM ${subtotal.toFixed(2)}`, 135, finalY);
            finalY += 6;

            if (discount > 0) {
                doc.setTextColor(255, 87, 34); // Warna Orange
                doc.text(`Diskaun: -RM ${discount.toFixed(2)}`, 135, finalY);
                doc.setTextColor(0, 0, 0); // Balik warna hitam
                finalY += 6;
            }

            doc.setFontSize(14);
            doc.text(`JUMLAH: RM ${total.toFixed(2)}`, 135, finalY);

            // --- FOOTER ---
            finalY += 20;
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.text("Terima kasih. Sila datang lagi!", 105, finalY, { align: "center" });
            doc.text("Dijana secara automatik oleh KETICK4MICRO", 105, finalY + 5, { align: "center" });

            // --- SAVE / DOWNLOAD PDF ---
            const fileName = `${type}_${billNo}.pdf`;
            doc.save(fileName);
            
            KetickModal.toast(`Selesai! ${fileName} dimuat turun.`);
            return true;

        } catch (error) {
            console.error("Ralat Generate PDF:", error);
            alert("Sistem ralat semasa mencipta PDF. Sila semak konsol Acode.");
            return false;
        }
    }
};
