import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="font-display text-[10rem] font-light text-gray-100 leading-none select-none">404</div>
        <h1 className="text-2xl font-semibold text-primary -mt-4 mb-3">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary rounded-xl py-3 px-6 justify-center">
            Back to Home <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/shop" className="btn-outline rounded-xl py-3 px-6 justify-center">
            <Search className="h-4 w-4" /> Browse Products
          </Link>
        </div>
        <div className="mt-8">
          <p className="text-sm text-gray-400 mb-3">Popular categories:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Women', 'Men', 'Electronics', 'Home & Living', 'Sale'].map((cat) => (
              <Link key={cat} href={`/shop/${cat.toLowerCase().replace(' & ', '-')}`}
                className="text-xs text-primary bg-primary/5 hover:bg-primary/10 px-4 py-1.5 rounded-full transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
