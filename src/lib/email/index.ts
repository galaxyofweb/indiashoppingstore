import nodemailer from 'nodemailer'
import type { Order, UserProfile } from '@/types'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const FROM = `IndiaShoppingStore <${process.env.EMAIL_FROM}>`

// ─── Base Template ───────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>IndiaShoppingStore</title>
<style>
  body { margin:0; padding:0; background:#f5f5f0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .wrapper { max-width:600px; margin:0 auto; background:#ffffff; }
  .header { background:#1a1a2e; padding:32px 40px; text-align:center; }
  .header h1 { color:#c9a227; margin:0; font-size:24px; letter-spacing:2px; font-weight:300; }
  .body { padding:40px; }
  .footer { background:#f5f5f0; padding:24px 40px; text-align:center; }
  .footer p { color:#888; font-size:13px; margin:4px 0; }
  .btn { display:inline-block; background:#1a1a2e; color:#ffffff; padding:14px 32px; text-decoration:none; border-radius:4px; font-size:14px; font-weight:500; margin-top:24px; }
  .badge { display:inline-block; background:#f0f0ff; color:#1a1a2e; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
  h2 { color:#1a1a2e; font-size:22px; margin-top:0; }
  p { color:#555; line-height:1.7; }
  .divider { border:none; border-top:1px solid #eee; margin:24px 0; }
  .order-item { display:flex; align-items:center; padding:16px 0; border-bottom:1px solid #f0f0f0; }
  .total-row { display:flex; justify-content:space-between; padding:8px 0; }
  .total-row.final { font-weight:700; font-size:18px; color:#1a1a2e; border-top:2px solid #1a1a2e; margin-top:8px; padding-top:16px; }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>INDIASHOPPINGSTORE</h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} IndiaShoppingStore.com · All rights reserved</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color:#888;">Privacy Policy</a> · <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe" style="color:#888;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`
}

// ─── Email Functions ─────────────────────────

export async function sendWelcomeEmail(user: { email: string; name?: string }) {
  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: 'Welcome to IndiaShoppingStore — 50 Loyalty Points Await!',
    html: baseTemplate(`
      <h2>Welcome, ${user.name || 'Shopper'}! 🎉</h2>
      <p>Your account is ready. We've added <strong>50 loyalty points</strong> as a welcome gift.</p>
      <p>Discover premium products across every category — fashion, electronics, home decor, and more.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/shop" class="btn">Start Shopping</a>
      <hr class="divider">
      <p style="font-size:13px;color:#999;">Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/help">Help Centre</a>.</p>
    `),
  })
}

export async function sendOTPEmail(email: string, otp: string, type: 'LOGIN' | 'REGISTER' | 'PASSWORD_RESET') {
  const subjects: Record<string, string> = {
    LOGIN: 'Your Login OTP — IndiaShoppingStore',
    REGISTER: 'Verify Your Email — IndiaShoppingStore',
    PASSWORD_RESET: 'Reset Your Password — IndiaShoppingStore',
  }

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: subjects[type],
    html: baseTemplate(`
      <h2>${type === 'PASSWORD_RESET' ? 'Reset Password' : 'Verify Your Identity'}</h2>
      <p>Use the OTP below to continue. It expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:32px 0;">
        <div style="display:inline-block;background:#f0f0ff;border:2px dashed #c9a227;border-radius:8px;padding:20px 48px;">
          <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#1a1a2e;">${otp}</span>
        </div>
      </div>
      <p style="font-size:13px;color:#999;">If you didn't request this, you can safely ignore this email.</p>
    `),
  })
}

export async function sendOrderConfirmationEmail(order: any, email: string) {
  const itemsHtml = order.items.map((item: any) => `
    <div class="order-item">
      <div>
        <strong>${item.name}</strong><br>
        <span style="font-size:13px;color:#888;">Qty: ${item.quantity} · SKU: ${item.sku}</span>
      </div>
      <div style="margin-left:auto;font-weight:600;">₹${item.total.toLocaleString('en-IN')}</div>
    </div>
  `).join('')

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Order Confirmed #${order.orderNumber} — IndiaShoppingStore`,
    html: baseTemplate(`
      <div style="text-align:center;margin-bottom:32px;">
        <div style="width:64px;height:64px;background:#dcfce7;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;">✓</div>
        <h2 style="margin-top:16px;">Order Confirmed!</h2>
        <span class="badge">Order #${order.orderNumber}</span>
      </div>
      <p>Thank you for shopping with us. We'll notify you once your order ships.</p>
      <hr class="divider">
      ${itemsHtml}
      <div style="margin-top:24px;">
        <div class="total-row"><span>Subtotal</span><span>₹${order.subtotal.toLocaleString('en-IN')}</span></div>
        ${order.couponDiscount > 0 ? `<div class="total-row" style="color:#22c55e;"><span>Coupon Discount</span><span>−₹${order.couponDiscount.toLocaleString('en-IN')}</span></div>` : ''}
        <div class="total-row"><span>Shipping</span><span>${order.shipping === 0 ? '<span style="color:#22c55e;">FREE</span>' : '₹' + order.shipping}</span></div>
        <div class="total-row"><span>GST</span><span>₹${order.tax.toLocaleString('en-IN')}</span></div>
        <div class="total-row final"><span>Total</span><span>₹${order.total.toLocaleString('en-IN')}</span></div>
      </div>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order.id}" class="btn">Track Your Order</a>
    `),
  })
}

export async function sendShipmentEmail(order: any, email: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Your Order is On the Way! #${order.orderNumber}`,
    html: baseTemplate(`
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:48px;">🚚</div>
        <h2>Your Order Has Shipped!</h2>
        <span class="badge">Order #${order.orderNumber}</span>
      </div>
      <p>Your package is on its way. Use the tracking number below to follow its journey.</p>
      ${order.trackingNumber ? `
        <div style="background:#f5f5f0;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tracking Number</p>
          <strong style="font-size:20px;">${order.trackingNumber}</strong>
          ${order.shippingPartner ? `<br><span style="font-size:13px;color:#888;">via ${order.shippingPartner}</span>` : ''}
        </div>
        ${order.trackingUrl ? `<a href="${order.trackingUrl}" class="btn">Track Shipment</a>` : ''}
      ` : ''}
      <p style="font-size:13px;color:#999;margin-top:32px;">Estimated delivery: 3–5 business days</p>
    `),
  })
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset Your Password — IndiaShoppingStore',
    html: baseTemplate(`
      <h2>Reset Your Password</h2>
      <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="margin-top:24px;font-size:13px;color:#999;">If you didn't request a password reset, please ignore this email. Your password remains unchanged.</p>
    `),
  })
}
