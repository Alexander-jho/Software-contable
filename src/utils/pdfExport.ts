import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SettingsService } from '../services/settingsService';
import { format } from 'date-fns';

export const exportDashboardPDF = async (data: {
  inventory: any[];
  movements: any[];
  totalCashIn: number;
  totalCashOut: number;
}) => {
  const config = await SettingsService.get();
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');

  // Header - Industrial Style
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, 210, 40, 'F');
  
  if (config.logoUrl) {
    try {
      doc.addImage(config.logoUrl, 'JPEG', 10, 5, 30, 30);
    } catch (e) {
      console.error("Error al cargar logo en PDF", e);
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(config.name, 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(config.slogan.toUpperCase(), 105, 28, { align: 'center' });
  doc.text(`NIT: ${config.nit} | TEL: ${config.tel} | GERENTE: ${config.manager}`, 105, 34, { align: 'center' });
  
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
  
  autoTable(doc, {
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
  
  const inventoryData = data.inventory.map(item => [
    item.name.toUpperCase(),
    `${item.qty} ${item.unit.toUpperCase()}`,
    item.qty < 10 ? 'REPOSICIÓN INMEDIATA' : 'STOCK SEGURO'
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['PRODUCTO', 'CANTIDAD ACTUAL', 'ESTADO CRÍTICO']],
    body: inventoryData,
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
    doc.text(`Página ${i} de ${pageCount} | Generado por Sistema ${config.name}`, 105, 290, { align: 'center' });
  }

  doc.save(`REPORTE_GENERAL_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportInvoicePDF = async (transaction: any) => {
  const config = await SettingsService.get();
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 180]
  });

  let currentY = 10;

  // Header Logo
  if (config.logoUrl) {
    try {
      const logoSize = 25;
      const xPos = (80 - logoSize) / 2;
      doc.addImage(config.logoUrl, 'JPEG', xPos, 5, logoSize, logoSize, undefined, 'FAST');
      currentY = 32;
    } catch (e) {
      currentY = 10;
    }
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(config.name, 40, currentY, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  currentY += 5;
  doc.text(config.slogan, 40, currentY, { align: 'center' });
  currentY += 4;
  doc.text(`TEL: ${config.tel} | NIT: ${config.nit}`, 40, currentY, { align: 'center' });
  
  currentY += 5;
  doc.text('------------------------------------------------', 40, currentY, { align: 'center' });
  
  // Transaction Info
  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const typeText = transaction.type === 'SALE' ? 'COMPROBANTE DE VENTA' : 'REGISTRO DE ADQUISICIÓN';
  doc.text(typeText, 40, currentY, { align: 'center' });
  
  currentY += 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`FECHA: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 5, currentY);
  currentY += 4;
  doc.text(`REF: #${transaction.id.slice(-8).toUpperCase()}`, 5, currentY);
  
  currentY += 5;
  doc.text('------------------------------------------------', 40, currentY, { align: 'center' });

  // Detail
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE / CONCEPTO', 5, currentY);
  doc.text('VALOR', 75, currentY, { align: 'right' });
  
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const desc = transaction.description || `Operación de ${transaction.type}`;
  const splitDesc = doc.splitTextToSize(desc.toUpperCase(), 70);
  doc.text(splitDesc, 5, currentY);
  
  currentY += (splitDesc.length * 4) + 2;

  // Total
  doc.text('------------------------------------------------', 40, currentY, { align: 'center' });
  currentY += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 5, currentY);
  doc.text(`$${transaction.total.toLocaleString()}`, 75, currentY, { align: 'right' });

  // Footer
  currentY += 15;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('RESPONSABLE: ' + config.manager, 40, currentY, { align: 'center' });
  currentY += 4;
  doc.text('¡GRACIAS POR SU PREFERENCIA!', 40, currentY, { align: 'center' });
  currentY += 4;
  doc.text('SISTEMA DE GESTIÓN QUE POLLO v1.0', 40, currentY, { align: 'center' });

  doc.save(`FACTURA_${transaction.id.slice(-8)}.pdf`);
};
