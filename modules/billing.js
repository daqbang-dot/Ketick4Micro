export const BillingModule = {
    getBizInfo: () => {
        return JSON.parse(localStorage.getItem('ketick_biz')) || {
            name: "KETICK BUSINESS", address: "Sila kemaskini di Settings", phone: "-",
            bank: "-", accNo: "-", accName: "-", logo: "" 
        };
    },

    generatePDF: (type, billNo, items, total, planConfig) => {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) return alert("Ralat: Pustaka PDF gagal dimuatkan.");
        
        const doc = new jsPDF();
        const date = new Date().toLocaleString();
        const bizInfo = BillingModule.getBizInfo();
        const accentColor = [128, 90, 213]; // Tema ungu cosmic

        // Semak jika pelan membenarkan logo
        if(bizInfo.logo && planConfig.canUploadLogo) { 
            try { doc.addImage(bizInfo.logo, 'PNG', 14, 10, 25, 25); } catch(e) {} 
        }

        doc.setFontSize(16); doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(bizInfo.name.toUpperCase(), 200, 20, { align: 'right' });
        
        doc.setFontSize(8); doc.setTextColor(100);
        doc.text(bizInfo.address, 200, 26, { align: 'right' });
        doc.text(`Phone: ${bizInfo.phone}`, 200, 30, { align: 'right' });

        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.line(14, 40, 200, 40);

        doc.setFontSize(12); doc.setTextColor(0);
        doc.text(`${type}: #${billNo}`, 14, 50);
        doc.setFontSize(9); doc.text(`Tarikh: ${date}`, 14, 55);

        const tableData = items.map((item, index) => [
            index + 1, item.name, `1`, `RM ${item.price.toFixed(2)}`, `RM ${item.price.toFixed(2)}`
        ]);

        doc.autoTable({ 
            startY: 60, 
            head: [['No', 'Produk', 'Qty', 'Price', 'Total']], 
            body: tableData, 
            headStyles: { fillColor: accentColor } 
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(12); doc.setFont("helvetica", "bold");
        doc.text(`TOTAL: RM ${total.toFixed(2)}`, 200, finalY, { align: 'right' });

        doc.setFontSize(10); doc.text("PAYMENT INFO:", 14, finalY);
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        doc.text(`Bank: ${bizInfo.bank} | Acc: ${bizInfo.accNo}`, 14, finalY + 6);
        doc.text(`Name: ${bizInfo.accName}`, 14, finalY + 11);

        // Semak watermark berdasarkan pelan (Legend tiada watermark)
        if (planConfig.hasWatermark) {
            doc.setFontSize(8); doc.setTextColor(150, 0, 0);
            doc.text("Dijana secara percuma oleh KETICK4MICRO - Sila naik taraf", 105, 290, { align: 'center' });
        }

        doc.save(`KETICK_${type}_${billNo}.pdf`);

        // Semak fungsi khas WhatsApp (Eksklusif Legend)
        if (planConfig.enableWhatsAppReceipt && type === 'RECEIPT') {
            setTimeout(() => {
                if (confirm("Resit berjaya dijana! Hantar butiran terus ke WhatsApp pelanggan?")) {
                    let phoneNum = prompt("Sila masukkan nombor telefon pelanggan (Contoh: 60123456789):");
                    if (phoneNum) {
                        let text = `Terima kasih atas pembelian anda dari ${bizInfo.name}!\n\nNo Resit: #${billNo}\nJumlah: RM${total.toFixed(2)}\n\nSila simpan PDF resit yang telah diberikan.`;
                        window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`, '_blank');
                    }
                }
            }, 500);
        }
    }
};
