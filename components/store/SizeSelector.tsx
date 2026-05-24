import React from 'react';
import { Size } from '@/types';
import { clsx } from 'clsx';

interface SizeSelectorProps {
  selectedSize: Size | null;
  sizesStock: Record<Size, number>;
  onChange: (size: Size) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  selectedSize,
  sizesStock,
  onChange,
}) => {
  const sizeOptions: Size[] = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Select Size
        </label>
        {selectedSize && (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider animate-fade-in">
            Selected: {selectedSize}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2.5">
        {sizeOptions.map((size) => {
          const stock = sizesStock[size] || 0;
          const isAvailable = stock > 0;
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              disabled={!isAvailable}
              onClick={() => onChange(size)}
              className={clsx(
                'flex flex-col items-center justify-center py-2 border rounded-xl transition-all duration-200 min-h-[58px]',
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20 scale-102 font-black'
                  : isAvailable
                  ? 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900 text-slate-800 dark:text-slate-200 hover:border-blue-500 hover:scale-102 hover:bg-slate-100 dark:hover:bg-navy-850'
                  : 'border-slate-150 dark:border-navy-950 bg-slate-100/50 dark:bg-navy-950/40 text-slate-400 dark:text-slate-650 opacity-50 cursor-not-allowed'
              )}
            >
              <span className="text-sm font-black tracking-wider">{size}</span>
              {stock === 0 ? (
                <span className="text-[7px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-600 mt-0.5 line-through decoration-slate-400 decoration-1">
                  Out of stock
                </span>
              ) : stock <= 5 ? (
                <span
                  className={clsx(
                    'text-[7px] font-black uppercase tracking-wider mt-0.5',
                    isSelected ? 'text-white animate-pulse' : 'text-rose-500 dark:text-rose-400'
                  )}
                >
                  Only {stock} left!
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
