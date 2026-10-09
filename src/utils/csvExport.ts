import { Customer, Order, Product } from '../types';

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
 * Robust CSV parser that handles quotes, escaped quotes (""), commas, and newlines.
 */
export const parseCSVRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentVal += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (char === '\r') {
        // ignore carriage return
      } else if (char === '\n') {
        currentRow.push(currentVal.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
};

/**
 * Triggers a browser file download of CSV content without external redirects.
 */
export const triggerCsvDownload = (csvContent: string, filename: string) => {
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

export const SAMPLE_PRODUCT_CSV_TEXT = `Title,SKU,Category,Regular Price,Sale Price,Stock,Description,Short Description,Tags,Images
"Minimalist Walnut Desk Tray","DSK-TRY-WAL","Living",65.00,55.00,18,"Carved solid American walnut organizing tray with brass divider inlays.","Solid American walnut desk organizer with brass divider.","Desk,Walnut,Handmade","https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80;https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
"Merino Wool Waffle Beanie","APP-MER-WAF","Apparel",42.00,,30,"Spun from 100% extrafine Australian merino wool with breathable thermal waffle knit.","100% extrafine merino wool breathable thermal waffle beanie.","Apparel,Wool,Winter","https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=80"
"Matte Brass Coffee Scoop & Clip","KIT-SCP-BRS","Living",28.00,24.00,12,"Hand-finished solid brass two-in-one coffee bean measuring spoon and bag sealing clip.","Solid brass coffee measuring spoon and bag sealing clamp.","Coffee,Brass,Kitchen","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80"
"Studio Canvas Field Backpack","ACC-BAC-CAN","Accessories",175.00,150.00,6,"Weatherproof 18oz waxed duck canvas rucksack with bridle leather shoulder straps and padded 16-inch laptop pocket.","Weatherproof 18oz waxed canvas backpack with leather straps.","Canvas,Bags,EDC","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80;https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80"
"Smoked Amber Botanical Candle","WEL-CND-AMB","Wellness",38.00,,22,"100% domestic soy wax poured with cedarwood, wild bergamot, and smoky vetiver essential oils. 55 hour clean burn.","Soy wax candle with wild bergamot and smoky vetiver notes.","Candles,Aromatherapy,Soy","https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80"`;

export interface ParsedCsvResult {
  valid: Omit<Product, 'id' | 'createdAt'>[];
  errors: { row: number; message: string }[];
}

/**
 * Parses CSV text into product payload objects.
 */
export const parseProductCSV = (csvText: string): ParsedCsvResult => {
  const rows = parseCSVRows(csvText);
  if (rows.length < 2) {
    return { valid: [], errors: [{ row: 1, message: 'CSV file is empty or missing data rows.' }] };
  }

  const rawHeaders = rows[0].map((h) => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));

  // Locate column indices flexibly
  const titleIdx = rawHeaders.findIndex((h) => h.includes('title') || h.includes('name') || h === 'product');
  const skuIdx = rawHeaders.findIndex((h) => h.includes('sku') || h.includes('code'));
  const categoryIdx = rawHeaders.findIndex((h) => h.includes('category') || h.includes('cat'));
  const regularPriceIdx = rawHeaders.findIndex(
    (h) => h.includes('regularprice') || h.includes('regular') || (h.includes('price') && !h.includes('sale'))
  );
  const salePriceIdx = rawHeaders.findIndex((h) => h.includes('saleprice') || h.includes('sale') || h.includes('discount'));
  const stockIdx = rawHeaders.findIndex((h) => h.includes('stock') || h.includes('quantity') || h.includes('qty'));
  const descIdx = rawHeaders.findIndex((h) => h === 'description' || (h.includes('description') && !h.includes('short')));
  const shortDescIdx = rawHeaders.findIndex((h) => h.includes('shortdesc') || h.includes('short') || h.includes('summary'));
  const tagsIdx = rawHeaders.findIndex((h) => h.includes('tag') || h.includes('tags'));
  const imagesIdx = rawHeaders.findIndex((h) => h.includes('image') || h.includes('images') || h.includes('photo'));

  if (titleIdx === -1) {
    return {
      valid: [],
      errors: [{ row: 1, message: 'Could not find a "Title" or "Product Name" column header.' }],
    };
  }

  const valid: Omit<Product, 'id' | 'createdAt'>[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    const title = (row[titleIdx] || '').trim();

    if (!title) {
      errors.push({ row: rowNum, message: 'Skipped row with missing Product Title.' });
      continue;
    }

    const rawRegularPrice = regularPriceIdx !== -1 ? row[regularPriceIdx] : '';
    const cleanRegularPrice = rawRegularPrice.replace(/[^0-9.]/g, '');
    const regularPrice = parseFloat(cleanRegularPrice) || 0;

    const rawSalePrice = salePriceIdx !== -1 ? row[salePriceIdx] : '';
    const cleanSalePrice = rawSalePrice.replace(/[^0-9.]/g, '');
    const salePrice = cleanSalePrice ? parseFloat(cleanSalePrice) : undefined;

    const finalPrice = salePrice && salePrice < regularPrice ? salePrice : regularPrice;

    const rawStock = stockIdx !== -1 ? row[stockIdx] : '';
    const stockQuantity = parseInt(rawStock.replace(/[^0-9]/g, ''), 10) || 10;

    const sku =
      skuIdx !== -1 && row[skuIdx]
        ? row[skuIdx].trim()
        : `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const category = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx].trim() : 'General';
    const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : title;
    const shortDescription =
      shortDescIdx !== -1 && row[shortDescIdx]
        ? row[shortDescIdx].trim()
        : description.slice(0, 100);

    const tags =
      tagsIdx !== -1 && row[tagsIdx]
        ? row[tagsIdx]
            .split(/[,;]/)
            .map((t) => t.trim())
            .filter(Boolean)
        : ['Imported'];

    let images: string[] = [];
    if (imagesIdx !== -1 && row[imagesIdx]) {
      images = row[imagesIdx]
        .split(/[,;]/)
        .map((img) => img.trim())
        .filter((img) => img.startsWith('http') || img.startsWith('data:image'));
    }

    if (images.length === 0) {
      images = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'];
    }

    let stockStatus: Product['stockStatus'] = 'instock';
    if (stockQuantity === 0) stockStatus = 'outofstock';
    else if (stockQuantity <= 5) stockStatus = 'lowstock';

    valid.push({
      name: title,
      sku,
      category,
      price: finalPrice,
      regularPrice,
      salePrice,
      stockQuantity,
      manageStock: true,
      stockStatus,
      lowStockAmount: 5,
      allowBackorders: false,
      description,
      shortDescription,
      tags,
      images,
      attributes: [],
      featured: false,
      rating: 5.0,
      reviewCount: 0,
    });
  }

  return { valid, errors };
};

/**
 * Exports products catalog to CSV.
 */
export const exportProductsToCSV = (products: Product[]) => {
  const headers = [
    'Title',
    'SKU',
    'Category',
    'Regular Price',
    'Sale Price',
    'Stock',
    'Stock Status',
    'Description',
    'Short Description',
    'Tags',
    'Images',
  ];

  const rows = products.map((p) => [
    escapeCsvCell(p.name),
    escapeCsvCell(p.sku),
    escapeCsvCell(p.category),
    escapeCsvCell(p.regularPrice.toFixed(2)),
    escapeCsvCell(p.salePrice ? p.salePrice.toFixed(2) : ''),
    escapeCsvCell(p.stockQuantity),
    escapeCsvCell(p.stockStatus),
    escapeCsvCell(p.description),
    escapeCsvCell(p.shortDescription),
    escapeCsvCell(p.tags.join('; ')),
    escapeCsvCell(p.images.join('; ')),
  ]);

  const csv = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  triggerCsvDownload(csv, `digital-coyotes-products-${dateStr}.csv`);
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
