import Link from 'next/link'
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'

const FOOTER_LINKS = {
  shop: [
    { label: 'Women', href: '/shop/women' },
    { label: 'Men', href: '/shop/men' },
    { label: 'Electronics', href: '/shop/electronics' },
    { label: 'Home & Living', href: '/shop/home' },
    { label: 'Beauty', href: '/shop/beauty' },
    { label: 'Sale', href: '/sale' },
  ],
  help: [
    { label: 'Help Centre', href: '/help' },
    { label: 'Track Order', href: '/track' },
    { label: 'Returns & Exchanges', href: '/returns' },
    { label: 'Shipping Policy', href: '/shipping' },
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Contact Us', href: '/contact' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Sell on ISS', href: '/vendor' },
    { label: 'Affiliate Program', href: '/affiliate' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'GDPR', href: '/gdpr' },
  ],
}

const PAYMENT_ICONS = [
  { name: 'UPI', bg: '#f97316' },
  { name: 'Razorpay', bg: '#3395ff' },
  { name: 'Visa', bg: '#1a1f71' },
  { name: 'Mastercard', bg: '#eb001b' },
  { name: 'COD', bg: '#16a34a' },
  { name: 'EMI', bg: '#7c3aed' },
]

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* Trust Strip */}
      <div className="border-b border-white/10">
        <div className="container-full py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹499' },
            { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free returns' },
            { icon: '🔒', title: 'Secure Payments', desc: '100% safe & encrypted' },
            { icon: '💬', title: '24/7 Support', desc: 'Always here to help' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-full py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand Column */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl font-light tracking-[0.1em]">
              INDIA<span className="text-gold">SHOPPING</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            India's premium destination for curated products across fashion, electronics, and home living.
          </p>

          {/* Contact */}
          <div className="mt-6 space-y-3">
            {[
              { icon: Phone, text: '+91 1800-XXX-XXXX', href: 'tel:+911800XXXXXXX' },
              { icon: Mail, text: 'support@indiashoppingstore.com', href: 'mailto:support@indiashoppingstore.com' },
              { icon: MapPin, text: 'New Delhi, India 110001', href: '#' },
            ].map(({ icon: Icon, text, href }) => (
              <a
                key={text}
                href={href}
                className="flex items-center gap-2.5 text-xs text-white/60 hover:text-gold transition-colors"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{text}</span>
              </a>
            ))}
          </div>

          {/* Social */}
          <div className="mt-6 flex items-center gap-3">
            {[
              { Icon: Instagram, href: 'https://instagram.com/indiashoppingstore', label: 'Instagram' },
              { Icon: Facebook, href: 'https://facebook.com/indiashoppingstore', label: 'Facebook' },
              { Icon: Twitter, href: 'https://twitter.com/indiashoppingstore', label: 'Twitter' },
              { Icon: Youtube, href: 'https://youtube.com/indiashoppingstore', label: 'YouTube' },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link Columns */}
        {(Object.entries(FOOTER_LINKS) as [string, typeof FOOTER_LINKS.shop][]).map(([key, links]) => (
          <div key={key}>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/40 mb-5">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Newsletter Strip */}
      <div className="border-t border-white/10">
        <div className="container-full py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-lg font-light">Get exclusive deals in your inbox</p>
            <p className="text-xs text-white/50 mt-1">Join 2 lakh+ subscribers. Unsubscribe anytime.</p>
          </div>
          <form className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 sm:w-72 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
              aria-label="Email for newsletter"
            />
            <button
              type="submit"
              className="btn-gold rounded-lg text-sm px-5 py-2.5 shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-full py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} IndiaShoppingStore.com — All rights reserved. Registered in India. GST: 07AABCI1234A1Z5
          </p>

          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30 mr-1">Accepted payments:</span>
            {PAYMENT_ICONS.map((p) => (
              <span
                key={p.name}
                className="text-[9px] font-bold px-2 py-1 rounded"
                style={{ backgroundColor: p.bg, color: '#fff' }}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
