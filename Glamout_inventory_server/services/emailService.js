import nodemailer from 'nodemailer';

// Returns true only when real, non-placeholder credentials are set
const isEmailConfigured = () => {
  const user = process.env.EMAIL_USER || '';
  const pass = process.env.EMAIL_PASSWORD || '';
  return user.includes('@') && !user.startsWith('@') && pass.length > 0;
};

// Create transporter on demand — avoids EAUTH errors at server startup
const getTransporter = () =>
  nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

// category may be a populated object { _id, name } or a plain string
const getCategoryName = (category) => {
  if (!category) return 'N/A';
  if (typeof category === 'object' && category.name) return category.name;
  return String(category);
};

export const sendLowStockEmail = async (item, ownerEmail) => {
  // Bail out silently when credentials are missing — no crash, no noise
  if (!isEmailConfigured()) {
    console.warn(`⚠️  Email not configured – low stock alert skipped for: ${item.name}`);
    return false;
  }
  const recipient = ownerEmail || '';
  if (!recipient.includes('@') || recipient.startsWith('@')) {
    console.warn(`⚠️  OWNER_EMAIL not configured – low stock alert skipped for: ${item.name}`);
    return false;
  }

  try {
    const minStock = item.min_stock_level ?? 10;
    const unitPrice = typeof item.unit_price === 'number' ? item.unit_price.toFixed(2) : '0.00';
    const categoryName = getCategoryName(item.category);

    const subject = `Low Stock Alert: ${item.name} - Restocking Required`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #d32f2f; margin-bottom: 16px;">⚠️ Low Stock Alert</h2>
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          One of your inventory items has fallen below the minimum stock level and needs restocking.
        </p>
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #856404;">Item Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #333; width: 150px;">Product Name:</td>
              <td style="padding: 8px 0; color: #555;">${item.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #333;">Brand:</td>
              <td style="padding: 8px 0; color: #555;">${item.brand || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #333;">Category:</td>
              <td style="padding: 8px 0; color: #555;">${categoryName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #333;">SKU:</td>
              <td style="padding: 8px 0; color: #555;">${item.sku || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px 0; font-weight: bold; color: #d32f2f;">Current Stock:</td>
              <td style="padding: 8px 0; color: #d32f2f; font-weight: bold;">${item.quantity} units</td>
            </tr>
            <tr style="background-color: #f5f5f5;">
              <td style="padding: 8px 0; font-weight: bold; color: #d32f2f;">Minimum Level:</td>
              <td style="padding: 8px 0; color: #d32f2f; font-weight: bold;">${minStock} units</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #333;">Unit Price:</td>
              <td style="padding: 8px 0; color: #555;">$${unitPrice}</td>
            </tr>
          </table>
        </div>
        <div style="background-color: #f0f8ff; border-left: 4px solid #2196F3; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #0d47a1;">Action Required</h3>
          <p style="margin: 0; color: #333;">
            Please restock this item as soon as possible to avoid inventory shortages.
            The current stock level (${item.quantity}) has fallen below the minimum threshold (${minStock}).
          </p>
        </div>
        <div style="border-top: 1px solid #e0e0e0; padding-top: 16px; margin-top: 20px; color: #999; font-size: 12px;">
          <p style="margin: 0;">This is an automated message from Glamour Inventory System.</p>
          <p style="margin: 8px 0 0 0;">Date: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    await getTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject,
      html: htmlBody,
    });
    console.log(`✉️  Low stock email sent for item: ${item.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email for item ${item.name}:`, error.message);
    return false;
  }
};

export const isLowStock = (quantity, minStockLevel) => {
  const min = minStockLevel ?? 10;
  return quantity <= min;
};
