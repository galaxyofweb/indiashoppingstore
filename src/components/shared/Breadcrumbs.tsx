import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/utils/cn'

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: `https://indiashoppingstore.com${item.href}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Breadcrumb" className={cn('flex items-center flex-wrap gap-1', className)}>
        <Link href="/" className="text-gray-400 hover:text-primary transition-colors shrink-0">
          <Home className="h-3.5 w-3.5" />
        </Link>
        {items.slice(1).map((item, i) => {
          const isLast = i === items.length - 2
          return (
            <span key={item.href} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
              {isLast ? (
                <span className="text-xs font-medium text-gray-600 truncate max-w-[200px]" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="text-xs text-gray-400 hover:text-primary transition-colors truncate max-w-[150px]">
                  {item.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}
