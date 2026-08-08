export const generateInvoiceHtml = (order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px;">
        <div style="font-weight: 600; color: #1e293b;">${item.name}</div>
        ${item.color || item.size ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.color ? `Color: ${item.color}` : ''} ${item.size ? `· Size: ${item.size}` : ''}</div>` : ''}
      </td>
      <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: center; color: #475569;">${item.quantity}</td>
      <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: right; color: #475569;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; text-align: right; font-weight: 600; color: #1e293b;">₹${((item.price) * (item.quantity)).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
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
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }

        .no-print-bar {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 16px 24px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #4f46e5;
          color: white;
          border: none;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          text-decoration: none;
        }

        .btn:hover {
          background-color: #4338ca;
        }

        .btn-secondary {
          background-color: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .btn-secondary:hover {
          background-color: #f1f5f9;
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

        @media print {
          body {
            padding: 0;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print-bar {
            display: none !important;
          }
          .invoice-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none;
            padding: 30px;
            max-width: 100%;
          }
          .logo-area h1 {
            background: none !important;
            -webkit-text-fill-color: #4f46e5 !important;
            color: #4f46e5 !important;
          }
          th {
            background-color: #f8fafc !important;
            color: #475569 !important;
          }
          .badge-paid {
            background-color: #dcfce7 !important;
            color: #15803d !important;
          }
          .badge-unpaid {
            background-color: #fee2e2 !important;
            color: #b91c1c !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print-bar" style="max-width: 800px; margin: 0 auto 30px auto;">
        <div>
          <span style="font-weight: 600; color: #475569; font-size: 14px;">Invoice ready for printing or saving as PDF</span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
          <button class="btn" onclick="window.print()">Print / Save as PDF</button>
        </div>
      </div>

      <div class="invoice-card">
        <div class="header">
          <div class="logo-area">
            <h1>ZYRA Shop</h1>
            <p>Premium Fashion & Lifestyle</p>
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
              <td style="text-align: right; font-weight: 500; padding: 8px 16px; font-size: 14px;">₹${(order.subtotal || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 8px 16px; font-size: 14px;">Shipping</td>
              <td style="text-align: right; font-weight: 500; padding: 8px 16px; font-size: 14px;">${order.shipping === 0 ? 'FREE' : `₹${(order.shipping || 0).toFixed(2)}`}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 8px 16px; font-size: 14px;">Tax</td>
              <td style="text-align: right; font-weight: 500; padding: 8px 16px; font-size: 14px;">₹${(order.tax || 0).toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td style="padding: 8px 16px; font-size: 14px;">Total Amount</td>
              <td style="text-align: right; color: #4f46e5; padding: 8px 16px; font-size: 14px;">₹${(order.grandTotal || 0).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Thank you for shopping with ZYRA Shop!</p>
          <p style="font-size: 11px; margin-top: 6px;">If you have any questions, please contact support@zyrashop.com</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        }
      </script>
    </body>
    </html>
  `;
};

export const handleDownloadInvoice = (order) => {
  const invoiceWindow = window.open("", "_blank");
  if (!invoiceWindow) {
    alert("Please allow popups to view the invoice.");
    return;
  }

  const invoiceHtml = generateInvoiceHtml(order);
  invoiceWindow.document.write(invoiceHtml);
  invoiceWindow.document.close();
};