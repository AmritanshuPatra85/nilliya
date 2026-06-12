import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#532332] border-t border-[#EEF4FF]/10">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#65222A] border border-[#EEF4FF]/20 flex items-center justify-center">
                <span className="text-[#EEF4FF] font-serif text-lg">N</span>
              </div>
              <div>
                <p className="text-[#EEF4FF] font-serif text-sm tracking-wider">NILLYA</p>
                <p className="text-[#A09C97] text-[10px] tracking-widest uppercase">The Makeup Studio</p>
              </div>
            </div>
            <p className="text-[#A09C97] text-sm leading-relaxed">
              Where every woman deserves to feel beautiful, confident, and celebrated.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[#EEF4FF] text-xs tracking-widest uppercase mb-6">Quick Links</p>
            <div className="space-y-3">
              {[
                { label: 'Services', href: '/#services' },
                { label: 'Gallery', href: '/#gallery' },
                { label: 'Book Appointment', href: '/book' },
              ].map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-[#A09C97] text-sm hover:text-[#EEF4FF] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[#EEF4FF] text-xs tracking-widest uppercase mb-6">Contact</p>
            <div className="space-y-3">
              <p className="text-[#A09C97] text-sm">📍 Add parlour address here</p>
              <p className="text-[#A09C97] text-sm">📞 +91 XXXXXXXXXX</p>
              <p className="text-[#A09C97] text-sm">🕐 Mon-Sun: 9:30am – 1:00pm</p>
              <p className="text-[#A09C97] text-sm">🕐 Mon-Sun: 2:00pm – 8:00pm</p>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-[#EEF4FF]/10 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#A09C97] text-xs tracking-wide">
            © {new Date().getFullYear()} Nillya The Makeup Studio. All rights reserved.
          </p>
          <Link
            href="/book"
            className="bg-[#EEF4FF] text-[#532332] px-8 py-3 text-xs tracking-widest uppercase font-semibold hover:bg-white transition-all"
          >
            Book Now
          </Link>
        </div>
      </div>
    </footer>
  )
}