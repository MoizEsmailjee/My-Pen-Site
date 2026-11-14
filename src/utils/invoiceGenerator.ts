import { jsPDF } from 'jspdf';
import { AdminOrderRecord } from '../islands/MerchantAdminIsland';
import { resolveAssetUrl } from './assetResolver';

const BRAND_LOGO_PATH =
  '/assets/aistudio/Gemini_Generated_Image_644qn3644qn3644q_cd72faa3.jpg';

function formatKesPdf(amount: number): string {
  return `KES ${Math.round(amount).toLocaleString('en-KE')}`;
}

/**
 * Generates and downloads a printable A4 PDF invoice for a selected PENS R US order
 * using jsPDF, complete with PENS R US branding, itemized table, bundle discounts,
 * and applicable promo codes.
 */
export function generateOrderInvoicePdf(order: AdminOrderRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Navy Brand Header Band (#0A2246)
  doc.setFillColor(10, 34, 70);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold Accent Rule (#C88A2E)
  doc.setFillColor(200, 138, 46);
  doc.rect(0, 42, pageWidth, 1.8, 'F');

  // Optional embedded logo in top-left if base64 Data URI is available
  let textStartX = margin;
  try {
    const logoDataUri = resolveAssetUrl(BRAND_LOGO_PATH);
    if (logoDataUri && logoDataUri.startsWith('data:image/')) {
      doc.setFillColor(250, 248, 245);
      doc.roundedRect(margin, 8, 34, 24, 2, 2, 'F');
      doc.addImage(logoDataUri, 'JPEG', margin + 1, 9, 32, 22);
      textStartX = margin + 39;
    }
  } catch {
    // Fallback cleanly to typographic lockup if image addition fails
  }

  // Brand Title & Atelier Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text('PENS R US — THE PEN SPECIALISTS', textStartX, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(229, 178, 93);
  doc.text(
    'JAPANESE & EUROPEAN FINE WRITING ATELIER · NAIROBI, KENYA',
    textStartX,
    23.5
  );

  doc.setTextColor(220, 226, 236);
  doc.setFontSize(8.5);
  doc.text(
    'Same-Day Nairobi Courier · Nationwide 47-County Express Dispatch · KES Official Invoice',
    textStartX,
    29.5
  );

  // Right-Aligned Invoice Badge in Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL INVOICE', pageWidth - margin, 16, { align: 'right' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(229, 178, 93);
  doc.text(`#${order.orderNumber}`, pageWidth - margin, 23, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(220, 226, 236);
  doc.text(`Issued: ${order.timestamp}`, pageWidth - margin, 29.5, {
    align: 'right',
  });

  // 2. Customer Bill-To & Order Logistics Two-Column Box
  let y = 52;
  doc.setFillColor(250, 248, 245);
  doc.setDrawColor(220, 213, 199);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

  // Left Column: Billed & Dispatched To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(110, 106, 99);
  doc.text('BILLED & DISPATCHED TO', margin + 5, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(23, 22, 20);
  doc.text(order.customerName || 'Atelier Collector', margin + 5, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(63, 61, 57);
  doc.text(`Phone / M-Pesa: ${order.phone}`, margin + 5, y + 20);
  doc.text(`Region: ${order.city}`, margin + 5, y + 25.5);
  const truncatedAddr =
    order.address.length > 52 ? `${order.address.slice(0, 52)}...` : order.address;
  doc.text(`Address: ${truncatedAddr}`, margin + 5, y + 31);

  // Right Column: Order & Settlement Details
  const rightColX = margin + contentWidth * 0.56;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(110, 106, 99);
  doc.text('LOGISTICS & SETTLEMENT DETAILS', rightColX, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(23, 22, 20);
  const paymentLabel =
    order.paymentMethod === 'mpesa'
      ? 'M-Pesa Express'
      : order.paymentMethod === 'whatsapp'
      ? 'WhatsApp Order Concierge'
      : 'Cash on Delivery (COD)';
  doc.text(`Payment Method: ${paymentLabel}`, rightColX, y + 14);
  doc.text(
    `Fulfillment Status: ${order.orderStatus || 'Processing'}`,
    rightColX,
    y + 20
  );
  doc.text(
    `Waybill Reference: ${order.trackingCode || `NBO-COUR-${order.orderNumber}`}`,
    rightColX,
    y + 25.5
  );
  doc.text(
    `Promo Voucher: ${
      order.promoCode
        ? `${order.promoCode} (-${formatKesPdf(order.promoDiscountKes || 0)})`
        : 'None Applied'
    }`,
    rightColX,
    y + 31
  );

  // 3. Itemized Order Table Header
  y = 94;
  doc.setFillColor(10, 34, 70);
  doc.rect(margin, y, contentWidth, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 3, y + 6);
  doc.text('INSTRUMENT / BOTTLED INK', margin + 11, y + 6);
  doc.text('FINISH / SHADE & NIB', margin + 84, y + 6);
  doc.text('QTY', margin + 132, y + 6, { align: 'right' });
  doc.text('UNIT PRICE', margin + 154, y + 6, { align: 'right' });
  doc.text('LINE TOTAL', pageWidth - margin - 3, y + 6, { align: 'right' });

  y += 9;

  // 4. Itemized Rows
  const items =
    order.items && order.items.length > 0
      ? order.items
      : [
          {
            productName: 'PENS R US Fine Writing Instrument',
            variantLabel: 'Standard Atelier Finish',
            quantity: order.itemsCount || 1,
            priceKes: order.total,
          },
        ];

  let computedSubtotal = 0;

  items.forEach((item, idx) => {
    const lineTotal = item.priceKes * item.quantity;
    computedSubtotal += lineTotal;

    if (idx % 2 === 1) {
      doc.setFillColor(250, 248, 245);
      doc.rect(margin, y, contentWidth, 10, 'F');
    }

    doc.setDrawColor(230, 225, 216);
    doc.line(margin, y + 10, pageWidth - margin, y + 10);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(110, 106, 99);
    doc.text(String(idx + 1).padStart(2, '0'), margin + 3, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(23, 22, 20);
    const prodTitle =
      item.productName.length > 36
        ? `${item.productName.slice(0, 36)}...`
        : item.productName;
    doc.text(prodTitle, margin + 11, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(63, 61, 57);
    const variantShort = item.variantLabel.split(' · ')[0];
    const variantWithNib = item.nibSize
      ? `${variantShort} (${item.nibSize} Nib)`
      : variantShort;
    const truncatedVariant =
      variantWithNib.length > 26
        ? `${variantWithNib.slice(0, 26)}...`
        : variantWithNib;
    doc.text(truncatedVariant, margin + 84, y + 6.5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(23, 22, 20);
    doc.text(String(item.quantity), margin + 132, y + 6.5, { align: 'right' });
    doc.text(formatKesPdf(item.priceKes), margin + 154, y + 6.5, {
      align: 'right',
    });
    doc.text(formatKesPdf(lineTotal), pageWidth - margin - 3, y + 6.5, {
      align: 'right',
    });

    y += 10;
  });

  // 5. Financial Breakdown & Applicable Promo Code Summary Box
  y += 6;
  const summaryBoxX = margin + contentWidth * 0.45;
  const summaryBoxWidth = contentWidth * 0.55;

  const subtotalKes =
    typeof order.subtotal === 'number' && order.subtotal > 0
      ? order.subtotal
      : computedSubtotal;
  const bundleDiscountKes = order.bundleDiscountKes || 0;
  const promoDiscountKes = order.promoDiscountKes || 0;
  const deliveryFeeKes =
    typeof order.deliveryFee === 'number' ? order.deliveryFee : 0;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(63, 61, 57);
  doc.text('Items Subtotal:', summaryBoxX + 4, y + 6);
  doc.setFont('courier', 'bold');
  doc.setTextColor(23, 22, 20);
  doc.text(formatKesPdf(subtotalKes), pageWidth - margin - 3, y + 6, {
    align: 'right',
  });
  y += 7;

  if (bundleDiscountKes > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(29, 91, 67);
    doc.text('3-Bottle Ink Bundle Privilege (10%):', summaryBoxX + 4, y + 6);
    doc.setFont('courier', 'bold');
    doc.text(`-${formatKesPdf(bundleDiscountKes)}`, pageWidth - margin - 3, y + 6, {
      align: 'right',
    });
    y += 7;
  }

  if (order.promoCode) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 105, 14);
    doc.text(`Promo Voucher (${order.promoCode}):`, summaryBoxX + 4, y + 6);
    doc.setFont('courier', 'bold');
    doc.text(`-${formatKesPdf(promoDiscountKes)}`, pageWidth - margin - 3, y + 6, {
      align: 'right',
    });
    y += 7;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 106, 99);
    doc.text('Promo Voucher:', summaryBoxX + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text('None Applied', pageWidth - margin - 3, y + 6, {
      align: 'right',
    });
    y += 7;
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(63, 61, 57);
  doc.text('Kenya Courier Delivery:', summaryBoxX + 4, y + 6);
  doc.setFont('courier', 'bold');
  doc.setTextColor(23, 22, 20);
  doc.text(
    deliveryFeeKes === 0 ? 'COMPLIMENTARY' : formatKesPdf(deliveryFeeKes),
    pageWidth - margin - 3,
    y + 6,
    { align: 'right' }
  );
  y += 9;

  // Total KES Highlight Band
  doc.setFillColor(10, 34, 70);
  doc.roundedRect(summaryBoxX, y, summaryBoxWidth, 12, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL KES', summaryBoxX + 4, y + 7.8);

  doc.setFont('courier', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(229, 178, 93);
  doc.text(formatKesPdf(order.total), pageWidth - margin - 4, y + 7.8, {
    align: 'right',
  });

  // 6. Bottom Authenticity Guarantee & Footer Note
  const footerY = 266;
  doc.setDrawColor(220, 213, 199);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 34, 70);
  doc.text(
    'Every fountain pen is inspected for nib tine alignment and protective flacon wrapping at our Nairobi Atelier.',
    pageWidth / 2,
    footerY + 6,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(110, 106, 99);
  doc.text(
    'PENS R US Kenya · The Pen Specialists · Authentic Pilot Japan & Waterman Paris Fine Writing Instruments',
    pageWidth / 2,
    footerY + 11.5,
    { align: 'center' }
  );

  doc.save(`PENS-R-US-Invoice-${order.orderNumber}.pdf`);
}
