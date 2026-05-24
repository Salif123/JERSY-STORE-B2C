'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, Size } from '@/types';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from '../ui/Toast';
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens only'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be greater than or equal to 0'),
  compare_at_price: z.coerce.number().nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  sizes: z.object({
    S: z.coerce.number().min(0, 'Must be 0 or more'),
    M: z.coerce.number().min(0, 'Must be 0 or more'),
    L: z.coerce.number().min(0, 'Must be 0 or more'),
    XL: z.coerce.number().min(0, 'Must be 0 or more'),
    XXL: z.coerce.number().min(0, 'Must be 0 or more'),
  }),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialProduct?: Product;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialProduct }) => {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<ProductFormValues> = initialProduct
    ? {
        name: initialProduct.name,
        slug: initialProduct.slug,
        description: initialProduct.description,
        price: initialProduct.price,
        compare_at_price: initialProduct.compare_at_price,
        category: initialProduct.category,
        sizes: initialProduct.sizes,
      }
    : {
        name: '',
        slug: '',
        description: '',
        price: 0,
        compare_at_price: null,
        category: 'Football',
        sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
      };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const productName = watch('name');

  // Auto-generate slug from name (only on creation)
  useEffect(() => {
    if (!initialProduct && productName) {
      const generatedSlug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setValue('slug', generatedSlug);
    }
  }, [productName, setValue, initialProduct]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadToCloudinary(file)
      );
      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);
      toast.success('Images uploaded successfully.');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Image upload failed. Check keys & preset.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    setIsSubmitting(true);
    const url = initialProduct
      ? `/api/admin/products/${initialProduct.id}`
      : '/api/admin/products';
    const method = initialProduct ? 'PUT' : 'POST';

    // Treat 0, empty string or null as null in the DB
    const formattedCompareAtPrice =
      values.compare_at_price === 0 || values.compare_at_price === null
        ? null
        : Number(values.compare_at_price);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          compare_at_price: formattedCompareAtPrice,
          images,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save product.');
      } else {
        toast.success(
          initialProduct ? 'Product updated successfully.' : 'Product created successfully.'
        );
        router.refresh();
        router.push('/admin/products');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sizeOptions: Size[] = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Core Fields */}
        <div className="lg:col-span-2 space-y-5 bg-slate-900 border border-slate-850 p-5 rounded-xl">
          <h2 className="text-base font-bold text-slate-100">Jersey Information</h2>

          <Input
            label="Product Name"
            placeholder="e.g. Real Madrid 2024/25 Home Jersey"
            error={errors.name?.message as string | undefined}
            {...register('name')}
          />

          <Input
            label="SEO Slug"
            placeholder="e.g. real-madrid-2024-25-home"
            error={errors.slug?.message as string | undefined}
            {...register('slug')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-350 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Detail the fabric quality, stitching, and fits..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 text-slate-100 rounded-lg placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              placeholder="999"
              error={errors.price?.message as string | undefined}
              {...register('price')}
            />

            <Input
              label="Compare Price (₹)"
              type="number"
              placeholder="1999"
              error={errors.compare_at_price?.message as string | undefined}
              {...register('compare_at_price')}
            />

            <div>
              <label className="block text-sm font-medium text-slate-350 mb-1.5">
                Category
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-850 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                {...register('category')}
              >
                <option value="Football">Football</option>
                <option value="Cricket">Cricket</option>
                <option value="Basketball">Basketball</option>
                <option value="Retro">Retro</option>
                <option value="Training">Training</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Images and Size Stock */}
        <div className="space-y-6">
          
          {/* Images Upload Section */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <ImageIcon className="h-4.5 w-4.5 text-indigo-400" />
              Product Images
            </h2>

            {/* Grid of uploaded images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((url, idx) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-800 bg-slate-950 group">
                    <Image src={url} alt={`Preview ${idx}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-opacity duration-150"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-lg p-5 transition-colors flex flex-col items-center justify-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-6 w-6 text-slate-500 mb-2" />
              <span className="text-xs font-bold text-slate-400">
                {isUploading ? 'Uploading...' : 'Choose Images'}
              </span>
              <span className="text-[10px] text-slate-650 mt-1">JPEG, PNG up to 5MB</span>
            </div>
          </div>

          {/* Sizing Inventory Section */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-4">
            <h2 className="text-base font-bold text-slate-100">Stock Inventory</h2>
            <div className="grid grid-cols-5 gap-2">
              {sizeOptions.map((size) => (
                <div key={size} className="text-center">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 block mb-1">
                    {size}
                  </span>
                  <input
                    type="number"
                    defaultValue={0}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-1.5 text-center text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    {...register(`sizes.${size}`)}
                  />
                  {((errors.sizes as any)?.[size]) && (
                    <span className="text-[9px] text-rose-500">
                      {((errors.sizes as any)?.[size]?.message)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Action panel */}
      <div className="flex justify-end gap-3.5 bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {initialProduct ? 'Save Changes' : 'Create Jersey'}
        </Button>
      </div>
    </form>
  );
};
