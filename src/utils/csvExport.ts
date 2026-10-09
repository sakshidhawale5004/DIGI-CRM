import { Customer, Order } from '../types';

/**
 * Escapes a cell value for standard CSV format (RFC 4180).
 */
const escapeCsvCell = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains comma, quote, or newline, escape inner quotes and wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

/**
 * Triggers a browser file download of CSV content without external redirects.
 */
const triggerCsvDownload = (csvContent: string, filename: string) => {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports customer records to a CSV file.
 */
export const exportCustomersToCSV = (customers: Customer[]) => {
  const headers = [
    'Customer ID',
    'Full Name',
    'Email Address',
    'Phone',
    'CRM Segment',
    'Total Spent ($)',
    'Orders Count',
    'Avg Order Value ($)',
    'Street Address',
    'City',
    'Postal Code',
    'Country',
    'Registered Date',
    'Last Order Date',
    'Notes Count',
    'Latest Note',
  ];

  const rows = customers.map((c) => {
    const avgSpend = c.orderCount > 0 ? (c.totalSpent / c.orderCount).toFixed(2) : '0.00';
    const latestNote = c.notes && c.notes.length > 0 ? c.notes[0].content : '';

    return [
      escapeCsvCell(c.id),
      escapeCsvCell(c.name),
      escapeCsvCell(c.email),
      escapeCsvCell(c.phone),
      escapeCsvCell(c.segment),
      escapeCsvCell(c.totalSpent.toFixed(2)),
      escapeCsvCell(c.orderCount),
      escapeCsvCell(avgSpend),
      escapeCsvCell(c.address),
      escapeCsvCell(c.city),
      escapeCsvCell(c.postalCode),
      escapeCsvCell(c.country),
      escapeCsvCell(new Date(c.registeredAt).toLocaleDateString()),
      escapeCsvCell(c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : 'N/A'),
      escapeCsvCell(c.notes.length),
      escapeCsvCell(latestNote),
    ].join(',');
  });

  const csv = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  triggerCsvDownload(csv, `woocommerce-customers-${dateStr}.csv`);
};

/**
 * Exports order history records to a CSV file.
 */
export const exportOrdersToCSV = (orders: Order[]) => {
  const headers = [
    'Order Number',
    'Date Placed',
    'Time Placed',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Shipping Address',
    'City',
    'Postal Code',
    'Country',
    'Shipping Method',
    'Tracking Number',
    'Items Summary',
    'Total Units',
    'Subtotal ($)',
    'Discount ($)',
    'Coupon Code',
    'Shipping Fee ($)',
    'Tax ($)',
    'Total Paid ($)',
    'Fulfillment Status',
    'Payment Method',
    'Payment Status',
  ];

  const rows = orders.map((o) => {
    const itemsSummary = o.items
      .map((it) => {
        const attrs = it.selectedAttributes
          ? ` (${Object.entries(it.selectedAttributes)
              .map(([k, v]) => `${k}:${v}`)
              .join(' ')})`
          : '';
        return `${it.quantity}x ${it.productName}${attrs}`;
      })
      .join('; ');

    const totalUnits = o.items.reduce((acc, it) => acc + it.quantity, 0);
    const orderDate = new Date(o.createdAt);

    return [
      escapeCsvCell(o.orderNumber),
      escapeCsvCell(orderDate.toLocaleDateString()),
      escapeCsvCell(orderDate.toLocaleTimeString()),
      escapeCsvCell(o.customerName),
      escapeCsvCell(o.customerEmail),
      escapeCsvCell(o.shippingAddress.phone),
      escapeCsvCell(o.shippingAddress.address),
      escapeCsvCell(o.shippingAddress.city),
      escapeCsvCell(o.shippingAddress.postalCode),
      escapeCsvCell(o.shippingAddress.country),
      escapeCsvCell(o.shippingMethod),
      escapeCsvCell(o.trackingCode || 'Pending'),
      escapeCsvCell(itemsSummary),
      escapeCsvCell(totalUnits),
      escapeCsvCell(o.subtotal.toFixed(2)),
      escapeCsvCell(o.discount.toFixed(2)),
      escapeCsvCell(o.couponApplied || 'None'),
      escapeCsvCell(o.shippingCost.toFixed(2)),
      escapeCsvCell(o.tax.toFixed(2)),
      escapeCsvCell(o.total.toFixed(2)),
      escapeCsvCell(o.status.toUpperCase()),
      escapeCsvCell(o.paymentMethod.toUpperCase()),
      escapeCsvCell(o.paymentStatus.toUpperCase()),
    ].join(',');
  });

  const csv = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  triggerCsvDownload(csv, `woocommerce-orders-${dateStr}.csv`);
};
