'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, Size } from '@/types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { toast } from '../ui/Toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

interface AdminProductsTableProps {
  initialProducts: Product[];
}

export const AdminProductsTable: React.FC<AdminProductsTableProps> = ({
  initialProducts,
}) => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the product: "${name}"?`)) {
      return;
    }

    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to delete product.');
      } else {
        toast.success('Product deleted successfully.');
        setProducts((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error deleting product.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-grow max-w-md w-full">
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-850 text-slate-100 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
        </div>

        <Link href="/admin/products/new">
          <Button className="text-xs font-extrabold flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add New Jersey
          </Button>
        </Link>
      </div>

      {/* Table grid */}
      <div className="bg-slate-900 border border-slate-850 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-350">
            <thead className="bg-slate-950/60 border-b border-slate-850 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 w-16">Image</th>
                <th className="p-4">Jersey Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Sizing Inventory (S/M/L/XL/XXL)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60 font-semibold">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const displayImage =
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?auto=format&fit=crop&w=150&q=80';

                  return (
                    <tr key={product.id} className="hover:bg-slate-850/20 transition-colors">
                      {/* Image Preview */}
                      <td className="p-4">
                        <div className="relative h-12 w-9 bg-slate-950 border border-slate-800 rounded overflow-hidden">
                          <Image src={displayImage} alt={product.name} fill className="object-cover" />
                        </div>
                      </td>

                      {/* Product details */}
                      <td className="p-4">
                        <div className="text-slate-200">{product.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-medium truncate max-w-xs">{product.slug}</div>
                      </td>

                      <td className="p-4">
                        <Badge>{product.category}</Badge>
                      </td>

                      <td className="p-4 text-indigo-400 font-extrabold">
                        ₹{product.price.toLocaleString('en-IN')}
                      </td>

                      {/* Sizes stock levels */}
                      <td className="p-4 text-xs font-mono">
                        <div className="flex gap-2">
                          {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                            const qty = product.sizes[sz as Size] || 0;
                            return (
                              <span
                                key={sz}
                                className={`px-2 py-0.5 rounded font-extrabold ${
                                  qty === 0
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : qty < 5
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-slate-950 text-slate-400'
                                }`}
                              >
                                {sz}: {qty}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Operations */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-indigo-400 hover:bg-slate-850"
                              title="Edit Jersey"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.name)}
                            isLoading={isDeletingId === product.id}
                            className="h-8 w-8 p-0 text-rose-400 hover:bg-slate-850"
                            title="Delete Jersey"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
