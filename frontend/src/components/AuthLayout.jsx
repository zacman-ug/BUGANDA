import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:w-[42%] bg-gradient-to-br from-heritage-dark via-[#3d2418] to-black text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-heritage-gold blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-heritage-gold blur-2xl" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-heritage-gold hover:text-yellow-300 transition mb-10">
            <span className="font-serif text-xl font-bold">Buganda Heritage</span>
          </Link>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold leading-tight mb-4">{title}</h1>
          {subtitle && <p className="text-gray-300 text-lg max-w-md leading-relaxed">{subtitle}</p>}
        </div>

        <div className="relative z-10 mt-10 lg:mt-0 space-y-4 text-sm text-gray-400">
          <p>Preserve 55 Buganda clans and totems</p>
          <p>Build multi-generational family trees</p>
          <p>Secure, private heritage for your lineage</p>
        </div>
      </aside>

      <main className="flex-1 bg-heritage-cream flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-heritage-gold/20 p-8 lg:p-10">
            {children}
          </div>
          {footer && <div className="mt-6 text-center">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
