import { Size } from '@/types';

/**
 * Normalizes size stock data from the database.
 * Supports:
 * 1. Record object format: {"S": 10, "M": 5}
 * 2. Array format: [{"size": "M", "stock": 12}]
 * 3. Fallback to empty stocks
 */
export function normalizeSizes(sizesData: any): Record<Size, number> {
  const defaultSizes: Record<Size, number> = {
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
  };

  if (!sizesData) {
    return defaultSizes;
  }

  // Case 1: Array of objects, e.g., [{"size": "M", "stock": 12}]
  if (Array.isArray(sizesData)) {
    const result = { ...defaultSizes };
    sizesData.forEach((item: any) => {
      if (item && typeof item === 'object' && 'size' in item && 'stock' in item) {
        const sizeKey = String(item.size).toUpperCase() as Size;
        if (sizeKey in result) {
          result[sizeKey] = Math.max(0, Number(item.stock) || 0);
        }
      }
    });
    return result;
  }

  // Case 2: Object key-value map, e.g., {"S": 10, "M": 5}
  if (typeof sizesData === 'object') {
    const result = { ...defaultSizes };
    Object.keys(sizesData).forEach((key) => {
      const sizeKey = key.toUpperCase() as Size;
      if (sizeKey in result) {
        result[sizeKey] = Math.max(0, Number(sizesData[key]) || 0);
      }
    });
    return result;
  }

  return defaultSizes;
}

/**
 * Safely deducts stock from original sizes data while preserving original JSON structure.
 * Supports:
 * 1. Record object format: {"S": 10, "M": 5}
 * 2. Array format: [{"size": "M", "stock": 12}]
 */
export function updateSizeStock(
  originalSizes: any,
  sizeToModify: Size,
  quantityToDeduct: number
): any {
  if (!originalSizes) {
    return originalSizes;
  }

  // Case 1: Array format, e.g., [{"size": "M", "stock": 12}]
  if (Array.isArray(originalSizes)) {
    let sizeFound = false;
    const newSizes = originalSizes.map((item: any) => {
      if (item && typeof item === 'object' && 'size' in item && 'stock' in item) {
        if (String(item.size).toUpperCase() === sizeToModify.toUpperCase()) {
          sizeFound = true;
          return {
            ...item,
            stock: Math.max(0, (Number(item.stock) || 0) - quantityToDeduct),
          };
        }
      }
      return item;
    });

    if (!sizeFound) {
      newSizes.push({ size: sizeToModify, stock: 0 });
    }
    return newSizes;
  }

  // Case 2: Object key-value map, e.g., {"S": 10, "M": 5}
  if (typeof originalSizes === 'object') {
    const newSizes = { ...originalSizes };
    const exactKey =
      Object.keys(newSizes).find(
        (k) => k.toUpperCase() === sizeToModify.toUpperCase()
      ) || sizeToModify;

    const currentStock = Number(newSizes[exactKey]) || 0;
    newSizes[exactKey] = Math.max(0, currentStock - quantityToDeduct);
    return newSizes;
  }

  return originalSizes;
}
