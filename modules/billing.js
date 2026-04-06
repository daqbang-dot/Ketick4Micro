export const BillingModule = {
    getBizInfo: () => JSON.parse(localStorage.getItem('ketick_biz')) || { name: "KETICK", address: "-", phone: "-", bank: "-", accNo: "-", accName: "-", logo: "" },

    // Ditambah parameter 'customer' dan 'paymentMethod'
    generatePDF: (type, billNo, items, total, discount, customer, paymentMethod, planConfig) => {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) return alert("Ralat PDF.");
        
        const doc = new jsPDF();
        const bizInfo = BillingModule.getBizInfo();
        const accent = [128, 90, 213];

        if(bizInfo.logo && planConfig.canUploadLogo) { 
            try { doc.addImage(bizInfo.logo, 'PNG', 14, 10, 25, 25); } catch(e) {} 
        }

        doc.setFontSize(16); doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(bizInfo.name.toUpperCase(), 200, 20, { align: 'right' });
        
        doc.setFontSize(8); doc.setTextColor(100);
        doc.text(bizInfo.address, 200, 26, { align: 'right' });

        doc.setDrawColor(accent[0], accent[1], accent[2]);
        doc.line(14, 40, 200, 40);

        doc.setFontSize(12); doc.setTextColor(0);
        doc.text(`${type}: #${billNo}`, 14, 50);
        doc.setFontSize(9); 
        doc.text(`Tarikh: ${new Date().toLocaleString()}`, 14, 55);
        
        // Maklumat Pelanggan di PDF
        doc.text(`Pelanggan: ${customer ? customer.name : 'Tunai / Walk-in'}`, 14, 60);
        if(customer) doc.text(`No. Tel: ${customer.phone}`, 14, 65);
        
        doc.text(`Kaedah Bayaran: ${paymentMethod}`, 200, 60, { align: 'right' });

        const tableData = items.map((item, index) => [ index + 1, item.name, `1`, `RM ${item.price.toFixed(2)}`, `RM ${item.price.toFixed(2)}` ]);

        doc.autoTable({ startY: 75, head: [['No', 'Produk', 'Qty', 'Price', 'Total']], body: tableData, headStyles: { fillColor: accent } });

        const finalY = doc.lastAutoTable.finalY + 10;
        if(discount > 0) {
            doc.setFontSize(10); doc.setTextColor(200,0,0);
            doc.text(`Diskaun: -RM ${discount.toFixed(2)}`, 200, finalY, { align: 'right' });
        }
        doc.setFontSize(12); doc.setTextColor(0); doc.setFont("helvetica", "bold");
        doc.text(`JUMLAH: RM ${total.toFixed(2)}`, 200, finalY + 6, { align: 'right' });

        doc.save(`KETICK_${type}_${billNo}.pdf`);
    }
};
