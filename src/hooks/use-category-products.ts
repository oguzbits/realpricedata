import { useMemo } from 'react';
import { getProductsByCategory, Product } from '@/lib/product-registry';
import { filterProducts, sortProducts, FilterState } from '@/lib/utils/category-utils';
import { Category } from '@/lib/categories';

interface UseCategoryProductsProps {
  category: Omit<Category, 'icon'> | undefined;
  filters: FilterState;
}

export function useCategoryProducts({ category, filters }: UseCategoryProductsProps) {
  // Load raw products for this category
  const rawProducts = useMemo(() => {
    if (!category) return [];
    return getProductsByCategory(category.slug);
  }, [category]);

  // Derived configuration
  const unitLabel = category?.unitType || 'TB';

  // Apply filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    if (!category) return [];
    
    const filtered = filterProducts(
      rawProducts, 
      filters, 
      category.slug, 
      unitLabel
    );
    
    return sortProducts(filtered, filters.sortBy, filters.sortOrder);
  }, [rawProducts, filters, category, unitLabel]);

  return {
    products: filteredAndSortedProducts,
    totalCount: rawProducts.length,
    filteredCount: filteredAndSortedProducts.length,
    unitLabel,
    hasProducts: rawProducts.length > 0,
  };
}
