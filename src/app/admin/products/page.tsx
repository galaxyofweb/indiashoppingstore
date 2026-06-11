import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { authOptions } from '@/lib/auth/options'
import { prisma } from '@/lib/db/prisma'
import { formatINR } from '@/utils/gst'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'

export const metadata: Metadata = { title: 'Products — Admin' }

interface AdminProductsProps {
  searchParams: { page?: string; search?: string; status?: string; filter?: string }
}

export default async function AdminProductsPage({ searchParams }: AdminProductsProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) redirect('/')

  const page = Number(searchParams.page) || 1
  const limit = 20
  const search = searchParams.search || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (searchParams.status) where.status = searchParams.status
  if (searchParams.filter === 'lowstock') where.stock = { lte: 10, gt: 0 }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, name: true, slug: true, sku: true, price: true,
        stock: true, status: true, thumbnail: true, isFeatured: true,
        rating: true, reviewCount: true, salesCount: true, createdAt: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ])

  const STATUS_BADGE: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    DRAFT: 'bg-gray-100 text-gray-600',
    INACTIVE: 'bg-yellow-100 text-yellow-700',
    OUT_OF_STOCK: 'bg-red-100 text-red-700',
    DISCONTINUED: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString('en-IN')} total products</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/products/bulk-upload" className="btn-outline rounded-lg text-sm">
            ↑ Bulk Upload
          </Link>
          <Link href="/admin/products/new" className="btn-gold rounded-lg text-sm">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <form className="flex-1 flex items-center gap-2 border border-gray-200 rounded-lg px-3">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name or SKU..."
            className="flex-1 text-sm py-2 outline-none bg-transparent"
          />
        </form>
        <select name="status" defaultValue={searchParams.status || ''} className="input w-40 text-sm py-2">
          <option value="">All Status</option>
          {['ACTIVE', 'DRAFT', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Sales', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {product.thumbnail && (
                          <Image src={product.thumbnail} alt={product.name} fill className="object-cover" sizes="40px" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.brand?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{product.sku}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{product.category.name}</td>
                  <td className="px-5 py-3.5 font-semibold text-primary">{formatINR(product.price)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-500' : product.stock <= 10 ? 'text-orange-500' : 'text-gray-700'}`}>
                      {product.stock}
                    </span>
                    {product.stock <= 10 && product.stock > 0 && (
                      <span className="ml-1 text-2xs text-orange-500">⚠ Low</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{product.salesCount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-2xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[product.status] || 'bg-gray-100 text-gray-600'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/products/${product.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}&search=${search}`} className="btn-outline rounded-lg px-4 py-2 text-sm">Previous</Link>
              )}
              {page * limit < total && (
                <Link href={`?page=${page + 1}&search=${search}`} className="btn-primary rounded-lg px-4 py-2 text-sm">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
