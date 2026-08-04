const puppeteer = require("puppeteer");

/**
 * Generates the invoice HTML string (identical layout to OrdersPage.jsx).
 * This is used both as the email body AND as the source for the PDF.
 * @param {Object} order - The order document from the database
 * @returns {string} Full HTML document string
 */
function generateInvoiceHtml(order) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px;">
        <div style="font-weight: 600; color: #1e293b;">${item.name}</div>
        ${item.color || item.size ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.color ? `Color: ${item.color}` : ''} ${item.size ? `· Size: ${item.size}` : ''}</div>` : ''}
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: center; color: #475569;">${item.quantity}</td>
      <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: right; color: #475569;">$${(item.price || 0).toFixed(2)}</td>
      <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: right; font-weight: 600; color: #1e293b;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const formattedDate = new Date(order.createdAt || new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${order.orderId}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1e293b;
          background-color: #ffffff;
          line-height: 1.5;
          padding: 40px;
        }

        .invoice-card {
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 24px;
          margin-bottom: 30px;
        }

        .logo-area h1 {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-area p {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        .invoice-title {
          text-align: right;
        }

        .invoice-title h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .invoice-title p {
          font-size: 14px;
          color: #4f46e5;
          font-weight: 600;
          margin-top: 4px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        .details-block h3 {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          margin-bottom: 10px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 6px;
        }

        .details-block p {
          font-size: 14px;
          color: #334155;
          margin-bottom: 4px;
        }

        .badge {
          display: inline-block;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .badge-paid {
          background-color: #dcfce7;
          color: #15803d;
        }

        .badge-unpaid {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        th {
          background-color: #f8fafc;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
          padding: 12px 16px;
          text-align: left;
          border-bottom: 2px solid #e2e8f0;
        }

        .summary-wrapper {
          display: flex;
          justify-content: flex-end;
        }

        .summary-table {
          width: 300px;
          margin-bottom: 0;
        }

        .summary-table td {
          padding: 8px 16px;
          border-bottom: none;
        }

        .summary-table tr.total-row td {
          border-top: 2px solid #e2e8f0;
          padding-top: 12px;
          font-weight: 700;
          font-size: 16px;
          color: #0f172a;
        }

        .footer {
          margin-top: 50px;
          text-align: center;
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
        }

        .footer p {
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="header">
          <div class="logo-area">
            <h1>ZYRA Shop</h1>
            <p>Premium Fashion &amp; Lifestyle</p>
          </div>
          <div class="invoice-title">
            <h2>Invoice</h2>
            <p># ${order.orderId}</p>
          </div>
        </div>

        <div class="details-grid">
          <div class="details-block">
            <h3>Invoice Information</h3>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || 'Card'}</p>
            <p><strong>Payment Status:</strong> 
              <span class="badge ${order.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-unpaid'}">
                ${order.paymentStatus || 'Pending'}
              </span>
            </p>
          </div>
          <div class="details-block">
            <h3>Shipping Details</h3>
            <p><strong>${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}</strong></p>
            <p>${order.shippingAddress?.address || ''}</p>
            <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}</p>
            <p>${order.shippingAddress?.email || ''}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Item Details</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Unit Price</th>
              <th style="width: 20%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary-wrapper">
          <table class="summary-table">
            <tr>
              <td style="color: #64748b; padding: 8px 16px; font-size: 14px;">Subtotal</td>
              <td style="text-align: right; font-weight: 500; padding: 8px 16px; font-size: 14px;">$${(order.subtotal || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 8px 16px; font-size: 14px;">Shipping</td>
              <td style="text-align: right; font-weight: 500; padding: 8px 16px; font-size: 14px;">${order.shipping === 0 ? 'FREE' : `$${(order.shipping || 0).toFixed(2)}`}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 8px 16px; font-size: 14px;">Tax</td>
              <td style="text-align: right; font-weight: 500; padding: 8px 16px; font-size: 14px;">$${(order.tax || 0).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td style="padding: 8px 16px; font-size: 14px;">Total Amount</td>
              <td style="text-align: right; color: #4f46e5; padding: 8px 16px; font-size: 14px;">$${(order.grandTotal || 0).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for shopping with ZYRA Shop!</p>
          <p style="font-size: 11px; margin-top: 6px;">If you have any questions, please contact support@zyrashop.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Converts the invoice HTML (same layout as OrdersPage.jsx) to a PDF Buffer
 * using Puppeteer / Chromium — no custom pdfkit drawing needed.
 * @param {Object} order - The order document from the database
 * @returns {Promise<Buffer>}
 */
async function generateInvoicePdf(order) {
  const html = generateInvoiceHtml(order);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Load the HTML directly as content — no network request needed
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generateInvoiceHtml, generateInvoicePdf };
