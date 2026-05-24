'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, Size } from '@/types';
import { SizeSelector } from './SizeSelector';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { useCartStore } from '@/lib/cart';
import { normalizeSizes } from '@/lib/sizes';
import { 
  ShoppingCart, 
  ShieldCheck, 
  Heart, 
  Truck, 
  Shield, 
  Plus, 
  Minus, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';

interface ProductDetailsClientProps {
  product: Product;
}

export const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({
  product,
}) => {
  const { addItem } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Pincode state
  const [pincode, setPincode] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{
    deliverable: boolean;
    estimatedDays?: string;
    message: string;
  } | null>(null);

  // Accordion state
  const [openSection, setOpenSection] = useState<'description' | 'sizeguide' | 'shipping' | null>('description');

  const sizesStock = normalizeSizes(product.sizes);
  
  // Support both compare_price and compare_at_price
  const comparePrice = (product as any).compare_price ?? (product as any).compare_at_price;
  
  const discount =
    comparePrice && comparePrice > product.price
      ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
      : 0;

  const displayImages =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?auto=format&fit=crop&w=600&q=80'];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size before adding to cart.');
      return;
    }

    const availableStock = sizesStock[selectedSize] || 0;
    if (availableStock === 0) {
      toast.error('This size is currently out of stock.');
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} jerseys available in this size.`);
      return;
    }

    addItem(product, selectedSize, quantity);
    toast.success(`Added ${quantity} x ${product.name} (Size: ${selectedSize}) to bag!`);
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = pincode.trim();
    if (!sanitized || sanitized.length !== 6 || !/^[0-9]+$/.test(sanitized)) {
      toast.error('Please enter a valid 6-digit PIN code.');
      return;
    }

    setIsCheckingPincode(true);
    setPincodeResult(null);

    try {
      const res = await fetch(`/api/pincode?pincode=${encodeURIComponent(sanitized)}`);
      if (!res.ok) {
        throw new Error('API error');
      }
      const data = await res.json();
      setPincodeResult(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to verify delivery status. Try again.');
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const maxQuantity = selectedSize ? (sizesStock[selectedSize] || 1) : 1;

  const toggleAccordion = (section: 'description' | 'sizeguide' | 'shipping') => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.success(`Added ${product.name} to wishlist!`);
    } else {
      toast.success(`Removed ${product.name} from wishlist.`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start">
      
      {/* 1. Left Column: Image Gallery (60% width) */}
      <div className="lg:col-span-6 space-y-6">
        {/* Main large image container */}
        <div 
          className="relative aspect-[4/5] w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-900 rounded-2xl overflow-hidden shadow-sm select-none"
        >
          {discount > 0 && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="danger" className="text-xs px-3 py-1 font-black uppercase tracking-wider">{discount}% OFF</Badge>
            </div>
          )}

          <Image
            src={displayImages[activeImageIdx]}
            alt={product.name}
            fill
            className={clsx(
              "object-cover transition-transform duration-300 origin-center",
              isZoomed ? "scale-135 cursor-zoom-out" : "scale-100 cursor-zoom-in"
            )}
            onClick={() => setIsZoomed(!isZoomed)}
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>

        {/* Thumbnail Row */}
        {displayImages.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {displayImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveImageIdx(idx);
                  setIsZoomed(false); // Reset zoom on image swap
                }}
                className={clsx(
                  'relative h-24 w-20 flex-shrink-0 bg-slate-50 dark:bg-navy-900 border-2 rounded-xl overflow-hidden transition-all duration-200',
                  activeImageIdx === idx
                    ? 'border-blue-600 dark:border-blue-400 scale-102 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-navy-850 opacity-70 hover:opacity-100'
                )}
              >
                <Image src={imgUrl} alt={`Thumbnail ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Right Column: Product Info & Buy controls (40% width) */}
      <div className="lg:col-span-4 flex flex-col space-y-7">
        
        {/* Breadcrumb & Category */}
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 px-3 py-1 rounded-full w-fit block">
            {product.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading text-navy-900 dark:text-white leading-tight tracking-wider uppercase">
            {product.name}
          </h1>
        </div>

        {/* Pricing Area */}
        <div className="flex items-baseline gap-4 border-b border-slate-100 dark:border-navy-900 pb-5">
          <span className="text-3xl font-black text-navy-900 dark:text-white">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {comparePrice && comparePrice > product.price && (
            <span className="text-lg text-slate-400 dark:text-slate-500 line-through">
              ₹{comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Size Selection Widget */}
        <div className="space-y-2">
          <SizeSelector
            selectedSize={selectedSize}
            sizesStock={sizesStock}
            onChange={(size) => {
              setSelectedSize(size);
              setQuantity(1); // Reset quantity counter on size toggle
            }}
          />
        </div>

        {/* Quantity and Actions Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4.5">
            {/* Quantity Selector Counter */}
            <div className="flex flex-col space-y-1.5">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Quantity
              </span>
              <div className="flex items-center bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden h-12">
                <button
                  type="button"
                  disabled={!selectedSize || quantity <= 1}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 text-slate-500 hover:text-navy-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm font-black text-navy-900 dark:text-white w-8 text-center select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={!selectedSize || quantity >= maxQuantity}
                  onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                  className="px-4 text-slate-500 hover:text-navy-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Wishlist Icon */}
            <div className="flex flex-col space-y-1.5 flex-grow-0">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">
                Wishlist
              </span>
              <button
                type="button"
                onClick={handleWishlistToggle}
                className={clsx(
                  "h-12 w-12 flex items-center justify-center border rounded-xl transition-all duration-200 active:scale-95",
                  isWishlisted 
                    ? "bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/60" 
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-500 dark:bg-navy-900 dark:border-navy-800 dark:text-slate-400"
                )}
                aria-label="Toggle Wishlist"
              >
                <Heart className={clsx("h-5 w-5", isWishlisted && "fill-rose-500")} />
              </button>
            </div>
          </div>

          {/* Add to Cart button */}
          <Button
            type="button"
            onClick={handleAddToCart}
            className="w-full h-13 text-sm font-black uppercase tracking-wider shadow-md hover:shadow-blue-500/10 flex items-center justify-center gap-2.5 rounded-xl"
            disabled={!selectedSize || (selectedSize && (sizesStock[selectedSize] || 0) === 0)}
          >
            <ShoppingCart className="h-5 w-5" />
            Add To Bag
          </Button>
        </div>

        {/* Pincode Delivery Check */}
        <div className="bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-navy-850 p-5 rounded-2xl space-y-3">
          <label className="text-xs font-black text-slate-650 dark:text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            Check Delivery Pincode
          </label>
          <form onSubmit={handleCheckPincode} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit Pin Code (e.g. 682016)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
              className="flex-grow bg-white dark:bg-navy-950 border border-slate-250 dark:border-navy-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-4 text-xs font-bold focus:outline-none placeholder-slate-400 dark:placeholder-slate-650 h-10 text-navy-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={isCheckingPincode || pincode.trim().length !== 6}
              className="bg-navy-900 dark:bg-white hover:bg-navy-800 dark:hover:bg-slate-100 text-white dark:text-navy-900 px-5 rounded-xl text-xs font-black uppercase tracking-wider h-10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isCheckingPincode ? 'Checking...' : 'Check'}
            </button>
          </form>

          {/* Delivery Response */}
          {pincodeResult && (
            <div className={clsx(
              "flex items-start gap-2 text-xs font-bold px-3 py-2.5 rounded-lg animate-fade-in mt-1 border",
              pincodeResult.deliverable 
                ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-450"
                : "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/40 text-rose-500 dark:text-rose-455"
            )}>
              {pincodeResult.deliverable ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
              )}
              <span>{pincodeResult.message}</span>
            </div>
          )}
        </div>

        {/* Product Details Accordion */}
        <div className="border border-slate-200 dark:border-navy-900 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-navy-900">
          
          {/* Accordion 1: Description */}
          <div className="bg-transparent">
            <button
              type="button"
              onClick={() => toggleAccordion('description')}
              className="w-full flex items-center justify-between px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-805 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900/40 transition-colors text-left"
            >
              <span>Product Description</span>
              {openSection === 'description' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSection === 'description' && (
              <div className="px-5 pb-5 text-sm text-slate-650 dark:text-slate-400 leading-relaxed font-semibold animate-fade-in">
                {product.description || "Premium athletic jersey crafted for optimal comfort and performance. Features sweat-wicking materials and high-quality embroidered stitching."}
              </div>
            )}
          </div>

          {/* Accordion 2: Size Guide */}
          <div className="bg-transparent">
            <button
              type="button"
              onClick={() => toggleAccordion('sizeguide')}
              className="w-full flex items-center justify-between px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-805 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900/40 transition-colors text-left"
            >
              <span>Size Guide (Measurements)</span>
              {openSection === 'sizeguide' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSection === 'sizeguide' && (
              <div className="px-5 pb-5 font-semibold text-xs text-slate-600 dark:text-slate-450 space-y-3 animate-fade-in">
                <p>Standard regular fit sizing. Measurements in inches (chest circumferences):</p>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-navy-850">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-navy-900 text-slate-900 dark:text-white font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-navy-850">
                        <th className="p-2 border-r border-slate-200 dark:border-navy-850">Size</th>
                        <th className="p-2 border-r border-slate-200 dark:border-navy-850">Chest (in)</th>
                        <th className="p-2">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-navy-850">
                      <tr>
                        <td className="p-2 font-bold border-r border-slate-200 dark:border-navy-850">S</td>
                        <td className="p-2 border-r border-slate-200 dark:border-navy-850">38</td>
                        <td className="p-2">27</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold border-r border-slate-200 dark:border-navy-850">M</td>
                        <td className="p-2 border-r border-slate-200 dark:border-navy-850">40</td>
                        <td className="p-2">28</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold border-r border-slate-200 dark:border-navy-850">L</td>
                        <td className="p-2 border-r border-slate-200 dark:border-navy-850">42</td>
                        <td className="p-2">29</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold border-r border-slate-200 dark:border-navy-850">XL</td>
                        <td className="p-2 border-r border-slate-200 dark:border-navy-850">44</td>
                        <td className="p-2">30</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold border-r border-slate-200 dark:border-navy-850">XXL</td>
                        <td className="p-2 border-r border-slate-200 dark:border-navy-850">46</td>
                        <td className="p-2">31</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Shipping & Returns */}
          <div className="bg-transparent">
            <button
              type="button"
              onClick={() => toggleAccordion('shipping')}
              className="w-full flex items-center justify-between px-5 py-4 text-xs font-black uppercase tracking-wider text-slate-805 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-900/40 transition-colors text-left"
            >
              <span>Shipping & Returns Policy</span>
              {openSection === 'shipping' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSection === 'shipping' && (
              <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-450 leading-relaxed font-semibold space-y-2 animate-fade-in">
                <div className="flex gap-2">
                  <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span><strong>Free Express Shipping:</strong> Free shipping across India on orders over ₹999. Orders are shipped within 24 hours.</span>
                </div>
                <div className="flex gap-2">
                  <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span><strong>Hassle-Free Returns:</strong> 7-day sizes replacement or refund window. Product must be in original condition with tags intact.</span>
                </div>
                <div className="flex gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span><strong>Cash on Delivery (COD):</strong> Available at select PIN codes during check out. Check availability inside checkout form.</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
