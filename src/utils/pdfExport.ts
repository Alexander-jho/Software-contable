import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { COMPANY_INFO } from '../constants';
import { format } from 'date-fns';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const exportDashboardPDF = (data: {
  inventory: any[];
  movements: any[];
  totalCashIn: number;
  totalCashOut: number;
}) => {
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');

  // Header - Industrial Style
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, 210, 40, 'F');
  
  if (COMPANY_INFO.logoUrl) {
    try {
      // Intentamos añadir logo si existe. Ajustamos posición del texto si hay logo.
      doc.addImage(COMPANY_INFO.logoUrl, 'PNG', 10, 5, 30, 30);
    } catch (e) {
      console.error("Error al cargar logo en PDF", e);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_INFO.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_INFO.slogan.toUpperCase(), 105, 28, { align: 'center' });
  doc.text(`NIT: ${COMPANY_INFO.nit} | TEL: ${COMPANY_INFO.tel} | GERENTE: ${COMPANY_INFO.manager}`, 105, 34, { align: 'center' });
  
  // Report Title
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORME TÉCNICO DE GESTIÓN OPERATIVA', 20, 55);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`ID_REPORTE: ${format(new Date(), 'yyyyMMddHHmm')}`, 150, 52);
  doc.text(`FECHA DE EMISIÓN: ${dateStr}`, 150, 57);

  // Financial Summary Section
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(20, 62, 190, 62);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. RESUMEN FLUJO DE CAJA', 20, 72);
  
  const balance = data.totalCashIn - data.totalCashOut;
  
  doc.autoTable({
    startY: 77,
    head: [['CONCEPTO', 'VALOR ACUMULADO']],
    body: [
      ['INGRESOS TOTALES (VENTAS)', `$${data.totalCashIn.toLocaleString()}`],
      ['EGRESOS TOTALES (COMPRAS/SERV)', `$${data.totalCashOut.toLocaleString()}`],
      ['BALANCE NETO DISPONIBLE', `$${balance.toLocaleString()}`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [60, 60, 60] },
    margin: { left: 20, right: 20 }
  });

  // Inventory Table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. ESTADO DE EXISTENCIAS (ALMACÉN)', 20, (doc as any).lastAutoTable.finalY + 15);
  
  const tableData = data.inventory.map(item => [
    item.name.toUpperCase(),
    `${item.qty} ${item.unit.toUpperCase()}`,
    item.qty < 10 ? 'REPOSICIÓN INMEDIATA' : 'STOCK SEGURO'
  ]);

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['PRODUCTO', 'CANTIDAD ACTUAL', 'ESTADO CRÍTICO']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [242, 125, 38] }, // Orange accent
    styles: { fontSize: 8 },
    margin: { left: 20, right: 20 }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount} | Documento generado automáticamente por Sistema QUE POLLO ERP`, 105, 290, { align: 'center' });
  }

  doc.save(`REPORTE_GENERAL_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportInvoicePDF = (transaction: any) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 150] // Compact thermal format
  });

  // Header
  if (COMPANY_INFO.logoUrl) {
    try {
      doc.addImage(COMPANY_INFO.logoUrl, 'PNG', 32, 2, 16, 16);
    } catch (e) {
      console.error("Error logo ticket", e);
    }
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_INFO.name, 40, COMPANY_INFO.logoUrl ? 22 : 10, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_INFO.slogan, 40, COMPANY_INFO.logoUrl ? 26 : 14, { align: 'center' });
  doc.text(`TEL: ${COMPANY_INFO.tel} | NIT: ${COMPANY_INFO.nit}`, 40, COMPANY_INFO.logoUrl ? 30 : 18, { align: 'center' });
  
  doc.text('------------------------------------------------', 40, COMPANY_INFO.logoUrl ? 35 : 23, { align: 'center' });
  
  // Transaction Info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const typeText = transaction.type === 'SALE' ? 'COMPROBANTE DE VENTA' : 'REGISTRO DE ADQUISICIÓN';
  doc.text(typeText, 40, COMPANY_INFO.logoUrl ? 40 : 28, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`FECHA: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 5, COMPANY_INFO.logoUrl ? 47 : 35);
  doc.text(`REF: #${transaction.id.slice(-8).toUpperCase()}`, 5, COMPANY_INFO.logoUrl ? 51 : 39);
  
  doc.text('------------------------------------------------', 40, COMPANY_INFO.logoUrl ? 56 : 44, { align: 'center' });

  // Detail
  doc.text('DETALLE / CONCEPTO', 5, 49);
  doc.text('VALOR', 75, 49, { align: 'right' });
  
  doc.setFontSize(7);
  const desc = transaction.description || `Transacción de ${transaction.type}`;
  const splitDesc = doc.splitTextToSize(desc.toUpperCase(), 70);
  doc.text(splitDesc, 5, 54);
  
  const yPos = 54 + (splitDesc.length * 4);

  // Total
  doc.text('------------------------------------------------', 40, yPos + 2, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 5, yPos + 10);
  doc.text(`$${transaction.total.toLocaleString()}`, 75, yPos + 10, { align: 'right' });

  // Footer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('GERENTE: ' + COMPANY_INFO.manager, 40, yPos + 20, { align: 'center' });
  doc.text('¡GRACIAS POR SU PREFERENCIA!', 40, yPos + 25, { align: 'center' });
  doc.text('SISTEMA ERP INDUSTRIAL v1.0', 40, yPos + 30, { align: 'center' });

  doc.save(`FACTURA_${transaction.id.slice(-8)}.pdf`);
};
